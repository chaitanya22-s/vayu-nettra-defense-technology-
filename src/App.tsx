/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SimulationEngine,
  SCENARIO_PRESETS,
  DEFAULT_WEIGHTS,
} from './services/simulationEngine';
import { soundEffects } from './services/soundEffects';
import {
  loadPersistedState,
  saveResearchQuestions,
  saveEvaluationRequests,
  saveAlgorithms,
  saveExperimentDesigns,
  saveWeights,
  savePortalRole,
  saveResearcherTab,
  saveEvaluatorTab,
  saveSoundEnabled,
  saveSimulationSpeed,
} from './services/persistenceService';
import {
  ConfusionMatrix,
  ExperimentRun,
  FrequencyBand,
  HeatmapCell,
  LearningEvent,
  MetricSnapshot,
  PatternType,
  ReceiverState,
  RewardWeights,
  ScenarioPreset,
  PortalRole,
  LeadResearcherTab,
  AlgorithmEvaluatorTab,
  ResearchQuestion,
  EvaluationRequest,
  AlgorithmDefinition,
  ExperimentDesign,
  SyntheticEmitter,
} from './types/simulation';

// Layout & Modals
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DemoTourModal } from './components/presentation/DemoTourModal';
import { LoginPage } from './components/auth/LoginPage';
import { RoleSelectionModal } from './components/auth/RoleSelectionModal';
import { ResponsibleNotice } from './components/shared/ResponsibleNotice';

// Portals
import { LeadResearcherPortal } from './components/researcher/LeadResearcherPortal';
import { AlgorithmEvaluatorPortal } from './components/evaluator/AlgorithmEvaluatorPortal';

