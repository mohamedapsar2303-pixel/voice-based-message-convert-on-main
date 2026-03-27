import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Wand2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export function Recorder({ onRecordingComplete }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Please allow microphone access to record messages.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Record Your Message</h2>
        <p className="text-white/60 text-sm">Speak your mind, we'll do the rest.</p>
      </div>

      <div className="relative flex items-center justify-center w-32 h-32">
        <AnimatePresence mode="wait">
          {!audioUrl ? (
            <motion.button
              key="record-btn"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              {isRecording ? <Square className="text-white w-8 h-8" /> : <Mic className="text-white w-10 h-10" />}
              
              {isRecording && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-red-500 rounded-full -z-10"
                />
              )}
            </motion.button>
          ) : (
            <motion.div
              key="audio-preview"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <audio src={audioUrl} controls className="hidden" id="preview-audio" />
              <div className="flex gap-4">
                <button
                  onClick={() => (document.getElementById('preview-audio') as HTMLAudioElement).play()}
                  className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                >
                  <Play className="text-white w-8 h-8 fill-current" />
                </button>
                <button
                  onClick={reset}
                  className="w-16 h-16 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center transition-all"
                >
                  <Trash2 className="text-red-400 w-8 h-8" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <div className="text-3xl font-mono text-white font-bold tracking-wider">
          {formatTime(duration)}
        </div>

        {audioBlob && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => onRecordingComplete(audioBlob)}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
          >
            <Wand2 className="w-5 h-5" />
            Generate Cover
          </motion.button>
        )}
      </div>
    </div>
  );
}
