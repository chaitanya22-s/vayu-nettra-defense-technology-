/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Compass,
  Cpu,
  BarChart3,
  Layers,
  Radio,
  SlidersHorizontal,
  Flame,
  GitCompare,
  BookOpen,
  ShieldCheck,
  FlaskConical,
  LogOut,
  HelpCircle,
  FileText,
  History,
  Users,
  Settings as SettingsIcon,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ListOrdered,
  FileCheck,
  Download,
  Crosshair,
} from 'lucide-react';
import { VayuNetraLogo } from '../shared/VayuNetraLogo';
import { PortalRole, LeadResearcherTab, AlgorithmEvaluatorTab } from '../../types/simulation';

interface SidebarProps {
  portalRole: PortalRole;
  currentResearcherTab: LeadResearcherTab;
  currentEvaluatorTab: AlgorithmEvaluatorTab;
  onSelectResearcherTab: (tab: LeadResearcherTab) => void;
  onSelectEvaluatorTab: (tab: AlgorithmEvaluatorTab) => void;
  onSwitchPortalRole: (role: PortalRole) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenRoleSelection: () => void;
  userEmail: string | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  portalRole,
  currentResearcherTab,
  currentEvaluatorTab,
  onSelectResearcherTab,
  onSelectEvaluatorTab,
  onSwitchPortalRole,
  isOpenMobile,
  onCloseMobile,
  onOpenRoleSelection,
  userEmail,
  onLogout,
}) => {
  // Exact 14 Researcher Sections specified in Prompt + Live Simulation:
  const researcherNavSections = [
    {
      group: 'RESEARCH & LIVE SIMULATION',
      items: [
        { id: 'command_center', label: 'Research Command Center', icon: Compass, badge: 'Overview' },
        { id: 'live_simulation', label: 'Live RF Spectrum Simulation', icon: Radio, badge: 'LIVE' },
        { id: 'synthetic_rf_environment', label: 'RF Environment Simulator', icon: Flame, badge: 'SIMULATOR' },
        { id: 'research_questions', label: 'Research Questions', icon: HelpCircle, badge: '5 RQs' },
        { id: 'system_model', label: 'System Model', icon: BookOpen, badge: 'Formulation' },
      ],
    },
    {
      group: 'ALGORITHMS & EXPERIMENT DESIGN',
      items: [
        { id: 'algorithm_library', label: 'Algorithm Library', icon: Radio, badge: 'Create/Edit' },
        { id: 'experiment_designer', label: 'Experiment Designer', icon: FlaskConical, badge: 'Design' },
        { id: 'scheduler_configuration', label: 'Scheduler Configuration', icon: SlidersHorizontal, badge: 'Weights' },
        { id: 'ml_model', label: 'ML Model', icon: Cpu, badge: 'Neural RL' },
      ],
    },
    {
      group: 'DISPATCH & ANALYSIS',
      items: [
        { id: 'evaluation_requests', label: 'Evaluation Requests', icon: BarChart3, badge: 'Submit' },
        { id: 'threat_classification', label: 'Threat Classification', icon: Crosshair, badge: 'EW Intel' },
        { id: 'research_results', label: 'Research Results', icon: CheckCircle2, badge: 'Findings' },
        { id: 'research_reports', label: 'Research Reports', icon: FileText, badge: 'Final Paper' },
      ],
    },
    {
      group: 'ORGANIZATION',
      items: [
        { id: 'experiment_history', label: 'Experiment History', icon: History, badge: 'Audit' },
        { id: 'data_export', label: 'Data Export & Reports', icon: Download, badge: 'Export' },
        { id: 'research_team', label: 'Research Team', icon: Users, badge: 'Manage' },
        { id: 'settings', label: 'Settings', icon: SettingsIcon, badge: 'Config' },
      ],
    },
  ];

  // Dedicated Sections for Algorithm Evaluator:
  const evaluatorNavSections = [
    {
      group: 'VALIDATION QUEUE & BENCHMARKS',
      items: [
        { id: 'eval_dashboard', label: 'Evaluation Dashboard', icon: Scale, badge: 'Scoreboard' },
        { id: 'live_simulation', label: 'Live Evaluation Sweep', icon: Radio, badge: 'LIVE' },
        { id: 'synthetic_rf_environment', label: 'RF Environment Simulator', icon: Flame, badge: 'SIMULATOR' },
        { id: 'evaluation_queue', label: 'Evaluation Queue', icon: ListOrdered, badge: 'Incoming' },
        { id: 'algorithm_benchmark', label: 'Algorithm Benchmark', icon: FlaskConical, badge: 'Batch Trials' },
        { id: 'baseline_comparison', label: 'Baseline Comparison', icon: GitCompare, badge: 'Synchronized' },
      ],
    },
    {
      group: 'METRICS & TESTING',
      items: [
        { id: 'performance_metrics', label: 'Performance Metrics', icon: Layers, badge: 'Waterfall & ROC' },
        { id: 'parameter_testing', label: 'Parameter Testing', icon: Sliders, badge: 'Stress Sweeps' },
        { id: 'ablation_study', label: 'Ablation Study', icon: AlertTriangle, badge: 'Component Loss' },
      ],
    },
    {
      group: 'ANALYSIS & CERTIFICATION',
      items: [
        { id: 'error_analysis', label: 'Error Analysis', icon: CheckCircle2, badge: 'Diagnostics' },
        { id: 'statistical_validation', label: 'Statistical Validation', icon: BarChart3, badge: 'p < 0.001' },
        { id: 'evaluation_signoff', label: 'Evaluation Sign-Off', icon: FileCheck, badge: 'Certification' },
      ],
    },
  ];

  const activeSections = portalRole === 'lead_researcher' ? researcherNavSections : evaluatorNavSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#060914] border-r border-slate-800/80 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-10 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <VayuNetraLogo size="sm" animated={true} />
            <div>
              <div
                className={`text-[10px] uppercase font-mono tracking-wider font-bold ${
                  portalRole === 'lead_researcher' ? 'text-cyan-400' : 'text-emerald-400'
                }`}
              >
                {portalRole === 'lead_researcher' ? '👨‍🔬 Lead Researcher' : '📊 Algorithm Evaluator'}
              </div>
              <div className="font-tech text-base font-bold text-slate-100 tracking-wider">
                VAYU-NETRA
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const nextRole = portalRole === 'lead_researcher' ? 'evaluator' : 'lead_researcher';
              onSwitchPortalRole(nextRole);
            }}
            title="Click to toggle workspace portal"
            className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider transition-all hover:scale-105 cursor-pointer ${
              portalRole === 'lead_researcher'
                ? 'bg-cyan-950/70 border border-cyan-500/70 text-cyan-300 hover:bg-cyan-900/80'
                : 'bg-emerald-950/70 border border-emerald-500/70 text-emerald-300 hover:bg-emerald-900/80'
            }`}
          >
            {portalRole === 'lead_researcher' ? 'LAB ⇌' : 'EVAL ⇌'}
          </button>
        </div>

        {/* Portal Switcher Pill inside Sidebar */}
        <div className="p-3 border-b border-slate-800/60 bg-[#040711] space-y-1.5">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-1 flex items-center justify-between">
            <span>Select Portal</span>
            <span className="text-[9px] text-cyan-400 font-semibold">Active: {portalRole === 'lead_researcher' ? 'Researcher' : 'Evaluator'}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => onSwitchPortalRole('lead_researcher')}
              className={`py-2 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                portalRole === 'lead_researcher'
                  ? 'bg-cyan-500/25 text-cyan-200 font-bold border border-cyan-400/80 shadow-md glow-cyan ring-1 ring-cyan-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="Switch to Lead Researcher Portal"
            >
              <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
              <span>Researcher</span>
            </button>
            <button
              onClick={() => onSwitchPortalRole('evaluator')}
              className={`py-2 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                portalRole === 'evaluator'
                  ? 'bg-emerald-500/25 text-emerald-200 font-bold border border-emerald-400/80 shadow-md ring-1 ring-emerald-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="Switch to Algorithm Evaluator Portal"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Evaluator</span>
            </button>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-none">
          {activeSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-2 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                {section.group}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    portalRole === 'lead_researcher'
                      ? currentResearcherTab === item.id
                      : currentEvaluatorTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (portalRole === 'lead_researcher') {
                          onSelectResearcherTab(item.id as LeadResearcherTab);
                        } else {
                          onSelectEvaluatorTab(item.id as AlgorithmEvaluatorTab);
                        }
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-mono transition-all group ${
                        isActive
                          ? portalRole === 'lead_researcher'
                            ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/50 glow-cyan font-bold'
                            : 'bg-emerald-950/40 text-emerald-200 border border-emerald-500/50 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? portalRole === 'lead_researcher'
                                ? 'text-cyan-400'
                                : 'text-emerald-400'
                              : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 ml-1.5 ${
                            isActive
                              ? portalRole === 'lead_researcher'
                                ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-700/50'
                                : 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer profile & actions */}
        <div className="p-3 border-t border-slate-800/80 bg-[#050811]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 mb-2">
            <div className="truncate mr-2">
              <div
                className={`text-[10px] font-mono font-bold uppercase truncate ${
                  portalRole === 'lead_researcher' ? 'text-cyan-400' : 'text-emerald-400'
                }`}
              >
                {portalRole === 'lead_researcher' ? 'Lead Researcher' : 'Algorithm Evaluator'}
              </div>
              <div className="text-xs text-slate-200 truncate">{userEmail}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-600">
            VAYU-NETRA INTELLIGENCE · Synthetic RF Simulation
          </div>
        </div>
      </aside>
    </>
  );
};
