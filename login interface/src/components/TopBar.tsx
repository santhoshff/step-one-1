import { useEffect, useState } from 'react';
import { Shield, Cpu, Wifi, HardDrive, MessageSquare, Mic, Settings } from 'lucide-react';
import GooeyNav from './GooeyNav';

interface TopBarProps {
  status: 'online' | 'thinking' | 'listening' | 'processing';
  setStatus: (s: 'online' | 'thinking' | 'listening' | 'processing') => void;
  theme: string;
  onLogout: () => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
  onTriggerVoice: () => void;
}

export default function TopBar({
  status,
  setStatus,
  theme,
  onLogout,
  onOpenSettings,
  onNewChat,
  onTriggerVoice
}: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  const statusList = ['online', 'thinking', 'listening', 'processing'] as const;
  const activeIndex = statusList.indexOf(status) !== -1 ? statusList.indexOf(status) : 0;

  const handleStatusChange = (index: number) => {
    setStatus(statusList[index]);
  };

  const gooeyItems = [
    { label: 'online', href: '#online', colorClass: 'bg-purple-500 shadow-purple-500/50' },
    { label: 'thinking', href: '#thinking', colorClass: 'bg-amber-500 shadow-amber-500/50' },
    { label: 'listening', href: '#listening', colorClass: 'bg-green-500 shadow-green-500/50' },
    { label: 'processing', href: '#processing', colorClass: 'bg-blue-500 shadow-blue-500/50' }
  ];


  // Keep time updating every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

  const getThemeBorderGlow = () => {
    switch (theme) {
      case 'Amber Tactical': return 'border-amber-500/20';
      case 'Cyber Cobalt': return 'border-blue-500/20';
      case 'Neon Violet': return 'border-purple-500/20';
      case 'EVA Quantum Purple': return 'border-purple-500/20';
      case 'Monochrome Dark':
      default:
        return 'border-white/10';
    }
  };

  // Simulating small random resource spikes
  const [resources, setResources] = useState({
    cpu: 24,
    ram: 45,
    net: 72,
    sec: 100
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setResources({
        cpu: Math.floor(18 + Math.random() * 25),
        ram: Math.floor(40 + Math.random() * 8),
        net: Math.floor(65 + Math.random() * 15),
        sec: 100
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={`w-full flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 p-5 bg-black/40 backdrop-blur-md border rounded-2xl select-none z-20 ${getThemeBorderGlow()}`}>
      {/* Time and Title Zone */}
      <div className="flex flex-col md:flex-row md:items-center justify-between xl:justify-start gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-[0.2em] font-orbitron text-white">EVA AI OS</h1>
          <p className="text-[10px] text-white/40 font-mono tracking-widest mt-0.5">TACTICAL COMMAND OPERATIONS</p>
        </div>
        <div className="hidden md:block w-px h-8 bg-white/10" />
        <div className="flex items-center gap-3 font-mono">
          <div className="text-right">
            <div className="text-md font-semibold text-white tracking-widest">{formattedTime}</div>
            <div className="text-[9px] text-white/35 mt-0.5 tracking-wider">{formattedDate}</div>
          </div>
        </div>
      </div>

      {/* AI CORE STATUS ZONE */}
      <div className="flex items-center gap-2 flex-wrap xl:justify-center">
        <span className="text-[9px] text-white/45 font-mono uppercase tracking-wider mr-1">AI CORE STATE:</span>
        <GooeyNav
          items={gooeyItems}
          activeIndex={activeIndex}
          onChange={handleStatusChange}
          particleCount={15}
          particleDistances={[60, 8]}
          particleR={80}
          animationTime={450}
          timeVariance={150}
        />
      </div>

      {/* SYSTEM DIAGNOSTICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xl:gap-6 font-mono text-[9px] text-white/40">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5" />
          <div className="flex-1">
            <div className="flex justify-between text-[8px] mb-0.5">
              <span>CPU</span>
              <span className="text-white font-bold">{resources.cpu}%</span>
            </div>
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${resources.cpu}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5" />
          <div className="flex-1">
            <div className="flex justify-between text-[8px] mb-0.5">
              <span>MEM</span>
              <span className="text-white font-bold">{resources.ram}%</span>
            </div>
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${resources.ram}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex-1">
            <div className="flex justify-between text-[8px] mb-0.5">
              <span>NET</span>
              <span className="text-white font-bold">{resources.net}%</span>
            </div>
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${resources.net}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          <div className="flex-1">
            <div className="flex justify-between text-[8px] mb-0.5">
              <span>SEC</span>
              <span className="text-white font-bold">{resources.sec}%</span>
            </div>
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-1000" style={{ width: `${resources.sec}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* CONNECTED API SERVICES */}
      <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-3 py-2 rounded-xl xl:justify-center">
        <span className="text-[8px] text-white/30 font-mono tracking-widest">SERVICES:</span>
        <div className="flex items-center gap-2 font-mono text-[8px]">
          <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500" /> OpenAI</span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse" /> Claude</span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-blue-500" /> Gemini</span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-purple-500" /> Ollama</span>
        </div>
      </div>

      {/* QUICK PANEL ACTIONS */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          type="button"
          className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
          title="New Chat Session"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
        <button
          onClick={onTriggerVoice}
          type="button"
          className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
          title="Voice Assistant Mode"
        >
          <Mic className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenSettings}
          type="button"
          className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
          title="Settings Configuration"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={onLogout}
          type="button"
          className="ml-2 font-mono text-[9px] tracking-widest px-3 py-2 bg-red-950/40 border border-red-500/20 text-red-400 hover:bg-red-900/50 hover:text-red-300 rounded-xl transition-all cursor-pointer"
        >
          DISCONNECT
        </button>
      </div>
    </header>
  );
}
