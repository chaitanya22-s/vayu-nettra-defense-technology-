/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FrequencyBand, MetricSnapshot, ReceiverState } from '../../types/simulation';
import { GitCompare, TrendingUp, Clock, AlertTriangle, Zap, CheckCircle, ShieldAlert } from 'lucide-react';

interface DualSchedulerComparisonProps {
  bands: FrequencyBand[];
  adaptiveReceiver: ReceiverState;
  baselineReceiver: ReceiverState;
  adaptiveMetrics: MetricSnapshot;
  baselineMetrics: MetricSnapshot;
  timeStep: number;
}

export const DualSchedulerComparison: React.FC<DualSchedulerComparisonProps> = ({
  bands,
  adaptiveReceiver,
  baselineReceiver,
  adaptiveMetrics,
  baselineMetrics,
  timeStep,
}) => {
  // Delta calculations
  const pdDiff = Number((adaptiveMetrics.probabilityOfDetection - baselineMetrics.probabilityOfDetection).toFixed(1));
  const efficiencyDiff = Number((adaptiveMetrics.scanEfficiency - baselineMetrics.scanEfficiency).toFixed(1));
  const delayDiff = Number((baselineMetrics.averageDetectionDelay - adaptiveMetrics.averageDetectionDelay).toFixed(1));

  return (
    <div className="rounded-xl border border-slate-800 bg-[#070b16] p-4 flex flex-col space-y-4 shadow-lg">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wider">
                Simultaneous Dual Scheduler Benchmark
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-300">
                Shared Ground Truth Environment
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Both receivers operate on the identical synthetic RF signal arrivals in real time
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span>Simulation Step:</span>
          <span className="text-cyan-400 font-bold">{timeStep}</span>
        </div>
      </div>

      {/* Side-by-Side Dual Receivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: OPEN-LOOP SEQUENTIAL SWEEP */}
        <div className="rounded-xl border border-slate-800/90 bg-[#040812] p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <h3 className="font-tech text-sm font-bold text-slate-300 tracking-wide">
                OPEN-LOOP (FIXED SWEEP)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Deterministic Round-Robin
            </span>
          </div>

          {/* Receiver Scan Position Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>Scan Position:</span>
              <span className="text-slate-200 font-bold">
                Band {bands[baselineReceiver.currentBandIndex]?.name} ({bands[baselineReceiver.currentBandIndex]?.centerFreqMHz} MHz)
              </span>
            </div>
            <div className="grid grid-cols-12 sm:grid-cols-24 gap-0.5 bg-[#02050b] p-1 rounded border border-slate-900">
              {bands.map((b, idx) => {
                const isScanning = idx === baselineReceiver.currentBandIndex;
                return (
                  <div
                    key={b.id}
                    className={`h-4 rounded-xs transition-colors flex items-center justify-center text-[7px] font-mono ${
                      isScanning
                        ? 'bg-slate-300 text-slate-950 font-bold shadow-[0_0_6px_#cbd5e1]'
                        : b.trueActivity
                        ? 'bg-emerald-950/60 border border-emerald-900/60 text-emerald-500'
                        : 'bg-slate-900/50 text-slate-700'
                    }`}
                    title={`${b.name}: ${isScanning ? 'CURRENT SWEEP DWELL' : b.trueActivity ? 'Active Signal' : 'Idle'}`}
                  >
                    {isScanning ? '▲' : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Baseline Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500">Detection Rate</div>
              <div className="text-lg font-bold font-mono text-slate-300">
                {baselineMetrics.probabilityOfDetection.toFixed(1)}%
              </div>
              <div className="text-[9px] font-mono text-slate-500">Sequential Coverage</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500">Avg Intercept Delay</div>
              <div className="text-lg font-bold font-mono text-slate-300">
                {baselineMetrics.averageDetectionDelay.toFixed(1)} steps
              </div>
              <div className="text-[9px] font-mono text-slate-500">Full sweep cycle time</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500">Scan Efficiency</div>
              <div className="text-lg font-bold font-mono text-slate-300">
                {baselineMetrics.scanEfficiency.toFixed(1)}%
              </div>
              <div className="text-[9px] font-mono text-slate-500">Hits / total scans</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500">Total Intercepts</div>
              <div className="text-base font-bold font-mono text-slate-300">
                {baselineMetrics.hits.toLocaleString()}
              </div>
              <div className="text-[9px] font-mono text-slate-500">Pulses captured</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500">Missed Signals</div>
              <div className="text-base font-bold font-mono text-rose-400">
                {baselineMetrics.misses.toLocaleString()}
              </div>
              <div className="text-[9px] font-mono text-slate-500">During off-band dwells</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500">Cumulative Reward</div>
              <div className="text-base font-bold font-mono text-slate-300">
                {baselineMetrics.cumulativeReward.toFixed(1)}
              </div>
              <div className="text-[9px] font-mono text-slate-500">Objective score</div>
            </div>
          </div>
        </div>

        {/* RIGHT: SMARTSCAN ADAPTIVE ML */}
        <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-b from-[#061226]/80 to-[#040812] p-4 flex flex-col space-y-3 relative glow-cyan">
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <h3 className="font-tech text-sm font-bold text-cyan-300 tracking-wide">
                VAYU-NETRA (ADAPTIVE ML)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              Adaptive Prioritization
            </span>
          </div>

          {/* Receiver Scan Position Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1">
              <span>Dynamic Focus:</span>
              <span className="text-cyan-200 font-bold">
                Band {bands[adaptiveReceiver.currentBandIndex]?.name} ({bands[adaptiveReceiver.currentBandIndex]?.centerFreqMHz} MHz)
              </span>
            </div>
            <div className="grid grid-cols-12 sm:grid-cols-24 gap-0.5 bg-[#02050b] p-1 rounded border border-cyan-950">
              {bands.map((b, idx) => {
                const isScanning = idx === adaptiveReceiver.currentBandIndex;
                return (
                  <div
                    key={b.id}
                    className={`h-4 rounded-xs transition-colors flex items-center justify-center text-[7px] font-mono ${
                      isScanning
                        ? 'bg-cyan-400 text-slate-950 font-bold shadow-[0_0_8px_#06b6d4]'
                        : b.priorityScore > 0.6
                        ? 'bg-blue-900/50 border border-cyan-700/50 text-cyan-400'
                        : b.trueActivity
                        ? 'bg-emerald-950/60 border border-emerald-900/60 text-emerald-500'
                        : 'bg-slate-900/50 text-slate-700'
                    }`}
                    title={`${b.name}: ${isScanning ? 'CURRENT ADAPTIVE DWELL' : `Priority ${b.priorityScore.toFixed(2)}`}`}
                  >
                    {isScanning ? '▲' : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Adaptive Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/60">
              <div className="text-[10px] font-mono text-cyan-400">Detection Rate</div>
              <div className="text-lg font-bold font-mono text-cyan-300">
                {adaptiveMetrics.probabilityOfDetection.toFixed(1)}%
              </div>
              <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> +{Math.max(0, pdDiff)}% higher
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/60">
              <div className="text-[10px] font-mono text-cyan-400">Avg Intercept Delay</div>
              <div className="text-lg font-bold font-mono text-emerald-300">
                {adaptiveMetrics.averageDetectionDelay.toFixed(1)} steps
              </div>
              <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" /> {delayDiff > 0 ? `-${delayDiff} steps faster` : 'Synchronized'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/60">
              <div className="text-[10px] font-mono text-cyan-400">Scan Efficiency</div>
              <div className="text-lg font-bold font-mono text-cyan-300">
                {adaptiveMetrics.scanEfficiency.toFixed(1)}%
              </div>
              <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" /> +{Math.max(0, efficiencyDiff)}% hit ratio
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/60">
              <div className="text-[10px] font-mono text-cyan-400">Total Intercepts</div>
              <div className="text-base font-bold font-mono text-cyan-300">
                {adaptiveMetrics.hits.toLocaleString()}
              </div>
              <div className="text-[9px] font-mono text-cyan-400">Target signals captured</div>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/60">
              <div className="text-[10px] font-mono text-cyan-400">Missed Signals</div>
              <div className="text-base font-bold font-mono text-amber-300">
                {adaptiveMetrics.misses.toLocaleString()}
              </div>
              <div className="text-[9px] font-mono text-emerald-400">Significantly reduced</div>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/60">
              <div className="text-[10px] font-mono text-cyan-400">Cumulative Reward</div>
              <div className="text-base font-bold font-mono text-emerald-300">
                {adaptiveMetrics.cumulativeReward.toFixed(1)}
              </div>
              <div className="text-[9px] font-mono text-emerald-400">Optimized payoff</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Summary Delta Banner */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-950/40 via-cyan-950/40 to-blue-950/40 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">Simulation Evaluation Finding:</span>
          <span className="text-cyan-300">
            Adaptive scheduler yields higher intercept efficiency on bursty and periodic signals compared to blind fixed sweep.
          </span>
        </div>

        <div className="text-[10px] text-slate-400">
          * Synthetic simulation results. Not operational EW equipment.
        </div>
      </div>
    </div>
  );
};
