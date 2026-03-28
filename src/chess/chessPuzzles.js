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
  }
];

export default chessPuzzles;
