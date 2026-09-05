"use client";

import { useEffect, useRef, useState } from "react";

const MAX_SECONDS = 60;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export function VoiceRecorder({
  disabled,
  labels,
  onRecorded,
}: {
  disabled?: boolean;
  labels: {
    recordVoice: string;
    stopRecording: string;
    recording: string;
    voiceUnsupported: string;
    voicePermissionDenied: string;
  };
  onRecorded: (blob: Blob) => void | Promise<void>;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  function cleanupStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => () => cleanupStream(), []);

  async function start() {
    setError("");
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError(labels.voiceUnsupported);
      return;
    }
    const mimeType = pickMimeType();
    if (!mimeType || typeof MediaRecorder === "undefined") {
      setError(labels.voiceUnsupported);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType.split(";")[0] });
        cleanupStream();
        setRecording(false);
        setSeconds(0);
        if (blob.size > 0) void onRecorded(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next >= MAX_SECONDS) {
            mediaRecorderRef.current?.state === "recording" && mediaRecorderRef.current.stop();
          }
          return next;
        });
      }, 1000);
    } catch {
      cleanupStream();
      setError(labels.voicePermissionDenied);
    }
  }

  function stop() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      cleanupStream();
      setRecording(false);
      setSeconds(0);
    }
  }

  return (
    <div className="voice-recorder">
      {recording ? (
        <button
          type="button"
          className="btn btn-ghost voice-btn recording"
          onClick={stop}
          disabled={disabled}
        >
          {labels.stopRecording} · {seconds}s
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-ghost voice-btn"
          onClick={() => void start()}
          disabled={disabled}
        >
          {labels.recordVoice}
        </button>
      )}
      {recording && <span className="voice-pulse">{labels.recording}</span>}
      {error && <p className="hint">{error}</p>}
    </div>
  );
}
