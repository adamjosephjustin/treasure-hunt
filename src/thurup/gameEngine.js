/**
 * gameEngine.js — Pure game logic for the 28 (Thurup) card game.
 *
 * This module contains ONLY deterministic game rules.
 * It has NO Firebase / network dependency so it can be
 * unit-tested in isolation and shared between host & client.
 */

// ─── Constants ──────────────────────────────────────────────
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS = ['J', '9', 'A', '10', 'K', 'Q', '8', '7'];

export const RANK_ORDER = { J: 7, '9': 6, A: 5, '10': 4, K: 3, Q: 2, '8': 1, '7': 0 };
export const RANK_POINTS = { J: 3, '9': 2, A: 1, '10': 1, K: 0, Q: 0, '8': 0, '7': 0 };

export const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export const SUIT_COLORS = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black',
};

export const MIN_BID = 14;
export const MAX_BID = 28;
export const TOTAL_TRICKS = 8;
export const CARDS_PER_PLAYER = 8;
export const FIRST_DEAL_COUNT = 4;
export const NUM_PLAYERS = 4;

// Game phases
export const PHASE = {
  WAITING: 'waiting',
  BIDDING: 'bidding',
  SETTING_THURUP: 'settingThurup',
  SECOND_BIDDING: 'secondBidding',
  PLAYING: 'playing',
  TRICK_END: 'trickEnd',
  ROUND_END: 'roundEnd',
};

// ─── Deck helpers ───────────────────────────────────────────

