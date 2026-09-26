import React, { useState, useEffect } from 'react';
import { Cyclone } from '../types/cyclone';
import { Activity, ShieldAlert, Wind, Gauge } from 'lucide-react';

interface HeroKpiProps {
  cyclones: Cyclone[];
  selectedCyclone: Cyclone;
  speedUnit: 'km/h' | 'knots';
  onSelectCyclone: (c: Cyclone) => void;
}

export const HeroKpi: React.FC<HeroKpiProps> = ({
  cyclones,
  selectedCyclone,
  speedUnit,
  onSelectCyclone,
}) => {
  const activeCount = cyclones.length;
  const strongest = [...cyclones].sort((a, b) => b.maxWindKmh - a.maxWindKmh)[0] || selectedCyclone;

  const displaySpeed = (kmh: number) => {
    if (speedUnit === 'knots') {
      return `${Math.round(kmh * 0.539957)}`;
    }
    return `${kmh}`;
  };

  const [animSpeed, setAnimSpeed] = useState(0);
  const [animPressure, setAnimPressure] = useState(1000);

  useEffect(() => {
    const targetSpeed = speedUnit === 'knots' ? Math.round(strongest.maxWindKmh * 0.539957) : strongest.maxWindKmh;
    const targetPressure = strongest.centralPressureHpa;

    let currentSpeed = 0;
    const speedStep = Math.max(1, Math.floor(targetSpeed / 25));
    const speedInterval = setInterval(() => {
      currentSpeed += speedStep;
      if (currentSpeed >= targetSpeed) {
        setAnimSpeed(targetSpeed);
        clearInterval(speedInterval);
      } else {
        setAnimSpeed(currentSpeed);
      }
    }, 25);

    let currentPressure = 1000;
    const pressureStep = Math.max(1, Math.floor((1000 - targetPressure) / 25));
    const pressureInterval = setInterval(() => {
      currentPressure -= pressureStep;
      if (currentPressure <= targetPressure) {
        setAnimPressure(targetPressure);
        clearInterval(pressureInterval);
      } else {
        setAnimPressure(currentPressure);
      }
    }, 25);

    return () => {
      clearInterval(speedInterval);
      clearInterval(pressureInterval);
    };
  }, [strongest, speedUnit]);

  return (
    <section className="w-full pt-4 pb-2">
      {/* Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-sky-700 tracking-wider uppercase font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
            <span>Ocean-Atmosphere Coupled AI Pipeline</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 font-normal">Basin 45°E – 100°E</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            Tropical Cyclone Intelligence
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-600 max-w-3xl">
            AI-powered analysis of cyclone formation, evolution and environmental conditions.
          </p>
        </div>

        {/* System Selector Tab */}
        <div className="flex items-center gap-1.5 p-1 rounded border border-slate-200 bg-slate-100 text-xs">
          <span className="px-2 py-1 text-slate-500 font-mono uppercase text-[11px] font-semibold">Focus:</span>
          {cyclones.map((c) => {
            const isSelected = c.id === selectedCyclone.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCyclone(c)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-sky-700 border border-slate-200 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Important KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Active Systems */}
        <div className="relative overflow-hidden rounded border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-mono text-slate-500 font-semibold">
              Active Systems
            </span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {activeCount}
            </span>
            <span className="text-xs font-mono text-slate-500">vortices tracked</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="text-amber-700 font-semibold">1 Severe</span>
            <span className="text-slate-300">·</span>
            <span className="text-sky-700 font-semibold">2 Cyclonic Storms</span>
          </div>
        </div>

        {/* KPI 2: Strongest System */}
        <div 
          onClick={() => onSelectCyclone(strongest)}
          className="relative overflow-hidden rounded border border-sky-200 bg-sky-50/40 p-4 shadow-xs transition-all hover:border-sky-300 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-mono text-slate-600 font-semibold">
              Strongest System
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 truncate">
              {strongest.name}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-sky-100 font-mono">
            <span className="text-rose-600 font-bold">{strongest.status}</span>
            <span className="text-slate-600 text-[11px] truncate max-w-[130px]">{strongest.category}</span>
          </div>
        </div>

        {/* KPI 3: Max Wind */}
        <div className="relative overflow-hidden rounded border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-mono text-slate-500 font-semibold">
              Max Wind
            </span>
            <Wind className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {animSpeed}
            </span>
            <span className="text-xs uppercase font-mono text-sky-700 font-bold">
              {speedUnit}
            </span>
            <span className="text-xs text-slate-500 font-mono ml-auto">
              {speedUnit === 'km/h' ? `(${displaySpeed(strongest.maxWindKmh)} kt)` : `(${strongest.maxWindKmh} km/h)`}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 pt-2 border-t border-slate-100 font-mono">
            <span className="font-semibold">▲ +45 {speedUnit} in last 24h</span>
            <span className="text-slate-400 font-normal ml-auto">(Gale R64: 65 km)</span>
          </div>
        </div>

        {/* KPI 4: Lowest Pressure */}
        <div className="relative overflow-hidden rounded border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-mono text-slate-500 font-semibold">
              Lowest Pressure
            </span>
            <Gauge className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {animPressure}
            </span>
            <span className="text-xs uppercase font-mono text-rose-600 font-bold">
              hPa
            </span>
            <span className="text-xs text-slate-500 font-mono ml-auto">
              (28.00 inHg)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 pt-2 border-t border-slate-100 font-mono font-semibold">
            <span>▼ -22 hPa / 24h (Rapid Deepening)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
