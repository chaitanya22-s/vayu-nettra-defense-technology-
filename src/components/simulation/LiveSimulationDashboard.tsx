/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FrequencyBand,
  HeatmapCell,
  MetricSnapshot,
  ReceiverState,
  RewardWeights,
  ScenarioPreset,
} from '../../types/simulation';
import { SCENARIO_PRESETS } from '../../services/simulationEngine';
import { SpectrumVisualizer } from '../spectrum/SpectrumVisualizer';
import { TimeFrequencyHeatmap } from '../spectrum/TimeFrequencyHeatmap';
import { ReceiverVisualizer } from '../scheduler/ReceiverVisualizer';
import { DualSchedulerComparison } from '../comparison/DualSchedulerComparison';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  FastForward,
  Zap,
  Gauge,
  Layers,
  Radio,
  GitCompare,
  X,
} from 'lucide-react';

interface LiveSimulationDashboardProps {
  isRunning: boolean;
  timeStep: number;
  bands: FrequencyBand[];
  receiver: ReceiverState;
  weights: RewardWeights;
  adaptiveMetrics: MetricSnapshot;
  baselineMetrics: MetricSnapshot;
  heatmapHistory: HeatmapCell[][];
  simulationSpeed: 'slow' | 'normal' | 'fast';
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onRunBatch: (steps: number) => void;
  onChangeSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  onSelectBand?: (bandIndex: number) => void;
  currentScenario?: ScenarioPreset;
  onSelectScenario?: (scenarioId: string) => void;
  baselineReceiver?: ReceiverState;
}

