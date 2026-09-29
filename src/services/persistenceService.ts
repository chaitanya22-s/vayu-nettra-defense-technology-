/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PersistenceService — Auto-save and restore simulation configuration and research state
 * using the browser's localStorage.
 */

import {
  RewardWeights,
  ResearchQuestion,
  EvaluationRequest,
  AlgorithmDefinition,
  ExperimentDesign,
  PortalRole,
  LeadResearcherTab,
  AlgorithmEvaluatorTab,
} from '../types/simulation';

const STORAGE_PREFIX = 'vayu_netra_';

// Keys used for persistence
const KEYS = {
  researchQuestions: `${STORAGE_PREFIX}research_questions`,
  evaluationRequests: `${STORAGE_PREFIX}evaluation_requests`,
  algorithms: `${STORAGE_PREFIX}algorithms`,
  experimentDesigns: `${STORAGE_PREFIX}experiment_designs`,
  weights: `${STORAGE_PREFIX}reward_weights`,
  portalRole: `${STORAGE_PREFIX}portal_role`,
  researcherTab: `${STORAGE_PREFIX}researcher_tab`,
  evaluatorTab: `${STORAGE_PREFIX}evaluator_tab`,
  soundEnabled: `${STORAGE_PREFIX}sound_enabled`,
  simulationSpeed: `${STORAGE_PREFIX}simulation_speed`,
  currentScenarioId: `${STORAGE_PREFIX}scenario_id`,
  lastSavedAt: `${STORAGE_PREFIX}last_saved_at`,
} as const;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked — silently fail
  }
}

export interface PersistedState {
  researchQuestions?: ResearchQuestion[];
  evaluationRequests?: EvaluationRequest[];
  algorithms?: AlgorithmDefinition[];
  experimentDesigns?: ExperimentDesign[];
  weights?: RewardWeights;
  portalRole?: PortalRole;
  researcherTab?: LeadResearcherTab;
  evaluatorTab?: AlgorithmEvaluatorTab;
  soundEnabled?: boolean;
  simulationSpeed?: 'slow' | 'normal' | 'fast';
  currentScenarioId?: string;
}

/**
 * Load all persisted state from localStorage
 */
export function loadPersistedState(): PersistedState {
  return {
    researchQuestions: safeGet<ResearchQuestion[] | undefined>(KEYS.researchQuestions, undefined),
    evaluationRequests: safeGet<EvaluationRequest[] | undefined>(KEYS.evaluationRequests, undefined),
    algorithms: safeGet<AlgorithmDefinition[] | undefined>(KEYS.algorithms, undefined),
    experimentDesigns: safeGet<ExperimentDesign[] | undefined>(KEYS.experimentDesigns, undefined),
    weights: safeGet<RewardWeights | undefined>(KEYS.weights, undefined),
    portalRole: safeGet<PortalRole | undefined>(KEYS.portalRole, undefined),
    researcherTab: safeGet<LeadResearcherTab | undefined>(KEYS.researcherTab, undefined),
    evaluatorTab: safeGet<AlgorithmEvaluatorTab | undefined>(KEYS.evaluatorTab, undefined),
    soundEnabled: safeGet<boolean | undefined>(KEYS.soundEnabled, undefined),
    simulationSpeed: safeGet<'slow' | 'normal' | 'fast' | undefined>(KEYS.simulationSpeed, undefined),
    currentScenarioId: safeGet<string | undefined>(KEYS.currentScenarioId, undefined),
  };
}

/**
 * Save individual state slices to localStorage
 */
export function saveResearchQuestions(rqs: ResearchQuestion[]) {
  safeSet(KEYS.researchQuestions, rqs);
  safeSet(KEYS.lastSavedAt, new Date().toISOString());
}

export function saveEvaluationRequests(reqs: EvaluationRequest[]) {
  safeSet(KEYS.evaluationRequests, reqs);
  safeSet(KEYS.lastSavedAt, new Date().toISOString());
}

export function saveAlgorithms(algos: AlgorithmDefinition[]) {
  safeSet(KEYS.algorithms, algos);
  safeSet(KEYS.lastSavedAt, new Date().toISOString());
}

export function saveExperimentDesigns(designs: ExperimentDesign[]) {
  safeSet(KEYS.experimentDesigns, designs);
  safeSet(KEYS.lastSavedAt, new Date().toISOString());
}

export function saveWeights(weights: RewardWeights) {
  safeSet(KEYS.weights, weights);
}

export function savePortalRole(role: PortalRole) {
  safeSet(KEYS.portalRole, role);
}

export function saveResearcherTab(tab: LeadResearcherTab) {
  safeSet(KEYS.researcherTab, tab);
}

export function saveEvaluatorTab(tab: AlgorithmEvaluatorTab) {
  safeSet(KEYS.evaluatorTab, tab);
}

export function saveSoundEnabled(enabled: boolean) {
  safeSet(KEYS.soundEnabled, enabled);
}

export function saveSimulationSpeed(speed: 'slow' | 'normal' | 'fast') {
  safeSet(KEYS.simulationSpeed, speed);
}

export function saveCurrentScenarioId(id: string) {
  safeSet(KEYS.currentScenarioId, id);
}

/**
 * Clear all persisted Vayu-Netra data
 */
export function clearAllPersistedState() {
  Object.values(KEYS).forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}

/**
 * Get the last save timestamp
 */
export function getLastSavedAt(): string | null {
  return safeGet<string | null>(KEYS.lastSavedAt, null);
}
