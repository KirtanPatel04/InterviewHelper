import './LiveTranscriptPanel.css';

type LiveTranscriptPanelProps = {
  listening: boolean;
  transcript: string;
};

export default function LiveTranscriptPanel({ listening, transcript }: LiveTranscriptPanelProps) {
  return (
    <div className="live-panel">
      <div className="panel-header">
        <div>
          <p className="panel-eyebrow">Live Transcript</p>
          <h2 className="panel-title">Streaming what you say right now</h2>
        </div>
        <div className={`status-chip ${listening ? 'status-chip--on' : 'status-chip--off'}`}>
          {listening ? 'Listening…' : 'Not Listening'}
        </div>
      </div>
      <div className="live-panel__body">
        {transcript ? <p className="live-text">{transcript}</p> : <p className="live-placeholder">Waiting for speech…</p>}
      </div>
      <p className="live-hint">Segments reset after ~1.5–2s of silence.</p>
    </div>
  );
}
