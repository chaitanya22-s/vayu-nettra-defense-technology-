/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Emitter Presets — Pre-configured radar emitter templates based on
 * real-world radar types for quick scenario setup.
 *
 * All data is synthetic and illustrative.
 */

import { SyntheticEmitter, EmitterType, PatternType } from '../types/simulation';

export interface EmitterPreset {
  id: string;
  name: string;
  category: 'Air Surveillance' | 'Fire Control' | 'Surface Search' | 'Communication' | 'Jammer' | 'Navigation';
  description: string;
  bandDesignation: string; // e.g., "S-Band", "X-Band"
  template: Partial<SyntheticEmitter>;
}

let presetCounter = 0;
function nextPresetId(): string {
  return `preset-emitter-${Date.now()}-${presetCounter++}`;
}

export const EMITTER_PRESETS: EmitterPreset[] = [
  // ——— Air Surveillance Radars ———
  {
    id: 'preset-s-band-asr',
    name: 'S-Band Air Surveillance Radar',
    category: 'Air Surveillance',
    description: 'Long-range 2D air surveillance radar operating in S-Band. Rotating antenna with 6-12 RPM scan rate. Used for area air defense early warning.',
    bandDesignation: 'S-Band (2–4 GHz)',
    template: {
      type: 'radar_pulsed' as EmitterType,
      pattern: 'periodic' as PatternType,
      frequencyMHz: 2850,
      bandwidthMHz: 25,
      powerDbm: -32,
      period: 12,
      dutyCycle: 0.35,
      burstLength: 4,
      burstInterval: 12,
      modulationType: 'LFM_Chirp',
      priMicrosec: 1200,
      pulseWidthMicrosec: 20,
      snrDb: 18,
      tacticalRole: 'Long Range Air Surveillance',
      scanType: 'rotating',
      scanSpeedRpm: 8,
    },
  },
  {
    id: 'preset-l-band-ewr',
    name: 'L-Band Early Warning Radar',
    category: 'Air Surveillance',
    description: 'VHF/L-Band early warning radar for ballistic missile and stealth aircraft detection. Long pulse, high peak power.',
    bandDesignation: 'L-Band (1–2 GHz)',
    template: {
      type: 'radar_pulsed' as EmitterType,
      pattern: 'periodic' as PatternType,
      frequencyMHz: 1215,
      bandwidthMHz: 40,
      powerDbm: -28,
      period: 18,
      dutyCycle: 0.25,
      burstLength: 6,
      burstInterval: 18,
      modulationType: 'Barker_13',
      priMicrosec: 2500,
      pulseWidthMicrosec: 50,
      snrDb: 22,
      tacticalRole: 'Early Warning / BMD',
      scanType: 'rotating',
      scanSpeedRpm: 5,
    },
  },
  // ——— Fire Control Radars ———
  {
    id: 'preset-x-band-fc',
    name: 'X-Band Fire Control Radar',
    category: 'Fire Control',
    description: 'High-PRF X-Band fire control / target illumination radar. Narrow beamwidth, track-while-scan capability. High threat.',
    bandDesignation: 'X-Band (8–12 GHz)',
    template: {
      type: 'radar_pulsed' as EmitterType,
      pattern: 'periodic' as PatternType,
      frequencyMHz: 3250,
      bandwidthMHz: 15,
      powerDbm: -35,
      period: 4,
      dutyCycle: 0.65,
      burstLength: 3,
      burstInterval: 4,
      modulationType: 'LFM_Chirp',
      priMicrosec: 450,
      pulseWidthMicrosec: 5,
      snrDb: 24,
      tacticalRole: 'Fire Control / Illumination',
      scanType: 'conical',
      scanSpeedRpm: 30,
    },
  },
  {
    id: 'preset-ka-band-tracker',
    name: 'Ka-Band Tracking Radar',
    category: 'Fire Control',
    description: 'Millimeter-wave precision tracking radar used for terminal guidance and weapon system fire control.',
    bandDesignation: 'Ka-Band (high freq)',
    template: {
      type: 'continuous_chirp' as EmitterType,
      pattern: 'periodic' as PatternType,
      frequencyMHz: 3400,
      bandwidthMHz: 10,
      powerDbm: -38,
      period: 3,
      dutyCycle: 0.8,
      burstLength: 2,
      burstInterval: 3,
      modulationType: 'LFM_Chirp',
      priMicrosec: 200,
      pulseWidthMicrosec: 2,
      snrDb: 20,
      tacticalRole: 'Precision Tracking',
      scanType: 'monopulse',
      scanSpeedRpm: 0,
    },
  },
  // ——— Surface Search ———
  {
    id: 'preset-nav-radar',
    name: 'Maritime Navigation Radar',
    category: 'Navigation',
    description: 'X-Band maritime navigation / surface search radar. Moderate PRF, medium pulse width, rotating antenna.',
    bandDesignation: 'X-Band (9.4 GHz)',
    template: {
      type: 'intermittent_scan' as EmitterType,
      pattern: 'periodic' as PatternType,
      frequencyMHz: 1680,
      bandwidthMHz: 20,
      powerDbm: -40,
      period: 8,
      dutyCycle: 0.4,
      burstLength: 3,
      burstInterval: 8,
      modulationType: 'CW_Unmodulated',
      priMicrosec: 1800,
      pulseWidthMicrosec: 30,
      snrDb: 14,
      tacticalRole: 'Surface Navigation',
      scanType: 'rotating',
      scanSpeedRpm: 24,
    },
  },
  {
    id: 'preset-surface-search',
    name: 'Surface Search Radar (S-Band)',
    category: 'Surface Search',
    description: 'Medium-range surface search radar for detecting small surface targets and low-flying aircraft.',
    bandDesignation: 'S-Band (3 GHz)',
    template: {
      type: 'intermittent_scan' as EmitterType,
      pattern: 'periodic' as PatternType,
      frequencyMHz: 2200,
      bandwidthMHz: 30,
      powerDbm: -36,
      period: 10,
      dutyCycle: 0.35,
      burstLength: 4,
      burstInterval: 10,
      modulationType: 'LFM_Chirp',
      priMicrosec: 1500,
      pulseWidthMicrosec: 25,
      snrDb: 16,
      tacticalRole: 'Surface Search',
      scanType: 'rotating',
      scanSpeedRpm: 15,
    },
  },
  // ——— Communications ———
  {
    id: 'preset-fhss-tactical',
    name: 'FHSS Tactical Radio',
    category: 'Communication',
    description: 'Frequency-hopping spread spectrum tactical communication link. Rapid hop rate across UHF/L-Band.',
    bandDesignation: 'UHF / L-Band',
    template: {
      type: 'freq_hopping' as EmitterType,
      pattern: 'random' as PatternType,
      frequencyMHz: 900,
      bandwidthMHz: 5,
      powerDbm: -48,
      period: 2,
      dutyCycle: 0.6,
      burstLength: 1,
      burstInterval: 2,
      modulationType: 'FHSS',
      priMicrosec: 0,
      pulseWidthMicrosec: 0,
      snrDb: 10,
      tacticalRole: 'Tactical Data Link',
      scanType: 'omnidirectional',
      scanSpeedRpm: 0,
    },
  },
  {
    id: 'preset-burst-datalink',
    name: 'Burst Data Link (UHF)',
    category: 'Communication',
    description: 'High-speed burst data transmission for tactical network coordination. Short duration, high bandwidth.',
    bandDesignation: 'UHF (500–800 MHz)',
    template: {
      type: 'burst_comm' as EmitterType,
      pattern: 'bursty' as PatternType,
      frequencyMHz: 650,
      bandwidthMHz: 8,
      powerDbm: -50,
      period: 15,
      dutyCycle: 0.1,
      burstLength: 2,
      burstInterval: 15,
      modulationType: 'QPSK',
      priMicrosec: 0,
      pulseWidthMicrosec: 0,
      snrDb: 8,
      tacticalRole: 'Data Link / Telemetry',
      scanType: 'directional',
      scanSpeedRpm: 0,
    },
  },
  // ——— Jammers ———
  {
    id: 'preset-barrage-jammer',
    name: 'Barrage Noise Jammer',
    category: 'Jammer',
    description: 'Wideband barrage noise jammer covering large spectrum segments. Used for area denial / stand-off jamming.',
    bandDesignation: 'Broadband',
    template: {
      type: 'jammer_noise' as EmitterType,
      pattern: 'random' as PatternType,
      frequencyMHz: 1800,
      bandwidthMHz: 200,
      powerDbm: -25,
      period: 1,
      dutyCycle: 0.95,
      burstLength: 1,
      burstInterval: 1,
      modulationType: 'Gaussian_Noise',
      priMicrosec: 0,
      pulseWidthMicrosec: 0,
      snrDb: 0,
      isJammer: true,
      tacticalRole: 'Barrage Jammer (EA)',
      scanType: 'omnidirectional',
      scanSpeedRpm: 0,
    },
  },
  {
    id: 'preset-spot-jammer',
    name: 'Spot Noise Jammer',
    category: 'Jammer',
    description: 'Narrowband spot jammer targeting a specific frequency. Higher effective radiated power in a focused band.',
    bandDesignation: 'Targeted',
    template: {
      type: 'jammer_noise' as EmitterType,
      pattern: 'periodic' as PatternType,
      frequencyMHz: 2850,
      bandwidthMHz: 25,
      powerDbm: -22,
      period: 1,
      dutyCycle: 0.9,
      burstLength: 1,
      burstInterval: 1,
      modulationType: 'Gaussian_Noise',
      priMicrosec: 0,
      pulseWidthMicrosec: 0,
      snrDb: 0,
      isJammer: true,
      tacticalRole: 'Spot Jammer (EA)',
      scanType: 'directional',
      scanSpeedRpm: 0,
    },
  },
];

