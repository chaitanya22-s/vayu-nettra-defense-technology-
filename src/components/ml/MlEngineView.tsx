/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ConfusionMatrix,
  FrequencyBand,
  LearningEvent,
  RewardWeights,
} from '../../types/simulation';
import {
  Cpu,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface MlEngineViewProps {
  bands: FrequencyBand[];
  confusion: ConfusionMatrix;
  learningEvents: LearningEvent[];
  trainingSamples: number;
  recentObservations: number;
  weights: RewardWeights;
  timeStep: number;
}

export const MlEngineView: React.FC<MlEngineViewProps> = ({
  bands,
  confusion,
  learningEvents,
  trainingSamples,
  recentObservations,
  weights,
  timeStep,
}) => {
  const [selectedBandForFeatures, setSelectedBandForFeatures] = useState<FrequencyBand>(bands[0] || null);

  // Active band if not set
  const inspectedBand = selectedBandForFeatures || bands[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#070b16] p-4 flex flex-col space-y-5 shadow-lg">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wider">
                Adaptive ML Prediction & Learning Engine
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-300">
                Synthetic Decision Heuristic
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Closed-loop feedback: extracting spectral features, predicting emitter persistence, and learning from dwell outcomes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            STATE: LEARNING (SYNTHETIC MODEL)
          </span>
        </div>
      </div>

      {/* Model Overview Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-[#040813] border border-slate-800">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Architecture</div>
          <div className="text-sm font-bold font-mono text-cyan-300 mt-1">Adaptive Synthetic Scheduler</div>
          <div className="text-[9px] font-mono text-slate-500 mt-0.5">Online Bayesian / UCB Model</div>
        </div>

        <div className="p-3 rounded-lg bg-[#040813] border border-slate-800">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Training Dwells</div>
          <div className="text-base font-bold font-mono text-slate-200 mt-1">
            {trainingSamples.toLocaleString()}
          </div>
          <div className="text-[9px] font-mono text-emerald-400 mt-0.5">+2 per dwell step</div>
        </div>

        <div className="p-3 rounded-lg bg-[#040813] border border-slate-800">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Recent Observations</div>
          <div className="text-base font-bold font-mono text-slate-200 mt-1">
            {recentObservations.toLocaleString()}
          </div>
          <div className="text-[9px] font-mono text-slate-500 mt-0.5">Sliding window</div>
        </div>

        <div className="p-3 rounded-lg bg-[#040813] border border-slate-800">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Prediction Accuracy</div>
          <div className="text-base font-bold font-mono text-amber-400 mt-1">
            {(confusion.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-0.5">F1 Score: {confusion.f1Score.toFixed(3)}</div>
        </div>
      </div>

      {/* Visual Learning Pipeline Graphic */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#040813] via-[#061124] to-[#040813] border border-slate-800">
        <div className="text-xs font-tech font-bold text-slate-300 uppercase tracking-wider mb-3">
          Closed-Loop Machine Learning Pipeline
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] text-cyan-400 font-bold">01. OBSERVE</span>
            <span className="text-[11px] text-slate-300 mt-1">Raw Spectral Dwell</span>
          </div>

          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] text-cyan-400 font-bold">02. FEATURES</span>
            <span className="text-[11px] text-slate-300 mt-1">Recency & Persistence</span>
          </div>

          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] text-cyan-400 font-bold">03. PREDICT</span>
            <span className="text-[11px] text-slate-300 mt-1">Active Probability</span>
          </div>

          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] text-amber-400 font-bold">04. PRIORITY</span>
            <span className="text-[11px] text-slate-300 mt-1">Multi-Objective Score</span>
          </div>

          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] text-emerald-400 font-bold">05. DECIDE</span>
            <span className="text-[11px] text-slate-300 mt-1">Tuning Target</span>
          </div>

          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] text-emerald-400 font-bold">06. MEASURE</span>
            <span className="text-[11px] text-slate-300 mt-1">Hit / Miss Reward</span>
          </div>

          <div className="p-2 rounded bg-cyan-950/60 border border-cyan-500/50 flex flex-col items-center justify-center glow-cyan">
            <span className="text-[10px] text-cyan-300 font-bold">07. UPDATE ↺</span>
            <span className="text-[11px] text-cyan-200 mt-1">Weights & Posterior</span>
          </div>
        </div>
      </div>

      {/* Signal Activity Features Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Band Feature Extraction Card */}
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div>
              <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-slate-200">
                Band Feature Extraction Inspector
              </h3>
              <p className="text-[10px] text-slate-500">Select any simulated frequency channel</p>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] scrollbar-none">
              {bands.slice(0, 6).map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBandForFeatures(b)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    inspectedBand?.id === b.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {inspectedBand && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Target Channel:</span>
                <span className="text-cyan-300 font-bold">
                  {inspectedBand.name} ({inspectedBand.centerFreqMHz} MHz)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Recency Decay Factor</div>
                  <div className="text-base font-bold text-slate-200">
                    {inspectedBand.recencyWeight.toFixed(3)}
                  </div>
                  <div className="text-[9px] text-slate-500">e^(-λ · Δt)</div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Historical Detection Rate</div>
                  <div className="text-base font-bold text-cyan-300">
                    {(inspectedBand.historicalDetectionRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {inspectedBand.hitCount} hits / {inspectedBand.observationCount} dwells
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Estimated Persistence</div>
                  <div className="text-base font-bold text-emerald-400">
                    {(inspectedBand.estimatedPersistence * 100).toFixed(0)}%
                  </div>
                  <div className="text-[9px] text-slate-500">Conditional P(S_t | S_t-1)</div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Current Computed Priority</div>
                  <div className="text-base font-bold text-amber-400">
                    {inspectedBand.priorityScore.toFixed(3)}
                  </div>
                  <div className="text-[9px] text-slate-500">Multi-objective ranking</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Prediction Evaluation Confusion Matrix */}
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-2 mb-3">
            <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-slate-200">
              Prediction Evaluation: Confusion Matrix
            </h3>
            <p className="text-[10px] text-slate-500">Evaluated on simulated ground-truth activity stream</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center font-mono">
            {/* TP */}
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">True Positive (TP)</div>
              <div className="text-xl font-black text-emerald-300 my-1">{confusion.tp.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400">Predicted Active & Actual Signal Hit</div>
            </div>

            {/* FP */}
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40">
              <div className="text-[10px] text-rose-400 font-bold uppercase">False Positive (FP)</div>
              <div className="text-xl font-black text-rose-300 my-1">{confusion.fp.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400">Predicted Active & Channel Empty</div>
            </div>

            {/* FN */}
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40">
              <div className="text-[10px] text-amber-400 font-bold uppercase">False Negative (FN)</div>
              <div className="text-xl font-black text-amber-300 my-1">{confusion.fn.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400">Active Emitter Missed During Off-Dwell</div>
            </div>

            {/* TN */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">True Negative (TN)</div>
              <div className="text-xl font-black text-slate-200 my-1">{confusion.tn.toLocaleString()}</div>
              <div className="text-[9px] text-slate-500">Predicted Idle & Channel Inactive</div>
            </div>
          </div>

          {/* Precision Recall Stats */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <div>
              <span>Precision: </span>
              <span className="text-cyan-300 font-bold">{(confusion.precision * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span>Recall: </span>
              <span className="text-emerald-400 font-bold">{(confusion.recall * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span>F1 Score: </span>
              <span className="text-amber-400 font-bold">{confusion.f1Score.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hit / Miss Learning Events Timeline */}
      <div className="rounded-xl bg-[#040813] border border-slate-800 p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-slate-200">
              Closed-Loop Hit & Miss Learning Stream
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Live Dwell Reinforcement Feed</span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {learningEvents.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              Run the simulation to generate live reinforcement learning events...
            </div>
          ) : (
            learningEvents.slice(0, 6).map((ev) => (
              <div
                key={ev.id}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  {ev.type === 'HIT' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : ev.type === 'FALSE_ALARM' ? (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-slate-200">Step {ev.timeStep}</span>
                    <span className="text-slate-500 mx-1.5">·</span>
                    <span className="text-cyan-300 font-semibold">{ev.bandName}</span>
                    <span className="text-slate-500 mx-1.5">·</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded ${
                        ev.type === 'HIT'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                      }`}
                    >
                      {ev.type === 'HIT' ? 'SIGNAL INTERCEPT (HIT)' : 'EMPTY DWELL (MISS)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-slate-500">Reward: </span>
                    <span className={ev.rewardEarned >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {ev.rewardEarned >= 0 ? `+${ev.rewardEarned}` : ev.rewardEarned}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Model Update: </span>
                    <span className="text-cyan-300">{ev.modelDelta}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
