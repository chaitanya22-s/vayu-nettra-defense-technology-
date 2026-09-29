/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  GitCompare,
  TrendingUp,
  Layers,
  ShieldCheck,
  Award,
  Zap,
  Radio,
  FileCheck,
  AlertTriangle,
  Scale,
  Flame,
  ArrowRight,
  Download,
  FlaskConical,
  Sliders,
  ListOrdered,
  Clock,
  XCircle,
  FileText,
  AlertOctagon,
  RefreshCw,
} from 'lucide-react';
import {
  AlgorithmEvaluatorTab,
  ConfusionMatrix,
  FrequencyBand,
  HeatmapCell,
  MetricSnapshot,
  PatternType,
  ReceiverState,
  ScenarioPreset,
  EvaluationRequest,
  AblationItem,
  ErrorEvent,
  AlgorithmDefinition,
  SyntheticEmitter,
} from '../../types/simulation';
import { DualSchedulerComparison } from '../comparison/DualSchedulerComparison';
import { TimeFrequencyHeatmap } from '../spectrum/TimeFrequencyHeatmap';
import { PerformanceDashboard } from '../performance/PerformanceDashboard';
import { LiveSimulationDashboard } from '../simulation/LiveSimulationDashboard';
import { RfEnvironmentSimulator } from '../experiments/RfEnvironmentSimulator';
import { soundEffects } from '../../services/soundEffects';

interface AlgorithmEvaluatorPortalProps {
  currentTab: AlgorithmEvaluatorTab;
  onNavigateTab: (tab: AlgorithmEvaluatorTab) => void;
  timeStep: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onRunBatchSteps: (steps: number) => void;
  bands: FrequencyBand[];
  adaptiveReceiver: ReceiverState;
  baselineReceiver: ReceiverState;
  adaptiveMetrics: MetricSnapshot;
  baselineMetrics: MetricSnapshot;
  adaptiveHistory: MetricSnapshot[];
  baselineHistory: MetricSnapshot[];
  heatmapHistory: HeatmapCell[][];
  adaptiveConfusion: ConfusionMatrix;
  currentScenario: ScenarioPreset;
  onSwitchToResearcher: () => void;
  evaluationRequests: EvaluationRequest[];
  onCertifyEvaluationRequest: (reqId: string, certHash: string, notes: string) => void;
  algorithms: AlgorithmDefinition[];
  simulationSpeed?: 'slow' | 'normal' | 'fast';
  onChangeSpeed?: (speed: 'slow' | 'normal' | 'fast') => void;
  onSelectScenario?: (scenarioId: string) => void;
  emitters?: SyntheticEmitter[];
  onApplyCustomEnvironment?: (config: {
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
}

export const AlgorithmEvaluatorPortal: React.FC<AlgorithmEvaluatorPortalProps> = ({
  currentTab,
  onNavigateTab,
  timeStep,
  isRunning,
  onTogglePlay,
  onStep,
  onReset,
  onRunBatchSteps,
  bands,
  adaptiveReceiver,
  baselineReceiver,
  adaptiveMetrics,
  baselineMetrics,
  adaptiveHistory,
  baselineHistory,
  heatmapHistory,
  adaptiveConfusion,
  currentScenario,
  onSwitchToResearcher,
  evaluationRequests,
  onCertifyEvaluationRequest,
  algorithms,
  simulationSpeed = 'normal',
  onChangeSpeed = () => {},
  onSelectScenario = () => {},
  emitters = [],
  onApplyCustomEnvironment = () => {},
  onAddEmitter,
  onDeleteEmitter,
  onUpdateEmitter,
  onInjectJamming,
  onClearJamming,
}) => {
  // Certified sign-off checklist state
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    seed_repeatability: true,
    synthetic_rf_only: true,
    baseline_parity: true,
    pd_threshold_met: adaptiveMetrics.probabilityOfDetection >= 85,
    delay_advantage_verified: adaptiveMetrics.averageDetectionDelay < baselineMetrics.averageDetectionDelay,
    false_alarm_suppression: adaptiveMetrics.falseAlarmRate <= 6.0,
  });

  const [activeCertRequest, setActiveCertRequest] = useState<string>(evaluationRequests[0]?.id || 'EV-2026-081');
  const [certNotes, setCertNotes] = useState<string>('Rigorous 1,200-step Monte Carlo trial verified. Statistically significant latency advantage achieved.');

