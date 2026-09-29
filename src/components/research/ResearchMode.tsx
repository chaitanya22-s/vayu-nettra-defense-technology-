/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  Layers,
  Cpu,
  Radio,
  Target,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface SystemBlock {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  mathFormula?: string;
  syntheticRole: string;
}

const SYSTEM_BLOCKS: SystemBlock[] = [
  {
    id: 'env',
    title: 'Synthetic RF Environment',
    shortDesc: 'Generates wideband spectrum channel conditions from 500 MHz to 3500 MHz',
    fullDesc: 'Simulates multi-band channel activity partitioned into discrete sub-bands. Introduces artificial thermal noise floor (-95 dBm) and Rayleigh/Rician propagation variations without touching real electromagnetic emissions.',
    mathFormula: 'Y_k(t) = H_k(t) · S_k(t) + W_k(t), \\quad W_k \\sim \\mathcal{CN}(0, \\sigma^2)',
    syntheticRole: 'Completely artificial wideband spectrum grid.',
  },
  {
    id: 'emitters',
    title: 'Synthetic Emitters',
    shortDesc: 'Deterministic and stochastic pulse trains, chirps, and agile hopping',
    fullDesc: 'Models simulated signal behaviors (periodic surveillance radars, agile frequency hoppers, burst communications). Configured with duty cycles, pulse repetition intervals, and channel occupancy distributions for benchmark evaluation.',
    mathFormula: 'S_k(t) = \\sum_m A_m \\cdot \\text{rect}\\left(\\frac{t - m T_p}{\\tau}\\right)',
    syntheticRole: 'Non-classified behavioral signal templates.',
  },
  {
    id: 'channel',
    title: 'Channel State Vector',
    shortDesc: 'Instantaneous binary vector of spectrum occupancy states',
    fullDesc: 'Represents the ground-truth state of every frequency band at discrete time step t. The receiver does not have omniscient access to this vector; it must observe through narrow dwell windows.',
    mathFormula: '\\mathbf{S}(t) = [s_1(t), s_2(t), \\dots, s_N(t)]^T \\in \\{0, 1\\}^N',
    syntheticRole: 'Simulation ground truth for measuring hit/miss accuracy.',
  },
  {
    id: 'sensor',
    title: 'ES Sensor Tuner Model',
    shortDesc: 'Narrowband receiver front-end with finite instantaneous bandwidth',
    fullDesc: 'Models a single electronic support receiver channel. Hardware constraints prevent simultaneous monitoring of all N bands; tuning requires a dwell duration (e.g. 25 ms) and local oscillator settle time.',
    mathFormula: 'B_{\\text{inst}} \\ll B_{\\text{total}}, \\quad \\tau_{\\text{dwell}} \\approx 25\\text{ ms}',
    syntheticRole: 'Constrained single-receiver physical abstraction.',
  },
  {
    id: 'observation',
    title: 'Spectrum Observation',
    shortDesc: 'Energy detection and threshold crossing in the selected dwell band',
    fullDesc: 'Computes estimated signal energy in the currently monitored band. Compares observed power against Neyman-Pearson detection threshold to declare presence or absence of signal.',
    mathFormula: 'z(t) = \\mathbb{I}\\left(E_k(t) \\ge \\gamma_{\\text{NP}}\\right)',
    syntheticRole: 'Simulated radio frequency energy detection.',
  },
  {
    id: 'scheduler',
    title: 'Adaptive ML Scheduler',
    shortDesc: 'Online decision policy prioritizing candidate bands',
    fullDesc: 'Formulates spectrum surveillance as a Partially Observable Markov Decision Process (POMDP). Balances exploitation of predicted emitter transmissions against Upper Confidence Bound exploration of unobserved bands.',
    mathFormula: 'k^*(t+1) = \\arg\\max_k \\left[ w_{\\text{det}} P_k + w_{\\text{delay}} U_k + \\alpha \\sqrt{\\frac{\\ln t}{N_k}} - w_{\\text{fa}} F_k \\right]',
    syntheticRole: 'Machine learning heuristic decision engine.',
  },
  {
    id: 'scan_action',
    title: 'Scan Action Dispatch',
    shortDesc: 'Commanding local oscillator to target center frequency',
    fullDesc: 'Dispatches frequency synthesizer tuning command to the sensor model. Commits the receiver to the chosen band for the next time-step dwell interval.',
    mathFormula: 'a_t = k^* \\in \\{1, 2, \\dots, N\\}',
    syntheticRole: 'Simulated tuning control loop.',
  },
  {
    id: 'detection',
    title: 'Detection & Reward Feedback',
    shortDesc: 'Interception evaluation and closed-loop reinforcement update',
    fullDesc: 'Quantifies whether an active transmission was successfully intercepted during the dwell. Calculates instantaneous reward and passes reinforcement feedback to update the ML model.',
    mathFormula: 'R_t = w_{\\text{det}} \\cdot \\text{Hit} - w_{\\text{delay}} \\cdot \\text{Delay} - w_{\\text{fa}} \\cdot \\text{FA} - w_{\\text{cost}} \\cdot C_{\\text{scan}}',
    syntheticRole: 'Policy evaluation & learning gradient.',
  },
];

