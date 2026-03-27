import { useProgress } from './ProgressContext';
import '../styles/ProgressBar.css';

export default function ProgressBar() {
  const { progressPercent, completedLevels, totalLevels } = useProgress();

  return (
    <div className="progress-bar" id="progress-bar">
      <div className="progress-bar__info">
        <span className="progress-bar__label">🌟 Adventure Progress</span>
        <span className="progress-bar__count">
          {completedLevels.size} / {totalLevels}
        </span>
      </div>
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
