/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RfPropagationConfig,
  PropagationMedium,
  SyntheticEmitter,
  FrequencyBand,
} from '../../types/simulation';
import {
  Activity,
  Sliders,
  Radio,
  Wind,
  Shield,
  Gauge,
  Volume2,
  VolumeX,
  Zap,
  HelpCircle,
  Eye,
  Info,
  Maximize2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface RfPhysicsConsoleProps {
  rfConfig: RfPropagationConfig;
  onUpdateRfConfig: (config: Partial<RfPropagationConfig>) => void;
  bands: FrequencyBand[];
  emitters: SyntheticEmitter[];
  timeStep: number;
}

export const RfPhysicsConsole: React.FC<RfPhysicsConsoleProps> = ({
  rfConfig,
  onUpdateRfConfig,
  bands,
  emitters,
  timeStep,
}) => {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(soundEffects.isEnabled());
  const [selectedEmitter, setSelectedEmitter] = useState<SyntheticEmitter | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  // Compute live physics values for display
  const nominalFreqMHz = 1500; // Reference mid-band
  const nominalFreqGHz = nominalFreqMHz / 1000;
  const c = 299792458; // m/s
  const fsplDb = Number(
    (20 * Math.log10(rfConfig.distanceKm) + 20 * Math.log10(nominalFreqMHz) + 32.44).toFixed(1)
  );
  const maxDopplerKhz = Number(
    ((rfConfig.platformVelocityKmH / 3600 * 1000 / c) * (nominalFreqMHz * 1e3)).toFixed(2)
  );
  const thermalNoiseDbm = Number(
    (-174 + 10 * Math.log10((bands[0]?.bandwidthMHz || 125) * 1e6) + rfConfig.receiverNoiseFigureDb).toFixed(1)
  );

  const activeEmitters = emitters.filter((e) => e.active);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundEffects.setEnabled(next);
  };

  const playEmitterAudio = (emitter: SyntheticEmitter) => {
    soundEffects.playHitSound(emitter.modulationType, emitter.priMicrosec);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070b16] p-5 space-y-5 shadow-xl font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wider">
                RF Physics & Radar Propagation Engine
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-bold">
                HIGH-FIDELITY EW PHYSICS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Live Friis transmission model, Rayleigh multipath fading, Doppler kinematics, and microwave LO PLL lock latency
            </p>
          </div>
        </div>

        {/* Audio Monitor & Formula Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              audioEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle Acoustic Radar Audio Synthesis"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Acoustic RWR Monitor</span>
          </button>

          <button
            onClick={() => setShowFormulaModal(!showFormulaModal)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Formulation</span>
          </button>
        </div>
      </div>

      {/* Live Physical Link Budget Diagram */}
      <div className="p-4 rounded-xl bg-[#040813] border border-slate-800/90 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instantaneous EW Link Budget Chain (Nominal 1.5 GHz)</span>
          </span>
          <span className="text-[10px] text-cyan-300">
            Platform Kinematics: {rfConfig.platformVelocityKmH} km/h (Doppler: ±{maxDopplerKhz} kHz)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Transmitter EIRP</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">-32 dBm</div>
            <div className="text-[9px] text-slate-500">Radar Peak Output</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Tx Antenna Beam</div>
            <div className="text-sm font-bold text-amber-300 mt-0.5">+28.0 dBi</div>
            <div className="text-[9px] text-slate-500">Mainlobe Peak Gain</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Free Space Loss</div>
            <div className="text-sm font-bold text-rose-400 mt-0.5">-{fsplDb} dB</div>
            <div className="text-[9px] text-slate-500">R = {rfConfig.distanceKm} km</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Rx Horn Gain</div>
            <div className="text-sm font-bold text-cyan-300 mt-0.5">+{rfConfig.receiverAntennaGainDbi} dBi</div>
            <div className="text-[9px] text-slate-500">ES Receiver Horn</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Thermal Noise Floor</div>
            <div className="text-sm font-bold text-purple-300 mt-0.5">{thermalNoiseDbm} dBm</div>
            <div className="text-[9px] text-slate-500">kTB + NF ({rfConfig.receiverNoiseFigureDb} dB)</div>
          </div>

          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60">
            <div className="text-[10px] text-cyan-400 uppercase">Neyman-Pearson P_fa</div>
            <div className="text-sm font-bold text-cyan-200 mt-0.5">{(rfConfig.pfaTarget * 100).toFixed(1)}%</div>
            <div className="text-[9px] text-cyan-400/80">Threshold Rate</div>
          </div>
        </div>
      </div>

      {/* Physics Interactive Sliders & Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Platform Velocity (Kinematics) */}
        <div className="p-3.5 rounded-xl bg-[#040813] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Platform Velocity:</span>
            </span>
            <span className="text-cyan-400 font-bold">{rfConfig.platformVelocityKmH} km/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="1200"
            step="50"
            value={rfConfig.platformVelocityKmH}
            onChange={(e) => onUpdateRfConfig({ platformVelocityKmH: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 (Stationary)</span>
            <span>720 km/h (Mach 0.6)</span>
            <span>1200 km/h</span>
          </div>
        </div>

        {/* Standoff Distance */}
        <div className="p-3.5 rounded-xl bg-[#040813] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>Standoff Distance:</span>
            </span>
            <span className="text-emerald-400 font-bold">{rfConfig.distanceKm} km</span>
          </div>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={rfConfig.distanceKm}
            onChange={(e) => onUpdateRfConfig({ distanceKm: parseInt(e.target.value) })}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>10 km (Close-in)</span>
            <span>45 km (Typical)</span>
            <span>120 km (Stand-off)</span>
          </div>
        </div>

        {/* Front-End Noise Figure */}
        <div className="p-3.5 rounded-xl bg-[#040813] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Receiver NF (dB):</span>
            </span>
            <span className="text-purple-400 font-bold">{rfConfig.receiverNoiseFigureDb} dB</span>
          </div>
          <input
            type="range"
            min="2.5"
            max="8.0"
            step="0.5"
            value={rfConfig.receiverNoiseFigureDb}
            onChange={(e) => onUpdateRfConfig({ receiverNoiseFigureDb: parseFloat(e.target.value) })}
            className="w-full accent-purple-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>2.5 dB (Cryo/LNA)</span>
            <span>4.5 dB (Mil-Spec)</span>
            <span>8.0 dB (Lossy)</span>
          </div>
        </div>

        {/* LO PLL Synthesizer Agility */}
        <div className="p-3.5 rounded-xl bg-[#040813] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>LO PLL Agility:</span>
            </span>
            <span className="text-amber-400 font-bold">{rfConfig.loAgilityUsPerMhz} µs/√MHz</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="3.5"
            step="0.15"
            value={rfConfig.loAgilityUsPerMhz}
            onChange={(e) => onUpdateRfConfig({ loAgilityUsPerMhz: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0.8 (Fast DDS)</span>
            <span>1.85 (Standard)</span>
            <span>3.5 (Sluggish)</span>
          </div>
        </div>
      </div>

      {/* Propagation Medium Selector */}
      <div className="p-4 rounded-xl bg-[#040813] border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            Atmospheric Propagation Medium & Channel Fading Model:
          </span>
          <span className="text-cyan-400 capitalize font-mono">{rfConfig.propagationMedium.replace(/_/g, ' ')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {[
            {
              id: 'standard_troposphere',
              title: 'Standard Atmosphere',
              desc: 'Clear weather, 0.012 dB/km atmospheric absorption, mild Rayleigh fading.',
            },
            {
              id: 'sea_surface_multipath',
              title: 'Maritime Surface Duct',
              desc: '2-Ray ground bounce with severe constructive & destructive nulls (-18 dB).',
            },
            {
              id: 'rain_attenuation',
              title: 'Heavy Precipitation',
              desc: 'Tropical rain cell causing +0.32 dB/km path attenuation, obscuring weak sidelobes.',
            },
            {
              id: 'urban_diffraction',
              title: 'Urban Diffraction',
              desc: 'Obstacle edge diffraction (+8.5 dB clutter shadow loss) and high angular multipath.',
            },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => onUpdateRfConfig({ propagationMedium: m.id as PropagationMedium })}
              className={`p-3 rounded-lg text-left transition-all border flex flex-col justify-between ${
                rfConfig.propagationMedium === m.id
                  ? 'bg-cyan-950/40 border-cyan-500 text-slate-100 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-xs text-slate-200">{m.title}</div>
              <div className="text-[10px] text-slate-400 mt-1 leading-relaxed font-sans">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Emitters Radar Transmission Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Simulated Radar Emitters & Intra-Pulse Modulations</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">
            {activeEmitters.length} of {emitters.length} Currently Radiating
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {emitters.map((em) => {
            const isRadiating = em.active;
            const band = bands[em.bandIndex];
            return (
              <div
                key={em.id}
                onClick={() => setSelectedEmitter(em)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isRadiating
                    ? 'bg-[#050f1d] border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                    : 'bg-[#040813] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs truncate max-w-[190px]">
                      {em.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        isRadiating
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 animate-pulse'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {isRadiating ? 'TRANSMITTING' : 'OFF'}
                    </span>
                  </div>

                  <div className="text-[10px] text-cyan-300 mt-1">
                    {em.modulationType || 'Linear FM Chirp'} · {em.tacticalRole}
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400 grid grid-cols-2 gap-1 border-t border-slate-800/60 pt-1.5">
                    <div>Carrier: <span className="text-slate-200">{em.frequencyMHz} MHz</span></div>
                    <div>Band: <span className="text-slate-200">{band?.name || `B${em.bandIndex + 1}`}</span></div>
                    <div>PRI: <span className="text-slate-200">{em.priMicrosec || 1250} µs</span></div>
                    <div>PW: <span className="text-slate-200">{em.pulseWidthMicrosec || 15} µs</span></div>
                    <div>Antenna: <span className="text-slate-200 capitalize">{em.scanType}</span></div>
                    <div>SNR: <span className={em.snrDb ? 'text-emerald-400 font-bold' : 'text-slate-500'}>+{em.snrDb || 0} dB</span></div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playEmitterAudio(em);
                    }}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline"
                    title="Synthesize and play radar pulse audio"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Acoustic Pulse</span>
                  </button>

                  <span className="text-slate-500">
                    Az: {em.antennaAzimuthDeg || 0}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Physics Mathematical Formulation Modal */}
      {showFormulaModal && (
        <div className="p-4 rounded-xl bg-[#030611] border border-cyan-800/80 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-cyan-300 uppercase">Realistic RF Propagation Physics Formulation</span>
            <button
              onClick={() => setShowFormulaModal(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-2 text-slate-300 leading-relaxed font-sans text-xs">
            <p>
              <strong>1. Radar Range & Friis Path Loss:</strong>{' '}
              <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 font-mono text-[11px]">
                FSPL(dB) = 20·log10(R_km) + 20·log10(f_MHz) + 32.44
              </code>
            </p>
            <p>
              <strong>2. Doppler Frequency Shift:</strong>{' '}
              <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 font-mono text-[11px]">
                Δf = (v / c) · f_0 · cos(θ)
              </code>
            </p>
            <p>
              <strong>3. Thermal Noise Floor:</strong>{' '}
              <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 font-mono text-[11px]">
                P_noise = kTB + NF = -174 dBm/Hz + 10·log10(B) + NF_rx
              </code>
            </p>
            <p>
              <strong>4. Microwave LO PLL Settling Latency:</strong>{' '}
              <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 font-mono text-[11px]">
                τ_lock = 12 µs + K_lo · √(Δf_MHz)
              </code>
              {' '}(During this window, the receiver is physically blind to incoming pulses).
            </p>
            <p>
              <strong>5. Neyman-Pearson Marcum-Q Detection:</strong>{' '}
              <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 font-mono text-[11px]">
                P_d ≈ 0.5 · erfc(√(-ln P_fa) - √(SNR + 0.5))
              </code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
