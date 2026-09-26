import React from 'react';
import { ContributingFactor } from '../types/cyclone';
import { Cpu, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';

interface PatternAnalysisProps {
  title: string;
  description: string;
  confidenceLevel: string;
  contributingFactors: ContributingFactor[];
}

export const PatternAnalysis: React.FC<PatternAnalysisProps> = ({
  title,
  description,
  confidenceLevel,
  contributingFactors,
}) => {
  return (
    <div className="w-full rounded border border-slate-200 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-sky-50 border border-sky-200 text-sky-600">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono tracking-wider text-slate-900 uppercase flex items-center gap-2">
              <span>AI Pattern Analysis</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                Confidence: {confidenceLevel}
              </span>
            </h3>
          </div>
        </div>

        {/* Demo Tag */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 self-start sm:self-auto font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Demo / Simulated Model Output</span>
        </div>
      </div>

      {/* Main Pattern Alert Callout */}
      <div className="mt-4 p-4 rounded border border-rose-200 bg-rose-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-700 text-xs font-mono font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-rose-600" />
            <span>PRIMARY CONVECTIVE REGIME</span>
          </div>
          <h4 className="mt-1 text-xl sm:text-2xl font-bold font-mono text-slate-900">
            “{title}”
          </h4>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-700 max-w-3xl leading-relaxed">
            {description}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3 bg-white px-3.5 py-2.5 rounded border border-slate-200 font-mono text-xs shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-semibold">Ensemble Voting</div>
            <div className="text-emerald-700 font-bold">14 / 16 Models Agree</div>
          </div>
        </div>
      </div>

      {/* Contributing Factors Bar Visualization */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-500 font-semibold">
          <span className="uppercase tracking-wider">Environmental Contributing Factors</span>
          <span>Alignment Score (%)</span>
        </div>

        <div className="space-y-3">
          {contributingFactors.map((factor, index) => {
            return (
              <div key={factor.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px] font-bold">0{index + 1}.</span>
                    <span className="text-slate-800 font-bold">{factor.name}</span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      ({factor.delta})
                    </span>
                  </div>
                  <span className="text-sky-800 font-bold tabular-nums">
                    {factor.percentage}%
                  </span>
                </div>

                {/* Progress Track */}
                <div className="relative w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-700 ease-out"
                    style={{ width: `${factor.percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
