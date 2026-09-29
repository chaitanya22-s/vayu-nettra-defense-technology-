/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PatternType,
  ScenarioPreset,
  SyntheticEmitter,
  RfPropagationConfig,
  FrequencyBand,
} from '../../types/simulation';
import { SCENARIO_PRESETS } from '../../services/simulationEngine';
import { Flame, RefreshCw, Radio, Sparkles, Check, Play, Activity, Sliders } from 'lucide-react';
import { RfPhysicsConsole } from '../spectrum/RfPhysicsConsole';

interface EnvironmentGeneratorProps {
  currentScenario: ScenarioPreset;
  emitters: SyntheticEmitter[];
  onSelectPreset: (preset: ScenarioPreset) => void;
  onApplyCustomConfig: (config: {
    bandCount: number;
    emitterCount: number;
    pattern: PatternType;
    randomness: number;
    density: number;
    noiseDbm: number;
  }) => void;
  rfConfig?: RfPropagationConfig;
  onUpdateRfConfig?: (config: Partial<RfPropagationConfig>) => void;
  bands?: FrequencyBand[];
  timeStep?: number;
}

export const EnvironmentGenerator: React.FC<EnvironmentGeneratorProps> = ({
  currentScenario,
  emitters,
  onSelectPreset,
  onApplyCustomConfig,
  rfConfig,
  onUpdateRfConfig,
  bands = [],
  timeStep = 0,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'scenarios' | 'rf_physics'>('scenarios');
  const [bandCount, setBandCount] = useState<number>(currentScenario.bandCount);
  const [emitterCount, setEmitterCount] = useState<number>(currentScenario.emitterCount);
  const [pattern, setPattern] = useState<PatternType>(currentScenario.pattern);
  const [randomness, setRandomness] = useState<number>(currentScenario.randomness);
  const [density, setDensity] = useState<number>(currentScenario.activityDensity);
  const [noiseDbm, setNoiseDbm] = useState<number>(currentScenario.noiseDbm);

  const handleGenerate = () => {
    onApplyCustomConfig({
      bandCount,
      emitterCount,
      pattern,
      randomness,
      density,
      noiseDbm,
    });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#070b16] p-4 flex flex-col space-y-5 shadow-lg">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wider">
                Synthetic RF Environment Generator
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-300">
                Safe Synthetic Presets
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Configure artificial spectrum test conditions, signal agility, and temporal emitter dynamics
            </p>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tab Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('scenarios')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'scenarios'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Benchmark Scenarios & Architecture</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rf_physics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'rf_physics'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>High-Fidelity RF Physics & Link Budget</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              Realistic
            </span>
          </button>
        </div>

        {activeSubTab === 'scenarios' && (
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-mono text-xs font-bold transition-all shadow-md glow-cyan"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Environment</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 2: HIGH-FIDELITY RF PROPAGATION PHYSICS */}
      {activeSubTab === 'rf_physics' && rfConfig && onUpdateRfConfig && (
        <RfPhysicsConsole
          rfConfig={rfConfig}
          onUpdateRfConfig={onUpdateRfConfig}
          bands={bands}
          emitters={emitters}
          timeStep={timeStep}
        />
      )}

      {/* SUB-VIEW 1: SCENARIOS & EMITTER ARCHITECTURE */}
      {activeSubTab === 'scenarios' && (
        <>
          {/* Preset Scenario Cards (Pattern A to E) */}
      <div className="space-y-2">
        <div className="text-xs font-tech font-bold uppercase tracking-wider text-slate-300">
          Standard Benchmark Scenarios
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCENARIO_PRESETS.map((preset) => {
            const isSelected = preset.id === currentScenario.id;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  setBandCount(preset.bandCount);
                  setEmitterCount(preset.emitterCount);
                  setPattern(preset.pattern);
                  setRandomness(preset.randomness);
                  setDensity(preset.activityDensity);
                  setNoiseDbm(preset.noiseDbm);
                }}
                className={`p-3.5 rounded-xl cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-500/60 glow-cyan'
                    : 'bg-[#040813] border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-mono text-slate-100 flex items-center gap-1.5">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="p-0.5 rounded-full bg-cyan-500 text-slate-950">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{preset.emitterCount} Emitters</span>
                  <span>Density: {(preset.activityDensity * 100).toFixed(0)}%</span>
                  <span className="text-cyan-400 capitalize">{preset.pattern}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Parameter Generator Controls */}
      <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-tech font-bold uppercase tracking-wider text-slate-200">
          <span>Fine-Grained Parameter Tuning</span>
          <span className="text-[10px] font-mono text-cyan-400">Custom Mode</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
          {/* Band Count */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/70">
            <div className="flex justify-between text-slate-300">
              <span>Channel Bands:</span>
              <span className="text-cyan-400 font-bold">{bandCount} Bands</span>
            </div>
            <input
              type="range"
              min="16"
              max="48"
              step="4"
              value={bandCount}
              onChange={(e) => setBandCount(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-600">
              <span>16 (Coarse)</span>
              <span>24 (Standard)</span>
              <span>48 (Dense)</span>
            </div>
          </div>

          {/* Emitter Count */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/70">
            <div className="flex justify-between text-slate-300">
              <span>Simulated Emitters:</span>
              <span className="text-emerald-400 font-bold">{emitterCount} Emitters</span>
            </div>
            <input
              type="range"
              min="2"
              max="14"
              step="1"
              value={emitterCount}
              onChange={(e) => setEmitterCount(parseInt(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-600">
              <span>2 (Sparse)</span>
              <span>7 (Balanced)</span>
              <span>14 (Congested)</span>
            </div>
          </div>

          {/* Activity Density */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/70">
            <div className="flex justify-between text-slate-300">
              <span>Activity Density:</span>
              <span className="text-amber-400 font-bold">{(density * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={density}
              onChange={(e) => setDensity(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-600">
              <span>10% (Quiet)</span>
              <span>35% (Active)</span>
              <span>80% (Extreme)</span>
            </div>
          </div>

          {/* Stochastic Randomness */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/70">
            <div className="flex justify-between text-slate-300">
              <span>Stochastic Entropy:</span>
              <span className="text-purple-400 font-bold">{(randomness * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={randomness}
              onChange={(e) => setRandomness(parseFloat(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-600">
              <span>0% (Deterministic)</span>
              <span>50%</span>
              <span>100% (Pure Noise)</span>
            </div>
          </div>

          {/* Receiver Noise Floor */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/70">
            <div className="flex justify-between text-slate-300">
              <span>Noise Floor:</span>
              <span className="text-slate-300 font-bold">{noiseDbm} dBm</span>
            </div>
            <input
              type="range"
              min="-105"
              max="-80"
              step="1"
              value={noiseDbm}
              onChange={(e) => setNoiseDbm(parseInt(e.target.value))}
              className="w-full accent-slate-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-600">
              <span>-105 dBm (Clean)</span>
              <span>-92 dBm (Typical)</span>
              <span>-80 dBm (Noisy)</span>
            </div>
          </div>

          {/* Agility Pattern Selector */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/70">
            <div className="flex justify-between text-slate-300">
              <span>Emitter Agility:</span>
              <span className="text-cyan-300 font-bold uppercase">{pattern}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {(['periodic', 'bursty', 'drifting'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPattern(p)}
                  className={`py-1 text-[10px] rounded transition-colors uppercase ${
                    pattern === p
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Emitters Breakdown Table */}
      <div className="space-y-2">
        <div className="text-xs font-tech font-bold uppercase tracking-wider text-slate-300">
          Simulated Emitter Catalog in Active Scenario
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-800/80 bg-[#040711]">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/60 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-2 px-3">Emitter Designation</th>
                <th className="py-2 px-3">Tactical Role & Modulation</th>
                <th className="py-2 px-3">RF Band</th>
                <th className="py-2 px-3">Carrier Freq</th>
                <th className="py-2 px-3">PRI / PW</th>
                <th className="py-2 px-3">Antenna Scan</th>
                <th className="py-2 px-3">EIRP / SNR</th>
                <th className="py-2 px-3 text-right">Instantaneous State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {emitters.map((em) => (
                <tr key={em.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2 px-3 font-semibold text-slate-200">
                    <div>{em.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono">{em.id}</div>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-cyan-300 font-medium">{em.modulationType || 'Linear FM Chirp'}</span>
                    <div className="text-[9px] text-slate-400">{em.tacticalRole || em.label}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-300">Band #{em.bandIndex + 1}</td>
                  <td className="py-2 px-3 text-slate-300">{em.frequencyMHz} MHz</td>
                  <td className="py-2 px-3 text-slate-400">
                    {em.priMicrosec ? `${em.priMicrosec}µs / ${em.pulseWidthMicrosec}µs` : '1250µs / 15µs'}
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    <span className="capitalize">{em.scanType?.replace('_', ' ') || 'Circular'}</span>
                    {em.scanSpeedRpm ? <span className="text-[10px] text-slate-500"> ({em.scanSpeedRpm} RPM)</span> : null}
                  </td>
                  <td className="py-2 px-3 text-slate-300">
                    <span>{em.powerDbm} dBm</span>
                    {em.active && em.snrDb ? (
                      <span className="text-emerald-400 font-bold ml-1.5">+{em.snrDb} dB</span>
                    ) : null}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                        em.active
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold animate-pulse'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {em.active ? '● TRANSMITTING' : '○ DORMANT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}
</div>
  );
};
