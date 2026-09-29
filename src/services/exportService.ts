/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ExportService — Export simulation data as CSV, JSON, or generate printable reports.
 */

import {
  FrequencyBand,
  MetricSnapshot,
  HeatmapCell,
  SyntheticEmitter,
  ConfusionMatrix,
  RewardWeights,
  ScenarioPreset,
  LearningEvent,
} from '../types/simulation';

export interface ExportableSimulationData {
  timestamp: string;
  scenarioName: string;
  timeStep: number;
  bands: FrequencyBand[];
  emitters: SyntheticEmitter[];
  adaptiveMetrics: MetricSnapshot;
  baselineMetrics: MetricSnapshot;
  adaptiveHistory: MetricSnapshot[];
  baselineHistory: MetricSnapshot[];
  adaptiveConfusion: ConfusionMatrix;
  heatmapHistory: HeatmapCell[][];
  learningEvents: LearningEvent[];
  weights: RewardWeights;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/**
 * Export metric history as CSV
 */
export function exportMetricsCSV(
  adaptiveHistory: MetricSnapshot[],
  baselineHistory: MetricSnapshot[],
  scenarioName: string
) {
  const headers = [
    'timeStep',
    'adaptive_pd',
    'adaptive_falseAlarmRate',
    'adaptive_avgDelay',
    'adaptive_reward',
    'adaptive_hits',
    'adaptive_misses',
    'adaptive_scanEfficiency',
    'baseline_pd',
    'baseline_falseAlarmRate',
    'baseline_avgDelay',
    'baseline_reward',
    'baseline_hits',
    'baseline_misses',
    'baseline_scanEfficiency',
  ];

  const rows = adaptiveHistory.map((a, i) => {
    const b = baselineHistory[i] || ({} as Partial<MetricSnapshot>);
    return [
      a.timeStep,
      a.probabilityOfDetection.toFixed(2),
      a.falseAlarmRate.toFixed(2),
      a.averageDetectionDelay.toFixed(2),
      a.averageReward.toFixed(4),
      a.hits,
      a.misses,
      a.scanEfficiency.toFixed(4),
      (b.probabilityOfDetection ?? 0).toFixed(2),
      (b.falseAlarmRate ?? 0).toFixed(2),
      (b.averageDetectionDelay ?? 0).toFixed(2),
      (b.averageReward ?? 0).toFixed(4),
      b.hits ?? 0,
      b.misses ?? 0,
      (b.scanEfficiency ?? 0).toFixed(4),
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `vayu-netra_metrics_${formatTimestamp()}.csv`);
}

/**
 * Export current band states as CSV
 */
export function exportBandsCSV(bands: FrequencyBand[]) {
  const headers = [
    'bandNumber',
    'name',
    'startFreqMHz',
    'endFreqMHz',
    'centerFreqMHz',
    'bandwidthMHz',
    'trueActivity',
    'signalEnergyDbm',
    'predictedProbability',
    'priorityScore',
    'lastObservedTimeStep',
    'observationCount',
    'hitCount',
    'missCount',
    'historicalDetectionRate',
    'isCurrentlyScanned',
    'status',
  ];

  const rows = bands.map((b) =>
    [
      b.bandNumber,
      b.name,
      b.startFreqMHz,
      b.endFreqMHz,
      b.centerFreqMHz,
      b.bandwidthMHz,
      b.trueActivity,
      b.signalEnergyDbm.toFixed(2),
      b.predictedProbability.toFixed(4),
      b.priorityScore.toFixed(4),
      b.lastObservedTimeStep,
      b.observationCount,
      b.hitCount,
      b.missCount,
      b.historicalDetectionRate.toFixed(4),
      b.isCurrentlyScanned,
      b.status,
    ].join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `vayu-netra_bands_${formatTimestamp()}.csv`);
}

/**
 * Export emitter configuration as CSV
 */
export function exportEmittersCSV(emitters: SyntheticEmitter[]) {
  const headers = [
    'id',
    'name',
    'type',
    'pattern',
    'frequencyMHz',
    'bandwidthMHz',
    'powerDbm',
    'active',
    'bandIndex',
    'period',
    'dutyCycle',
    'modulation',
    'priMicrosec',
    'pulseWidthMicrosec',
    'snrDb',
    'tacticalRole',
    'scanType',
  ];

  const rows = emitters.map((e) =>
    [
      e.id,
      `"${e.name}"`,
      e.type,
      e.pattern,
      e.frequencyMHz,
      e.bandwidthMHz,
      e.powerDbm,
      e.active,
      e.bandIndex,
      e.period,
      e.dutyCycle,
      e.modulationType || e.modulation || '',
      e.priMicrosec || e.priUs || '',
      e.pulseWidthMicrosec || e.pulseWidthUs || '',
      e.snrDb || '',
      e.tacticalRole || '',
      e.scanType || '',
    ].join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `vayu-netra_emitters_${formatTimestamp()}.csv`);
}

/**
 * Export full simulation snapshot as JSON
 */
export function exportFullJSON(data: ExportableSimulationData) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `vayu-netra_snapshot_${formatTimestamp()}.json`);
}

/**
 * Export learning events log as CSV
 */
export function exportLearningEventsCSV(events: LearningEvent[]) {
  const headers = [
    'id',
    'timeStep',
    'bandName',
    'type',
    'predictedProb',
    'actualState',
    'rewardEarned',
    'modelDelta',
    'timestamp',
  ];

  const rows = events.map((e) =>
    [
      e.id,
      e.timeStep,
      e.bandName,
      e.type,
      e.predictedProb.toFixed(4),
      e.actualState,
      e.rewardEarned.toFixed(4),
      `"${e.modelDelta}"`,
      e.timestamp,
    ].join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `vayu-netra_learning_events_${formatTimestamp()}.csv`);
}

/**
 * Generate and download an HTML report
 */
export function exportHTMLReport(data: ExportableSimulationData) {
  const am = data.adaptiveMetrics;
  const bm = data.baselineMetrics;
  const ac = data.adaptiveConfusion;
  const improvement = bm.averageDetectionDelay > 0
    ? (((bm.averageDetectionDelay - am.averageDetectionDelay) / bm.averageDetectionDelay) * 100).toFixed(1)
    : 'N/A';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vayu-Netra Simulation Report — ${data.scenarioName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; }
    .report { max-width: 900px; margin: 0 auto; }
    h1 { font-size: 28px; color: #22d3ee; margin-bottom: 8px; }
    h2 { font-size: 20px; color: #94a3b8; margin: 32px 0 12px; border-bottom: 1px solid #334155; padding-bottom: 8px; }
    .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; color: #94a3b8; margin-bottom: 24px; }
    .meta span { color: #e2e8f0; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
    th { background: #1e293b; color: #22d3ee; text-align: left; padding: 10px 12px; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    td { padding: 8px 12px; border-bottom: 1px solid #1e293b; }
    tr:nth-child(even) td { background: #0f172a; }
    .highlight { color: #22d3ee; font-weight: 700; }
    .good { color: #4ade80; }
    .warn { color: #fbbf24; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .badge-green { background: #064e3b; color: #6ee7b7; }
    .badge-amber { background: #451a03; color: #fcd34d; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #334155; font-size: 11px; color: #475569; text-align: center; }
  </style>
</head>
<body>
  <div class="report">
    <h1>⚡ Vayu-Netra Simulation Report</h1>
    <p class="subtitle">Adaptive ML Scheduler Performance Analysis — Electronic Warfare Spectrum Surveillance</p>

    <div class="meta">
      <div>Scenario: <span>${data.scenarioName}</span></div>
      <div>Time Steps: <span>${data.timeStep}</span></div>
      <div>Report Generated: <span>${data.timestamp}</span></div>
      <div>Frequency Bands: <span>${data.bands.length}</span></div>
      <div>Active Emitters: <span>${data.emitters.filter(e => e.active).length} / ${data.emitters.length}</span></div>
      <div>Detection Delay Improvement: <span class="good">${improvement}%</span></div>
    </div>

    <h2>📊 Key Performance Metrics</h2>
    <table>
      <thead>
        <tr><th>Metric</th><th>Adaptive ML</th><th>Baseline (Sweep)</th><th>Improvement</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Probability of Detection (P_d)</td>
          <td class="highlight">${am.probabilityOfDetection.toFixed(1)}%</td>
          <td>${bm.probabilityOfDetection.toFixed(1)}%</td>
          <td class="good">+${(am.probabilityOfDetection - bm.probabilityOfDetection).toFixed(1)}%</td>
        </tr>
        <tr>
          <td>False Alarm Rate (P_fa)</td>
          <td>${am.falseAlarmRate.toFixed(1)}%</td>
          <td>${bm.falseAlarmRate.toFixed(1)}%</td>
          <td>${am.falseAlarmRate < bm.falseAlarmRate ? '<span class="good">Better</span>' : '<span class="warn">Worse</span>'}</td>
        </tr>
        <tr>
          <td>Avg Detection Delay (steps)</td>
          <td class="highlight">${am.averageDetectionDelay.toFixed(2)}</td>
          <td>${bm.averageDetectionDelay.toFixed(2)}</td>
          <td class="good">${improvement}% faster</td>
        </tr>
        <tr>
          <td>Avg Reward / Step</td>
          <td>${am.averageReward.toFixed(4)}</td>
          <td>${bm.averageReward.toFixed(4)}</td>
          <td>${am.averageReward > bm.averageReward ? '<span class="good">Higher</span>' : '<span class="warn">Lower</span>'}</td>
        </tr>
        <tr>
          <td>Scan Efficiency (Hits/Scans)</td>
          <td>${(am.scanEfficiency * 100).toFixed(1)}%</td>
          <td>${(bm.scanEfficiency * 100).toFixed(1)}%</td>
          <td>${am.scanEfficiency > bm.scanEfficiency ? '<span class="good">Better</span>' : '—'}</td>
        </tr>
      </tbody>
    </table>

    <h2>🔲 Confusion Matrix (Adaptive ML)</h2>
    <table>
      <thead><tr><th></th><th>Predicted Active</th><th>Predicted Idle</th></tr></thead>
      <tbody>
        <tr><td><strong>Actually Active</strong></td><td class="good">${ac.tp} (TP)</td><td class="warn">${ac.fn} (FN)</td></tr>
        <tr><td><strong>Actually Idle</strong></td><td class="warn">${ac.fp} (FP)</td><td>${ac.tn} (TN)</td></tr>
      </tbody>
    </table>
    <p style="font-size:12px; color:#94a3b8; margin-top:8px;">
      Precision: ${(ac.precision * 100).toFixed(1)}% · Recall: ${(ac.recall * 100).toFixed(1)}% · F1: ${(ac.f1Score * 100).toFixed(1)}% · Accuracy: ${(ac.accuracy * 100).toFixed(1)}%
    </p>

    <h2>📻 Emitter Summary</h2>
    <table>
      <thead><tr><th>Name</th><th>Type</th><th>Freq (MHz)</th><th>Power (dBm)</th><th>Status</th></tr></thead>
      <tbody>
        ${data.emitters.map(e => `<tr>
          <td>${e.name}</td>
          <td>${e.type}</td>
          <td>${e.frequencyMHz}</td>
          <td>${e.powerDbm}</td>
          <td><span class="badge ${e.active ? 'badge-green' : 'badge-amber'}">${e.active ? 'RADIATING' : 'OFF'}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>

    <h2>⚙️ Reward Weights</h2>
    <table>
      <thead><tr><th>Parameter</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Detection Benefit</td><td>${data.weights.detectionBenefit}</td></tr>
        <tr><td>Scan Cost</td><td>${data.weights.scanCost}</td></tr>
        <tr><td>Delay Cost</td><td>${data.weights.delayCost}</td></tr>
        <tr><td>False Alarm Penalty</td><td>${data.weights.falseAlarmPenalty}</td></tr>
      </tbody>
    </table>

    <div class="footer">
      Vayu-Netra Defense Technology Platform — Simulation Research Report<br>
      This report was auto-generated from in-browser simulation data. All signals are synthetic.
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  downloadBlob(blob, `vayu-netra_report_${formatTimestamp()}.html`);
}
