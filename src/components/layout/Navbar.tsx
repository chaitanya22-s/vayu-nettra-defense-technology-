/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Menu,
  Shield,
  Zap,
  ArrowRightLeft,
  User,
  Bell,
  LogOut,
  ChevronDown,
  CheckCircle2,
  FlaskConical,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';
import { VayuNetraLogo } from '../shared/VayuNetraLogo';
import { PortalRole } from '../../types/simulation';

interface NavbarProps {
  portalRole: PortalRole;
  timeStep: number;
  isRunning: boolean;
  bandCount: number;
  activeSignalsCount: number;
  soundEnabled: boolean;
  userEmail: string | null;
  onToggleSound: () => void;
  onOpenRoleSelection: () => void;
  onSwitchPortalRole: (role: PortalRole) => void;
  onOpenLoginPage: () => void;
  onOpenDemoTour: () => void;
  onOpenResponsibleModal: () => void;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  portalRole,
  timeStep,
  isRunning,
  bandCount,
  activeSignalsCount,
  soundEnabled,
  userEmail,
  onToggleSound,
  onOpenRoleSelection,
  onSwitchPortalRole,
  onOpenLoginPage,
  onOpenDemoTour,
  onOpenResponsibleModal,
  onToggleMobileMenu,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-cyan-950/40 bg-[#060a14]/95 backdrop-blur-md">
      {/* Top Scientific Simulation Status Strip */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 text-[11px] font-mono border-b border-slate-900 bg-[#04070e] text-slate-400">
        <div className="flex items-center gap-3 overflow-x-auto py-0.5 scrollbar-none">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className={`inline-block w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-semibold text-slate-200">
              {isRunning ? 'SIMULATION RUNNING' : 'SIMULATION PAUSED'}
            </span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300 whitespace-nowrap">
            <span className="text-slate-500">STATUS:</span>
            <span className={portalRole === 'lead_researcher' ? 'text-emerald-400 font-semibold' : 'text-teal-400 font-semibold'}>
              {portalRole === 'lead_researcher' ? '🟢 Research Environment Active' : '🟢 Benchmark Engine Online'}
            </span>
          </div>
          <span className="text-slate-700 hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-1 text-slate-300 whitespace-nowrap">
            <span className="text-slate-500">ENV:</span>
            <span className="text-cyan-400 font-medium">Synthetic RF (500–3500 MHz)</span>
          </div>
          <span className="text-slate-700 hidden lg:inline">|</span>
          <div className="flex items-center gap-1 text-slate-300 whitespace-nowrap">
            <span className="text-slate-500">TIME STEP:</span>
            <span className="text-cyan-300 font-bold">{timeStep.toLocaleString()}</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="flex items-center gap-1 text-slate-300 whitespace-nowrap">
            <span className="text-slate-500">BANDS:</span>
            <span className="text-slate-200">{bandCount}</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="flex items-center gap-1 text-slate-300 whitespace-nowrap">
            <span className="text-slate-500">SIGNALS:</span>
            <span className="text-amber-400 font-semibold">{activeSignalsCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenResponsibleModal}
            className="flex items-center gap-1 text-cyan-400/90 hover:text-cyan-300 transition-colors text-[10px] px-2 py-0.5 rounded border border-cyan-900/60 bg-cyan-950/20"
            title="Educational & Synthetic Simulation Statement"
          >
            <Shield className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Safe Simulation Only</span>
          </button>
          <span className="text-slate-600 hidden sm:inline text-[10px]">·</span>
          <span className="text-[10px] text-slate-500 font-mono tracking-wider hidden sm:inline">
            Observe • Learn • Predict • Schedule
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Unique Vayu-Netra Intelligence Logo */}
          <div className="flex items-center gap-3">
            <VayuNetraLogo size="sm" animated={isRunning} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tech text-base sm:text-lg font-black tracking-wider text-slate-100 uppercase">
                  VAYU<span className="text-cyan-400">-NETRA</span>{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 font-black">
                    INTELLIGENCE
                  </span>
                </span>

                {/* Interactive Role Badge - Click to switch portal */}
                <button
                  onClick={() => {
                    const nextRole = portalRole === 'lead_researcher' ? 'evaluator' : 'lead_researcher';
                    onSwitchPortalRole(nextRole);
                  }}
                  title={`Active: ${portalRole === 'lead_researcher' ? 'Lead Researcher' : 'Algorithm Evaluator'}. Click to switch to ${portalRole === 'lead_researcher' ? 'Algorithm Evaluator' : 'Lead Researcher'}`}
                  className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 ${
                    portalRole === 'lead_researcher'
                      ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500 hover:bg-cyan-900/90 glow-cyan'
                      : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500 hover:bg-emerald-900/90'
                  }`}
                >
                  <span>{portalRole === 'lead_researcher' ? '👨‍🔬' : '📊'}</span>
                  <span>{portalRole === 'lead_researcher' ? 'LEAD RESEARCHER' : 'ALGORITHM EVALUATOR'}</span>
                  <ArrowRightLeft className="w-2.5 h-2.5 opacity-70" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 tracking-tight hidden sm:block">
                Adaptive Intelligence for Spectrum Surveillance Simulation
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Interactive Portal Selector */}
        <div className="flex items-center gap-2">
          {/* PRIMARY PORTAL SELECTOR: Instant 1-Click Option Selection */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/95 border border-slate-800 text-xs font-mono shadow-inner">
            <button
              onClick={() => onSwitchPortalRole('lead_researcher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                portalRole === 'lead_researcher'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md glow-cyan ring-1 ring-cyan-400/50'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
              }`}
              title="Select Lead Researcher Portal (Research Lifecycle)"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lead Researcher</span>
              {portalRole === 'lead_researcher' && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 ml-0.5 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => onSwitchPortalRole('evaluator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                portalRole === 'evaluator'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold shadow-md ring-1 ring-emerald-400/50'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60'
              }`}
              title="Select Algorithm Evaluator Portal (Validation Suite)"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Algorithm Evaluator</span>
              {portalRole === 'evaluator' && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 ml-0.5 animate-pulse" />
              )}
            </button>
          </div>

          {/* Quick Demo Tour */}
          <button
            onClick={onOpenDemoTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 hover:bg-cyan-500/25 transition-all text-xs font-medium"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Demo Tour</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              if (!soundEnabled) {
                soundEffects.playLearningPing();
              }
            }}
            className="p-2 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title={soundEnabled ? 'Mute Simulation Sound' : 'Enable Radar Sound FX'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="p-2 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#070b16] border border-slate-800 rounded-xl p-3 shadow-2xl z-50 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] text-slate-400 uppercase">
                  <span>System Notifications</span>
                  <span className="text-cyan-400">2 New</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 rounded bg-slate-900/70 border border-slate-800 text-slate-300">
                    <span className="text-cyan-400 font-bold">RQ-001 Update:</span> Evaluator certified delay advantage of -58% vs baseline sweep.
                  </div>
                  <div className="p-2 rounded bg-slate-900/70 border border-slate-800 text-slate-300">
                    <span className="text-emerald-400 font-bold">Queue Alert:</span> New evaluation request EV-2026-081 ready for benchmark review.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu Dropdown (Profile, Notifications, Logout) */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                {portalRole === 'lead_researcher' ? 'R' : 'E'}
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate">{userEmail?.split('@')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#070b16] border border-slate-800 rounded-xl p-3 shadow-2xl z-50 font-mono text-xs space-y-2">
                <div className="border-b border-slate-800 pb-2">
                  <div className="text-[10px] uppercase text-cyan-400 font-bold">Active User Profile</div>
                  <div className="text-slate-200 font-bold text-xs truncate mt-0.5">{userEmail}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Role: {portalRole === 'lead_researcher' ? 'Lead Scientific Researcher' : 'Algorithm Evaluator (QA)'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider px-2 pt-1 font-semibold">
                    Select Portal Workspace:
                  </div>

                  {/* Option 1: Lead Researcher */}
                  <button
                    onClick={() => {
                      onSwitchPortalRole('lead_researcher');
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                      portalRole === 'lead_researcher'
                        ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-200 font-bold'
                        : 'hover:bg-slate-900 text-slate-300 hover:text-cyan-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Lead Researcher Lab</span>
                    </div>
                    {portalRole === 'lead_researcher' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </button>

                  {/* Option 2: Algorithm Evaluator */}
                  <button
                    onClick={() => {
                      onSwitchPortalRole('evaluator');
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                      portalRole === 'evaluator'
                        ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 font-bold'
                        : 'hover:bg-slate-900 text-slate-300 hover:text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Algorithm Evaluator Suite</span>
                    </div>
                    {portalRole === 'evaluator' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onOpenRoleSelection();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors text-left"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Open Role Selection Modal</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenLoginPage();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-rose-950/40 text-rose-400 transition-colors text-left border-t border-slate-800/80 pt-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
