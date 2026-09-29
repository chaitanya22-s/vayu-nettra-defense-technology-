/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Radio,
  Plus,
  ChevronDown,
  Crosshair,
  Zap,
  Activity,
  Navigation,
  Search,
  Shield,
} from 'lucide-react';
import { SyntheticEmitter } from '../../types/simulation';
import { EMITTER_PRESETS, EmitterPreset, createEmitterFromPreset } from '../../services/emitterPresets';

interface EmitterPresetSelectorProps {
  bandCount: number;
  onAddEmitter: (emitter: SyntheticEmitter) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Air Surveillance': <Radio className="w-3.5 h-3.5 text-cyan-400" />,
  'Fire Control': <Crosshair className="w-3.5 h-3.5 text-red-400" />,
  'Surface Search': <Search className="w-3.5 h-3.5 text-emerald-400" />,
  'Communication': <Activity className="w-3.5 h-3.5 text-blue-400" />,
  'Jammer': <Zap className="w-3.5 h-3.5 text-red-400" />,
  'Navigation': <Navigation className="w-3.5 h-3.5 text-slate-400" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Air Surveillance': 'border-cyan-600/40 bg-cyan-950/20',
  'Fire Control': 'border-red-600/40 bg-red-950/20',
  'Surface Search': 'border-emerald-600/40 bg-emerald-950/20',
  'Communication': 'border-blue-600/40 bg-blue-950/20',
  'Jammer': 'border-red-600/40 bg-red-950/30',
  'Navigation': 'border-slate-600/40 bg-slate-900/30',
};

export const EmitterPresetSelector: React.FC<EmitterPresetSelectorProps> = ({
  bandCount,
  onAddEmitter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBandIndex, setSelectedBandIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
  const [deployedPreset, setDeployedPreset] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(EMITTER_PRESETS.map((p) => p.category)))];

  const filtered = selectedCategory === 'All'
    ? EMITTER_PRESETS
    : EMITTER_PRESETS.filter((p) => p.category === selectedCategory);

  const handleDeploy = (preset: EmitterPreset) => {
    const emitter = createEmitterFromPreset(preset, selectedBandIndex, bandCount);
    onAddEmitter(emitter);
    setDeployedPreset(preset.id);
    setTimeout(() => setDeployedPreset(null), 1500);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070b16] p-5 space-y-4 shadow-xl">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/50 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wider">
                Emitter Preset Library
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-700/50 font-bold">
                {EMITTER_PRESETS.length} TEMPLATES
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              One-click deploy pre-configured radar, jammer, and comms emitter templates
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="space-y-4 pt-2 border-t border-slate-800/60">
          {/* Target Band Selector */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 font-semibold">Deploy to Band:</span>
            <select
              value={selectedBandIndex}
              onChange={(e) => setSelectedBandIndex(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              {Array.from({ length: bandCount }, (_, i) => (
                <option key={i} value={i}>
                  B{String(i + 1).padStart(2, '0')} ({500 + Math.round(i * (3000 / bandCount))} MHz)
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-300'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat !== 'All' && CATEGORY_ICONS[cat]}
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {/* Preset Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((preset) => {
              const justDeployed = deployedPreset === preset.id;
              return (
                <div
                  key={preset.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    justDeployed
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                      : `${CATEGORY_COLORS[preset.category] || 'bg-slate-900/30 border-slate-800'} hover:border-slate-600`
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {CATEGORY_ICONS[preset.category]}
                        <span className="text-xs font-bold text-slate-200 truncate">{preset.name}</span>
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono mb-1.5">{preset.bandDesignation}</div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{preset.description}</p>

                      {/* Quick Specs */}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[9px] text-slate-500 font-mono">
                        {preset.template.frequencyMHz && <span>F: {preset.template.frequencyMHz} MHz</span>}
                        {preset.template.powerDbm && <span>P: {preset.template.powerDbm} dBm</span>}
                        {preset.template.priMicrosec ? <span>PRI: {preset.template.priMicrosec} µs</span> : null}
                        {preset.template.modulationType && <span>Mod: {preset.template.modulationType}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeploy(preset)}
                      className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                        justDeployed
                          ? 'bg-emerald-900/60 border-emerald-600 text-emerald-300'
                          : 'bg-cyan-950/60 border-cyan-600/50 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-500'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      {justDeployed ? 'Deployed!' : 'Deploy'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
