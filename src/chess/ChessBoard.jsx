import { useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Chess.css';

const PIECE_UNICODE = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default function ChessBoard({ fen, solution, playerColor = 'w', onSolved, onFailed }) {
  const [game, setGame] = useState(() => new Chess(fen));
  const [selected, setSelected] = useState(null); // e.g. 'e2'
  const [lastMove, setLastMove] = useState(null);
  const [status, setStatus] = useState('playing'); // playing | correct | wrong
  const [moveIndex, setMoveIndex] = useState(0);

  // Get legal moves for selected square
  const legalMoves = useMemo(() => {
    if (!selected) return [];
    return game.moves({ square: selected, verbose: true }).map(m => m.to);
  }, [selected, game]);

  const handleSquareClick = (square) => {
    if (status !== 'playing') return;

    const piece = game.get(square);

    // If clicking own piece, select it
    if (piece && piece.color === playerColor) {
      setSelected(square);
      return;
    }

    // If a piece is selected and clicking a valid target, attempt move
    if (selected) {
      const legalMovesVerbose = game.moves({ square: selected, verbose: true });
      const targetMove = legalMovesVerbose.find(m => m.to === square);

      if (targetMove) {
        // Check if this move matches the expected solution
        const expectedSAN = solution[moveIndex];

        // Make the move temporarily to get its SAN
        const gameCopy = new Chess(game.fen());
        const madeMove = gameCopy.move({ from: selected, to: square, promotion: 'q' });

        if (madeMove && madeMove.san === expectedSAN) {
          // Correct move!
          game.move({ from: selected, to: square, promotion: 'q' });
          setGame(new Chess(game.fen()));
          setLastMove({ from: selected, to: square });
          setSelected(null);

          if (moveIndex + 1 >= solution.length) {
            // Puzzle solved!
            setStatus('correct');
            setTimeout(() => onSolved?.(), 1500);
          } else {
            // More moves needed — play the opponent's reply
            const nextMove = solution[moveIndex + 1];
            setTimeout(() => {
              game.move(nextMove);
              setGame(new Chess(game.fen()));
              setMoveIndex(moveIndex + 2);
            }, 600);
          }
        } else {
          // Wrong move
          setStatus('wrong');
          setTimeout(() => {
            setStatus('playing');
            // Reset board to original position
            setGame(new Chess(fen));
            setMoveIndex(0);
            setSelected(null);
            setLastMove(null);
          }, 1500);
          onFailed?.();
        }
      } else {
        setSelected(null);
      }
    }
  };

  const board = game.board(); // 8x8 array

  return (
    <div className={`chessboard-wrapper chessboard--${status}`}>
      <div className="chessboard">
        {/* Rank labels (left) */}
        <div className="chessboard__rank-labels">
          {RANKS.map(r => <span key={r}>{r}</span>)}
        </div>

        <div className="chessboard__grid">
          {board.map((row, ri) =>
            row.map((piece, ci) => {
              const square = FILES[ci] + RANKS[ri];
              const isLight = (ri + ci) % 2 === 0;
              const isSelected = selected === square;
              const isLegal = legalMoves.includes(square);
              const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);

              return (
                <motion.div
                  key={square}
                  className={[
                    'chessboard__square',
                    isLight ? 'chessboard__square--light' : 'chessboard__square--dark',
                    isSelected ? 'chessboard__square--selected' : '',
                    isLegal ? 'chessboard__square--legal' : '',
                    isLastMove ? 'chessboard__square--last-move' : ''
                  ].join(' ')}
                  onClick={() => handleSquareClick(square)}
                  whileTap={{ scale: 0.95 }}
                >
                  {piece && (
                    <span className={`chessboard__piece ${piece.color === 'w' ? 'chessboard__piece--white' : 'chessboard__piece--black'}`}>
                      {PIECE_UNICODE[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}
                    </span>
                  )}
                  {isLegal && !piece && <div className="chessboard__dot" />}
                  {isLegal && piece && <div className="chessboard__capture-ring" />}
                </motion.div>
              );
            })
          )}
        </div>

        {/* File labels (bottom) */}
        <div className="chessboard__file-labels">
          <div className="chessboard__spacer" />
          {FILES.map(f => <span key={f}>{f}</span>)}
        </div>
      </div>

      <AnimatePresence>
        {status === 'correct' && (
          <motion.div className="chess-feedback chess-feedback--correct"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            ✅ Brilliant Move!
          </motion.div>
        )}
        {status === 'wrong' && (
          <motion.div className="chess-feedback chess-feedback--wrong"
            initial={{ x: [-10, 10, -10, 10, 0] }} transition={{ duration: 0.4 }}>
            ❌ Not quite — try again!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
