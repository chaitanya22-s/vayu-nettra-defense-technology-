/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RewardWeights } from '../../types/simulation';
import { SlidersHorizontal, RotateCcw, Target, Clock, AlertOctagon, BatteryCharging, Zap } from 'lucide-react';
import { DEFAULT_WEIGHTS } from '../../services/simulationEngine';

interface RewardOptimizerProps {
  weights: RewardWeights;
  onUpdateWeights: (weights: Partial<RewardWeights>) => void;
  onResetWeights: () => void;
  onRunBatch: (steps: number) => void;
}

export const RewardOptimizer: React.FC<RewardOptimizerProps> = ({
  weights,
  onUpdateWeights,
  onResetWeights,
  onRunBatch,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#070b16] p-4 flex flex-col space-y-5 shadow-lg">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wider">
                Multi-Objective Reward & Cost Optimization
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-300">
                Reinforcement Objective
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tune receiver policy trade-offs between rapid pulse interception, scanning power budget, and false alarm suppression
            </p>
          </div>
        </div>

        <button
          onClick={onResetWeights}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Visual Formulation Equation Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#040916] via-[#06132b] to-[#040916] border border-cyan-950 text-center relative overflow-hidden">
        <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 mb-2">
          Mathematical Optimization Formulation
        </div>
        <div className="font-mono text-sm sm:text-base font-bold text-slate-100 flex flex-wrap items-center justify-center gap-2">
          <span className="text-emerald-400">Reward</span>
          <span className="text-slate-500">=</span>
          <span className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
            {weights.detectionBenefit.toFixed(1)} · DetectionBenefit
          </span>
          <span className="text-slate-500">−</span>
          <span className="px-2 py-1 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300">
            {weights.delayCost.toFixed(1)} · DelayCost
          </span>
          <span className="text-slate-500">−</span>
          <span className="px-2 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
            {weights.falseAlarmPenalty.toFixed(1)} · FalseAlarmPenalty
          </span>
          <span className="text-slate-500">−</span>
          <span className="px-2 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300">
            {weights.scanCost.toFixed(1)} · ScanCost
          </span>
        </div>
      </div>

      {/* Interactive Parameter Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Detection Benefit Slider */}
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Target className="w-4 h-4" />
              <span>Detection Benefit (W_det)</span>
            </div>
            <span className="text-emerald-300 font-bold text-sm">{weights.detectionBenefit.toFixed(2)}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Higher values incentivize the scheduler to aggressively exploit high-probability active channels to maximize intercepted pulses.
          </p>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={weights.detectionBenefit}
            onChange={(e) => onUpdateWeights({ detectionBenefit: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-600">
            <span>0.2 (Passive)</span>
            <span>1.5 (Standard)</span>
            <span>3.0 (Aggressive)</span>
          </div>
        </div>

        {/* Delay Cost Slider */}
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Clock className="w-4 h-4" />
              <span>Delay Cost (W_delay)</span>
            </div>
            <span className="text-blue-300 font-bold text-sm">{weights.delayCost.toFixed(2)}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Penalizes elapsed time between initial emitter transmission and first intercept. Forces prompt verification of dormant channels.
          </p>
          <input
            type="range"
            min="0.0"
            max="2.0"
            step="0.05"
            value={weights.delayCost}
            onChange={(e) => onUpdateWeights({ delayCost: parseFloat(e.target.value) })}
            className="w-full accent-blue-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-600">
            <span>0.0 (Relaxed)</span>
            <span>0.5 (Balanced)</span>
            <span>2.0 (Urgent)</span>
          </div>
        </div>

        {/* False Alarm Penalty Slider */}
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertOctagon className="w-4 h-4" />
              <span>False Alarm Penalty (W_fa)</span>
            </div>
            <span className="text-amber-300 font-bold text-sm">{weights.falseAlarmPenalty.toFixed(2)}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Penalizes dwelling on bands predicted active that turn out empty. Promotes conservative confidence thresholds.
          </p>
          <input
            type="range"
            min="0.0"
            max="2.0"
            step="0.05"
            value={weights.falseAlarmPenalty}
            onChange={(e) => onUpdateWeights({ falseAlarmPenalty: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-600">
            <span>0.0 (Tolerant)</span>
            <span>0.4 (Moderate)</span>
            <span>2.0 (Strict)</span>
          </div>
        </div>

        {/* Scan Cost Slider */}
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <BatteryCharging className="w-4 h-4" />
              <span>Scan Cost (W_cost)</span>
            </div>
            <span className="text-purple-300 font-bold text-sm">{weights.scanCost.toFixed(2)}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Simulates receiver RF front-end energy expenditure, LO synthesizer switching overhead, and processing cost per dwell.
          </p>
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.05"
            value={weights.scanCost}
            onChange={(e) => onUpdateWeights({ scanCost: parseFloat(e.target.value) })}
            className="w-full accent-purple-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-600">
            <span>0.05 (Cheap)</span>
            <span>0.20 (Standard)</span>
            <span>1.00 (High Cost)</span>
          </div>
        </div>
      </div>

      {/* Immediate Batch Evaluation Trigger */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300">
            Adjust weights above and run a simulated batch to test policy convergence:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRunBatch(100)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors font-semibold"
          >
            Run 100 Steps
          </button>
          <button
            onClick={() => onRunBatch(1000)}
            className="px-3 py-1.5 rounded-lg bg-cyan-600/30 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-600/40 transition-colors font-semibold"
          >
            Run 1,000 Steps
          </button>
        </div>
      </div>
    </div>
  );
};
