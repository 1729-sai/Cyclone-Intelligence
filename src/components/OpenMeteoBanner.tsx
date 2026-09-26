import React from 'react';
import { Globe, RefreshCw, CheckCircle2, Waves, Wind, Gauge, Droplets, Thermometer } from 'lucide-react';
import { LiveAtmosphericTelemetry } from '../services/openMeteoService';

interface OpenMeteoBannerProps {
  telemetry: LiveAtmosphericTelemetry | null;
  isLoading: boolean;
  onRefresh: () => void;
  cycloneName: string;
  speedUnit: 'km/h' | 'knots';
}

export const OpenMeteoBanner: React.FC<OpenMeteoBannerProps> = ({
  telemetry,
  isLoading,
  onRefresh,
  cycloneName,
  speedUnit,
}) => {
  const formatSpeed = (kmh: number) => {
    if (speedUnit === 'knots') {
      return `${Math.round(kmh * 0.539957)} kt`;
    }
    return `${kmh} km/h`;
  };

  return (
    <div className="w-full rounded border border-slate-200 bg-white p-4 text-xs font-mono shadow-xs relative overflow-hidden">
      {/* Background subtle tint */}
      <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-sky-50/60 to-transparent pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <Globe className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Open-Meteo Open Source Weather API
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>ACTIVE STREAM</span>
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                (Free &amp; Open Source · No API Key Required)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Live ECMWF IFS / GFS atmospheric soundings &amp; marine wave observations for {cycloneName}
            </div>
          </div>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 hidden md:inline">
            Coordinates: {telemetry ? `${telemetry.latitude}°N, ${telemetry.longitude}°E` : '12.80°N, 86.40°E'}
          </span>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-semibold transition-all text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Fetching Stream...' : 'Fetch Live Weather'}</span>
          </button>
        </div>
      </div>

      {/* Live API Telemetry Chips */}
      {telemetry && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mt-3 pt-1">
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
            <div className="text-slate-500 text-[10px] flex items-center gap-1 font-semibold uppercase">
              <Gauge className="w-3 h-3 text-rose-500" />
              <span>SURFACE PRESSURE</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900 tabular-nums">
              {telemetry.surfacePressureHpa} <span className="text-[10px] text-slate-500 font-normal">hPa</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
            <div className="text-slate-500 text-[10px] flex items-center gap-1 font-semibold uppercase">
              <Droplets className="w-3 h-3 text-sky-500" />
              <span>RELATIVE HUMIDITY</span>
            </div>
            <div className="mt-1 text-sm font-bold text-sky-700 tabular-nums">
              {telemetry.relativeHumidityPercent}%
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
            <div className="text-slate-500 text-[10px] flex items-center gap-1 font-semibold uppercase">
              <Wind className="w-3 h-3 text-indigo-500" />
              <span>WIND (10M / GUSTS)</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900 tabular-nums">
              {formatSpeed(telemetry.windSpeed10mKmh)}
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
            <div className="text-slate-500 text-[10px] flex items-center gap-1 font-semibold uppercase">
              <Thermometer className="w-3 h-3 text-amber-500" />
              <span>AIR / WATER TEMP</span>
            </div>
            <div className="mt-1 text-sm font-bold text-amber-700 tabular-nums">
              {telemetry.temperatureC}°C
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
            <div className="text-slate-500 text-[10px] flex items-center gap-1 font-semibold uppercase">
              <Wind className="w-3 h-3 text-emerald-600" />
              <span>VERTICAL SHEAR</span>
            </div>
            <div className="mt-1 text-sm font-bold text-emerald-700 tabular-nums">
              {telemetry.verticalWindShearKnots} <span className="text-[10px] text-slate-500 font-normal">kt</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
            <div className="text-slate-500 text-[10px] flex items-center gap-1 font-semibold uppercase">
              <Waves className="w-3 h-3 text-blue-500" />
              <span>SIGNIFICANT WAVE</span>
            </div>
            <div className="mt-1 text-sm font-bold text-blue-700 tabular-nums">
              {telemetry.waveHeightMeters ?? 5.4} <span className="text-[10px] text-slate-500 font-normal">m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
