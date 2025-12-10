import './AudioController.css';

interface AudioControllerProps {
  listening: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function AudioController({ listening, onStart, onStop }: AudioControllerProps) {
  return (
    <div className="audio-controls">
      <div className="audio-controls__buttons">
        <button className="btn btn--primary" onClick={onStart} disabled={listening}>
          Start Listening
        </button>
        <button className="btn btn--ghost" onClick={onStop} disabled={!listening}>
          Stop Listening
        </button>
      </div>
      <div className={`status-chip ${listening ? 'status-chip--on' : 'status-chip--off'}`}>
        {listening ? 'Recording ON' : 'Recording OFF'}
      </div>
    </div>
  );
}

export default AudioController;
