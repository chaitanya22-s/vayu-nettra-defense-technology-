/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EmitterType = 
  | 'radar_pulsed' 
  | 'freq_hopping' 
  | 'continuous_chirp' 
  | 'burst_comm' 
  | 'intermittent_scan'
  | 'jammer_noise';

export type PropagationMedium = 'standard_troposphere' | 'sea_surface_multipath' | 'rain_attenuation' | 'urban_diffraction';

export interface RfPropagationConfig {
  distanceKm: number;
  platformVelocityKmH: number;
  receiverNoiseFigureDb: number;
  receiverAntennaGainDbi: number;
  pfaTarget: number;
  loAgilityUsPerMhz: number;
  propagationMedium: PropagationMedium;
}

export type PatternType = 'random' | 'periodic' | 'bursty' | 'drifting' | 'mixed';

export interface SyntheticEmitter {
  id: string;
  name: string;
  bandIndex: number;
  type: EmitterType;
  pattern: PatternType;
  period: number; // in time steps
  dutyCycle: number; // 0 to 1
  burstLength: number; // steps
  burstInterval: number; // steps
  powerDbm: number; // -80 to -20 dBm
  active: boolean;
  frequencyMHz: number;
  bandwidthMHz: number;
  label: string;
  // Enhanced RF Environment Simulation Parameters
  modulationType?: 'LFM_Chirp' | 'Barker_13' | 'QPSK' | 'FHSS' | 'CW_Unmodulated' | 'Gaussian_Noise';
  priMicrosec?: number; // Pulse Repetition Interval (microseconds)
  pulseWidthMicrosec?: number; // Pulse width (microseconds)
  snrDb?: number; // SNR in dB
  distanceKm?: number; // Distance from ES receiver
  fadingModel?: 'Rayleigh' | 'Rician' | 'LogNormal' | 'FreeSpace';
  velocityMps?: number; // Target velocity for Doppler
  isJammer?: boolean;
  isMuted?: boolean;
  tacticalRole?: string;
  scanType?: string;
  scanSpeedRpm?: number;
  antennaAzimuthDeg?: number;
  modulation?: 'LFM_Chirp' | 'Barker_13' | 'QPSK' | 'FHSS' | 'CW_Unmodulated' | 'Gaussian_Noise';
  priUs?: number;
  pulseWidthUs?: number;
}

export interface FrequencyBand {
  id: string;
  bandNumber: number; // 1 to N
  name: string; // e.g., "B01"
  startFreqMHz: number;
  endFreqMHz: number;
  centerFreqMHz: number;
  bandwidthMHz: number;
  
  // Real synthetic ground truth for this time step
  trueActivity: boolean;
  signalEnergyDbm: number; // background noise + emitter power
  
  // ML Scheduler Model States
  predictedProbability: number; // 0.0 to 1.0
  priorityScore: number; // 0.0 to 1.0
  lastObservedTimeStep: number;
  observationCount: number;
  hitCount: number;
  missCount: number;
  recencyWeight: number;
  estimatedPersistence: number;
  historicalDetectionRate: number;
  
  // Status in current step
  isCurrentlyScanned: boolean;
  wasLastScanned: boolean;
  status: 'Selected' | 'Candidate' | 'Low Priority' | 'Idle';
  
  // RF specific values
  snrDb?: number;
  noiseFloorDbm?: number;
  activeModulation?: string;
  loSettlingDelayUs?: number;
}

export type SchedulerType = 'fixed_sweep' | 'random' | 'recency' | 'adaptive_ml';

export interface ReceiverState {
  currentBandIndex: number;
  previousBandIndex: number;
  nextScheduledBandIndex: number;
  dwellTimeMs: number;
  totalScans: number;
  schedulerType: SchedulerType;
}

export interface MetricSnapshot {
  timeStep: number;
  probabilityOfDetection: number; // 0 to 100%
  falseAlarmRate: number; // 0 to 100%
  averageDetectionDelay: number; // in time steps
  averageInterceptTime: number; // in time steps
  detectionRatio: number; // hits / total active opportunities
  predictionAccuracy: number; // 0 to 100%
  averageReward: number;
  cumulativeReward: number;
  hits: number;
  misses: number;
  falseAlarms: number;
  trueNegatives: number;
  totalOpportunities: number;
  scanEfficiency: number; // hits / scans
}

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
}

export interface RewardWeights {
  detectionBenefit: number; // Default 1.0
  scanCost: number; // Default 0.2
  delayCost: number; // Default 0.5
  falseAlarmPenalty: number; // Default 0.4
}