/** Create the standard 32-card deck used in 28 */
export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}_${suit}`,
        suit,
        rank,
        points: RANK_POINTS[rank],
        order: RANK_ORDER[rank],
      });
    }
  }
  return deck;
}

/** Fisher-Yates shuffle with crypto-secure randomness */
export function shuffleDeck(deck) {
  const shuffled = [...deck];
  const buf = new Uint32Array(shuffled.length);
  crypto.getRandomValues(buf);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = buf[i] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deal `cardsPerPlayer` cards to each of `numPlayers` players
 * from the top of `deck`. Returns { hands, remainingDeck }.
 */
export function dealCards(deck, cardsPerPlayer = FIRST_DEAL_COUNT, numPlayers = NUM_PLAYERS) {
  const hands = Array.from({ length: numPlayers }, () => []);
  let idx = 0;
  for (let round = 0; round < cardsPerPlayer; round++) {
    for (let p = 0; p < numPlayers; p++) {
      if (idx < deck.length) {
        hands[p].push(deck[idx++]);
      }
    }
  }
  return { hands, remainingDeck: deck.slice(idx) };
}

// ─── Seat / Team helpers ────────────────────────────────────

/** Seats 0 & 2 = Team A, seats 1 & 3 = Team B */
export function getTeam(seat) {
  return seat % 2 === 0 ? 'A' : 'B';
}

export function getPartnerSeat(seat) {
  return (seat + 2) % NUM_PLAYERS;
}

export function getNextSeat(seat) {
  return (seat + 1) % NUM_PLAYERS;
}

/** Return the seat after the dealer (first to bid / first to lead) */
export function getFirstPlayer(dealerSeat) {
  return getNextSeat(dealerSeat);
}

// ─── Bidding ────────────────────────────────────────────────

/**
 * Validate a bid attempt.
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateBid(currentHighest, amount, isPartnerHighest, isSecondRound = false) {
  if (amount < MIN_BID || amount > MAX_BID) {
    return { valid: false, reason: `Bid must be between ${MIN_BID} and ${MAX_BID}.` };
  }
  if (isSecondRound && amount < 20) {
    return { valid: false, reason: 'Second round bids must be at least 20.' };
  }
  if (amount <= currentHighest) {
    return { valid: false, reason: `Bid must be higher than current bid of ${currentHighest}.` };
  }
  if (!isSecondRound && isPartnerHighest && amount < 20) {
    return { valid: false, reason: 'To raise your partner directly, you must bid at least 20 (Honour).' };
  }
  return { valid: true };
}

/**
 * Determine the bidding outcome.
 * If only one seat hasn't passed, they win (even without bidding explicitly).
 * @returns {{ finished: boolean, winnerSeat?: number }}
 */
export function checkBiddingResult(passedSeats, highestBidSeat, numPlayers = NUM_PLAYERS) {
  const activeCount = numPlayers - passedSeats.length;
  if (activeCount <= 1) {
    // The last remaining player wins (could be them or the highest bidder)
    return { finished: true, winnerSeat: highestBidSeat };
  }
  return { finished: false };
}

// ─── Play validation ────────────────────────────────────────

/**
 * Validate whether a player can legally play a given card.
 * This is the CORE rule-enforcement function.
 *
 * @param {Object}   opts
 * @param {Object[]} opts.hand           Player's current cards
 * @param {Object}   opts.card           The card the player wants to play
 * @param {Object[]} opts.currentTrick   Cards already played in this trick
 * @param {string|null} opts.leadSuit    Suit of the first card in the trick
 * @param {string|null} opts.thurupSuit  The trump suit
 * @param {boolean}  opts.thurupRevealed Whether the trump has been revealed
 * @param {boolean}  [opts.isBidder]    Whether the player is the bid winner
 *                                       (who alone knows the hidden trump)
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validatePlay({ hand, card, currentTrick, leadSuit, thurupSuit, thurupRevealed, isBidder = false }) {
  // Does the player actually hold this card?
  if (!hand.some((c) => c.id === card.id)) {
    return { valid: false, reason: "You don't have this card." };
  }

  // First card of the trick — anything goes, except: the bidder (who set
  // the still-hidden trump) may not lead it before it's revealed, unless
  // it's the only suit left in their hand.
  if (currentTrick.length === 0) {
    if (isBidder && thurupSuit && !thurupRevealed && card.suit === thurupSuit) {
      const hasOtherSuit = hand.some((c) => c.suit !== thurupSuit);
      if (hasOtherSuit) {
        return {
          valid: false,
          reason: `As the bidder, you can't lead Thurup (${SUIT_SYMBOLS[thurupSuit]}) before it's revealed.`,
        };
      }
    }
    return { valid: true };
  }

  // Must follow led suit if able
  const hasLeadSuit = hand.some((c) => c.suit === leadSuit);
  if (hasLeadSuit && card.suit !== leadSuit) {
    return {
      valid: false,
      reason: `You must follow suit (${SUIT_SYMBOLS[leadSuit]} ${leadSuit}).`,
    };
  }

  // Can't follow suit — check trump obligations
  if (!hasLeadSuit && thurupRevealed) {
    const hasTrump = hand.some((c) => c.suit === thurupSuit);
    if (hasTrump && card.suit !== thurupSuit) {
      return {
        valid: false,
        reason: `You must play a trump (${SUIT_SYMBOLS[thurupSuit]} ${thurupSuit}).`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get the list of legally playable card IDs for a player.
 */
export function getValidMoves({ hand, currentTrick, leadSuit, thurupSuit, thurupRevealed, isBidder = false }) {
  return hand.filter((card) => {
    const result = validatePlay({
      hand,
      card,
      currentTrick,
      leadSuit,
      thurupSuit,
      thurupRevealed,
      isBidder,
    });
    return result.valid;
  });
}

// ─── Trick resolution ───────────────────────────────────────

/**
 * Determine the winner of a completed trick.
 *
 * Before thurup is revealed, trump cards have NO special power —
 * they are just non-lead-suit discards.
 *
 * @param {Array<{seat: number, card: Object}>} trick
 * @param {string|null} thurupSuit
 * @param {boolean} thurupRevealed
 * @returns {{ winningSeat: number, points: number }}
 */
export function determineTrickWinner(trick, thurupSuit, thurupRevealed) {
  if (trick.length === 0) return null;

  const leadSuit = trick[0].card.suit;
  let winner = trick[0];

  for (let i = 1; i < trick.length; i++) {
    const play = trick[i];
    const challenger = play.card;
    const current = winner.card;

    const challengerIsTrump = thurupRevealed && challenger.suit === thurupSuit;
    const currentIsTrump = thurupRevealed && current.suit === thurupSuit;

    if (challengerIsTrump && currentIsTrump) {
      // Both trump — higher rank wins
      if (challenger.order > current.order) winner = play;
    } else if (challengerIsTrump && !currentIsTrump) {
      // Trump beats non-trump
      winner = play;
    } else if (!challengerIsTrump && currentIsTrump) {
      // Non-trump can't beat trump — do nothing
    } else {
      // Neither is trump — only lead-suit cards compete
      if (challenger.suit === leadSuit && current.suit === leadSuit) {
        if (challenger.order > current.order) winner = play;
      } else if (challenger.suit === leadSuit && current.suit !== leadSuit) {
        winner = play;
      }
      // If challenger isn't lead suit either → discard, can't win
    }
  }

  const points = trick.reduce((sum, p) => sum + p.card.points, 0);
  return { winningSeat: winner.seat, points };
}

// ─── Round result ───────────────────────────────────────────

/**
 * Check whether the bidding team met their bid.
 * @returns {{ bidMet: boolean, winningTeam: 'A'|'B', gamePoints: number }}
 */
export function checkRoundResult(teamAPoints, teamBPoints, bidAmount, bidderSeat) {
  const bidderTeam = getTeam(bidderSeat);
  const bidderPoints = bidderTeam === 'A' ? teamAPoints : teamBPoints;
  const bidMet = bidderPoints >= bidAmount;

  // Kerala 28 Game Points Scaling
  let winPoints = 1;
  let losePoints = 2;
  if (bidAmount >= 28) { // Thani
    winPoints = 3;
    losePoints = 4;
  } else if (bidAmount >= 20) { // Honour
    winPoints = 2;
    losePoints = 3;
  }

  if (bidMet) {
    return { bidMet: true, winningTeam: bidderTeam, gamePoints: winPoints };
  } else {
    const opposingTeam = bidderTeam === 'A' ? 'B' : 'A';
    return { bidMet: false, winningTeam: opposingTeam, gamePoints: losePoints };
  }
}

// ─── Petti (match) scoring ────────────────────────────────────
//
// A regional match-scoring convention: each team starts with a stash of
// physical cards ("petti"). After every round, the losing team hands the
// winning team a number of petti cards equal to that round's gamePoints
// (the same 1/2/3/4 scale from checkRoundResult above). Whoever collects
// the *entire* pool (their own starting stash plus all of the other
// team's) wins the series — so the series can swing back and forth over
// many rounds before it's decided.

export const STARTING_PETTI = 6;

/**
 * Apply one round's gamePoints as a petti transfer from the losing team
 * to the winning team, capped so a team's stash can't go negative — that
 * cap is what actually ends the series (the other team has collected the
 * full pool at that point).
 *
 * @returns {{ teamAPetti: number, teamBPetti: number, transferAmount: number, seriesComplete: boolean, seriesWinner: 'A'|'B'|null }}
 */
export function computePettiTransfer(teamAPetti, teamBPetti, winningTeam, gamePoints) {
  const losingCurrent = winningTeam === 'A' ? teamBPetti : teamAPetti;
  const transferAmount = Math.min(gamePoints, losingCurrent);

  let newA = teamAPetti;
  let newB = teamBPetti;
  if (winningTeam === 'A') {
    newA += transferAmount;
    newB -= transferAmount;
  } else {
    newB += transferAmount;
    newA -= transferAmount;
  }

  const seriesComplete = newA <= 0 || newB <= 0;
  const seriesWinner = seriesComplete ? (newA <= 0 ? 'B' : 'A') : null;

  return { teamAPetti: newA, teamBPetti: newB, transferAmount, seriesComplete, seriesWinner };
}

// ─── Initial game state factory ─────────────────────────────

/**
 * Create the initial game-state object for a new round.
 * This is what gets written to Firestore.
 */
export function createInitialGameState({ gameId, roomId, host, players, dealer }) {
  const firstPlayer = getFirstPlayer(dealer);
  return {
    gameId,
    roomId,
    host,
    phase: PHASE.BIDDING,
    dealer,
    currentPlayer: firstPlayer,
    bid: { amount: 0, seat: -1 },
    passedBidders: [],
    thurupSuit: null,
    thurupRevealed: false,
    thurupCard: null,
    currentTrick: [],
    trickNumber: 1,
    leadSuit: null,
    teamAPoints: 0,
    teamBPoints: 0,
    teamATricks: 0,
    teamBTricks: 0,
    trickWinner: null,
    players,
    lastAction: null,
    createdAt: new Date().toISOString(),
  };
}

// ─── Utility ────────────────────────────────────────────────

/** Generate a 6-char room code avoiding ambiguous chars */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const values = new Uint8Array(6);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => chars[v % chars.length]).join('');
}

/** Sort a hand for display: group by suit, then by rank within suit */
export function sortHand(hand) {
  const suitOrder = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) return suitOrder[a.suit] - suitOrder[b.suit];
    return b.order - a.order; // higher rank first within suit
  });
}

/** Pretty-print a card */
export function cardLabel(card) {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}
