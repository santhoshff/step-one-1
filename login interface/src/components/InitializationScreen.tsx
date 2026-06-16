import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Mic, Palette, Sliders, Play, CheckCircle } from 'lucide-react';

interface ConfigData {
  frequency: string;
  voice: string;
  theme: string;
  personality: string;
  responseSpeed: string;
  reasoningDepth: string;
  memoryMode: string;
  privacyMode: string;
}

interface InitializationScreenProps {
  onComplete: (config: ConfigData) => void;
  initialConfig?: Partial<ConfigData>;
}

export default function InitializationScreen({ onComplete, initialConfig }: InitializationScreenProps) {
  const [config, setConfig] = useState<ConfigData>({
    frequency: initialConfig?.frequency || '4.8 GHz',
    voice: initialConfig?.voice || 'Silent Interface',
    theme: initialConfig?.theme || 'Monochrome Dark',
    personality: initialConfig?.personality || 'Assistant',
    responseSpeed: initialConfig?.responseSpeed || 'Fast',
    reasoningDepth: initialConfig?.reasoningDepth || 'Standard',
    memoryMode: initialConfig?.memoryMode || 'Temporary',
    privacyMode: initialConfig?.privacyMode || 'Standard'
  });

  const [isActivating, setIsActivating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const activationSteps = [
    'Neural Core Online',
    'Voice Systems Activated',
    'Cognitive Matrix Loaded',
    'Memory Framework Initialized',
    'Security Layer Engaged',
    'Quantum Network Synced',
    'EVA Intelligence Ready'
  ];

  // Runs the cinematic activation checks sequence
  useEffect(() => {
    if (!isActivating) return;

    if (activeStep < activationSteps.length) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      // Completed, transition out
      const completeTimer = setTimeout(() => {
        onComplete(config);
      }, 1000);
      return () => clearTimeout(completeTimer);
    }
  }, [isActivating, activeStep]);

  const handleActivate = () => {
    setIsActivating(true);
    setActiveStep(0);
  };

  const getThemeTextGlow = () => {
    switch (config.theme) {
      case 'Amber Tactical': return 'text-amber-500 shadow-amber-500/20';
      case 'Cyber Cobalt': return 'text-blue-500 shadow-blue-500/20';
      case 'Neon Violet': return 'text-purple-500 shadow-purple-500/20';
      case 'EVA Quantum Purple': return 'text-fuchsia-400 shadow-fuchsia-400/20';
      case 'Monochrome Dark':
      default:
        return 'text-white shadow-white/10';
    }
  };


  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 md:p-6 overflow-y-auto selection:bg-white/20 relative font-sans">
      {/* Background HUD Scans Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-15 pointer-events-none" />

      <AnimatePresence mode="wait">
        {!isActivating ? (
          <motion.div
            key="config-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl bg-black border border-white/10 rounded-3xl p-6 md:p-10 text-left space-y-8 shadow-2xl relative"
          >
            {/* Status indicator */}
            <div className="flex justify-between items-center select-none">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-mono text-white/55 tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                SECURE LINK ACTIVE
              </div>
              <span className="text-[9px] font-mono text-white/30 tracking-wider">EVA.OS NODE_SETUP</span>
            </div>

            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Initialize EVA AI</h1>
              <p className="text-white/40 text-sm mt-1">Configure the tactical parameters of your virtual intelligence shell.</p>
            </div>

            {/* Config Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* SECTION 1: Neural Core Frequency */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 font-mono flex items-center gap-2 select-none">
                  <Cpu className="w-4 h-4 text-white/60" /> Neural Frequency
                </h3>
                <div className="space-y-3">
                  {[
                    { id: '4.8 GHz', label: 'EVA STANDARD', rate: '4.8 GHz', desc: 'Balanced Performance' },
                    { id: '6.2 GHz Hyper', label: 'EVA HYPER', rate: '6.2 GHz Hyper', desc: 'Maximum Reasoning Power' },
                    { id: 'Quantum Sync', label: 'EVA QUANTUM', rate: 'Quantum Sync', desc: 'Experimental Intelligence' }
                  ].map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setConfig({ ...config, frequency: card.id })}
                      className={`w-full p-4 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                        config.frequency === card.id
                          ? `bg-white/10 text-white border-white shadow-[0_0_15px_rgba(255,255,255,0.06)]`
                          : 'bg-[#0D0D0D] text-white/40 border-white/5 hover:border-white/10 hover:text-white/70'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold tracking-wider">{card.label}</span>
                      <span className="text-xs font-semibold text-white mt-1">{card.rate}</span>
                      <span className="text-[9px] text-white/35 mt-0.5">{card.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Voice Model */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 font-mono flex items-center gap-2 select-none">
                  <Mic className="w-4 h-4 text-white/60" /> Voice Model
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'EVA-01 (Soprano)', label: 'EVA-01 (Soprano)', type: 'Female', desc: 'Warm Intelligent Voice' },
                    { id: 'EVA-02 (Baritone)', label: 'EVA-02 (Baritone)', type: 'Male', desc: 'Deep Tactical Voice' },
                    { id: 'Silent Interface', label: 'Silent Interface', type: 'Text Only', desc: 'No Voice Synthesis' }
                  ].map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setConfig({ ...config, voice: card.id })}
                      className={`w-full p-4 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                        config.voice === card.id
                          ? `bg-white/10 text-white border-white shadow-[0_0_15px_rgba(255,255,255,0.06)]`
                          : 'bg-[#0D0D0D] text-white/40 border-white/5 hover:border-white/10 hover:text-white/70'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold tracking-wider">{card.label}</span>
                      <span className="text-xs font-semibold text-white mt-1">{card.type}</span>
                      <span className="text-[9px] text-white/35 mt-0.5">{card.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 3: Visual Theme */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 font-mono flex items-center gap-2 select-none">
                  <Palette className="w-4 h-4 text-white/60" /> Interface Theme
                </h3>
                <div className="space-y-2.5">
                  {[
                    { id: 'Monochrome Dark', label: 'Monochrome Dark', dot: 'bg-white' },
                    { id: 'Amber Tactical', label: 'Amber Tactical', dot: 'bg-amber-500' },
                    { id: 'Cyber Cobalt', label: 'Cyber Cobalt', dot: 'bg-blue-500' },
                    { id: 'Neon Violet', label: 'Neon Violet', dot: 'bg-purple-500' },
                    { id: 'EVA Quantum Purple', label: 'EVA Quantum Purple', dot: 'bg-fuchsia-400' }
                  ].map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setConfig({ ...config, theme: card.id })}
                      className={`w-full px-4 py-3 rounded-xl text-left transition-all border cursor-pointer flex items-center justify-between ${
                        config.theme === card.id
                          ? `bg-white/10 text-white border-white shadow-[0_0_15px_rgba(255,255,255,0.06)]`
                          : 'bg-[#0D0D0D] text-white/40 border-white/5 hover:border-white/10 hover:text-white/70'
                      }`}
                    >
                      <span className="text-[11px] font-mono font-medium">{card.label}</span>
                      <span className={`w-2 h-2 rounded-full ${card.dot}`} />
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Additional EVA Settings Grid */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 font-mono flex items-center gap-2 select-none">
                <Sliders className="w-4 h-4 text-white/60" /> Additional Settings
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                
                {/* Setting 1: Personality */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-mono uppercase text-white/30">AI Personality</label>
                  <select
                    value={config.personality}
                    onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                    className="bg-[#0D0D0D] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    {['Professional', 'Assistant', 'Tactical', 'Creative', 'Research'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Setting 2: Response Speed */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-mono uppercase text-white/30">Response Speed</label>
                  <select
                    value={config.responseSpeed}
                    onChange={(e) => setConfig({ ...config, responseSpeed: e.target.value })}
                    className="bg-[#0D0D0D] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    {['Normal', 'Fast', 'Instant'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Setting 3: Reasoning Depth */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-mono uppercase text-white/30">Reasoning Depth</label>
                  <select
                    value={config.reasoningDepth}
                    onChange={(e) => setConfig({ ...config, reasoningDepth: e.target.value })}
                    className="bg-[#0D0D0D] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    {['Standard', 'Advanced', 'Expert'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Setting 4: Memory Mode */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-mono uppercase text-white/30">Memory Mode</label>
                  <select
                    value={config.memoryMode}
                    onChange={(e) => setConfig({ ...config, memoryMode: e.target.value })}
                    className="bg-[#0D0D0D] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    {['Temporary', 'Persistent'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Setting 5: Privacy Mode */}
                <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                  <label className="text-[8px] font-mono uppercase text-white/30">Privacy Mode</label>
                  <select
                    value={config.privacyMode}
                    onChange={(e) => setConfig({ ...config, privacyMode: e.target.value })}
                    className="bg-[#0D0D0D] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    {['Standard', 'Secure', 'Military Grade'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

              </div>
            </div>

            {/* Initialization Action Button */}
            <div className="border-t border-white/5 pt-6 flex justify-end">
              <motion.button
                onClick={handleActivate}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className={`w-full md:w-56 h-12 rounded-xl text-black font-semibold text-xs tracking-widest font-mono uppercase cursor-pointer flex items-center justify-center gap-2 border bg-white hover:bg-white/95 relative overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.15)]`}
              >
                {/* Sweep Animation Glow overlay */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[sweep_1.5s_infinite_linear]" />
                
                <Play className="w-3.5 h-3.5 fill-current" />
                Activate EVA AI
              </motion.button>
            </div>

          </motion.div>
        ) : (
          /* CINEMATIC DIAGNOSTIC LOADING SCREEN */
          <motion.div
            key="activation-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-black border border-white/10 rounded-3xl p-8 text-center space-y-8 shadow-2xl font-mono"
          >
            {/* Pulsing visual AI target icon */}
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-white/20"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-4 h-4 rounded-full ${getThemeTextGlow()}`}
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-bold tracking-widest text-white uppercase">INITIALIZING COGNITIVE CORE</h2>
              <span className="text-[8px] text-white/30 tracking-widest">ACTIVATING CLUSTER SHELLS...</span>
            </div>

            {/* Sequence lists check indicators */}
            <div className="text-left space-y-3 bg-[#0D0D0D] border border-white/5 p-5 rounded-2xl">
              {activationSteps.map((step, idx) => {
                const isChecked = activeStep > idx;
                const isChecking = activeStep === idx;
                return (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <span className={isChecked ? 'text-white/80' : isChecking ? 'text-white font-bold' : 'text-white/25'}>
                      {isChecked ? '✓' : '•'} {step}
                    </span>
                    {isChecked ? (
                      <CheckCircle className={`w-3.5 h-3.5 ${getThemeTextGlow()} fill-transparent`} />
                    ) : isChecking ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
              <motion.div
                className="bg-white h-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(activeStep / activationSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sweep Keyframe Injections */}
      <style>{`
        @keyframes sweep {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
