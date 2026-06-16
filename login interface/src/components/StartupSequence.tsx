import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Terminal, Shield, Cpu, Activity } from 'lucide-react';
import EvilEye from './EvilEye';

interface StartupSequenceProps {
  operatorName: string;
  isFirstLogin: boolean;
  voiceModel: string;
  theme: string;
  onComplete: () => void;
}

export default function StartupSequence({
  operatorName,
  isFirstLogin,
  voiceModel,
  theme,
  onComplete
}: StartupSequenceProps) {
  const [statusText, setStatusText] = useState('INITIATING LINK...');
  const [subStatusText, setSubStatusText] = useState('Quantum security handshake in progress...');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const droneRef = useRef<{ stop: () => void } | null>(null);

  // Map active interface theme to specific HEX color values for the EvilEye
  const getThemeColor = () => {
    switch (theme) {
      case 'Amber Tactical': return '#f59e0b';
      case 'Cyber Cobalt': return '#3b82f6';
      case 'Neon Violet': return '#8b5cf6';
      case 'EVA Quantum Purple': return '#d946ef';
      case 'Monochrome Dark':
      default:
        return '#38bdf8'; // Sleek cyan by default
    }
  };

  // Web Audio Synth low drone
  const startAmbientHum = () => {
    if (!('AudioContext' in window || 'webkitAudioContext' in window)) return null;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, ctx.currentTime); // 55Hz (Low A)
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110, ctx.currentTime); // 110Hz
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.5);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      
      return {
        stop: () => {
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
          setTimeout(() => {
            try {
              osc1.stop();
              osc2.stop();
              ctx.close();
            } catch (e) {
              // ignore
            }
          }, 1000);
        }
      };
    } catch (e) {
      console.error('AudioContext start error:', e);
      return null;
    }
  };

  // Generate dynamic personalized greeting matching local time
  const getPersonalizedGreeting = (name: string, firstLogin: boolean) => {
    if (firstLogin) {
      return `Welcome to EVA AI, ${name}. Your personal AI operating system has been initialized successfully. I will assist you with research, coding, automation, and intelligent task execution. Setup is complete.`;
    }

    const now = new Date();
    const hour = now.getHours();
    
    // Determine greeting prefix based on time of day
    let timeGreeting = "Good evening";
    if (hour >= 5 && hour < 12) timeGreeting = "Good morning";
    else if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    else if (hour >= 17 && hour < 21) timeGreeting = "Good evening";
    else timeGreeting = "Good evening"; // Night hours (9 PM - 5 AM) use Good evening per instruction

    // Intros
    const intros = [
      `Welcome back, ${name}.`,
      `Good to see you again, ${name}.`,
      `EVA online. Greetings, ${name}.`,
      `Secure link active. Welcome back, ${name}.`
    ];

    // Status diagnostics comments
    const statusChecks = [
      "All systems are online and operating normally.",
      "System integrity verified, neural core operating at optimal capacity.",
      "Connected services and vector databases verified.",
      "Your custom workspace parameters have been restored successfully."
    ];

    // Outros
    const outros = [
      "EVA is ready for your commands.",
      "Awaiting instructions.",
      "Mission control is standing by.",
      "How may I assist you today?"
    ];

    const randomIntro = intros[Math.floor(Math.random() * intros.length)];
    const randomStatus = statusChecks[Math.floor(Math.random() * statusChecks.length)];
    const randomOutro = outros[Math.floor(Math.random() * outros.length)];

    return `${randomIntro} ${timeGreeting}. ${randomStatus} ${randomOutro}`;
  };

  // Skip the startup sequence
  const handleSkip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (droneRef.current) {
      droneRef.current.stop();
    }
    onComplete();
  };

  useEffect(() => {
    // 1. Play the ambient startup hum
    droneRef.current = startAmbientHum();

    // 2. Generate the greeting text
    const text = getPersonalizedGreeting(operatorName, isFirstLogin);

    // 3. If voice is disabled, stream subtitle texts and complete after delay
    if (voiceModel === 'Silent Interface') {
      setStatusText('CORE SYNCED');
      setSubStatusText('Text-only terminal mode active.');
      setSubtitle(text);
      
      const fallbackTimer = setTimeout(() => {
        if (droneRef.current) droneRef.current.stop();
        onComplete();
      }, 5000);
      
      return () => {
        clearTimeout(fallbackTimer);
        if (droneRef.current) droneRef.current.stop();
      };
    }

    // 4. Fetch the neural speech from backend and play it
    const fetchTTS = async () => {
      try {
        setStatusText('CONNECTING CORE...');
        setSubStatusText('Activating voice synthesis matrix...');

        const response = await fetch('http://localhost:5000/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text })
        });

        if (!response.ok) {
          throw new Error('TTS Fetch error');
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        setStatusText('LINK ESTABLISHED');
        setSubStatusText('Streaming core diagnostics audio...');
        setIsVoiceActive(true);
        setSubtitle(text);

        audio.onended = () => {
          setIsVoiceActive(false);
          if (droneRef.current) droneRef.current.stop();
          onComplete();
        };

        audio.onerror = () => {
          throw new Error('Audio play error');
        };

        await audio.play();

      } catch (err) {
        console.warn('[SYS] ElevenLabs Greeting failed, falling back to local speech synthesis:', err);
        
        // Fallback: Local Browser SpeechSynthesis
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          const voices = window.speechSynthesis.getVoices();
          
          if (voiceModel.includes('EVA-01')) {
            const femaleVoice = voices.find(v => v.name.toLowerCase().includes('google us english') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'));
            if (femaleVoice) utterance.voice = femaleVoice;
          } else if (voiceModel.includes('EVA-02')) {
            const maleVoice = voices.find(v => v.name.toLowerCase().includes('google uk english male') || v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('daniel'));
            if (maleVoice) utterance.voice = maleVoice;
          }
          
          utterance.onstart = () => {
            setIsVoiceActive(true);
            setSubtitle(text);
          };

          utterance.onend = () => {
            setIsVoiceActive(false);
            if (droneRef.current) droneRef.current.stop();
            onComplete();
          };

          window.speechSynthesis.speak(utterance);
        } else {
          // If no speech support, auto skip
          const autoTimer = setTimeout(() => {
            if (droneRef.current) droneRef.current.stop();
            onComplete();
          }, 4000);
          return () => clearTimeout(autoTimer);
        }
      }
    };

    const triggerTimer = setTimeout(() => {
      fetchTTS();
    }, 800);

    return () => {
      clearTimeout(triggerTimer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (droneRef.current) {
        droneRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-8 select-none font-mono text-white">
      {/* HUD Scanner Grid Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-15 pointer-events-none" />

      {/* Top HUD Badges */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] tracking-wider font-semibold text-white/50">EVA.OS STARTUP SEQUENCE</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-mono text-white/55 tracking-widest uppercase">
          <span className={`w-1.5 h-1.5 rounded-full ${isVoiceActive ? 'bg-cyan-400 animate-ping' : 'bg-green-400 animate-pulse'}`} />
          {statusText}
        </div>
      </div>

      {/* Center Holographic Core Visuals */}
      <div className="flex-1 flex flex-col justify-center items-center relative z-10">
        <div className="relative w-72 h-72 flex items-center justify-center">
          
          {/* Outer Spin Concentric Rings */}
          <svg className="absolute w-full h-full animate-[spin_25s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" fill="none" />
            <circle cx="50" cy="50" r="45" stroke="var(--color-theme-accent, #3b82f6)" strokeWidth="0.8" strokeDasharray="15 30" fill="none" className="opacity-40 animate-[spin_18s_linear_infinite]" />
          </svg>

          {/* Middle Spin Rings */}
          <svg className="absolute w-[80%] h-[80%] animate-[spin_15s_linear_infinite_reverse]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" fill="none" />
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.8" strokeDasharray="40 12" fill="none" className="text-white/25" />
          </svg>

          {/* Inner Telemetry Target Ring */}
          <svg className="absolute w-[60%] h-[60%] animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" fill="none" />
            <circle cx="50" cy="50" r="45" stroke="var(--color-theme-accent, #3b82f6)" strokeWidth="1" strokeDasharray="5 15" fill="none" className="opacity-60" />
          </svg>

          {/* Center WebGL Core EvilEye */}
          <div className="absolute w-28 h-28 flex items-center justify-center pointer-events-none rounded-full overflow-hidden">
            <EvilEye
              eyeColor={getThemeColor()}
              intensity={isVoiceActive ? 2.0 : 1.3}
              pupilSize={0.55}
              irisWidth={0.2}
              glowIntensity={isVoiceActive ? 0.65 : 0.3}
              scale={0.8}
              noiseScale={1.1}
              pupilFollow={1.2}
              flameSpeed={isVoiceActive ? 1.6 : 0.75}
              backgroundColor="#000000"
            />
          </div>
        </div>

        {/* Sync Status Texts */}
        <div className="mt-8 text-center space-y-2 max-w-sm">
          <div className="text-xs uppercase font-bold tracking-widest text-white/80 flex items-center justify-center gap-1.5 select-none">
            <Cpu className="w-3.5 h-3.5 text-white/40" />
            {subStatusText}
          </div>
          
          {/* Subtitles Overlay */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-white/50 leading-relaxed font-mono max-w-xs mx-auto italic select-text"
            >
              "{subtitle}"
            </motion.p>
          )}
        </div>
      </div>

      {/* Bottom Interface Bar */}
      <div className="flex justify-between items-center z-10 border-t border-white/5 pt-6 select-none">
        <div className="flex gap-6 text-[8px] text-white/25 uppercase font-mono tracking-widest">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> Core Encryption: AES-256
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Neural Rate: Optimal
          </div>
        </div>
        <button
          type="button"
          onClick={handleSkip}
          className="text-[9px] tracking-widest text-white/45 hover:text-white transition-colors border border-white/10 px-3.5 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer uppercase font-mono"
        >
          [ Skip Ingress Setup ]
        </button>
      </div>
    </div>
  );
}
