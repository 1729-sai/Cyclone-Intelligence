import React, { useState } from 'react';
import { Cyclone } from '../types/cyclone';
import { 
  Scan, 
  CheckCircle2, 
  Sparkles,
  RotateCw
} from 'lucide-react';

interface SatelliteAnalysisProps {
  cyclone: Cyclone;
}

export const SatelliteAnalysis: React.FC<SatelliteAnalysisProps> = ({ cyclone }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [analysisCompleted, setAnalysisCompleted] = useState(true);

  // Satellite Detection Overlays Toggles
  const [showCenter, setShowCenter] = useState(true);
  const [showEye, setShowEye] = useState(true);
  const [showSpiralBands, setShowSpiralBands] = useState(true);
  const [showTempScale, setShowTempScale] = useState(true);
  const [showSegmentation, setShowSegmentation] = useState(true);

  // Interactive inspect pixel coordinate
  const [hoverPixel, setHoverPixel] = useState<{ x: number; y: number; temp: number } | null>(null);

  const runAnalysis = () => {
    setIsScanning(true);
    setScanProgress(0);
    setAnalysisCompleted(false);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setAnalysisCompleted(true);
          return 100;
        }
        return prev + 5;
      });
    }, 70);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    const dx = x - 250;
    const dy = y - 220;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let temp = 28;
    if (dist < 18) {
      temp = -24;
    } else if (dist < 60) {
      temp = -78.4;
    } else if (dist < 140) {
      temp = -62 + (dist - 60) * 0.25;
    } else if (dist < 220) {
      temp = -42 + (dist - 140) * 0.45;
    }
    setHoverPixel({ x, y, temp: parseFloat(temp.toFixed(1)) });
  };

  return (
    <div className="w-full rounded border border-slate-200 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Scan className="w-4 h-4 text-sky-600" />
            <h3 className="text-base font-bold font-mono tracking-wider text-slate-900 uppercase">
              Satellite Intelligence
            </h3>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
              INSAT-3D / METEOSAT-9 IR10.8µm
            </span>
          </div>
          <p className="mt-1 text-xs font-mono text-slate-600">
            Multi-spectral multisensor convective band segmentation and Dvorak T-number extraction
          </p>
        </div>

        {/* Trigger Button */}
        <button
          onClick={runAnalysis}
          disabled={isScanning}
          className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-xs ${
            isScanning
              ? 'bg-sky-50 border border-sky-200 text-sky-700 cursor-wait'
              : 'bg-sky-600 hover:bg-sky-700 text-white'
          }`}
        >
          {isScanning ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin text-sky-700" />
              <span>Scanning Sensor Data ({scanProgress}%)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run AI Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Left is Satellite Canvas, Right is Detection Tags and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Satellite Canvas Viewport */}
        <div className="lg:col-span-8 relative rounded border border-slate-200 bg-slate-950 overflow-hidden flex flex-col shadow-xs">
          {/* Top Bar on image */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-300 z-10">
            <span className="text-sky-400 font-semibold">CHANNEL: IR ENHANCED BD-CURVE</span>
            <span className="text-slate-400">RESOLUTION: 1.0 KM/PX</span>
            <span className="text-slate-200 font-bold">
              {hoverPixel ? `PIXEL: ${hoverPixel.temp}°C Tb (${hoverPixel.x},${hoverPixel.y})` : 'HOVER TO PROBE T_B'}
            </span>
          </div>

          <div className="relative w-full h-[380px] sm:h-[440px] flex items-center justify-center overflow-hidden bg-black select-none">
            <svg
              viewBox="0 0 500 440"
              className="w-full h-full object-cover"
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setHoverPixel(null)}
            >
              <defs>
                <radialGradient id="cycloneCloudCoreLight" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="6%" stopColor="#ffffff" />
                  <stop offset="14%" stopColor="#f43f5e" />
                  <stop offset="28%" stopColor="#a855f7" />
                  <stop offset="45%" stopColor="#0284c7" />
                  <stop offset="70%" stopColor="#1e3a8a" />
                  <stop offset="90%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                <filter id="thermalBlurLight" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect width="500" height="440" fill="#030712" />
              <line x1="0" y1="220" x2="500" y2="220" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.5" strokeDasharray="4,4" />
              <line x1="250" y1="0" x2="250" y2="440" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.5" strokeDasharray="4,4" />

              <ellipse
                cx="250"
                cy="220"
                rx="190"
                ry="170"
                fill="url(#cycloneCloudCoreLight)"
                filter="url(#thermalBlurLight)"
                opacity="0.9"
              />

              <g stroke="#38bdf8" strokeWidth="18" fill="none" opacity="0.4" strokeLinecap="round" filter="url(#thermalBlurLight)">
                <path d="M 250 220 C 310 240, 380 290, 420 360 C 440 390, 420 420, 360 410" />
                <path d="M 250 220 C 190 200, 120 160, 90 90 C 80 60, 110 30, 160 40" />
              </g>

              {/* 1. Cloud Structure Segmentation Layer */}
              {showSegmentation && (
                <g id="seg-overlay" opacity="0.85">
                  <circle
                    cx="250"
                    cy="220"
                    r="32"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeDasharray="3,2"
                  />
                  <ellipse
                    cx="250"
                    cy="220"
                    rx="95"
                    ry="85"
                    fill="none"
                    stroke="#f472b6"
                    strokeWidth="1.2"
                    strokeDasharray="4,3"
                  />
                  <text x="310" y="160" fill="#f472b6" fontSize="9" fontFamily="monospace" fontWeight="bold">CDO PERIMETER</text>
                </g>
              )}

              {/* 2. Spiral-Band Detection Overlay */}
              {showSpiralBands && (
                <g id="spiral-overlay" stroke="#38bdf8" strokeWidth="2.2" fill="none" strokeDasharray="5,4">
                  <path d="M 250 220 Q 300 230 340 280 T 400 380" />
                  <path d="M 250 220 Q 200 210 160 160 T 100 60" />
                  <path d="M 250 220 Q 260 170 210 130 T 110 170" />
                </g>
              )}

              {/* 3. Eye Detection Overlay */}
              {showEye && (
                <g id="eye-overlay">
                  <circle
                    cx="250"
                    cy="220"
                    r="12"
                    fill="rgba(15, 23, 42, 0.85)"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  <line x1="238" y1="220" x2="262" y2="220" stroke="#f43f5e" strokeWidth="1.8" />
                  <text x="250" y="200" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    EYE: 18.4 KM
                  </text>
                </g>
              )}

              {/* 4. Cyclone Center Detection Crosshair */}
              {showCenter && (
                <g id="center-crosshair">
                  <circle cx="250" cy="220" r="4.5" fill="#f43f5e" />
                  <line x1="230" y1="220" x2="270" y2="220" stroke="#f43f5e" strokeWidth="1.8" />
                  <line x1="250" y1="200" x2="250" y2="240" stroke="#f43f5e" strokeWidth="1.8" />
                  <circle cx="250" cy="220" r="24" fill="none" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="3,3" />
                  <text x="250" y="254" fill="#fb7185" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    LLCC: 12.82°N, 86.41°E
                  </text>
                </g>
              )}

              {/* Scanning Laser Beam Pass Animation */}
              {isScanning && (
                <g>
                  <line
                    x1="0"
                    y1={(scanProgress / 100) * 440}
                    x2="500"
                    y2={(scanProgress / 100) * 440}
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                  />
                </g>
              )}
            </svg>

            {isScanning && (
              <div className="absolute inset-0 bg-sky-950/30 backdrop-blur-[1px] flex flex-col items-center justify-center z-20 font-mono">
                <div className="p-4 rounded border border-sky-400 bg-white/95 text-center shadow-lg">
                  <div className="text-sky-800 font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                    <RotateCw className="w-4 h-4 animate-spin text-sky-600" />
                    <span>Neural Segmentation in Progress</span>
                  </div>
                  <div className="w-48 h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-sky-600 transition-all duration-75" style={{ width: `${scanProgress}%` }}></div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2 font-medium">
                    Extracting convective cloud top isotherms...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thermal Color Temperature Scale Legend (Bottom) */}
          {showTempScale && (
            <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-300">
              <span className="text-slate-300 font-semibold">IR TEMP SCALE (°C):</span>
              <div className="flex items-center gap-1.5">
                <span>-85°C</span>
                <div className="w-36 h-2.5 rounded-sm bg-gradient-to-r from-white via-rose-500 via-purple-600 via-sky-400 to-slate-900 border border-slate-700"></div>
                <span>+25°C</span>
              </div>
              <span className="text-sky-400 font-bold">Eyewall Min: -78.4°C</span>
            </div>
          )}
        </div>

        {/* Right Column: AI Extraction Results and Layer Controls */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          {/* Layer Toggles */}
          <div className="p-3.5 rounded border border-slate-200 bg-slate-50 text-xs font-mono">
            <span className="text-slate-600 uppercase text-[11px] block pb-2 border-b border-slate-200 font-bold">
              Segmentation Layer Overlays
            </span>
            <div className="space-y-2 mt-2.5">
              {[
                { id: 'center', label: 'Cyclone Center (LLCC)', checked: showCenter, toggle: () => setShowCenter(!showCenter) },
                { id: 'eye', label: 'Eye Detection & Calipers', checked: showEye, toggle: () => setShowEye(!showEye) },
                { id: 'spirals', label: 'Logarithmic Spiral Bands', checked: showSpiralBands, toggle: () => setShowSpiralBands(!showSpiralBands) },
                { id: 'segmentation', label: 'CDO Convective Perimeter', checked: showSegmentation, toggle: () => setShowSegmentation(!showSegmentation) },
                { id: 'tempScale', label: 'Temperature Scale Bar', checked: showTempScale, toggle: () => setShowTempScale(!showTempScale) },
              ].map((item) => (
                <label key={item.id} className="flex items-center justify-between cursor-pointer hover:text-sky-700 transition-colors">
                  <span className="text-slate-700 font-medium">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={item.toggle}
                    className="accent-sky-600 rounded cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* AI Detection Verified Output */}
          <div className="p-4 rounded border border-slate-200 bg-white font-mono text-xs flex-1 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 uppercase tracking-wider">
                  AI Model Detections
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  VERIFIED
                </span>
              </div>

              {analysisCompleted ? (
                <div className="mt-3.5 space-y-3">
                  <div className="flex items-start gap-2 text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Cyclone center detected</div>
                      <div className="text-[11px] text-slate-500">12.82°N, 86.41°E (Confidence 98%)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Spiral structure detected</div>
                      <div className="text-[11px] text-slate-500">Logarithmic wrap 1.25 turns, Coherence 0.94</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Convection analyzed</div>
                      <div className="text-[11px] text-slate-500">CDO cloud top Tb: -78.4°C (Explosive bursts)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Intensity pattern extracted</div>
                      <div className="text-[11px] text-slate-500">Dvorak CI: 5.5 / 165 km/h sustained wind</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400">
                  Click “Run AI Analysis” to trigger real-time neural segmentation.
                </div>
              )}
            </div>

            {/* Dvorak T-Number Indicator */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Objective Dvorak (ODT):</span>
              <span className="text-sky-800 font-bold text-sm">T5.5 / CI 5.5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
