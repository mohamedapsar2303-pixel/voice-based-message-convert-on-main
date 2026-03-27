import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Recorder } from './components/Recorder';
import { Cover } from './components/Cover';
import { analyzeVoiceMessage, transcribeAudio, CoverStyle } from './lib/gemini';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';

interface MessageData {
  transcript: string;
  summary: string;
  style: CoverStyle;
  audioUrl: string;
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [messageData, setMessageData] = useState<MessageData | null>(null);

  const handleRecordingComplete = async (blob: Blob) => {
    setLoading(true);
    setLoadingStep('Transcribing your voice...');
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const audioUrl = URL.createObjectURL(blob);

        const transcript = await transcribeAudio(base64Audio, blob.type);
        
        setLoadingStep('Designing your cover...');
        const analysis = await analyzeVoiceMessage(transcript);

        setMessageData({
          transcript,
          summary: analysis.summary,
          style: analysis.style,
          audioUrl
        });
        setLoading(false);
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setLoading(false);
      alert('Failed to process audio. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <header className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/70">AI Powered</span>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-4"
          >
            VOX<span className="text-indigo-500">COVER</span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/40 max-w-md mx-auto"
          >
            Turn your voice messages into stunning visual cards instantly.
          </motion.p>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-20"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
              </div>
              <p className="text-xl font-medium text-white/80 animate-pulse">{loadingStep}</p>
            </motion.div>
          ) : messageData ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="flex flex-col items-center gap-8 w-full"
            >
              <Cover {...messageData} />
              <button
                onClick={() => setMessageData(null)}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-all group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Record another message
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="recorder"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="w-full max-w-md"
            >
              <Recorder onRecordingComplete={handleRecordingComplete} />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-20 text-white/20 text-xs uppercase tracking-[0.3em] font-bold">
          Built with Gemini 3.0 • 2026
        </footer>
      </main>
    </div>
  );
}
