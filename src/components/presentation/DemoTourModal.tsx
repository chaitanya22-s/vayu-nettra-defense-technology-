/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  X,
  Layers,
  Cpu,
  BarChart3,
  GitCompare,
} from 'lucide-react';

interface DemoTourModalProps {
  onClose: () => void;
  onNavigateToTab: (tab: any) => void;
  onRunBatchSteps: (steps: number) => void;
  onResetSimulation: () => void;
  timeStep: number;
}

interface DemoStep {
  stepNumber: number;
  title: string;
  desc: string;
  targetTab: string;
  actionLabel: string;
  autoStepsToRun?: number;
}

const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: 'Generate Synthetic RF Environment',
    desc: 'The platform initializes an artificial wideband spectrum with simulated periodic radars, frequency hoppers, and background thermal noise.',
    targetTab: 'environment',
    actionLabel: 'Inspect Environment',
    autoStepsToRun: 20,
  },
  {
    stepNumber: 2,
    title: 'Explore 2D Time × Frequency Search Space',
    desc: 'Observe the intermittent transmissions across frequency channels and time steps. Single-channel receivers can only monitor one band at a time.',
    targetTab: 'heatmap',
    actionLabel: 'Inspect 2D Waterfall',
    autoStepsToRun: 40,
  },
  {
    stepNumber: 3,
    title: 'Execute Baseline Open-Loop Sweep',
    desc: 'A traditional receiver cycles through bands sequentially. Notice high miss rates when agile emitters transmit while the receiver is dwelling on vacant bands.',
    targetTab: 'comparison',
    actionLabel: 'Run Baseline Sweep',
    autoStepsToRun: 80,
  },
  {
    stepNumber: 4,
    title: 'Engage VAYU-NETRA INTELLIGENCE ML Scheduler',
    desc: 'The adaptive scheduler extracts temporal features (recency decay, persistence, UCB uncertainty) and dynamically prioritizes high-value channels.',
    targetTab: 'scheduler',
    actionLabel: 'Watch ML Decisions',
    autoStepsToRun: 150,
  },
  {
    stepNumber: 5,
    title: 'Closed-Loop Model Reinforcement',
    desc: 'Every dwell yields a Hit (+1.5 reward) or Miss (-0.4 penalty). Notice how posterior confidence increases on active periodic signals.',
    targetTab: 'ml_engine',
    actionLabel: 'Inspect Learning Loop',
    autoStepsToRun: 200,
  },
  {
    stepNumber: 6,
    title: 'Side-by-Side Dual Benchmark',
    desc: 'Direct empirical comparison on identical ground truth: VAYU-NETRA INTELLIGENCE achieves +30% to +50% higher detection efficiency and lower intercept latency.',
    targetTab: 'comparison',
    actionLabel: 'Compare Performance',
    autoStepsToRun: 300,
  },
  {
    stepNumber: 7,
    title: 'Quantitative Performance Verification',
    desc: 'Examine Probability of Detection (P_d > 90%), false alarm suppression (P_fa < 5%), and non-uniform spectrum scan allocation histograms.',
    targetTab: 'performance',
    actionLabel: 'Review Final Metrics',
    autoStepsToRun: 0,
  },
];

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  onClose,
  onNavigateToTab,
  onRunBatchSteps,
  onResetSimulation,
  timeStep,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const activeStep = DEMO_STEPS[currentStepIdx];
  const isLast = currentStepIdx === DEMO_STEPS.length - 1;

  // Auto-advance logic if auto-play is turned on
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying && !isLast) {
      timer = setTimeout(() => {
        handleExecuteAndAdvance();
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentStepIdx, isLast]);

  const handleExecuteAndAdvance = () => {
    if (activeStep.autoStepsToRun && activeStep.autoStepsToRun > 0) {
      onRunBatchSteps(activeStep.autoStepsToRun);
    }
    onNavigateToTab(activeStep.targetTab);
    if (!isLast) {
      setCurrentStepIdx((i) => i + 1);
    } else {
      setIsAutoPlaying(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-lg w-full px-3">
      <div className="bg-[#070e1f] border border-cyan-500/50 rounded-2xl shadow-2xl p-5 relative overflow-hidden glow-cyan">
        <div className="flex items-start justify-between border-b border-cyan-950 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wider">
                  2-Minute Guided Demo Tour
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  STEP {activeStep.stepNumber} / {DEMO_STEPS.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Automated sequence for Hackathon Jury Evaluation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="w-full h-1 bg-slate-900 my-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${((currentStepIdx + 1) / DEMO_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-tech text-base font-bold text-slate-100">{activeStep.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeStep.desc}</p>
        </div>

        {/* Controls */}
        <div className="mt-4 pt-3 border-t border-cyan-950/80 flex items-center justify-between">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300"
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoPlaying ? 'Pause Auto' : 'Auto Play'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNavigateToTab(activeStep.targetTab);
                if (activeStep.autoStepsToRun) onRunBatchSteps(activeStep.autoStepsToRun);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono"
            >
              {activeStep.actionLabel}
            </button>

            <button
              onClick={handleExecuteAndAdvance}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all"
            >
              <span>{isLast ? 'Complete Demo' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
