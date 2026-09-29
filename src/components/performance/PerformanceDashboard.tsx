/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FrequencyBand,
  MetricSnapshot,
} from '../../types/simulation';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Award,
  Layers,
} from 'lucide-react';

interface PerformanceDashboardProps {
  adaptiveMetrics: MetricSnapshot;
  baselineMetrics: MetricSnapshot;
  adaptiveHistory: MetricSnapshot[];
  baselineHistory: MetricSnapshot[];
  bands: FrequencyBand[];
  onRunBatchSteps: (steps: number) => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  adaptiveMetrics,
  baselineMetrics,
  adaptiveHistory,
  baselineHistory,
  bands,
  onRunBatchSteps,
}) => {
  const [selectedChartRange, setSelectedChartRange] = useState<'1K' | '5K' | '10K' | '50K'>('1K');

  // Prepare chart series from history
  const chartData = adaptiveHistory.map((item, idx) => {
    const baseItem = baselineHistory[idx] || item;
    return {
      step: item.timeStep,
      adaptivePd: item.probabilityOfDetection,
      baselinePd: baseItem.probabilityOfDetection,
      adaptiveDelay: item.averageDetectionDelay,
      baselineDelay: baseItem.averageDetectionDelay,
      adaptiveReward: item.averageReward,
      baselineReward: baseItem.averageReward,
      adaptiveAccuracy: item.predictionAccuracy,
      adaptiveFalseAlarm: item.falseAlarmRate,
      baselineFalseAlarm: baseItem.falseAlarmRate,
    };
  });

  // Prepare band allocation data
  const bandAllocationData = bands.map((b) => ({
    name: b.name,
    scans: b.observationCount,
    hits: b.hitCount,
    efficiency: b.observationCount > 0 ? Math.round((b.hitCount / b.observationCount) * 100) : 0,
  }));

  const handleRunPreset = (preset: '1K' | '5K' | '10K' | '50K') => {
    setSelectedChartRange(preset);
    const stepCountMap = {
      '1K': 200,
      '5K': 600,
      '10K': 1200,
      '50K': 2500,
    };
    onRunBatchSteps(stepCountMap[preset]);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#070b16] p-4 flex flex-col space-y-5 shadow-lg">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wider">
                Performance Evaluation & Analytics
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-300">
                Synthetic Benchmark
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Quantitative comparison of interception latency, false alarm rates, and detection probability
            </p>
          </div>
        </div>

        {/* Step presets */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-500 px-1 text-[11px]">Benchmark Run:</span>
          {(['1K', '5K', '10K', '50K'] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleRunPreset(r)}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedChartRange === r
                  ? 'bg-cyan-500/25 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r} Steps
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Cards (7 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* Pd */}
        <div className="p-3 rounded-lg bg-[#040813] border border-cyan-900/40 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-cyan-400 uppercase">Prob of Detection</div>
          <div className="text-xl font-black font-mono text-cyan-300 my-1">
            {adaptiveMetrics.probabilityOfDetection.toFixed(1)}%
          </div>
          <div className="text-[9px] font-mono text-slate-400">Baseline: {baselineMetrics.probabilityOfDetection.toFixed(1)}%</div>
        </div>

        {/* Pfa */}
        <div className="p-3 rounded-lg bg-[#040813] border border-amber-900/40 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-amber-400 uppercase">Prob of False Alarm</div>
          <div className="text-xl font-black font-mono text-amber-300 my-1">
            {adaptiveMetrics.falseAlarmRate.toFixed(1)}%
          </div>
          <div className="text-[9px] font-mono text-slate-400">Low false triggers</div>
        </div>

        {/* Avg Intercept Time */}
        <div className="p-3 rounded-lg bg-[#040813] border border-emerald-900/40 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">Avg Intercept Time</div>
          <div className="text-xl font-black font-mono text-emerald-300 my-1">
            {(adaptiveMetrics.averageDetectionDelay * 25).toFixed(0)} ms
          </div>
          <div className="text-[9px] font-mono text-slate-400">@ 25ms receiver dwell</div>
        </div>

        {/* Avg Detection Delay */}
        <div className="p-3 rounded-lg bg-[#040813] border border-blue-900/40 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-blue-400 uppercase">Avg Delay (Steps)</div>
          <div className="text-xl font-black font-mono text-blue-300 my-1">
            {adaptiveMetrics.averageDetectionDelay.toFixed(1)}
          </div>
          <div className="text-[9px] font-mono text-slate-400">Baseline: {baselineMetrics.averageDetectionDelay.toFixed(1)} steps</div>
        </div>

        {/* Detection Ratio */}
        <div className="p-3 rounded-lg bg-[#040813] border border-cyan-900/40 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-cyan-400 uppercase">Detection Ratio</div>
          <div className="text-xl font-black font-mono text-cyan-300 my-1">
            {adaptiveMetrics.detectionRatio.toFixed(1)}%
          </div>
          <div className="text-[9px] font-mono text-slate-400">Active capture rate</div>
        </div>

        {/* Prediction Accuracy */}
        <div className="p-3 rounded-lg bg-[#040813] border border-purple-900/40 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-purple-400 uppercase">Prediction Accuracy</div>
          <div className="text-xl font-black font-mono text-purple-300 my-1">
            {adaptiveMetrics.predictionAccuracy.toFixed(1)}%
          </div>
          <div className="text-[9px] font-mono text-slate-400">Simulated model</div>
        </div>

        {/* Average Reward */}
        <div className="p-3 rounded-lg bg-[#040813] border border-emerald-900/40 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">Average Reward</div>
          <div className="text-xl font-black font-mono text-emerald-300 my-1">
            {adaptiveMetrics.averageReward > 0 ? `+${adaptiveMetrics.averageReward.toFixed(2)}` : adaptiveMetrics.averageReward.toFixed(2)}
          </div>
          <div className="text-[9px] font-mono text-slate-400">Normalized payoff</div>
        </div>
      </div>

      {/* Grid of Recharts Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Detection Probability vs Time */}
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-tech font-bold text-slate-200 uppercase">Detection Probability vs Time (P_d)</span>
            <span className="text-cyan-400">Target &gt; 90%</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#070b16', borderColor: '#334155', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="adaptivePd" name="VAYU-NETRA (Adaptive ML)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="baselinePd" name="Baseline (Fixed Sweep)" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Detection Delay vs Time */}
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-tech font-bold text-slate-200 uppercase">Average Intercept Delay (Steps)</span>
            <span className="text-emerald-400">Lower is better</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#070b16', borderColor: '#334155', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="adaptiveDelay" name="VAYU-NETRA Delay" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="baselineDelay" name="Baseline Delay" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scheduler Reward vs Time */}
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-tech font-bold text-slate-200 uppercase">Cumulative Step Reward</span>
            <span className="text-amber-400">Objective convergence</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#070b16', borderColor: '#334155', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="adaptiveReward" name="Adaptive ML Reward" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="baselineReward" name="Baseline Reward" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Accuracy & False Alarm Rate */}
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-tech font-bold text-slate-200 uppercase">Model Accuracy & False Alarm Rate</span>
            <span className="text-purple-400">Stability index</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#070b16', borderColor: '#334155', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="adaptiveAccuracy" name="Accuracy" stroke="#a855f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="adaptiveFalseAlarm" name="False Alarm Rate (P_fa)" stroke="#ef4444" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Receiver Scan Allocation Distribution (Bar Chart) */}
      <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-tech font-bold text-slate-200 uppercase">
              Spectrum Scan Allocation & Hit Efficiency by Frequency Band
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Shows how adaptive ML prioritizes frequently active bands over empty noise bands
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bandAllocationData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#070b16', borderColor: '#334155', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="scans" name="Dwell Observations" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="hits" name="Signal Intercepts (Hits)" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
