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
  }
];

export default chessPuzzles;
