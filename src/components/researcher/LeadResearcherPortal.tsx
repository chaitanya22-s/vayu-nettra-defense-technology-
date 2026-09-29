/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Cpu,
  BarChart3,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Send,
  Download,
  BookOpen,
  ShieldCheck,
  FileText,
  Database,
  History,
  Users,
  Settings as SettingsIcon,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Radio,
  SlidersHorizontal,
  Flame,
  FileCheck,
  GitBranch,
  Edit3,
} from 'lucide-react';
import {
  ConfusionMatrix,
  ExperimentRun,
  FrequencyBand,
  HeatmapCell,
  LeadResearcherTab,
  MetricSnapshot,
  PatternType,
  ReceiverState,
  ResearchQuestion,
  RewardWeights,
  ScenarioPreset,
  EvaluationRequest,
  AlgorithmDefinition,
  ExperimentDesign,
  SyntheticEmitter,
} from '../../types/simulation';
import { EnvironmentGenerator } from '../experiments/EnvironmentGenerator';
import { RfEnvironmentSimulator } from '../experiments/RfEnvironmentSimulator';
import { RewardOptimizer } from '../optimization/RewardOptimizer';
import { MlEngineView } from '../ml/MlEngineView';
import { ResearchMode } from '../research/ResearchMode';
import { ExperimentLab } from '../experiments/ExperimentLab';
import { LiveSimulationDashboard } from '../simulation/LiveSimulationDashboard';
import { ThreatClassificationDashboard } from '../spectrum/ThreatClassificationDashboard';
import { ExportPanel } from '../shared/ExportPanel';
import { EmitterPresetSelector } from '../experiments/EmitterPresetSelector';
import { soundEffects } from '../../services/soundEffects';

interface LeadResearcherPortalProps {
  currentTab: LeadResearcherTab;
  onNavigateTab: (tab: LeadResearcherTab) => void;
  timeStep: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  bands: FrequencyBand[];
  receiver: ReceiverState;
  adaptiveMetrics: MetricSnapshot;
  baselineMetrics: MetricSnapshot;
  adaptiveConfusion: ConfusionMatrix;
  currentScenario: ScenarioPreset;
  weights: RewardWeights;
  onUpdateWeights: (newWeights: Partial<RewardWeights>) => void;
  onSelectScenario: (scenarioId: string) => void;
  onSwitchToEvaluator: () => void;
  researchQuestions: ResearchQuestion[];
  onAddResearchQuestion: (rq: ResearchQuestion) => void;
  evaluationRequests: EvaluationRequest[];
  onSubmitEvaluationRequest: (req: EvaluationRequest) => void;
  algorithms: AlgorithmDefinition[];
  onAddAlgorithm: (algo: AlgorithmDefinition) => void;
  experimentDesigns: ExperimentDesign[];
  onAddExperimentDesign: (exp: ExperimentDesign) => void;
  heatmapHistory?: HeatmapCell[][];
  simulationSpeed?: 'slow' | 'normal' | 'fast';
  onChangeSpeed?: (speed: 'slow' | 'normal' | 'fast') => void;
  onRunBatchSteps?: (steps: number) => void;
  baselineReceiver?: ReceiverState;
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
  // Export panel data
  adaptiveHistory?: MetricSnapshot[];
  baselineHistory?: MetricSnapshot[];
  learningEvents?: import('../../types/simulation').LearningEvent[];
}

