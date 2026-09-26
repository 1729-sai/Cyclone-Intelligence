import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Cyclone, HistoricalCycloneRecord } from '../types/cyclone';
import { fetchLiveCycloneWeather, LiveAtmosphericTelemetry } from '../services/openMeteoService';
import { 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Crosshair, 
  Compass, 
  Radio, 
  Eye, 
  X, 
  Check, 
  MapPin, 
  Wind, 
  Gauge, 
  Waves, 
  CloudRain, 
  Navigation,
  Globe,
  Sliders,
  Info
} from 'lucide-react';

interface GeospatialMapProps {
  cyclones: Cyclone[];
  selectedCyclone: Cyclone;
  onSelectCyclone: (c: Cyclone) => void;
  speedUnit: 'km/h' | 'knots';
  comparisonCyclone?: HistoricalCycloneRecord | null;
  onClearComparison?: () => void;
}

type BasemapType = 'satellite' | 'satellite-labels' | 'carto-light' | 'topo';

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  cyclones,
  selectedCyclone,
  onSelectCyclone,
  speedUnit,
  comparisonCyclone,
  onClearComparison,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups refs to easily add/remove objects
  const baseLayersRef = useRef<{ [key in BasemapType]?: L.TileLayer | L.LayerGroup }>({});
  const cycloneMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const tracksGroupRef = useRef<L.LayerGroup | null>(null);
  const windRadiiGroupRef = useRef<L.LayerGroup | null>(null);
  const coneGroupRef = useRef<L.LayerGroup | null>(null);
  const comparisonGroupRef = useRef<L.LayerGroup | null>(null);
  const probeMarkerGroupRef = useRef<L.LayerGroup | null>(null);

  // State
  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>('satellite-labels');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [showWindRadii, setShowWindRadii] = useState(true);
  const [showTracks, setShowTracks] = useState(true);
  const [showCone, setShowCone] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Coordinate prober state
  const [probeLocation, setProbeLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [probeData, setProbeData] = useState<LiveAtmosphericTelemetry | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [probeModalOpen, setProbeModalOpen] = useState(false);

  const formatSpeed = (kmh: number) => {
    if (speedUnit === 'knots') {
      return `${Math.round(kmh * 0.539957)} kt`;
    }
    return `${kmh} km/h`;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fix default Leaflet icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
      center: [selectedCyclone.currentPosition.lat, selectedCyclone.currentPosition.lon],
      zoom: 5,
      minZoom: 3,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Add clean attribution
    L.control.attribution({
      position: 'bottomright',
      prefix: '<a href="https://leafletjs.com" target="_blank">Leaflet</a> · Open-Source Satellite GIS',
    }).addTo(map);

    // 1. Basemap: ESRI World Imagery (High-Res Open Satellite)
    const esriSatellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
        maxZoom: 18,
      }
    );

    // 2. Reference Overlay: Boundaries and Places
    const esriLabels = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Labels &copy; Esri',
        maxZoom: 18,
      }
    );

    // Satellite + Labels combined group
    const satelliteWithLabels = L.layerGroup([esriSatellite, esriLabels]);

    // 3. Carto Light (Clean light cartography)
    const cartoLight = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    );

    // 4. OpenTopoMap
    const topoMap = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17,
      }
    );

    baseLayersRef.current = {
      'satellite': esriSatellite,
      'satellite-labels': satelliteWithLabels,
      'carto-light': cartoLight,
      'topo': topoMap,
    };

    // Default to Satellite with Labels
    satelliteWithLabels.addTo(map);

    // Layer groups for dynamic features
    cycloneMarkersGroupRef.current = L.layerGroup().addTo(map);
    tracksGroupRef.current = L.layerGroup().addTo(map);
    windRadiiGroupRef.current = L.layerGroup().addTo(map);
    coneGroupRef.current = L.layerGroup().addTo(map);
    comparisonGroupRef.current = L.layerGroup().addTo(map);
    probeMarkerGroupRef.current = L.layerGroup().addTo(map);

    // Mousemove tracker for coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: parseFloat(e.latlng.lat.toFixed(2)),
        lon: parseFloat(e.latlng.lng.toFixed(2)),
      });
    });

    // Map click -> Probe Open-Meteo Weather API
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(2));
      const lon = parseFloat(e.latlng.lng.toFixed(2));
      setProbeLocation({ lat, lon });
      setIsProbing(true);
      setProbeModalOpen(true);

      // Render temporary probe marker
      if (probeMarkerGroupRef.current) {
        probeMarkerGroupRef.current.clearLayers();
        const probeIcon = L.divIcon({
          className: 'custom-probe-pin',
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
              <span class="absolute w-8 h-8 rounded-full bg-cyan-400/40 animate-ping"></span>
              <span class="absolute w-5 h-5 rounded-full bg-sky-500/60"></span>
              <span class="w-3 h-3 rounded-full bg-white border-2 border-sky-600 shadow-md"></span>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        L.marker([lat, lon], { icon: probeIcon }).addTo(probeMarkerGroupRef.current);
      }

      try {
        const telemetry = await fetchLiveCycloneWeather(lat, lon);
        setProbeData(telemetry);
      } catch (err) {
        console.error('Error probing location:', err);
      } finally {
        setIsProbing(false);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch basemap when selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove all basemaps
    Object.values(baseLayersRef.current).forEach((layer) => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    // Add selected basemap
    const activeLayer = baseLayersRef.current[currentBasemap];
    if (activeLayer) {
      activeLayer.addTo(map);
    }
  }, [currentBasemap]);

  // Update cyclone markers and features when state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !cycloneMarkersGroupRef.current) return;

    // Clear existing dynamic layers
    cycloneMarkersGroupRef.current.clearLayers();
    tracksGroupRef.current?.clearLayers();
    windRadiiGroupRef.current?.clearLayers();
    coneGroupRef.current?.clearLayers();

    // 1. Render all active cyclones
    cyclones.forEach((cyclone) => {
      const isSelected = cyclone.id === selectedCyclone.id;
      const isSevere = cyclone.category.toLowerCase().includes('severe') || cyclone.maxWindKmh >= 130;
      const isStorm = cyclone.maxWindKmh >= 65 && !isSevere;

      const mainColor = isSevere ? '#ef4444' : isStorm ? '#f59e0b' : '#0284c7';
      const glowColor = isSevere ? 'rgba(239, 68, 68, 0.4)' : isStorm ? 'rgba(245, 158, 11, 0.4)' : 'rgba(2, 132, 199, 0.4)';

      // Custom animated rotating cyclone icon
      const customIcon = L.divIcon({
        className: 'cyclone-marker-container',
        html: `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
            <!-- Pulsing outer alert ring -->
            <div class="absolute -inset-4 rounded-full animate-ping pointer-events-none" style="background-color: ${glowColor}; animation-duration: 2.5s;"></div>
            
            <!-- Selection halo -->
            ${isSelected ? `
              <div class="absolute -inset-2.5 rounded-full border-2 border-dashed border-white shadow-lg pointer-events-none animate-spin-slow"></div>
            ` : ''}

            <!-- Center rotating cyclone disc -->
            <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 border-white backdrop-blur-xs transition-transform duration-200 group-hover:scale-110" style="background-color: ${mainColor};">
              <svg class="w-6 h-6 text-white animate-spin-reverse-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.8 8.1 6.8 9.5"/>
                <path d="M12 22a10 10 0 0 0 10-10c0-4.4-2.8-8.1-6.8-9.5"/>
                <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
              </svg>
            </div>

            <!-- Floating Label Banner -->
            <div class="absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white/95 backdrop-blur-md px-2.5 py-1 rounded shadow-md border border-slate-200 text-xs font-mono pointer-events-none transition-all group-hover:shadow-lg">
              <div class="flex items-center gap-1.5 font-bold ${isSelected ? 'text-sky-800' : 'text-slate-800'}">
                <span>${cyclone.name}</span>
                <span class="text-[10px] px-1 rounded ${isSevere ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}">${cyclone.status}</span>
              </div>
              <div class="text-[11px] text-slate-500 font-normal flex items-center gap-2">
                <span>${formatSpeed(cyclone.maxWindKmh)}</span>
                <span>·</span>
                <span>${cyclone.centralPressureHpa} hPa</span>
              </div>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([cyclone.currentPosition.lat, cyclone.currentPosition.lon], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 500,
      });

      marker.on('click', () => {
        onSelectCyclone(cyclone);
        map.panTo([cyclone.currentPosition.lat, cyclone.currentPosition.lon], { animate: true });
      });

      marker.addTo(cycloneMarkersGroupRef.current!);
    });

    // 2. Render Selected Cyclone Tracks & Cones
    if (showTracks && selectedCyclone.track) {
      const pastWaypoints = selectedCyclone.track.filter((wp) => wp.isPast);
      const forecastWaypoints = selectedCyclone.track.filter((wp) => !wp.isPast);

      // Past track line
      if (pastWaypoints.length > 0) {
        const pastLatLngs = pastWaypoints.map((wp) => [wp.lat, wp.lon] as [number, number]);
        
        // Add current location as the last point of past track
        pastLatLngs.push([selectedCyclone.currentPosition.lat, selectedCyclone.currentPosition.lon]);

        L.polyline(pastLatLngs, {
          color: '#0284c7',
          weight: 3.5,
          opacity: 0.9,
          lineJoin: 'round',
        }).addTo(tracksGroupRef.current!);

        // Past Waypoint markers
        if (showWaypoints) {
          pastWaypoints.forEach((wp) => {
            const circle = L.circleMarker([wp.lat, wp.lon], {
              radius: 4.5,
              color: '#ffffff',
              fillColor: '#0284c7',
              fillOpacity: 1,
              weight: 2,
            });

            circle.bindTooltip(
              `<div class="font-mono text-xs p-1">
                <div class="font-bold text-sky-800">${wp.time} · ${wp.category}</div>
                <div>Wind: ${formatSpeed(wp.windSpeed)} · ${wp.pressure} hPa</div>
                <div class="text-[10px] text-slate-500">${wp.lat.toFixed(1)}°N, ${wp.lon.toFixed(1)}°E</div>
              </div>`,
              { className: 'scientific-tooltip', direction: 'top' }
            );

            circle.addTo(tracksGroupRef.current!);
          });
        }
      }

      // Forecast track line (Dashed)
      if (forecastWaypoints.length > 0) {
        const forecastLatLngs = [
          [selectedCyclone.currentPosition.lat, selectedCyclone.currentPosition.lon] as [number, number],
          ...forecastWaypoints.map((wp) => [wp.lat, wp.lon] as [number, number]),
        ];

        L.polyline(forecastLatLngs, {
          color: '#f43f5e',
          weight: 3,
          dashArray: '6, 6',
          opacity: 0.95,
        }).addTo(tracksGroupRef.current!);

        // Forecast Waypoints
        if (showWaypoints) {
          forecastWaypoints.forEach((wp) => {
            const circle = L.circleMarker([wp.lat, wp.lon], {
              radius: 5,
              color: '#f43f5e',
              fillColor: '#ffffff',
              fillOpacity: 1,
              weight: 2.5,
            });

            circle.bindTooltip(
              `<div class="font-mono text-xs p-1">
                <div class="font-bold text-rose-700">Projected: ${wp.time}</div>
                <div class="text-slate-700 font-semibold">${wp.category}</div>
                <div>Wind: ${formatSpeed(wp.windSpeed)} · ${wp.pressure} hPa</div>
                <div class="text-[10px] text-slate-500">${wp.lat.toFixed(1)}°N, ${wp.lon.toFixed(1)}°E</div>
              </div>`,
              { className: 'scientific-tooltip', direction: 'top' }
            );

            circle.addTo(tracksGroupRef.current!);
          });
        }
      }
    }

    // 3. Render Cone of Uncertainty
    if (showCone && selectedCyclone.track) {
      const forecastWaypoints = selectedCyclone.track.filter((wp) => !wp.isPast);
      if (forecastWaypoints.length >= 2) {
        const leftBoundary: [number, number][] = [];
        const rightBoundary: [number, number][] = [];

        forecastWaypoints.forEach((wp, idx) => {
          const spreadFactor = (idx + 1) * 0.45; // degrees offset expanding with forecast lead time
          leftBoundary.push([wp.lat + spreadFactor * 0.7, wp.lon - spreadFactor * 0.7]);
          rightBoundary.unshift([wp.lat - spreadFactor * 0.7, wp.lon + spreadFactor * 0.7]);
        });

        const conePolygonPoints: [number, number][] = [
          [selectedCyclone.currentPosition.lat, selectedCyclone.currentPosition.lon],
          ...leftBoundary,
          ...rightBoundary,
          [selectedCyclone.currentPosition.lat, selectedCyclone.currentPosition.lon],
        ];

        L.polygon(conePolygonPoints, {
          color: '#f43f5e',
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: '#f43f5e',
          fillOpacity: 0.12,
        }).addTo(coneGroupRef.current!);
      }
    }

    // 4. Render Wind Radii Circles for Selected Cyclone
    if (showWindRadii && selectedCyclone.windRadii) {
      const center: [number, number] = [selectedCyclone.currentPosition.lat, selectedCyclone.currentPosition.lon];

      // Gale Force (34 kt / 63 km/h)
      if (selectedCyclone.windRadii.r34) {
        L.circle(center, {
          radius: selectedCyclone.windRadii.r34 * 1000,
          color: '#0284c7',
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: '#0284c7',
          fillOpacity: 0.12,
        })
          .bindTooltip(`Gale-force Wind Extent (34 kt / 63 km/h): ${selectedCyclone.windRadii.r34} km radius`)
          .addTo(windRadiiGroupRef.current!);
      }

      // Storm Force (50 kt / 92 km/h)
      if (selectedCyclone.windRadii.r50) {
        L.circle(center, {
          radius: selectedCyclone.windRadii.r50 * 1000,
          color: '#f59e0b',
          weight: 1.8,
          fillColor: '#f59e0b',
          fillOpacity: 0.18,
        })
          .bindTooltip(`Storm-force Wind Extent (50 kt / 92 km/h): ${selectedCyclone.windRadii.r50} km radius`)
          .addTo(windRadiiGroupRef.current!);
      }

      // Hurricane / Severe Force (64 kt / 118 km/h)
      if (selectedCyclone.windRadii.r64) {
        L.circle(center, {
          radius: selectedCyclone.windRadii.r64 * 1000,
          color: '#ef4444',
          weight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.25,
        })
          .bindTooltip(`Hurricane-force Core Extent (64 kt / 118 km/h): ${selectedCyclone.windRadii.r64} km radius`)
          .addTo(windRadiiGroupRef.current!);
      }
    }
  }, [cyclones, selectedCyclone, showWindRadii, showTracks, showCone, showWaypoints, speedUnit]);

  // Render Historical Comparison Storm Track
  useEffect(() => {
    if (!comparisonGroupRef.current) return;
    comparisonGroupRef.current.clearLayers();

    if (comparisonCyclone && comparisonCyclone.trackPath) {
      const latLngs = comparisonCyclone.trackPath.map((p) => [p.lat, p.lon] as [number, number]);

      // Track line
      L.polyline(latLngs, {
        color: '#d97706',
        weight: 3.5,
        dashArray: '3, 5',
        opacity: 0.9,
      }).addTo(comparisonGroupRef.current);

      // Historical storm points
      comparisonCyclone.trackPath.forEach((p, idx) => {
        const marker = L.circleMarker([p.lat, p.lon], {
          radius: 4.5,
          color: '#ffffff',
          fillColor: '#d97706',
          fillOpacity: 1,
          weight: 2,
        });

        marker.bindTooltip(
          `<div class="font-mono text-xs p-1">
            <div class="font-bold text-amber-800">${comparisonCyclone.name} (${comparisonCyclone.year})</div>
            <div>Stage Point #${idx + 1}</div>
            <div>Wind: ${formatSpeed(p.wind)}</div>
            <div class="text-[10px] text-slate-500">${p.lat.toFixed(1)}°N, ${p.lon.toFixed(1)}°E</div>
          </div>`,
          { className: 'scientific-tooltip' }
        );

        marker.addTo(comparisonGroupRef.current!);
      });
    }
  }, [comparisonCyclone, speedUnit]);

  // Controls Handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetBasin = () => {
    mapInstanceRef.current?.setView([12.5, 78.5], 5, { animate: true });
  };
  const handleFocusCyclone = (cyclone: Cyclone) => {
    mapInstanceRef.current?.setView([cyclone.currentPosition.lat, cyclone.currentPosition.lon], 6, {
      animate: true,
    });
  };

  return (
    <div className="relative w-full rounded border border-slate-200 bg-white overflow-hidden shadow-xs">
      {/* 1. Top Telemetry & Control Ribbon */}
      <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2.5 bg-slate-50 border-b border-slate-200 z-20 relative gap-2">
        {/* Left: Dispatch title & active overlays */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-sky-800 font-semibold">
            <Compass className="w-4 h-4 text-sky-600" />
            <span className="tracking-wider">OPEN-SOURCE SATELLITE RADAR</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 text-[11px] font-normal hidden sm:inline">ESRI HIGH-RES &middot; WGS84</span>
          </div>

          {comparisonCyclone && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-800 text-xs font-mono font-medium animate-pulse">
              <span>Historical Overlay: {comparisonCyclone.name} ({comparisonCyclone.year})</span>
              <button 
                onClick={onClearComparison}
                className="text-amber-700 hover:text-amber-950 font-bold ml-1 px-1"
                title="Remove historical track overlay"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Right: Live Cursor telemetry & basemap switcher */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
            <Crosshair className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-slate-400">CURSOR:</span>
            <span className="text-sky-800 font-bold tabular-nums">
              {cursorCoords ? `${cursorCoords.lat > 0 ? `${cursorCoords.lat}°N` : `${Math.abs(cursorCoords.lat)}°S`}, ${cursorCoords.lon > 0 ? `${cursorCoords.lon}°E` : `${Math.abs(cursorCoords.lon)}°W`}` : '12.80°N, 86.40°E'}
            </span>
          </div>

          {/* Layer Options dropdown toggle */}
          <div className="relative">
            <button
              onClick={() => setLayerMenuOpen(!layerMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
              title="Configure Map & Layers"
            >
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline font-medium">Layers &amp; Satellite</span>
            </button>

            {layerMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-md shadow-lg p-3 z-50 text-xs space-y-3 font-sans">
                <div>
                  <div className="font-mono font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                    <span>Satellite Basemap</span>
                    <button onClick={() => setLayerMenuOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                  </div>
                  <div className="grid grid-cols-1 gap-1 font-mono">
                    <button
                      onClick={() => setCurrentBasemap('satellite-labels')}
                      className={`flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                        currentBasemap === 'satellite-labels' ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>🛰️ Satellite + Labels</span>
                      {currentBasemap === 'satellite-labels' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                    </button>

                    <button
                      onClick={() => setCurrentBasemap('satellite')}
                      className={`flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                        currentBasemap === 'satellite' ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>🛰️ Pure Satellite (Imagery)</span>
                      {currentBasemap === 'satellite' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                    </button>

                    <button
                      onClick={() => setCurrentBasemap('carto-light')}
                      className={`flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                        currentBasemap === 'carto-light' ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>🗺️ Carto Light Cartographic</span>
                      {currentBasemap === 'carto-light' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                    </button>

                    <button
                      onClick={() => setCurrentBasemap('topo')}
                      className={`flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                        currentBasemap === 'topo' ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>⛰️ OpenTopoMap Physical</span>
                      {currentBasemap === 'topo' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <div className="font-mono font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                    Meteorological Overlays
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={showTracks}
                        onChange={(e) => setShowTracks(e.target.checked)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>Cyclone Tracks &amp; Trajectories</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={showCone}
                        onChange={(e) => setShowCone(e.target.checked)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>Cone of Uncertainty (Forecast)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={showWindRadii}
                        onChange={(e) => setShowWindRadii(e.target.checked)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>Wind Radii Buffers (Gale/Storm/Hurricane)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={showWaypoints}
                        onChange={(e) => setShowWaypoints(e.target.checked)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>Detailed Track Waypoint Nodes</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Leaflet Map Viewport */}
      <div className="relative w-full h-[520px] sm:h-[620px] lg:h-[680px]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Basin Fast-Focus Toolbar (Top Left) */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-md border border-slate-200 shadow-md">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase px-1.5 pt-0.5">Focus Basin</div>
          <div className="flex flex-col gap-1">
            <button
              onClick={handleResetBasin}
              className="px-2 py-1 rounded hover:bg-slate-100 text-left text-xs font-mono text-slate-700 flex items-center gap-1.5 transition-colors"
              title="Reset view to whole Indian Ocean Basin"
            >
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>North Indian Ocean</span>
            </button>
            {cyclones.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectCyclone(c);
                  handleFocusCyclone(c);
                }}
                className={`px-2 py-1 rounded text-left text-xs font-mono flex items-center justify-between gap-2 transition-colors ${
                  c.id === selectedCyclone.id ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.category.includes('Severe') ? '#ef4444' : '#f59e0b' }} />
                  <span>{c.name}</span>
                </div>
                <span className="text-[10px] text-slate-400">{formatSpeed(c.maxWindKmh)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Floating Map Zoom & Action Controls (Top Right) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 rounded-md border border-slate-200 shadow-md">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-sky-600 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-sky-600 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 my-0.5" />
          <button
            onClick={handleResetBasin}
            className="w-8 h-8 rounded flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-sky-600 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Prober Hint Badge (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-200 shadow-md text-xs font-mono text-slate-600 flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          <span>Click anywhere to run live Open-Meteo weather probe</span>
        </div>

        {/* Floating Map Legend (Bottom Right above attribution) */}
        <div className="absolute bottom-8 right-3 z-20">
          {isLegendOpen ? (
            <div className="bg-white/95 backdrop-blur-md p-3 rounded-md border border-slate-200 shadow-lg text-xs space-y-2 max-w-[240px]">
              <div className="flex items-center justify-between font-mono font-bold text-slate-700 text-[11px] border-b border-slate-100 pb-1">
                <span>RADAR MAP LEGEND</span>
                <button onClick={() => setIsLegendOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span>Severe Cyclone Eye</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-4 h-0.5 bg-sky-600" />
                  <span>Observed Historical Track</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-4 h-0.5 border-t-2 border-dashed border-rose-500" />
                  <span>Forecast Predicted Track</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-3 h-3 rounded bg-rose-500/20 border border-dashed border-rose-500" />
                  <span>Cone of Uncertainty</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-3 h-3 rounded-full border border-sky-400 bg-sky-400/20" />
                  <span>Gale Wind Radius (34 kt)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-3 h-3 rounded-full border border-rose-500 bg-rose-500/30" />
                  <span>Hurricane Core (64 kt)</span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsLegendOpen(true)}
              className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-200 shadow-md text-xs font-mono text-slate-700 hover:text-sky-600 flex items-center gap-1.5 transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-sky-600" />
              <span>Map Legend</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Live Open-Meteo Coordinate Prober Modal / Drawer */}
      {probeModalOpen && (
        <div className="border-t border-slate-200 bg-white p-4 sm:p-5 z-20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-sky-900">
                LIVE OPEN-METEO ATMOSPHERIC SOUNDING &middot; PROBE RESULTS
              </h4>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-xs text-slate-600 font-semibold">
                {probeLocation ? `${probeLocation.lat}°N, ${probeLocation.lon}°E` : ''}
              </span>
            </div>
            <button
              onClick={() => setProbeModalOpen(false)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              title="Close prober panel"
            >
              ✕
            </button>
          </div>

          {isProbing ? (
            <div className="flex items-center justify-center py-6 gap-3 text-slate-600 font-mono text-xs">
              <Radio className="w-5 h-5 text-sky-600 animate-spin" />
              <span>Querying Open-Meteo Open Source Weather &amp; Marine API Sounding...</span>
            </div>
          ) : probeData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-sky-600" />
                  <span>SURFACE PRESSURE</span>
                </div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {probeData.surfacePressureHpa} <span className="text-xs text-slate-500 font-normal">hPa</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {probeData.surfacePressureHpa < 980 ? 'Deep Cyclone Depr.' : 'Standard Marine'}
                </div>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-emerald-600" />
                  <span>10M WIND VELOCITY</span>
                </div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {formatSpeed(probeData.windSpeed10mKmh)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Gusts: {formatSpeed(probeData.windGustsKmh)}
                </div>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                  <span>RELATIVE HUMIDITY</span>
                </div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {probeData.relativeHumidityPercent}%
                </div>
                <div className="text-[10px] text-emerald-600 font-mono mt-0.5 font-medium">
                  {probeData.relativeHumidityPercent > 75 ? 'Convective Fuel' : 'Dry Mid-level'}
                </div>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                  <span>VERTICAL SHEAR</span>
                </div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {probeData.verticalWindShearKnots} <span className="text-xs text-slate-500 font-normal">kt</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {probeData.verticalWindShearKnots <= 10 ? 'Favorable (<12kt)' : 'Moderate Shear'}
                </div>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Waves className="w-3.5 h-3.5 text-cyan-600" />
                  <span>SIGNIFICANT WAVE</span>
                </div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {probeData.waveHeightMeters ?? 4.2} <span className="text-xs text-slate-500 font-normal">m</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Current: {probeData.oceanCurrentSpeedKmh ?? 2.4} km/h
                </div>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-sky-600" />
                  <span>TELEMETRY TIME</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-900 mt-2 truncate">
                  {probeData.timestamp}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Source: Open-Meteo
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
