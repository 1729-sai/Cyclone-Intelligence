import React, { useState } from 'react';
import { FeatureImportance } from '../types/cyclone';
import { Sliders, AlertCircle, BarChart3, RefreshCw } from 'lucide-react';

interface AIExplainabilityProps {
  features: FeatureImportance[];
  baseProbability: number;
}

export const AIExplainability: React.FC<AIExplainabilityProps> = ({
  features,
}) => {
  const [simSST, setSimSST] = useState<number>(29.4);
  const [simShear, setSimShear] = useState<number>(8);
  const [simMoisture, setSimMoisture] = useState<number>(82);

  const calculateSimulatedProb = () => {
    const sstDelta = (simSST - 26.5) / (30.0 - 26.5);
    const shearPenalty = Math.max(0, (simShear - 5) / 25);
    const moistureFactor = simMoisture / 100;

    let prob = (sstDelta * 0.45 + (1 - shearPenalty) * 0.35 + moistureFactor * 0.20) * 100;
    return Math.min(96, Math.max(8, Math.round(prob)));
  };

  const simulatedProb = calculateSimulatedProb();

  const resetSimulation = () => {
    setSimSST(29.4);
    setSimShear(8);
    setSimMoisture(82);
  };

  return (
    <div className="w-full rounded border border-slate-200 bg-white p-5 shadow-xs">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-600" />
            <h3 className="text-base font-bold font-mono tracking-wider text-slate-900 uppercase">
              Why is the AI detecting intensification?
            </h3>
          </div>
          <p className="mt-1 text-xs font-mono text-slate-600">
            SHAP (SHapley Additive exPlanations) attribution &amp; Gradient Sensitivity Decomposition
          </p>
        </div>

        {/* Clear Demo Label */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-800 bg-amber-50 px-3 py-1 rounded border border-amber-200 self-start sm:self-auto font-semibold">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Demo / Simulated Model Output</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Left Column: Feature Importance Ranking */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-1 font-semibold">
            <span className="uppercase tracking-wider">Predictive Factor</span>
            <span>SHAP Relative Importance</span>
          </div>

          <div className="space-y-3">
            {features.map((item, idx) => (
              <div key={item.factor} className="p-3.5 rounded border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-sky-700 font-bold">#{idx + 1}</span>
                    <span className="text-slate-900 font-bold">{item.factor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Observed: <strong className="text-sky-700 font-bold">{item.currentValue}</strong>
                    </span>
                    <span className="text-base font-bold font-mono text-sky-700 tabular-nums">
                      {item.weight}%
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="mt-2 w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-700"
                    style={{ width: `${item.weight * 2.8}%` }}
                  ></div>
                </div>

                <div className="mt-2 text-[11px] font-mono text-slate-600 leading-snug">
                  {item.description} (Climatological Baseline: {item.baseline})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Sensitivity "What-If" Simulator */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded border border-slate-200 bg-slate-50 p-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-mono">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-600" />
                <span>Sensitivity Sandbox ("What-If")</span>
              </span>
              <button
                onClick={resetSimulation}
                className="text-slate-500 hover:text-sky-700 flex items-center gap-1 text-[11px] font-semibold"
                title="Reset to real observations"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] font-mono text-slate-600 leading-relaxed">
              Test how environmental shifts impact AI Rapid Intensification (RI) probability in real-time.
            </p>

            {/* Slider 1: Sea Surface Temp */}
            <div className="mt-4 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Sea Surface Temp (SST):</span>
                <span className="text-amber-700 font-bold tabular-nums">{simSST.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="26.0"
                max="31.0"
                step="0.1"
                value={simSST}
                onChange={(e) => setSimSST(parseFloat(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>26.0°C (Threshold)</span>
                <span>31.0°C (Extreme)</span>
              </div>
            </div>

            {/* Slider 2: Vertical Wind Shear */}
            <div className="mt-3.5 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Vertical Wind Shear:</span>
                <span className="text-sky-700 font-bold tabular-nums">{simShear} knots</span>
              </div>
              <input
                type="range"
                min="4"
                max="30"
                step="1"
                value={simShear}
                onChange={(e) => setSimShear(parseInt(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>4 kt (Calm)</span>
                <span>30 kt (Disruptive)</span>
              </div>
            </div>

            {/* Slider 3: Atmospheric Moisture */}
            <div className="mt-3.5 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>700-500 hPa Relative Humidity:</span>
                <span className="text-emerald-700 font-bold tabular-nums">{simMoisture}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="1"
                value={simMoisture}
                onChange={(e) => setSimMoisture(parseInt(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>40% (Dry Air)</span>
                <span>95% (Saturated)</span>
              </div>
            </div>
          </div>

          {/* Recomputed Outcome Card */}
          <div className="mt-5 p-3.5 rounded border border-slate-200 bg-white font-mono shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase text-slate-500 font-bold">
                Simulated RI Probability
              </span>
              <span
                className={`text-2xl font-bold tabular-nums ${
                  simulatedProb >= 70
                    ? 'text-rose-600'
                    : simulatedProb >= 40
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {simulatedProb}%
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-700 font-medium leading-snug">
              {simulatedProb >= 70
                ? 'High Intensification Risk: Strong thermodynamic forcing overcomes weak shear.'
                : simulatedProb >= 40
                ? 'Moderate / Steady State: Marginal environmental balance.'
                : 'Rapid Weakening / Shear Tilt: Convective core decoupling projected.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