export const ResearchMode: React.FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<SystemBlock>(SYSTEM_BLOCKS[0]);
  const [activeResearchTab, setActiveResearchTab] = useState<
    'architecture' | 'formulation' | 'metrics' | 'limitations'
  >('architecture');

  return (
    <div className="rounded-xl border border-slate-800 bg-[#070b16] p-4 flex flex-col space-y-6 shadow-lg">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wider">
                Research Mode & Scientific System Model
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-300">
                Peer-Review Formulation
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Theoretical foundation for reinforcement-driven spectrum scheduling in constrained Electronic Support (ES) receivers
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveResearchTab('architecture')}
            className={`px-3 py-1 rounded transition-colors ${
              activeResearchTab === 'architecture' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
            }`}
          >
            System Model
          </button>
          <button
            onClick={() => setActiveResearchTab('formulation')}
            className={`px-3 py-1 rounded transition-colors ${
              activeResearchTab === 'formulation' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
            }`}
          >
            POMDP Formulation
          </button>
          <button
            onClick={() => setActiveResearchTab('metrics')}
            className={`px-3 py-1 rounded transition-colors ${
              activeResearchTab === 'metrics' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
            }`}
          >
            Evaluation Metrics
          </button>
          <button
            onClick={() => setActiveResearchTab('limitations')}
            className={`px-3 py-1 rounded transition-colors ${
              activeResearchTab === 'limitations' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
            }`}
          >
            Limitations & Scope
          </button>
        </div>
      </div>

      {activeResearchTab === 'architecture' && (
        <div className="space-y-4">
          <div className="text-xs font-tech font-bold uppercase tracking-wider text-slate-300">
            Interactive Closed-Loop System Block Diagram (Click any module)
          </div>

          {/* Interactive Flow Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {SYSTEM_BLOCKS.map((block, idx) => {
              const isSelected = block.id === selectedBlock.id;
              return (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlock(block)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/70 glow-cyan'
                      : 'bg-[#040813] border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1">
                      <span>MODULE {String(idx + 1).padStart(2, '0')}</span>
                      {idx === SYSTEM_BLOCKS.length - 1 && (
                        <span className="text-amber-400">FEEDBACK ↺</span>
                      )}
                    </div>
                    <div className="font-tech text-xs font-bold text-slate-100">{block.title}</div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{block.shortDesc}</p>
                  </div>
                  <div className="mt-2 text-[9px] font-mono text-slate-500">Click to view details →</div>
                </div>
              );
            })}
          </div>

          {/* Selected Block In-Depth Specification Panel */}
          {selectedBlock && (
            <div className="p-4 rounded-xl bg-[#040813] border border-cyan-500/40 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                  <h3 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wide">
                    {selectedBlock.title}
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {selectedBlock.syntheticRole}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedBlock.fullDesc}
              </p>

              {selectedBlock.mathFormula && (
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Mathematical Abstraction</div>
                  <div className="font-mono text-cyan-300 text-xs sm:text-sm font-semibold">
                    {selectedBlock.mathFormula}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeResearchTab === 'formulation' && (
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-4 text-xs font-mono text-slate-300 leading-relaxed">
          <div className="font-tech text-sm font-bold text-cyan-300 uppercase">
            Partially Observable Markov Decision Process (POMDP) Formulation
          </div>

          <div className="space-y-2">
            <p className="font-sans text-slate-300">
              When scanning a wideband spectrum [f_min, f_max] with a receiver having instantaneous bandwidth B_inst &lt;&lt; B_total, the surveillance system faces a classic exploration-exploitation dilemma with partial observability:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 font-sans">
              <li>
                <strong className="text-slate-200">State Space (S):</strong> Binary vector s_t ∈ &#123;0, 1&#125;^N representing unobserved activity across N discrete frequency channels.
              </li>
              <li>
                <strong className="text-slate-200">Action Space (A):</strong> Receiver tuning decision a_t = k ∈ &#123;1, ..., N&#125;, selecting which band to dwell upon for duration τ_dwell.
              </li>
              <li>
                <strong className="text-slate-200">Observation Space (O):</strong> Measurement z_t ∈ &#123;0, 1&#125; obtained only for band k. All other N-1 channels remain unobserved.
              </li>
              <li>
                <strong className="text-slate-200">Belief State (b_t):</strong> Posterior probability distribution over the state space updated via Bayes' rule and recency decay.
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeResearchTab === 'metrics' && (
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-4 text-xs font-mono text-slate-300">
          <div className="font-tech text-sm font-bold text-cyan-300 uppercase">
            Standard Simulation Evaluation Metrics
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="font-bold text-cyan-400">1. Probability of Intercept / Detection (P_d)</div>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Ratio of emitter transmission pulses successfully intercepted during active dwell to total pulse emission opportunities.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="font-bold text-amber-400">2. Mean Intercept Latency (Delay)</div>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Time elapsed (in steps or ms) between when an agile emitter begins transmission and when the scheduler tunes to that band.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="font-bold text-emerald-400">3. Scan Efficiency Ratio (SER)</div>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Fraction of total receiver dwell steps that yielded a confirmed signal intercept vs vacant dwells.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="font-bold text-purple-400">4. False Alarm Probability (P_fa)</div>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Rate of dwelling on bands predicted active where no synthetic emitter was transmitting (empty noise channel).
              </p>
            </div>
          </div>
        </div>
      )}

      {activeResearchTab === 'limitations' && (
        <div className="p-4 rounded-xl bg-[#040813] border border-slate-800 space-y-4 text-xs font-mono text-slate-300">
          <div className="font-tech text-sm font-bold text-amber-400 uppercase">
            Research Scope, Limitations & Future Work
          </div>
          <div className="space-y-2 text-slate-400 font-sans text-xs">
            <p>
              • <strong className="text-slate-200">Synthetic Boundary:</strong> All electromagnetic parameters are simulated mathematically on discrete grids. No real radio hardware or live transmissions are involved.
            </p>
            <p>
              • <strong className="text-slate-200">Hardware Constraints in Practice:</strong> Real receivers exhibit non-zero PLL lock times, phase noise, and I/Q imbalance which are simplified in this algorithmic prototype.
            </p>
            <p>
              • <strong className="text-slate-200">Future Scope:</strong> Extending to multi-channel dual-tuner architectures, deep Q-networks (DQN), and non-stationary adversarial hopping protocols.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
