import { useCallback, useEffect, useRef, useState } from 'react';

type UseAudioTranscriberOptions = {
  onSegment: (text: string) => void;
  pauseDurationMs?: number;
  silenceThreshold?: number;
};

const PAUSE_DEFAULT_MS = 1700;
const SILENCE_THRESHOLD_DEFAULT = 0.02;
const MOCK_SNIPPETS = [
  'capturing your point',
  'noting the question',
  'hearing the discussion',
  'transcribing the details',
  'listening closely',
];

async function transcribeAudioChunk(): Promise<string> {
  const snippet = MOCK_SNIPPETS[Math.floor(Math.random() * MOCK_SNIPPETS.length)];
  // This is a placeholder for a real speech-to-text call.
  return `Mocked text ${snippet}`;
}

export function useAudioTranscriber(options: UseAudioTranscriberOptions) {
  const { pauseDurationMs = PAUSE_DEFAULT_MS, silenceThreshold = SILENCE_THRESHOLD_DEFAULT } = options;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number>();
  const lastTimestampRef = useRef<number>(0);
  const silenceTimerRef = useRef<number>(0);
  const isTalkingRef = useRef(false);
  const transcriptBufferRef = useRef('');
  const lastSnippetTimeRef = useRef<number>(0);
  const onSegmentRef = useRef(options.onSegment);

  useEffect(() => {
    onSegmentRef.current = options.onSegment;
  }, [options.onSegment]);

  const stopListening = useCallback(() => {
    rafIdRef.current && cancelAnimationFrame(rafIdRef.current);
    analyserRef.current?.disconnect();
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
    lastTimestampRef.current = 0;
    silenceTimerRef.current = 0;
    isTalkingRef.current = false;
    lastSnippetTimeRef.current = 0;
    transcriptBufferRef.current = '';
    setCurrentTranscript('');

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setListening(false);
  }, []);

  const emitSegment = useCallback(() => {
    const readyText = transcriptBufferRef.current.trim();
    if (!readyText) return;
    onSegmentRef.current?.(readyText);
    transcriptBufferRef.current = '';
    setCurrentTranscript('');
    isTalkingRef.current = false;
    silenceTimerRef.current = 0;
  }, []);

  const processAudio = useCallback(
    async (timestamp: number) => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      analyser.getByteTimeDomainData(dataArray);

      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i += 1) {
        const value = (dataArray[i] - 128) / 128;
        sumSquares += value * value;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);

      const previousTimestamp = lastTimestampRef.current || timestamp;
      const delta = timestamp - previousTimestamp;
      lastTimestampRef.current = timestamp;

      if (rms > silenceThreshold) {
        silenceTimerRef.current = 0;
        if (!isTalkingRef.current) {
          isTalkingRef.current = true;
        }

        const now = performance.now();
        if (now - lastSnippetTimeRef.current > 600) {
          lastSnippetTimeRef.current = now;
          const snippet = await transcribeAudioChunk();
          transcriptBufferRef.current = `${transcriptBufferRef.current} ${snippet}`.trim();
          setCurrentTranscript(transcriptBufferRef.current);
        }
      } else if (isTalkingRef.current) {
        silenceTimerRef.current += delta;
        if (silenceTimerRef.current >= pauseDurationMs && transcriptBufferRef.current.trim()) {
          emitSegment();
        }
      }

      rafIdRef.current = requestAnimationFrame(processAudio);
    },
    [emitSegment, pauseDurationMs, silenceThreshold],
  );

  const startListening = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;

      // We do not need video for transcription, so immediately disable it.
      stream.getVideoTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const dataArray = new Uint8Array(analyser.fftSize);

      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      setListening(true);
      rafIdRef.current = requestAnimationFrame(processAudio);
    } catch (err) {
      console.error(err);
      setError('Unable to start listening. Please allow tab audio capture.');
      stopListening();
    }
  }, [processAudio, stopListening]);

  useEffect(() => () => stopListening(), [stopListening]);

  return {
    startListening,
    stopListening,
    listening,
    error,
    currentTranscript,
  };
}
