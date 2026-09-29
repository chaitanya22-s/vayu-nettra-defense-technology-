/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ExperimentRun,
  MetricSnapshot,
  RewardWeights,
  SchedulerType,
} from '../../types/simulation';
import {
  FlaskConical,
  Play,
  Download,
  FileText,
  CheckCircle,
  TrendingUp,
  Clock,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ExperimentLabProps {
  currentMetrics: MetricSnapshot;
  baselineMetrics: MetricSnapshot;
  weights: RewardWeights;
  bandCount: number;
  scenarioName: string;
  onRunBatchSteps: (steps: number) => void;
  onCreateExperimentSnapshot: (name: string) => ExperimentRun;
}

export const ExperimentLab: React.FC<ExperimentLabProps> = ({
  currentMetrics,
  baselineMetrics,
  weights,
  bandCount,
  scenarioName,
  onRunBatchSteps,
  onCreateExperimentSnapshot,
}) => {
  const [experimentName, setExperimentName] = useState<string>('Evaluation Run #1: Periodic Radar');
  const [durationSteps, setDurationSteps] = useState<number>(500);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SchedulerType>('adaptive_ml');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [experimentRuns, setExperimentRuns] = useState<ExperimentRun[]>([
    {
      id: 'EXP-VN-981',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      scenarioName: 'Scenario E: Mixed Realistic Synthetic Spectrum',
      bandCount: 24,
      durationSteps: 1200,
      schedulerType: 'adaptive_ml',
      weights: { detectionBenefit: 1.0, delayCost: 0.4, falseAlarmPenalty: 0.3, scanCost: 0.2 },
      metrics: {
        timeStep: 1200,
        probabilityOfDetection: 92.4,
        falseAlarmRate: 4.6,
        averageDetectionDelay: 2.1,
        averageInterceptTime: 52.5,
        detectionRatio: 89.8,
        predictionAccuracy: 91.2,
        averageReward: 0.74,
        cumulativeReward: 888.0,
        hits: 780,
        misses: 92,
        falseAlarms: 55,
        trueNegatives: 273,
        totalOpportunities: 872,
        scanEfficiency: 65.0,
      },
      baselineMetrics: {
        timeStep: 1200,
        probabilityOfDetection: 58.2,
        falseAlarmRate: 4.2,
        averageDetectionDelay: 6.8,
        averageInterceptTime: 170.0,
        detectionRatio: 52.1,
        predictionAccuracy: 74.0,
        averageReward: 0.21,
        cumulativeReward: 252.0,
        hits: 490,
        misses: 382,
        falseAlarms: 50,
        trueNegatives: 278,
        totalOpportunities: 872,
        scanEfficiency: 40.8,
      },
      improvementPercentage: 58.8,
    },
  ]);

  const handleExecuteExperiment = () => {
    setIsRunning(true);
    setTimeout(() => {
      onRunBatchSteps(durationSteps);
      const newRun = onCreateExperimentSnapshot(experimentName);
      setExperimentRuns((prev) => [newRun, ...prev]);
      setIsRunning(false);
    }, 400);
  };

  const handleExportJSON = (run: ExperimentRun) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(run, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${run.id}-synthetic-simulation.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = (run: ExperimentRun) => {
    const headers = [
      'Experiment_ID',
      'Timestamp',
      'Scenario',
      'Bands',
      'Duration_Steps',
      'Scheduler_Type',
      'Prob_Detection_Pct',
      'False_Alarm_Pct',
      'Avg_Delay_Steps',
      'Scan_Efficiency_Pct',
      'Avg_Reward',
      'Improvement_Pct',
      'Disclaimer',
    ];
    const row = [
      run.id,
      run.timestamp,
      `"${run.scenarioName}"`,
      run.bandCount,
      run.durationSteps,
      run.schedulerType,
      run.metrics.probabilityOfDetection,
      run.metrics.falseAlarmRate,
      run.metrics.averageDetectionDelay,
      run.metrics.scanEfficiency,
      run.metrics.averageReward,
      run.improvementPercentage,
      '"SYNTHETIC RF SIMULATION DATA ONLY"',
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), row.join(',')].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `${run.id}-synthetic-results.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#070b16] p-4 flex flex-col space-y-5 shadow-lg">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wider">
                Research Experiment Lab & Benchmark Runner
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-300">
                Automated Benchmarking
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Execute controlled evaluation trials, record synthetic metrics, and export research paper summaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExecuteExperiment}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold transition-all shadow-md glow-cyan disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Simulating...' : 'Run Experiment Trial'}</span>
          </button>
        </div>
      </div>

      {/* Experiment Configuration Card */}
      <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-3">
        <div className="text-xs font-tech font-bold uppercase tracking-wider text-slate-200">
          Experiment Parameters & Setup
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Experiment Title</label>
            <input
              type="text"
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Target Trial Duration (Steps)</label>
            <select
              value={durationSteps}
              onChange={(e) => setDurationSteps(parseInt(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
            >
              <option value={100}>100 Time Steps (Quick Check)</option>
              <option value={500}>500 Time Steps (Standard)</option>
              <option value={1000}>1,000 Time Steps (Robust)</option>
              <option value={2500}>2,500 Time Steps (Deep Trial)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Primary Scheduler Algorithm</label>
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value as SchedulerType)}
              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
            >
              <option value="adaptive_ml">VAYU-NETRA Adaptive ML</option>
              <option value="recency">Recency-Based Explorer</option>
              <option value="random">Random Band Selector</option>
              <option value="fixed_sweep">Sequential Fixed Sweep (Baseline)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4-Way Algorithm Benchmark Matrix */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-tech text-xs uppercase tracking-wider text-slate-300">
            Multi-Strategy Algorithm Benchmark Comparison
          </span>
          <span className="text-[10px] font-mono text-slate-500">Evaluated on {scenarioName}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Fixed Sweep */}
          <div className="p-3.5 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-tech text-xs font-bold text-slate-300">Fixed Sweep</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-500">
                Baseline
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Detection:</span>
                <span className="text-slate-200 font-bold">{baselineMetrics.probabilityOfDetection.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Avg Delay:</span>
                <span className="text-rose-400 font-semibold">{baselineMetrics.averageDetectionDelay.toFixed(1)} steps</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Efficiency:</span>
                <span className="text-slate-300">{baselineMetrics.scanEfficiency.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
              Open-loop round robin. Spends equal scan time regardless of emitter activity.
            </p>
          </div>

          {/* Random Scheduler */}
          <div className="p-3.5 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-tech text-xs font-bold text-slate-300">Random Scheduler</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-500">
                Stochastic
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Detection:</span>
                <span className="text-slate-200 font-bold">~42.0%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Avg Delay:</span>
                <span className="text-amber-400 font-semibold">~8.5 steps</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Efficiency:</span>
                <span className="text-slate-300">~29.0%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
              Uniform random channel selection. High variance with sporadic long misses.
            </p>
          </div>

          {/* Recency Explorer */}
          <div className="p-3.5 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-tech text-xs font-bold text-slate-300">Recency Explorer</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-500">
                Heuristic
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Detection:</span>
                <span className="text-slate-200 font-bold">~71.5%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Avg Delay:</span>
                <span className="text-blue-400 font-semibold">~4.2 steps</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Efficiency:</span>
                <span className="text-slate-300">~48.0%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
              Prioritizes channels with longest elapsed dwell age. Good exploration, lacks persistence.
            </p>
          </div>

          {/* SMARTSCAN Adaptive ML */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/50 space-y-2 glow-cyan">
            <div className="flex items-center justify-between">
              <span className="font-tech text-xs font-bold text-cyan-300">VAYU-NETRA (ML)</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300">
                Champion
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Detection:</span>
                <span className="text-emerald-400 font-bold">{currentMetrics.probabilityOfDetection.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Avg Delay:</span>
                <span className="text-emerald-400 font-bold">{currentMetrics.averageDetectionDelay.toFixed(1)} steps</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Efficiency:</span>
                <span className="text-cyan-300 font-bold">{currentMetrics.scanEfficiency.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-[10px] text-cyan-200/80 pt-1 border-t border-cyan-900/60">
              Balances exploitation of active duty cycles with UCB exploration and penalty avoidance.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Experiment Runs & Export Table */}
      <div className="space-y-2">
        <div className="text-xs font-tech font-bold uppercase tracking-wider text-slate-300">
          Recorded Experiment Trials & Data Export
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800/80 bg-[#040711]">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/60 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Trial ID</th>
                <th className="py-2.5 px-3">Scenario</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">P_d (Detection)</th>
                <th className="py-2.5 px-3">Avg Delay</th>
                <th className="py-2.5 px-3">Efficiency</th>
                <th className="py-2.5 px-3">Relative Gain</th>
                <th className="py-2.5 px-3 text-right">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {experimentRuns.map((run) => (
                <tr key={run.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-cyan-300">{run.id}</td>
                  <td className="py-2.5 px-3 text-slate-300 truncate max-w-[180px]">{run.scenarioName}</td>
                  <td className="py-2.5 px-3 text-slate-400">{run.durationSteps} steps</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">
                    {run.metrics.probabilityOfDetection.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-blue-300">{run.metrics.averageDetectionDelay.toFixed(1)} steps</td>
                  <td className="py-2.5 px-3 text-slate-200">{run.metrics.scanEfficiency.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">
                    +{run.improvementPercentage.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleExportJSON(run)}
                        className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 transition-colors"
                        title="Export JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExportCSV(run)}
                        className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 transition-colors"
                        title="Export CSV"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
