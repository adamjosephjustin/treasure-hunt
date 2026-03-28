import { useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../utils/audio';
import '../styles/Chess.css';

const PIECE_UNICODE = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default function ChessBoard({ fen, solution, playerColor = 'w', onSolved, onFailed }) {
  const [game, setGame] = useState(() => new Chess(fen));
  const [selected, setSelected] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [status, setStatus] = useState('playing'); // playing | correct | wrong | brilliant
  const [moveIndex, setMoveIndex] = useState(0);
  const [brilliantMove, setBrilliantMove] = useState(null); // SAN of the brilliant move

  const legalMoves = useMemo(() => {
    if (!selected) return [];
    return game.moves({ square: selected, verbose: true }).map(m => m.to);
  }, [selected, game]);

  const handleSquareClick = (square) => {
    if (status === 'correct' || status === 'wrong') return;

    const piece = game.get(square);

    if (piece && piece.color === playerColor) {
      setSelected(square);
      audioManager.playSFX('click');
      return;
    }

    if (selected) {
      const legalMovesVerbose = game.moves({ square: selected, verbose: true });
      const targetMove = legalMovesVerbose.find(m => m.to === square);

      if (targetMove) {
        const expectedSAN = solution[moveIndex];
        const gameCopy = new Chess(game.fen());
        const madeMove = gameCopy.move({ from: selected, to: square, promotion: 'q' });

        if (madeMove && madeMove.san === expectedSAN) {
          // ✅ Correct move — show "Brilliant!" label
          audioManager.playSFX('correct');
          game.move({ from: selected, to: square, promotion: 'q' });
          setGame(new Chess(game.fen()));
          setLastMove({ from: selected, to: square });
          setSelected(null);
          setBrilliantMove(madeMove.san);

          // Flash brilliant then clear
          setTimeout(() => setBrilliantMove(null), 1200);

          if (moveIndex + 1 >= solution.length) {
            setStatus('correct');
            setTimeout(() => onSolved?.(), 2000);
          } else {
            const nextMove = solution[moveIndex + 1];
            setTimeout(() => {
              game.move(nextMove);
              setGame(new Chess(game.fen()));
              setMoveIndex(moveIndex + 2);
            }, 800);
          }
        } else {
          // ❌ Wrong move
          audioManager.playSFX('wrong');
          setStatus('wrong');
          setTimeout(() => {
            setStatus('playing');
            setGame(new Chess(fen));
            setMoveIndex(0);
            setSelected(null);
            setLastMove(null);
            setBrilliantMove(null);
          }, 1500);
          onFailed?.();
        }
      } else {
        setSelected(null);
      }
    }
  };

  const board = game.board();

  return (
    <div className={`chessboard-wrapper chessboard--${status}`}>

      {/* ── Brilliant Move Label (outside board, above) ── */}
      <AnimatePresence>
        {brilliantMove && (
          <motion.div
            className="chess-brilliant"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <span className="chess-brilliant__icon">✦</span>
            <span className="chess-brilliant__text">Brilliant Move!</span>
            <span className="chess-brilliant__san">{brilliantMove}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chessboard">
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

        <div className="chessboard__file-labels">
          <div className="chessboard__spacer" />
          {FILES.map(f => <span key={f}>{f}</span>)}
        </div>
      </div>

      {/* ── Wrong Move Label (outside board, below) ── */}
      <AnimatePresence>
        {status === 'correct' && (
          <motion.div className="chess-feedback chess-feedback--correct"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            🏆 Puzzle Complete!
          </motion.div>
        )}
        {status === 'wrong' && (
          <motion.div className="chess-feedback chess-feedback--wrong"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: [0, -8, 8, -8, 8, 0] }}
            transition={{ duration: 0.5 }}>
            ❌ Not quite — try again!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
