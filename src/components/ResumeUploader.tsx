import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import './ResumeUploader.css';

type ResumeUploaderProps = {
  onResumeLoaded: (text: string, fileName: string) => void;
};

const SUPPORTED_TYPES = ['text/plain', 'application/pdf'];

function extractPdfTextPlaceholder(arrayBuffer: ArrayBuffer) {
  // Placeholder for PDF extraction. Integrate pdfjs-dist here for real parsing.
  const bytes = new Uint8Array(arrayBuffer).subarray(0, 60);
  const preview = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join('')
    .replace(/[^\x20-\x7E]/g, '');
  return `PDF text placeholder. Preview: ${preview.slice(0, 80)}...`;
}

export default function ResumeUploader({ onResumeLoaded }: ResumeUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError('Please upload a .txt or .pdf file.');
      return;
    }

    setError(null);
    setFileName(file.name);

    if (file.type === 'text/plain') {
      const text = await file.text();
      onResumeLoaded(text, file.name);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (result instanceof ArrayBuffer) {
        const placeholderText = extractPdfTextPlaceholder(result);
        onResumeLoaded(placeholderText, file.name);
      }
    };
    reader.onerror = () => setError('Could not read the PDF file.');
    reader.readAsArrayBuffer(file);
  };

  const onInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await handleFile(file);
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  return (
    <div className="resume-uploader" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
      <div className="resume-uploader__header">
        <p className="resume-title">Upload Resume</p>
        <p className="resume-subtitle">Use your resume as context for better answers.</p>
      </div>
      <div className="resume-uploader__body" onClick={() => inputRef.current?.click()}>
        <p className="resume-prompt">Drag & drop or click to upload (.txt or .pdf)</p>
        <p className="resume-status">{fileName ? `Loaded: ${fileName}` : 'No resume loaded yet.'}</p>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.pdf,text/plain,application/pdf"
          className="resume-input"
          onChange={onInputChange}
        />
      </div>
      {error && <div className="resume-error">{error}</div>}
    </div>
  );
}
