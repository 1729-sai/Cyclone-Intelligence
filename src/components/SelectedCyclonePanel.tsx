import React from 'react';
import { Cyclone } from '../types/cyclone';
import { 
  Navigation, 
  Wind, 
  Gauge, 
  MapPin, 
  Flame,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface SelectedCyclonePanelProps {
  cyclone: Cyclone;
  speedUnit: 'km/h' | 'knots';
}

export const SelectedCyclonePanel: React.FC<SelectedCyclonePanelProps> = ({
  cyclone,
  speedUnit,
}) => {
  const formatSpeed = (kmh: number) => {
    if (speedUnit === 'knots') {
      return `${Math.round(kmh * 0.539957)} kt`;
    }
    return `${kmh} km/h`;
  };

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cyclone.aiConfidence / 100) * circumference;

  return (
    <div className="w-full rounded border border-slate-200 bg-white p-5 shadow-xs transition-all">
      {/* Top Banner / System Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-700 font-semibold">
              Active System Focus
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] font-mono text-slate-500">
              {cyclone.basin}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 flex items-center gap-3">
            <span>{cyclone.name}</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              {cyclone.status}
            </span>
          </h2>
          <p className="mt-1 text-xs font-mono text-slate-600">
            Classification: <span className="text-sky-800 font-bold">{cyclone.category}</span>
          </p>
        </div>

        {/* AI Confidence Circular Ring Visualization */}
        <div className="flex items-center gap-3.5 bg-slate-50 p-2.5 rounded border border-slate-200 shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
              {/* Background ring */}
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Progress ring */}
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="stroke-sky-600 transition-all duration-1000 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {cyclone.aiConfidence}%
              </span>
              <span className="text-[8px] font-mono uppercase text-slate-500 font-semibold">
                Confidence
              </span>
            </div>
          </div>
          <div className="flex flex-col text-xs font-mono">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Model Ensemble</span>
            <span className="text-sky-800 font-bold">Bayesian Convective Net</span>
            <span className="text-slate-500 text-[10px] mt-1 font-medium">RI Score: {cyclone.rapidIntensificationProbability}% Prob</span>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {/* Current Position */}
        <div className="p-3 rounded border border-slate-200/80 bg-slate-50">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 font-semibold uppercase">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>CURRENT POSITION</span>
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-slate-900 tabular-nums">
            {cyclone.currentPosition.lat > 0 ? `${cyclone.currentPosition.lat}°N` : `${Math.abs(cyclone.currentPosition.lat)}°S`}, {cyclone.currentPosition.lon}°E
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
            Center accuracy ±12 km
          </div>
        </div>

        {/* Maximum Sustained Wind */}
        <div className="p-3 rounded border border-slate-200/80 bg-slate-50">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 font-semibold uppercase">
            <Wind className="w-3.5 h-3.5 text-sky-600" />
            <span>MAXIMUM WIND</span>
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-sky-800 tabular-nums">
            {formatSpeed(cyclone.maxWindKmh)}
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
            Gusts: {formatSpeed(Math.round(cyclone.maxWindKmh * 1.25))}
          </div>
        </div>

        {/* Central Pressure */}
        <div className="p-3 rounded border border-slate-200/80 bg-slate-50">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 font-semibold uppercase">
            <Gauge className="w-3.5 h-3.5 text-rose-600" />
            <span>CENTRAL PRESSURE</span>
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-rose-600 tabular-nums">
            {cyclone.centralPressureHpa} <span className="text-xs font-normal text-slate-500">hPa</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
            Deepening -3.7 hPa/h
          </div>
        </div>

        {/* Movement Vector */}
        <div className="p-3 rounded border border-slate-200/80 bg-slate-50">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 font-semibold uppercase">
            <Navigation className="w-3.5 h-3.5 text-sky-600" />
            <span>MOVEMENT VECTOR</span>
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-slate-900 tabular-nums">
            {cyclone.movement.direction} at {formatSpeed(cyclone.movement.speedKmh)}
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
            Azimuth: {cyclone.movement.headingDeg}°
          </div>
        </div>
      </div>

      {/* Landfall Threat Advisory */}
      <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded border border-amber-200 bg-amber-50/80 text-xs font-mono">
        <div className="flex items-center gap-2 text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold">PROJECTED LANDFALL TARGET:</span>
          <span className="font-bold text-slate-900">{cyclone.landfallThreat.region}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-600 text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>ETA: {cyclone.landfallThreat.estimatedETA}</span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-rose-600 font-bold">Impact Prob: {cyclone.landfallThreat.probabilityOfImpact}%</span>
        </div>
      </div>
    </div>
  );
};
