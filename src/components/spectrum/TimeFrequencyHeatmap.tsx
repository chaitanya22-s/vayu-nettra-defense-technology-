/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FrequencyBand, HeatmapCell } from '../../types/simulation';
import { Layers, Info, Filter, Radio, Activity, FileText } from 'lucide-react';

interface TimeFrequencyHeatmapProps {
  bands: FrequencyBand[];
  history: HeatmapCell[][];
  timeStep: number;
}

export const TimeFrequencyHeatmap: React.FC<TimeFrequencyHeatmapProps> = ({
  bands,
  history,
  timeStep,
}) => {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'scanned_only' | 'hits_only'>('all');
  const [viewMode, setViewMode] = useState<'waterfall' | 'psd_scope' | 'pdw_stream'>('waterfall');

  const columnsCount = history.length;

  // Compute power color gradient for realistic RF waterfall
  const getRfColorClass = (cell: HeatmapCell) => {
    if (cell.wasHit) {
      return 'bg-gradient-to-t from-cyan-400 to-white shadow-[0_0_8px_#22d3ee] ring-1 ring-cyan-200 z-10';
    }
    if (cell.hasSignal) {
      // Map energyDbm: -92 dBm (weak) to -25 dBm (strong mainlobe)
      const energy = cell.energyDbm ?? -50;
      if (energy > -35) {
        return 'bg-rose-500 shadow-[0_0_6px_#f43f5e] border border-rose-400/80';
      } else if (energy > -50) {
        return 'bg-amber-500 shadow-[0_0_4px_#f59e0b] border border-amber-400/60';
      } else if (energy > -70) {
        return 'bg-emerald-500 border border-emerald-400/50';
      } else {
        return 'bg-teal-700/80 border border-teal-500/40';
      }
    }
    if (cell.wasScanned) {
      return 'bg-blue-600/35 border border-cyan-400/50';
    }
    if (cell.wasPredicted) {
      return 'bg-amber-950/40 border border-amber-600/30';
    }
    return 'bg-[#060b17] hover:bg-slate-800/80 border border-slate-900/60';
  };

  // Generate synthetic Pulse Descriptor Words (PDWs) from recent intercepted hits
  const recentIntercepts: Array<{
    toaStep: number;
    bandName: string;
    freqMHz: number;
    powerDbm: number;
    snrDb: number;
    modulation: string;
    pulseWidthUs: number;
    priUs: number;
    status: 'CONFIRMED' | 'UNCERTAIN';
  }> = [];

  history.slice(-12).forEach((col) => {
    col.forEach((c) => {
      if (c.wasHit) {
        const b = bands[c.bandIndex];
        recentIntercepts.push({
          toaStep: c.timeStep,
          bandName: b?.name || `B${c.bandIndex + 1}`,
          freqMHz: b?.centerFreqMHz || 1500,
          powerDbm: c.energyDbm || -38,
          snrDb: b?.snrDb || Number((Math.max(2, (c.energyDbm || -40) - (b?.noiseFloorDbm || -92))).toFixed(1)),
          modulation: b?.activeModulation || 'Linear FM Chirp',
          pulseWidthUs: b?.bandwidthMHz ? Number((1000 / b.bandwidthMHz * 1.5).toFixed(1)) : 12.5,
          priUs: 800 + (c.bandIndex % 5) * 250,
          status: 'CONFIRMED',
        });
      }
    });
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-[#070b16] p-4 flex flex-col space-y-3 shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-sm font-bold text-slate-100 uppercase tracking-wider">
                Electronic Support RF Spectrum Visualizer
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/50 text-emerald-300">
                500 MHz – 3500 MHz Real-Time
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              High-fidelity synthetic time-frequency spectrum with thermal noise floor (-92 dBm), beam scanning, and LO PLL lock dynamics
            </p>
          </div>
        </div>

        {/* View Mode & Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Modes */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setViewMode('waterfall')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'waterfall'
                  ? 'bg-cyan-500/25 text-cyan-200 font-bold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Waterfall</span>
            </button>
            <button
              onClick={() => setViewMode('psd_scope')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'psd_scope'
                  ? 'bg-cyan-500/25 text-cyan-200 font-bold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>RF Scope (PSD)</span>
            </button>
            <button
              onClick={() => setViewMode('pdw_stream')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'pdw_stream'
                  ? 'bg-cyan-500/25 text-cyan-200 font-bold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDW Stream</span>
            </button>
          </div>

          {/* Filter mode (for waterfall) */}
          {viewMode === 'waterfall' && (
            <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
              <Filter className="w-3 h-3 text-slate-500 ml-1.5" />
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterMode === 'all' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('scanned_only')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterMode === 'scanned_only' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Scanned
              </button>
              <button
                onClick={() => setFilterMode('hits_only')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterMode === 'hits_only' ? 'bg-slate-800 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hits
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: 2D WATERFALL SPECTROGRAM */}
      {viewMode === 'waterfall' && (
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800">
          <div className="min-w-[700px] bg-[#040711] border border-slate-900 rounded-lg p-3">
            {columnsCount === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-xs">
                Waiting for simulation steps to populate spectrum history...
              </div>
            ) : (
              <div className="flex flex-col space-y-1">
                {/* Row per Band */}
                {bands.map((band, bandIdx) => (
                  <div key={band.id} className="flex items-center gap-1.5">
                    {/* Row Label (Band Name & Frequency) */}
                    <div className="w-16 text-right pr-1 flex items-center justify-end gap-1">
                      <span
                        className={`text-[10px] font-mono ${
                          band.isCurrentlyScanned
                            ? 'text-cyan-300 font-bold glow-cyan'
                            : band.trueActivity
                            ? 'text-emerald-400 font-semibold'
                            : 'text-slate-500'
                        }`}
                      >
                        {band.name}
                      </span>
                      <span className="text-[8px] font-mono text-slate-600 hidden sm:inline">
                        {band.centerFreqMHz}M
                      </span>
                    </div>

                    {/* Horizontal Time Cells for this band */}
                    <div className="flex-1 flex items-center gap-1">
                      {history.map((colCells, colIdx) => {
                        const cell = colCells[bandIdx];
                        if (!cell) return null;

                        let shouldDim = false;
                        if (filterMode === 'scanned_only' && !cell.wasScanned) shouldDim = true;
                        if (filterMode === 'hits_only' && !cell.wasHit) shouldDim = true;

                        const bgClass = getRfColorClass(cell);

                        return (
                          <button
                            key={`${colIdx}-${bandIdx}`}
                            onClick={() => setSelectedCell(cell)}
                            onMouseEnter={() => setSelectedCell(cell)}
                            className={`flex-1 h-3.5 rounded-xs transition-all duration-100 relative ${bgClass} ${
                              shouldDim ? 'opacity-20' : 'opacity-100'
                            }`}
                            aria-label={`Time ${cell.timeStep}, Band ${band.name}`}
                          >
                            {cell.wasHit && (
                              <span className="absolute inset-0 flex items-center justify-center text-[7px] text-slate-950 font-black">
                                ✕
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Time Axis (X-Axis at bottom) */}
                <div className="flex items-center gap-1.5 pt-2 text-[10px] font-mono text-slate-500 border-t border-slate-900 mt-2">
                  <div className="w-16 text-right pr-1">TIME →</div>
                  <div className="flex-1 flex justify-between px-1">
                    <span>T - {columnsCount} steps</span>
                    <span>T - {Math.round(columnsCount / 2)}</span>
                    <span className="text-cyan-400 font-semibold">T = {timeStep} (CURRENT DWELL)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: REAL-TIME RF SPECTRUM SCOPE (PSD) */}
      {viewMode === 'psd_scope' && (
        <div className="w-full bg-[#030611] border border-slate-900 rounded-xl p-4 font-mono space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">RF Spectrum Analyzer Display</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">RBW: 100 kHz</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Span: 500 – 3500 MHz</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-slate-300">Receiver LO Lock Cursor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-rose-500" />
                <span className="text-slate-400">Neyman-Pearson Threshold (-78 dBm)</span>
              </div>
            </div>
          </div>

          {/* SVG Power Spectral Density Plot */}
          <div className="h-56 w-full relative bg-[#02040a] border border-cyan-950 rounded-lg overflow-hidden flex flex-col justify-between p-2">
            <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

            {/* Threshold Line at ~ -78 dBm */}
            <div className="absolute left-0 right-0 top-16 border-b border-dashed border-rose-500/70 z-10 flex justify-end pr-2 text-[9px] text-rose-400">
              Detection Threshold (P_fa = 2.5%)
            </div>

            {/* Noise Floor Marker at ~ -92 dBm */}
            <div className="absolute left-0 right-0 bottom-8 border-b border-slate-800 z-10 flex justify-between px-2 text-[9px] text-slate-500">
              <span>Thermal Noise Floor ~ -92 dBm (kTB + NF)</span>
              <span>Rayleigh Ground Noise</span>
            </div>

            {/* Spectrum Energy Trace Columns across 24 bands */}
            <div className="relative z-10 flex-1 flex items-end gap-1 px-1">
              {bands.map((band) => {
                const energy = band.signalEnergyDbm ?? -92;
                // Height scaled from -100 dBm (0%) to -15 dBm (100%)
                const heightPercent = Math.max(8, Math.min(98, ((energy + 100) / 85) * 100));
                const isScanned = band.isCurrentlyScanned;
                const isHit = isScanned && band.trueActivity;

                return (
                  <div
                    key={band.id}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    title={`${band.name} (${band.centerFreqMHz} MHz): ${energy} dBm, SNR: ${band.snrDb || 0} dB`}
                  >
                    {/* Active Emitter Peak Tag on hover or hit */}
                    {(band.trueActivity || isScanned) && (
                      <div className="text-[8px] font-mono truncate px-1 rounded bg-slate-900/90 text-cyan-300 -mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {energy} dBm
                      </div>
                    )}

                    {/* Peak Bar */}
                    <div
                      className={`w-full rounded-t transition-all duration-150 ${
                        isHit
                          ? 'bg-gradient-to-t from-cyan-600 via-sky-400 to-white shadow-[0_0_12px_#22d3ee]'
                          : band.trueActivity
                          ? energy > -40
                            ? 'bg-gradient-to-t from-emerald-600 to-rose-400 shadow-[0_0_8px_#f43f5e]'
                            : 'bg-gradient-to-t from-slate-900 to-emerald-400 shadow-[0_0_6px_#10b981]'
                          : isScanned
                          ? 'bg-gradient-to-t from-slate-900 to-blue-500 shadow-[0_0_6px_#3b82f6]'
                          : 'bg-gradient-to-t from-[#050b18] to-slate-800'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />

                    {/* Receiver LO Cursor below */}
                    {isScanned && (
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 animate-ping" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Frequency Axis scale */}
            <div className="relative z-10 border-t border-slate-800 pt-1 flex justify-between text-[9px] text-slate-500">
              <span>500 MHz</span>
              <span>1250 MHz (L-Band)</span>
              <span>2000 MHz</span>
              <span>2750 MHz (S-Band)</span>
              <span>3500 MHz</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: PULSE DESCRIPTOR WORD (PDW) REAL-TIME LOG */}
      {viewMode === 'pdw_stream' && (
        <div className="w-full bg-[#030611] border border-slate-900 rounded-xl p-4 font-mono space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">Pulse Descriptor Word (PDW) Telemetry Stream</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                ES Receiver Video Digitizer
              </span>
            </div>
            <span className="text-slate-500 text-[11px]">{recentIntercepts.length} Captured PDWs</span>
          </div>

          {recentIntercepts.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-slate-500 text-xs">
              No radar pulses intercepted yet. Run simulation to trigger receiver dwell intercepts.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 text-xs">
              <div className="grid grid-cols-8 gap-2 px-2 py-1 bg-slate-900/80 text-slate-400 text-[10px] font-bold rounded uppercase">
                <span>TOA (Step)</span>
                <span>Band</span>
                <span>Freq (MHz)</span>
                <span>Power (dBm)</span>
                <span>SNR (dB)</span>
                <span>PW (µs)</span>
                <span>PRI (µs)</span>
                <span>Modulation</span>
              </div>
              {recentIntercepts.map((pdw, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-8 gap-2 px-2 py-1.5 rounded bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/60 text-[11px] text-slate-300 transition-colors items-center"
                >
                  <span className="text-cyan-400 font-semibold">T+{pdw.toaStep}</span>
                  <span className="font-bold text-slate-200">{pdw.bandName}</span>
                  <span>{pdw.freqMHz} MHz</span>
                  <span className={pdw.powerDbm > -40 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {pdw.powerDbm} dBm
                  </span>
                  <span className="text-emerald-300 font-semibold">+{pdw.snrDb} dB</span>
                  <span>{pdw.pulseWidthUs} µs</span>
                  <span>{pdw.priUs} µs</span>
                  <span className="text-cyan-200 truncate">{pdw.modulation}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Cell Inspection Details */}
      <div className="min-h-[46px] p-2.5 rounded-lg bg-[#040813] border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300">
        {selectedCell ? (
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60">
                {bands[selectedCell.bandIndex]?.name} ({bands[selectedCell.bandIndex]?.centerFreqMHz} MHz)
              </span>
              <span className="text-slate-400">Step: T={selectedCell.timeStep}</span>
              <span className="text-slate-500">
                Noise: {bands[selectedCell.bandIndex]?.noiseFloorDbm || -92} dBm
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-slate-500">Power: </span>
                <span className={selectedCell.hasSignal ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {selectedCell.energyDbm} dBm
                </span>
              </div>

              <div>
                <span className="text-slate-500">SNR: </span>
                <span className="text-cyan-300 font-bold">
                  +{bands[selectedCell.bandIndex]?.snrDb || 0} dB
                </span>
              </div>

              <div>
                <span className="text-slate-500">LO Lock Settling: </span>
                <span className="text-slate-300">
                  {bands[selectedCell.bandIndex]?.loSettlingDelayUs || 15} µs
                </span>
              </div>

              <div>
                <span className="text-slate-500">Outcome: </span>
                <span
                  className={
                    selectedCell.wasHit
                      ? 'text-cyan-300 font-bold uppercase'
                      : selectedCell.wasScanned && !selectedCell.hasSignal
                      ? 'text-slate-400'
                      : 'text-amber-400'
                  }
                >
                  {selectedCell.wasHit
                    ? 'HIT (Signal Intercepted)'
                    : selectedCell.hasSignal
                    ? 'MISSED PULSE'
                    : 'CLEAN NOISE'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Hover or click on any heatmap cell to view historical time-frequency interception details.</span>
          </div>
        )}
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400 pt-1">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#060b17] border border-slate-800" />
            <span>Thermal Noise Floor (~ -92 dBm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 border border-emerald-400/50" />
            <span>Radar Sidelobe/Moderate (-60 dBm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <span>Mainlobe Peak (-30 dBm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            <span>Receiver Intercept (HIT)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-blue-600/35 border border-cyan-400/50" />
            <span>Observation (Empty)</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500">
          Showing rolling window of past {columnsCount} steps
        </div>
      </div>
    </div>
  );
};
