import React, { useState } from 'react';
import { TimelinePoint } from '../types/cyclone';
import { Activity } from 'lucide-react';

interface EvolutionTimelineProps {
  timeline: TimelinePoint[];
  speedUnit: 'km/h' | 'knots';
}

export const EvolutionTimeline: React.FC<EvolutionTimelineProps> = ({
  timeline,
  speedUnit,
}) => {
  const [activePointIndex, setActivePointIndex] = useState<number>(
    timeline.findIndex(pt => pt.isCurrent) !== -1 ? timeline.findIndex(pt => pt.isCurrent) : 4
  );

  const formatSpeed = (kmh: number) => {
    if (speedUnit === 'knots') {
      return `${Math.round(kmh * 0.539957)} kt`;
    }
    return `${kmh} km/h`;
  };

  const selectedPt = timeline[activePointIndex] || timeline[0];

  const chartWidth = 900;
  const chartHeight = 180;
  const padding = { top: 20, right: 40, bottom: 30, left: 50 };

  const minWind = 30;
  const maxWind = 210;
  const minPress = 930;
  const maxPress = 1010;

  const pointsCount = timeline.length;
  const stepX = (chartWidth - padding.left - padding.right) / (pointsCount - 1);

  const windCoords = timeline.map((pt, i) => {
    const x = padding.left + i * stepX;
    const y = padding.top + (1 - (pt.windSpeed - minWind) / (maxWind - minWind)) * (chartHeight - padding.top - padding.bottom);
    return { x, y, pt };
  });

  const pressCoords = timeline.map((pt, i) => {
    const x = padding.left + i * stepX;
    const y = padding.top + ((pt.pressure - minPress) / (maxPress - minPress)) * (chartHeight - padding.top - padding.bottom);
    return { x, y, pt };
  });

  const windPath = windCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const pressPath = pressCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

  return (
    <div className="w-full rounded border border-slate-200 bg-white p-5 shadow-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-600" />
          <h3 className="text-base font-bold font-mono tracking-wider text-slate-900 uppercase">
            Cyclone Evolution Timeline
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-sky-600 rounded-sm"></span>
            <span className="text-sky-800">Wind Velocity ({speedUnit})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-rose-600 rounded-sm"></span>
            <span className="text-rose-700">Central Pressure (hPa)</span>
          </div>
        </div>
      </div>

      {/* Horizontal Milestone Stage Stepper */}
      <div className="mt-4 overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-[700px] relative">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0"></div>

          {timeline.map((pt, idx) => {
            const isSelected = idx === activePointIndex;
            const isCurrent = pt.isCurrent;
            const isForecast = pt.isForecast;

            return (
              <button
                key={`${pt.stage}-${idx}`}
                onClick={() => setActivePointIndex(idx)}
                className="relative z-10 flex flex-col items-center group text-center focus:outline-none"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs transition-all ${
                    isCurrent
                      ? 'bg-rose-600 text-white font-bold ring-4 ring-rose-200 shadow-sm'
                      : isSelected
                      ? 'bg-sky-600 text-white font-bold ring-4 ring-sky-200 shadow-sm'
                      : isForecast
                      ? 'bg-white border-2 border-dashed border-sky-400 text-sky-700 group-hover:border-sky-600'
                      : 'bg-white border-2 border-slate-300 text-slate-600 group-hover:border-slate-500'
                  }`}
                >
                  {isCurrent ? '●' : isForecast ? '○' : idx + 1}
                </div>

                <span
                  className={`mt-2 text-[10px] font-mono tracking-wider uppercase whitespace-nowrap font-bold ${
                    isCurrent
                      ? 'text-rose-700'
                      : isSelected
                      ? 'text-sky-700'
                      : isForecast
                      ? 'text-sky-600'
                      : 'text-slate-500'
                  }`}
                >
                  {pt.stage}
                </span>

                <span className="text-[10px] font-mono text-slate-400 mt-0.5 font-medium">
                  {pt.time}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-700">
                  {formatSpeed(pt.windSpeed)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Dual-Axis Chart */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="relative w-full h-[180px]">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full overflow-visible"
          >
            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + ratio * (chartHeight - padding.top - padding.bottom);
              return (
                <line
                  key={ratio}
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="rgba(226, 232, 240, 0.9)"
                  strokeWidth="1"
                  strokeDasharray="2,3"
                />
              );
            })}

            {/* Current Point vertical guide line */}
            {(() => {
              const activeX = windCoords[activePointIndex]?.x;
              if (activeX !== undefined) {
                return (
                  <line
                    x1={activeX}
                    y1={padding.top}
                    x2={activeX}
                    y2={chartHeight - padding.bottom}
                    stroke="rgba(2, 132, 199, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                );
              }
              return null;
            })()}

            {/* Pressure Curve (Rose) */}
            <path
              d={pressPath}
              fill="none"
              stroke="#e11d48"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Wind Speed Curve (Sky) */}
            <path
              d={windPath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Nodes on Wind Curve */}
            {windCoords.map((c, i) => (
              <circle
                key={`wind-node-${i}`}
                cx={c.x}
                cy={c.y}
                r={i === activePointIndex ? 5.5 : 4}
                fill={i === activePointIndex ? '#0284c7' : '#ffffff'}
                stroke="#0284c7"
                strokeWidth="2"
                className="cursor-pointer shadow-sm"
                onClick={() => setActivePointIndex(i)}
              />
            ))}

            {/* Nodes on Pressure Curve */}
            {pressCoords.map((c, i) => (
              <circle
                key={`press-node-${i}`}
                cx={c.x}
                cy={c.y}
                r={i === activePointIndex ? 5.5 : 4}
                fill={i === activePointIndex ? '#e11d48' : '#ffffff'}
                stroke="#e11d48"
                strokeWidth="2"
                className="cursor-pointer shadow-sm"
                onClick={() => setActivePointIndex(i)}
              />
            ))}

            {/* Y-Axis Labels Left (Wind) */}
            <text x={padding.left - 8} y={padding.top + 4} fill="#0284c7" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="end">
              210 {speedUnit}
            </text>
            <text x={padding.left - 8} y={chartHeight - padding.bottom} fill="#0284c7" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="end">
              30 {speedUnit}
            </text>

            {/* Y-Axis Labels Right (Pressure) */}
            <text x={chartWidth - padding.right + 8} y={padding.top + 4} fill="#e11d48" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="start">
              1010 hPa
            </text>
            <text x={chartWidth - padding.right + 8} y={chartHeight - padding.bottom} fill="#e11d48" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="start">
              930 hPa
            </text>
          </svg>
        </div>

        {/* Selected Stage Detail Inspector */}
        <div className="mt-3 p-3 rounded bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold border border-sky-200">
              {selectedPt.stage}
            </span>
            <span className="text-slate-900 font-bold">{selectedPt.date} · {selectedPt.time}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">{selectedPt.classification}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-700 font-medium">
            <div>
              <span className="text-slate-400 mr-1.5 font-bold">WIND:</span>
              <span className="text-sky-700 font-bold">{formatSpeed(selectedPt.windSpeed)}</span>
            </div>
            <div>
              <span className="text-slate-400 mr-1.5 font-bold">PRESSURE:</span>
              <span className="text-rose-600 font-bold">{selectedPt.pressure} hPa</span>
            </div>
            {selectedPt.coords && (
              <div>
                <span className="text-slate-400 mr-1.5 font-bold">COORDS:</span>
                <span className="text-slate-900 font-bold">{selectedPt.coords.lat}°N, {selectedPt.coords.lon}°E</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
