// 20 Chess Puzzles — Increasing Difficulty
// Each puzzle: { id, fen, solution (array of moves in SAN), title, description, difficulty, theme }
// solution[0] = the move the PLAYER must find. solution[1] = opponent reply (if mate-in-2+).

const chessPuzzles = [
  // ── TIER 1: Mate in 1 (Beginner) ──────────────────────────
  {
    id: 1,
    fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
    solution: ['Re8#'],
    title: 'Back Rank Basics',
    description: 'The enemy king is trapped on the back rank. Deliver checkmate in one move with your rook!',
    difficulty: 1,
    theme: 'Back Rank Mate'
  },
  {
    id: 2,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['Qxf7#'],
    title: "Scholar's Trap",
    description: 'Your queen and bishop are eyeing f7. Can you find the classic checkmate?',
    difficulty: 1,
    theme: "Scholar's Mate"
  },
  {
    id: 3,
    fen: '5rk1/1p3ppp/p7/8/8/8/1PP2PPP/3R2K1 w - - 0 1',
    solution: ['Rd8'],
    title: 'Rook Invasion',
    description: 'Force the trade or infiltrate the back rank. Find the strongest rook move!',
    difficulty: 1,
    theme: 'Back Rank Threat'
  },
  {
    id: 4,
    fen: '6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1',
    solution: ['Qe8#'],
    title: 'Queen Delivers',
    description: 'Your queen has a clear path to the back rank. Deliver checkmate!',
    difficulty: 1,
    theme: 'Queen Mate'
  },
  {
    id: 5,
    fen: 'r4rk1/ppp2ppp/8/8/8/2B5/PPP2PPP/R4RK1 w - - 0 1',
    solution: ['Bxh7+'],
    title: 'Greek Gift Preview',
    description: 'Sacrifice the bishop on h7 to crack open the king\'s shelter!',
    difficulty: 1,
    theme: 'Bishop Sacrifice'
  },

  // ── TIER 2: Tactical Motifs (Easy) ─────────────────────────
  {
    id: 6,
    fen: 'r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    solution: ['d4'],
    title: 'Central Control',
    description: 'Claim the center! Push a pawn to challenge the knight and gain space.',
    difficulty: 2,
    theme: 'Center Control'
  },
  {
    id: 7,
    fen: 'r1bqkb1r/pppppppp/2n2n2/8/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 2 4',
    solution: ['d5'],
    title: 'Knight Kick',
    description: 'Push your pawn to attack the knight and gain a tempo!',
    difficulty: 2,
    theme: 'Tempo Gain'
  },
  {
    id: 8,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    solution: ['d3'],
    title: 'Solid Foundation',
    description: 'Develop solidly. Support your e4 pawn and prepare to castle.',
    difficulty: 2,
    theme: 'Development'
  },
  {
    id: 9,
    fen: 'rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2',
    solution: ['e5'],
    title: 'Push & Attack',
    description: 'Advance your pawn to attack the knight!',
    difficulty: 2,
    theme: 'Pawn Advance'
  },
  {
    id: 10,
    fen: 'rnb1kbnr/pppp1ppp/8/4p3/5Pq1/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3',
    solution: ['g3'],
    title: 'Defend the Threat',
    description: 'The queen is threatening mate on f2! Find the defensive move.',
    difficulty: 2,
    theme: 'Defense'
  },

  // ── TIER 3: Mate in 2 (Medium) ─────────────────────────────
  {
    id: 11,
    fen: '2r3k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1',
    solution: ['Rb8'],
    title: 'Rook Endgame Pressure',
    description: 'Infiltrate the back rank with your rook to create mating threats!',
    difficulty: 3,
    theme: 'Rook Endgame'
  },
  {
    id: 12,
    fen: 'r3k2r/ppp2ppp/2n1bn2/2bpp3/4P3/2NP1N2/PPP1BPPP/R1BQK2R w KQkq - 0 7',
    solution: ['O-O'],
    title: 'Castle to Safety',
    description: 'Your king is exposed in the center. Get to safety while connecting your rooks!',
    difficulty: 3,
    theme: 'Castling'
  },
  {
    id: 13,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/3P1N2/PPP1BPPP/RNBQK2R w KQkq - 0 5',
    solution: ['O-O'],
    title: 'King Safety First',
    description: 'Secure your king and activate your rook in one move!',
    difficulty: 3,
    theme: 'King Safety'
  },
  {
    id: 14,
    fen: 'r1bqkbnr/pppppppp/2n5/8/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 3 3',
    solution: ['d4'],
    title: 'Italian Game Strike',
    description: 'Play the classic central thrust to seize the initiative!',
    difficulty: 3,
    theme: 'Opening Theory'
  },
  {
    id: 15,
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    solution: ['e5'],
    title: 'The Perfect Response',
    description: 'You are Black. Mirror White\'s center pawn and fight for control!',
    difficulty: 3,
    theme: 'Symmetrical Defense'
  },

  // ── TIER 4: Advanced (Hard) ────────────────────────────────
  {
    id: 16,
    fen: 'r1bqkb1r/pppppppp/2n2n2/8/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq - 0 4',
    solution: ['Nxe4'],
    title: 'Win a Pawn',
    description: 'The e4 pawn is under-defended. Grab it with the knight!',
    difficulty: 4,
    theme: 'Capturing Tactics'
  },
  {
    id: 17,
    fen: 'r1b1kbnr/pppp1ppp/2n5/4p2q/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 2 4',
    solution: ['Nc3'],
    title: 'Develop with Purpose',
    description: 'Bring the knight out to a strong square while preparing to counter the queen.',
    difficulty: 4,
    theme: 'Development + Defense'
  },
  {
    id: 18,
    fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',
    solution: ['e3'],
    title: 'Nimzo-Indian Setup',
    description: 'Support your center and prepare to challenge the pin on your knight!',
    difficulty: 4,
    theme: 'Positional Play'
  },
  {
    id: 19,
    fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
    solution: ['d5'],
    title: 'Queen\'s Gambit Declined',
    description: 'Respond to 1.d4 with the classical central counter!',
    difficulty: 4,
    theme: 'Opening Repertoire'
  },
  {
    id: 20,
    fen: 'r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6',
    solution: ['Be3'],
    title: 'The Italian Masterclass',
    description: 'Develop your last minor piece to a active square, preparing to castle and seize the initiative!',
    difficulty: 4,
    theme: 'Complete Development'
  },

  // ── TIER 5: Expert (21–30) ─────────────────────────────────
  {
    id: 21,
    fen: '2kr3r/ppp2ppp/2n5/3qN3/8/2P5/PP3PPP/R2QR1K1 w - - 0 1',
    solution: ['Nf7'],
    title: 'Royal Fork',
    description: 'Your knight can attack the king and queen simultaneously! Find the devastating fork.',
    difficulty: 5,
    theme: 'Knight Fork'
  },
  {
    id: 22,
    fen: 'r3kb1r/pp1q1ppp/2n1pn2/3p4/3P1B2/2NQ1N2/PPP2PPP/R3K2R w KQkq - 0 8',
    solution: ['Nb5'],
    title: 'Discovery Charge',
    description: 'Move the knight to reveal an attack from the queen behind it!',
    difficulty: 5,
    theme: 'Discovered Attack'
  },
  {
    id: 23,
    fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 6 6',
    solution: ['Bg5'],
    title: 'Pin the Knight',
    description: 'Put your bishop on g5 to pin the knight against the queen!',
    difficulty: 5,
    theme: 'Absolute Pin'
  },
  {
    id: 24,
    fen: 'r2qkb1r/ppp1pppp/2n2n2/3p1b2/3P1B2/2N2N2/PPP1PPPP/R2QKB1R w KQkq - 4 4',
    solution: ['Qb3'],
    title: 'Double Attack',
    description: 'Find the queen move that simultaneously attacks b7 and d5!',
    difficulty: 5,
    theme: 'Double Attack'
  },
  {
    id: 25,
    fen: '4r1k1/5ppp/p7/1p6/8/1B6/PPP2PPP/4R1K1 w - - 0 1',
    solution: ['Re8+'],
    title: 'Rook Exchange',
    description: 'Force the exchange on the back rank to win the endgame!',
    difficulty: 5,
    theme: 'Simplification'
  },
  {
    id: 26,
    fen: 'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5',
    solution: ['O-O'],
    title: 'Tempo Castle',
    description: 'Castle to safety while the opponent queen is on a vulnerable square.',
    difficulty: 5,
    theme: 'Castling Tactics'
  },
  {
    id: 27,
    fen: 'rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5',
    solution: ['cxd5'],
    title: 'Exchange Variation',
    description: 'Capture in the center to open lines and challenge Black\'s pawn structure.',
    difficulty: 5,
    theme: 'Pawn Exchanges'
  },
  {
    id: 28,
    fen: 'r2q1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8',
    solution: ['Nd5'],
    title: 'Outpost Knight',
    description: 'Plant a knight on the powerful d5 outpost where it cannot be chased away!',
    difficulty: 5,
    theme: 'Knight Outpost'
  },
  {
    id: 29,
    fen: 'r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
    solution: ['d4'],
    title: 'Sicilian Strike',
    description: 'Open the position with the classic d4 thrust against the Sicilian Defense!',
    difficulty: 5,
    theme: 'Opening Aggression'
  },
  {
    id: 30,
    fen: 'r3k2r/ppp1bppp/2nqpn2/3p4/3P1B2/2NQPN2/PPP2PPP/R3K2R w KQkq - 0 8',
    solution: ['O-O-O'],
    title: 'Queenside Castle',
    description: 'Castle long to connect your rooks and launch a kingside attack!',
    difficulty: 5,
    theme: 'Long Castle Strategy'
  },

  // ── TIER 6: Master (31–40) ─────────────────────────────────
  {
    id: 31,
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 6',
    solution: ['Bd3'],
    title: 'Develop Under Pressure',
    description: 'Your knight is pinned. Develop the bishop to break free and prepare castling.',
    difficulty: 6,
    theme: 'Pin Breaking'
  },
  {
    id: 32,
    fen: 'r2qr1k1/ppp2ppp/2n1bn2/3pp3/4P3/1BNP1N2/PPP2PPP/R1BQR1K1 w - - 0 9',
    solution: ['exd5'],
    title: 'Central Tension',
    description: 'Break the center tension to open lines for your pieces!',
    difficulty: 6,
    theme: 'Central Break'
  },
  {
    id: 33,
    fen: 'r2q1rk1/1pp2ppp/p1n1bn2/3pp1B1/4P3/2NP1N2/PPP1QPPP/R3KB1R w KQ - 0 8',
    solution: ['exd5'],
    title: 'Pawn Storm Prep',
    description: 'Exchange in the center to clear lines before launching a kingside attack.',
    difficulty: 6,
    theme: 'Pawn Breaks'
  },
  {
    id: 34,
    fen: 'rnbq1rk1/ppp1bppp/4pn2/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R w KQ - 0 6',
    solution: ['e3'],
    title: 'Solid Structure',
    description: 'Reinforce your center with a rock-solid pawn triangle before expanding.',
    difficulty: 6,
    theme: 'Prophylaxis'
  },
  {
    id: 35,
    fen: 'r1b2rk1/ppppqppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQR1K1 w - - 0 8',
    solution: ['a4'],
    title: 'Queenside Expansion',
    description: 'Gain space on the queenside and prepare to challenge the bishop on c5.',
    difficulty: 6,
    theme: 'Space Advantage'
  },
  {
    id: 36,
    fen: 'r1bq1rk1/pp3ppp/2nbpn2/2pp4/3P1B2/2NBPN2/PPP2PPP/R2QK2R w KQ - 0 7',
    solution: ['dxc5'],
    title: 'Exchange and Exploit',
    description: 'Exchange pawns to expose a weakness in Black\'s pawn structure.',
    difficulty: 6,
    theme: 'Structural Weakness'
  },
  {
    id: 37,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 4',
    solution: ['d3'],
    title: 'Anti-Berlin Wall',
    description: 'Play the slow positional approach to maintain your center and development edge.',
    difficulty: 6,
    theme: 'Positional Subtlety'
  },
  {
    id: 38,
    fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 4',
    solution: ['Qc2'],
    title: 'Classical Nimzo',
    description: 'Avoid the doubled pawns and prepare e4 with the queen on c2!',
    difficulty: 6,
    theme: 'Avoiding Doubled Pawns'
  },
  {
    id: 39,
    fen: 'r2q1rk1/pp2bppp/2n1pn2/2pp2B1/3P4/2NBPN2/PPP2PPP/R2QK2R w KQ - 0 8',
    solution: ['Bxf6'],
    title: 'Bishop Pair Arsenal',
    description: 'Exchange the bishop for the knight to double Black\'s pawns and weaken the kingside!',
    difficulty: 6,
    theme: 'Piece Exchange Strategy'
  },
  {
    id: 40,
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 6',
    solution: ['Bd3'],
    title: 'Stonewall Attack',
    description: 'Plant the bishop on the long diagonal and prepare a crushing kingside attack.',
    difficulty: 6,
    theme: 'Attack Preparation'
  },

  // ── TIER 7: Grandmaster (41–50) ────────────────────────────
  {
    id: 41,
    fen: 'r1bqk2r/ppp2ppp/2n1pn2/3p4/1bPP4/2N1PN2/PP1B1PPP/R2QKB1R w KQkq - 0 6',
    solution: ['a3'],
    title: 'The Bayonet',
    description: 'Challenge the pin immediately by forcing the bishop to make a decision!',
    difficulty: 7,
    theme: 'Anti-Pin Technique'
  },
  {
    id: 42,
    fen: 'rnbq1rk1/pp2ppbp/2pp1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 0 6',
    solution: ['O-O'],
    title: "King's Indian Classical",
    description: 'Complete development before the middlegame storm begins.',
    difficulty: 7,
    theme: 'Classical Development'
  },
  {
    id: 43,
    fen: 'r2qkb1r/pp2pppp/2n2n2/3p1b2/3P4/2N2NP1/PPP1PP1P/R1BQKB1R w KQkq - 0 5',
    solution: ['Bg2'],
    title: 'Fianchetto Power',
    description: 'Place the bishop on the long diagonal to dominate the center from afar.',
    difficulty: 7,
    theme: 'Fianchetto Strategy'
  },
  {
    id: 44,
    fen: 'rnbqk2r/pp3ppp/4pn2/2ppP3/3P4/2P2N2/PP3PPP/RNBQKB1R w KQkq - 0 5',
    solution: ['Bd3'],
    title: 'French Advance',
    description: 'Develop the bishop to an active diagonal supporting the pawn chain.',
    difficulty: 7,
    theme: 'Pawn Chain Support'
  },
  {
    id: 45,
    fen: 'r1bq1rk1/pp1nppbp/2pp1np1/8/2PPP3/2N1BN2/PP2BPPP/R2QK2R w KQ - 0 7',
    solution: ['O-O'],
    title: 'Calm Before the Storm',
    description: 'Secure your king before launching the central pawn break.',
    difficulty: 7,
    theme: 'Strategic Patience'
  },
  {
    id: 46,
    fen: 'r1bqkb1r/pp3ppp/2n1pn2/2pp4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 5',
    solution: ['cxd5'],
    title: 'Semi-Tarrasch Exchange',
    description: 'Trade in the center to create an isolated pawn target for the endgame.',
    difficulty: 7,
    theme: 'Isolani Strategy'
  },
  {
    id: 47,
    fen: 'rn1qkb1r/pp2pppp/2p2n2/3p1b2/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 4',
    solution: ['cxd5'],
    title: 'Slav Exchange',
    description: 'The precise exchange to open the c-file and challenge Black\'s structure.',
    difficulty: 7,
    theme: 'Exchange Precision'
  },
  {
    id: 48,
    fen: 'r2q1rk1/pp1nbppp/2p1pn2/3p4/2PP4/1PN1PN2/PB3PPP/R2QKB1R w KQ - 0 8',
    solution: ['Bd3'],
    title: 'Meran Preparation',
    description: 'Develop the bishop to its ideal square before the critical central break.',
    difficulty: 7,
    theme: 'Deep Preparation'
  },
  {
    id: 49,
    fen: 'r1bqk2r/pp1n1ppp/2pbpn2/8/2pPP3/2N2N2/PP2BPPP/R1BQK2R w KQkq - 0 7',
    solution: ['O-O'],
    title: 'Sacrifice Accepted',
    description: 'You gambited a pawn. Now castle and open the position to exploit your lead in development!',
    difficulty: 7,
    theme: 'Gambit Compensation'
  },
  {
    id: 50,
    fen: 'r2q1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9',
    solution: ['O-O-O'],
    title: 'The Dragon Slayer',
    description: 'Castle queenside and prepare the devastating h4-h5 pawn storm against the Sicilian Dragon!',
    difficulty: 7,
    theme: 'Opposite Side Castling Attack'
  },

  // ── TIER 8: Multi-Move — Mate in 2 (51–58) ────────────────
  {
    id: 51,
    fen: '3r2k1/5ppp/8/8/8/8/4QPPP/4R1K1 w - - 0 1',
    solution: ['Qe8+', 'Rxe8', 'Rxe8#'],
    title: 'Royal Sacrifice',
    description: 'Sacrifice your queen on the back rank, then deliver checkmate with the rook! (2 moves)',
    difficulty: 8,
    theme: 'Queen Sacrifice + Back Rank'
  },
  {
    id: 52,
    fen: '1r4k1/5ppp/8/8/8/8/Q4PPP/1R4K1 w - - 0 1',
    solution: ['Rxb8+', 'Kh8', 'Qa1#'],
    title: 'Clearance Capture',
    description: 'Eliminate the defender first, then unleash a deadly queen check on the long diagonal! (2 moves)',
    difficulty: 8,
    theme: 'Clearance + Diagonal Mate'
  },
  {
    id: 53,
    fen: 'r1b2rk1/ppppqppp/2n5/8/2B1R3/8/PPP2PPP/R1BQ2K1 w - - 0 1',
    solution: ['Re8', 'Qxe8', 'Qd5'],
    title: 'Overloaded Defender',
    description: 'The queen guards too many things at once. Force it to capture, then exploit the weakness! (2 moves)',
    difficulty: 8,
    theme: 'Overloaded Piece'
  },
  {
    id: 54,
    fen: '4r1k1/5ppp/8/3N4/8/4Q3/5PPP/6K1 w - - 0 1',
    solution: ['Nf6+', 'Kh8', 'Qe7'],
    title: 'Knight Check Domination',
    description: 'Fork the king with a knight check, then position your queen for a crushing attack! (2 moves)',
    difficulty: 8,
    theme: 'Knight Fork + Queen Pressure'
  },
  {
    id: 55,
    fen: '2r3k1/5ppp/8/8/8/2B5/5PPP/4R1K1 w - - 0 1',
    solution: ['Re8+', 'Rxe8', 'Bd4'],
    title: 'Exchange then Dominate',
    description: 'Trade rooks on the back rank, then activate your bishop to control the board! (2 moves)',
    difficulty: 8,
    theme: 'Simplification + Bishop Dominance'
  },
  {
    id: 56,
    fen: '6k1/5ppp/8/1r6/8/4B3/5PPP/R5K1 w - - 0 1',
    solution: ['Ra8+', 'Rb8', 'Rxb8#'],
    title: 'Corridor Mate',
    description: 'Check on the back rank and force the rook to interpose, then capture with checkmate! (2 moves)',
    difficulty: 8,
    theme: 'Back Rank Forcing'
  },
  {
    id: 57,
    fen: 'r4rk1/ppp2ppp/8/3qN3/8/2P5/PP3PPP/R2QR1K1 w - - 0 1',
    solution: ['Nf7', 'Rxf7', 'Qxd5'],
    title: 'Knight Deflection',
    description: 'Sacrifice the knight to deflect the rook, then capture the undefended queen! (2 moves)',
    difficulty: 8,
    theme: 'Deflection Sacrifice'
  },
  {
    id: 58,
    fen: '4r1k1/ppp2ppp/8/4N3/1b6/8/PPPQ1PPP/4R1K1 w - - 0 1',
    solution: ['Nf7', 'Kh8', 'Qxb4'],
    title: 'Fork and Grab',
    description: 'Your knight threatens a royal fork! After the king retreats, grab the hanging bishop. (2 moves)',
    difficulty: 8,
    theme: 'Knight Threat + Material Win'
  },

  // ── TIER 9: Multi-Move — Mate in 3 (59–66) ────────────────
  {
    id: 59,
    fen: '6k1/5ppp/8/8/8/8/4RPPP/1R4K1 w - - 0 1',
    solution: ['Rb8+', 'Kh8', 'Ree8', 'g6', 'Rb7'],
    title: 'Double Rook Ladder',
    description: 'Use your two rooks to systematically push the king into a mating net! (3 moves)',
    difficulty: 9,
    theme: 'Rook Coordination'
  },
  {
    id: 60,
    fen: '3r2k1/pp3ppp/8/8/8/2B5/PP2QPPP/4R1K1 w - - 0 1',
    solution: ['Qe8+', 'Rxe8', 'Rxe8+', 'Kh7', 'Bd2'],
    title: 'Queen Sac → Rook Invasion',
    description: 'Sacrifice the queen to infiltrate, then regroup your bishop for the final squeeze! (3 moves)',
    difficulty: 9,
    theme: 'Queen Sacrifice + Rook Endgame'
  },
  {
    id: 61,
    fen: 'r3k2r/ppp2ppp/2n5/3Np3/2B5/8/PPP2PPP/R3K2R w KQkq - 0 1',
    solution: ['Nf6+', 'Ke7', 'Nd5+', 'Ke8', 'Bb5'],
    title: 'Knight Dance',
    description: 'Bounce your knight with tempo checks to set up a crushing bishop pin! (3 moves)',
    difficulty: 9,
    theme: 'Knight Maneuver + Pin'
  },
  {
    id: 62,
    fen: 'r1bq1rk1/pppp1ppp/8/4N3/2B1n3/8/PPPP1PPP/R1BQ1RK1 w - - 0 1',
    solution: ['Bxf7+', 'Kh8', 'Ng6+', 'hxg6', 'Qh5+'],
    title: 'Greek Gift Blitz',
    description: 'Sacrifice on f7, follow up with a knight fork, then launch the queen for a crushing attack! (3 moves)',
    difficulty: 9,
    theme: 'Bishop Sacrifice + Knight Fork'
  },
  {
    id: 63,
    fen: '2kr4/ppp2ppp/8/8/4R3/8/PPP1QPPP/6K1 w - - 0 1',
    solution: ['Re8+', 'Rd8', 'Qe6+', 'Kb8', 'Rxd8#'],
    title: 'Rook-Queen Barrage',
    description: 'Check with the rook, force an interposition, infiltrate with the queen, then deliver mate! (3 moves)',
    difficulty: 9,
    theme: 'Major Piece Coordination'
  },
  {
    id: 64,
    fen: 'r4rk1/ppp2ppp/3b4/8/8/2N5/PPP1QPPP/R3R1K1 w - - 0 1',
    solution: ['Nd5', 'Be5', 'Qe4', 'Bxe4', 'Rxe4'],
    title: 'Outpost → Exchange',
    description: 'Plant the knight on d5, provoke a bishop move, then trade favorably! (3 moves)',
    difficulty: 9,
    theme: 'Positional Squeeze'
  },
  {
    id: 65,
    fen: '4rrk1/5ppp/8/3N4/8/8/4QPPP/4R1K1 w - - 0 1',
    solution: ['Nf6+', 'Kh8', 'Qe7', 'Rf7', 'Qe8+'],
    title: 'Knight + Queen Assault',
    description: 'Check with the knight, position the queen, then force a decisive rook exchange! (3 moves)',
    difficulty: 9,
    theme: 'Knight + Queen Tandem'
  },
  {
    id: 66,
    fen: 'r2q1rk1/pp3ppp/2p5/4N3/3P4/8/PPP2PPP/R2QR1K1 w - - 0 1',
    solution: ['Nxf7', 'Rxf7', 'Re8', 'Qxe8', 'Qxe8+'],
    title: 'Exchange Cascade',
    description: 'Sacrifice the knight, win the exchange, then trade down to reach a winning position! (3 moves)',
    difficulty: 9,
    theme: 'Tactical Sequence'
  },

  // ── TIER 10: Multi-Move — Mate in 4–5 (67–75) ─────────────
  {
    id: 67,
    fen: '6k1/5ppp/8/8/8/8/1R3PPP/1R4K1 w - - 0 1',
    solution: ['Rb8+', 'Kh8', 'R1b7', 'h6', 'Rg8+', 'Kh7', 'Rbg7#'],
    title: 'Rook Storm',
    description: 'Systematically cut off escape routes with your two rooks until the king is cornered! (4 moves)',
    difficulty: 10,
    theme: 'Double Rook Mating Attack'
  },
  {
    id: 68,
    fen: 'r3k3/ppp2ppp/8/3N4/4R3/8/PPP1QPPP/6K1 w - - 0 1',
    solution: ['Re8+', 'Rxe8', 'Qxe8+', 'Kd7', 'Qe7+', 'Kc8', 'Nc7'],
    title: 'Full Court Press',
    description: 'Sacrifice the rook, recapture with queen, then chase the king into a knight trap! (4 moves)',
    difficulty: 10,
    theme: 'Rook Sacrifice + Queen Chase'
  },
  {
    id: 69,
    fen: '2r3k1/5ppp/4p3/3pN3/8/8/4QPPP/6K1 w - - 0 1',
    solution: ['Nxf7', 'Kxf7', 'Qh5+', 'Kg8', 'Qe8+', 'Kh7', 'Qxc8'],
    title: 'Knight Sacrifice Sweep',
    description: 'Crack open the king with a knight sacrifice, then use queen checks to win the rook! (4 moves)',
    difficulty: 10,
    theme: 'Sacrifice + Queen Infiltration'
  },
  {
    id: 70,
    fen: 'r1bqk2r/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
    solution: ['Nxe5', 'Nxe5', 'Qh5', 'Ng6', 'Qxf7+', 'Kd8', 'Qxg6'],
    title: 'Fried Liver Prep',
    description: 'Capture the center pawn, aim the queen at f7, and shatter the kingside! (4 moves)',
    difficulty: 10,
    theme: 'Aggressive Opening Attack'
  },
  {
    id: 71,
    fen: '2r3k1/pp3ppp/8/8/4RB2/8/PP3PPP/6K1 w - - 0 1',
    solution: ['Re8+', 'Rxe8', 'Bd6', 'Re1+', 'Kf2', 'Re6', 'Bc7'],
    title: 'Bishop Domination',
    description: 'Trade the rooks, activate the bishop, and slowly suffocate your opponent! (4 moves)',
    difficulty: 10,
    theme: 'Endgame Technique'
  },
  {
    id: 72,
    fen: 'r4rk1/ppp2ppp/2n5/3Np3/4P3/8/PPP2PPP/R3QRK1 w - - 0 1',
    solution: ['Nf6+', 'Kh8', 'Qh4', 'h6', 'Qg4', 'Kh7', 'Qg6+', 'Kh8', 'Qg7#'],
    title: 'Smothered Siege',
    description: 'Plant the knight on f6, build up with the queen, and deliver a suffocating checkmate! (5 moves)',
    difficulty: 10,
    theme: 'Knight + Queen Mating Net'
  },
  {
    id: 73,
    fen: '2r3k1/pp3ppp/3p4/8/4P3/2B5/PP3PPP/R5K1 w - - 0 1',
    solution: ['Ra8', 'Rxa8', 'Bxd6', 'Ra1+', 'Kf2', 'Ra2', 'Bc7'],
    title: 'Pawn Hunt Convert',
    description: 'Trade rooks favorably, collect the weak d-pawn, and convert your material advantage! (4 moves)',
    difficulty: 10,
    theme: 'Endgame Conversion'
  },
  {
    id: 74,
    fen: 'r3k2r/ppp1qppp/2n1p3/3pN3/3P4/2P5/PP2QPPP/R3K2R w KQkq - 0 1',
    solution: ['Nxc6', 'bxc6', 'Qa6', 'Qd7', 'Qa8+', 'Qd8', 'Qxc6+'],
    title: 'Demolition Derby',
    description: 'Shatter the queenside pawns, infiltrate with the queen, and gather material with checks! (4 moves)',
    difficulty: 10,
    theme: 'Pawn Structure Destruction'
  },
  {
    id: 75,
    fen: 'r2qk2r/ppp2ppp/2nb4/3np3/8/3B1N2/PPP1QPPP/R1B1K2R w KQkq - 0 1',
    solution: ['Nxe5', 'Bxe5', 'Bxh7', 'Nf4', 'Qh5', 'Nxh5', 'Bg6+', 'Ke7', 'Bxh5'],
    title: 'The Grand Sacrifice',
    description: 'A multi-piece sacrifice sequence capped by a spectacular bishop journey across the board! (5 moves)',
    difficulty: 10,
    theme: 'Complex Combination'
  },

  // ── TIER 11: Legendary (76–88) — Multi-Move Extreme ────────
  {
    id: 76,
    fen: '2r3k1/p4ppp/1p6/3N4/8/8/PP2QPPP/4R1K1 w - - 0 1',
    solution: ['Ne7+', 'Kh8', 'Qe6'],
    title: 'Knight Fork Trap',
    description: 'Check with the knight to win a tempo, then dominate with queen centralization! (2 moves)',
    difficulty: 11,
    theme: 'Knight Check + Queen Power'
  },
  {
    id: 77,
    fen: 'r4rk1/pp3ppp/2p5/8/3Pn3/4BN2/PP3PPP/R2QR1K1 w - - 0 1',
    solution: ['Bd2', 'Nc3', 'Bxc3'],
    title: 'Trap the Knight',
    description: 'Retreat the bishop to lure the knight into a trap, then capture it cleanly! (2 moves)',
    difficulty: 11,
    theme: 'Piece Trap'
  },
  {
    id: 78,
    fen: 'r2q1rk1/ppp2ppp/3b1n2/3Pp3/8/5N2/PPP1BPPP/R1BQ1RK1 w - - 0 1',
    solution: ['dxe6', 'fxe6', 'Ng5', 'Qe7', 'Nxe6'],
    title: 'Pawn Break Sequence',
    description: 'Break through the center, then exploit the weakened pawn chain with a knight invasion! (3 moves)',
    difficulty: 11,
    theme: 'Central Breakthrough'
  },
  {
    id: 79,
    fen: '3r2k1/pp3ppp/2p1bn2/4N3/8/6P1/PPP1PPBP/3R2K1 w - - 0 1',
    solution: ['Nxc6', 'bxc6', 'Bxc6', 'Rb8', 'Bxa8'],
    title: 'Pawn Chain Collapse',
    description: 'Sacrifice the knight to shatter the queenside, then sweep up material with the bishop! (3 moves)',
    difficulty: 11,
    theme: 'Structural Demolition'
  },
  {
    id: 80,
    fen: 'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 1',
    solution: ['Bh6', 'Bxh6', 'Qxh6', 'e5', 'Nd5'],
    title: 'Dragon Slayer II',
    description: 'Exchange the fianchettoed bishop, infiltrate with the queen, then plant the knight on d5! (3 moves)',
    difficulty: 11,
    theme: 'Anti-Dragon Attack'
  },
  {
    id: 81,
    fen: 'r3r1k1/pp3ppp/2p2n2/3p4/3P4/2N2N2/PPP2PPP/R3R1K1 w - - 0 1',
    solution: ['Ne5', 'Nd7', 'Nxd5', 'cxd5', 'Nxd7'],
    title: 'Central Knight Storm',
    description: 'Centralize your knights, win the isolated pawn, then collect material! (3 moves)',
    difficulty: 11,
    theme: 'Knight Domination'
  },
  {
    id: 82,
    fen: '2r2rk1/pp3ppp/2n1p3/3pP3/3P4/2PB1N2/PP3PPP/R4RK1 w - - 0 1',
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5'],
    title: 'Greek Gift Classic',
    description: 'The classic bishop sacrifice on h7 followed by knight check and queen attack! (3 moves)',
    difficulty: 11,
    theme: 'Greek Gift Sacrifice'
  },
  {
    id: 83,
    fen: 'r2q1rk1/ppp1bppp/2n1p3/3pN3/3P1B2/2P5/PP2QPPP/R3R1K1 w - - 0 1',
    solution: ['Nxc6', 'bxc6', 'Qe5', 'f6', 'Qg3'],
    title: 'Positional Crush',
    description: 'Exchange the powerfully placed knight, then redirect the queen for a devastating kingside attack! (3 moves)',
    difficulty: 11,
    theme: 'Piece Redirection'
  },
  {
    id: 84,
    fen: 'r4rk1/ppp2ppp/3q1n2/3p4/3P4/2NBPN2/PPP2PPP/R2Q1RK1 w - - 0 1',
    solution: ['Ne5', 'Qe7', 'f4', 'Nd7', 'Nxd7', 'Qxd7', 'Qh5'],
    title: 'Relentless Pressure',
    description: 'Centralize the knight, push the f-pawn, trade pieces, then pivot the queen for a kingside assault! (4 moves)',
    difficulty: 11,
    theme: 'Slow Buildup'
  },
  {
    id: 85,
    fen: 'r2q1rk1/pp2bppp/2n1pn2/3p4/3P1B2/2NBPN2/PPP2PPP/R2QK2R w KQ - 0 1',
    solution: ['O-O', 'Ne4', 'Bxe4', 'dxe4', 'Nd2', 'f5', 'Nxe4'],
    title: 'Castle Then Strike',
    description: 'Secure the king, trade pieces to open lines, then win the advanced pawn! (4 moves)',
    difficulty: 11,
    theme: 'Methodical Attack'
  },
  {
    id: 86,
    fen: '2rq1rk1/pp2ppbp/2np1np1/8/3PP3/2N2N2/PP2BPPP/R1BQR1K1 w - - 0 1',
    solution: ['d5', 'Ne5', 'Nxe5', 'dxe5', 'Bc4'],
    title: 'Central Pawn Roller',
    description: 'Push the d-pawn to displace the knight, exchange favorably, then activate the bishop! (3 moves)',
    difficulty: 11,
    theme: 'Pawn Center Advance'
  },
  {
    id: 87,
    fen: 'r1bq1rk1/ppp1npbp/3p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQ1RK1 w - - 0 1',
    solution: ['Bg5', 'h6', 'Be3', 'Ng4', 'Bd2'],
    title: 'Patience Pays',
    description: 'Maneuver the bishop to provoke weaknesses, then reposition for a better diagonal! (3 moves)',
    difficulty: 11,
    theme: 'Bishop Maneuver'
  },
  {
    id: 88,
    fen: 'r1b2rk1/ppq1bppp/2n1pn2/2pp4/3P1B2/2NBPN2/PPP2PPP/R2Q1RK1 w - - 0 1',
    solution: ['dxc5', 'Bxc5', 'Bxc5', 'Qxc5', 'Na4'],
    title: 'Exchange & Exploit',
    description: 'Trade in the center, exchange bishops, then fork the queen and c5 square with the knight! (3 moves)',
    difficulty: 11,
    theme: 'Tactical Exchange'
  },

  // ── TIER 12: Impossible (89–100) — Maximum Difficulty ──────
  {
    id: 89,
    fen: 'r3r1k1/ppq2ppp/2p1bn2/3pN3/3P1B2/2P1P3/PPQ2PPP/R3R1K1 w - - 0 1',
    solution: ['Nxc6', 'bxc6', 'Bxf6', 'gxf6', 'Qf5'],
    title: 'Double Piece Sacrifice',
    description: 'Sacrifice the knight AND bishop to rip apart the kingside pawn cover! (3 moves)',
    difficulty: 12,
    theme: 'Double Sacrifice'
  },
  {
    id: 90,
    fen: 'r4rk1/pp2qppp/2n1p3/2ppP3/3P4/P1PB1N2/1P3PPP/R2QR1K1 w - - 0 1',
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Qf8', 'Qxf7+'],
    title: 'Greek Gift Fury',
    description: 'The full Greek Gift pattern: bishop sac, knight check, queen infiltration for the kill! (4 moves)',
    difficulty: 12,
    theme: 'Classic Greek Gift'
  },
  {
    id: 91,
    fen: 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2NBPN2/PPP1QPPP/R1B1K2R w KQ - 0 1',
    solution: ['dxc5', 'Bxc5', 'e4', 'dxe4', 'Nxe4', 'Nxe4', 'Qxe4'],
    title: 'Central Explosion',
    description: 'Trigger a tactical sequence of captures in the center to emerge with a dominant queen! (4 moves)',
    difficulty: 12,
    theme: 'Central Liquidation'
  },
  {
    id: 92,
    fen: 'r2q1rk1/pp1n1ppp/2p1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 1',
    solution: ['cxd5', 'exd5', 'Nh4', 'Re8', 'Nf5'],
    title: 'Knight Redeployment',
    description: 'Exchange center pawns, swing the knight to h4 then plant it on f5 for maximum pressure! (3 moves)',
    difficulty: 12,
    theme: 'Knight Maneuver'
  },
  {
    id: 93,
    fen: 'r1b2rk1/ppq1bppp/2nppn2/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 1',
    solution: ['O-O-O', 'a6', 'g4', 'b5', 'g5', 'Nd7', 'Nd5'],
    title: 'Yugoslav Attack',
    description: 'Castle long, launch the g-pawn storm, drive back the knight, plant yours on d5! (4 moves)',
    difficulty: 12,
    theme: 'Kingside Pawn Storm'
  },
  {
    id: 94,
    fen: 'r2qk2r/pp2bppp/2n1pn2/3p4/3P1B2/2PB1N2/PP2QPPP/RN2K2R w KQkq - 0 1',
    solution: ['Nbd2', 'O-O', 'O-O', 'Re8', 'Ne5', 'Nxe5', 'Bxe5'],
    title: 'Complete Setup',
    description: 'Develop the final knight, castle, then plant a knight on e5 and exchange favorably! (4 moves)',
    difficulty: 12,
    theme: 'Harmonious Development'
  },
  {
    id: 95,
    fen: 'r1b1r1k1/pp3ppp/2n1pn2/q1bp4/3P4/2NBPN2/PP2BPPP/R1BQ1RK1 w - - 0 1',
    solution: ['dxc5', 'Bxc5', 'b4', 'Bxb4', 'Nxd5', 'exd5', 'Bxd5'],
    title: 'Pawn Lever Masterclass',
    description: 'Use a pawn lever to deflect the bishop, then win the center pawn with a knight sacrifice! (4 moves)',
    difficulty: 12,
    theme: 'Pawn Lever'
  },
  {
    id: 96,
    fen: 'r3r1k1/pp2qppp/2n1p3/2ppP1B1/3P4/2P2N2/PP2QPPP/R3R1K1 w - - 0 1',
    solution: ['Bxf6', 'Qxf6', 'Qe3', 'Qe7', 'Qh6', 'f5', 'exf6'],
    title: 'Dark Square Domination',
    description: 'Exchange the bishop to weaken the dark squares, infiltrate with the queen, then crash through! (4 moves)',
    difficulty: 12,
    theme: 'Color Complex Weakness'
  },
  {
    id: 97,
    fen: 'r1bqk2r/ppp1nppp/3p4/3Pp3/2P1P1b1/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 1',
    solution: ['h3', 'Bxf3', 'Qxf3', 'Ng6', 'Bd3', 'Be7', 'O-O'],
    title: 'Win the Bishop Pair',
    description: 'Force the bishop to commit, capture it, develop smoothly, and castle with the two bishops! (4 moves)',
    difficulty: 12,
    theme: 'Bishop Pair Advantage'
  },
  {
    id: 98,
    fen: 'r2q1rk1/1pp2ppp/p1n1pn2/3p4/1bPP4/2N1PN2/PPB2PPP/R1BQ1RK1 w - - 0 1',
    solution: ['a3', 'Ba5', 'cxd5', 'exd5', 'Bd3', 'Re8', 'Bc2'],
    title: 'Slow Squeeze',
    description: 'Chase the bishop, open the center, then reposition your pieces for maximum pressure! (4 moves)',
    difficulty: 12,
    theme: 'Positional Grinding'
  },
  {
    id: 99,
    fen: 'r2qr1k1/pp3ppp/2p1bn2/3pN3/3P1B2/2P1P3/PP3PPP/R2QR1K1 w - - 0 1',
    solution: ['Nxf7', 'Kxf7', 'Bxc7', 'Qd7', 'Bf4', 'Nd7', 'Qh5+', 'Kf8', 'Qxh7'],
    title: 'The Immortal Exchange',
    description: 'Sacrifice the knight on f7, win the queen, reposition, then launch a devastating 5-move king hunt! (5 moves)',
    difficulty: 12,
    theme: 'Sacrifice + King Hunt'
  },
  {
    id: 100,
    fen: 'r1bq1rk1/pp2nppp/2n1p3/2ppP3/3P4/P1PB1N2/1P3PPP/R1BQR1K1 w - - 0 1',
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg6', 'Qd3+', 'f5', 'exf6', 'Nxf6', 'Qg3'],
    title: 'Puzzle 100: The Final Boss',
    description: 'Bishop sacrifice, knight check, queen infiltration, pawn breakthrough — a 5-move masterpiece to claim grandmaster glory! (5 moves)',
    difficulty: 12,
    theme: 'Ultimate Combination'
  }
];

export default chessPuzzles;