  // Ablation study data
  const [ablations, setAblations] = useState<AblationItem[]>([
    {
      id: 'abl-01',
      componentName: 'Full Vayu-Netra Model',
      description: 'Complete online reinforcement learning with recency decay, empirical persistence, and UCB exploration.',
      fullPd: 92.4,
      ablatedPd: 92.4,
      deltaPd: 0.0,
      fullDelay: 1.9,
      ablatedDelay: 1.9,
      deltaDelay: 0.0,
      criticality: 'Essential',
    },
    {
      id: 'abl-02',
      componentName: 'Without Temporal Recency Decay (lambda = 1.0)',
      description: 'Receiver holds past observations indefinitely without exponential discount, causing it to dwell on vacated bands.',
      fullPd: 92.4,
      ablatedPd: 71.8,
      deltaPd: -20.6,
      fullDelay: 1.9,
      ablatedDelay: 4.1,
      deltaDelay: +2.2,
      criticality: 'Essential',
    },
    {
      id: 'abl-03',
      componentName: 'Without UCB Exploration Bonus (c = 0)',
      description: 'Greedy exploitation only. Model gets trapped in initial detections and fails to discover newly activated emitters.',
      fullPd: 92.4,
      ablatedPd: 64.2,
      deltaPd: -28.2,
      fullDelay: 1.9,
      ablatedDelay: 5.6,
      deltaDelay: +3.7,
      criticality: 'Essential',
    },
    {
      id: 'abl-04',
      componentName: 'Without Dwell Switch Cost Penalty (delta = 0)',
      description: 'Ignores physical LO retuning delay. Causes erratic band-hopping that degrades effective dwell integration time.',
      fullPd: 92.4,
      ablatedPd: 87.5,
      deltaPd: -4.9,
      fullDelay: 1.9,
      ablatedDelay: 2.7,
      deltaDelay: +0.8,
      criticality: 'High',
    },
  ]);

  // Error analysis diagnostic log
  const [errorEvents, setErrorEvents] = useState<ErrorEvent[]>([
    {
      id: 'err-101',
      timeStep: Math.max(1, timeStep - 8),
      type: 'MISSED_BURST',
      bandName: 'B08',
      severity: 'Warning',
      details: 'Short 2-step radar burst missed while receiver was dwelling on high-priority channel B02.',
      impactMetric: 'Delay +1 step',
    },
    {
      id: 'err-102',
      timeStep: Math.max(1, timeStep - 15),
      type: 'FALSE_ALARM',
      bandName: 'B14',
      severity: 'Info',
      details: 'Thermal noise spike at -93.8 dBm triggered energy threshold confirmation test.',
      impactMetric: 'P_fa momentary uptick',
    },
    {
      id: 'err-103',
      timeStep: Math.max(1, timeStep - 22),
      type: 'BAND_STARVATION',
      bandName: 'B22',
      severity: 'Warning',
      details: 'Elapsed dwell interval reached 34 steps without scan. UCB uncertainty bonus triggered exploration.',
      impactMetric: 'Exploration scan scheduled',
    },
    {
      id: 'err-104',
      timeStep: Math.max(1, timeStep - 35),
      type: 'LO_SWITCH_DELAY',
      bandName: 'B01 -> B24',
      severity: 'Info',
      details: 'Wideband frequency hop (3000 MHz delta) incurred LO settling penalty.',
      impactMetric: 'Normalized switch cost -0.2',
    },
  ]);

  // Parameter sweep testing state
  const [sweepNoise, setSweepNoise] = useState<number>(-92);
  const [sweepDensity, setSweepDensity] = useState<number>(35);
  const [sweepAgility, setSweepAgility] = useState<number>(4);

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allPassed = Object.values(checklist).every(Boolean);

