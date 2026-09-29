/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  Play,
  Activity,
  Layers,
  Cpu,
  Radio,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { FrequencyBand, ReceiverState } from '../../types/simulation';
import { VayuNetraLogo } from '../shared/VayuNetraLogo';

interface OverviewLandingProps {
  onLaunchSimulation: () => void;
  onExploreArchitecture: () => void;
  onOpenLoginPage: () => void;
  bands: FrequencyBand[];
  receiver: ReceiverState;
  timeStep: number;
}

export const OverviewLanding: React.FC<OverviewLandingProps> = ({
  onLaunchSimulation,
  onExploreArchitecture,
  onOpenLoginPage,
  bands,
  receiver,
  timeStep,
}) => {
  const [selectedArchBlock, setSelectedArchBlock] = useState<string>('scheduler');

  const archBlocks: Record<string, { title: string; desc: string; math: string }> = {
    env: {
      title: '1. Synthetic RF Environment',
      desc: 'Generates wideband spectrum channel conditions (500 MHz - 3500 MHz) with configurable emitter types, duty cycles, and thermal noise floor.',
      math: 'Y_k(t) = S_k(t) + W_k(t)',
    },
    sensor: {
      title: '2. Sensor Model (ES Receiver)',
      desc: 'Models a single-channel electronic support receiver with narrow instantaneous bandwidth and 25ms dwell duration latency.',
      math: 'B_inst << B_total, tau_dwell = 25ms',
    },
    obs: {
      title: '3. Spectrum Observation',
      desc: 'Extracts channel energy in the targeted dwell band and declares signal presence using Neyman-Pearson thresholding.',
      math: 'z_t = I(E_k(t) >= gamma_th)',
    },
    features: {
      title: '4. Feature Extraction',
      desc: 'Computes recency decay factors, historical hit rates, estimated emitter persistence, and temporal burst repetition phases.',
      math: 'F_k = [Recency, HitRate, Persistence, Uncertainty]',
    },
    ml: {
      title: '5. ML Prediction Layer',
      desc: 'Online statistical heuristic estimating the probability of emitter activity across all N sub-bands for the subsequent time step.',
      math: 'P(Active | Features)',
    },
    scheduler: {
      title: '6. Smart Scheduler Decision Engine',
      desc: 'Arbitrates multi-objective trade-offs (detection benefit vs delay penalty vs scan cost) to rank candidate bands and select the next dwell.',
      math: 'k* = argmax [w_det*P - w_delay*Delay - w_cost*Cost]',
    },
    action: {
      title: '7. Receiver Scan Simulation',
      desc: 'Dispatches local oscillator frequency tuning commands to steer the receiver front-end to the highest-priority sub-band.',
      math: 'Tune LO -> f_k*',
    },
    eval: {
      title: '8. Reward / Cost Evaluation & Feedback',
      desc: 'Validates whether the dwell yielded a signal hit, calculates instantaneous reinforcement reward, and updates the online predictive model.',
      math: 'Reward = DetectionGain - DelayCost - FalseAlarmPenalty',
    },
  };

  return (
    <div className="space-y-12 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#071126] via-[#050b18] to-[#040812] p-6 sm:p-10 overflow-hidden shadow-2xl glow-cyan">
        <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Status Chip & Hackathon Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>SYSTEM STATUS: SIMULATION READY</span>
            </div>
            <span className="text-slate-600 text-xs hidden sm:inline">·</span>
            <div className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Advanced Spectrum Surveillance Simulation</span>
            </div>
          </div>

          {/* Heading with Unique Vayu-Netra Emblem */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-1">
            <VayuNetraLogo size="lg" animated={true} />
            <div className="space-y-1">
              <h1 className="font-tech text-4xl sm:text-6xl font-black text-slate-100 tracking-wider">
                VAYU<span className="text-cyan-400">-NETRA</span>
              </h1>
              <div className="text-xl sm:text-2xl font-tech font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                Adaptive Spectrum Intelligence
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-3xl">
            An intelligent electronic support receiver scheduling simulation that learns from synthetic signal activity and dynamically prioritizes wideband spectrum scanning when prior emitter intelligence is unavailable.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onLaunchSimulation}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-sm transition-all shadow-lg glow-cyan"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Live Simulation</span>
            </button>

            <button
              onClick={onExploreArchitecture}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-mono text-sm transition-colors"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Explore Architecture</span>
            </button>

            <button
              onClick={onOpenLoginPage}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 text-cyan-300 font-mono text-sm transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Researcher Portal</span>
            </button>
          </div>
        </div>

        {/* Hero Synthetic Spectrum Graphic Bar */}
        <div className="mt-8 pt-6 border-t border-cyan-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2 text-cyan-300">
              <Activity className="w-4 h-4" />
              <span>Instantaneous Spectrum Activity Profile</span>
            </span>
            <span>Receiver Scanning: Band {bands[receiver.currentBandIndex]?.name} ({bands[receiver.currentBandIndex]?.centerFreqMHz} MHz)</span>
          </div>

          <div className="h-16 bg-[#03060e] border border-cyan-900/50 rounded-xl p-2 flex items-end justify-between gap-1 relative overflow-hidden">
            {bands.map((b, idx) => {
              const isScan = idx === receiver.currentBandIndex;
              const hasSignal = b.trueActivity;
              const height = hasSignal ? 85 : 22;
              return (
                <div
                  key={b.id}
                  className={`flex-1 rounded-t-xs transition-all duration-150 relative ${
                    isScan
                      ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                      : hasSignal
                      ? 'bg-emerald-400'
                      : 'bg-slate-800/40'
                  }`}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. THE CHALLENGE: TRADITIONAL VS SMART COMPARISON */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-tech text-2xl sm:text-3xl font-bold text-slate-100 uppercase tracking-wider">
            The Surveillance Challenge
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Why traditional open-loop sweeps fall short in congested, dynamic electromagnetic spectrums
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Strategy */}
          <div className="p-6 rounded-2xl bg-[#050914] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-tech text-base font-bold text-slate-300 uppercase">
                Traditional Open-Loop Sweep
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                Blind Sequential
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Open-loop scanning sweeps frequency sequentially from minimum to maximum. Inactive channels receive the exact same dwell time as highly agile radar emitters, leading to severe interception delays.
            </p>

            {/* Vertical Flow */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 font-mono text-xs text-center space-y-2 text-slate-300">
              <div className="p-2 rounded bg-slate-800/60">Wide Frequency Spectrum</div>
              <div className="text-slate-600 text-xs">↓</div>
              <div className="p-2 rounded bg-slate-800/60">Fixed Sequential Sweep</div>
              <div className="text-slate-600 text-xs">↓</div>
              <div className="p-2 rounded bg-slate-800/60">Repeated Periodic Dwell</div>
              <div className="text-slate-600 text-xs">↓</div>
              <div className="p-2 rounded bg-rose-950/40 text-rose-300 border border-rose-900/40">
                Inefficient Allocation & Long Intercept Latency
              </div>
            </div>
          </div>

          {/* Smart Strategy */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#06142a] to-[#040914] border border-cyan-500/40 space-y-4 glow-cyan">
            <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
              <span className="font-tech text-base font-bold text-cyan-300 uppercase">
                VAYU-NETRA Adaptive Strategy
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                Reinforcement Heuristic
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Learns from previous observations, predicts emitter burst timing, and prioritizes scanning opportunities to maximize intercepted pulses and minimize detection delay.
            </p>

            {/* Horizontal / Circular Flow */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/60 font-mono text-xs text-center space-y-1.5 text-cyan-200">
              <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                <div className="p-1.5 rounded bg-cyan-900/40">Observe</div>
                <div className="p-1.5 rounded bg-cyan-900/40">Learn</div>
                <div className="p-1.5 rounded bg-cyan-900/40">Predict</div>
                <div className="p-1.5 rounded bg-cyan-900/40">Prioritize</div>
              </div>
              <div className="text-cyan-400 text-xs">↓ ↺ Closed-Loop Reinforcement</div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <div className="p-1.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                  Scan
                </div>
                <div className="p-1.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                  Measure
                </div>
                <div className="p-1.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                  Update
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE SYSTEM ARCHITECTURE DIAGRAM */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-tech text-2xl sm:text-3xl font-bold text-slate-100 uppercase tracking-wider">
            VAYU-NETRA Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Interactive block diagram. Click any stage to inspect its simulated processing function.
          </p>
        </div>

        {/* Interactive Diagram Grid */}
        <div className="p-6 rounded-2xl bg-[#050914] border border-slate-800 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.entries(archBlocks).map(([key, item]) => {
              const isSelected = selectedArchBlock === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedArchBlock(key)}
                  className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500/80 text-cyan-200 glow-cyan'
                      : 'bg-[#03060e] border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-tech text-xs font-bold uppercase">{item.title}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-2">Inspect block →</div>
                </button>
              );
            })}
          </div>

          {/* Active Block Inspector Panel */}
          {selectedArchBlock && archBlocks[selectedArchBlock] && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#030713] via-[#061329] to-[#030713] border border-cyan-500/40 space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs text-cyan-300 font-bold border-b border-cyan-900/60 pb-2">
                <span>{archBlocks[selectedArchBlock].title}</span>
                <span className="text-[10px] text-slate-400">Simulation Processing Block</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {archBlocks[selectedArchBlock].desc}
              </p>
              <div className="pt-2 text-[11px] text-cyan-400">
                Mathematical Model: <code className="bg-slate-900 px-2 py-0.5 rounded">{archBlocks[selectedArchBlock].math}</code>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. FINAL HOMEPAGE MESSAGE (Prompt Section 42) */}
      <section className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#040813] via-[#07152f] to-[#040813] p-8 sm:p-12 text-center space-y-5 glow-cyan">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-bold">
            RESEARCH CONCLUSION & VISION
          </div>
          <h2 className="font-tech text-3xl sm:text-4xl font-bold text-slate-100">
            From Blind Sweeps to Adaptive Intelligence
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            “VAYU-NETRA explores how learning from simulated observations can help a receiver scheduler make more informed scanning decisions when prior information is limited.”
          </p>
          <div className="pt-2">
            <button
              onClick={onLaunchSimulation}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-sm transition-all shadow-lg glow-cyan"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Live Simulation</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
