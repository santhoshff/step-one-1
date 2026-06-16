import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Lock, User, Mail, ShieldAlert } from 'lucide-react';
import ScrollFloat from './ScrollFloat';

interface LoginScreenProps {
  onAuthSuccess: (token: string, operator: any) => void;
}

// Custom Google and GitHub logo components
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

export default function LoginScreen({ onAuthSuccess }: LoginScreenProps) {
  const rightSectionRef = useRef<HTMLElement>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Modals for OAuth Dialog
  const [showSocialModal, setShowSocialModal] = useState<'google' | 'github' | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const endpoint = isLoginMode ? '/api/login' : '/api/register';
    const payload = isLoginMode 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication sequence failed.');
      }

      onAuthSuccess(data.token, data.operator);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Unable to contact neural backend core.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock social authentication callback simulation
  const handleSocialClick = (provider: 'google' | 'github') => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

    if (provider === 'google' && googleClientId && googleClientId !== 'your_google_client_id_here') {
      const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
      const options = {
        redirect_uri: window.location.origin,
        client_id: googleClientId,
        access_type: 'offline',
        response_type: 'token',
        scope: 'email profile',
      };
      window.location.href = `${rootUrl}?${new URLSearchParams(options).toString()}`;
    } else if (provider === 'github' && githubClientId && githubClientId !== 'your_github_client_id_here') {
      const rootUrl = 'https://github.com/login/oauth/authorize';
      const options = {
        client_id: githubClientId,
        redirect_uri: window.location.origin,
        scope: 'read:user user:email',
      };
      window.location.href = `${rootUrl}?${new URLSearchParams(options).toString()}`;
    } else {
      setShowSocialModal(provider);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex p-2 lg:p-4 font-sans lg:h-screen lg:overflow-hidden">
      
      {/* LEFT: Cinematic Hero Grid Video Panel (Desktop only) */}
      <section className="hidden lg:flex w-[48%] relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full select-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_115139_0fc6bd3d-3631-4d26-ab9b-28293887dcc9.mp4"
            type="video/mp4"
          />
        </video>

        <div className="z-10 w-full max-w-md space-y-6 text-left">
          <div className="text-[10px] tracking-widest font-mono text-cyan-400 uppercase font-bold">
            PERSONAL INTELLIGENCE, ONLINE
          </div>

          <div className="space-y-4">
            <ScrollFloat
              containerClassName="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight"
              textClassName="text-3xl sm:text-4xl font-semibold text-white font-sans font-bold"
            >
              Intelligence that remembers what matters.
            </ScrollFloat>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Your private AI operating system for conversation, voice, memory, projects, and knowledge.
            </p>
          </div>

          <div className="text-xs text-white/45 font-mono pt-4 border-t border-white/10">
            Designed for Santhosh · Privacy first
          </div>
        </div>
      </section>

      {/* RIGHT: Login Fields Container */}
      <section ref={rightSectionRef} className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-12 lg:px-16 overflow-y-auto relative bg-black">
        {/* Decorative Grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:36px_36px] opacity-20 pointer-events-none" />

        <div className="w-full max-w-md space-y-8 z-10 text-left">
          
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left select-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-mono text-white/55 tracking-widest uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              SECURE LINK ACTIVE
            </div>
            {isLoginMode ? (
              <div className="flex flex-col gap-0 select-none">
                <ScrollFloat
                  scrollContainerRef={rightSectionRef}
                  containerClassName="text-3xl font-semibold tracking-tight text-white leading-none"
                  textClassName="text-3xl font-semibold text-white font-sans font-bold text-center lg:text-left"
                  scrollStart="top bottom"
                  scrollEnd="bottom center"
                >
                  Welcome
                </ScrollFloat>
                <ScrollFloat
                  scrollContainerRef={rightSectionRef}
                  containerClassName="text-3xl font-semibold tracking-tight text-white leading-none mt-1"
                  textClassName="text-3xl font-semibold text-white font-sans font-bold text-center lg:text-left"
                  scrollStart="top bottom"
                  scrollEnd="bottom center"
                >
                  back
                </ScrollFloat>
              </div>
            ) : (
              <ScrollFloat
                scrollContainerRef={rightSectionRef}
                containerClassName="text-3xl font-semibold tracking-tight text-white"
                textClassName="text-3xl font-semibold text-white font-sans font-bold text-center lg:text-left"
                scrollStart="top bottom"
                scrollEnd="bottom center"
              >
                Register Operator
              </ScrollFloat>
            )}
            <p className="text-white/40 text-xs">
              {isLoginMode 
                ? 'Continue to your private workspace' 
                : 'Create secure profile and configure intelligence workspace.'}
            </p>
          </div>

          {/* Social Signin buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialClick('google')}
              type="button"
              className="flex items-center justify-center gap-2 h-12 bg-black border border-white/10 rounded-xl hover:bg-white/5 transition-all text-xs font-semibold text-white/80 cursor-pointer select-none"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>
            <button
              onClick={() => handleSocialClick('github')}
              type="button"
              className="flex items-center justify-center gap-2 h-12 bg-black border border-white/10 rounded-xl hover:bg-white/5 transition-all text-xs font-semibold text-white/80 cursor-pointer select-none"
            >
              <GitHubIcon />
              <span>GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-2 select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative bg-black px-4 text-[9px] font-mono text-white/35 uppercase tracking-widest">Or</span>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="bg-red-950/30 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 font-mono">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            
            {/* Operator Names (Registration Only) */}
            {!isLoginMode && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-white/70 select-none">First Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-[13px] text-white/30" />
                    <input
                      type="text"
                      placeholder="John"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl h-11 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:ring-1 focus:ring-white/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-white/70 select-none">Last Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-[13px] text-white/30" />
                    <input
                      type="text"
                      placeholder="Doe"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl h-11 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:ring-1 focus:ring-white/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-white/70 select-none">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-[13px] text-white/30" />
                <input
                  type="email"
                  placeholder="operator@eva-os.net"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl h-11 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:ring-1 focus:ring-white/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Passphrase Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-white/70 select-none">Security Passphrase</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-[13px] text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl h-11 pl-10 pr-12 text-xs text-white placeholder:text-white/20 focus:ring-1 focus:ring-white/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[10px] p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isLoginMode && (
                <span className="text-[9px] text-white/30 font-mono select-none">Requires 8 characters minimum.</span>
              )}
            </div>

            {/* Submit Trigger Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-white/95 text-black font-semibold rounded-xl text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer select-none disabled:opacity-50 mt-6"
            >
              {isLoading ? 'Processing Ingress...' : isLoginMode ? 'Sign In' : 'Register Operator'}
            </button>
          </form>

          {/* Toggle Ingress Mode links */}
          <div className="text-center pt-2 select-none">
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setErrorMessage('');
              }}
              type="button"
              className="text-xs text-white/40 hover:text-white transition-colors tracking-wide font-mono cursor-pointer"
            >
              {isLoginMode ? 'New synapse profile? Register here' : 'Have security clearance? Sign in'}
            </button>
          </div>

        </div>
      </section>

      {/* Simulated Google Authentication Modal Overlay */}
      <AnimatePresence>
        {showSocialModal === 'google' && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0C0C0C] border border-white/10 rounded-2xl p-6 text-center space-y-6 shadow-2xl relative font-sans"
            >
              <div className="flex justify-center text-white">
                <GoogleIcon />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Sign in with Google</h3>
                <p className="text-xs text-white/40 mt-1">to continue setup on EVA AI OS</p>
              </div>

              <div className="space-y-2 text-left">
                {[
                  { name: 'Jack Harper', email: 'jack@tet.net', initial: 'JH' },
                  { name: 'Dr. Ryan Stone', email: 'ryan@nasa.gov', initial: 'RS' },
                ].map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={async () => {
                      const [first, last] = acc.name.split(' ');
                      setIsLoading(true);
                      setShowSocialModal(null);
                      try {
                        const res = await fetch('http://localhost:5000/api/register', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            firstName: first,
                            lastName: last,
                            email: acc.email,
                            password: 'GoogleOAuthPassphraseMock123'
                          })
                        });
                        const data = await res.json();
                        // If user already registered, do login fallback
                        if (!res.ok) {
                          const logRes = await fetch('http://localhost:5000/api/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: acc.email, password: 'GoogleOAuthPassphraseMock123' })
                          });
                          const logData = await logRes.json();
                          if (!logRes.ok) throw new Error(logData.message);
                          onAuthSuccess(logData.token, logData.operator);
                        } else {
                          onAuthSuccess(data.token, data.operator);
                        }
                      } catch (err: any) {
                        setErrorMessage(err.message || 'Social auth bridge error.');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs select-none">
                      {acc.initial}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{acc.name}</div>
                      <div className="text-[10px] text-white/40">{acc.email}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowSocialModal(null)}
                className="w-full py-2.5 border border-white/10 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer font-mono"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulated GitHub Authorization Overlay */}
      <AnimatePresence>
        {showSocialModal === 'github' && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0C0C0C] border border-white/10 rounded-2xl p-6 text-center space-y-6 shadow-2xl relative font-sans"
            >
              <div className="flex justify-center text-white">
                <GitHubIcon />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Authorize EVA AI</h3>
                <p className="text-xs text-white/40 mt-1">Requesting permissions for GitHub profile</p>
              </div>

              <div className="bg-[#0D0D0D] p-4 rounded-xl border border-white/5 text-left text-xs space-y-2 text-white/60 font-mono">
                <div className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Read public operator profile</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Access primary email address</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSocialModal(null)}
                  className="w-1/2 py-2.5 border border-white/10 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer font-mono"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    setShowSocialModal(null);
                    try {
                      const res = await fetch('http://localhost:5000/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          firstName: 'GitHub',
                          lastName: 'Operator',
                          email: 'operator@github.com',
                          password: 'GitHubOAuthPassphraseMock123'
                        })
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        const logRes = await fetch('http://localhost:5000/api/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: 'operator@github.com', password: 'GitHubOAuthPassphraseMock123' })
                        });
                        const logData = await logRes.json();
                        if (!logRes.ok) throw new Error(logData.message);
                        onAuthSuccess(logData.token, logData.operator);
                      } else {
                        onAuthSuccess(data.token, data.operator);
                      }
                    } catch (err: any) {
                      setErrorMessage(err.message || 'Social auth bridge error.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="w-1/2 py-2.5 bg-white text-black rounded-xl text-xs font-semibold hover:bg-white/90 transition-all cursor-pointer font-mono"
                >
                  Authorize
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
