import React from 'react';
import { motion } from 'motion/react';
import { Play, Share2, Download, Quote } from 'lucide-react';
import { cn } from '../lib/utils';
import { CoverStyle } from '../lib/gemini';

interface CoverProps {
  transcript: string;
  summary: string;
  style: CoverStyle;
  audioUrl: string;
}

export function Cover({ transcript, summary, style, audioUrl }: CoverProps) {
  const playAudio = () => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const fontClass = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono'
  }[style.fontFamily] || 'font-sans';

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative w-full max-w-md aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col p-8",
        "bg-gradient-to-br",
        style.bgGradient
      )}
    >
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-black/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col">
          <span className={cn("text-xs uppercase tracking-[0.2em] font-bold opacity-70", style.textColor)}>
            Voice Memo
          </span>
          <span className={cn("text-sm font-medium opacity-90", style.textColor)}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </span>
        </div>
        <div className={cn("text-4xl", style.textColor)}>{style.emoji}</div>
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col justify-center gap-6 z-10">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "text-4xl md:text-5xl font-black leading-tight tracking-tight",
            fontClass,
            style.textColor
          )}
        >
          {summary}
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <Quote className={cn("absolute -top-4 -left-4 w-8 h-8 opacity-20", style.textColor)} />
          <p className={cn(
            "text-lg md:text-xl font-medium leading-relaxed opacity-80 line-clamp-4 italic",
            style.textColor
          )}>
            "{transcript}"
          </p>
        </motion.div>
      </div>

      {/* Footer / Controls */}
      <div className="mt-auto flex items-center justify-between z-10 pt-6 border-t border-white/10">
        <button
          onClick={playAudio}
          className={cn(
            "group flex items-center gap-3 px-6 py-3 rounded-full transition-all active:scale-95",
            "bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20"
          )}
        >
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-white", style.bgGradient.split(' ')[0].replace('from-', 'text-'))}>
            <Play className="w-5 h-5 fill-current ml-1" />
          </div>
          <span className={cn("font-bold text-sm", style.textColor)}>Listen Now</span>
        </button>

        <div className="flex gap-2">
          <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all">
            <Share2 className={cn("w-5 h-5", style.textColor)} />
          </button>
          <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all">
            <Download className={cn("w-5 h-5", style.textColor)} />
          </button>
        </div>
      </div>

      {/* Vibe Badge */}
      <div className="absolute top-1/2 -right-8 rotate-90 origin-center">
        <span className={cn(
          "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-sm border border-white/10",
          style.textColor
        )}>
          {style.vibe}
        </span>
      </div>
    </motion.div>
  );
}
