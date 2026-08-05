/**
 * hostEngine.js — Host-authoritative game orchestrator.
 *
 * Runs ONLY on the room-creator's browser.  Listens for player
 * action intents in Firestore, validates them against gameEngine,
 * and writes the authoritative game state back.
 */

import {
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from '../utils/firebase';

import {
  createDeck,
  shuffleDeck,
  dealCards,
  validateBid,
  validatePlay,
  checkBiddingResult,
  determineTrickWinner,
  checkRoundResult,
  computePettiTransfer,
  createInitialGameState,
  sortHand,
  getNextSeat,
  getFirstPlayer,
  getTeam,
  PHASE,
  FIRST_DEAL_COUNT,
  NUM_PLAYERS,
  TOTAL_TRICKS,
  STARTING_PETTI,
} from './gameEngine';

export class HostEngine {
  constructor(gameId, roomId, hostUid, players, dealerSeat) {
    this.gameId = gameId;
    this.roomId = roomId;
    this.hostUid = hostUid;
    this.players = players;       // [{ uid, seat, displayName }]
    this.dealerSeat = dealerSeat;

    // In-memory state that mirrors Firestore
    this.state = null;
    this.hands = {};               // { uid: [cards] }
    this.thurupSuit = null;        // Secret until revealed
    this.thurupIndicatorCard = null; // The card set aside face-down; returns to the bidder's hand on reveal
    this.remainingDeck = [];

    // Track processed actions
    this.lastSeq = {};             // { uid: lastProcessedSeq }
    this.unsubActions = [];
    this.destroyed = false;

    // Serializes action processing — see _processAction.
    this._actionQueue = Promise.resolve();
  }

  // ─── Lifecycle ──────────────────────────────────────────

  /** Start a new round: shuffle, deal first 4, begin bidding */
  async start() {
    const deck = shuffleDeck(createDeck());
    const { hands, remainingDeck } = dealCards(deck, FIRST_DEAL_COUNT);
    this.remainingDeck = remainingDeck;

    // Build hands map keyed by UID (seat order matches players array sorted by seat)
    const sortedPlayers = [...this.players].sort((a, b) => a.seat - b.seat);
    this.hands = {};
    sortedPlayers.forEach((p, i) => {
      this.hands[p.uid] = sortHand(hands[i]);
    });

    // Create initial game state
    this.state = createInitialGameState({
      gameId: this.gameId,
      roomId: this.roomId,
      host: this.hostUid,
      players: this.players,
      dealer: this.dealerSeat,
    });

    // Write game state to Firestore
    await setDoc(doc(db, 'thurup_games', this.gameId), this.state);

    // Write each player's hand to their private subcollection
    for (const p of this.players) {
      await setDoc(
        doc(db, 'thurup_games', this.gameId, 'hands', p.uid),
        { cards: this.hands[p.uid] }
      );
    }

    // Store thurup secret placeholder
    await setDoc(
      doc(db, 'thurup_games', this.gameId, 'secrets', 'thurup'),
      { suit: null }
    );

    // Listen for player actions
    await this._listenForActions();
  }

  /** Resume from existing Firestore state (e.g. after host page refresh) */
  async resume() {
    const snap = await getDoc(doc(db, 'thurup_games', this.gameId));
    if (!snap.exists()) throw new Error('Game not found');
    this.state = snap.data();
    // The constructor always receives a placeholder dealer seat (see
    // ThurupGame.jsx) since the real value only exists once a game doc
    // does. Sync it from the loaded state so a later startNextRound()/
    // _reDeal() (which read this.dealerSeat, not this.state.dealer)
    // rotates from the correct seat instead of always seat 0.
    this.dealerSeat = this.state.dealer;

    // Reload hands
    for (const p of this.players) {
      const handSnap = await getDoc(
        doc(db, 'thurup_games', this.gameId, 'hands', p.uid)
      );
      if (handSnap.exists()) {
        this.hands[p.uid] = handSnap.data().cards;
      }
    }

    // Reload thurup secret (and the set-aside indicator card, if any —
    // see _handleSetThurup / _handleRequestReveal)
    const secretSnap = await getDoc(
      doc(db, 'thurup_games', this.gameId, 'secrets', 'thurup')
    );
    if (secretSnap.exists()) {
      this.thurupSuit = secretSnap.data().suit;
      this.thurupIndicatorCard = secretSnap.data().card || null;
    }

    // Reload remaining deck
    const deckSnap = await getDoc(
      doc(db, 'thurup_games', this.gameId, 'secrets', 'deck')
    );
    if (deckSnap.exists()) {
      this.remainingDeck = deckSnap.data().cards || [];
    }

    await this._listenForActions();
  }

  /** Clean up listeners */
  destroy() {
    this.destroyed = true;
    this.unsubActions.forEach((unsub) => unsub());
    this.unsubActions = [];
  }

  // ─── Action listener ───────────────────────────────────

  async _listenForActions() {
    // Each player's action doc is overwritten in place (not appended), so
    // it still holds their LAST-EVER action after this round, this game,
    // or an earlier session ends. Every call here (fresh start() *and*
    // resume()) used to reset lastSeq to 0 and then attach onSnapshot,
    // which fires immediately with whatever's currently in that doc —
    // replaying a player's already-handled bid/play as if it were brand
    // new the moment the host resumes (e.g. after its own tab reloads).
    // Reading each doc once up front and seeding lastSeq from its
    // current seq treats pre-existing actions as already-handled, so
    // only genuinely new actions (submitted after this listener attaches)
    // get processed.
    await Promise.all(
      this.players.map(async (p) => {
        const ref = doc(db, 'thurup_games', this.gameId, 'actions', p.uid);

        let baselineSeq = 0;
        try {
          const existing = await getDoc(ref);
          if (existing.exists()) baselineSeq = existing.data().seq || 0;
        } catch (e) {
          console.error('Failed to read baseline action seq:', e);
        }
        this.lastSeq[p.uid] = baselineSeq;

        const unsub = onSnapshot(ref, (snap) => {
          if (this.destroyed) return;
          if (!snap.exists()) return;
          const action = snap.data();
          if (!action.seq || action.seq <= this.lastSeq[p.uid]) return;

          this.lastSeq[p.uid] = action.seq;
          this._processAction(p.uid, p.seat, action);
        });

        this.unsubActions.push(unsub);
      })
    );
  }

  // ─── Action processing ─────────────────────────────────

  /**
   * Every handler below reads this.state, does an `await` (a Firestore
   * write) partway through, and only *then* mutates this.state — e.g.
   * _handlePlayCard checks phase/currentPlayer, awaits writing the
   * updated hand, and only after that pushes the card into currentTrick
   * and advances the turn. If a second action snapshot (a double-tap
   * landing two different cards, or the same one fired twice) starts
   * processing while the first is still paused at that await, it reads
   * the *same, not-yet-mutated* phase/currentPlayer and passes the same
   * checks — both plays land in the same trick. Routing every action
   * through this single queue means only one _processActionSerial call
   * is ever in flight at a time, so that race can't happen regardless of
   * how close together two action snapshots fire.
   */
  _processAction(uid, seat, action) {
    this._actionQueue = this._actionQueue
      .then(() => this._processActionSerial(uid, seat, action))
      .catch((err) => console.error('Error processing action:', err));
    return this._actionQueue;
  }

  async _processActionSerial(uid, seat, action) {
    switch (action.type) {
      case 'bid':
        await this._handleBid(uid, seat, action.data);
        break;
      case 'pass':
        await this._handlePass(uid, seat);
        break;
      case 'setThurup':
        await this._handleSetThurup(uid, seat, action.data);
        break;
      case 'playCard':
        await this._handlePlayCard(uid, seat, action.data);
        break;
      case 'requestReveal':
        await this._handleRequestReveal(uid, seat);
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  }

  // ─── Bidding ────────────────────────────────────────────

  async _handleBid(uid, seat, data) {
    const isSecondRound = this.state.phase === PHASE.SECOND_BIDDING;
    if (this.state.phase !== PHASE.BIDDING && !isSecondRound) {
      return this._rejectAction(seat, 'Not in a bidding phase.');
    }
    if (this.state.currentPlayer !== seat) {
      return this._rejectAction(seat, 'Not your turn to bid.');
    }
    if (this.state.passedBidders.includes(seat)) {
      return this._rejectAction(seat, 'You already passed.');
    }

    const isPartnerHighest = this.state.bid.seat !== -1 && (seat + 2) % NUM_PLAYERS === this.state.bid.seat;
    const result = validateBid(this.state.bid.amount, data.amount, isPartnerHighest, isSecondRound);
    if (!result.valid) {
      return this._rejectAction(seat, result.reason);
    }

    this.state.bid = { amount: data.amount, seat };
    this.state.lastAction = { seat, type: 'bid', valid: true, detail: `Bid ${data.amount}` };

    // Advance to next non-passed player
    this._advanceBidder();

    const check = checkBiddingResult(this.state.passedBidders, this.state.bid.seat);
    if (check.finished) {
      if (!isSecondRound) {
        this.state.phase = PHASE.SETTING_THURUP;
        this.state.currentPlayer = this.state.bid.seat;
      } else {
        this.state.phase = PHASE.PLAYING;
        this.state.currentPlayer = getFirstPlayer(this.state.dealer);
      }
    }

    await this._syncState();
  }

  async _handlePass(uid, seat) {
    const isSecondRound = this.state.phase === PHASE.SECOND_BIDDING;
    if (this.state.phase !== PHASE.BIDDING && !isSecondRound) {
      return this._rejectAction(seat, 'Not in a bidding phase.');
    }
    if (this.state.currentPlayer !== seat) {
      return this._rejectAction(seat, 'Not your turn to bid.');
    }
    if (this.state.passedBidders.includes(seat)) {
      return this._rejectAction(seat, 'You already passed.');
    }

    // Can't pass if you're the only one left and no one bid in first round
    const willBePassedCount = this.state.passedBidders.length + 1;
    if (willBePassedCount >= NUM_PLAYERS && !isSecondRound && this.state.bid.seat === -1) {
      // Everyone passed with no bid — re-deal
      this.state.passedBidders.push(seat);
      this.state.lastAction = { seat, type: 'pass', valid: true, detail: 'All passed — re-dealing' };
      await this._syncState();
      await this._reDeal();
      return;
    }

    if (willBePassedCount >= NUM_PLAYERS && isSecondRound) {
      // Everyone passed in second round, move to playing
      this.state.passedBidders.push(seat);
      this.state.phase = PHASE.PLAYING;
      this.state.currentPlayer = getFirstPlayer(this.state.dealer);
      this.state.lastAction = { seat, type: 'pass', valid: true, detail: 'Second bidding complete' };
      await this._syncState();
      return;
    }

    // Can't pass if you're the last active player
    if (willBePassedCount >= NUM_PLAYERS - 1 && this.state.bid.seat !== -1) {
      this.state.passedBidders.push(seat);
      if (!isSecondRound) {
        this.state.phase = PHASE.SETTING_THURUP;
        this.state.currentPlayer = this.state.bid.seat;
      } else {
        this.state.phase = PHASE.PLAYING;
        this.state.currentPlayer = getFirstPlayer(this.state.dealer);
      }
      this.state.lastAction = { seat, type: 'pass', valid: true, detail: 'Bidding complete' };
      await this._syncState();
      return;
    }

    this.state.passedBidders.push(seat);
    this.state.lastAction = { seat, type: 'pass', valid: true, detail: 'Passed' };
    this._advanceBidder();

    await this._syncState();
  }

  _advanceBidder() {
    let next = getNextSeat(this.state.currentPlayer);
    let safety = 0;
    while (this.state.passedBidders.includes(next) && safety < NUM_PLAYERS) {
      next = getNextSeat(next);
      safety++;
    }
    this.state.currentPlayer = next;
  }

  // ─── Set Thurup ─────────────────────────────────────────

  async _handleSetThurup(uid, seat, data) {
    if (this.state.phase !== PHASE.SETTING_THURUP) {
      return this._rejectAction(seat, 'Not in Thurup-setting phase.');
    }
    if (this.state.bid.seat !== seat) {
      return this._rejectAction(seat, 'Only the bid winner can set Thurup.');
    }

    const { suit, cardId } = data;
    if (!['hearts', 'diamonds', 'clubs', 'spades'].includes(suit)) {
      return this._rejectAction(seat, 'Invalid suit.');
    }

    const hand = this.hands[uid];
    const indicatorCard = hand.find((c) => c.id === cardId && c.suit === suit);
    if (!indicatorCard) {
      return this._rejectAction(seat, 'Invalid Thurup card.');
    }

    // The chosen card is set aside face-down as the actual physical
    // Thurup indicator — same as the real game, the bidder is down a
    // card until it's revealed (see _handleRequestReveal, which returns
    // it to their hand). Store the card itself (not just the suit) so
    // it can come back later; bidderUid lets the bidder — and only the
    // bidder — read this back to privately re-check what they set.
    this.thurupSuit = suit;
    this.thurupIndicatorCard = indicatorCard;
    this.hands[uid] = hand.filter((c) => c.id !== cardId);
    await setDoc(
      doc(db, 'thurup_games', this.gameId, 'secrets', 'thurup'),
      { suit, bidderUid: uid, card: indicatorCard }
    );

    // Deal second round of 4 cards
    const { hands: extraHands, remainingDeck } = dealCards(
      this.remainingDeck,
      FIRST_DEAL_COUNT
    );
    this.remainingDeck = remainingDeck;

    // Save remaining deck to secrets for resume
    await setDoc(
      doc(db, 'thurup_games', this.gameId, 'secrets', 'deck'),
      { cards: this.remainingDeck }
    );

    // Merge new cards into existing hands (the bidder's hand here is
    // already one short — the indicator card removed above).
    const sortedPlayers = [...this.players].sort((a, b) => a.seat - b.seat);
    for (let i = 0; i < sortedPlayers.length; i++) {
      const p = sortedPlayers[i];
      this.hands[p.uid] = sortHand([...this.hands[p.uid], ...extraHands[i]]);
      await setDoc(
        doc(db, 'thurup_games', this.gameId, 'hands', p.uid),
        { cards: this.hands[p.uid] }
      );
    }

    // Transition to second bidding phase
    this.state.phase = PHASE.SECOND_BIDDING;
    this.state.passedBidders = []; // Reset passes for second round
    this.state.currentPlayer = getFirstPlayer(this.state.dealer);
    this.state.thurupCard = { suit, hidden: true }; // Show face-down card
    this.state.lastAction = {
      seat,
      type: 'setThurup',
      valid: true,
      detail: 'Thurup is set (hidden)',
    };

    await this._syncState();
  }

  // ─── Play card ──────────────────────────────────────────

  async _handlePlayCard(uid, seat, data) {
    if (this.state.phase !== PHASE.PLAYING) {
      return this._rejectAction(seat, 'Not in playing phase.');
    }
    if (this.state.currentPlayer !== seat) {
      return this._rejectAction(seat, 'Not your turn.');
    }

    const hand = this.hands[uid];
    const card = hand.find((c) => c.id === data.cardId);
    if (!card) {
      return this._rejectAction(seat, "You don't have this card.");
    }

    // Validate the play
    const result = validatePlay({
      hand,
      card,
      currentTrick: this.state.currentTrick,
      leadSuit: this.state.leadSuit,
      thurupSuit: this.thurupSuit,
      thurupRevealed: this.state.thurupRevealed,
      isBidder: seat === this.state.bid.seat,
    });

    if (!result.valid) {
      return this._rejectAction(seat, result.reason);
    }

    // Remove card from hand
    this.hands[uid] = hand.filter((c) => c.id !== card.id);
    await setDoc(
      doc(db, 'thurup_games', this.gameId, 'hands', uid),
      { cards: this.hands[uid] }
    );

    // Add to current trick
    this.state.currentTrick.push({ seat, card });

    // Set lead suit if first card
    if (this.state.currentTrick.length === 1) {
      this.state.leadSuit = card.suit;
    }

    this.state.lastAction = {
      seat,
      type: 'playCard',
      valid: true,
      detail: `${card.rank}${card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}`,
    };

    // Check if trick is complete
    if (this.state.currentTrick.length === NUM_PLAYERS) {
      await this._completeTrick();
    } else {
      this.state.currentPlayer = getNextSeat(seat);
      await this._syncState();
    }
  }

  // ─── Thurup reveal ──────────────────────────────────────

  async _handleRequestReveal(uid, seat) {
    if (this.state.phase !== PHASE.PLAYING) {
      return this._rejectAction(seat, 'Not in playing phase.');
    }
    if (this.state.thurupRevealed) {
      return this._rejectAction(seat, 'Thurup is already revealed.');
    }
    if (this.state.currentPlayer !== seat) {
      return this._rejectAction(seat, 'Not your turn.');
    }

    // Player must not have a card of the led suit
    const hand = this.hands[uid];
    const hasLeadSuit = hand.some((c) => c.suit === this.state.leadSuit);
    if (hasLeadSuit) {
      return this._rejectAction(seat, 'You have the led suit — you cannot request a reveal.');
    }

    await this._revealThurup(seat, `Thurup revealed: ${this.thurupSuit}`);
    await this._syncState();
  }

  /**
   * Shared by a player-requested reveal and the forced auto-reveal
   * below. Marks Thurup revealed and — critically — returns the
   * set-aside indicator card to the bidder's hand: they only had 7
   * cards while it was hidden, so without this they'd have nothing
   * left to play once every other card runs out.
   */
  async _revealThurup(triggerSeat, detail) {
    if (this.state.thurupRevealed) return;

    this.state.thurupRevealed = true;
    this.state.thurupSuit = this.thurupSuit;
    this.state.thurupCard = { suit: this.thurupSuit, hidden: false };
    this.state.lastAction = { seat: triggerSeat, type: 'requestReveal', valid: true, detail };

    if (this.thurupIndicatorCard) {
      const bidderUid = this.state.players.find((p) => p.seat === this.state.bid.seat)?.uid;
      if (bidderUid && this.hands[bidderUid]) {
        this.hands[bidderUid] = sortHand([...this.hands[bidderUid], this.thurupIndicatorCard]);
        await setDoc(
          doc(db, 'thurup_games', this.gameId, 'hands', bidderUid),
          { cards: this.hands[bidderUid] }
        );
      }
      this.thurupIndicatorCard = null;
    }
  }

  // ─── Trick completion ──────────────────────────────────

  async _completeTrick() {
    const { winningSeat, points } = determineTrickWinner(
      this.state.currentTrick,
      this.thurupSuit,
      this.state.thurupRevealed
    );

    const winnerTeam = getTeam(winningSeat);
    if (winnerTeam === 'A') {
      this.state.teamAPoints += points;
      this.state.teamATricks += 1;
    } else {
      this.state.teamBPoints += points;
      this.state.teamBTricks += 1;
    }

    this.state.trickWinner = winningSeat;
    this.state.phase = PHASE.TRICK_END;
    this.state.lastAction = {
      seat: winningSeat,
      type: 'trickWin',
      valid: true,
      detail: `Won trick #${this.state.trickNumber} (+${points} pts)`,
    };

    await this._syncState();

    // Brief pause, then advance
    setTimeout(async () => {
      if (this.destroyed) return;

      if (this.state.trickNumber >= TOTAL_TRICKS) {
        await this._completeRound();
      } else {
        this.state.trickNumber += 1;
        this.state.currentTrick = [];
        this.state.leadSuit = null;
        this.state.trickWinner = null;
        this.state.currentPlayer = winningSeat; // Winner leads next
        this.state.phase = PHASE.PLAYING;

        // Reveal is otherwise entirely optional — if nobody's called for
        // it by the final trick, force it now. The bidder only ever had
        // 7 cards (one set aside as the indicator); without this they'd
        // have nothing left to play for trick 8 while everyone else
        // still has one card in hand.
        if (this.state.trickNumber === TOTAL_TRICKS && !this.state.thurupRevealed) {
          await this._revealThurup(-1, `Thurup auto-revealed for the final trick: ${this.thurupSuit}`);
        }

        await this._syncState();
      }
    }, 2500);
  }

  // ─── Round completion ──────────────────────────────────

  async _completeRound() {
    const result = checkRoundResult(
      this.state.teamAPoints,
      this.state.teamBPoints,
      this.state.bid.amount,
      this.state.bid.seat
    );

    this.state.phase = PHASE.ROUND_END;
    this.state.lastAction = {
      seat: -1,
      type: 'roundEnd',
      valid: true,
      detail: result.bidMet
        ? `Bid met! Team ${result.winningTeam} wins ${result.gamePoints} point(s)`
        : `Bid failed! Team ${result.winningTeam} wins ${result.gamePoints} point(s)`,
    };

    // Update room with game points + petti transfer. The petti numbers
    // get stamped onto this round's roundResult (not just the room doc)
    // so the scoreboard can show exactly what happened *this* round —
    // "Team A gives 2 petti to Team B" — without diffing running totals.
    let roundResult = result;
    try {
      const roomRef = doc(db, 'thurup_rooms', this.roomId);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        const teamAGamePts = (roomData.teamAGamePoints || 0) + (result.winningTeam === 'A' ? result.gamePoints : 0);
        const teamBGamePts = (roomData.teamBGamePoints || 0) + (result.winningTeam === 'B' ? result.gamePoints : 0);

        const currentAPetti = roomData.teamAPetti ?? STARTING_PETTI;
        const currentBPetti = roomData.teamBPetti ?? STARTING_PETTI;
        const petti = computePettiTransfer(currentAPetti, currentBPetti, result.winningTeam, result.gamePoints);

        roundResult = {
          ...result,
          pettiTransferred: petti.transferAmount,
          teamAPetti: petti.teamAPetti,
          teamBPetti: petti.teamBPetti,
          seriesComplete: petti.seriesComplete,
          seriesWinner: petti.seriesWinner,
        };

        await updateDoc(roomRef, {
          teamAGamePoints: teamAGamePts,
          teamBGamePoints: teamBGamePts,
          teamAPetti: petti.teamAPetti,
          teamBPetti: petti.teamBPetti,
          seriesComplete: petti.seriesComplete,
          seriesWinner: petti.seriesWinner,
        });
      }
    } catch (e) {
      console.error('Failed to update room scores:', e);
    }

    this.state.roundResult = roundResult;
    await this._syncState();
  }

  // ─── Re-deal (all players passed) ──────────────────────

  async _reDeal() {
    // Reset and start fresh with next dealer. Can only ever fire before
    // anyone has bid (all-pass in round 1), so thurupIndicatorCard is
    // already null here — reset defensively anyway.
    const nextDealer = getNextSeat(this.dealerSeat);
    this.dealerSeat = nextDealer;
    this.thurupIndicatorCard = null;
    await this.start();
  }

  // ─── Start next round ──────────────────────────────────

  async startNextRound() {
    this.dealerSeat = getNextSeat(this.dealerSeat);
    this.thurupSuit = null;
    this.thurupIndicatorCard = null;
    this.remainingDeck = [];
    this.lastSeq = {};
    this.unsubActions.forEach((u) => u());
    this.unsubActions = [];
    await this.start();
  }

  // ─── Helpers ────────────────────────────────────────────

  async _syncState() {
    await updateDoc(doc(db, 'thurup_games', this.gameId), { ...this.state });
  }

  async _rejectAction(seat, reason) {
    this.state.lastAction = { seat, type: 'error', valid: false, detail: reason };
    await this._syncState();
  }
}