export const LiveSimulationDashboard: React.FC<LiveSimulationDashboardProps> = ({
  isRunning,
  timeStep,
  bands,
  receiver,
  weights,
  adaptiveMetrics,
  baselineMetrics,
  heatmapHistory,
  simulationSpeed,
  onTogglePlay,
  onStep,
  onReset,
  onRunBatch,
  onChangeSpeed,
  onSelectBand,
  currentScenario,
  onSelectScenario,
  baselineReceiver,
}) => {
  const [activeTab, setActiveTab] = useState<'spectrum_full' | 'dual_comparison' | 'waterfall_only'>('spectrum_full');
  const [selectedBandDetails, setSelectedBandDetails] = useState<FrequencyBand | null>(null);

  const activeSignalsCount = bands.filter((b) => b.trueActivity).length;

  const handleBandClicked = (bandIndex: number) => {
    const band = bands[bandIndex];
    if (band) {
      setSelectedBandDetails(band);
    }
    if (onSelectBand) {
      onSelectBand(bandIndex);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Master Simulation Control Bar: Compact, High-Tech, Responsive */}
      <div className="rounded-2xl border border-cyan-500/50 bg-[#070c1a] p-3.5 flex flex-col gap-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Playback & Dwell Stepping Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onTogglePlay}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-black tracking-wider transition-all shadow-lg cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 glow-amber'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 glow-emerald animate-pulse'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSE SWEEP</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>RUN CONTINUOUS SCAN</span>
                </>
              )}
            </button>

            <button
              onClick={onStep}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white disabled:opacity-40 font-mono text-xs transition-colors hover:border-cyan-500 cursor-pointer"
              title="Advance Single Time Step (25ms dwell)"
            >
              <StepForward className="w-4 h-4 text-cyan-400" />
              <span>Step (+1)</span>
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-rose-400 font-mono text-xs transition-colors cursor-pointer"
              title="Reset Simulation State to Step 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-800 hidden sm:block mx-1" />

            {/* Batch Run buttons */}
            <button
              onClick={() => onRunBatch(100)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/50 border border-cyan-800/70 text-cyan-300 hover:bg-cyan-900/60 font-mono text-xs transition-colors cursor-pointer"
              title="Fast-forward 100 simulation dwells"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>+100 Dwells</span>
            </button>

            <button
              onClick={() => onRunBatch(1000)}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-950/50 border border-blue-800/70 text-blue-300 hover:bg-blue-900/60 font-mono text-xs transition-colors cursor-pointer"
              title="Fast-forward 1,000 steps Monte Carlo run"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>+1,000 Steps</span>
            </button>
          </div>

          {/* Speed Selector & Live Telemetry Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="flex items-center gap-1 text-slate-400">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Speed:</span>
              </div>
              <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800">
                {(['slow', 'normal', 'fast'] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onChangeSpeed(spd)}
                    className={`px-2.5 py-1 rounded transition-colors uppercase text-[10px] font-bold cursor-pointer ${
                      simulationSpeed === spd
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#040813] border border-cyan-800/50 font-mono text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-slate-300">
                Dwell <strong className="text-cyan-300 font-mono">#{timeStep.toLocaleString()}</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 text-[11px]">
                Active: <strong className="text-emerald-400">{activeSignalsCount}/{bands.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Scenario Environment Switcher Bar */}
        {onSelectScenario && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-300">RF Scenario:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {SCENARIO_PRESETS.map((scenario) => {
                const isSelected = currentScenario?.id === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => onSelectScenario(scenario.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                    title={scenario.description}
                  >
                    {scenario.name.split(':')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. THE SCANNING GRAPH: PROMINENTLY PLACED AT THE VERY TOP */}
      {/* Sub-view Viewport Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-900/30 pb-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('spectrum_full')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'spectrum_full'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive RF Spectrum Graph</span>
          </button>

          {baselineReceiver && (
            <button
              onClick={() => setActiveTab('dual_comparison')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'dual_comparison'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Adaptive vs Fixed Sweep Comparison</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('waterfall_only')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'waterfall_only'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>2D Waterfall Spectrogram</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-cyan-400/90 hidden md:inline">
          ★ Graph updates every 25ms dwell window · Reticle tracks RX tuning
        </span>
      </div>

      {/* Selected Band Inspector Modal / Drawer */}
      {selectedBandDetails && (
        <div className="p-4 rounded-xl bg-slate-900/95 border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex flex-col gap-3 font-mono text-xs relative animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                {selectedBandDetails.name} (Channel {selectedBandDetails.bandNumber})
              </span>
              <span className="text-slate-200 font-bold">
                {selectedBandDetails.centerFreqMHz} MHz (BW: {selectedBandDetails.bandwidthMHz} MHz)
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedBandDetails.trueActivity ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
              }`}>
                {selectedBandDetails.trueActivity ? '● ACTIVE EMITTER TRANSMITTING' : '○ CHANNEL IDLE (NOISE FLOOR)'}
              </span>
            </div>

            <button
              onClick={() => setSelectedBandDetails(null)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-[11px]">
            <div>
              <span className="text-slate-500 block">Instantaneous Energy</span>
              <strong className="text-cyan-300">{selectedBandDetails.signalEnergyDbm.toFixed(1)} dBm</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Predicted Probability</span>
              <strong className="text-emerald-400">{(selectedBandDetails.predictedProbability * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Scheduler Priority</span>
              <strong className="text-amber-400">{selectedBandDetails.priorityScore.toFixed(3)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Historical Detections</span>
              <strong className="text-slate-200">{selectedBandDetails.hitCount} hits / {selectedBandDetails.observationCount} dwells</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Recency Weight</span>
              <strong className="text-purple-300">{selectedBandDetails.recencyWeight.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Estimated Persistence</span>
              <strong className="text-blue-300">{selectedBandDetails.estimatedPersistence.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Current Status</span>
              <strong className="text-cyan-400">{selectedBandDetails.status}</strong>
            </div>
          </div>
        </div>
      )}

      {/* 3. Primary Visualizer Canvas */}
      {activeTab === 'spectrum_full' && (
        <div className="space-y-4">
          {/* Main Visualizer: Real-Time Spectrum Analyzer Graph */}
          <SpectrumVisualizer
            bands={bands}
            receiver={receiver}
            timeStep={timeStep}
            onSelectBand={handleBandClicked}
          />

          {/* Receiver Scheduler Decision Matrix */}
          <ReceiverVisualizer
            bands={bands}
            receiver={receiver}
            weights={weights}
            timeStep={timeStep}
          />

          {/* Time x Frequency Waterfall Heatmap */}
          <TimeFrequencyHeatmap
            bands={bands}
            history={heatmapHistory}
            timeStep={timeStep}
          />
        </div>
      )}

      {activeTab === 'dual_comparison' && baselineReceiver && (
        <div className="space-y-4">
          <DualSchedulerComparison
            bands={bands}
            adaptiveReceiver={receiver}
            baselineReceiver={baselineReceiver}
            adaptiveMetrics={adaptiveMetrics}
            baselineMetrics={baselineMetrics}
            timeStep={timeStep}
          />

          <SpectrumVisualizer
            bands={bands}
            receiver={receiver}
            timeStep={timeStep}
            onSelectBand={handleBandClicked}
          />
        </div>
      )}

      {activeTab === 'waterfall_only' && (
        <div className="space-y-4">
          <TimeFrequencyHeatmap
            bands={bands}
            history={heatmapHistory}
            timeStep={timeStep}
          />

          <SpectrumVisualizer
            bands={bands}
            receiver={receiver}
            timeStep={timeStep}
            onSelectBand={handleBandClicked}
          />
        </div>
      )}

      {/* 4. Primary KPI Telemetry Strip (Placed Below Graph) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
        <div className="p-3.5 rounded-xl bg-[#070b16] border border-cyan-900/50 shadow-md">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Detection Prob (P_d)
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300 mt-1">
            {adaptiveMetrics.probabilityOfDetection.toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Fixed Sweep: {baselineMetrics.probabilityOfDetection.toFixed(1)}%
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#070b16] border border-emerald-900/50 shadow-md">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            Intercept Hits
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
            {adaptiveMetrics.hits.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Detected RF bursts
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#070b16] border border-amber-900/50 shadow-md">
          <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
            Missed Signals
          </div>
          <div className="text-2xl font-black font-mono text-amber-300 mt-1">
            {adaptiveMetrics.misses.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Unintercepted dwells
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#070b16] border border-blue-900/50 shadow-md">
          <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-semibold">
            Mean Intercept Delay
          </div>
          <div className="text-2xl font-black font-mono text-blue-300 mt-1">
            {adaptiveMetrics.averageDetectionDelay.toFixed(1)} steps
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            ~{(adaptiveMetrics.averageDetectionDelay * 25).toFixed(0)} ms latency
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#070b16] border border-purple-900/50 shadow-md">
          <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
            Scan Efficiency
          </div>
          <div className="text-2xl font-black font-mono text-purple-300 mt-1">
            {adaptiveMetrics.scanEfficiency.toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Hits per dwell action
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#070b16] border border-emerald-900/50 shadow-md">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            Policy Payoff
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
            {adaptiveMetrics.averageReward > 0 ? `+${adaptiveMetrics.averageReward.toFixed(2)}` : adaptiveMetrics.averageReward.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Reward function utility
          </div>
        </div>
      </div>
    </div>
  );
};