/**
 * Create a full SyntheticEmitter from a preset template, assigning it to a specific band
 */
export function createEmitterFromPreset(
  preset: EmitterPreset,
  bandIndex: number,
  bandCount: number = 24
): SyntheticEmitter {
  const startFreq = 500;
  const endFreq = 3500;
  const bandWidth = (endFreq - startFreq) / bandCount;
  const bandCenter = startFreq + bandIndex * bandWidth + bandWidth / 2;

  return {
    id: nextPresetId(),
    name: preset.name,
    bandIndex,
    type: preset.template.type || 'radar_pulsed',
    pattern: preset.template.pattern || 'periodic',
    period: preset.template.period || 10,
    dutyCycle: preset.template.dutyCycle || 0.3,
    burstLength: preset.template.burstLength || 3,
    burstInterval: preset.template.burstInterval || 10,
    powerDbm: preset.template.powerDbm || -35,
    active: true,
    frequencyMHz: preset.template.frequencyMHz || Math.round(bandCenter),
    bandwidthMHz: preset.template.bandwidthMHz || Math.round(bandWidth),
    label: preset.category,
    modulationType: preset.template.modulationType,
    priMicrosec: preset.template.priMicrosec,
    pulseWidthMicrosec: preset.template.pulseWidthMicrosec,
    snrDb: preset.template.snrDb,
    tacticalRole: preset.template.tacticalRole,
    scanType: preset.template.scanType,
    scanSpeedRpm: preset.template.scanSpeedRpm,
    isJammer: preset.template.isJammer,
  };
}
