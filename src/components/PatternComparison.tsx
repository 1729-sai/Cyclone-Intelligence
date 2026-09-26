import React, { useState } from 'react';
import { PatternSimilarity } from '../types/cyclone';
import { GitCompare, Target } from 'lucide-react';

interface PatternComparisonProps {
  patterns: PatternSimilarity[];
}

export const PatternComparison: React.FC<PatternComparisonProps> = ({ patterns }) => {
  const [selectedPattern, setSelectedPattern] = useState<PatternSimilarity>(patterns[0]);

  return (
    <div className="w-full rounded border border-slate-200 bg-white p-5 shadow-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-sky-600" />
          <h3 className="text-base font-bold font-mono tracking-wider text-slate-900 uppercase">
            Historical Pattern Similarity
          </h3>
        </div>
        <div className="text-xs font-mono text-sky-700 font-semibold">
          Clustering: k-NN Manifold Learning (Euclidean Distance &lt; 0.18)
        </div>
      </div>

      <p className="mt-3 text-xs sm:text-sm text-slate-600">
        This cyclone currently resembles <span className="text-sky-700 font-bold">7 historical cyclone development patterns</span> in the Bay of Bengal &amp; North Indian Ocean archives.
      </p>

      {/* Pattern Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {patterns.map((pat) => {
          const isSelected = selectedPattern.patternId === pat.patternId;

          return (
            <div
              key={pat.patternId}
              onClick={() => setSelectedPattern(pat)}
              className={`p-3.5 rounded border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-sky-300 bg-sky-50/60 shadow-xs ring-1 ring-sky-200'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-600 uppercase font-bold">
                    {pat.name}
                  </span>
                  <span className="text-base font-bold font-mono text-sky-700 tabular-nums">
                    {pat.matchPercent}%
                  </span>
                </div>

                {/* Abstract Cyclone-Track Visualization */}
                <div className="my-3 w-full h-16 rounded bg-white border border-slate-200 flex items-center justify-center p-2 relative overflow-hidden shadow-xs">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(203, 213, 225, 0.6)" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(203, 213, 225, 0.6)" strokeWidth="1" strokeDasharray="2,2" />
                    <path
                      d={pat.trackGeometry}
                      fill="none"
                      stroke={isSelected ? '#0284c7' : '#64748b'}
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <circle cx="90" cy="15" r="3.5" fill="#e11d48" />
                  </svg>
                  <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400 font-bold">
                    VEC-{pat.patternId.slice(-2)}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-800">
                  <span className="text-slate-500 text-[10px] block font-semibold uppercase">ANALOG BASELINE:</span>
                  <span className="font-bold text-slate-900">{pat.analogStorm}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] font-mono text-slate-600 flex items-center justify-between">
                <span>RI Rate:</span>
                <span className="text-rose-600 font-bold">{pat.riRate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Pattern Detailed Inspector */}
      {selectedPattern && (
        <div className="mt-4 p-3.5 rounded bg-slate-50 border border-slate-200 text-xs font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-600" />
              <span className="text-sky-800 font-bold uppercase">{selectedPattern.name} Analysis</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium">Match score: {selectedPattern.matchPercent}%</span>
            </div>
            <div className="text-slate-600">
              Historical Reference: <span className="text-slate-900 font-bold">{selectedPattern.analogStorm} ({selectedPattern.year})</span>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-4 text-slate-700">
            <span className="text-slate-500 font-bold uppercase text-[11px]">Matched Structural Traits:</span>
            {selectedPattern.similarityFactors.map((trait, idx) => (
              <span key={idx} className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                <span>{trait}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
