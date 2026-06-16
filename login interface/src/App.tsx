import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import BootScreen from './components/BootScreen';
import LoginScreen from './components/LoginScreen';
import InitializationScreen from './components/InitializationScreen';
import TopBar from './components/TopBar';
import AnalyticsPanel from './components/AnalyticsPanel';
import AICore from './components/AICore';
import RightPanel from './components/RightPanel';
import StaggeredMenu from './components/StaggeredMenu';
import StartupSequence from './components/StartupSequence';

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

interface OperatorData {
  operatorId: string;
  firstName: string;
  lastName: string;
  email: string;
  config?: ConfigData;
}

export default function App() {
  const [bootComplete, setBootComplete] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [operator, setOperator] = useState<OperatorData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Greeting system states
  const [showStartupSequence, setShowStartupSequence] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  
  // Command center runtime states
  const [aiStatus, setAiStatus] = useState<'online' | 'thinking' | 'listening' | 'processing'>('online');

  // Load session from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('eva_session_token');
    if (savedToken) {
      fetch('http://localhost:5000/api/session', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then(data => {
        setToken(savedToken);
        setOperator(data.operator);
        // Check if config exists. If they have set up parameters, skip config screen
        if (data.operator.config && data.operator.config.theme) {
          setIsInitialized(true);
        }
      })
      .catch(err => {
        console.warn('[SYS] Session invalid or server offline:', err.message);
        localStorage.removeItem('eva_session_token');
      });
    }
  }, []);

  const handleAuthSuccess = (newToken: string, newOperator: OperatorData) => {
    localStorage.setItem('eva_session_token', newToken);
    setToken(newToken);
    setOperator(newOperator);
    // If user already has config settings saved on backend, go directly to Command Center and play welcome greeting
    if (newOperator.config && newOperator.config.theme) {
      setIsInitialized(true);
      setShowStartupSequence(true);
      setIsFirstLogin(false);
    }
  };

  const handleInitializationComplete = async (config: ConfigData) => {
    if (!token || !operator) return;

    try {
      // Save configuration settings to backend server database
      const res = await fetch('http://localhost:5000/api/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ config })
      });

      if (!res.ok) throw new Error('Save configuration failed');

      // Update operator state config
      setOperator({
        ...operator,
        config
      });
      setIsInitialized(true);
      setShowStartupSequence(true);
      setIsFirstLogin(true);
    } catch (err) {
      console.error('[-] Config save error:', err);
      // Fallback: apply client configurations locally if backend connection fails
      setOperator({
        ...operator,
        config
      });
      setIsInitialized(true);
      setShowStartupSequence(true);
      setIsFirstLogin(true);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('eva_session_token');
    setToken(null);
    setOperator(null);
    setIsInitialized(false);
  };

  // Get active theme theme configurations
  const activeTheme = operator?.config?.theme || 'Monochrome Dark';

  // Apply theme-specific CSS variables dynamically to the document root wrapper
  const getThemeStyles = () => {
    switch (activeTheme) {
      case 'Amber Tactical':
        return {
          '--color-theme-accent': '#f59e0b',
          '--color-theme-bg-glow': 'rgba(245, 158, 11, 0.02)'
        } as React.CSSProperties;
      case 'Cyber Cobalt':
        return {
          '--color-theme-accent': '#3b82f6',
          '--color-theme-bg-glow': 'rgba(59, 130, 246, 0.02)'
        } as React.CSSProperties;
      case 'Neon Violet':
        return {
          '--color-theme-accent': '#8b5cf6',
          '--color-theme-bg-glow': 'rgba(139, 92, 246, 0.02)'
        } as React.CSSProperties;
      case 'EVA Quantum Purple':
        return {
          '--color-theme-accent': '#a855f7',
          '--color-theme-bg-glow': 'rgba(168, 85, 247, 0.02)'
        } as React.CSSProperties;
      case 'Monochrome Dark':
      default:
        return {
          '--color-theme-accent': '#ffffff',
          '--color-theme-bg-glow': 'rgba(255, 255, 255, 0.01)'
        } as React.CSSProperties;
    }
  };

  return (
    <div style={getThemeStyles()} className="min-h-screen bg-black text-white antialiased font-sans">
      <AnimatePresence mode="wait">
        
        {/* STATE 0: Startup Loading Screen */}
        {!bootComplete && (
          <motion.div key="boot" className="w-full h-full">
            <BootScreen onComplete={() => setBootComplete(true)} />
          </motion.div>
        )}

        {/* STATE 1: User Login & Registrations */}
        {bootComplete && !token && (
          <motion.div key="auth" className="w-full h-full">
            <LoginScreen onAuthSuccess={handleAuthSuccess} />
          </motion.div>
        )}

        {/* STATE 2: classified AI Neural Configurations */}
        {bootComplete && token && !isInitialized && (
          <motion.div key="initialize" className="w-full h-full">
            <InitializationScreen
              onComplete={handleInitializationComplete}
              initialConfig={operator?.config}
            />
          </motion.div>
        )}

        {/* STATE 3: main Operations Dashboard Command Center */}
        {bootComplete && token && isInitialized && operator && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen w-full flex flex-col p-4 gap-4"
          >
            {/* Top Navigation status Header */}
            <TopBar
              status={aiStatus}
              setStatus={setAiStatus}
              theme={activeTheme}
              onLogout={handleDisconnect}
              onOpenSettings={() => setIsInitialized(false)}
              onNewChat={() => setAiStatus('online')}
              onTriggerVoice={() => setAiStatus('listening')}
            />

            {/* Main grid workspace */}
            <div className="flex-1 flex flex-col xl:flex-row gap-4 min-h-0">
              
              {/* Left Column Analytics widgets */}
              <AnalyticsPanel theme={activeTheme} />

              {/* Center Column animated Neural Core */}
              <div className="flex-1 flex flex-col justify-center items-center">
                <AICore status={aiStatus} theme={activeTheme} />
              </div>

              {/* Right Column command tools interface */}
              <RightPanel
                theme={activeTheme}
                status={aiStatus}
                setStatus={setAiStatus}
                voiceModel={operator.config?.voice || 'Silent Interface'}
                operatorName={operator.firstName}
              />

            </div>

            {/* Staggered Navigation Overlay Menu */}
            <StaggeredMenu
              position="right"
              items={[
                { label: 'Adjust Configuration', ariaLabel: 'Go back to parameter settings', link: 'settings' },
                { label: 'Disconnect Core', ariaLabel: 'Log out from user session', link: 'logout' }
              ]}
              socialItems={[
                { label: 'OpenAI', link: 'https://openai.com' },
                { label: 'Gemini', link: 'https://gemini.google.com' },
                { label: 'GitHub', link: 'https://github.com' }
              ]}
              displaySocials={true}
              displayItemNumbering={true}
              menuButtonColor="var(--color-theme-accent)"
              openMenuButtonColor="#000"
              accentColor="var(--color-theme-accent)"
              colors={['rgba(255, 255, 255, 0.05)', '#0D0D0D', '#000000']}
              isFixed={true}
              onItemClick={(item) => {
                if (item.link === 'settings') {
                  setIsInitialized(false);
                } else if (item.link === 'logout') {
                  handleDisconnect();
                }
              }}
            />
          </motion.div>
        )}

      </AnimatePresence>

      {showStartupSequence && operator && (
        <StartupSequence
          operatorName={operator.firstName}
          isFirstLogin={isFirstLogin}
          voiceModel={operator.config?.voice || 'Silent Interface'}
          theme={activeTheme}
          onComplete={() => setShowStartupSequence(false)}
        />
      )}
    </div>
  );
}