export default function App() {
  const persisted = loadPersistedState();

  // Navigation & Role State
  const [portalRole, setPortalRole] = useState<PortalRole>(persisted.portalRole || 'lead_researcher');
  const [currentResearcherTab, setCurrentResearcherTab] = useState<LeadResearcherTab>(persisted.researcherTab || 'command_center');
  const [currentEvaluatorTab, setCurrentEvaluatorTab] = useState<AlgorithmEvaluatorTab>(persisted.evaluatorTab || 'eval_dashboard');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);
  const [isResponsibleModalOpen, setIsResponsibleModalOpen] = useState<boolean>(false);
  const [isRoleSelectionOpen, setIsRoleSelectionOpen] = useState<boolean>(false);

  const [userEmail, setUserEmail] = useState<string | null>('lead.researcher@vayu-netra.gov.in');
  const [userRole, setUserRole] = useState<string>('Lead Researcher');

  // Shared Research & Evaluation State across both portals
  const [researchQuestions, setResearchQuestions] = useState<ResearchQuestion[]>(persisted.researchQuestions || [
    {
      id: 'RQ-001',
      title: 'Can adaptive scheduling reduce simulated detection delay compared with a fixed sweep?',
      description: 'Quantify the mean intercept delay under bursty and agile radar emissions when prior emitter intelligence is unavailable.',
      status: 'Active',
      hypothesis: 'Online recency and probability tracking reduces intercept delay by at least 40% relative to sequential round-robin sweeps.',
      primaryMetric: 'Average Detection Delay (Steps)',
      targetValue: '< 2.5 steps',
      currentValue: '1.9 steps (Baseline: 4.8 steps)',
      validationConfidence: 96.8,
      category: 'Latency Reduction',
      createdAt: '2026-09-20',
      assignedEvaluator: 'evaluator@vayu-netra.gov.in',
    },
    {
      id: 'RQ-002',
      title: 'Effect of spectrum activity density on reinforcement heuristic convergence',
      description: 'Analyze how varying transmission duty cycles (10% to 75%) impact the exploration-exploitation tradeoff in multi-band surveillance.',
      status: 'Active',
      hypothesis: 'Higher activity density accelerates confidence convergence but increases dwell contention among high-priority channels.',
      primaryMetric: 'Convergence Rate & Probability of Detection',
      targetValue: 'P_d > 90% across all densities',
      currentValue: '92.4%',
      validationConfidence: 94.2,
      category: 'Activity Density',
      createdAt: '2026-09-22',
      assignedEvaluator: 'evaluator@vayu-netra.gov.in',
    },
    {
      id: 'RQ-003',
      title: 'Effect of feedback learning rate on tracking agile frequency hoppers',
      description: 'Investigate posterior weight adjustments when emitters jump pseudo-randomly across 24 frequency channels.',
      status: 'Active',
      hypothesis: 'A balanced decay parameter (lambda = 0.85) tracks hop sequences without becoming trapped in vacated channels.',
      primaryMetric: 'Hopper Intercept Rate',
      targetValue: '> 85.0%',
      currentValue: '88.1%',
      validationConfidence: 92.5,
      category: 'Feedback Learning',
      createdAt: '2026-09-24',
      assignedEvaluator: 'evaluator@vayu-netra.gov.in',
    },
    {
      id: 'RQ-004',
      title: 'Effect of prediction accuracy under low SNR thermal noise floors (-95 dBm)',
      description: 'Evaluate classifier false alarms and miss probabilities when synthetic thermal noise interferes with energy detection.',
      status: 'Validated',
      hypothesis: 'Dual energy-threshold confirmation maintains false alarm probability P_fa < 5% even under severe noise fluctuation.',
      primaryMetric: 'False Alarm Rate (P_fa)',
      targetValue: '< 5.0%',
      currentValue: '4.3%',
      validationConfidence: 97.4,
      category: 'Noise Robustness',
      createdAt: '2026-09-25',
      assignedEvaluator: 'evaluator@vayu-netra.gov.in',
    },
    {
      id: 'RQ-005',
      title: 'Effect of scheduler parameters and tuning switch cost penalties',
      description: 'Study the tradeoff between rapid agile retuning and physical local-oscillator (LO) lock delay costs.',
      status: 'Under Evaluation',
      hypothesis: 'Incorporating LO tuning cost into the multi-objective reward function reduces redundant band-switching by 28%.',
      primaryMetric: 'Cumulative Normalized Payoff',
      targetValue: 'Reward > +0.70/step',
      currentValue: '+0.74/step',
      validationConfidence: 89.4,
      category: 'Scheduler Parameters',
      createdAt: '2026-09-26',
      assignedEvaluator: 'evaluator@vayu-netra.gov.in',
    },
  ]);

  const [evaluationRequests, setEvaluationRequests] = useState<EvaluationRequest[]>(persisted.evaluationRequests || [
    {
      id: 'EV-2026-081',
      rqId: 'RQ-001',
      title: 'Benchmark Adaptive ML vs Fixed Sweep (1000-Step Controlled Monte Carlo)',
      algorithmName: 'Vayu-Netra Adaptive Reinforcement Scheduler',
      algorithmId: 'algo-01',
      requestedBy: 'Lead Researcher (Dr. K. Raman)',
      requestedAt: '2026-09-26 14:30 UTC',
      status: 'Pending',
      testDuration: 1000,
      scenarioId: 'pattern_c_bursty',
      benchmarkTarget: 'Delay < 2.5 steps, P_d > 90%',
      priority: 'Urgent',
      evaluatorNotes: 'Awaiting independent evaluator batch run and statistical verification.',
    },
    {
      id: 'EV-2026-079',
      rqId: 'RQ-004',
      title: 'Thermal Noise Robustness & False Alarm Verification (-95 dBm)',
      algorithmName: 'Energy Detector + Bayes Classifier',
      algorithmId: 'algo-03',
      requestedBy: 'Lead Researcher (Dr. K. Raman)',
      requestedAt: '2026-09-25 09:15 UTC',
      status: 'Certified',
      testDuration: 1500,
      scenarioId: 'pattern_e_mixed',
      benchmarkTarget: 'P_fa < 5.0%',
      priority: 'High',
      evaluatorNotes: 'Certified. Measured P_fa = 4.3% across 1,500 synthetic dwell windows.',
      certificationHash: 'VN-CERT-8839-OK',
    },
  ]);

  const [algorithms, setAlgorithms] = useState<AlgorithmDefinition[]>(persisted.algorithms || [
    {
      id: 'algo-01',
      name: 'Vayu-Netra Adaptive Heuristic (ML)',
      version: 'v2.4-champion',
      type: 'reinforcement_learning',
      description: 'Reinforcement-driven priority scheduler. Combines exponential recency decay, empirical detection persistence, and Upper Confidence Bound (UCB) exploration.',
      formula: 'Priority(b) = P_hat(b) + c * sqrt(ln(t) / N_b) - delta * switchCost(b)',
      author: 'Dr. K. Raman (Lead Researcher)',
      status: 'Champion',
      parameters: { learningRate: 0.15, explorationConst: 1.4, recencyDecay: 0.85, loSwitchCost: 0.2 },
      lastUpdated: '2026-09-26',
    },
    {
      id: 'algo-02',
      name: 'Recency-Based Explorer',
      version: 'v1.1-candidate',
      type: 'heuristic',
      description: 'Prioritizes channels with the oldest elapsed dwell timestamp to maintain broad spectrum freshness.',
      formula: 'Priority(b) = (t - lastObserved(b)) / t_max',
      author: 'A. Saxena (Algorithm Team)',
      status: 'Candidate',
      parameters: { windowSize: 50, decayExponent: 1.0 },
      lastUpdated: '2026-09-24',
    },
    {
      id: 'algo-03',
      name: 'Sequential Fixed Sweep',
      version: 'v1.0-baseline',
      type: 'baseline',
      description: 'Traditional round-robin sequential sweep. Evaluates every frequency band in strict numerical order without feedback.',
      formula: 'BandNext = (BandCurrent + 1) mod N',
      author: 'Standard EW Open-Loop Reference',
      status: 'Baseline',
      parameters: { dwellTimeMs: 25 },
      lastUpdated: '2026-09-18',
    },
    {
      id: 'algo-04',
      name: 'Uniform Random Selector',
      version: 'v1.0-control',
      type: 'baseline',
      description: 'Stochastically selects channels from a uniform distribution to quantify worst-case latency bounds.',
      formula: 'BandNext ~ Uniform(1, N)',
      author: 'Stochastic Control Reference',
      status: 'Baseline',
      parameters: {},
      lastUpdated: '2026-09-15',
    },
  ]);

  const [experimentDesigns, setExperimentDesigns] = useState<ExperimentDesign[]>(persisted.experimentDesigns || [
    {
      id: 'EXP-DSG-001',
      name: 'Controlled Monte Carlo: Bursty Agile Radars vs Sequential Baseline',
      rqId: 'RQ-001',
      algorithmId: 'algo-01',
      scenarioId: 'pattern_c_bursty',
      durationSteps: 1000,
      monteCarloSeeds: [42, 1337, 2026],
      noiseFloorDbm: -92,
      notes: 'Evaluate intercept delay improvement across 24 channels with sporadic emitter bursts.',
      status: 'Dispatched',
      createdAt: '2026-09-26',
    },
    {
      id: 'EXP-DSG-002',
      name: 'Low SNR Stress Test under -95 dBm Thermal Noise',
      rqId: 'RQ-004',
      algorithmId: 'algo-01',
      scenarioId: 'pattern_e_mixed',
      durationSteps: 1500,
      monteCarloSeeds: [101, 202, 303],
      noiseFloorDbm: -95,
      notes: 'Assess false-alarm suppression and dual-threshold energy detector performance.',
      status: 'Completed',
      createdAt: '2026-09-25',
    },
  ]);

  // Audio state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(persisted.soundEnabled ?? false);

  // Simulation execution state - Active by default so simulation is live upon start
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<'slow' | 'normal' | 'fast'>(persisted.simulationSpeed || 'normal');

  // Simulation Engine Reference
  const engineRef = useRef<SimulationEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SimulationEngine();
  }
  const engine = engineRef.current;

  // React State Mirrors for UI rendering
  const [timeStep, setTimeStep] = useState<number>(engine.timeStep);
  const [bands, setBands] = useState<FrequencyBand[]>(engine.bands);
  const [adaptiveReceiver, setAdaptiveReceiver] = useState<ReceiverState>(engine.adaptiveReceiver);
  const [baselineReceiver, setBaselineReceiver] = useState<ReceiverState>(engine.baselineReceiver);
  const [adaptiveMetrics, setAdaptiveMetrics] = useState<MetricSnapshot>(engine.adaptiveMetrics);
  const [baselineMetrics, setBaselineMetrics] = useState<MetricSnapshot>(engine.baselineMetrics);
  const [adaptiveHistory, setAdaptiveHistory] = useState<MetricSnapshot[]>([...engine.adaptiveHistory]);
  const [baselineHistory, setBaselineHistory] = useState<MetricSnapshot[]>([...engine.baselineHistory]);
  const [heatmapHistory, setHeatmapHistory] = useState<HeatmapCell[][]>([...engine.heatmapHistory]);
  const [adaptiveConfusion, setAdaptiveConfusion] = useState<ConfusionMatrix>(engine.adaptiveConfusion);
  const [learningEvents, setLearningEvents] = useState<LearningEvent[]>([...engine.learningEvents]);
  const [weights, setWeights] = useState<RewardWeights>({ ...engine.weights });
  const [currentScenario, setCurrentScenario] = useState<ScenarioPreset>(engine.currentScenario);
  const [emitters, setEmitters] = useState<SyntheticEmitter[]>([...engine.emitters]);

  // Sync state from engine into React state
  const syncStateFromEngine = useCallback(() => {
    setTimeStep(engine.timeStep);
    setBands([...engine.bands]);
    setEmitters([...engine.emitters]);
    setAdaptiveReceiver({ ...engine.adaptiveReceiver });
    setBaselineReceiver({ ...engine.baselineReceiver });
    setAdaptiveMetrics({ ...engine.adaptiveMetrics });
    setBaselineMetrics({ ...engine.baselineMetrics });
    setAdaptiveHistory([...engine.adaptiveHistory]);
    setBaselineHistory([...engine.baselineHistory]);
    setHeatmapHistory([...engine.heatmapHistory]);
    setAdaptiveConfusion({ ...engine.adaptiveConfusion });
    setLearningEvents([...engine.learningEvents]);
    setWeights({ ...engine.weights });
    setCurrentScenario(engine.currentScenario);
  }, [engine]);

  // Step simulation once
  const handleStep = useCallback(() => {
    engine.step();
    syncStateFromEngine();

    if (soundEnabled) {
      const activeBand = engine.bands[engine.adaptiveReceiver.currentBandIndex];
      if (activeBand && activeBand.trueActivity) {
        soundEffects.playHitSound();
      } else {
        soundEffects.playSweepClick();
      }
    }
  }, [engine, syncStateFromEngine, soundEnabled]);

  // Toggle run / pause
  const handleTogglePlay = useCallback(() => {
    setIsRunning((prev) => {
      const next = !prev;
      if (next && soundEnabled) {
        soundEffects.playLearningPing();
      }
      return next;
    });
  }, [soundEnabled]);

  // Reset simulation
  const handleReset = useCallback(() => {
    engine.reset();
    setIsRunning(false);
    syncStateFromEngine();
    if (soundEnabled) {
      soundEffects.playHitSound();
    }
  }, [engine, syncStateFromEngine, soundEnabled]);

  // Run batch steps
  const handleRunBatchSteps = useCallback(
    (count: number) => {
      engine.runBatch(count);
      syncStateFromEngine();
      if (soundEnabled) {
        soundEffects.playHitSound();
      }
    },
    [engine, syncStateFromEngine, soundEnabled]
  );

  // Update weights
  const handleUpdateWeights = useCallback(
    (newWeights: Partial<RewardWeights>) => {
      engine.updateWeights(newWeights);
      syncStateFromEngine();
    },
    [engine, syncStateFromEngine]
  );

  // Select scenario
  const handleSelectScenario = useCallback(
    (scenarioId: string) => {
      engine.setScenario(scenarioId);
      syncStateFromEngine();
      if (soundEnabled) {
        soundEffects.playSweepClick();
      }
    },
    [engine, syncStateFromEngine, soundEnabled]
  );

  // Apply custom RF environment configuration
  const handleApplyCustomEnvironment = useCallback(
    (config: {
      bandCount: number;
      emitterCount: number;
      pattern: PatternType;
      randomness: number;
      density: number;
      noiseDbm: number;
      emitters?: SyntheticEmitter[];
    }) => {
      engine.setCustomEnvironment(config);
      syncStateFromEngine();
      if (soundEnabled) {
        soundEffects.playDeployClick();
      }
    },
    [engine, syncStateFromEngine, soundEnabled]
  );

  // Add individual custom emitter
  const handleAddEmitter = useCallback(
    (emitter: SyntheticEmitter) => {
      engine.addEmitter(emitter);
      syncStateFromEngine();
      if (soundEnabled) {
        soundEffects.playDeployClick();
      }
    },
    [engine, syncStateFromEngine, soundEnabled]
  );

  // Delete emitter
  const handleDeleteEmitter = useCallback(
    (emitterId: string) => {
      engine.removeEmitter(emitterId);
      syncStateFromEngine();
    },
    [engine, syncStateFromEngine]
  );

  // Update emitter
  const handleUpdateEmitter = useCallback(
    (emitterId: string, updates: Partial<SyntheticEmitter>) => {
      engine.updateEmitter(emitterId, updates);
      syncStateFromEngine();
    },
    [engine, syncStateFromEngine]
  );

  // Inject Electronic Attack Jammer
  const handleInjectJamming = useCallback(
    (bandIndex: number, powerDbm: number, durationSteps: number) => {
      engine.injectJamming(bandIndex, powerDbm, durationSteps);
      syncStateFromEngine();
      if (soundEnabled) {
        soundEffects.playAlertWarning();
      }
    },
    [engine, syncStateFromEngine, soundEnabled]
  );

  // Clear Jamming
  const handleClearJamming = useCallback(() => {
    engine.clearJamming();
    syncStateFromEngine();
  }, [engine, syncStateFromEngine]);

  // Shared state modifiers between portals
  const handleAddResearchQuestion = useCallback((rq: ResearchQuestion) => {
    setResearchQuestions((prev) => [rq, ...prev]);
  }, []);

  const handleSubmitEvaluationRequest = useCallback((req: EvaluationRequest) => {
    setEvaluationRequests((prev) => [req, ...prev]);
  }, []);

  const handleCertifyEvaluationRequest = useCallback((reqId: string, certHash: string, notes: string) => {
    setEvaluationRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? { ...r, status: 'Certified', certificationHash: certHash, evaluatorNotes: notes }
          : r
      )
    );
  }, []);

  const handleAddAlgorithm = useCallback((algo: AlgorithmDefinition) => {
    setAlgorithms((prev) => [...prev, algo]);
  }, []);

  const handleAddExperimentDesign = useCallback((exp: ExperimentDesign) => {
    setExperimentDesigns((prev) => [exp, ...prev]);
  }, []);

  // Portal change toast notice
  const [portalNotice, setPortalNotice] = useState<string | null>(null);

  // Central, seamless portal switcher handler
  const handleSwitchPortalRole = useCallback((role: PortalRole, targetTab?: string) => {
    setPortalRole(role);
    if (role === 'lead_researcher') {
      setUserRole('Lead Researcher');
      setUserEmail((prev) => (prev?.includes('evaluator') ? 'lead.researcher@vayu-netra.gov.in' : prev || 'lead.researcher@vayu-netra.gov.in'));
      setCurrentResearcherTab((targetTab as LeadResearcherTab) || 'command_center');
      setPortalNotice('Switched to LEAD RESEARCHER PORTAL — Research Command Center');
    } else {
      setUserRole('Algorithm Evaluator');
      setUserEmail((prev) => (prev?.includes('researcher') ? 'evaluator@vayu-netra.gov.in' : prev || 'evaluator@vayu-netra.gov.in'));
      setCurrentEvaluatorTab((targetTab as AlgorithmEvaluatorTab) || 'eval_dashboard');
      setPortalNotice('Switched to ALGORITHM EVALUATOR PORTAL — Benchmark & Validation Suite');
    }
    setIsRoleSelectionOpen(false);
    setIsMobileMenuOpen(false);
    soundEffects.playLearningPing();

    setTimeout(() => {
      setPortalNotice(null);
    }, 3200);
  }, []);

  // Clock loop
  useEffect(() => {
    let intervalId: any = null;
    if (isRunning) {
      const speedDelayMap = {
        slow: 380,
        normal: 160,
        fast: 50,
      };
      const intervalMs = speedDelayMap[simulationSpeed] || 160;

      intervalId = setInterval(() => {
        handleStep();
      }, intervalMs);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, simulationSpeed, handleStep]);

  // Initial sync on mount
  useEffect(() => {
    syncStateFromEngine();
  }, [syncStateFromEngine]);

  // ========== KEYBOARD SHORTCUTS ==========
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      switch (e.key) {
        case ' ': // Space = play/pause
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'ArrowRight': // → = step
          if (!isRunning) {
            e.preventDefault();
            handleStep();
          }
          break;
        case 'r': // R = reset
        case 'R':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleReset();
          }
          break;
        case 'f': // F = cycle speed (slow → normal → fast)
        case 'F':
          e.preventDefault();
          setSimulationSpeed((prev) => {
            const next = prev === 'slow' ? 'normal' : prev === 'normal' ? 'fast' : 'slow';
            saveSimulationSpeed(next);
            return next;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleStep, handleReset, isRunning]);

  // ========== PERSISTENCE AUTO-SAVE ==========
  useEffect(() => { saveResearchQuestions(researchQuestions); }, [researchQuestions]);
  useEffect(() => { saveEvaluationRequests(evaluationRequests); }, [evaluationRequests]);
  useEffect(() => { saveAlgorithms(algorithms); }, [algorithms]);
  useEffect(() => { saveExperimentDesigns(experimentDesigns); }, [experimentDesigns]);
  useEffect(() => { saveWeights(weights); }, [weights]);
  useEffect(() => { savePortalRole(portalRole); }, [portalRole]);
  useEffect(() => { saveResearcherTab(currentResearcherTab); }, [currentResearcherTab]);
  useEffect(() => { saveEvaluatorTab(currentEvaluatorTab); }, [currentEvaluatorTab]);
  useEffect(() => { saveSoundEnabled(soundEnabled); }, [soundEnabled]);
  useEffect(() => { saveSimulationSpeed(simulationSpeed); }, [simulationSpeed]);

  const activeSignalsCount = bands.filter((b) => b.trueActivity).length;

  // Dedicated Full-Screen Login Page View when logged out
  if (!userEmail) {
    return (
      <LoginPage
        onLoginSuccess={(email, roleName, selectedPortal) => {
          setUserEmail(email);
          setUserRole(roleName);
          setPortalRole(selectedPortal);
          if (selectedPortal === 'lead_researcher') {
            setCurrentResearcherTab('command_center');
          } else {
            setCurrentEvaluatorTab('eval_dashboard');
          }
          setIsRoleSelectionOpen(false);
        }}
        onContinueAsGuest={(selectedPortal) => {
          setUserEmail(
            selectedPortal === 'lead_researcher'
              ? 'lead.researcher@vayu-netra.gov.in'
              : 'evaluator@vayu-netra.gov.in'
          );
          setUserRole(selectedPortal === 'lead_researcher' ? 'Lead Researcher' : 'Algorithm Evaluator');
          setPortalRole(selectedPortal);
          if (selectedPortal === 'lead_researcher') {
            setCurrentResearcherTab('command_center');
          } else {
            setCurrentEvaluatorTab('eval_dashboard');
          }
          setIsRoleSelectionOpen(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col antialiased relative">
      {/* Real-time Workspace Switch Confirmation Toast */}
      {portalNotice && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.35)] text-xs font-mono text-slate-100 backdrop-blur-md transition-all animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold">{portalNotice}</span>
        </div>
      )}

      {/* Top Navbar with Real-Time Status & Role Branding */}
      <Navbar
        portalRole={portalRole}
        timeStep={timeStep}
        isRunning={isRunning}
        bandCount={bands.length}
        activeSignalsCount={activeSignalsCount}
        soundEnabled={soundEnabled}
        userEmail={userEmail}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenRoleSelection={() => setIsRoleSelectionOpen(true)}
        onSwitchPortalRole={handleSwitchPortalRole}
        onOpenLoginPage={() => setUserEmail(null)}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        onOpenResponsibleModal={() => setIsResponsibleModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Workspace: Sidebar + Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dynamic Role-Based Sidebar */}
        <Sidebar
          portalRole={portalRole}
          currentResearcherTab={currentResearcherTab}
          currentEvaluatorTab={currentEvaluatorTab}
          onSelectResearcherTab={setCurrentResearcherTab}
          onSelectEvaluatorTab={setCurrentEvaluatorTab}
          onSwitchPortalRole={handleSwitchPortalRole}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenRoleSelection={() => setIsRoleSelectionOpen(true)}
          userEmail={userEmail}
          onLogout={() => setUserEmail(null)}
        />

        {/* Primary Viewport Area: Two Truly Different Portals */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {portalRole === 'lead_researcher' ? (
            <LeadResearcherPortal
              currentTab={currentResearcherTab}
              onNavigateTab={setCurrentResearcherTab}
              timeStep={timeStep}
              isRunning={isRunning}
              onTogglePlay={handleTogglePlay}
              onStep={handleStep}
              onReset={handleReset}
              bands={bands}
              receiver={adaptiveReceiver}
              baselineReceiver={baselineReceiver}
              adaptiveMetrics={adaptiveMetrics}
              baselineMetrics={baselineMetrics}
              heatmapHistory={heatmapHistory}
              simulationSpeed={simulationSpeed}
              onChangeSpeed={setSimulationSpeed}
              onRunBatchSteps={handleRunBatchSteps}
              adaptiveConfusion={adaptiveConfusion}
              currentScenario={currentScenario}
              weights={weights}
              onUpdateWeights={handleUpdateWeights}
              onSelectScenario={handleSelectScenario}
              onSwitchToEvaluator={() => handleSwitchPortalRole('evaluator')}
              researchQuestions={researchQuestions}
              onAddResearchQuestion={handleAddResearchQuestion}
              evaluationRequests={evaluationRequests}
              onSubmitEvaluationRequest={handleSubmitEvaluationRequest}
              algorithms={algorithms}
              onAddAlgorithm={handleAddAlgorithm}
              experimentDesigns={experimentDesigns}
              onAddExperimentDesign={handleAddExperimentDesign}
              emitters={emitters}
              onApplyCustomEnvironment={handleApplyCustomEnvironment}
              onAddEmitter={handleAddEmitter}
              onDeleteEmitter={handleDeleteEmitter}
              onUpdateEmitter={handleUpdateEmitter}
              onInjectJamming={handleInjectJamming}
              onClearJamming={handleClearJamming}
              adaptiveHistory={adaptiveHistory}
              baselineHistory={baselineHistory}
              learningEvents={learningEvents}
            />
          ) : (
            <AlgorithmEvaluatorPortal
              currentTab={currentEvaluatorTab}
              onNavigateTab={setCurrentEvaluatorTab}
              timeStep={timeStep}
              isRunning={isRunning}
              onTogglePlay={handleTogglePlay}
              onStep={handleStep}
              onReset={handleReset}
              onRunBatchSteps={handleRunBatchSteps}
              bands={bands}
              adaptiveReceiver={adaptiveReceiver}
              baselineReceiver={baselineReceiver}
              adaptiveMetrics={adaptiveMetrics}
              baselineMetrics={baselineMetrics}
              adaptiveHistory={adaptiveHistory}
              baselineHistory={baselineHistory}
              heatmapHistory={heatmapHistory}
              adaptiveConfusion={adaptiveConfusion}
              currentScenario={currentScenario}
              onSelectScenario={handleSelectScenario}
              simulationSpeed={simulationSpeed}
              onChangeSpeed={setSimulationSpeed}
              onSwitchToResearcher={() => handleSwitchPortalRole('lead_researcher')}
              evaluationRequests={evaluationRequests}
              onCertifyEvaluationRequest={handleCertifyEvaluationRequest}
              algorithms={algorithms}
              emitters={emitters}
              onApplyCustomEnvironment={handleApplyCustomEnvironment}
              onAddEmitter={handleAddEmitter}
              onDeleteEmitter={handleDeleteEmitter}
              onUpdateEmitter={handleUpdateEmitter}
              onInjectJamming={handleInjectJamming}
              onClearJamming={handleClearJamming}
            />
          )}
        </main>
      </div>

      {/* Role Selection Workspace Modal */}
      {isRoleSelectionOpen && (
        <RoleSelectionModal
          isModal={true}
          currentRole={portalRole}
          onSelectRole={(role) => handleSwitchPortalRole(role)}
          onClose={() => setIsRoleSelectionOpen(false)}
        />
      )}

      {/* Guided Demo Tour Modal */}
      {isDemoTourOpen && (
        <DemoTourModal
          onClose={() => setIsDemoTourOpen(false)}
          onNavigateToTab={() => {}}
          onRunBatchSteps={handleRunBatchSteps}
          onResetSimulation={handleReset}
          timeStep={timeStep}
        />
      )}

      {/* Responsible Research Notice Modal */}
      {isResponsibleModalOpen && (
        <ResponsibleNotice
          onClose={() => setIsResponsibleModalOpen(false)}
          isModal={true}
        />
      )}
    </div>
  );
}
