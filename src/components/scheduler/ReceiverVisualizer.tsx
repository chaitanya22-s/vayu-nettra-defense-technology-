/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FrequencyBand, ReceiverState, RewardWeights } from '../../types/simulation';
import { Radio, ArrowRight, CheckCircle2, ChevronRight, Zap, Target } from 'lucide-react';

interface ReceiverVisualizerProps {
  bands: FrequencyBand[];
  receiver: ReceiverState;
  weights: RewardWeights;
  timeStep: number;
}

export const ReceiverVisualizer: React.FC<ReceiverVisualizerProps> = ({
  bands,
  receiver,
  weights,
  timeStep,
}) => {
  const currentBand = bands[receiver.currentBandIndex] || bands[0];
  const prevBand = bands[receiver.previousBandIndex] || bands[0];
  const nextBand = bands[receiver.nextScheduledBandIndex] || bands[0];

  // Sort candidate bands by priority score descending
  const rankedBands = [...bands]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 8);

  return (
    <div className="rounded-xl border border-slate-800 bg-[#070b16] p-4 flex flex-col space-y-4 shadow-lg">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wider">
                Receiver Scheduler Decision Engine
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-300">
                Single Tuner ES Receiver
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time RF frequency tuning trajectory and multi-criteria candidate band arbitration
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span>Tuning Latency:</span>
          <span className="text-cyan-300 font-semibold">{receiver.dwellTimeMs} ms</span>
          <span className="text-slate-600">|</span>
          <span>Total Scans:</span>
          <span className="text-slate-200 font-semibold">{receiver.totalScans.toLocaleString()}</span>
        </div>
      </div>

      {/* Receiver Scan Trajectory Card (Current, Prev, Next) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Previous Band */}
        <div className="p-3 rounded-lg bg-[#040813] border border-slate-800/80 flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-slate-500 flex items-center justify-between">
            <span>Previous Dwell</span>
            <span className="text-slate-600">T - 1</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-300">{prevBand.name}</span>
            <span className="text-xs text-slate-400">{prevBand.centerFreqMHz} MHz</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Observed State:</span>
            <span className={prevBand.trueActivity ? 'text-emerald-400' : 'text-slate-400'}>
              {prevBand.trueActivity ? 'Signal Intercepted' : 'Empty Spectrum'}
            </span>
          </div>
        </div>

        {/* Current Band (Active) */}
        <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/50 flex flex-col justify-between relative overflow-hidden glow-cyan">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="text-[10px] font-mono uppercase text-cyan-400 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              CURRENT TUNING
            </span>
            <span className="text-cyan-300">ACTIVE DWELL</span>
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-cyan-300">{currentBand.name}</span>
              <span className="text-xs text-cyan-200/80">{currentBand.centerFreqMHz} MHz</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400">Predicted Prob</div>
              <div className="text-sm font-bold font-mono text-amber-400">
                {(currentBand.predictedProbability * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono flex items-center justify-between border-t border-cyan-900/60 pt-1.5">
            <span className="text-slate-400">Priority Score:</span>
            <span className="text-cyan-300 font-bold">{currentBand.priorityScore.toFixed(3)}</span>
          </div>
        </div>

        {/* Next Scheduled Band */}
        <div className="p-3 rounded-lg bg-[#040813] border border-amber-500/30 flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-amber-400 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ArrowRight className="w-3 h-3 text-amber-400" />
              NEXT SCHEDULED
            </span>
            <span className="text-slate-600">T + 1</span>
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-amber-300">{nextBand.name}</span>
              <span className="text-xs text-slate-400">{nextBand.centerFreqMHz} MHz</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40">
                Rank #1
              </span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-1.5">
            <span>Scheduled Priority:</span>
            <span className="text-amber-400 font-semibold">{nextBand.priorityScore.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Decision Pipeline Flow Graphic */}
      <div className="p-3 rounded-lg bg-[#040813] border border-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1 text-slate-300">
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Observation</span>
        </div>
        <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:inline" />
        <div className="flex items-center gap-1 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Candidate Evaluation</span>
        </div>
        <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:inline" />
        <div className="flex items-center gap-1 text-slate-300">
          <span className="text-amber-400 font-bold">∑</span>
          <span className="text-slate-400">Multi-Objective Score</span>
        </div>
        <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:inline" />
        <div className="flex items-center gap-1 text-cyan-300 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next Scan: {nextBand.name}</span>
        </div>
      </div>

      {/* Ranked Candidate Bands Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-tech text-xs uppercase tracking-wider text-slate-300">
            Top Candidate Frequency Bands (Ranked Decision Queue)
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Objective Weights: W_det={weights.detectionBenefit} | W_delay={weights.delayCost} | W_fa={weights.falseAlarmPenalty}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800/80 bg-[#040711]">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/60 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-2 px-3">Band</th>
                <th className="py-2 px-3">Center Freq</th>
                <th className="py-2 px-3">Priority Score</th>
                <th className="py-2 px-3">Predicted Prob</th>
                <th className="py-2 px-3">Hist Detection</th>
                <th className="py-2 px-3">Recency Decay</th>
                <th className="py-2 px-3 text-right">Scheduler Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {rankedBands.map((band, idx) => {
                const isSelected = idx === 0;
                return (
                  <tr
                    key={band.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/30 text-cyan-200'
                        : 'hover:bg-slate-900/40 text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-3 font-bold flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
                      <span>{band.name}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">{band.centerFreqMHz} MHz</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded bg-cyan-400"
                            style={{ width: `${band.priorityScore * 100}%` }}
                          />
                        </div>
                        <span className="font-semibold text-cyan-300">{band.priorityScore.toFixed(3)}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-amber-400 font-semibold">
                      {(band.predictedProbability * 100).toFixed(0)}%
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {(band.historicalDetectionRate * 100).toFixed(0)}% ({band.hitCount}/{band.observationCount})
                    </td>
                    <td className="py-2 px-3 text-slate-400">{band.recencyWeight.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : band.status === 'Candidate'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800/50'
                            : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        {isSelected ? 'SELECTED (NEXT SCAN)' : band.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
