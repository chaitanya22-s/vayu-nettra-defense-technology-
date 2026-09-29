/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Radio,
  Crosshair,
  Zap,
  Activity,
  Eye,
} from 'lucide-react';
import { SyntheticEmitter } from '../../types/simulation';
import {
  classifyAllEmitters,
  getThreatSummary,
  ThreatAssessment,
  ThreatLevel,
} from '../../services/threatClassifier';

interface ThreatClassificationDashboardProps {
  emitters: SyntheticEmitter[];
  timeStep: number;
}

const THREAT_COLORS: Record<ThreatLevel, { bg: string; border: string; text: string; badge: string; glow: string }> = {
  CRITICAL: {
    bg: 'bg-red-950/50',
    border: 'border-red-500/70',
    text: 'text-red-300',
    badge: 'bg-red-900 text-red-200 border-red-600',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]',
  },
  HIGH: {
    bg: 'bg-orange-950/40',
    border: 'border-orange-500/60',
    text: 'text-orange-300',
    badge: 'bg-orange-900 text-orange-200 border-orange-600',
    glow: 'shadow-[0_0_8px_rgba(249,115,22,0.2)]',
  },
  MEDIUM: {
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/50',
    text: 'text-amber-300',
    badge: 'bg-amber-900/80 text-amber-200 border-amber-700',
    glow: '',
  },
  LOW: {
    bg: 'bg-slate-900/50',
    border: 'border-slate-700/60',
    text: 'text-slate-300',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    glow: '',
  },
  INFO: {
    bg: 'bg-slate-900/40',
    border: 'border-slate-800/60',
    text: 'text-slate-400',
    badge: 'bg-slate-800/60 text-slate-400 border-slate-700/50',
    glow: '',
  },
};

const THREAT_ICONS: Record<ThreatLevel, React.ReactNode> = {
  CRITICAL: <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />,
  HIGH: <AlertTriangle className="w-4 h-4 text-orange-400" />,
  MEDIUM: <Shield className="w-4 h-4 text-amber-400" />,
  LOW: <Info className="w-4 h-4 text-slate-400" />,
  INFO: <Eye className="w-4 h-4 text-slate-500" />,
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Fire Control Radar': <Crosshair className="w-3.5 h-3.5 text-red-400" />,
  'Tracking Radar': <Crosshair className="w-3.5 h-3.5 text-orange-400" />,
  'Air Surveillance Radar': <Radio className="w-3.5 h-3.5 text-cyan-400" />,
  'Surface Search Radar': <Radio className="w-3.5 h-3.5 text-emerald-400" />,
  'Electronic Jammer': <Zap className="w-3.5 h-3.5 text-red-400" />,
  'Communication Link': <Activity className="w-3.5 h-3.5 text-blue-400" />,
  'Navigation / ATC': <Radio className="w-3.5 h-3.5 text-slate-400" />,
  'Unknown Emitter': <Info className="w-3.5 h-3.5 text-slate-500" />,
};

