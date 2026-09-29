/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EmitterType,
  FrequencyBand,
  PatternType,
  ScenarioPreset,
  SyntheticEmitter,
} from '../../types/simulation';
import { SCENARIO_PRESETS } from '../../services/simulationEngine';
import {
  Flame,
  Radio,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Zap,
  ShieldAlert,
  Play,
  Pause,
  RefreshCw,
  Check,
  Activity,
  Sliders,
  Sparkles,
  ArrowRight,
  Crosshair,
  Gauge,
  Signal,
  Layers,
  X,
  AlertTriangle,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface RfEnvironmentSimulatorProps {
  currentScenario: ScenarioPreset;
  bands: FrequencyBand[];
  emitters: SyntheticEmitter[];
  timeStep: number;
  isRunning?: boolean;
  onTogglePlay?: () => void;
  onSelectPreset: (preset: ScenarioPreset) => void;
  onApplyCustomConfig: (config: {
    bandCount: number;
    emitterCount: number;
    pattern: PatternType;
    randomness: number;
    density: number;
    noiseDbm: number;
    emitters?: SyntheticEmitter[];
  }) => void;
  onAddEmitter?: (emitter: SyntheticEmitter) => void;
  onDeleteEmitter?: (emitterId: string) => void;
  onUpdateEmitter?: (emitterId: string, updates: Partial<SyntheticEmitter>) => void;
  onInjectJamming?: (bandIndex: number, powerDbm: number, durationSteps: number) => void;
  onClearJamming?: () => void;
  onNavigateToLiveSim?: () => void;
}

export const RfEnvironmentSimulator: React.FC<RfEnvironmentSimulatorProps> = ({
  currentScenario,
  bands,
  emitters,
  timeStep,
  isRunning = false,
  onTogglePlay,
  onSelectPreset,
  onApplyCustomConfig,
  onAddEmitter,
  onDeleteEmitter,
  onUpdateEmitter,
  onInjectJamming,
  onClearJamming,
  onNavigateToLiveSim,
}) => {
  // Global Environment Tuning States
  const [bandCount, setBandCount] = useState<number>(currentScenario.bandCount || 24);
  const [pattern, setPattern] = useState<PatternType>(currentScenario.pattern || 'mixed');
  const [randomness, setRandomness] = useState<number>(currentScenario.randomness || 0.35);
  const [density, setDensity] = useState<number>(currentScenario.activityDensity || 0.4);
  const [noiseDbm, setNoiseDbm] = useState<number>(currentScenario.noiseDbm || -95);

  // Filter & Selected Band
  const [selectedBandFilter, setSelectedBandFilter] = useState<number | null>(null);

  // New Emitter Modal State
  const [isAddEmitterOpen, setIsAddEmitterOpen] = useState<boolean>(false);
  const [newEmitterName, setNewEmitterName] = useState<string>('Tactical Radar Emitter');
  const [newEmitterType, setNewEmitterType] = useState<EmitterType>('radar_pulsed');
  const [newEmitterBand, setNewEmitterBand] = useState<number>(0);
  const [newEmitterPower, setNewEmitterPower] = useState<number>(-35);
  const [newEmitterDuty, setNewEmitterDuty] = useState<number>(0.3);
  const [newEmitterPeriod, setNewEmitterPeriod] = useState<number>(10);
  const [newEmitterBurstLen, setNewEmitterBurstLen] = useState<number>(3);
  const [newEmitterBurstInt, setNewEmitterBurstInt] = useState<number>(12);
  const [newEmitterMod, setNewEmitterMod] = useState<'LFM_Chirp' | 'Barker_13' | 'QPSK' | 'FHSS' | 'CW_Unmodulated' | 'Gaussian_Noise'>('LFM_Chirp');
  const [newEmitterPri, setNewEmitterPri] = useState<number>(500); // us
  const [newEmitterDistance, setNewEmitterDistance] = useState<number>(15); // km
  const [newEmitterFading, setNewEmitterFading] = useState<'Rayleigh' | 'Rician' | 'FreeSpace'>('FreeSpace');

  // Jamming Modal / Panel State
  const [jamTargetBand, setJamTargetBand] = useState<number>(1);
  const [jamPowerDbm, setJamPowerDbm] = useState<number>(-22);
  const [jamDuration, setJamDuration] = useState<number>(35);
  const [jamType, setJamType] = useState<'spot' | 'barrage'>('spot');

  // Success Feedback Toast
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Active Emitters Count
  const activeEmittersCount = emitters.filter((e) => e.active && !e.isMuted).length;
  const jammerCount = emitters.filter((e) => e.isJammer || e.type === 'jammer_noise').length;

  // Handle Preset Select
  const handleSelectPreset = (preset: ScenarioPreset) => {
    onSelectPreset(preset);
    setBandCount(preset.bandCount);
    setPattern(preset.pattern);
    setRandomness(preset.randomness);
    setDensity(preset.activityDensity);
    setNoiseDbm(preset.noiseDbm);
    soundEffects.playDeployClick();
    showToast(`Loaded benchmark scenario: ${preset.name.split(':')[0]}`);
  };

  // Handle Add Emitter
  const handleCreateEmitter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmitterName.trim()) return;

    const targetBand = bands[newEmitterBand] || bands[0];
    const createdEmitter: SyntheticEmitter = {
      id: `em-synth-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newEmitterName.trim(),
      bandIndex: newEmitterBand,
      type: newEmitterType,
      pattern: pattern,
      period: newEmitterPeriod,
      dutyCycle: newEmitterDuty,
      burstLength: newEmitterBurstLen,
      burstInterval: newEmitterBurstInt,
      powerDbm: newEmitterPower,
      active: false,
      frequencyMHz: targetBand?.centerFreqMHz || 1500,
      bandwidthMHz: targetBand ? Math.round(targetBand.bandwidthMHz * 0.7) : 80,
      label: `Synthetic ${newEmitterType.replace('_', ' ').toUpperCase()}`,
      modulation: newEmitterMod,
      priUs: newEmitterPri,
      pulseWidthUs: Math.round(newEmitterPri * newEmitterDuty * 0.1),
      distanceKm: newEmitterDistance,
      fadingModel: newEmitterFading,
      isJammer: newEmitterType === 'jammer_noise',
      isMuted: false,
    };

    if (onAddEmitter) {
      onAddEmitter(createdEmitter);
    } else {
      // Fallback update
      onApplyCustomConfig({
        bandCount,
        emitterCount: emitters.length + 1,
        pattern,
        randomness,
        density,
        noiseDbm,
        emitters: [...emitters, createdEmitter],
      });
    }

    soundEffects.playDeployClick();
    showToast(`Injected emitter: ${createdEmitter.name} on ${targetBand?.name || 'Band'}`);
    setIsAddEmitterOpen(false);
  };

  // Handle Inject Jamming
  const handleDeployJammer = () => {
    if (jamType === 'barrage') {
      // Barrage over 3 adjacent channels
      const center = jamTargetBand;
      const b1 = Math.max(0, center - 1);
      const b2 = center;
      const b3 = Math.min(bands.length - 1, center + 1);
      [b1, b2, b3].forEach((b) => {
        if (onInjectJamming) {
          onInjectJamming(b, jamPowerDbm, jamDuration);
        }
      });
      showToast(`Barrage Jammer deployed across Bands #${b1 + 1}, #${b2 + 1}, #${b3 + 1} (${jamPowerDbm} dBm)`);
    } else {
      // Spot Jammer on single channel
      if (onInjectJamming) {
        onInjectJamming(jamTargetBand, jamPowerDbm, jamDuration);
      }
      showToast(`Spot Noise Jammer deployed on Band #${jamTargetBand + 1} (${jamPowerDbm} dBm)`);
    }
    soundEffects.playAlertWarning();
  };

  // Handle Clear Jamming
  const handleClearAllJamming = () => {
    if (onClearJamming) {
      onClearJamming();
      showToast('All active jamming emissions cleared.');
    }
  };

  // Apply Global Config
  const handleApplyGlobalConfig = () => {
    onApplyCustomConfig({
      bandCount,
      emitterCount: emitters.length,
      pattern,
      randomness,
      density,
      noiseDbm,
      emitters,
    });
    soundEffects.playDeployClick();
    showToast(`Updated RF Environment parameters (${bandCount} bands, ${density * 100}% density)`);
  };

  return (
    <div className="space-y-5">
      {/* Toast Alert Banner */}
      {statusMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-200 font-mono text-xs shadow-2xl flex items-center gap-3 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span className="font-semibold">{statusMessage}</span>
        </div>
      )}

      {/* 1. Header Banner & Live Control Strip */}
      <div className="rounded-2xl border border-cyan-500/50 bg-[#060b18] p-5 relative overflow-hidden shadow-2xl glow-cyan">
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-tech text-xs uppercase tracking-widest text-cyan-400 font-bold">
                SYNTHETIC EW ENVIRONMENT
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>RF ENVIRONMENT SIMULATOR</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
                ● Live Spectrum Engine Active
              </span>
            </div>

            <h1 className="font-tech text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-wide">
              Multi-Emitter RF Environment & Waveform Simulator
            </h1>

            <p className="text-xs text-slate-300 font-sans max-w-3xl">
              Synthesize multi-channel RF emission environments, configure pulse repetition intervals (PRI), simulate radar agility, inject electronic attack noise jamming, and observe live receiver responses in real time.
            </p>
          </div>

          {/* Quick Simulation & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onTogglePlay && (
              <button
                onClick={onTogglePlay}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-black tracking-wider transition-all shadow-md cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 glow-amber'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 glow-emerald animate-pulse'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>PAUSE ENGINE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>START LIVE SWEEP</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setIsAddEmitterOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs transition-all shadow-md glow-cyan cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Inject Emitter</span>
            </button>

            {onNavigateToLiveSim && (
              <button
                onClick={onNavigateToLiveSim}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-800/80 text-cyan-300 font-mono text-xs transition-colors cursor-pointer"
                title="View Full Live Spectrum Surveillance Screen"
              >
                <span>Live Spectrum View</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            )}
          </div>
        </div>

        {/* Real-time Environment Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4 mt-4 border-t border-cyan-900/40 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-[#040816] border border-cyan-900/50">
            <span className="text-[10px] text-slate-400 block uppercase">RF Channels</span>
            <strong className="text-cyan-300 text-base font-bold">{bands.length} Bands</strong>
            <span className="text-[9px] text-slate-500 block">500 – 3500 MHz</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#040816] border border-cyan-900/50">
            <span className="text-[10px] text-slate-400 block uppercase">Active Transmitters</span>
            <strong className="text-emerald-400 text-base font-bold">
              {activeEmittersCount} / {emitters.length}
            </strong>
            <span className="text-[9px] text-emerald-500 block">Pulsing this dwell</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#040816] border border-cyan-900/50">
            <span className="text-[10px] text-slate-400 block uppercase">Spectral Agility</span>
            <strong className="text-cyan-200 text-base font-bold uppercase">{pattern}</strong>
            <span className="text-[9px] text-slate-500 block">{(randomness * 100).toFixed(0)}% entropy</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#040816] border border-cyan-900/50">
            <span className="text-[10px] text-slate-400 block uppercase">Activity Density</span>
            <strong className="text-amber-400 text-base font-bold">{(density * 100).toFixed(0)}%</strong>
            <span className="text-[9px] text-slate-500 block">Duty factor</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#040816] border border-cyan-900/50">
            <span className="text-[10px] text-slate-400 block uppercase">Noise Floor</span>
            <strong className="text-slate-200 text-base font-bold">{noiseDbm} dBm</strong>
            <span className="text-[9px] text-slate-500 block">Thermal baseline</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#040816] border border-cyan-900/50">
            <span className="text-[10px] text-slate-400 block uppercase">Electronic Attack</span>
            <strong className={`text-base font-bold ${jammerCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
              {jammerCount > 0 ? `${jammerCount} JAMMERS` : 'QUIET'}
            </strong>
            <span className="text-[9px] text-slate-500 block">
              {jammerCount > 0 ? 'Interference Active' : 'No Jamming'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Spectrum Channels Map & Live Pulse Strobe */}
      <div className="rounded-2xl border border-slate-800 bg-[#070b16] p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-700/60">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="font-tech text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
                Live Channel Spectrum Allocation & Emitter Distribution
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Click any channel to filter emitters or tune tactical emissions into that exact band
              </p>
            </div>
          </div>

          {selectedBandFilter !== null && (
            <button
              onClick={() => setSelectedBandFilter(null)}
              className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Clear Filter (Band #{selectedBandFilter + 1})</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 24-Band Channel Interactive Visual Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 pt-2">
          {bands.map((band, idx) => {
            const emittersInBand = emitters.filter((e) => e.bandIndex === idx);
            const isBandActive = band.trueActivity;
            const hasJammer = emittersInBand.some((e) => e.isJammer || e.type === 'jammer_noise');
            const isSelected = selectedBandFilter === idx;

            return (
              <div
                key={band.id}
                onClick={() => setSelectedBandFilter(selectedBandFilter === idx ? null : idx)}
                className={`p-2.5 rounded-xl border text-center font-mono text-xs cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg'
                    : isBandActive
                    ? hasJammer
                      ? 'bg-rose-950/60 border-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse'
                      : 'bg-emerald-950/40 border-emerald-600/70 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-[#040813] border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                    <span>{band.name}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isBandActive
                          ? hasJammer
                            ? 'bg-rose-400 animate-ping'
                            : 'bg-emerald-400 animate-ping'
                          : 'bg-slate-700'
                      }`}
                    />
                  </div>
                  <div className="text-[11px] font-bold text-slate-200">
                    {band.centerFreqMHz}M
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {band.signalEnergyDbm.toFixed(0)} dBm
                  </div>
                </div>

                <div className="mt-2 pt-1 border-t border-slate-800/60 text-[9px] flex items-center justify-between">
                  <span className="text-slate-400">
                    {emittersInBand.length > 0 ? `${emittersInBand.length} Em` : 'Idle'}
                  </span>
                  {hasJammer && <span className="text-rose-400 font-bold">JAM</span>}
                  {isBandActive && !hasJammer && <span className="text-emerald-400 font-bold">TX</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Active RF Transmission</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-rose-300">Electronic Attack Jammer</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              <span className="text-slate-400">Idle Noise Floor</span>
            </span>
          </div>

          <span>Current Simulation Dwell: Step #{timeStep.toLocaleString()}</span>
        </div>
      </div>

      {/* 3. Standard Scenario Presets Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-tech font-bold uppercase tracking-wider text-slate-200">
          <span>Standard RF Benchmark Scenario Packs</span>
          <span className="text-[10px] font-mono text-cyan-400">5 Pre-Configured Profiles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCENARIO_PRESETS.map((preset) => {
            const isSelected = preset.id === currentScenario.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] glow-cyan'
                    : 'bg-[#040813] border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-mono text-slate-100 flex items-center gap-2">
                      <span>{preset.name}</span>
                    </span>
                    {isSelected ? (
                      <span className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-mono text-[10px] font-black flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>ACTIVE</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-cyan-400 hover:underline">
                        Apply Preset →
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{preset.emitterCount} Emitters</span>
                  <span>Density: {(preset.activityDensity * 100).toFixed(0)}%</span>
                  <span className="text-cyan-400 capitalize">{preset.pattern}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Two-Column Workspace: Electronic Attack Suite & Custom Parameter Tuning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Electronic Attack & Noise Jammer Suite */}
        <div className="lg:col-span-5 rounded-2xl border border-rose-900/60 bg-[#090510] p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-rose-900/50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800/60">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Electronic Attack / Jamming Suite
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Inject high-power jamming to stress test receiver false-alarms
                </p>
              </div>
            </div>

            {jammerCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] font-bold border border-rose-700 animate-pulse">
                {jammerCount} Active Jammer
              </span>
            )}
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Jammer Type Selector */}
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px]">Jammer Mode:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJamType('spot')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    jamType === 'spot'
                      ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Spot Jammer (Single Band)
                </button>
                <button
                  type="button"
                  onClick={() => setJamType('barrage')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    jamType === 'barrage'
                      ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Barrage Jammer (3 Bands)
                </button>
              </div>
            </div>

            {/* Target Channel */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>Target RF Band:</span>
                <span className="text-rose-400 font-bold">
                  Band #{jamTargetBand + 1} ({bands[jamTargetBand]?.centerFreqMHz || 1500} MHz)
                </span>
              </div>
              <select
                value={jamTargetBand}
                onChange={(e) => setJamTargetBand(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs"
              >
                {bands.map((b, i) => (
                  <option key={b.id} value={i}>
                    {b.name} — {b.centerFreqMHz} MHz ({b.bandwidthMHz} MHz BW)
                  </option>
                ))}
              </select>
            </div>

            {/* Jammer Power */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>Effective Jammer Power:</span>
                <span className="text-rose-400 font-bold">{jamPowerDbm} dBm (High SNR)</span>
              </div>
              <input
                type="range"
                min="-40"
                max="-10"
                step="1"
                value={jamPowerDbm}
                onChange={(e) => setJamPowerDbm(parseInt(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>-40 dBm (Covert)</span>
                <span>-25 dBm (Standard)</span>
                <span>-10 dBm (Brute Force)</span>
              </div>
            </div>

            {/* Duration Steps */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>Burst Duration:</span>
                <span className="text-rose-300 font-bold">{jamDuration} Dwells (~{jamDuration * 25} ms)</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={jamDuration}
                onChange={(e) => setJamDuration(parseInt(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleDeployJammer}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Deploy Jammer Into Spectrum</span>
              </button>

              {jammerCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllJamming}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs transition-colors cursor-pointer"
                  title="Clear Jamming"
                >
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Fine-Grained Environment Parameter Tuning */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#070b16] p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Synthetic Environment Global Parameters
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Modify band counts, temporal agility models, and receiver noise baseline
                </p>
              </div>
            </div>

            <button
              onClick={handleApplyGlobalConfig}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-md glow-cyan cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Apply Parameters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Band Count */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>Total Frequency Channels:</span>
                <strong className="text-cyan-400 font-bold">{bandCount} Bands</strong>
              </div>
              <input
                type="range"
                min="16"
                max="48"
                step="4"
                value={bandCount}
                onChange={(e) => setBandCount(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>16 (Coarse)</span>
                <span>24 (Standard)</span>
                <span>48 (Dense)</span>
              </div>
            </div>

            {/* Agility Pattern */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>Temporal Pattern Model:</span>
                <strong className="text-cyan-300 font-bold uppercase">{pattern}</strong>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {(['periodic', 'bursty', 'mixed'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPattern(p)}
                    className={`py-1 text-[10px] rounded transition-colors uppercase font-bold cursor-pointer ${
                      pattern === p
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Density */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>Channel Activity Density:</span>
                <strong className="text-amber-400 font-bold">{(density * 100).toFixed(0)}%</strong>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.85"
                step="0.05"
                value={density}
                onChange={(e) => setDensity(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>10% (Sparse)</span>
                <span>40% (Medium)</span>
                <span>85% (Congested)</span>
              </div>
            </div>

            {/* Stochastic Entropy */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>Stochastic Entropy:</span>
                <strong className="text-purple-400 font-bold">{(randomness * 100).toFixed(0)}%</strong>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={randomness}
                onChange={(e) => setRandomness(parseFloat(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>0% (Clockwork)</span>
                <span>50%</span>
                <span>100% (High Jitter)</span>
              </div>
            </div>

            {/* Receiver Noise Floor */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800 sm:col-span-2">
              <div className="flex justify-between text-slate-300">
                <span>Receiver Thermal Noise Floor:</span>
                <strong className="text-slate-200 font-bold">{noiseDbm} dBm</strong>
              </div>
              <input
                type="range"
                min="-105"
                max="-75"
                step="1"
                value={noiseDbm}
                onChange={(e) => setNoiseDbm(parseInt(e.target.value))}
                className="w-full accent-slate-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>-105 dBm (Clean Lab)</span>
                <span>-95 dBm (Realistic Field)</span>
                <span>-75 dBm (Heavy Noise & Jamming)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Synthetic Emitter Fleet Catalog & Real-Time Telemetry */}
      <div className="rounded-2xl border border-slate-800 bg-[#070b16] p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Signal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-tech text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
                Configured Synthetic Emitter Catalog ({emitters.length} Transmitters)
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Inspect transmission states, PRI, pulse widths, power levels, and toggle individual emitters
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddEmitterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Custom Emitter</span>
          </button>
        </div>

        {/* Emitters Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#040711]">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Emitter Designation</th>
                <th className="py-2.5 px-3">Type & Waveform</th>
                <th className="py-2.5 px-3">Assigned Channel</th>
                <th className="py-2.5 px-3">Center Freq</th>
                <th className="py-2.5 px-3">Duty Cycle / PRI</th>
                <th className="py-2.5 px-3">Tx Power</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {emitters.map((em) => {
                const targetBand = bands[em.bandIndex];
                const isFiltered = selectedBandFilter !== null && em.bandIndex !== selectedBandFilter;
                if (isFiltered) return null;

                return (
                  <tr
                    key={em.id}
                    className={`hover:bg-slate-900/40 transition-colors ${
                      em.active && !em.isMuted ? 'bg-emerald-950/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        {em.isJammer ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Radio className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                        <span>{em.name}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        em.isJammer
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}>
                        {em.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-300 font-bold">
                      {targetBand ? targetBand.name : `Band #${em.bandIndex + 1}`}
                    </td>

                    <td className="py-2.5 px-3 text-slate-400">
                      {targetBand ? `${targetBand.centerFreqMHz} MHz` : `${em.frequencyMHz} MHz`}
                    </td>

                    <td className="py-2.5 px-3 text-slate-300">
                      {(em.dutyCycle * 100).toFixed(0)}% · {em.priUs || em.period * 25} μs
                    </td>

                    <td className="py-2.5 px-3 font-bold text-cyan-300">
                      {em.powerDbm} dBm
                    </td>

                    <td className="py-2.5 px-3">
                      {em.isMuted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                          MUTED
                        </span>
                      ) : em.active ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold animate-pulse flex items-center gap-1 w-max">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>PULSING (TX)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-500">
                          ○ DORMANT
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onUpdateEmitter && (
                          <button
                            onClick={() => onUpdateEmitter(em.id, { isMuted: !em.isMuted })}
                            className={`p-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                              em.isMuted ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                            }`}
                            title={em.isMuted ? 'Unmute Emitter' : 'Mute Emitter'}
                          >
                            {em.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {onDeleteEmitter && (
                          <button
                            onClick={() => onDeleteEmitter(em.id)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Emitter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Add Custom Emitter Modal */}
      {isAddEmitterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-[#090e1f] border border-cyan-500/60 p-6 space-y-4 shadow-2xl relative font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-cyan-400" />
                <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide">
                  Inject Custom Synthetic RF Emitter
                </h3>
              </div>
              <button
                onClick={() => setIsAddEmitterOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmitter} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Emitter Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400 block text-[11px]">Emitter Name / System Designation:</label>
                  <input
                    type="text"
                    required
                    value={newEmitterName}
                    onChange={(e) => setNewEmitterName(e.target.value)}
                    placeholder="e.g. Surveillance Radar AN/TPS-75 Emulation"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  />
                </div>

                {/* Emitter Type */}
                <div className="space-y-1">
                  <label className="text-slate-400 block text-[11px]">Waveform / Radar Type:</label>
                  <select
                    value={newEmitterType}
                    onChange={(e) => setNewEmitterType(e.target.value as EmitterType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs"
                  >
                    <option value="radar_pulsed">Pulsed Surveillance Radar</option>
                    <option value="freq_hopping">Frequency Hopping (FHSS)</option>
                    <option value="continuous_chirp">Continuous FMCW Tracking Chirp</option>
                    <option value="burst_comm">Tactical Data Packet Burst</option>
                    <option value="intermittent_scan">Intermittent Rotating Search Radar</option>
                    <option value="jammer_noise">Electronic Attack Noise Jammer</option>
                  </select>
                </div>

                {/* Target Channel */}
                <div className="space-y-1">
                  <label className="text-slate-400 block text-[11px]">Target RF Channel:</label>
                  <select
                    value={newEmitterBand}
                    onChange={(e) => setNewEmitterBand(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs"
                  >
                    {bands.map((b, i) => (
                      <option key={b.id} value={i}>
                        {b.name} — {b.centerFreqMHz} MHz ({b.bandwidthMHz} MHz BW)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transmit Power */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Transmit Power:</span>
                    <strong className="text-cyan-300">{newEmitterPower} dBm</strong>
                  </div>
                  <input
                    type="range"
                    min="-65"
                    max="-15"
                    step="1"
                    value={newEmitterPower}
                    onChange={(e) => setNewEmitterPower(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Duty Cycle */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Duty Cycle:</span>
                    <strong className="text-amber-400">{(newEmitterDuty * 100).toFixed(0)}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.80"
                    step="0.05"
                    value={newEmitterDuty}
                    onChange={(e) => setNewEmitterDuty(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Modulation */}
                <div className="space-y-1">
                  <label className="text-slate-400 block text-[11px]">Modulation Scheme:</label>
                  <select
                    value={newEmitterMod}
                    onChange={(e) => setNewEmitterMod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs"
                  >
                    <option value="LFM_Chirp">Linear Frequency Modulation (LFM Chirp)</option>
                    <option value="Barker_13">Phase-Coded Barker 13</option>
                    <option value="QPSK">Tactical QPSK Spread</option>
                    <option value="FHSS">Frequency-Hopping Spread Spectrum</option>
                    <option value="CW_Unmodulated">Continuous Wave (CW)</option>
                    <option value="Gaussian_Noise">Gaussian Noise / Barrage</option>
                  </select>
                </div>

                {/* Distance & Propagation Loss */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Distance to ES Receiver:</span>
                    <strong className="text-slate-200">{newEmitterDistance} km</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="5"
                    value={newEmitterDistance}
                    onChange={(e) => setNewEmitterDistance(parseInt(e.target.value))}
                    className="w-full accent-slate-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEmitterOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-lg glow-cyan cursor-pointer"
                >
                  Inject Emitter Into Environment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
