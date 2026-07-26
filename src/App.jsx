import { Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './components/ProgressContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Game from './pages/Game';
import Level from './pages/Level';
import ChessMap from './pages/ChessMap';
import ChessPuzzle from './pages/ChessPuzzle';
import StoryBook from './pages/StoryBook';
import ThurupLobby from './pages/ThurupLobby';
import ThurupRoom from './pages/ThurupRoom';
import ThurupGamePage from './pages/ThurupGame';
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
          <Route path="/storybook" element={<StoryBook />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Thurup routes outside the main Layout (has its own UI) */}
        <Route path="/thurup" element={<ThurupLobby />} />
        <Route path="/thurup/room/:roomId" element={<ThurupRoom />} />
        <Route path="/thurup/game/:gameId" element={<ThurupGamePage />} />
      </Routes>
    </ProgressProvider>
  );
}