export const ThreatClassificationDashboard: React.FC<ThreatClassificationDashboardProps> = ({
  emitters,
  timeStep,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<ThreatLevel | 'ALL'>('ALL');

  const assessments = useMemo(() => classifyAllEmitters(emitters), [emitters]);
  const summary = useMemo(() => getThreatSummary(assessments), [assessments]);

  const filtered = filterLevel === 'ALL'
    ? assessments
    : assessments.filter((a) => a.threatLevel === filterLevel);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070b16] p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/50 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wider">
                Threat Classification Dashboard
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/60 text-red-300 border border-red-700/50 font-bold">
                REAL-TIME EW THREAT ID
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Automatic threat categorization from RF pulse descriptor words — PRI, PW, modulation, frequency, scan type
            </p>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          T+{timeStep}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Total Emitters</div>
          <div className="text-lg font-bold text-slate-200 mt-0.5">{summary.totalEmitters}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50">
          <div className="text-[10px] text-emerald-400 uppercase">Active</div>
          <div className="text-lg font-bold text-emerald-300 mt-0.5">{summary.activeEmitters}</div>
        </div>
        <div className={`p-2.5 rounded-lg border ${summary.criticalThreats > 0 ? 'bg-red-950/50 border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'bg-slate-900/40 border-slate-800'}`}>
          <div className="text-[10px] text-red-400 uppercase">Critical</div>
          <div className={`text-lg font-bold mt-0.5 ${summary.criticalThreats > 0 ? 'text-red-300 animate-pulse' : 'text-slate-500'}`}>{summary.criticalThreats}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-orange-950/30 border border-orange-800/40">
          <div className="text-[10px] text-orange-400 uppercase">High</div>
          <div className="text-lg font-bold text-orange-300 mt-0.5">{summary.highThreats}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40">
          <div className="text-[10px] text-amber-400 uppercase">Medium</div>
          <div className="text-lg font-bold text-amber-300 mt-0.5">{summary.mediumThreats}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Low</div>
          <div className="text-lg font-bold text-slate-300 mt-0.5">{summary.lowThreats}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40">
          <div className="text-[10px] text-cyan-400 uppercase">Avg Confidence</div>
          <div className="text-lg font-bold text-cyan-300 mt-0.5">{summary.averageConfidence}%</div>
        </div>
      </div>

      {/* Highest Threat Alert Bar */}
      {summary.highestThreat && summary.highestThreat.threatLevel === 'CRITICAL' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/40 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.25)] animate-pulse">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="text-xs">
            <span className="text-red-300 font-bold uppercase">⚠ Priority Threat: </span>
            <span className="text-red-200">{summary.highestThreat.emitterName}</span>
            <span className="text-red-400 ml-2">— {summary.highestThreat.category}</span>
            <span className="text-red-400/80 ml-2">| {summary.highestThreat.recommendedAction}</span>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold uppercase text-[10px]">Filter:</span>
        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] as const).map((level) => (
          <button
            key={level}
            onClick={() => setFilterLevel(level)}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase transition-all ${
              filterLevel === level
                ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Threat Cards */}
      <div className="space-y-2">
        {filtered.map((assessment) => {
          const colors = THREAT_COLORS[assessment.threatLevel];
          const isExpanded = expandedId === assessment.emitterId;

          return (
            <div
              key={assessment.emitterId}
              className={`rounded-xl border transition-all ${colors.bg} ${colors.border} ${colors.glow}`}
            >
              {/* Card Header — always visible */}
              <button
                onClick={() => toggleExpand(assessment.emitterId)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {THREAT_ICONS[assessment.threatLevel]}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {assessment.emitterName}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${colors.badge}`}>
                        {assessment.threatLevel}
                      </span>
                      {assessment.isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold animate-pulse">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      {CATEGORY_ICONS[assessment.category]}
                      <span>{assessment.category}</span>
                      <span className="text-slate-600">·</span>
                      <span>{assessment.frequencyMHz} MHz</span>
                      <span className="text-slate-600">·</span>
                      <span>{assessment.powerDbm} dBm</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-cyan-400">{assessment.confidence}% conf.</span>
                    </div>
                  </div>
                </div>
                {isExpanded
                  ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                }
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-800/50 space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#040813] border border-slate-800/60 space-y-2">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Analysis</div>
                    <p className="text-slate-300 leading-relaxed font-sans">{assessment.reasoning}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-2">
                    <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Recommended Action</div>
                    <p className="text-amber-200 leading-relaxed font-sans font-semibold">{assessment.recommendedAction}</p>
                  </div>

                  {/* Confidence Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Classification Confidence</span>
                      <span className={`font-bold ${assessment.confidence >= 80 ? 'text-emerald-400' : assessment.confidence >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {assessment.confidence}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          assessment.confidence >= 80
                            ? 'bg-emerald-500'
                            : assessment.confidence >= 60
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${assessment.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            No emitters match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
