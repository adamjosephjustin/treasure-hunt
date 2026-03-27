import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProgressBar from './ProgressBar';
import StatsBar from './StatsBar';
import SoundToggle from './SoundToggle';
import '../styles/StatsBar.css';
import '../styles/SoundToggle.css';

export default function Layout() {
  const location = useLocation();
  const showHUD = location.pathname !== '/';

  return (
    <>
      {showHUD && (
        <div className="layout__hud">
          <ProgressBar />
          <StatsBar />
        </div>
      )}
      <AnimatePresence mode="wait">
        <Outlet key={location.pathname} />
      </AnimatePresence>
      <SoundToggle />
    </>
  );
}
