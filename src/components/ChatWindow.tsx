import { ChatMessage } from '../types';
import './ChatWindow.css';

interface ChatWindowProps {
  messages: ChatMessage[];
  isThinking: boolean;
  resumeMissing?: boolean;
  tipText?: string;
}

export function ChatWindow({ messages, isThinking, resumeMissing, tipText }: ChatWindowProps) {
  return (
    <div className="chat-window">
      <div className="panel-header">
        <div>
          <p className="panel-eyebrow">AI Chat</p>
          <h2 className="panel-title">Answers tailored to your resume</h2>
        </div>
      </div>
      {resumeMissing && tipText && <div className="chat-tip">{tipText}</div>}
      <div className="chat-body">
        {messages.map((message) => (
          <div key={message.id} className={`chat-row chat-row--${message.role}`}>
            <div className="chat-meta">
              <span className="chat-role">{message.role === 'user' ? 'User (from audio)' : 'AI'}</span>
              <span className="chat-time">{message.timestamp}</span>
            </div>
            <div className="chat-bubble">{message.content}</div>
          </div>
        ))}
        {isThinking && <div className="chat-thinking">AI is thinking…</div>}
        {!messages.length && <div className="chat-empty">Speak a question, pause, and watch it appear here.</div>}
      </div>
    </div>
  );
}

export default ChatWindow;
