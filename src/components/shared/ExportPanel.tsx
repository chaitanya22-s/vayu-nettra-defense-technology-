/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  BookOpen,
  Check,
  ClipboardList,
} from 'lucide-react';
import {
  FrequencyBand,
  MetricSnapshot,
  HeatmapCell,
  SyntheticEmitter,
  ConfusionMatrix,
  RewardWeights,
  ScenarioPreset,
  LearningEvent,
} from '../../types/simulation';
import {
  exportMetricsCSV,
  exportBandsCSV,
  exportEmittersCSV,
  exportFullJSON,
  exportLearningEventsCSV,
  exportHTMLReport,
  ExportableSimulationData,
} from '../../services/exportService';

interface ExportPanelProps {
  timeStep: number;
  bands: FrequencyBand[];
  emitters: SyntheticEmitter[];
  adaptiveMetrics: MetricSnapshot;
  baselineMetrics: MetricSnapshot;
  adaptiveHistory: MetricSnapshot[];
  baselineHistory: MetricSnapshot[];
  adaptiveConfusion: ConfusionMatrix;
  heatmapHistory: HeatmapCell[][];
  learningEvents: LearningEvent[];
  weights: RewardWeights;
  currentScenario: ScenarioPreset;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  timeStep,
  bands,
  emitters,
  adaptiveMetrics,
  baselineMetrics,
  adaptiveHistory,
  baselineHistory,
  adaptiveConfusion,
  heatmapHistory,
  learningEvents,
  weights,
  currentScenario,
}) => {
  const [lastExported, setLastExported] = useState<string | null>(null);

  const flashExported = (type: string) => {
    setLastExported(type);
    setTimeout(() => setLastExported(null), 2000);
  };

  const buildFullData = (): ExportableSimulationData => ({
    timestamp: new Date().toISOString(),
    scenarioName: currentScenario.name,
    timeStep,
    bands,
    emitters,
    adaptiveMetrics,
    baselineMetrics,
    adaptiveHistory,
    baselineHistory,
    adaptiveConfusion,
    heatmapHistory,
    learningEvents,
    weights,
  });

  const exports = [
    {
      id: 'metrics_csv',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      title: 'Performance Metrics (CSV)',
      description: 'Adaptive vs. Baseline metrics time-series — P_d, delay, reward, scan efficiency.',
      action: () => {
        exportMetricsCSV(adaptiveHistory, baselineHistory, currentScenario.name);
        flashExported('metrics_csv');
      },
    },
    {
      id: 'bands_csv',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      title: 'Frequency Band States (CSV)',
      description: 'Current state of all frequency bands — activity, predictions, priority scores, observation counts.',
      action: () => {
        exportBandsCSV(bands);
        flashExported('bands_csv');
      },
    },
    {
      id: 'emitters_csv',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      title: 'Emitter Configuration (CSV)',
      description: 'All synthetic emitter parameters — type, frequency, PRI, modulation, tactical role.',
      action: () => {
        exportEmittersCSV(emitters);
        flashExported('emitters_csv');
      },
    },
    {
      id: 'learning_csv',
      icon: <ClipboardList className="w-4 h-4" />,
      title: 'Learning Events Log (CSV)',
      description: 'Detailed log of every HIT, MISS, FALSE_ALARM, and model update event.',
      action: () => {
        exportLearningEventsCSV(learningEvents);
        flashExported('learning_csv');
      },
    },
    {
      id: 'full_json',
      icon: <FileJson className="w-4 h-4" />,
      title: 'Full Simulation Snapshot (JSON)',
      description: 'Complete state export — bands, emitters, metrics, heatmap, learning events, weights.',
      action: () => {
        exportFullJSON(buildFullData());
        flashExported('full_json');
      },
    },
    {
      id: 'html_report',
      icon: <BookOpen className="w-4 h-4" />,
      title: 'Formatted Research Report (HTML)',
      description: 'Printable formatted report with tables, confusion matrix, and emitter summary.',
      action: () => {
        exportHTMLReport(buildFullData());
        flashExported('html_report');
      },
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070b16] p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wider">
              Data Export & Reports
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Download simulation data as CSV, JSON, or formatted HTML reports
            </p>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          Step {timeStep} · {bands.length} bands · {emitters.length} emitters
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {exports.map((exp) => {
          const justExported = lastExported === exp.id;
          return (
            <button
              key={exp.id}
              onClick={exp.action}
              className={`p-4 rounded-xl border text-left transition-all group ${
                justExported
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                  : 'bg-[#040813] border-slate-800/80 hover:border-cyan-600/50 hover:bg-[#060d1a]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={justExported ? 'text-emerald-400' : 'text-cyan-400 group-hover:text-cyan-300'}>
                  {justExported ? <Check className="w-4 h-4" /> : exp.icon}
                </span>
                <span className={`text-xs font-bold ${justExported ? 'text-emerald-300' : 'text-slate-200'}`}>
                  {justExported ? 'Downloaded ✓' : exp.title}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                {exp.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Quick Info */}
      <div className="text-[10px] text-slate-500 text-center font-sans">
        All exports use current simulation state. Run the simulation longer for richer historical data.
      </div>
    </div>
  );
};