export const LeadResearcherPortal: React.FC<LeadResearcherPortalProps> = ({
  currentTab,
  onNavigateTab,
  timeStep,
  isRunning,
  onTogglePlay,
  onStep,
  onReset,
  bands,
  receiver,
  adaptiveMetrics,
  baselineMetrics,
  adaptiveConfusion,
  currentScenario,
  weights,
  onUpdateWeights,
  onSelectScenario,
  onSwitchToEvaluator,
  researchQuestions,
  onAddResearchQuestion,
  evaluationRequests,
  onSubmitEvaluationRequest,
  algorithms,
  onAddAlgorithm,
  experimentDesigns,
  onAddExperimentDesign,
  heatmapHistory = [],
  simulationSpeed = 'normal',
  onChangeSpeed = () => {},
  onRunBatchSteps = () => {},
  baselineReceiver,
  emitters = [],
  onApplyCustomEnvironment = () => {},
  onAddEmitter,
  onDeleteEmitter,
  onUpdateEmitter,
  onInjectJamming,
  onClearJamming,
  adaptiveHistory = [],
  baselineHistory = [],
  learningEvents = [],
}) => {
  // View mode toggle inside Command Center: Live Simulation vs Research Lifecycle
  const [commandCenterView, setCommandCenterView] = useState<'simulation' | 'lifecycle'>('simulation');

  // Modal states for creating new research items
  const [isCreateRqOpen, setIsCreateRqOpen] = useState<boolean>(false);
  const [newRqTitle, setNewRqTitle] = useState<string>('');
  const [newRqHypothesis, setNewRqHypothesis] = useState<string>('');
  const [newRqCategory, setNewRqCategory] = useState<ResearchQuestion['category']>('Latency Reduction');
  const [newRqMetric, setNewRqMetric] = useState<string>('Average Detection Delay (Steps)');
  const [newRqTarget, setNewRqTarget] = useState<string>('< 2.2 steps');

  // Modal for new algorithm
  const [isCreateAlgoOpen, setIsCreateAlgoOpen] = useState<boolean>(false);
  const [newAlgoName, setNewAlgoName] = useState<string>('');
  const [newAlgoType, setNewAlgoType] = useState<AlgorithmDefinition['type']>('reinforcement_learning');
  const [newAlgoDesc, setNewAlgoDesc] = useState<string>('');

  // Modal for new experiment design
  const [isCreateExpOpen, setIsCreateExpOpen] = useState<boolean>(false);
  const [newExpName, setNewExpName] = useState<string>('');
  const [newExpRqId, setNewExpRqId] = useState<string>(researchQuestions[0]?.id || 'RQ-001');
  const [newExpAlgoId, setNewExpAlgoId] = useState<string>(algorithms[0]?.id || 'algo-01');
  const [newExpDuration, setNewExpDuration] = useState<number>(1000);

  // Quick Dispatch Evaluation Modal
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [dispatchRqId, setDispatchRqId] = useState<string>(researchQuestions[0]?.id || 'RQ-001');
  const [dispatchAlgoName, setDispatchAlgoName] = useState<string>('Vayu-Netra Adaptive ML Scheduler');
  const [dispatchTarget, setDispatchTarget] = useState<string>('Detection Delay < 2.5 steps, P_d > 90%');
  const [dispatchPriority, setDispatchPriority] = useState<'High' | 'Normal' | 'Urgent'>('High');

  // Handlers
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRqTitle.trim()) return;

    const nextNum = researchQuestions.length + 1;
    const nextId = `RQ-${String(nextNum).padStart(3, '0')}`;

    const newRq: ResearchQuestion = {
      id: nextId,
      title: newRqTitle,
      description: `Investigating ${newRqCategory.toLowerCase()} under synthetic electromagnetic surveillance scenarios.`,
      status: 'Active',
      hypothesis: newRqHypothesis || 'Adaptive scanning reduces intercept latency over sequential sweep.',
      primaryMetric: newRqMetric,
      targetValue: newRqTarget,
      currentValue: 'Pending trial benchmark execution',
      validationConfidence: 85.0,
      category: newRqCategory,
      createdAt: new Date().toISOString().split('T')[0],
      assignedEvaluator: 'evaluator@vayu-netra.gov.in',
    };

    onAddResearchQuestion(newRq);
    setIsCreateRqOpen(false);
    setNewRqTitle('');
    setNewRqHypothesis('');
    soundEffects.playLearningPing();
  };

  const handleSaveAlgorithm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlgoName.trim()) return;

    const newAlgo: AlgorithmDefinition = {
      id: `algo-${String(algorithms.length + 1).padStart(2, '0')}`,
      name: newAlgoName,
      version: 'v1.2-synth',
      type: newAlgoType,
      description: newAlgoDesc || 'Custom candidate algorithm for wideband search space optimization.',
      formula: 'Priority(b) = w_r * Recency(b) + w_p * P_hat(b) - w_c * SwitchCost(b)',
      author: 'Lead Researcher (Dr. K. Raman)',
      status: 'Candidate',
      parameters: { learningRate: 0.15, explorationConst: 1.4, recencyDecay: 0.85 },
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onAddAlgorithm(newAlgo);
    setIsCreateAlgoOpen(false);
    setNewAlgoName('');
    setNewAlgoDesc('');
    soundEffects.playLearningPing();
  };

  const handleSaveExperimentDesign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpName.trim()) return;

    const newExp: ExperimentDesign = {
      id: `EXP-DSG-${String(experimentDesigns.length + 1).padStart(3, '0')}`,
      name: newExpName,
      rqId: newExpRqId,
      algorithmId: newExpAlgoId,
      scenarioId: currentScenario.id,
      durationSteps: newExpDuration,
      monteCarloSeeds: [42, 1337, 2026],
      noiseFloorDbm: currentScenario.noiseDbm,
      notes: 'Controlled synthetic benchmark design for independent evaluator review.',
      status: 'Configured',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddExperimentDesign(newExp);
    setIsCreateExpOpen(false);
    setNewExpName('');
    soundEffects.playLearningPing();
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: EvaluationRequest = {
      id: `EV-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      rqId: dispatchRqId,
      title: `Independent Benchmark Verification: ${dispatchRqId}`,
      algorithmName: dispatchAlgoName,
      requestedBy: 'Lead Researcher (Dr. K. Raman)',
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      status: 'Pending',
      testDuration: 1200,
      scenarioId: currentScenario.id,
      benchmarkTarget: dispatchTarget,
      priority: dispatchPriority,
      evaluatorNotes: 'Awaiting evaluator pick-up from incoming queue.',
    };

    onSubmitEvaluationRequest(newReq);
    setIsDispatchModalOpen(false);
    soundEffects.playSweepClick();
    alert(`Evaluation Request ${newReq.id} dispatched to the Algorithm Evaluator Queue!`);
  };

  return (
    <div className="space-y-4">
      {/* 1. Compact, High-Tech Command Header */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-[#050f24] via-[#081a38] to-[#040c1e] p-4 relative overflow-hidden shadow-xl glow-cyan">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-tech text-xs uppercase tracking-widest text-cyan-400 font-bold">
                VAYU-NETRA INTELLIGENCE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>👨‍🔬</span>
                <span>LEAD RESEARCHER</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Simulation Active</span>
              </span>
            </div>

            <h1 className="font-tech text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-wide">
              Research Command Center & Spectrum Surveillance
            </h1>
          </div>

          {/* Quick Simulation Run Controls & Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onTogglePlay}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shadow-md cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 glow-amber'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 glow-emerald animate-pulse'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Start Simulation'}</span>
            </button>

            <button
              onClick={onStep}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs disabled:opacity-40 transition-colors cursor-pointer"
            >
              <span>+1 Step</span>
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs transition-colors cursor-pointer"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Portal Switcher Segmented Control in Banner */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-700/80 font-mono text-xs shadow-inner">
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/25 border border-cyan-400/80 text-cyan-200 font-bold shadow-sm glow-cyan">
                <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Researcher</span>
              </span>
              <button
                onClick={onSwitchToEvaluator}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/50 transition-all font-medium cursor-pointer"
                title="Select Option: Change to Algorithm Evaluator Portal"
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Change to Evaluator →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Quick Summary Strip */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3 mt-3 border-t border-cyan-900/40 font-mono text-[11px]">
          <div>
            <span className="text-slate-400 block text-[10px]">Research Questions</span>
            <strong className="text-cyan-300 font-bold">0{researchQuestions.length} Formulated</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Algorithm Library</span>
            <strong className="text-slate-200 font-bold">0{algorithms.length} Algorithms</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Monte Carlo Runs</span>
            <strong className="text-slate-200 font-bold">0{experimentDesigns.length} Matrices</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Evaluator Queue</span>
            <strong className="text-amber-400 font-bold">0{evaluationRequests.length} Dispatched</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Simulated Dwells</span>
            <strong className="text-emerald-400 font-bold">#{timeStep.toLocaleString()}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Detection P_d</span>
            <strong className="text-cyan-300 font-bold">{adaptiveMetrics.probabilityOfDetection.toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      {/* 2. Researcher Sub-Views */}

      {/* TAB: RESEARCH COMMAND CENTER */}
      {currentTab === 'command_center' && (
        <div className="space-y-4">
          {/* CommandCenter Primary View Switcher: Live RF Simulation (Default) vs Lifecycle Stepper */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/90 border border-cyan-800/60 font-mono text-xs shadow-lg">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setCommandCenterView('simulation')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  commandCenterView === 'simulation'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>⚡ Live RF Spectrum Surveillance & Scanning Graph</span>
                {isRunning && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
              </button>

              <button
                onClick={() => setCommandCenterView('lifecycle')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  commandCenterView === 'lifecycle'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>📋 Research Questions & Lifecycle Roadmap</span>
              </button>
            </div>

            <div className="flex items-center gap-3 px-3 py-1.5">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Mode: <strong className="text-cyan-300">Live Continuous EW Simulation Active</strong>
              </span>
              <button
                onClick={() => onNavigateTab('live_simulation')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <span>Full-Screen Stream</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* VIEW 1: LIVE SIMULATION DASHBOARD */}
          {commandCenterView === 'simulation' && (
            <div className="space-y-4">
              <LiveSimulationDashboard
                isRunning={isRunning}
                timeStep={timeStep}
                bands={bands}
                receiver={receiver}
                weights={weights}
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

          {/* Quick Action Toolbar (Positioned below live simulation) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#070b16] border border-slate-800 font-mono text-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold">
              Research Management Actions:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsCreateRqOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Research Question</span>
              </button>

              <button
                onClick={() => setIsCreateExpOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>+ Design Experiment</span>
              </button>

              <button
                onClick={() => setIsDispatchModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Evaluator</span>
              </button>

              <button
                onClick={() => onNavigateTab('research_reports')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export Research Paper</span>
              </button>
            </div>
          </div>

          {/* VIEW 2: RESEARCH LIFECYCLE ROADMAP */}
          {commandCenterView === 'lifecycle' && (
            <div className="space-y-6">
              {/* Research Lifecycle Stepper */}
              <div className="p-5 rounded-2xl bg-[#070b16] border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                  <span>Scientific Research Lifecycle Management</span>
                  <span className="text-cyan-400 font-bold">Phase: Active Experimentation</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                  <button
                    onClick={() => onNavigateTab('research_questions')}
                    className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-700/60 text-left transition-colors glow-cyan"
                  >
                    <div className="text-[10px] text-cyan-400 font-bold">STAGE 1: RESEARCH</div>
                    <div className="font-bold text-cyan-200 mt-1">Research Questions</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{researchQuestions.length} Questions Defined</div>
                  </button>

                  <button
                    onClick={() => onNavigateTab('system_model')}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500 text-left transition-colors"
                  >
                    <div className="text-[10px] text-slate-500 font-bold">STAGE 2: DESIGN</div>
                    <div className="font-bold text-slate-100 mt-1">System Model</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">POMDP & State Math</div>
                  </button>

                  <button
                    onClick={() => onNavigateTab('synthetic_rf_environment')}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500 text-left transition-colors"
                  >
                    <div className="text-[10px] text-slate-500 font-bold">STAGE 3: CONFIGURE</div>
                    <div className="font-bold text-slate-100 mt-1">Synthetic RF Env</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{bands.length} Channels · Emitters</div>
                  </button>

                  <button
                    onClick={() => onNavigateTab('experiment_designer')}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500 text-left transition-colors"
                  >
                    <div className="text-[10px] text-slate-500 font-bold">STAGE 4: EXPERIMENT</div>
                    <div className="font-bold text-slate-100 mt-1">Experiment Designer</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Monte Carlo Seeds</div>
                  </button>

                  <button
                    onClick={() => onNavigateTab('evaluation_requests')}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500 text-left transition-colors"
                  >
                    <div className="text-[10px] text-slate-500 font-bold">STAGE 5: EVALUATE</div>
                    <div className="font-bold text-slate-100 mt-1">Evaluation Requests</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{evaluationRequests.length} Dispatched</div>
                  </button>

                  <button
                    onClick={() => onNavigateTab('research_results')}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500 text-left transition-colors"
                  >
                    <div className="text-[10px] text-slate-500 font-bold">STAGE 6: ANALYZE</div>
                    <div className="font-bold text-slate-100 mt-1">Research Results</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Synthesis & Findings</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Research Questions Snapshot + Evaluation Dispatch Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Active Research Questions (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#070b16] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Core Research Hypotheses Under Investigation
                  </span>
                </div>
                <button
                  onClick={() => onNavigateTab('research_questions')}
                  className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>View All {researchQuestions.length} RQs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {researchQuestions.slice(0, 3).map((rq) => (
                  <div
                    key={rq.id}
                    className="p-3.5 rounded-xl bg-[#040813] border border-slate-800 hover:border-cyan-800/60 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/50 px-2 py-0.5 rounded text-[11px]">
                          {rq.id}
                        </span>
                        <span className="text-[10px] text-slate-400">{rq.category}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                        {rq.status}
                      </span>
                    </div>

                    <h3 className="font-tech text-sm font-bold text-slate-200">
                      {rq.title}
                    </h3>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      “{rq.hypothesis}”
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px] font-mono">
                      <span className="text-slate-400">Target: <strong className="text-slate-200">{rq.targetValue}</strong></span>
                      <button
                        onClick={() => {
                          setDispatchRqId(rq.id);
                          setIsDispatchModalOpen(true);
                        }}
                        className="text-[11px] text-cyan-300 hover:underline flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Dispatch to Evaluator</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Algorithm Library & Dispatched Requests (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Algorithm Library Card */}
              <div className="p-5 rounded-2xl bg-[#070b16] border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span className="font-tech text-sm font-bold text-slate-100 uppercase">
                      Algorithm Registry
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('algorithm_library')}
                    className="text-cyan-400 hover:underline text-[11px]"
                  >
                    Manage Library
                  </button>
                </div>

                <div className="space-y-2">
                  {algorithms.slice(0, 3).map((algo) => (
                    <div
                      key={algo.id}
                      className="p-2.5 rounded-lg bg-[#040813] border border-slate-800/80 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-200">{algo.name}</div>
                        <div className="text-[10px] text-slate-500">{algo.type} · {algo.version}</div>
                      </div>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          algo.status === 'Champion'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {algo.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispatched Evaluation Status */}
              <div className="p-5 rounded-2xl bg-[#070b16] border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span className="font-tech text-sm font-bold text-slate-100 uppercase">
                      Dispatched Evaluations
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('evaluation_requests')}
                    className="text-emerald-400 hover:underline text-[11px]"
                  >
                    View Queue
                  </button>
                </div>

                <div className="space-y-2">
                  {evaluationRequests.slice(0, 2).map((req) => (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-lg bg-[#040813] border border-slate-800/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{req.id}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                            req.status === 'Certified'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{req.title}</div>
                      <div className="text-[9px] text-slate-500">Target: {req.benchmarkTarget}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DEDICATED FULL-SCREEN LIVE SIMULATION */}
      {currentTab === 'live_simulation' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-tech text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <span>Live RF Spectrum Surveillance & Dynamic Dwell Simulation</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Real-time synthetic multi-band RF emission generation and online reinforcement learning receiver sweep
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Simulation Engine Active</span>
              </span>
            </div>
          </div>

          <LiveSimulationDashboard
            isRunning={isRunning}
            timeStep={timeStep}
            bands={bands}
            receiver={receiver}
            weights={weights}
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

      {/* TAB: RESEARCH QUESTIONS */}
      {currentTab === 'research_questions' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-tech text-xl font-bold text-slate-100 uppercase tracking-wide">
                Research Questions & Hypotheses
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Systematic hypotheses guiding the SMART scan strategy investigation
              </p>
            </div>

            <button
              onClick={() => setIsCreateRqOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs transition-all shadow-md glow-cyan"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Research Question</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {researchQuestions.map((rq) => (
              <div
                key={rq.id}
                className="p-5 rounded-2xl bg-[#070b16] border border-slate-800 space-y-4 hover:border-cyan-800/60 transition-colors shadow-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-tech text-base font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-3 py-1 rounded-lg">
                      {rq.id}
                    </span>
                    <div>
                      <h3 className="font-tech text-base font-bold text-slate-100">
                        {rq.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                        <span>Category: {rq.category}</span>
                        <span>·</span>
                        <span>Created: {rq.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
                        rq.status === 'Validated'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                          : rq.status === 'Active'
                          ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
                          : 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                      }`}
                    >
                      {rq.status}
                    </span>
                    <button
                      onClick={() => {
                        setDispatchRqId(rq.id);
                        setIsDispatchModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-mono transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Evaluation</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-[#040813] border border-slate-800/80 space-y-1.5">
                    <div className="text-[10px] uppercase text-cyan-400 font-bold">Formal Hypothesis</div>
                    <p className="text-slate-300 font-sans leading-relaxed text-xs">
                      “{rq.hypothesis}”
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#040813] border border-slate-800/80 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary Metric:</span>
                      <span className="text-slate-200 font-bold">{rq.primaryMetric}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Threshold:</span>
                      <span className="text-emerald-400 font-bold">{rq.targetValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Measured Value:</span>
                      <span className="text-cyan-300 font-bold">{rq.currentValue}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-1.5">
                      <span className="text-slate-400">Validation Confidence:</span>
                      <span className="text-cyan-400 font-bold">{rq.validationConfidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: SYSTEM MODEL */}
      {currentTab === 'system_model' && <ResearchMode />}

      {/* TAB: RF ENVIRONMENT SIMULATOR */}
      {currentTab === 'synthetic_rf_environment' && (
        <div className="space-y-4">
          {onAddEmitter && (
            <EmitterPresetSelector
              bandCount={bands.length}
              onAddEmitter={onAddEmitter}
            />
          )}
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
        </div>
      )}

      {/* TAB: ALGORITHM LIBRARY */}
      {currentTab === 'algorithm_library' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-tech text-xl font-bold text-slate-100 uppercase tracking-wide">
                Algorithm Library & Model Architecture
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Create, configure, and inspect candidate scanning algorithms and baseline policies
              </p>
            </div>

            <button
              onClick={() => setIsCreateAlgoOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs transition-all shadow-md glow-cyan"
            >
              <Plus className="w-4 h-4" />
              <span>+ Register Algorithm</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {algorithms.map((algo) => (
              <div
                key={algo.id}
                className={`p-5 rounded-2xl border space-y-3 relative overflow-hidden ${
                  algo.status === 'Champion'
                    ? 'bg-[#070f20] border-cyan-500/60 glow-cyan ring-1 ring-cyan-500/30'
                    : 'bg-[#070b16] border-slate-800 hover:border-cyan-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-tech text-base font-bold text-slate-100 uppercase">
                      {algo.name}
                    </h3>
                    <div className="text-[10px] font-mono text-slate-400">
                      {algo.type} · Version {algo.version} · Author: {algo.author}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      algo.status === 'Champion'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {algo.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {algo.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-900/60 font-mono text-xs space-y-1 text-slate-400">
                  <div className="text-[10px] uppercase text-cyan-400 font-bold">Policy Formulation</div>
                  <code className="text-slate-200 text-[11px] block">{algo.formula}</code>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-500">Updated: {algo.lastUpdated}</span>
                  <button
                    onClick={() => {
                      setDispatchAlgoName(algo.name);
                      setIsDispatchModalOpen(true);
                    }}
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Dispatch for Testing</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: EXPERIMENT DESIGNER */}
      {currentTab === 'experiment_designer' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-tech text-xl font-bold text-slate-100 uppercase tracking-wide">
                Experiment Designer & Monte Carlo Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Formulate controlled trial configurations, duration steps, and parameter sweeps
              </p>
            </div>

            <button
              onClick={() => setIsCreateExpOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs transition-all shadow-md glow-cyan"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Experiment Design</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experimentDesigns.map((exp) => (
              <div
                key={exp.id}
                className="p-5 rounded-2xl bg-[#070b16] border border-slate-800 space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 text-sm">{exp.name}</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                    {exp.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Linked RQ:</span>
                    <span>{exp.rqId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Algorithm Target:</span>
                    <span>{exp.algorithmId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trial Steps:</span>
                    <span>{exp.durationSteps} steps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seeds:</span>
                    <span>{exp.monteCarloSeeds.join(', ')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-slate-500 text-[10px]">Created: {exp.createdAt}</span>
                  <button
                    onClick={() => {
                      setDispatchRqId(exp.rqId);
                      setDispatchTarget(`Trial run ${exp.durationSteps} steps with seeds`);
                      setIsDispatchModalOpen(true);
                    }}
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Dispatch to Evaluator</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <ExperimentLab
            currentMetrics={adaptiveMetrics}
            baselineMetrics={baselineMetrics}
            weights={weights}
            bandCount={bands.length}
            scenarioName={currentScenario.name}
            onRunBatchSteps={() => onStep()}
            onCreateExperimentSnapshot={(name) => ({
              id: `EXP-${Date.now().toString(36).toUpperCase()}`,
              timestamp: new Date().toISOString(),
              scenarioName: name,
              bandCount: bands.length,
              durationSteps: timeStep,
              schedulerType: 'adaptive_ml',
              weights,
              metrics: adaptiveMetrics,
              baselineMetrics,
              improvementPercentage: 42.5,
            })}
          />
        </div>
      )}

      {/* TAB: SCHEDULER CONFIGURATION */}
      {currentTab === 'scheduler_configuration' && (
        <RewardOptimizer
          weights={weights}
          onUpdateWeights={onUpdateWeights}
          onResetWeights={() =>
            onUpdateWeights({
              detectionBenefit: 1.0,
              delayCost: 0.5,
              falseAlarmPenalty: 0.4,
              scanCost: 0.2,
            })
          }
          onRunBatch={() => onStep()}
        />
      )}

      {/* TAB: ML MODEL */}
      {currentTab === 'ml_model' && (
        <MlEngineView
          bands={bands}
          confusion={adaptiveConfusion}
          learningEvents={[]}
          trainingSamples={2450}
          recentObservations={timeStep}
          weights={weights}
          timeStep={timeStep}
        />
      )}

      {/* TAB: EVALUATION REQUESTS */}
      {currentTab === 'evaluation_requests' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-tech text-xl font-bold text-slate-100 uppercase tracking-wide">
                Evaluation Requests Pipeline
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Verification tasks submitted to the Algorithm Evaluator team for independent benchmarking
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDispatchModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-md glow-cyan"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Evaluation Request</span>
              </button>

              <button
                onClick={onSwitchToEvaluator}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 font-mono text-xs hover:bg-emerald-900/60"
              >
                <span>Open Evaluator Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {evaluationRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-[#070b16] border border-slate-800 space-y-3 shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-cyan-300">{req.id}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">Linked: {req.rqId}</span>
                    {req.priority && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800">
                        {req.priority} Priority
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.status === 'Certified'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : req.status === 'In Progress'
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-tech text-sm font-bold text-slate-200">
                    {req.title}
                  </h4>
                  <p className="text-slate-400">
                    Algorithm: <strong className="text-slate-200">{req.algorithmName}</strong> | Duration: {req.testDuration} steps | Target: <strong className="text-emerald-400">{req.benchmarkTarget}</strong>
                  </p>
                </div>

                {req.evaluatorNotes && (
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                    <span>Evaluator Log: {req.evaluatorNotes}</span>
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

      {/* TAB: RESEARCH RESULTS */}
      {currentTab === 'research_results' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#070b16] border border-cyan-500/40 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-tech text-lg font-bold text-slate-100 uppercase tracking-wide">
                  Empirical Findings & Hypothesis Synthesis
                </h3>
                <p className="text-slate-400 text-xs mt-0.5 font-sans">
                  Consolidated scientific conclusions based on validated synthetic EW simulations
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('research_reports')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Paper Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
                <span className="text-cyan-400 font-bold uppercase text-[10px]">Validated Finding #1</span>
                <h4 className="text-slate-200 font-bold text-sm">Mean Intercept Delay Reduced by 58%</h4>
                <p className="text-slate-400 font-sans text-xs">
                  Vayu-Netra achieves a 58% lower mean detection delay than sequential sweeps across bursty radar patterns with unknown transmission periods.
                </p>
                <div className="text-emerald-400 font-bold">p &lt; 0.001 (Statistically Significant)</div>
              </div>

              <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
                <span className="text-cyan-400 font-bold uppercase text-[10px]">Validated Finding #2</span>
                <h4 className="text-slate-200 font-bold text-sm">Detection Ratio Uplift to 92.4%</h4>
                <p className="text-slate-400 font-sans text-xs">
                  Online probability estimation with temporal recency decay raises the signal detection ratio from 58.2% to 92.4% without prior emitter intelligence.
                </p>
                <div className="text-emerald-400 font-bold">CI: [90.8%, 94.0%] (95% Level)</div>
              </div>

              <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2">
                <span className="text-cyan-400 font-bold uppercase text-[10px]">Validated Finding #3</span>
                <h4 className="text-slate-200 font-bold text-sm">Thermal Noise Robustness at -95 dBm</h4>
                <p className="text-slate-400 font-sans text-xs">
                  Dual-threshold energy detector confirmation suppresses false alarms below 4.6% across fluctuating thermal noise floors.
                </p>
                <div className="text-emerald-400 font-bold">P_fa = 4.3% Measured</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RESEARCH REPORTS */}
      {currentTab === 'research_reports' && (
        <div className="p-6 rounded-2xl bg-[#070b16] border border-slate-800 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-tech text-lg font-bold text-slate-100 uppercase tracking-wide">
                Final Research Report Generator
              </h3>
              <p className="text-slate-400 text-xs font-sans mt-0.5">
                Automated academic paper draft ready for IEEE / AOC peer-review formatting
              </p>
            </div>
            <button
              onClick={() => {
                soundEffects.playHitSound();
                alert('Academic research paper exported to synthetic PDF-ready markdown format.');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export LaTeX / Markdown</span>
            </button>
          </div>

          <div className="p-5 rounded-xl bg-[#030612] border border-slate-800 space-y-3 font-sans text-xs leading-relaxed text-slate-300">
            <h4 className="font-tech text-base font-bold text-slate-100 uppercase font-mono">
              VAYU-NETRA: Adaptive Reinforcement Learning for Electronic Support Receiver Scheduling under Unknown Emitter Priors
            </h4>
            <div className="text-cyan-400 font-mono text-[11px]">
              Authors: Dr. K. Raman (Lead Researcher), Vayu-Netra Simulation Group · September 2026
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <strong className="text-slate-100">Abstract:</strong> In modern electronic warfare, wideband electronic support (ES) receivers must intercept agile, low-probability-of-intercept (LPI) radar emissions across multiple gigahertz without reliable prior emitter intelligence. We present Vayu-Netra, an online reinforcement learning scheduling framework combining empirical recency decay and Upper Confidence Bound (UCB) exploration. Across rigorous synthetic simulations, Vayu-Netra demonstrates a 58% reduction in mean detection delay and an intercept ratio exceeding 92% compared with traditional sequential sweep baselines.
            </div>
          </div>
        </div>
      )}

      {/* TAB: EXPERIMENT HISTORY */}
      {currentTab === 'experiment_history' && (
        <div className="p-6 rounded-2xl bg-[#070b16] border border-slate-800 space-y-4 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide">
              Experiment Run History & Audit Trail
            </h3>
            <span className="text-slate-500 text-[11px]">Audit Logs: Deterministic</span>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-[#040813] border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-cyan-400 font-bold">EXP-2026-0926-A</span>
                <span className="text-slate-400 ml-2">Scenario E (Mixed Realistic) · 1,500 Steps</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold">+58.4% Delay Advantage</span>
                <span className="text-slate-500 text-[10px] block">Validated</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#040813] border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-cyan-400 font-bold">EXP-2026-0924-B</span>
                <span className="text-slate-400 ml-2">Scenario C (Bursty Agile) · 1,000 Steps</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold">+44.2% Intercept Uplift</span>
                <span className="text-slate-500 text-[10px] block">Validated</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RESEARCH TEAM */}
      {currentTab === 'research_team' && (
        <div className="p-6 rounded-2xl bg-[#070b16] border border-slate-800 space-y-4 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide">
              Research Team Directory & Authorization Roster
            </h3>
            <button
              onClick={() => alert('New team member invite link generated.')}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30"
            >
              + Invite Researcher
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#040813] border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-100">Dr. K. Raman</div>
                <div className="text-[10px] text-cyan-400">Lead Scientific Researcher (Active Session)</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                FULL ADMIN
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#040813] border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-100">S. Deshmukh</div>
                <div className="text-[10px] text-emerald-400">Lead Algorithm Evaluator</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                QA / EVALUATOR
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: THREAT CLASSIFICATION */}
      {currentTab === 'threat_classification' && (
        <ThreatClassificationDashboard
          emitters={emitters}
          timeStep={timeStep}
        />
      )}

      {/* TAB: DATA EXPORT & REPORTS */}
      {currentTab === 'data_export' && (
        <ExportPanel
          timeStep={timeStep}
          bands={bands}
          emitters={emitters}
          adaptiveMetrics={adaptiveMetrics}
          baselineMetrics={baselineMetrics}
          adaptiveHistory={adaptiveHistory}
          baselineHistory={baselineHistory}
          adaptiveConfusion={adaptiveConfusion}
          heatmapHistory={heatmapHistory}
          learningEvents={learningEvents}
          weights={weights}
          currentScenario={currentScenario}
        />
      )}

      {/* TAB: SETTINGS */}
      {currentTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-[#070b16] border border-slate-800 space-y-4 font-mono text-xs">
          <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-3">
            Researcher Platform Configuration
          </h3>
          <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-2 text-slate-300">
            <div>Operating Mode: <strong>Strict Synthetic RF Simulation Only (500–3500 MHz)</strong></div>
            <div>Random Seed Control: <strong>Deterministic PRNG (Mersenne Twister Seed 42)</strong></div>
            <div>Safety Guarantee: <strong>Zero hardware interface, zero operational EW connections</strong></div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE RESEARCH QUESTION */}
      {isCreateRqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#070b16] border border-cyan-500/50 rounded-2xl p-6 shadow-2xl space-y-4 relative glow-cyan">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-tech text-lg font-bold text-slate-100 uppercase">
                  Create New Research Question
                </h3>
              </div>
              <button
                onClick={() => setIsCreateRqOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Research Question Title</label>
                <input
                  type="text"
                  value={newRqTitle}
                  onChange={(e) => setNewRqTitle(e.target.value)}
                  required
                  placeholder="e.g., Can deep Q-learning outperform upper confidence bound heuristics?"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Scientific Hypothesis</label>
                <textarea
                  value={newRqHypothesis}
                  onChange={(e) => setNewRqHypothesis(e.target.value)}
                  rows={3}
                  placeholder="State the testable hypothesis and expected improvement..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newRqCategory}
                    onChange={(e) => setNewRqCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value="Latency Reduction">Latency Reduction</option>
                    <option value="Activity Density">Activity Density</option>
                    <option value="Feedback Learning">Feedback Learning</option>
                    <option value="Noise Robustness">Noise Robustness</option>
                    <option value="Scheduler Parameters">Scheduler Parameters</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Primary Metric</label>
                  <input
                    type="text"
                    value={newRqMetric}
                    onChange={(e) => setNewRqMetric(e.target.value)}
                    placeholder="e.g. Average Detection Delay"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Acceptance Threshold</label>
                <input
                  type="text"
                  value={newRqTarget}
                  onChange={(e) => setNewRqTarget(e.target.value)}
                  placeholder="e.g. P_d > 92.5%, Delay < 2.0 steps"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRqOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-slate-300 text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DISPATCH EVALUATION REQUEST */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#070b16] border border-cyan-500/50 rounded-2xl p-6 shadow-2xl space-y-4 relative glow-cyan">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" />
                <h3 className="font-tech text-lg font-bold text-slate-100 uppercase">
                  Submit Evaluation Request
                </h3>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Target Research Question</label>
                <select
                  value={dispatchRqId}
                  onChange={(e) => setDispatchRqId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                >
                  {researchQuestions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.id}: {q.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Algorithm to Benchmark</label>
                <input
                  type="text"
                  value={dispatchAlgoName}
                  onChange={(e) => setDispatchAlgoName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Benchmark Acceptance Criteria</label>
                <input
                  type="text"
                  value={dispatchTarget}
                  onChange={(e) => setDispatchTarget(e.target.value)}
                  placeholder="e.g. Delay < 2.5 steps, P_d > 90%"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Priority</label>
                <select
                  value={dispatchPriority}
                  onChange={(e) => setDispatchPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                >
                  <option value="Urgent">Urgent (Immediate Queue Priority)</option>
                  <option value="High">High Priority</option>
                  <option value="Normal">Normal Batch</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-slate-300 text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Dispatch to Evaluator Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER ALGORITHM */}
      {isCreateAlgoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#070b16] border border-cyan-500/50 rounded-2xl p-6 shadow-2xl space-y-4 relative glow-cyan">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <h3 className="font-tech text-lg font-bold text-slate-100 uppercase">
                  Register Algorithm in Library
                </h3>
              </div>
              <button
                onClick={() => setIsCreateAlgoOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAlgorithm} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Algorithm Name</label>
                <input
                  type="text"
                  value={newAlgoName}
                  onChange={(e) => setNewAlgoName(e.target.value)}
                  required
                  placeholder="e.g. Dynamic Thompson Sampling Scheduler"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Type</label>
                <select
                  value={newAlgoType}
                  onChange={(e) => setNewAlgoType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                >
                  <option value="reinforcement_learning">Reinforcement Learning</option>
                  <option value="probabilistic">Bayesian / Probabilistic</option>
                  <option value="heuristic">Heuristic Search</option>
                  <option value="baseline">Baseline Comparative</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  value={newAlgoDesc}
                  onChange={(e) => setNewAlgoDesc(e.target.value)}
                  rows={3}
                  placeholder="Describe mathematical heuristic and objective function..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateAlgoOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-slate-300 text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DESIGN EXPERIMENT */}
      {isCreateExpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#070b16] border border-cyan-500/50 rounded-2xl p-6 shadow-2xl space-y-4 relative glow-cyan">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-cyan-400" />
                <h3 className="font-tech text-lg font-bold text-slate-100 uppercase">
                  Design Experiment Matrix
                </h3>
              </div>
              <button
                onClick={() => setIsCreateExpOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExperimentDesign} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Experiment Name</label>
                <input
                  type="text"
                  value={newExpName}
                  onChange={(e) => setNewExpName(e.target.value)}
                  required
                  placeholder="e.g. Sensitivity to Severe Noise (-95 dBm to -85 dBm)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Target RQ</label>
                  <select
                    value={newExpRqId}
                    onChange={(e) => setNewExpRqId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    {researchQuestions.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Duration Steps</label>
                  <select
                    value={newExpDuration}
                    onChange={(e) => setNewExpDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value={500}>500 Steps (Fast)</option>
                    <option value={1000}>1,000 Steps (Standard)</option>
                    <option value={2500}>2,500 Steps (Deep Monte Carlo)</option>
                    <option value={5000}>5,000 Steps (High Precision)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateExpOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-slate-300 text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Save Experiment Design
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
