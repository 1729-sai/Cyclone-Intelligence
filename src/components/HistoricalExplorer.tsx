import React, { useState, useMemo } from 'react';
import { HistoricalCycloneRecord } from '../types/cyclone';
import { Search, History, MapPin, ArrowUpDown } from 'lucide-react';

interface HistoricalExplorerProps {
  records: HistoricalCycloneRecord[];
  speedUnit: 'km/h' | 'knots';
  onSelectHistoricalTrack: (cyclone: HistoricalCycloneRecord) => void;
  selectedComparisonId?: string | null;
}

export const HistoricalExplorer: React.FC<HistoricalExplorerProps> = ({
  records,
  speedUnit,
  onSelectHistoricalTrack,
  selectedComparisonId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'year' | 'maxWindKmh' | 'minPressureHpa' | 'durationDays'>('year');
  const [sortAsc, setSortAsc] = useState(false);

  const formatSpeed = (kmh: number) => {
    if (speedUnit === 'knots') {
      return `${Math.round(kmh * 0.539957)} kt`;
    }
    return `${kmh} km/h`;
  };

  const regions = useMemo(() => {
    const list = Array.from(new Set(records.map(r => r.region.split(' / ')[0])));
    return ['ALL', ...list];
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const matchesSearch =
          rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.peakCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.year.toString().includes(searchTerm);
        const matchesRegion =
          regionFilter === 'ALL' || rec.region.includes(regionFilter);
        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (sortAsc) {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [records, searchTerm, regionFilter, sortField, sortAsc]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="w-full rounded border border-slate-200 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-600" />
            <h3 className="text-base font-bold font-mono tracking-wider text-slate-900 uppercase">
              Historical Cyclone Explorer
            </h3>
          </div>
          <p className="mt-1 text-xs font-mono text-slate-600">
            North Indian Ocean analog cyclone database with track projection
          </p>
        </div>

        {/* Search & Region Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cyclone or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 w-48 sm:w-56"
            />
          </div>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Regions</option>
            {regions.filter(r => r !== 'ALL').map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider bg-slate-50 font-bold">
              <th className="py-2.5 px-3">Cyclone</th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-sky-700 transition-colors"
                onClick={() => toggleSort('year')}
              >
                <div className="flex items-center gap-1">
                  <span>Year</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3">Region / Basin</th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-sky-700 transition-colors"
                onClick={() => toggleSort('maxWindKmh')}
              >
                <div className="flex items-center gap-1">
                  <span>Max Wind</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-sky-700 transition-colors"
                onClick={() => toggleSort('minPressureHpa')}
              >
                <div className="flex items-center gap-1">
                  <span>Min Pressure</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-sky-700 transition-colors"
                onClick={() => toggleSort('durationDays')}
              >
                <div className="flex items-center gap-1">
                  <span>Duration</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Map Overlay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.map((rec) => {
              const isSelectedOnMap = selectedComparisonId === rec.id;

              return (
                <tr
                  key={rec.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    isSelectedOnMap ? 'bg-amber-50/60' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <span>{rec.name}</span>
                    {rec.riObserved && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                        RI
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 tabular-nums font-semibold">{rec.year}</td>
                  <td className="py-2.5 px-3 text-slate-600">{rec.region}</td>
                  <td className="py-2.5 px-3 text-sky-800 font-bold tabular-nums">
                    {formatSpeed(rec.maxWindKmh)}
                  </td>
                  <td className="py-2.5 px-3 text-rose-600 font-bold tabular-nums">
                    {rec.minPressureHpa} hPa
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 tabular-nums">
                    {rec.durationDays} days
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectHistoricalTrack(rec)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all ${
                        isSelectedOnMap
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
                      }`}
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{isSelectedOnMap ? 'Active on Map' : 'Load on Map'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No historical cyclones match query "{searchTerm}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
