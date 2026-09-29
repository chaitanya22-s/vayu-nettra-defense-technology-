/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, AlertCircle, FileCheck, Lock, CheckCircle2 } from 'lucide-react';

interface ResponsibleNoticeProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const ResponsibleNotice: React.FC<ResponsibleNoticeProps> = ({ onClose, isModal }) => {
  const content = (
    <div className="rounded-xl border border-cyan-800/60 bg-[#070e1e] p-5 flex flex-col space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-cyan-950 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 glow-cyan">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wider">
              Responsible Research & Synthetic Simulation Policy
            </h2>
            <p className="text-xs text-cyan-300">
              Electronic Warfare Simulation & Educational Research Scope
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* Core Safety Commitments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-slate-300">
        <div className="p-3 rounded-lg bg-[#040813] border border-slate-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200">100% Synthetic RF Environment</span>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
              All frequencies, waveforms, signal powers, and channel occupancies are generated strictly via mathematical equations in browser memory.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#040813] border border-slate-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200">Zero Hardware Interception</span>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
              The platform connects to no software-defined radios (SDR), antenna arrays, or RF receiver equipment. No real electromagnetic signals are monitored.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#040813] border border-slate-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200">No Real Defense Emitter Data</span>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
              All emitter labels and parameters are artificial synthetic models. No real-world classified emitter databases, waveforms, or tactical parameters are included.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#040813] border border-slate-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200">Educational & Algorithmic Scope</span>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
              Designed solely for research benchmarking of adaptive scheduling policies, optimization objective evaluation, and hackathon presentation.
            </p>
          </div>
        </div>
      </div>

      {/* Regulatory & Ethics Banner */}
      <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] font-mono text-cyan-200/90 leading-relaxed">
        <strong>Academic Notice:</strong> Real-world operational electronic support systems require rigorous physical validation, certified cryptographic controls, and statutory telecommunications regulatory authorization.
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="max-w-2xl w-full">{content}</div>
      </div>
    );
  }

  return content;
};
