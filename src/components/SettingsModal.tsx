import React from 'react';
import { X, Sliders, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  speedUnit: 'km/h' | 'knots';
  onToggleSpeedUnit: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  speedUnit,
  onToggleSpeedUnit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded border border-slate-200 bg-white shadow-2xl p-5 text-xs font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            <span className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Geospatial Intelligence Settings
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 mt-4 text-slate-700">
          {/* Unit selection */}
          <div>
            <label className="text-slate-500 uppercase text-[11px] block mb-1.5 font-bold">
              Wind Velocity Metric
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => speedUnit !== 'km/h' && onToggleSpeedUnit()}
                className={`py-2 px-3 rounded border text-center font-bold ${
                  speedUnit === 'km/h'
                    ? 'border-sky-300 bg-sky-50 text-sky-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                km/h (SI Standard)
              </button>
              <button
                onClick={() => speedUnit !== 'knots' && onToggleSpeedUnit()}
                className={`py-2 px-3 rounded border text-center font-bold ${
                  speedUnit === 'knots'
                    ? 'border-sky-300 bg-sky-50 text-sky-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                knots (Maritime / Aviation)
              </button>
            </div>
          </div>

          {/* Data Feed Source */}
          <div>
            <label className="text-slate-500 uppercase text-[11px] block mb-1.5 font-bold">
              Primary Meteorological API
            </label>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between font-medium">
              <span>Open-Meteo Open Source Weather API</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Active
              </span>
            </div>
          </div>

          {/* Model Confidence Threshold */}
          <div>
            <label className="text-slate-500 uppercase text-[11px] block mb-1.5 font-bold">
              Rapid Intensification (RI) Trigger Threshold
            </label>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span>Wind Delta: +30 knots / 24 hr</span>
              <span className="text-rose-600 font-bold">Standard RI</span>
            </div>
          </div>

          {/* Map Projection */}
          <div>
            <label className="text-slate-500 uppercase text-[11px] block mb-1.5 font-bold">
              Cartographic Projection
            </label>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span>Mercator Conformal (WGS84)</span>
              <span className="text-sky-700 font-bold">Fixed</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-700 text-white font-bold transition-colors shadow-xs"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
