/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FlaskConical, BarChart3, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { VayuNetraLogo } from '../shared/VayuNetraLogo';
import { PortalRole } from '../../types/simulation';

interface RoleSelectionModalProps {
  onSelectRole: (role: PortalRole) => void;
  currentRole?: PortalRole;
  isModal?: boolean;
  onClose?: () => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  onSelectRole,
  currentRole,
  isModal = false,
  onClose,
}) => {
  return (
    <div
      className={
        isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md'
          : 'min-h-screen bg-[#040711] text-slate-100 flex items-center justify-center p-4 sm:p-6'
      }
    >
      <div className="w-full max-w-4xl bg-[#070b16] border border-cyan-500/40 rounded-2xl p-6 sm:p-10 shadow-2xl relative glow-cyan space-y-8 overflow-hidden">
        {/* Ambient background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

        {/* Modal Close Button if opened as modal */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs font-mono transition-colors"
          >
            ✕ Close
          </button>
        )}

        {/* Header */}
        <div className="text-center relative z-10 space-y-3 max-w-2xl mx-auto">
          <div className="flex justify-center mb-1">
            <VayuNetraLogo size="md" animated={true} />
          </div>

          <h1 className="font-tech text-3xl sm:text-4xl font-black text-slate-100 uppercase tracking-wider">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">VAYU-NETRA INTELLIGENCE</span>
          </h1>

          <p className="text-sm sm:text-base text-cyan-200/90 font-sans font-medium">
            Select your research workspace
          </p>

          <p className="text-xs font-mono text-slate-400">
            Observe • Learn • Predict • Schedule · Smart Scan Strategy for Electronic Warfare Simulation
          </p>
        </div>

        {/* Exactly Two Distinct Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* ROLE CARD 1: LEAD RESEARCHER */}
          <div
            onClick={() => onSelectRole('lead_researcher')}
            className={`group p-6 sm:p-7 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:scale-[1.01] ${
              currentRole === 'lead_researcher'
                ? 'bg-gradient-to-b from-[#08182b] to-[#040a17] border-cyan-400 glow-cyan ring-2 ring-cyan-400/50'
                : 'bg-gradient-to-b from-[#07101f] to-[#040813] border-cyan-900/60 hover:border-cyan-500/60 hover:shadow-xl'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-md group-hover:scale-105 transition-transform">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  {currentRole === 'lead_researcher' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold uppercase tracking-wider">
                      ACTIVE NOW
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 uppercase tracking-widest font-semibold">
                    RESEARCH LEAD
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-tech text-xl font-bold text-slate-100 uppercase tracking-wide group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                  <span>👨‍🔬 LEAD RESEARCHER</span>
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-1.5 leading-relaxed">
                  Design and manage the complete research lifecycle.
                </p>
              </div>

              {/* Exact List of Researcher Features */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Research Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Experiment Design</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Synthetic Environment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Algorithm Configuration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Evaluation Requests</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Research Results</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Research Reports</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Team Management</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onSelectRole('lead_researcher')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg glow-cyan"
              >
                <span>Enter Research Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ROLE CARD 2: ALGORITHM EVALUATOR */}
          <div
            onClick={() => onSelectRole('evaluator')}
            className={`group p-6 sm:p-7 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:scale-[1.01] ${
              currentRole === 'evaluator'
                ? 'bg-gradient-to-b from-[#08201a] to-[#040e0c] border-emerald-400 glow-cyan ring-2 ring-emerald-400/50'
                : 'bg-gradient-to-b from-[#071515] to-[#040a0b] border-emerald-900/60 hover:border-emerald-500/60 hover:shadow-xl'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shadow-md group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  {currentRole === 'evaluator' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider">
                      ACTIVE NOW
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 uppercase tracking-widest font-semibold">
                    BENCHMARK & QA
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-tech text-xl font-bold text-slate-100 uppercase tracking-wide group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                  <span>📊 ALGORITHM EVALUATOR</span>
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-1.5 leading-relaxed">
                  Benchmark, measure and validate algorithm performance.
                </p>
              </div>

              {/* Exact List of Evaluator Features */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Evaluation Queue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Algorithm Benchmark</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Baseline Comparison</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Performance Metrics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Parameter Testing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Ablation Study</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Error Analysis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Statistical Validation</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onSelectRole('evaluator')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-mono text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>Enter Evaluation Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info strip */}
        <div className="border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Strict Role Separation · Simulation & Research Prototype</span>
          </div>
          <span>Synthetic Measurements & Emitters Only · Zero Operational EW Coupling</span>
        </div>
      </div>
    </div>
  );
};
