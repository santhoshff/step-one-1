import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, MicOff, Camera, Upload, Globe, Play, UserCheck, Bot, Sparkles, Terminal } from 'lucide-react';

interface RightPanelProps {
  theme: string;
  status: 'online' | 'thinking' | 'listening' | 'processing';
  setStatus: (s: 'online' | 'thinking' | 'listening' | 'processing') => void;
  voiceModel: string;
  operatorName: string;
}

interface ChatMessage {
  sender: 'operator' | 'eva';
  text: string;
  timestamp: string;
}

export default function RightPanel({
  theme,
  status,
  setStatus,
  voiceModel,
  operatorName
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<'console' | 'face' | 'files' | 'browser' | 'agents' | 'terminal'>('console');
  const [inputText, setInputText] = useState('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    { sender: 'eva', text: `Neural core sync operational. Welcome, Operator ${operatorName}. Command console is active.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [reasoningLogs, setReasoningLogs] = useState<string[]>([
    '[INIT] Establishing communication link...',
    '[INIT] Quantum security parameters synced.',
    '[INIT] Standard cognitive shell verified.'
  ]);

  // Voice Assistant states
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(24).fill(2));
  const recognitionRef = useRef<any>(null);

  // Face Recognition states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [faceScanState, setFaceScanState] = useState<'idle' | 'scanning' | 'passed' | 'failed'>('idle');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // File states
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; type: string; progress: number }[]>([]);

  // Browser simulator state
  const [browserUrl, setBrowserUrl] = useState('https://gemini.google.com');
  const [browserLogs, setBrowserLogs] = useState<string[]>([]);
  const [isBrowsing, setIsBrowsing] = useState(false);

  // Agent states
  const [selectedAgent, setSelectedAgent] = useState<'research' | 'coding' | 'design' | 'data' | 'automation'>('research');

  // Terminal state
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'EVA Core Terminal v4.12.9',
    'Type "help" for a list of tactical parameters.',
    ''
  ]);

  // Scrolling references
  const chatEndRef = useRef<HTMLDivElement>(null);
  const reasoningEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  useEffect(() => {
    reasoningEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [reasoningLogs]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  // Dynamic colors
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

  const getThemeText = () => {
    switch (theme) {
      case 'Amber Tactical': return 'text-amber-500';
      case 'Cyber Cobalt': return 'text-blue-500';
      case 'Neon Violet': return 'text-purple-500';
      case 'EVA Quantum Purple': return 'text-fuchsia-400';
      case 'Monochrome Dark':
      default:
        return 'text-white';
    }
  };

  const getThemeBg = () => {
    switch (theme) {
      case 'Amber Tactical': return 'bg-amber-500';
      case 'Cyber Cobalt': return 'bg-blue-500';
      case 'Neon Violet': return 'bg-purple-500';
      case 'EVA Quantum Purple': return 'bg-purple-500';
      case 'Monochrome Dark':
      default:
        return 'bg-white';
    }
  };

  // Text-To-Speech Synthesis helper using ElevenLabs with browser SpeechSynthesis fallback
  const speakText = async (text: string) => {
    if (voiceModel === 'Silent Interface') return;

    try {
      // Cancel native speech if active
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      // Stop previous ElevenLabs audio if it's currently playing
      if ((window as any).evaAudio) {
        (window as any).evaAudio.pause();
        (window as any).evaAudio = null;
      }

      const response = await fetch('http://localhost:5000/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('ElevenLabs TTS request failed');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      // Store in window to allow stopping it on next trigger
      (window as any).evaAudio = audio;

      // Set status to listening to animate the waveform during playback
      setStatus('listening');
      
      audio.onended = () => {
        setStatus('online');
        (window as any).evaAudio = null;
      };

      audio.onerror = () => {
        setStatus('online');
        (window as any).evaAudio = null;
      };

      await audio.play();
    } catch (err) {
      console.warn('[SYS] ElevenLabs TTS unavailable, falling back to local speech synthesis:', err);
      setStatus('online');

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
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Handle Command Submission
  const handleCommandSubmit = (e?: React.FormEvent, cmdText?: string) => {
    if (e) e.preventDefault();
    const finalCmd = cmdText || inputText;
    if (!finalCmd.trim()) return;

    // Add user message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatLog(prev => [...prev, { sender: 'operator', text: finalCmd, timestamp }]);
    setInputText('');

    // Trigger AI loading state
    setStatus('thinking');
    setReasoningLogs(prev => [...prev, `[COMMAND] Received: "${finalCmd}"`, '[REASONING] Analyzing query semantics...', '[REASONING] Activating local multi-agent scheduler...']);

    // Generate responsive feedback based on commands
    setTimeout(() => {
      let replyText = '';
      if (finalCmd.toLowerCase().includes('analyze project')) {
        replyText = 'Scanning file directories. Detected 3 primary project workspace subdirectories. Indexing node dependencies. Git tracking status: clean.';
        setReasoningLogs(prev => [...prev, '[AGENT] Coding Agent allocated.', '[SYS] Scanning A:\\all\\back to code\\...', '[SYS] 24 file indices indexed.', '[REASONING] Formatting metrics dashboard.']);
      } else if (finalCmd.toLowerCase().includes('create dashboard')) {
        replyText = 'Generating custom tactical CSS configuration variables. Theme presets initialized. Web core controls deployed.';
        setReasoningLogs(prev => [...prev, '[AGENT] Design Agent allocated.', '[REASONING] Generating Tailwind colors configuration...', '[SYS] Ingress layouts rendered successfully.']);
      } else if (finalCmd.toLowerCase().includes('generate report')) {
        replyText = 'Aggregating daily request metrics and system CPU/RAM cache loads. Performance report generated. Success rate locked at 99.9%.';
        setReasoningLogs(prev => [...prev, '[AGENT] Data Analyst allocated.', '[SYS] Compressing daily log files...', '[REASONING] Rendering PDF payload layout.']);
      } else {
        replyText = `Understood. Processing request: "${finalCmd}". Searching neural knowledge index and executing query sequence. Query resolved successfully.`;
        setReasoningLogs(prev => [...prev, '[REASONING] Searching vectors database...', '[REASONING] Formatting context payload.', '[SYS] Sequence completed.']);
      }

      setChatLog(prev => [...prev, { sender: 'eva', text: replyText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setStatus('online');
      speakText(replyText);
    }, 1800);
  };

  // Handle Voice Assistant Listening
  const startVoiceAssistant = () => {
    const SpeechRegObj = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRegObj) {
      alert('Your browser does not support Speech Recognition. Please use Chrome/Edge.');
      return;
    }

    if (isVoiceListening) {
      stopVoiceAssistant();
      return;
    }

    const rec = new SpeechRegObj();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsVoiceListening(true);
      setStatus('listening');
      setTranscription('Listening...');
      setReasoningLogs(prev => [...prev, '[SYS] Voice system audio input channel opened.']);
    };

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setTranscription(resultText);
      setInputText(resultText);
      setReasoningLogs(prev => [...prev, `[VOICE] Captured transcription: "${resultText}"`]);
      // Run the command
      setTimeout(() => {
        handleCommandSubmit(undefined, resultText);
        stopVoiceAssistant();
      }, 1000);
    };

    rec.onerror = (err: any) => {
      console.error(err);
      stopVoiceAssistant();
    };

    rec.onend = () => {
      setIsVoiceListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopVoiceAssistant = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsVoiceListening(false);
    setStatus('online');
    setTranscription('');
  };

  // Simulate audio waveforms
  useEffect(() => {
    let timer: number;
    if (isVoiceListening || status === 'listening') {
      timer = window.setInterval(() => {
        setWaveformBars(Array(24).fill(0).map(() => Math.floor(Math.random() * 26 + 4)));
      }, 100);
    } else {
      setWaveformBars(Array(24).fill(2));
    }
    return () => clearInterval(timer);
  }, [isVoiceListening, status]);

  // Face Recognition triggers
  const startFaceScan = async () => {
    if (cameraStream) {
      stopCamera();
    }

    setFaceScanState('scanning');
    setReasoningLogs(prev => [...prev, '[SEC] Facial scanning module engaged.', '[SEC] Accessing operator optic feed...']);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setTimeout(() => {
        setFaceScanState('passed');
        setReasoningLogs(prev => [...prev, `[SEC] Signature match found: OPERATOR ${operatorName.toUpperCase()}`, '[SEC] Authorization clearance granted.']);
        speakText('Identity authenticated. Operator clearance level: military grade.');
      }, 3500);

    } catch (err) {
      console.error('Camera access error:', err);
      // Fallback: Simulate mock camera grid
      setTimeout(() => {
        setFaceScanState('passed');
        setReasoningLogs(prev => [...prev, '[SEC] Camera access blocked. Emulating secure bio-scanner bypass...', `[SEC] Bio signature identified: ${operatorName.toUpperCase()}`]);
        speakText('Identity authenticated via secure bypass.');
      }, 3500);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setFaceScanState('idle');
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const newFile = {
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type || 'plaintext',
      progress: 0
    };

    setUploadedFiles(prev => [...prev, newFile]);
    setReasoningLogs(prev => [...prev, `[SYS] Ingesting file payload: "${file.name}"`]);

    // Animate progress bar
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setUploadedFiles(prev =>
        prev.map(f => (f.name === file.name ? { ...f, progress: Math.min(100, prog) } : f))
      );

      if (prog >= 100) {
        clearInterval(interval);
        setReasoningLogs(prev => [...prev, `[SYS] Ingested "${file.name}" into cognitive buffer memory.`]);
      }
    }, 200);
  };

  const runFileAnalysis = (fileName: string) => {
    setStatus('processing');
    setReasoningLogs(prev => [...prev, `[SYS] Commencing file parse on "${fileName}"`, '[REASONING] Tokenizing file content chunks...', '[REASONING] Matching syntactic references against codebase standard...']);

    setTimeout(() => {
      setStatus('online');
      setReasoningLogs(prev => [...prev, `[SYS] Analysis for "${fileName}" complete. No compilation vulnerabilities found.`]);
      alert(`EVA AI File Analysis Result:\n"${fileName}" successfully parsed. Structure compiles with React 19 standards.`);
    }, 2000);
  };

  // Browser Simulator executes task
  const runBrowserTask = () => {
    if (!browserUrl) return;
    setIsBrowsing(true);
    setBrowserLogs([]);
    setStatus('processing');

    const steps = [
      `[HTTP] Requesting domain header handshake: ${browserUrl}...`,
      `[HTTP] Fetching index DOM tree payloads...`,
      `[DOM] Extracted title: "EVA AI operating console portal"`,
      `[AI] Crawling text contents for metadata details...`,
      `[SYS] Task execution successful. Captured DOM node tree.`
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setBrowserLogs(prev => [...prev, steps[i]]);
        setReasoningLogs(prev => [...prev, `[BROWSER] ${steps[i]}`]);
        i++;
      } else {
        clearInterval(interval);
        setIsBrowsing(false);
        setStatus('online');
      }
    }, 800);
  };

  // Terminal commands shell simulation
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    setTerminalHistory(prev => [...prev, `operator@eva:~$ ${cmd}`]);
    setTerminalInput('');

    setTimeout(() => {
      let reply: string[] = [];
      switch (cmd.toLowerCase()) {
        case 'help':
          reply = [
            'Available system parameters:',
            '  sysinfo       Print core CPU clock metrics',
            '  clear         Clear command screen lines',
            '  agents        List active cognitive multi-agent modules',
            '  netstat       Check connected cloud API servers'
          ];
          break;
        case 'sysinfo':
          reply = [
            'EVA Core Clock: 4.8 GHz (Adaptive)',
            'Latency Rate: 138ms (Optimized)',
            'Memory Usage: 3.42 GB / 8.00 GB Allocated',
            'Security Status: MILITARY_GRADE_SHIELD'
          ];
          break;
        case 'clear':
          setTerminalHistory([]);
          return;
        case 'agents':
          reply = [
            'Active Agents:',
            '  - Research Agent (Idle)',
            '  - Coding Agent (Idle)',
            '  - Design Agent (Active)',
            '  - Data Analyst Agent (Idle)',
            '  - Automation Agent (Idle)'
          ];
          break;
        case 'netstat':
          reply = [
            'Connected node services:',
            '  - OpenAI Claude Sync   [ACTIVE]',
            '  - Gemini API Gateway   [ACTIVE]',
            '  - Ollama Local host    [ACTIVE]'
          ];
          break;
        default:
          reply = [`bash: command not found: ${cmd}. Type "help" for info.`];
      }

      setTerminalHistory(prev => [...prev, ...reply, '']);
    }, 150);
  };

  return (
    <main className={`flex-1 flex flex-col bg-black/45 backdrop-blur-md border rounded-2xl p-5 overflow-hidden h-full z-10 ${getThemeBorder()}`}>

      {/* Tabs list for command panels */}
      <div className="flex gap-1.5 border-b border-white/5 pb-3 overflow-x-auto select-none no-scrollbar">
        {[
          { id: 'console', label: 'Console', icon: <Bot className="w-3.5 h-3.5" /> },
          { id: 'face', label: 'Face Scan', icon: <Camera className="w-3.5 h-3.5" /> },
          { id: 'files', label: 'File Ingress', icon: <Upload className="w-3.5 h-3.5" /> },
          { id: 'browser', label: 'Web Scraper', icon: <Globe className="w-3.5 h-3.5" /> },
          { id: 'agents', label: 'Agents', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'terminal', label: 'Shell', icon: <Terminal className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id !== 'face') stopCamera();
            }}
            className={`px-3 py-2 rounded-xl text-[10px] font-mono tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white/10 text-white font-semibold border border-white/10'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels Contents */}
      <div className="flex-1 overflow-y-auto py-4 min-h-0 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: Conversational Console */}
          {activeTab === 'console' && (
            <motion.div
              key="console"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Messages View */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar h-48">
                {chatLog.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${msg.sender === 'operator' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[8px] font-mono text-white/30 mb-0.5">
                      <span>{msg.sender === 'operator' ? 'OPERATOR' : 'EVA AI'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'operator'
                          ? `${getThemeBg()} text-black font-medium`
                          : 'bg-white/[0.03] border border-white/5 text-white/80'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Command chips list */}
              <div className="flex gap-2 mb-3 overflow-x-auto select-none no-scrollbar py-1">
                {['Analyze project', 'Create dashboard', 'Generate report'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={(e) => handleCommandSubmit(e, chip)}
                    className="px-2.5 py-1.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 text-[9px] font-mono text-white/50 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                  >
                    "{chip}"
                  </button>
                ))}
              </div>

              {/* Console Prompt and Voice triggers */}
              <form onSubmit={handleCommandSubmit} className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={startVoiceAssistant}
                  className={`p-3 border rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    isVoiceListening
                      ? 'bg-red-950 border-red-500 text-red-400 animate-pulse'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  title="Voice Input"
                >
                  {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={isVoiceListening ? "Listening transcript..." : "Enter neural query command..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full bg-brand-gray border border-white/10 rounded-xl h-11 px-4 pr-12 text-xs text-white placeholder:text-white/20 focus:ring-1 focus:ring-white/20 focus:outline-none transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className={`absolute right-2.5 top-[7px] p-2 rounded-lg transition-colors cursor-pointer ${getThemeText()}`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Voice transcription or Audio Waveform display */}
              {isVoiceListening && (
                <div className="mt-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-center gap-4 font-mono text-[9px]">
                  <div className="flex items-center gap-[2px] h-6 w-32 justify-center shrink-0 select-none">
                    {waveformBars.map((h, i) => (
                      <span
                        key={i}
                        className={`w-[2px] rounded-full transition-all duration-100 ${getThemeBg()}`}
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                  <div className="text-white/60 truncate flex-1">
                    {transcription}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: Face Security Scan */}
          {activeTab === 'face' && (
            <motion.div
              key="face"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex-1 flex flex-col items-center justify-center py-6 text-center select-none"
            >
              <div className="relative w-44 h-44 rounded-full flex items-center justify-center p-2 mb-6 border-2 border-dashed border-white/15 overflow-hidden shadow-2xl bg-black/60">
                {/* Holographic scanner border overlays */}
                <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse pointer-events-none" />
                
                {cameraStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full rounded-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="text-white/25 flex flex-col items-center">
                    <Camera className="w-10 h-10 mb-2" />
                    <span className="text-[9px] font-mono">OPTIC SCANNER</span>
                  </div>
                )}

                {/* Laser scan animation overlay */}
                {faceScanState === 'scanning' && (
                  <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-[3px] bg-green-400 shadow-[0_0_12px_#4ade80] pointer-events-none"
                  />
                )}
                
                {/* Passed identification stamp */}
                {faceScanState === 'passed' && (
                  <div className="absolute inset-0 bg-green-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-green-400 font-mono text-[10px]">
                    <UserCheck className="w-7 h-7 mb-1.5" />
                    <span className="font-bold tracking-widest">ACCESS GRANTED</span>
                    <span className="text-[8px] text-white/60 mt-0.5">LEVEL 5 OPERATOR</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold tracking-wide text-white">Neural Face Authentication</h4>
                <p className="text-[10px] text-white/40 max-w-xs mt-1.5 leading-relaxed font-mono">
                  Align your facial node profile with the optical camera field to register user clearance signature.
                </p>
                
                <button
                  type="button"
                  onClick={startFaceScan}
                  disabled={faceScanState === 'scanning'}
                  className={`mt-5 px-5 py-2.5 rounded-xl font-mono text-[9px] tracking-widest uppercase cursor-pointer border ${
                    faceScanState === 'scanning'
                      ? 'bg-white/5 border-white/10 text-white/30'
                      : 'bg-white text-black font-semibold hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  }`}
                >
                  {faceScanState === 'scanning' ? 'Scanning Nodes...' : 'Begin Authentication'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 3: File Ingress */}
          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Drag Drop Area */}
              <label className="border-2 border-dashed border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white/[0.01]">
                <input type="file" className="hidden" onChange={handleFileUpload} />
                <Upload className="w-7 h-7 text-white/40 mb-2" />
                <span className="text-[10px] font-mono text-white/70">UPLOAD FILE PAYLOAD</span>
                <span className="text-[8px] font-mono text-white/30 mt-1">Drag and drop file data here</span>
              </label>

              {/* Uploaded items lists */}
              <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1 h-36">
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-6 text-[9px] font-mono text-white/30">
                    No files loaded in memory context.
                  </div>
                ) : (
                  uploadedFiles.map((file, idx) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3 text-left">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-semibold text-white/80 truncate font-mono">{file.name}</div>
                        <div className="text-[8px] text-white/35 font-mono mt-0.5">{file.size} • {file.type}</div>
                        {file.progress < 100 && (
                          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1.5">
                            <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${file.progress}%` }} />
                          </div>
                        )}
                      </div>
                      {file.progress >= 100 && (
                        <button
                          type="button"
                          onClick={() => runFileAnalysis(file.name)}
                          className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[8px] font-mono text-white tracking-widest cursor-pointer uppercase shrink-0 transition-colors"
                        >
                          Analyze
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: Browser Scraper */}
          {activeTab === 'browser' && (
            <motion.div
              key="browser"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* URL Input bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={browserUrl}
                  onChange={(e) => setBrowserUrl(e.target.value)}
                  className="flex-1 bg-brand-gray border border-white/10 rounded-xl h-10 px-3 text-[10px] font-mono text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={runBrowserTask}
                  disabled={isBrowsing}
                  className="px-4 bg-white text-black rounded-xl text-[9px] font-mono font-semibold hover:bg-white/90 cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" /> Execute
                </button>
              </div>

              {/* Scraper activity feedback logs */}
              <div className="flex-1 bg-black/60 border border-white/5 rounded-xl p-3 font-mono text-[9px] text-white/65 mt-4 space-y-1.5 h-36 overflow-y-auto">
                {browserLogs.length === 0 ? (
                  <div className="text-center py-6 text-white/30">
                    Enter target URL to simulate automation routing logs.
                  </div>
                ) : (
                  browserLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-1.5 items-start">
                      <span className="text-white/30">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: Multi-Agent System */}
          {activeTab === 'agents' && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex-1 flex flex-col md:flex-row gap-4 min-h-0"
            >
              {/* Left sidebar agent select */}
              <div className="flex md:flex-col gap-1.5 select-none overflow-x-auto md:w-32 border-b md:border-b-0 md:border-r border-white/5 pb-2 md:pb-0 md:pr-2 shrink-0">
                {[
                  { id: 'research', name: 'Research' },
                  { id: 'coding', name: 'Coding' },
                  { id: 'design', name: 'Design' },
                  { id: 'data', name: 'Analytics' },
                  { id: 'automation', name: 'Scrapers' }
                ].map((ag) => (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => {
                      setSelectedAgent(ag.id as any);
                      setReasoningLogs(prev => [...prev, `[ROUTING] Delegated active socket to [${ag.name.toUpperCase()}_AGENT]`]);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-wide transition-colors cursor-pointer text-left whitespace-nowrap ${
                      selectedAgent === ag.id
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-white/35 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {ag.name}
                  </button>
                ))}
              </div>

              {/* Right agent details view */}
              <div className="flex-1 text-left font-mono text-[9px] text-white/55 space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-white/5 ${getThemeText()}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-white capitalize">{selectedAgent} Agent</h5>
                    <span className="text-[7px] text-white/30 uppercase tracking-widest">CLEARANCE STATUS: APPROVED</span>
                  </div>
                </div>

                <p className="leading-relaxed bg-white/[0.01] border border-white/5 p-2 rounded-lg text-white/50 text-[8.5px]">
                  {selectedAgent === 'research' && 'Indexes internet libraries, aggregates semantic paper summaries, and maps conceptual nodes.'}
                  {selectedAgent === 'coding' && 'Writes optimal algorithms, diagnoses compile-time errors, refactors structures, and generates test suites.'}
                  {selectedAgent === 'design' && 'Renders layout wireframes, resolves CSS configurations, and compiles harmonized system color pallets.'}
                  {selectedAgent === 'data' && 'Tracks log histories, evaluates database schema states, and packages compressed statistics logs.'}
                  {selectedAgent === 'automation' && 'Simulates user gestures in headless environments, parses DOM targets, and fetches metadata.'}
                </p>

                <div className="space-y-1">
                  <span className="text-[7px] text-white/30 uppercase">AGENT CAPABILITIES:</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[8px] text-white/75">
                    {selectedAgent === 'research' && ['• Semantic Vector Searches', '• Reference Citations', '• Content Summaries'].map(c => <span key={c}>{c}</span>)}
                    {selectedAgent === 'coding' && ['• Syntax diagnostics', '• Node compilers', '• Typescript scripts'].map(c => <span key={c}>{c}</span>)}
                    {selectedAgent === 'design' && ['• Glassmorphic designs', '• HSL palette generators', '• Micro transitions'].map(c => <span key={c}>{c}</span>)}
                    {selectedAgent === 'data' && ['• Log analytics', '• Database operations', '• Chart compilers'].map(c => <span key={c}>{c}</span>)}
                    {selectedAgent === 'automation' && ['• Web crawler crawlers', '• Task schedulers', '• DOM parsers'].map(c => <span key={c}>{c}</span>)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: Interactive shell terminal */}
          {activeTab === 'terminal' && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex-1 flex flex-col min-h-0 bg-black/75 border border-white/5 rounded-xl p-4 font-mono text-[10px]"
            >
              {/* Output History */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-left h-36">
                {terminalHistory.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap leading-relaxed text-white/70">
                    {line}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleTerminalSubmit} className="flex gap-1.5 items-center border-t border-white/5 pt-2 mt-2">
                <span className="text-[#8b5cf6] font-bold">operator@eva:~$</span>
                <input
                  type="text"
                  placeholder='Type "help" for a list of diagnostics...'
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-white/20"
                />
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* LOWER DIVISION: AI reasoning Logs Stream ticker */}
      <div className="border-t border-white/5 pt-3 mt-4 text-left select-none bg-black/25 p-2 rounded-xl">
        <div className="flex items-center justify-between text-[8px] font-mono text-white/35 tracking-wider mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />
            AI REASONING LOGS
          </span>
          <span>STREAMING PROCESS</span>
        </div>

        <div className="h-[74px] overflow-y-auto font-mono text-[8.5px] text-white/55 space-y-1 pr-1 bg-black/45 border border-white/5 p-2 rounded-lg">
          {reasoningLogs.map((log, idx) => (
            <div key={idx} className="flex gap-1.5 items-start">
              <span className={`text-[7px] font-bold ${getThemeText()}`}>[LOG]</span>
              <span className="break-all">{log}</span>
            </div>
          ))}
          <div ref={reasoningEndRef} />
        </div>
      </div>

    </main>
  );
}
