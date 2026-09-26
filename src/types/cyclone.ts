export type CycloneStatus = 'INTENSIFYING' | 'STEADY' | 'WEAKENING' | 'DISSIPATING';

export type CycloneCategory = 
  | 'Depression' 
  | 'Deep Depression' 
  | 'Cyclonic Storm' 
  | 'Severe Tropical Cyclone' 
  | 'Very Severe Cyclonic Storm' 
  | 'Extremely Severe Cyclonic Storm' 
  | 'Super Cyclonic Storm';

export interface EnvironmentalFactor {
  value: number | string;
  numericValue: number;
  unit: string;
  status: string;
  state: 'favorable' | 'moderate' | 'unfavorable';
  trend: number[]; // mini sparkline points
  benchmark: string;
}

export interface EnvironmentalDrivers {
  sst: EnvironmentalFactor;
  moisture: EnvironmentalFactor;
  shear: EnvironmentalFactor;
  pressure: EnvironmentalFactor;
  ohc: EnvironmentalFactor;
  convection: EnvironmentalFactor;
}

export interface ContributingFactor {
  name: string;
  percentage: number;
  favorable: boolean;
  delta: string;
}

export interface FeatureImportance {
  factor: string;
  weight: number;
  contribution: 'positive' | 'negative';
  description: string;
  baseline: string;
  currentValue: string;
}

export interface TimelinePoint {
  stage: string;
  time: string;
  date: string;
  windSpeed: number; // km/h
  pressure: number; // hPa
  classification: string;
  coords: { lat: number; lon: number };
  isPast: boolean;
  isCurrent?: boolean;
  isForecast?: boolean;
  notes?: string;
}

export interface PatternSimilarity {
  patternId: string;
  name: string;
  matchPercent: number;
  analogStorm: string;
  year: number;
  basin: string;
  riRate: string;
  peakWindKmh: number;
  similarityFactors: string[];
  trackGeometry: string; // SVG path d
}

export interface Waypoint {
  lat: number;
  lon: number;
  time: string;
  windSpeed: number;
  pressure: number;
  category: string;
  isPast: boolean;
  isCurrent?: boolean;
  coneRadiusKm?: number;
}

export interface Cyclone {
  id: string;
  name: string;
  basin: string;
  status: CycloneStatus;
  category: CycloneCategory;
  currentPosition: { lat: number; lon: number };
  maxWindKmh: number;
  centralPressureHpa: number;
  movement: {
    direction: string;
    speedKmh: number;
    headingDeg: number;
  };
  aiConfidence: number;
  rapidIntensificationProbability: number;
  // Wind radius in km (quadrants)
  windRadii: {
    r34: number; // 34 kt / 63 km/h gale radius
    r50: number; // 50 kt / 92 km/h storm radius
    r64: number; // 64 kt / 118 km/h hurricane radius
  };
  environmentalDrivers: EnvironmentalDrivers;
  patternAnalysis: {
    title: string;
    description: string;
    confidenceLevel: string;
    contributingFactors: ContributingFactor[];
    featureImportance: FeatureImportance[];
  };
  evolutionTimeline: TimelinePoint[];
  historicalSimilarities: PatternSimilarity[];
  satelliteMetrics: {
    centerLatLon: string;
    dvorakTNumber: number;
    eyeDiameterKm: number;
    cdoTempC: number;
    spiralBandCoherence: number;
    shearVectorKm: string;
  };
  track: Waypoint[];
  landfallThreat: {
    region: string;
    estimatedETA: string;
    projectedCategory: CycloneCategory;
    probabilityOfImpact: number;
  };
}

export interface HistoricalCycloneRecord {
  id: string;
  name: string;
  year: number;
  region: string;
  basin: string;
  maxWindKmh: number;
  minPressureHpa: number;
  durationDays: number;
  peakCategory: CycloneCategory;
  fatalities: string;
  damageUsd: string;
  riObserved: boolean;
  trackPath: { lat: number; lon: number; wind: number }[];
}

export type MapDataLayer = 
  | 'tracks'
  | 'satellite'
  | 'sst'
  | 'moisture'
  | 'windField'
  | 'pressure'
  | 'rainfall'
  | 'ohc';
