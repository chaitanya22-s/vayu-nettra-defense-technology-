/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Radio,
  FlaskConical,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';
import { VayuNetraLogo } from '../shared/VayuNetraLogo';
import { PortalRole } from '../../types/simulation';

interface LoginPageProps {
  onLoginSuccess: (email: string, role: string, portalRole: PortalRole) => void;
  onContinueAsGuest?: (portalRole: PortalRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
}) => {
  const [email, setEmail] = useState<string>('lead.researcher@vayu-netra.gov.in');
  const [password, setPassword] = useState<string>('simulation_auth_token_2026');
  const [selectedRole, setSelectedRole] = useState<PortalRole>('lead_researcher');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);

  // Initialization animation states
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [initProgress, setInitProgress] = useState<number>(0);
  const [initStageText, setInitStageText] = useState<string>('');

  // Animated synthetic spectrum bars
  const [spectrumBars, setSpectrumBars] = useState<number[]>([]);

  useEffect(() => {
    // Generate initial spectrum heights
    setSpectrumBars(Array.from({ length: 30 }, (_, i) => 15 + Math.sin(i * 0.7) * 35 + ((i % 5 === 0) ? 42 : 6)));

    const interval = setInterval(() => {
      setSpectrumBars((prev) =>
        prev.map((val, i) => {
          const delta = (Math.random() * 16 - 8);
          const base = 22 + Math.sin((i + Date.now() / 850) * 0.9) * 32;
          return Math.max(10, Math.min(96, base + delta + (i % 6 === 0 ? 38 : 0)));
        })
      );
    }, 180);

    return () => clearInterval(interval);
  }, []);

  const executeLogin = (userEmail: string, portalRole: PortalRole) => {
    soundEffects.playLearningPing();
    setIsInitializing(true);
    setInitProgress(15);
    setInitStageText('Authenticating Researcher Credentials...');

    const roleName =
      portalRole === 'lead_researcher'
        ? 'Lead Researcher'
        : 'Senior Algorithm Evaluator';

    setTimeout(() => {
      setInitProgress(50);
      setInitStageText('Initializing Synthetic RF Multi-Band Matrix (500 – 3500 MHz)...');
      soundEffects.playSweepClick();
    }, 250);

    setTimeout(() => {
      setInitProgress(85);
      setInitStageText('Calibrating Adaptive ML Scheduling Heuristics & Policy Weights...');
      soundEffects.playSweepClick();
    }, 500);

    setTimeout(() => {
      setInitProgress(100);
      setInitStageText('System Ready: Launching Simulation Workspace...');
      soundEffects.playHitSound();
    }, 750);

    setTimeout(() => {
      onLoginSuccess(userEmail, roleName, portalRole);
    }, 950);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    executeLogin(email, selectedRole);
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background ambient glowing spheres */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-[#070b16] border border-cyan-500/35 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 relative glow-cyan">
        {/* LEFT COLUMN: Aerospace Lab Branding & Animated Spectrum Visualizer (7 cols on lg) */}
        <div className="lg:col-span-7 p-6 sm:p-10 bg-gradient-to-br from-[#030612] via-[#061226] to-[#040816] border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3.5">
              <VayuNetraLogo size="lg" animated={true} />
              <div>
                <div className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                  ELECTRONIC SUPPORT RESEARCH PLATFORM
                </div>
                <h1 className="font-tech text-2xl sm:text-3xl font-black tracking-wider text-slate-100 uppercase">
                  VAYU<span className="text-cyan-400">-NETRA</span>{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                    INTELLIGENCE
                  </span>
                </h1>
              </div>
            </div>

            <div className="pt-2 space-y-1">
              <div className="text-sm sm:text-base text-cyan-300 font-medium font-sans leading-relaxed">
                “Adaptive intelligence for spectrum surveillance simulation.”
              </div>
              <div className="text-xs font-mono text-slate-400">
                Observe • Learn • Predict • Schedule
              </div>
            </div>
          </div>

          {/* Animated Synthetic Time-Frequency Spectrum Visualizer */}
          <div className="relative z-10 my-6 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Radio className="w-3.5 h-3.5" />
                <span>Synthetic Wideband RF Spectrum (500 MHz – 3500 MHz)</span>
              </div>
              <span className="text-emerald-400 font-semibold animate-pulse text-[10px]">
                ● LIVE SYNTHESIS
              </span>
            </div>

            <div className="h-40 bg-[#02050e] border border-cyan-950 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

              {/* Noise floor marker line */}
              <div className="absolute left-0 right-0 bottom-6 border-b border-dashed border-slate-800/80 flex items-center justify-between px-2 text-[8px] font-mono text-slate-600">
                <span>Thermal Noise Floor ~ -95 dBm</span>
                <span>Adaptive LO Sweep Cursor</span>
              </div>

              {/* Spectrum Energy Bars */}
              <div className="relative z-10 w-full h-26 flex items-end justify-between gap-1 px-1">
                {spectrumBars.map((height, i) => {
                  const isPeak = height > 65;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-xs transition-all duration-200 relative ${
                        isPeak
                          ? 'bg-gradient-to-t from-emerald-600 to-cyan-300 shadow-[0_0_8px_#06b6d4]'
                          : 'bg-gradient-to-t from-slate-900 to-cyan-900/60'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>

              {/* Frequency Scale */}
              <div className="relative z-10 border-t border-slate-900 pt-1 flex justify-between text-[9px] font-mono text-slate-500">
                <span>500 MHz</span>
                <span>1500 MHz (L-Band)</span>
                <span>2500 MHz (S-Band)</span>
                <span>3500 MHz</span>
              </div>
            </div>
          </div>

          {/* Environment Specs & Security Badge */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Secure Research Environment</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span>Synthetic RF Data Only</span>
              <span>·</span>
              <span>Zero Hardware Connection</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Research Environment Login (5 cols on lg) */}
        <div className="lg:col-span-5 p-6 sm:p-10 bg-[#070b16] flex flex-col justify-center relative">
          {/* Ambient subtle glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          {isInitializing ? (
            /* Animated System Initialization Screen */
            <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin glow-cyan" />
                <div className="absolute inset-0 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                  {initProgress}%
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-tech text-lg font-bold text-slate-100">
                  Initializing Vayu-Netra Lab...
                </h3>
                <p className="text-xs font-mono text-cyan-300 animate-pulse max-w-xs">
                  {initStageText}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${initProgress}%` }}
                />
              </div>

              <div className="text-[10px] font-mono text-slate-500">
                Preparing Closed-Loop Reinforcement Scheduler
              </div>
            </div>
          ) : (
            /* Normal Login Form */
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-tech text-xl font-bold text-slate-100">
                    Research Environment Login
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/50 text-emerald-400">
                    PORTAL ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Authenticate to access the electronic support receiver simulation platform.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
                {/* Email input */}
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="researcher@lab.gov.in"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors text-xs"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <label className="text-slate-400">Password</label>
                    <span className="text-[10px] text-cyan-400/80 cursor-pointer hover:underline">
                      Token Auth
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-9 py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember device checkbox */}
                <div className="flex items-center justify-between pt-0.5 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="accent-cyan-400 rounded"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-slate-500">256-Bit Session</span>
                </div>

                {/* Secure Login Button */}
                <button
                  type="submit"
                  className={`w-full py-2.5 px-4 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-2 shadow-lg ${
                    selectedRole === 'lead_researcher'
                      ? 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 glow-cyan ring-1 ring-cyan-400/50'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 ring-1 ring-emerald-400/50'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    Secure Login: {selectedRole === 'lead_researcher' ? 'Enter Research Lab' : 'Enter Evaluation Lab'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Below: Select your research role with Two Cards */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                <div className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                  <span>Select your research role</span>
                  <span className="text-[10px] text-cyan-400">Click to Switch Portal</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Card 1: Lead Researcher */}
                  <div
                    onClick={() => {
                      setSelectedRole('lead_researcher');
                      setEmail('lead.researcher@vayu-netra.gov.in');
                      soundEffects.playSweepClick();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                      selectedRole === 'lead_researcher'
                        ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/40 glow-cyan'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-cyan-600/60 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:scale-105 transition-transform">
                          <FlaskConical className="w-4 h-4" />
                        </div>
                        {selectedRole === 'lead_researcher' ? (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950">
                            SELECTED
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-500">Select</span>
                        )}
                      </div>
                      <div className="font-tech text-xs font-bold uppercase tracking-wider text-slate-100">
                        Lead Researcher
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans leading-tight">
                        Design & manage research
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRole('lead_researcher');
                          executeLogin('lead.researcher@vayu-netra.gov.in', 'lead_researcher');
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-[10px] flex items-center justify-center gap-1 transition-all shadow"
                      >
                        <span>Enter Research Lab</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Algorithm Evaluator */}
                  <div
                    onClick={() => {
                      setSelectedRole('evaluator');
                      setEmail('evaluator@vayu-netra.gov.in');
                      soundEffects.playSweepClick();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                      selectedRole === 'evaluator'
                        ? 'bg-emerald-950/50 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-emerald-600/60 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:scale-105 transition-transform">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        {selectedRole === 'evaluator' ? (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950">
                            SELECTED
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-500">Select</span>
                        )}
                      </div>
                      <div className="font-tech text-xs font-bold uppercase tracking-wider text-slate-100">
                        Algorithm Evaluator
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans leading-tight">
                        Test & validate algorithms
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRole('evaluator');
                          executeLogin('evaluator@vayu-netra.gov.in', 'evaluator');
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-[10px] flex items-center justify-center gap-1 transition-all shadow"
                      >
                        <span>Enter Evaluation Lab</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Guest Demo Launch */}
              {onContinueAsGuest && (
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onContinueAsGuest('lead_researcher')}
                    className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 text-[10px] font-mono flex items-center justify-center gap-1 transition-colors"
                  >
                    <FlaskConical className="w-3 h-3" />
                    <span>Guest: Research Lab</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onContinueAsGuest('evaluator')}
                    className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-emerald-300 text-[10px] font-mono flex items-center justify-center gap-1 transition-colors"
                  >
                    <BarChart3 className="w-3 h-3" />
                    <span>Guest: Evaluation Lab</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
