import { useCallback, useMemo, useState } from 'react';
import AudioController from './components/AudioController';
import ChatWindow from './components/ChatWindow';
import LiveTranscriptPanel from './components/LiveTranscriptPanel';
import ResumeUploader from './components/ResumeUploader';
import { useAudioTranscriber } from './hooks/useAudioTranscriber';
import { askAI } from './services/aiClient';
import { ChatMessage } from './types';
import './App.css';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleSegment = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setRequestError(null);
      const timestamp = new Date().toLocaleTimeString();
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp,
      };
      addMessage(userMessage);

      setIsThinking(true);
      try {
        const aiReply = await askAI(text, resumeText);
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: aiReply,
          timestamp: new Date().toLocaleTimeString(),
        };
        addMessage(assistantMessage);
      } catch (err) {
        console.error(err);
        setRequestError('The AI service is unavailable right now. Please try again.');
      } finally {
        setIsThinking(false);
      }
    },
    [addMessage, resumeText],
  );

  const { startListening, stopListening, listening, error: audioError, currentTranscript } = useAudioTranscriber({
    onSegment: handleSegment,
  });

  const combinedError = useMemo(() => audioError || requestError, [audioError, requestError]);
  const resumeStatus = resumeText
    ? `Resume loaded (${resumeText.length} characters${resumeFileName ? ` from ${resumeFileName}` : ''}).`
    : 'No resume loaded yet.';

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="app__eyebrow">Meeting Career Coach</p>
          <h1 className="app__title">Live transcription + AI answers based on your resume.</h1>
          <p className="app__description">
            This demo listens to tab audio with your explicit permission, detects pauses, and sends each spoken segment
            to a mock AI along with your uploaded resume for tailored help. Use only in meetings where everyone has
            consented to being recorded.
          </p>
        </div>
      </header>

      <section className="controls">
        <ResumeUploader
          onResumeLoaded={(text, name) => {
            setResumeText(text);
            setResumeFileName(name);
          }}
        />

        <div className="controls__actions">
          <AudioController listening={listening} onStart={startListening} onStop={stopListening} />
          <div className="controls__status">
            <p className="status-line">{resumeStatus}</p>
            <p className="status-note">Please only use this with meetings where all participants have consented to audio capture.</p>
          </div>
        </div>
      </section>

      {combinedError && <div className="app__error">{combinedError}</div>}

      <main className="app__grid">
        <LiveTranscriptPanel listening={listening} transcript={currentTranscript} />
        <ChatWindow
          messages={messages}
          isThinking={isThinking}
          resumeMissing={!resumeText}
          tipText={!resumeText ? 'Tip: upload your resume for more personalized answers.' : undefined}
        />
      </main>
    </div>
  );
}

export default App;