export interface HeatmapCell {
  timeStep: number;
  bandIndex: number;
  hasSignal: boolean;
  wasScanned: boolean;
  wasHit: boolean;
  wasPredicted: boolean;
  energyDbm: number;
}

export interface LearningEvent {
  id: string;
  timeStep: number;
  bandName: string;
  type: 'HIT' | 'MISS' | 'FALSE_ALARM' | 'CORRECT_REJECTION';
  predictedProb: number;
  actualState: boolean;
  rewardEarned: number;
  modelDelta: string;
  timestamp: string;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  pattern: PatternType;
  description: string;
  bandCount: number;
  emitterCount: number;
  activityDensity: number; // 0.1 to 0.8
  randomness: number; // 0 to 1
  periodicity: number; // 0 to 1
  noiseDbm: number; // -100 to -85 dBm
}

export interface ExperimentRun {
  id: string;
  timestamp: string;
  scenarioName: string;
  bandCount: number;
  durationSteps: number;
  schedulerType: SchedulerType;
  weights: RewardWeights;
  metrics: MetricSnapshot;
  baselineMetrics?: MetricSnapshot;
  improvementPercentage: number;
}

export type PortalRole = 'lead_researcher' | 'evaluator';

export interface ResearchQuestion {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Validated' | 'Under Evaluation' | 'Draft';
  hypothesis: string;
  primaryMetric: string;
  targetValue: string;
  currentValue: string;
  validationConfidence: number;
  category: 'Latency Reduction' | 'Activity Density' | 'Feedback Learning' | 'Noise Robustness' | 'Scheduler Parameters';
  createdAt: string;
  assignedEvaluator?: string;
  acceptanceCriteria?: string;
}

export interface EvaluationRequest {
  id: string;
  rqId: string;
  title: string;
  algorithmName: string;
  algorithmId?: string;
  requestedBy: string;
  requestedAt: string;
  status: 'Pending' | 'In Progress' | 'Certified' | 'Rejected';
  testDuration: number;
  scenarioId: string;
  benchmarkTarget: string;
  evaluatorNotes?: string;
  certificationHash?: string;
  priority?: 'High' | 'Normal' | 'Urgent';
}

export interface AlgorithmDefinition {
  id: string;
  name: string;
  version: string;
  type: 'reinforcement_learning' | 'heuristic' | 'probabilistic' | 'baseline';
  description: string;
  formula: string;
  author: string;
  status: 'Champion' | 'Candidate' | 'Baseline' | 'Draft';
  parameters: { [key: string]: number | string };
  lastUpdated: string;
}

export interface ExperimentDesign {
  id: string;
  name: string;
  rqId: string;
  algorithmId: string;
  scenarioId: string;
  durationSteps: number;
  monteCarloSeeds: number[];
  noiseFloorDbm: number;
  notes: string;
  status: 'Draft' | 'Configured' | 'Dispatched' | 'Completed';
  createdAt: string;
}

export interface AblationItem {
  id: string;
  componentName: string;
  description: string;
  fullPd: number;
  ablatedPd: number;
  deltaPd: number;
  fullDelay: number;
  ablatedDelay: number;
  deltaDelay: number;
  criticality: 'Essential' | 'High' | 'Moderate' | 'Marginal';
}

export interface ErrorEvent {
  id: string;
  timeStep: number;
  type: 'MISSED_BURST' | 'FALSE_ALARM' | 'BAND_STARVATION' | 'LO_SWITCH_DELAY' | 'UNCERTAINTY_SPIKE';
  bandName: string;
  severity: 'Critical' | 'Warning' | 'Info';
  details: string;
  impactMetric: string;
}

export type LeadResearcherTab =
  | 'command_center'
  | 'live_simulation'
  | 'research_questions'
  | 'system_model'
  | 'synthetic_rf_environment'
  | 'algorithm_library'
  | 'experiment_designer'
  | 'scheduler_configuration'
  | 'ml_model'
  | 'evaluation_requests'
  | 'research_results'
  | 'research_reports'
  | 'experiment_history'
  | 'research_team'
  | 'threat_classification'
  | 'data_export'
  | 'settings';

export type AlgorithmEvaluatorTab =
  | 'eval_dashboard'
  | 'live_simulation'
  | 'synthetic_rf_environment'
  | 'evaluation_queue'
  | 'algorithm_benchmark'
  | 'baseline_comparison'
  | 'performance_metrics'
  | 'parameter_testing'
  | 'ablation_study'
  | 'error_analysis'
  | 'statistical_validation'
  | 'evaluation_signoff';


