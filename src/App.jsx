import { Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './components/ProgressContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Game from './pages/Game';
import Level from './pages/Level';
import ChessMap from './pages/ChessMap';
import ChessPuzzle from './pages/ChessPuzzle';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ProgressProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/level/:id" element={<Level />} />
          <Route path="/chess" element={<ChessMap />} />
          <Route path="/chess/:id" element={<ChessPuzzle />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ProgressProvider>
  );
}

