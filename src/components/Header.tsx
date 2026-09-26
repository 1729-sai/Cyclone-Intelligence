import React from 'react';
import { Settings, Sliders, Radio, Globe, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  speedUnit: 'km/h' | 'knots';
  onToggleSpeedUnit: () => void;
  onOpenSettings: () => void;
  lastUpdated: string;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  speedUnit,
  onToggleSpeedUnit,
  onOpenSettings,
  lastUpdated,
  isDarkMode = false,
  onToggleTheme,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'live-analysis', label: 'Live Analysis' },
    { id: 'patterns', label: 'Cyclone Patterns' },
    { id: 'historical', label: 'Historical Data' },
    { id: 'ai-insights', label: 'AI Insights' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 transition-colors shadow-xs">
      <div className="flex items-center justify-between gap-4 max-w-[1720px] mx-auto">
        {/* Zone 1: Brand single text element */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-8 h-8 rounded border border-sky-300 bg-sky-50 text-sky-600 shadow-xs">
            <span className="text-lg animate-spin-slow">🌀</span>
          </div>
          <div className="flex flex-col">
            <div className="text-base font-bold tracking-wider text-slate-900 uppercase flex items-center gap-2">
              <span>CYCLONE INTELLIGENCE</span>
              <span className="text-[10px] font-mono tracking-widest text-sky-600 font-semibold">RSMC / METEOROLOGY LAB</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors whitespace-nowrap rounded ${
                  isActive
                    ? 'text-sky-700 bg-sky-50 border border-sky-200 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Telemetry Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs">
          {/* Open-Meteo Open Source Weather API Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-sky-200 bg-sky-50/80 text-sky-700 font-mono text-[11px]">
            <Globe className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span className="font-semibold">OPEN-METEO API</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-normal">OPEN SOURCE</span>
          </div>

          {/* Data Status Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wider text-[11px]">DATA: LIVE</span>
          </div>

          {/* Timestamp */}
          <div className="hidden lg:flex flex-col text-right font-mono text-[11px] text-slate-500">
            <span className="text-slate-400 text-[10px]">LAST SYNCHRONIZED</span>
            <span className="text-slate-800 font-medium tabular-nums">{lastUpdated}</span>
          </div>

          {/* Unit Toggle */}
          <button
            onClick={onToggleSpeedUnit}
            title="Toggle velocity units"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-sky-700 transition-colors font-mono text-[11px]"
          >
            <Radio className="w-3.5 h-3.5 text-sky-600" />
            <span className="uppercase font-semibold">{speedUnit}</span>
          </button>

          {/* Settings / Controls */}
          <button
            onClick={onOpenSettings}
            title="Geospatial display calibration"
            className="p-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
