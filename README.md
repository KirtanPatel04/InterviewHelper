# Meeting Career Coach

A Vite + React TypeScript demo that captures tab audio (with permission), performs mocked live transcription with pause
segmentation, and sends each finalized segment to a resume-aware AI helper. Use this only in meetings where everyone has
consented to recording.

## Features
- Upload a `.txt` or `.pdf` resume (PDF uses a placeholder extractor; plug in `pdfjs-dist` for real parsing).
- Start/stop tab-audio capture with clear "Recording ON/OFF" indicators.
- Live transcript panel that shows streaming text; segments reset after ~1.5–2 seconds of silence.
- AI chat panel that posts each spoken question plus a mocked resume-aware reply.
- Minimal Express backend stub at `/api/chat` that echoes a resume-tailored answer (replace with your AI provider and
  `process.env.AI_API_KEY`).

## Getting started
1. Install dependencies (frontend + backend packages are in the same `package.json`):
   ```bash
   npm install
   ```
2. Start the backend stub (optional if you only want the mocked front-end fallback):
   ```bash
   npm run server
   ```
3. In another terminal, start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open the shown URL in a Chromium-based browser. Click **Upload Resume** to load a `.txt` or `.pdf`, then click
   **Start Listening** and share the tab with the audio you want captured.

## Notes on audio capture and privacy
- The app uses `navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })` to capture tab audio; video tracks
  are stopped immediately. The browser will always show a permission prompt—you must explicitly allow tab audio.
- A green pill label shows whether recording is on or off. Stop listening anytime with the **Stop Listening** button.
- Only use this on calls where **every participant has consented** to being recorded.

## Where to plug in real AI and speech-to-text
- **Speech-to-text**: `useAudioTranscriber` currently emits mocked transcript snippets. Swap `transcribeAudioChunk`
  with a real STT call or `webkitSpeechRecognition`.
- **AI**: `src/services/aiClient.ts` calls `/api/chat` when available; replace the endpoint in `server.js` with your AI
  provider, using `process.env.AI_API_KEY` for secrets.
- **PDF parsing**: `extractPdfTextPlaceholder` in `ResumeUploader` is a stub—replace with `pdfjs-dist` text extraction
  for production use.