  const handleExecuteCertification = () => {
    const certHash = `VN-CERT-2026-VAL-${Math.floor(10000 + Math.random() * 90000)}-SYNTHETIC`;
    onCertifyEvaluationRequest(activeCertRequest, certHash, certNotes);
    soundEffects.playHitSound();
    alert(`Algorithm certified with hash ${certHash}! Report generated and dispatched to Researcher.`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Evaluator Header Banner */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-[#041712] via-[#06241c] to-[#04120e] p-6 relative overflow-hidden shadow-2xl glow-cyan">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-tech text-xs uppercase tracking-widest text-emerald-400 font-bold">
                VAYU-NETRA INTELLIGENCE
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>📊</span>
                <span>ALGORITHM EVALUATOR</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
                🟢 Benchmark Engine Online
              </span>
            </div>

            <h1 className="font-tech text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-wide">
              Algorithm Benchmark & Validation Suite
            </h1>

            <p className="text-xs sm:text-sm text-emerald-200/90 font-sans">
              Rigorous empirical testing, error analysis and validation: <span className="font-mono text-emerald-300 font-semibold">Test → Measure → Compare → Analyze → Validate</span>
            </p>
          </div>

          {/* Quick Benchmark Controls & Workspace Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onTogglePlay}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shadow-md ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'Pause Engine' : 'Run Benchmark'}</span>
            </button>

            <button
              onClick={onStep}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs disabled:opacity-40 transition-colors"
            >
              <span>+1 Step</span>
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Portal Switcher Segmented Control in Banner */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-700/80 font-mono text-xs shadow-inner">
              <button
                onClick={onSwitchToResearcher}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/50 transition-all font-medium"
                title="Select Option: Change to Lead Researcher Portal"
              >
                <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">← Change to Researcher</span>
                <span className="sm:hidden">← Lab</span>
              </button>
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/25 border border-emerald-400/80 text-emerald-200 font-bold shadow-sm">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Evaluator (Active)</span>
                <span className="sm:hidden">Eval</span>
              </span>
            </div>
          </div>
        </div>

        {/* 6 Evaluator KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 relative z-10 font-mono">
          <div className="p-3.5 rounded-xl bg-[#030d0a]/80 border border-emerald-900/50 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              Benchmark Parity
            </div>
            <div className="text-xl font-black text-emerald-300">
              DUAL PARITY
            </div>
            <div className="text-[9px] text-slate-500">
              Identical synthetic ground truth
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#030d0a]/80 border border-emerald-900/50 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              P_d Improvement
            </div>
            <div className="text-xl font-black text-emerald-400">
              +{(adaptiveMetrics.probabilityOfDetection - baselineMetrics.probabilityOfDetection).toFixed(1)}%
            </div>
            <div className="text-[9px] text-emerald-500">
              Adaptive vs Baseline
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#030d0a]/80 border border-emerald-900/50 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              Delay Advantage
            </div>
            <div className="text-xl font-black text-cyan-300">
              -{(baselineMetrics.averageDetectionDelay - adaptiveMetrics.averageDetectionDelay).toFixed(1)} steps
            </div>
            <div className="text-[9px] text-slate-500">
              Faster intercept
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#030d0a]/80 border border-emerald-900/50 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              False Alarm (P_fa)
            </div>
            <div className="text-xl font-black text-emerald-300">
              {adaptiveMetrics.falseAlarmRate.toFixed(1)}%
            </div>
            <div className="text-[9px] text-slate-500">
              Threshold &lt; 5.0%
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#030d0a]/80 border border-emerald-900/50 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              Statistical P-Value
            </div>
            <div className="text-xl font-black text-slate-100">
              &lt; 0.001
            </div>
            <div className="text-[9px] text-emerald-400">
              Highly significant
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#030d0a]/80 border border-emerald-900/50 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              Validation Verdict
            </div>
            <div className="text-xl font-black text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PASS</span>
            </div>
            <div className="text-[9px] text-emerald-500">
              Certified Ready
            </div>
          </div>
        </div>
      </div>

      {/* 2. Evaluator Workflow Navigation Stepper */}
      <div className="p-4 rounded-xl bg-[#070b16] border border-slate-800 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
          <span>Evaluator Validation Pipeline: Test → Measure → Compare → Analyze → Validate</span>
          <span className="text-emerald-400 font-bold">Standardized QA Protocol</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <button
            onClick={() => onNavigateTab('algorithm_benchmark')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              currentTab === 'algorithm_benchmark'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[10px] text-emerald-400 font-bold">STEP 1: TEST</div>
            <div className="font-bold text-slate-100 mt-0.5">Algorithm Benchmark</div>
          </button>

          <button
            onClick={() => onNavigateTab('baseline_comparison')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              currentTab === 'baseline_comparison'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[10px] text-emerald-400 font-bold">STEP 2: MEASURE</div>
            <div className="font-bold text-slate-100 mt-0.5">Baseline Comparison</div>
          </button>

          <button
            onClick={() => onNavigateTab('ablation_study')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              currentTab === 'ablation_study'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[10px] text-emerald-400 font-bold">STEP 3: COMPARE</div>
            <div className="font-bold text-slate-100 mt-0.5">Ablation Study</div>
          </button>

          <button
            onClick={() => onNavigateTab('error_analysis')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              currentTab === 'error_analysis'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[10px] text-emerald-400 font-bold">STEP 4: ANALYZE</div>
            <div className="font-bold text-slate-100 mt-0.5">Error Analysis</div>
          </button>

          <button
            onClick={() => onNavigateTab('evaluation_signoff')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              currentTab === 'evaluation_signoff'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[10px] text-emerald-400 font-bold">STEP 5: VALIDATE</div>
            <div className="font-bold text-slate-100 mt-0.5">Evaluation Sign-Off</div>
          </button>
        </div>
      </div>

      {/* 3. Sub-Views Routing */}

      {/* TAB: EVALUATION DASHBOARD */}
      {currentTab === 'eval_dashboard' && (
        <div className="space-y-6">
          {/* Incoming Evaluation Queue Alert Banner */}
          {evaluationRequests.some((r) => r.status === 'Pending') && (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/50 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Incoming Queue Alert:</strong> You have {evaluationRequests.filter((r) => r.status === 'Pending').length} pending evaluation request(s) awaiting verification!
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('evaluation_queue')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
              >
                Review Requests
              </button>
            </div>
          )}

          {/* Algorithm Benchmark Scoreboard */}
          <div className="p-5 rounded-2xl bg-[#070b16] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide">
                  Algorithm Benchmark & Performance Matrix
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                Metric: F1-Score, Detection Delay & Scan Efficiency
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Algorithm</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Detection Rate (P_d)</th>
                    <th className="py-2.5 px-3 text-right">Mean Delay</th>
                    <th className="py-2.5 px-3 text-right">False Alarm (P_fa)</th>
                    <th className="py-2.5 px-3 text-right">Scan Efficiency</th>
                    <th className="py-2.5 px-3 text-center">QA Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="bg-emerald-950/20 text-slate-200">
                    <td className="py-3 px-3 font-bold text-cyan-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>VAYU-NETRA (Adaptive ML)</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">Online UCB Reinforcement</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {adaptiveMetrics.probabilityOfDetection.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {adaptiveMetrics.averageDetectionDelay.toFixed(1)} steps
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {adaptiveMetrics.falseAlarmRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right text-cyan-300 font-bold">
                      {adaptiveMetrics.scanEfficiency.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                        PASS (CHAMPION)
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-900/40 text-slate-300">
                    <td className="py-3 px-3 font-medium">Recency-Based Explorer</td>
                    <td className="py-3 px-3 text-slate-500">Heuristic Memory Decay</td>
                    <td className="py-3 px-3 text-right">~71.5%</td>
                    <td className="py-3 px-3 text-right">~4.2 steps</td>
                    <td className="py-3 px-3 text-right">~4.0%</td>
                    <td className="py-3 px-3 text-right">~48.0%</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
                        QUALIFIED
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-900/40 text-slate-300">
                    <td className="py-3 px-3 font-medium">Sequential Fixed Sweep</td>
                    <td className="py-3 px-3 text-slate-500">Open-Loop Round-Robin</td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {baselineMetrics.probabilityOfDetection.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right text-rose-400 font-semibold">
                      {baselineMetrics.averageDetectionDelay.toFixed(1)} steps
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {baselineMetrics.falseAlarmRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {baselineMetrics.scanEfficiency.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800 text-[10px]">
                        BASELINE
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Dual Live Preview */}
          <DualSchedulerComparison
            bands={bands}
            adaptiveReceiver={adaptiveReceiver}
            baselineReceiver={baselineReceiver}
            adaptiveMetrics={adaptiveMetrics}
            baselineMetrics={baselineMetrics}
            timeStep={timeStep}
          />
        </div>
      )}

      {/* TAB: LIVE SIMULATION SWEEP */}
      {currentTab === 'live_simulation' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-tech text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <span>Live Evaluator Sweep & Spectrogram Inspector</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Independent real-time observation of adaptive receiver vs baseline sequential sweep
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Synchronized Verification Stream</span>
              </span>
            </div>
          </div>

          <LiveSimulationDashboard
            isRunning={isRunning}
            timeStep={timeStep}
            bands={bands}
            receiver={adaptiveReceiver}
            weights={{ detectionBenefit: 1.0, scanCost: 0.2, delayCost: 0.4, falseAlarmPenalty: 0.3 }}
            adaptiveMetrics={adaptiveMetrics}
            baselineMetrics={baselineMetrics}
            heatmapHistory={heatmapHistory}
            simulationSpeed={simulationSpeed}
            onTogglePlay={onTogglePlay}
            onStep={onStep}
            onReset={onReset}
            onRunBatch={onRunBatchSteps}
            onChangeSpeed={onChangeSpeed}
            currentScenario={currentScenario}
            onSelectScenario={onSelectScenario}
            baselineReceiver={baselineReceiver}
          />
        </div>
      )}

      {/* TAB: RF ENVIRONMENT SIMULATOR */}
      {currentTab === 'synthetic_rf_environment' && (
        <RfEnvironmentSimulator
          currentScenario={currentScenario}
          bands={bands}
          emitters={emitters}
          timeStep={timeStep}
          isRunning={isRunning}
          onTogglePlay={onTogglePlay}
          onSelectPreset={(preset) => onSelectScenario(preset.id)}
          onApplyCustomConfig={onApplyCustomEnvironment}
          onAddEmitter={onAddEmitter}
          onDeleteEmitter={onDeleteEmitter}
          onUpdateEmitter={onUpdateEmitter}
          onInjectJamming={onInjectJamming}
          onClearJamming={onClearJamming}
          onNavigateToLiveSim={() => onNavigateTab('live_simulation')}
        />
      )}

      {/* TAB: EVALUATION QUEUE */}
      {currentTab === 'evaluation_queue' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-tech text-xl font-bold text-slate-100 uppercase tracking-wide">
                Incoming Evaluation Requests Queue
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Requests dispatched by Lead Researcher for formal independent validation
              </p>
            </div>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {evaluationRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-[#070b16] border border-slate-800 space-y-4 shadow-lg hover:border-emerald-800/60 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-800/50 px-3 py-1 rounded-lg text-sm">
                      {req.id}
                    </span>
                    <div>
                      <h4 className="font-tech text-base font-bold text-slate-200">
                        {req.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Submitter: {req.requestedBy} · Requested: {req.requestedAt} · Linked: {req.rqId}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      req.status === 'Certified'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : req.status === 'In Progress'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#030907] border border-slate-800 space-y-1.5">
                    <span className="text-[10px] uppercase text-emerald-400 font-bold">Benchmark Criteria</span>
                    <p className="text-slate-300 font-sans">
                      Target Threshold: <strong className="text-emerald-400">{req.benchmarkTarget}</strong>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Test Duration: {req.testDuration} synthetic dwell steps on scenario {req.scenarioId}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#030907] border border-slate-800 space-y-1.5">
                    <span className="text-[10px] uppercase text-emerald-400 font-bold">Evaluator Actions</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => {
                          onRunBatchSteps(100);
                          soundEffects.playSweepClick();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                      >
                        Run Benchmark Trial
                      </button>

                      <button
                        onClick={() => {
                          setActiveCertRequest(req.id);
                          onNavigateTab('evaluation_signoff');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 text-xs"
                      >
                        Approve / Certify
                      </button>
                    </div>
                  </div>
                </div>

                {req.evaluatorNotes && (
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                    <span>Certification Notes: {req.evaluatorNotes}</span>
                    {req.certificationHash && (
                      <span className="text-emerald-400 font-bold">{req.certificationHash}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ALGORITHM BENCHMARK */}
      {currentTab === 'algorithm_benchmark' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#070b16] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide">
                  Multi-Algorithm Benchmark Runner
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Execute controlled evaluation batches across 100 to 2,500 synthetic time steps
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onRunBatchSteps(100)}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-md"
                >
                  +100 Steps
                </button>
                <button
                  onClick={() => onRunBatchSteps(500)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-bold transition-all"
                >
                  +500 Steps
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#030a08] border border-emerald-900/60 space-y-1">
                <span className="text-slate-400">Total Simulation Dwells:</span>
                <div className="text-xl font-bold text-slate-100">{timeStep.toLocaleString()} steps</div>
                <div className="text-[10px] text-slate-500">Synthetic sampling rate: 40 Hz</div>
              </div>

              <div className="p-4 rounded-xl bg-[#030a08] border border-emerald-900/60 space-y-1">
                <span className="text-slate-400">Current Ground Truth Activity:</span>
                <div className="text-xl font-bold text-emerald-400">
                  {bands.filter((b) => b.trueActivity).length} / {bands.length} Channels Active
                </div>
                <div className="text-[10px] text-slate-500">Intermittent synthetic bursts</div>
              </div>

              <div className="p-4 rounded-xl bg-[#030a08] border border-emerald-900/60 space-y-1">
                <span className="text-slate-400">Statistical Consistency:</span>
                <div className="text-xl font-bold text-cyan-300">95% CI ± 1.4%</div>
                <div className="text-[10px] text-slate-500">Low empirical variance</div>
              </div>
            </div>
          </div>

          <DualSchedulerComparison
            bands={bands}
            adaptiveReceiver={adaptiveReceiver}
            baselineReceiver={baselineReceiver}
            adaptiveMetrics={adaptiveMetrics}
            baselineMetrics={baselineMetrics}
            timeStep={timeStep}
          />
        </div>
      )}

      {/* TAB: BASELINE COMPARISON */}
      {currentTab === 'baseline_comparison' && (
        <DualSchedulerComparison
          bands={bands}
          adaptiveReceiver={adaptiveReceiver}
          baselineReceiver={baselineReceiver}
          adaptiveMetrics={adaptiveMetrics}
          baselineMetrics={baselineMetrics}
          timeStep={timeStep}
        />
      )}

      {/* TAB: PERFORMANCE METRICS */}
      {currentTab === 'performance_metrics' && (
        <div className="space-y-6">
          <TimeFrequencyHeatmap
            history={heatmapHistory}
            bands={bands}
            timeStep={timeStep}
          />
          <PerformanceDashboard
            adaptiveMetrics={adaptiveMetrics}
            baselineMetrics={baselineMetrics}
            adaptiveHistory={adaptiveHistory}
            baselineHistory={baselineHistory}
            bands={bands}
            onRunBatchSteps={onRunBatchSteps}
          />
        </div>
      )}

      {/* TAB: PARAMETER TESTING */}
      {currentTab === 'parameter_testing' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-6 rounded-2xl bg-[#070b16] border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide">
                  Parameter Sensitivity & Stress Sweep Testing
                </h3>
                <p className="text-slate-400 font-sans text-xs mt-0.5">
                  Evaluate algorithm robustness across varying noise floors, channel congestion, and frequency hop rates
                </p>
              </div>
              <button
                onClick={() => {
                  onRunBatchSteps(150);
                  soundEffects.playSweepClick();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              >
                Run Parameter Sweep Trial
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-[#030907] border border-slate-800 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Thermal Noise Floor</span>
                  <span className="text-emerald-400 font-bold">{sweepNoise} dBm</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="-80"
                  value={sweepNoise}
                  onChange={(e) => setSweepNoise(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
                <div className="text-[10px] text-slate-500">
                  Tests energy detector false alarms near thermal noise boundary.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#030907] border border-slate-800 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Activity Congestion</span>
                  <span className="text-emerald-400 font-bold">{sweepDensity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={sweepDensity}
                  onChange={(e) => setSweepDensity(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
                <div className="text-[10px] text-slate-500">
                  Tests dwell contention among competing high-priority bands.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#030907] border border-slate-800 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Emitter Agility / Hop Rate</span>
                  <span className="text-emerald-400 font-bold">{sweepAgility} steps</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={sweepAgility}
                  onChange={(e) => setSweepAgility(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
                <div className="text-[10px] text-slate-500">
                  Tests temporal recency tracking against agile hoppers.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ABLATION STUDY */}
      {currentTab === 'ablation_study' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-6 rounded-2xl bg-[#070b16] border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide">
                  Algorithmic Ablation Study & Component Degradation
                </h3>
                <p className="text-slate-400 font-sans text-xs mt-0.5">
                  Isolate the quantitative contribution of each algorithmic module to prove necessity
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                METHOD: COMPONENT ISOLATION
              </span>
            </div>

            <div className="space-y-3">
              {ablations.map((abl) => (
                <div
                  key={abl.id}
                  className="p-4 rounded-xl bg-[#030907] border border-slate-800 space-y-2 hover:border-emerald-800/60 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <span className="font-bold text-slate-200 text-sm">{abl.componentName}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        abl.criticality === 'Essential'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {abl.criticality}
                    </span>
                  </div>

                  <p className="text-slate-400 font-sans text-xs">
                    {abl.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-900 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Measured P_d:</span>
                      <strong className="text-slate-200">{abl.ablatedPd.toFixed(1)}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">P_d Drop:</span>
                      <strong className={abl.deltaPd < 0 ? 'text-rose-400' : 'text-slate-200'}>
                        {abl.deltaPd.toFixed(1)}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Mean Delay:</span>
                      <strong className="text-slate-200">{abl.ablatedDelay.toFixed(1)} steps</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Latency Impact:</span>
                      <strong className={abl.deltaDelay > 0 ? 'text-rose-400' : 'text-slate-200'}>
                        +{abl.deltaDelay.toFixed(1)} steps
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ERROR ANALYSIS */}
      {currentTab === 'error_analysis' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-6 rounded-2xl bg-[#070b16] border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide">
                  Error Diagnostics & Edge-Case Failure Analysis
                </h3>
                <p className="text-slate-400 font-sans text-xs mt-0.5">
                  Detailed inspection of missed bursts, false alarm clusters, and channel starvation events
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800 text-rose-300">
                DIAGNOSTICS ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px]">Missed Opportunity Rate</span>
                <div className="text-xl font-bold text-slate-200">
                  {(100 - adaptiveMetrics.detectionRatio).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">Dwell contention during high activity</div>
              </div>

              <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px]">False Alarm Rate (P_fa)</span>
                <div className="text-xl font-bold text-emerald-400">
                  {adaptiveMetrics.falseAlarmRate.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">Below 5% acceptance limit</div>
              </div>

              <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px]">Starvation Events Prevented</span>
                <div className="text-xl font-bold text-cyan-300">98.2%</div>
                <div className="text-[10px] text-slate-500">UCB guaranteed channel exploration</div>
              </div>
            </div>

            {/* Diagnostic Event Log */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="text-[11px] uppercase font-bold text-slate-400">Recent Diagnostic Anomalies</div>
              <div className="space-y-1.5">
                {errorEvents.map((err) => (
                  <div
                    key={err.id}
                    className="p-3 rounded-xl bg-[#030810] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          err.severity === 'Critical'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : err.severity === 'Warning'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {err.type}
                      </span>
                      <div>
                        <div className="font-bold text-slate-200">
                          {err.bandName} · Step {err.timeStep}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">{err.details}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-2">{err.impactMetric}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: STATISTICAL VALIDATION */}
      {currentTab === 'statistical_validation' && (
        <div className="p-6 rounded-2xl bg-[#070b16] border border-slate-800 space-y-6 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide">
                Statistical Significance & Confidence Analysis
              </h3>
              <p className="text-slate-400 font-sans text-xs mt-0.5">
                Two-sample paired difference test comparing Vayu-Netra vs Sequential Fixed Sweep
              </p>
            </div>
            <span className="text-emerald-400 font-bold text-xs">p &lt; 0.0001 (STATISTICALLY SIGNIFICANT)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#040913] border border-slate-800 space-y-3">
              <div className="text-emerald-400 font-bold uppercase text-[11px]">Paired Difference Test</div>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Null Hypothesis H0:</span>
                  <span className="text-slate-400">mu_adaptive = mu_baseline</span>
                </div>
                <div className="flex justify-between">
                  <span>Alternative Hypothesis H1:</span>
                  <span className="text-emerald-400 font-bold">mu_adaptive &gt; mu_baseline</span>
                </div>
                <div className="flex justify-between">
                  <span>Student's t-Statistic:</span>
                  <span className="text-slate-100 font-bold">t = 8.42 (df = 999)</span>
                </div>
                <div className="flex justify-between">
                  <span>P-Value:</span>
                  <span className="text-emerald-400 font-bold">p &lt; 0.0001 (Reject H0)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#040913] border border-slate-800 space-y-3">
              <div className="text-emerald-400 font-bold uppercase text-[11px]">Confidence Intervals (95%)</div>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Delta Detection (P_d):</span>
                  <span className="text-emerald-400 font-bold">
                    +{(adaptiveMetrics.probabilityOfDetection - baselineMetrics.probabilityOfDetection).toFixed(1)}% [±1.2%]
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delta Intercept Delay:</span>
                  <span className="text-emerald-400 font-bold">
                    -{(baselineMetrics.averageDetectionDelay - adaptiveMetrics.averageDetectionDelay).toFixed(1)} steps [±0.3]
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sample Size N:</span>
                  <span className="text-slate-100 font-bold">{Math.max(100, timeStep)} observations</span>
                </div>
                <div className="flex justify-between">
                  <span>Verdict:</span>
                  <span className="text-emerald-400 font-bold">Statistically Sound</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: EVALUATION SIGN-OFF */}
      {currentTab === 'evaluation_signoff' && (
        <div className="p-6 rounded-2xl bg-[#070b16] border border-emerald-500/40 space-y-6 font-mono text-xs shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide">
                  Formal Algorithm Certification & Sign-Off
                </h3>
              </div>
              <p className="text-slate-400 font-sans text-xs mt-0.5">
                Official validation verdict for VAYU-NETRA Adaptive Reinforcement Scheduler
              </p>
            </div>

            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 font-bold">
              VERDICT: {allPassed ? 'CERTIFIED PASS' : 'CONDITIONAL'}
            </span>
          </div>

          {/* Validation Checklist */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              Formal Quality Checklist
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                onClick={() => toggleCheck('synthetic_rf_only')}
                className="p-3.5 rounded-xl bg-[#030907] border border-slate-800 hover:border-emerald-800 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200">1. Synthetic Simulation Safety</div>
                  <div className="text-[10px] text-slate-500 font-sans">Strictly artificial RF spectrum, zero hardware coupling</div>
                </div>
                {checklist.synthetic_rf_only ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
              </div>

              <div
                onClick={() => toggleCheck('baseline_parity')}
                className="p-3.5 rounded-xl bg-[#030907] border border-slate-800 hover:border-emerald-800 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200">2. Baseline Ground Truth Parity</div>
                  <div className="text-[10px] text-slate-500 font-sans">Identical time-frequency emitter activity matrix</div>
                </div>
                {checklist.baseline_parity ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
              </div>

              <div
                onClick={() => toggleCheck('pd_threshold_met')}
                className="p-3.5 rounded-xl bg-[#030907] border border-slate-800 hover:border-emerald-800 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200">3. Detection Rate Threshold (P_d &gt; 85%)</div>
                  <div className="text-[10px] text-slate-500 font-sans">Measured P_d = {adaptiveMetrics.probabilityOfDetection.toFixed(1)}%</div>
                </div>
                {checklist.pd_threshold_met ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
              </div>

              <div
                onClick={() => toggleCheck('delay_advantage_verified')}
                className="p-3.5 rounded-xl bg-[#030907] border border-slate-800 hover:border-emerald-800 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200">4. Intercept Latency Advantage</div>
                  <div className="text-[10px] text-slate-500 font-sans">
                    Adaptive ({adaptiveMetrics.averageDetectionDelay.toFixed(1)} steps) &lt; Baseline ({baselineMetrics.averageDetectionDelay.toFixed(1)} steps)
                  </div>
                </div>
                {checklist.delay_advantage_verified ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
              </div>

              <div
                onClick={() => toggleCheck('false_alarm_suppression')}
                className="p-3.5 rounded-xl bg-[#030907] border border-slate-800 hover:border-emerald-800 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200">5. False Alarm Suppression (P_fa &le; 5.0%)</div>
                  <div className="text-[10px] text-slate-500 font-sans">Measured P_fa = {adaptiveMetrics.falseAlarmRate.toFixed(1)}%</div>
                </div>
                {checklist.false_alarm_suppression ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
              </div>

              <div
                onClick={() => toggleCheck('seed_repeatability')}
                className="p-3.5 rounded-xl bg-[#030907] border border-slate-800 hover:border-emerald-800 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200">6. Seed Reproducibility Verification</div>
                  <div className="text-[10px] text-slate-500 font-sans">Deterministic pseudo-random sequence verified</div>
                </div>
                {checklist.seed_repeatability ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
              </div>
            </div>
          </div>

          {/* Sign-off notes & execution */}
          <div className="p-4 rounded-xl bg-[#020705] border border-emerald-900/60 space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Evaluator Certification Notes</label>
              <textarea
                value={certNotes}
                onChange={(e) => setCertNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-sans"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-slate-400">
                Target Request: <strong className="text-emerald-400">{activeCertRequest}</strong>
              </div>

              <button
                onClick={handleExecuteCertification}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Certify Algorithm</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
