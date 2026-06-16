import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface BootScreenProps {
  onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [bootLines, setBootLines] = useState<string[]>([]);

  const startupSequence = [
    'SYSTEM INIT: EVA AI OS [v4.12.9]',
    'Initializing Neural Core...',
    'Loading Intelligence Modules...',
    'Establishing Secure Connection...',
    'Activating Cognitive Systems...',
    'Launching EVA Command Center...'
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < startupSequence.length) {
        setBootLines(prev => [...prev, startupSequence[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        // Stagger exit slightly for smooth fade
        const timeout = setTimeout(() => {
          onComplete();
        }, 600);
        return () => clearTimeout(timeout);
      }
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-6 selection:bg-white/20 font-sans relative">
      {/* Concentric rotating glowing logo */}
      <div className="max-w-md w-full space-y-8 text-center flex flex-col items-center justify-center z-10">
        <div className="relative w-16 h-16 flex items-center justify-center mb-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-dashed border-white/20"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute w-12 h-12 rounded-full border border-dashed border-white/40"
          />
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
          />
        </div>

        <div className="space-y-4 w-full text-left">
          <h1 className="text-sm font-semibold uppercase tracking-widest text-white/50 text-center select-none font-mono">
            EVA AI CORE LOADER
          </h1>

          {/* Typing boot logs */}
          <div className="w-full bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 font-mono text-left space-y-2 text-xs text-white/70 h-44 overflow-y-auto shadow-inner select-none">
            {bootLines.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-white/40 select-none">&gt;</span>
                <motion.span
                  initial={{ opacity: 0, x: -3 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {line}
                </motion.span>
              </div>
            ))}
            {bootLines.length < startupSequence.length && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-1.5 h-3 bg-white"
              />
            )}
          </div>
        </div>

        {/* Bypass trigger */}
        <button
          onClick={onComplete}
          className="text-[10px] text-white/40 hover:text-white/80 transition-colors uppercase tracking-widest px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 cursor-pointer font-mono"
        >
          Bypass Loading Sequence
        </button>
      </div>
    </div>
  );
}
