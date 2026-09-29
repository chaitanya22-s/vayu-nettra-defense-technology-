/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ThreatClassifier — Classifies detected emitters into tactical threat categories
 * based on their RF parameters (PRI, pulse width, modulation, scan type, frequency, power).
 */

import { SyntheticEmitter } from '../types/simulation';

export type ThreatCategory =
  | 'Fire Control Radar'
  | 'Air Surveillance Radar'
  | 'Surface Search Radar'
  | 'Electronic Jammer'
  | 'Communication Link'
  | 'Navigation / ATC'
  | 'Tracking Radar'
  | 'Unknown Emitter';

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ThreatAssessment {
  emitterId: string;
  emitterName: string;
  category: ThreatCategory;
  threatLevel: ThreatLevel;
  confidence: number; // 0-100%
  reasoning: string;
  recommendedAction: string;
  frequencyMHz: number;
  powerDbm: number;
  isActive: boolean;
}

/**
 * Classify an emitter into a threat category based on its RF characteristics
 */
export function classifyEmitter(emitter: SyntheticEmitter): ThreatAssessment {
  const { type, frequencyMHz, powerDbm, active } = emitter;
  const modulation = emitter.modulationType || emitter.modulation;
  const pri = emitter.priMicrosec || emitter.priUs;
  const pw = emitter.pulseWidthMicrosec || emitter.pulseWidthUs;
  const scanType = emitter.scanType;

  let category: ThreatCategory = 'Unknown Emitter';
  let threatLevel: ThreatLevel = 'INFO';
  let confidence = 50;
  let reasoning = '';
  let recommendedAction = 'Monitor and catalog.';

  // Jammer detection — strongest signal, noise-type modulation
  if (emitter.isJammer || type === 'jammer_noise') {
    category = 'Electronic Jammer';
    threatLevel = 'CRITICAL';
    confidence = 95;
    reasoning = 'Noise-like wideband emission detected, consistent with barrage or spot jammer.';
    recommendedAction = 'Activate ECCM protocols. Initiate frequency agility or sidelobe blanking.';
  }
  // Fire control radar — high frequency (X-band+), narrow PRI, high power
  else if (
    type === 'radar_pulsed' &&
    frequencyMHz > 2500 &&
    pri !== undefined && pri < 800 &&
    pw !== undefined && pw < 10
  ) {
    category = 'Fire Control Radar';
    threatLevel = 'CRITICAL';
    confidence = 88;
    reasoning = `High-frequency pulsed emission (${frequencyMHz} MHz) with short PRI (${pri} µs) and narrow pulse width (${pw} µs) consistent with target illumination / fire control.`;
    recommendedAction = 'IMMEDIATE: Deploy countermeasures. Evasive maneuver. Chaff/flare dispensing.';
  }
  // Tracking radar — continuous chirp, X-band or higher
  else if (type === 'continuous_chirp' && frequencyMHz > 2000) {
    category = 'Tracking Radar';
    threatLevel = 'HIGH';
    confidence = 82;
    reasoning = `FMCW chirp emission at ${frequencyMHz} MHz indicates continuous tracking or velocity measurement.`;
    recommendedAction = 'Assess engagement geometry. Prepare ECCM. Consider breaking track.';
  }
  // Air surveillance — L/S-band, longer PRI, rotating antenna
  else if (
    type === 'radar_pulsed' &&
    frequencyMHz >= 1000 && frequencyMHz <= 2500 &&
    (pri === undefined || pri > 800)
  ) {
    category = 'Air Surveillance Radar';
    threatLevel = 'MEDIUM';
    confidence = 78;
    reasoning = `L/S-band pulsed radar (${frequencyMHz} MHz) with moderate PRI — consistent with long-range air surveillance / early warning.`;
    recommendedAction = 'Catalog and track. Maintain awareness of radar coverage envelope.';
  }
  // Surface search — lower frequency, intermittent scan
  else if (type === 'intermittent_scan' && frequencyMHz < 2000) {
    category = 'Surface Search Radar';
    threatLevel = 'MEDIUM';
    confidence = 72;
    reasoning = `Intermittent scanning pattern at ${frequencyMHz} MHz consistent with surface search / navigation radar.`;
    recommendedAction = 'Monitor scanning pattern and rotation rate for tactical assessment.';
  }
  // Navigation / ATC
  else if (type === 'intermittent_scan' && frequencyMHz >= 2000) {
    category = 'Navigation / ATC';
    threatLevel = 'LOW';
    confidence = 65;
    reasoning = `Higher-band rotating scan (${frequencyMHz} MHz) consistent with ATC / weather radar emission.`;
    recommendedAction = 'Low threat. Catalog for deconfliction.';
  }
  // Frequency hopping — tactical comms
  else if (type === 'freq_hopping') {
    category = 'Communication Link';
    threatLevel = 'MEDIUM';
    confidence = 75;
    reasoning = `Frequency-agile hopping emission detected across multiple channels — consistent with encrypted tactical communication link.`;
    recommendedAction = 'Monitor hop pattern. Estimate hop rate and dwell for intelligence.';
  }
  // Burst communication
  else if (type === 'burst_comm') {
    category = 'Communication Link';
    threatLevel = 'LOW';
    confidence = 70;
    reasoning = `Short burst transmission at ${frequencyMHz} MHz — likely tactical data link or telemetry uplink.`;
    recommendedAction = 'Log burst timing and duration. Assess network topology.';
  }
  // Generic pulsed radar fallback
  else if (type === 'radar_pulsed') {
    category = 'Air Surveillance Radar';
    threatLevel = 'MEDIUM';
    confidence = 60;
    reasoning = `Pulsed radar emission at ${frequencyMHz} MHz. Insufficient parameter data for precise classification.`;
    recommendedAction = 'Continue observation. Collect additional PRI/PW data for refined classification.';
  }
  // Continuous chirp fallback
  else if (type === 'continuous_chirp') {
    category = 'Tracking Radar';
    threatLevel = 'MEDIUM';
    confidence = 55;
    reasoning = `FMCW/chirp modulation detected at ${frequencyMHz} MHz. Possibly ground-based velocity sensor or tracking radar.`;
    recommendedAction = 'Monitor for track-while-scan behavior.';
  }
  // Unknown
  else {
    category = 'Unknown Emitter';
    threatLevel = 'INFO';
    confidence = 40;
    reasoning = `Unclassified emission at ${frequencyMHz} MHz with type "${type}". Requires additional signal parameters for classification.`;
    recommendedAction = 'Extend dwell time on this band to collect additional pulse descriptor words.';
  }

  // Adjust confidence if emitter is inactive
  if (!active) {
    confidence = Math.max(20, confidence - 20);
    reasoning += ' (Emitter currently inactive — classification based on stored parameters.)';
  }

  return {
    emitterId: emitter.id,
    emitterName: emitter.name,
    category,
    threatLevel,
    confidence,
    reasoning,
    recommendedAction,
    frequencyMHz,
    powerDbm,
    isActive: active,
  };
}

/**
 * Classify all emitters and sort by threat level
 */
export function classifyAllEmitters(emitters: SyntheticEmitter[]): ThreatAssessment[] {
  const threatOrder: Record<ThreatLevel, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    INFO: 4,
  };

  return emitters
    .map(classifyEmitter)
    .sort((a, b) => {
      // Active emitters first, then by threat level
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return threatOrder[a.threatLevel] - threatOrder[b.threatLevel];
    });
}

/**
 * Get aggregate threat summary
 */
export function getThreatSummary(assessments: ThreatAssessment[]) {
  const active = assessments.filter(a => a.isActive);
  return {
    totalEmitters: assessments.length,
    activeEmitters: active.length,
    criticalThreats: active.filter(a => a.threatLevel === 'CRITICAL').length,
    highThreats: active.filter(a => a.threatLevel === 'HIGH').length,
    mediumThreats: active.filter(a => a.threatLevel === 'MEDIUM').length,
    lowThreats: active.filter(a => a.threatLevel === 'LOW').length,
    averageConfidence: active.length > 0
      ? Math.round(active.reduce((sum, a) => sum + a.confidence, 0) / active.length)
      : 0,
    highestThreat: active.length > 0 ? active[0] : null,
  };
}
