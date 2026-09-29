/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FrequencyBand, ReceiverState } from '../../types/simulation';
import { ZoomIn, ZoomOut, Eye, Sparkles, Radio, Activity, Zap } from 'lucide-react';

interface SpectrumVisualizerProps {
  bands: FrequencyBand[];
  receiver: ReceiverState;
  timeStep: number;
  onSelectBand?: (bandIndex: number) => void;
}

export const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({
  bands,
  receiver,
  timeStep,
  onSelectBand,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredBand, setHoveredBand] = useState<FrequencyBand | null>(null);
  const [showPredictions, setShowPredictions] = useState<boolean>(true);
  const [showPriorities, setShowPriorities] = useState<boolean>(true);

  // Frequency range
  const minFreq = bands[0]?.startFreqMHz ?? 500;
  const maxFreq = bands[bands.length - 1]?.endFreqMHz ?? 3500;

  const currentScannedBand = bands[receiver.currentBandIndex] || bands[0];
  const isSignalDetected = currentScannedBand?.trueActivity;

  return (
    <div className="rounded-2xl border border-cyan-500/50 bg-[#060b18] p-4 sm:p-5 flex flex-col space-y-4 relative overflow-hidden shadow-2xl glow-cyan">
      {/* Dynamic Animated Radar Grid Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header with Title and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/40 pb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/60 text-cyan-400 shadow-md">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-base sm:text-lg font-black text-slate-100 uppercase tracking-wider">
                Real-Time RF Spectrum Surveillance & Scanning Graph
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 font-bold">
                500 MHz – 3500 MHz
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Active ES receiver tuning beam scanning synthetic RF emitter channels (25ms dwell cycle)
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border ${
              showPredictions
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Predictions</span>
          </button>

          <button
            onClick={() => setShowPriorities(!showPriorities)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border ${
              showPriorities
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Priority</span>
          </button>

          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
              className="p-1.5 text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-2 text-slate-300 font-bold">{zoomLevel.toFixed(1)}x</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="p-1.5 text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. High-Visibility Live Scanning Status Indicator Banner */}
      <div className="p-3 rounded-xl bg-[#040816] border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono relative z-10 shadow-inner">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
          </span>
          <span className="font-bold text-cyan-300 tracking-wider">
            ● SCANNING IN PROGRESS
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            Tuned: <strong className="text-cyan-200">{currentScannedBand?.name}</strong> ({currentScannedBand?.centerFreqMHz} MHz)
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Rx Power: <strong className="text-slate-200">{currentScannedBand?.signalEnergyDbm.toFixed(1)} dBm</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
            isSignalDetected
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/80 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}>
            <Zap className={`w-3.5 h-3.5 ${isSignalDetected ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>{isSignalDetected ? 'INTERCEPTED RF EMISSION DETECTED' : 'MONITORING NOISE FLOOR (-95 dBm)'}</span>
          </span>
        </div>
      </div>

      {/* 3. Main Spectrum Visual Canvas Container */}
      <div className="relative w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 py-1">
        <div
          className="relative min-w-[700px] h-72 bg-[#030611] border border-cyan-950/60 rounded-xl p-4 flex flex-col justify-between overflow-hidden shadow-2xl"
          style={{ width: `${zoomLevel * 100}%` }}
        >
          {/* Background Grid Lines & Noise Floor Level */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          {/* Radar Horizon Grid Lines */}
          <div className="absolute inset-x-0 top-1/4 border-b border-cyan-900/20 pointer-events-none" />
          <div className="absolute inset-x-0 top-2/4 border-b border-cyan-900/20 pointer-events-none" />
          <div className="absolute inset-x-0 top-3/4 border-b border-cyan-900/20 pointer-events-none" />

          {/* Noise floor indicator line */}
          <div className="absolute left-0 right-0 bottom-14 border-b border-dashed border-cyan-500/40 flex items-center justify-between px-3 text-[10px] font-mono text-cyan-400/80 z-10 pointer-events-none">
            <span className="bg-[#030611]/90 px-1.5 py-0.5 rounded">Thermal Noise Floor ~ -95 dBm</span>
            <span className="bg-[#030611]/90 px-1.5 py-0.5 rounded">Detection Threshold (Gamma_th)</span>
          </div>

          {/* Receiver Scan Position Vertical Beam with Neon Glow */}
          {receiver.currentBandIndex >= 0 && receiver.currentBandIndex < bands.length && (
            <div
              className="absolute top-0 bottom-10 transition-all duration-150 pointer-events-none z-30 flex flex-col items-center"
              style={{
                left: `${((receiver.currentBandIndex + 0.5) / bands.length) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* Receiver Scan Cursor Tag */}
              <div className="px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-mono text-[10px] font-black rounded shadow-[0_0_12px_rgba(6,182,212,0.8)] flex items-center gap-1 animate-pulse">
                <span>RX SCAN</span>
              </div>
              {/* Vertical Laser Scan Beam */}
              <div className="w-[3px] h-full bg-gradient-to-b from-cyan-300 via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4]" />
              <div className="w-5 h-5 -mt-2.5 rounded-full border-2 border-cyan-300 bg-cyan-400/30 animate-ping" />
            </div>
          )}

          {/* Next Scheduled Dwell Reticle */}
          {receiver.nextScheduledBandIndex >= 0 &&
            receiver.nextScheduledBandIndex < bands.length &&
            receiver.nextScheduledBandIndex !== receiver.currentBandIndex && (
              <div
                className="absolute top-2 bottom-10 transition-all duration-200 pointer-events-none z-20 flex flex-col items-center"
                style={{
                  left: `${((receiver.nextScheduledBandIndex + 0.5) / bands.length) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-mono text-[9px] font-bold rounded-sm shadow-md">
                  <span>NEXT</span>
                </div>
                <div className="w-[1px] h-full border-l border-dashed border-amber-400/60" />
              </div>
            )}

          {/* Spectrum Energy Bar Columns */}
          <div className="relative z-10 w-full h-48 flex items-end justify-between gap-1 pt-6 px-1">
            {bands.map((band, idx) => {
              const isCurrentScan = idx === receiver.currentBandIndex;
              const isNextScan = idx === receiver.nextScheduledBandIndex;
              const hasSignal = band.trueActivity;

              // Normalized height from dBm (-100 dBm to -20 dBm)
              const minDbm = -100;
              const maxDbm = -20;
              const norm = Math.max(0.08, Math.min(1.0, (band.signalEnergyDbm - minDbm) / (maxDbm - minDbm)));
              const heightPct = Math.round(norm * 100);

              return (
                <div
                  key={band.id}
                  onClick={() => onSelectBand && onSelectBand(idx)}
                  onMouseEnter={() => setHoveredBand(band)}
                  onMouseLeave={() => setHoveredBand(null)}
                  className={`group relative flex-1 h-full flex flex-col justify-end items-center cursor-pointer transition-all duration-150 ${
                    isCurrentScan ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  {/* Predicted activity probability dot / marker */}
                  {showPredictions && (
                    <div
                      className="absolute w-2.5 h-2.5 rounded-full transition-all duration-200 z-20"
                      style={{
                        bottom: `${Math.min(95, band.predictedProbability * 100)}%`,
                        backgroundColor: band.predictedProbability > 0.6 ? '#f59e0b' : '#38bdf8',
                        boxShadow: band.predictedProbability > 0.6 ? '0 0 8px #f59e0b' : 'none',
                      }}
                      title={`Predicted Prob: ${(band.predictedProbability * 100).toFixed(0)}%`}
                    />
                  )}

                  {/* Priority Bar Indicator (at bottom of column) */}
                  {showPriorities && (
                    <div
                      className="w-full h-1.5 rounded-t-sm mb-1"
                      style={{
                        backgroundColor:
                          band.priorityScore > 0.7
                            ? '#06b6d4'
                            : band.priorityScore > 0.4
                            ? '#3b82f6'
                            : '#1e293b',
                      }}
                    />
                  )}

                  {/* Signal Energy Spectrum Bar */}
                  <div
                    className={`w-full rounded-t transition-all duration-150 relative ${
                      hasSignal
                        ? isCurrentScan
                          ? 'bg-gradient-to-t from-emerald-500 via-cyan-400 to-white shadow-[0_0_16px_#10b981]'
                          : 'bg-gradient-to-t from-emerald-600 to-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                        : isCurrentScan
                        ? 'bg-gradient-to-t from-cyan-900/60 to-cyan-400 border-t-2 border-cyan-300 shadow-[0_0_10px_#06b6d4]'
                        : 'bg-slate-800/50 hover:bg-slate-700/60'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  >
                    {/* Active Pulse Animation if transmitting */}
                    {hasSignal && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white animate-pulse" />
                    )}

                    {/* Band Selection Indicator badge */}
                    {isNextScan && !isCurrentScan && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>

                  {/* Band identifier tag */}
                  <span
                    className={`text-[10px] font-mono mt-1 font-bold ${
                      isCurrentScan
                        ? 'text-cyan-300 underline'
                        : hasSignal
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {band.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Frequency Axis Labels (X-Axis) */}
          <div className="border-t border-slate-800 pt-2 flex justify-between text-[11px] font-mono text-slate-400 px-1 font-semibold">
            <span>{minFreq} MHz (VHF/UHF)</span>
            <span>1250 MHz (L-Band)</span>
            <span>2000 MHz (S-Band Surveillance)</span>
            <span>2750 MHz (Radar)</span>
            <span>{maxFreq} MHz (C-Band)</span>
          </div>
        </div>
      </div>

      {/* 4. Hover Band Details Tooltip Bar */}
      <div className="min-h-[48px] p-3 rounded-xl bg-[#040813] border border-cyan-900/50 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300">
        {hoveredBand ? (
          <div className="flex flex-wrap items-center gap-4 w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-700">
                {hoveredBand.name} (Channel {hoveredBand.bandNumber})
              </span>
              <span className="text-slate-300 font-semibold">
                {hoveredBand.centerFreqMHz} MHz (BW: {hoveredBand.bandwidthMHz} MHz)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Activity:</span>
                <span
                  className={
                    hoveredBand.trueActivity
                      ? 'text-emerald-400 font-bold flex items-center gap-1'
                      : 'text-slate-500'
                  }
                >
                  {hoveredBand.trueActivity ? '● ACTIVE EMITTER' : '○ IDLE (Noise Floor)'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500">Energy:</span>
                <span className="text-cyan-300 font-bold">{hoveredBand.signalEnergyDbm.toFixed(1)} dBm</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500">ML Predicted:</span>
                <span className="text-amber-400 font-bold">
                  {(hoveredBand.predictedProbability * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500">Priority Score:</span>
                <span className="text-cyan-400 font-bold">{hoveredBand.priorityScore.toFixed(3)}</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    hoveredBand.isCurrentlyScanned
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {hoveredBand.isCurrentlyScanned ? 'BEING SCANNED' : hoveredBand.status}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-slate-400 text-xs">
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Click or hover over any channel to inspect instantaneous pulse features and ML scheduler score.</span>
            </span>
            <span className="text-cyan-300 font-mono font-bold">Simulation Step #{timeStep.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* 5. Spectrum Visualization Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono text-slate-400 border-t border-slate-900">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            <span className="text-slate-300">Active Synthetic Signal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            <span className="text-cyan-300 font-semibold">Receiver Scanning Beam (RX SCAN)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-amber-300">ML Predicted Emitter Prob</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-cyan-400" />
            <span className="text-slate-300">Priority Weight</span>
          </div>
        </div>

        <div className="text-[10px] text-cyan-500 font-mono">
          VAYU-NETRA · Adaptive Electronic Support Simulation
        </div>
      </div>
    </div>
  );
};
