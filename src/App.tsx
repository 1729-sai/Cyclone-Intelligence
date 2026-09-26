import React, { useState, useEffect, useCallback } from 'react';
import { ACTIVE_CYCLONES, HISTORICAL_CYCLONES } from './data/cycloneData';
import { Cyclone, HistoricalCycloneRecord } from './types/cyclone';
import { Header } from './components/Header';
import { HeroKpi } from './components/HeroKpi';
import { OpenMeteoBanner } from './components/OpenMeteoBanner';
import { GeospatialMap } from './components/GeospatialMap';
import { SelectedCyclonePanel } from './components/SelectedCyclonePanel';
import { EnvironmentalDrivers } from './components/EnvironmentalDrivers';
import { PatternAnalysis } from './components/PatternAnalysis';
import { EvolutionTimeline } from './components/EvolutionTimeline';
import { PatternComparison } from './components/PatternComparison';
import { SatelliteAnalysis } from './components/SatelliteAnalysis';
import { AIExplainability } from './components/AIExplainability';
import { HistoricalExplorer } from './components/HistoricalExplorer';
import { AIAssistantModal } from './components/AIAssistantModal';
import { SettingsModal } from './components/SettingsModal';
import { fetchLiveCycloneWeather, LiveAtmosphericTelemetry } from './services/openMeteoService';
import { Bot, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCyclone, setSelectedCyclone] = useState<Cyclone>(ACTIVE_CYCLONES[0]);
  const [speedUnit, setSpeedUnit] = useState<'km/h' | 'knots'>('km/h');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [comparisonCyclone, setComparisonCyclone] = useState<HistoricalCycloneRecord | null>(null);
  const [lastUpdated, setLastUpdated] = useState('26 SEP 08:00 UTC');

  // Open-Meteo Open Source Weather API Telemetry state
  const [liveTelemetry, setLiveTelemetry] = useState<LiveAtmosphericTelemetry | null>(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false);

  // Fetch Open-Meteo live weather data for the selected cyclone's coordinates
  const fetchOpenMeteoData = useCallback(async (lat: number, lon: number) => {
    setIsLoadingTelemetry(true);
    try {
      const data = await fetchLiveCycloneWeather(lat, lon);
      setLiveTelemetry(data);

      // Dynamically fuse live Open-Meteo readings into environmental drivers
      setSelectedCyclone((prev) => ({
        ...prev,
        centralPressureHpa: data.surfacePressureHpa || prev.centralPressureHpa,
        environmentalDrivers: {
          ...prev.environmentalDrivers,
          pressure: {
            ...prev.environmentalDrivers.pressure,
            value: data.surfacePressureHpa || prev.environmentalDrivers.pressure.value,
            numericValue: data.surfacePressureHpa || prev.environmentalDrivers.pressure.numericValue,
            trend: data.hourlyPressure.length > 0 ? data.hourlyPressure.slice(0, 5) : prev.environmentalDrivers.pressure.trend,
            benchmark: 'Live Open-Meteo Surface Barometer',
          },
          moisture: {
            ...prev.environmentalDrivers.moisture,
            value: data.relativeHumidityPercent || prev.environmentalDrivers.moisture.value,
            numericValue: data.relativeHumidityPercent || prev.environmentalDrivers.moisture.numericValue,
            trend: data.hourlyHumidity.length > 0 ? data.hourlyHumidity.slice(0, 5) : prev.environmentalDrivers.moisture.trend,
            benchmark: 'Open-Meteo 700-500hPa RH soundings',
          },
          shear: {
            ...prev.environmentalDrivers.shear,
            value: data.verticalWindShearKnots || prev.environmentalDrivers.shear.value,
            numericValue: data.verticalWindShearKnots || prev.environmentalDrivers.shear.numericValue,
            benchmark: 'Open-Meteo 850hPa vs 200hPa shear delta',
          },
          sst: {
            ...prev.environmentalDrivers.sst,
            value: data.temperatureC || prev.environmentalDrivers.sst.value,
            numericValue: data.temperatureC || prev.environmentalDrivers.sst.numericValue,
            benchmark: 'Open-Meteo Thermal boundary layer',
          },
        },
      }));
    } catch (err) {
      console.error('Failed to load Open-Meteo data:', err);
    } finally {
      setIsLoadingTelemetry(false);
    }
  }, []);

  // Fetch whenever selected cyclone changes
  useEffect(() => {
    fetchOpenMeteoData(selectedCyclone.currentPosition.lat, selectedCyclone.currentPosition.lon);
  }, [selectedCyclone.id, fetchOpenMeteoData]);

  // Simulated live clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = now.getUTCDate().toString().padStart(2, '0');
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const mins = now.getUTCMinutes().toString().padStart(2, '0');
      setLastUpdated(`${day} SEP ${hours}:${mins} UTC`);
    };
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    const el = document.getElementById(tab);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectHistoricalTrack = (record: HistoricalCycloneRecord) => {
    setComparisonCyclone(record);
    const mapEl = document.getElementById('map-viewport');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-900 transition-colors">
      {/* 1. Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        speedUnit={speedUnit}
        onToggleSpeedUnit={() => setSpeedUnit(prev => (prev === 'km/h' ? 'knots' : 'km/h'))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        lastUpdated={lastUpdated}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* 2. Hero & KPI Section */}
        <section id="overview">
          <HeroKpi
            cyclones={ACTIVE_CYCLONES}
            selectedCyclone={selectedCyclone}
            speedUnit={speedUnit}
            onSelectCyclone={setSelectedCyclone}
          />
        </section>

        {/* Open-Meteo Open Source Weather API Stream Banner */}
        <OpenMeteoBanner
          telemetry={liveTelemetry}
          isLoading={isLoadingTelemetry}
          onRefresh={() => fetchOpenMeteoData(selectedCyclone.currentPosition.lat, selectedCyclone.currentPosition.lon)}
          cycloneName={selectedCyclone.name}
          speedUnit={speedUnit}
        />

        {/* 3. Main Geospatial Map & 4. Selected Cyclone Panel */}
        <div id="map-viewport" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Map (8 cols on large screens) */}
          <div className="lg:col-span-8">
            <GeospatialMap
              cyclones={ACTIVE_CYCLONES}
              selectedCyclone={selectedCyclone}
              onSelectCyclone={setSelectedCyclone}
              speedUnit={speedUnit}
              comparisonCyclone={comparisonCyclone}
              onClearComparison={() => setComparisonCyclone(null)}
            />
          </div>

          {/* Selected Cyclone Panel (4 cols on large screens) */}
          <div className="lg:col-span-4">
            <SelectedCyclonePanel
              cyclone={selectedCyclone}
              speedUnit={speedUnit}
            />
          </div>
        </div>

        {/* 5. Environmental Drivers */}
        <section id="environmental-drivers">
          <EnvironmentalDrivers drivers={selectedCyclone.environmentalDrivers} />
        </section>

        {/* 6. AI Pattern Analysis */}
        <section id="patterns">
          <PatternAnalysis
            title={selectedCyclone.patternAnalysis.title}
            description={selectedCyclone.patternAnalysis.description}
            confidenceLevel={selectedCyclone.patternAnalysis.confidenceLevel}
            contributingFactors={selectedCyclone.patternAnalysis.contributingFactors}
          />
        </section>

        {/* 7. Cyclone Evolution Timeline */}
        <section id="timeline">
          <EvolutionTimeline
            timeline={selectedCyclone.evolutionTimeline}
            speedUnit={speedUnit}
          />
        </section>

        {/* 8. Pattern Comparison (Historical Pattern Similarity) */}
        <section id="pattern-comparison">
          <PatternComparison patterns={selectedCyclone.historicalSimilarities} />
        </section>

        {/* 9. Satellite Analysis (Satellite Intelligence) */}
        <section id="live-analysis">
          <SatelliteAnalysis cyclone={selectedCyclone} />
        </section>

        {/* 10. AI Explainability (SHAP & What-If Sandbox) */}
        <section id="ai-insights">
          <AIExplainability
            features={selectedCyclone.patternAnalysis.featureImportance}
            baseProbability={selectedCyclone.rapidIntensificationProbability}
          />
        </section>

        {/* 11. Historical Cyclone Explorer Table */}
        <section id="historical">
          <HistoricalExplorer
            records={HISTORICAL_CYCLONES}
            speedUnit={speedUnit}
            onSelectHistoricalTrack={handleSelectHistoricalTrack}
            selectedComparisonId={comparisonCyclone?.id}
          />
        </section>
      </main>

      {/* Scientific Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 px-4 sm:px-6 lg:px-8 mt-12 text-xs font-mono text-slate-500 shadow-xs">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sky-700 font-bold">🌀 CYCLONE INTELLIGENCE</span>
            <span className="text-slate-300">·</span>
            <span>Ocean-Atmosphere Machine Learning &amp; Open-Meteo Laboratory</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Model Version: CONV-NET-V4.2</span>
            <span>Data API: Open-Meteo Open Source</span>
            <span className="text-slate-700 font-medium">Research Prototype</span>
          </div>
        </div>
      </footer>

      {/* 13. Floating AI Assistant Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 border border-sky-400"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
          </div>
          <span className="font-mono text-xs font-bold tracking-wider uppercase">
            Ask Cyclone AI
          </span>
          <Sparkles className="w-3.5 h-3.5 text-sky-200" />
        </button>
      </div>

      {/* AI Assistant Modal Drawer */}
      <AIAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        cyclone={selectedCyclone}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        speedUnit={speedUnit}
        onToggleSpeedUnit={() => setSpeedUnit(prev => (prev === 'km/h' ? 'knots' : 'km/h'))}
      />
    </div>
  );
}
