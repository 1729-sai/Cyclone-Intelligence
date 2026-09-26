import React from 'react';
import { EnvironmentalDrivers as EnvDriversType } from '../types/cyclone';
import { Thermometer, Droplets, Wind, Gauge, Waves, CloudLightning } from 'lucide-react';

interface EnvironmentalDriversProps {
  drivers: EnvDriversType;
}

export const EnvironmentalDrivers: React.FC<EnvironmentalDriversProps> = ({ drivers }) => {
  const cards = [
    {
      id: 'sst',
      title: 'Sea Surface Temperature',
      data: drivers.sst,
      icon: Thermometer,
      iconColor: 'text-amber-600',
      badgeColor: 'text-emerald-700 border-emerald-200 bg-emerald-50',
      strokeColor: '#059669',
    },
    {
      id: 'moisture',
      title: 'Atmospheric Moisture',
      data: drivers.moisture,
      icon: Droplets,
      iconColor: 'text-sky-600',
      badgeColor: 'text-emerald-700 border-emerald-200 bg-emerald-50',
      strokeColor: '#0284c7',
    },
    {
      id: 'shear',
      title: 'Vertical Wind Shear',
      data: drivers.shear,
      icon: Wind,
      iconColor: 'text-teal-600',
      badgeColor: 'text-emerald-700 border-emerald-200 bg-emerald-50',
      strokeColor: '#0d9488',
    },
    {
      id: 'pressure',
      title: 'Central Pressure',
      data: drivers.pressure,
      icon: Gauge,
      iconColor: 'text-rose-600',
      badgeColor: 'text-rose-700 border-rose-200 bg-rose-50',
      strokeColor: '#e11d48',
    },
    {
      id: 'ohc',
      title: 'Ocean Heat Content',
      data: drivers.ohc,
      icon: Waves,
      iconColor: 'text-amber-600',
      badgeColor: 'text-emerald-700 border-emerald-200 bg-emerald-50',
      strokeColor: '#d97706',
    },
    {
      id: 'convection',
      title: 'Convection',
      data: drivers.convection,
      icon: CloudLightning,
      iconColor: 'text-purple-600',
      badgeColor: 'text-rose-700 border-rose-200 bg-rose-50',
      strokeColor: '#7c3aed',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-sky-600 rounded-sm"></span>
          <h3 className="text-base font-bold font-mono tracking-wider text-slate-900 uppercase">
            Environmental Drivers
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-semibold">
            OPEN-METEO API POWERED
          </span>
          <span className="hidden sm:inline">Ocean-Atmospheric Coupling Diagnostic</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {cards.map((card) => {
          const Icon = card.icon;
          const { value, unit, status, benchmark, trend } = card.data;

          const min = Math.min(...trend);
          const max = Math.max(...trend);
          const range = max - min || 1;
          const points = trend.map((val, idx) => {
            const x = (idx / (trend.length - 1)) * 100;
            const y = 35 - ((val - min) / range) * 28;
            return `${x},${y}`;
          }).join(' ');

          return (
            <div
              key={card.id}
              className="rounded border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-500 tracking-wide font-semibold">
                    {card.title}
                  </span>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                      {value}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      {unit}
                    </span>
                  </div>

                  <div className={`px-2 py-0.5 rounded text-[11px] font-mono border font-bold ${card.badgeColor}`}>
                    {status}
                  </div>
                </div>
              </div>

              {/* Sparkline Visualization */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="w-28 h-9 shrink-0">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                    <polyline
                      fill="none"
                      stroke={card.strokeColor}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                    />
                    {trend.length > 0 && (
                      <circle
                        cx="100"
                        cy={35 - ((trend[trend.length - 1] - min) / range) * 28}
                        r="3.5"
                        fill={card.strokeColor}
                      />
                    )}
                  </svg>
                </div>

                <div className="text-[10px] font-mono text-slate-500 text-right leading-tight">
                  <span className="text-slate-400 block font-semibold">BENCHMARK</span>
                  <span className="text-slate-600 font-medium">{benchmark}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
