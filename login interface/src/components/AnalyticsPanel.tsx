import { useEffect, useRef, useState } from 'react';
import { BarChart3, Activity, Cpu, Sliders, List } from 'lucide-react';

interface AnalyticsPanelProps {
  theme: string;
}

export default function AnalyticsPanel({ theme }: AnalyticsPanelProps) {
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);

  // Performance stats
  const [stats, setStats] = useState({
    dailyRequests: 248,
    weeklyRequests: 1845,
    monthlyRequests: 8420,
    commandsExecuted: 562,
    filesProcessed: 43,
    voiceSessions: 18,
    responseTime: 142,
    successRate: 99.9,
    uptime: 99.98
  });

  // Resource monitor values
  const [resources, setResources] = useState({
    cpu: 28,
    ram: 54,
    gpu: 12,
    storage: 67
  });

  // System Live Logs Ticker Feed
  const [logs, setLogs] = useState<string[]>([
    '[SEC] Shield matrix status: ENGAGED',
    '[SYS] Syncing node: OLLAMA_LOCAL_7B',
    '[NET] Entangled channel sync established',
    '[MEM] Garbage collection complete (1.2 GB cleared)',
    '[SYS] Syncing node: GEMINI_FLASH_3.5_API'
  ]);

  // Dynamic theme colors
  const getColors = () => {
    switch (theme) {
      case 'Amber Tactical':
        return { primary: '#f59e0b', secondary: 'rgba(245,158,11,0.1)' };
      case 'Cyber Cobalt':
        return { primary: '#3b82f6', secondary: 'rgba(59,130,246,0.1)' };
      case 'Neon Violet':
        return { primary: '#8b5cf6', secondary: 'rgba(139,92,146,0.1)' };
      case 'EVA Quantum Purple':
        return { primary: '#a855f7', secondary: 'rgba(168,85,247,0.1)' };
      case 'Monochrome Dark':
      default:
        return { primary: '#ffffff', secondary: 'rgba(255,255,255,0.08)' };
    }
  };

  const getThemeBorder = () => {
    switch (theme) {
      case 'Amber Tactical': return 'border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.03)]';
      case 'Cyber Cobalt': return 'border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.03)]';
      case 'Neon Violet': return 'border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.03)]';
      case 'EVA Quantum Purple': return 'border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.03)]';
      case 'Monochrome Dark':
      default:
        return 'border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.01)]';
    }
  };

  // Simulate stats and resources changes
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        ...prev,
        dailyRequests: prev.dailyRequests + (Math.random() > 0.7 ? 1 : 0),
        commandsExecuted: prev.commandsExecuted + (Math.random() > 0.85 ? 1 : 0),
        responseTime: Math.floor(130 + Math.random() * 25)
      }));

      setResources({
        cpu: Math.floor(20 + Math.random() * 20),
        ram: Math.floor(52 + Math.random() * 4),
        gpu: Math.floor(8 + Math.random() * 12),
        storage: 67
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Simulate logs scrolling
  useEffect(() => {
    const systemEvents = [
      '[SYS] Scanning local workspace files...',
      '[NET] Re-allocating bandwidth to node GEMINI',
      '[SEC] Verifying security keys binding...',
      '[AI] Running optimization heuristics...',
      '[OLLAMA] Node sync active: OFFLINE_MODE',
      '[SYS] Tokens buffer flush: COMPLETE',
      '[NET] Dynamic routing ping: 14ms',
      '[SEC] Core state snapshot saved.'
    ];

    const logsTimer = setInterval(() => {
      const randomEvent = systemEvents[Math.floor(Math.random() * systemEvents.length)];
      setLogs(prev => [randomEvent, ...prev.slice(0, 5)]);
    }, 5000);

    return () => clearInterval(logsTimer);
  }, []);

  // Draw Line Chart in Canvas
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;
    let dataPoints = [40, 48, 42, 60, 52, 68, 62, 75, 70, 85, 78, 92];
    let offset = 0;

    let animId: number;

    const colors = getColors();

    const drawChart = () => {
      ctx.clearRect(0, 0, width, height);

      // Shift line chart animations slightly
      offset += 0.05;

      // Draw background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridRows = 4;
      const gridCols = 6;
      for (let i = 1; i < gridRows; i++) {
        const y = (height / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let i = 1; i < gridCols; i++) {
        const x = (width / gridCols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Map points
      const points = dataPoints.map((val, idx) => {
        const x = (width / (dataPoints.length - 1)) * idx;
        // Add waving offset to make the chart animate smoothly
        const wave = Math.sin(offset + idx * 0.8) * 4;
        const y = height - (val / 100) * (height - 20) - 10 + wave;
        return { x, y };
      });

      // Draw filled area gradient
      const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
      fillGradient.addColorStop(0, colors.primary + '30'); // transparent color
      fillGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = fillGradient;
      ctx.beginPath();
      ctx.moveTo(0, height);
      points.forEach((p, idx) => {
        if (idx === 0) ctx.lineTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Draw main line path
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      points.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else {
          // Curved connections
          const prev = points[idx - 1];
          const cpX1 = prev.x + (p.x - prev.x) / 2;
          const cpY1 = prev.y;
          const cpX2 = prev.x + (p.x - prev.x) / 2;
          const cpY2 = p.y;
          ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, p.x, p.y);
        }
      });
      ctx.stroke();

      // Draw glow nodes
      ctx.fillStyle = colors.primary;
      points.forEach((p, idx) => {
        if (idx === points.length - 1 || idx % 3 === 0) {
          ctx.shadowColor = colors.primary;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      animId = requestAnimationFrame(drawChart);
    };

    drawChart();

    return () => cancelAnimationFrame(animId);
  }, [theme]);

  return (
    <aside className={`w-full xl:w-[320px] bg-black/45 backdrop-blur-md border rounded-2xl p-5 flex flex-col gap-5 overflow-hidden h-full z-10 ${getThemeBorder()}`}>
      
      {/* SECTION 1: Usage Stats */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-white/50 tracking-[0.2em] font-mono flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-white/60" /> USAGE STATISTICS
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <div className="text-[8px] text-white/30 uppercase">Daily</div>
            <div className="text-[13px] font-semibold text-white mt-0.5">{stats.dailyRequests}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <div className="text-[8px] text-white/30 uppercase">Weekly</div>
            <div className="text-[13px] font-semibold text-white mt-0.5">{stats.weeklyRequests}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <div className="text-[8px] text-white/30 uppercase">Monthly</div>
            <div className="text-[13px] font-semibold text-white mt-0.5">{stats.monthlyRequests}</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: User Activity counters */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-white/50 tracking-[0.2em] font-mono flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-white/60" /> OPERATOR ACTIVITY
        </h3>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 px-3 py-1.5 rounded-lg">
            <span className="text-white/40">Commands Executed:</span>
            <span className="text-white font-semibold">{stats.commandsExecuted}</span>
          </div>
          <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 px-3 py-1.5 rounded-lg">
            <span className="text-white/40">Files Processed:</span>
            <span className="text-white font-semibold">{stats.filesProcessed}</span>
          </div>
          <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 px-3 py-1.5 rounded-lg">
            <span className="text-white/40">Voice Sessions:</span>
            <span className="text-white font-semibold">{stats.voiceSessions}</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Performance Metrics */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-white/50 tracking-[0.2em] font-mono flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-white/60" /> PERFORMANCE METRICS
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <div className="text-[8px] text-white/30 uppercase">Latency</div>
            <div className="text-[11px] font-semibold text-white mt-0.5">{stats.responseTime}ms</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <div className="text-[8px] text-white/30 uppercase">Success</div>
            <div className="text-[11px] font-semibold text-white mt-0.5">{stats.successRate}%</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <div className="text-[8px] text-white/30 uppercase">Uptime</div>
            <div className="text-[11px] font-semibold text-white mt-0.5">{stats.uptime}%</div>
          </div>
        </div>
      </div>

      {/* SECTION 4: AI Resource monitor */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-white/50 tracking-[0.2em] font-mono flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-white/60" /> NEURAL COGNITIVE LOAD
        </h3>
        <div className="space-y-2.5 font-mono text-[9px]">
          <div>
            <div className="flex justify-between text-white/50 mb-1">
              <span>CPU Core Clock</span>
              <span className="text-white">{resources.cpu}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${resources.cpu}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-white/50 mb-1">
              <span>RAM Memory Allocation</span>
              <span className="text-white">{resources.ram}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${resources.ram}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-white/50 mb-1">
              <span>GPU Compute Shader</span>
              <span className="text-white">{resources.gpu}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${resources.gpu}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-white/50 mb-1">
              <span>Holographic Storage Cache</span>
              <span className="text-white">{resources.storage}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-1000" style={{ width: `${resources.storage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Usage line chart */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-white/50 tracking-[0.2em] font-mono uppercase">
          CORE LOAD FREQUENCY CHART
        </h3>
        <div className="w-full h-24 bg-white/[0.01] border border-white/5 rounded-xl overflow-hidden p-1">
          <canvas ref={chartCanvasRef} width={280} height={90} className="w-full h-full" />
        </div>
      </div>

      {/* SECTION 6: Live events Feed log ticker */}
      <div className="space-y-3 mt-auto flex-1 min-h-[140px] flex flex-col">
        <h3 className="text-[10px] font-bold text-white/50 tracking-[0.2em] font-mono flex items-center gap-2 select-none">
          <List className="w-3.5 h-3.5 text-white/60" /> RECENT SYSTEM ACTIONS
        </h3>
        <div className="flex-1 bg-black/60 border border-white/5 rounded-xl p-3 font-mono text-[9px] text-white/60 overflow-y-auto space-y-1.5 h-36">
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-1.5 items-start leading-relaxed border-b border-white/[0.02] pb-1.5 last:border-0">
              <span className="text-white/30 select-none">&gt;</span>
              <span className="break-all">{log}</span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
