import React, { useState } from 'react';
import { Radar, Navigation, ArrowUpRight, Compass, Sparkles } from 'lucide-react';

export default function OpportunityRadar({ zones = [], topRecommendation }) {
  const [selectedZone, setSelectedZone] = useState(zones[0] || null);

  const getDemandColor = (demand) => {
    switch (demand) {
      case 'high':
        return {
          bg: 'bg-[#15803D]/10 border-[#15803D]/40 text-[#79DB8D]',
          dot: 'bg-[#15803D]',
          badge: 'bg-[#15803D] text-[#F4F4F5] font-mono font-semibold',
          accent: 'text-[#79DB8D]'
        };
      case 'medium':
        return {
          bg: 'bg-[#C2410C]/10 border-[#C2410C]/40 text-[#FFB59D]',
          dot: 'bg-[#C2410C]',
          badge: 'bg-[#C2410C] text-[#F4F4F5] font-mono font-semibold',
          accent: 'text-[#FFB59D]'
        };
      default:
        return {
          bg: 'bg-[#111318] border-[#272A31] text-[#A1A1AA]',
          dot: 'bg-[#71717A]',
          badge: 'bg-[#27272A] text-[#A1A1AA] font-mono',
          accent: 'text-[#A1A1AA]'
        };
    }
  };

  const currentZone = selectedZone || zones[0] || {
    name: 'Koramangala',
    demand: 'high',
    ratePerHour: 245,
    distanceKm: 1.8,
    multiplier: '1.4x'
  };

  return (
    <div className="card-panel p-4 sm:p-5 relative overflow-hidden">
      {/* Section Title */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-[#15803D]/10 border border-[#15803D]/30 text-[#79DB8D]">
            <Radar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-[#F4F4F5] tracking-tight flex items-center gap-2">
              Opportunity Radar
            </h3>
            <p className="text-xs text-[#A1A1AA]">Live demand density & real-time rate hotspots</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#E4E4E7] bg-[#111318] border border-[#272A31] px-2 py-1 rounded flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#15803D]" /> GPS Sweep
          </span>
        </div>
      </div>

      {/* Dynamic Recommendation Banner */}
      <div className="mb-4 bg-[#111318] border border-[#15803D]/40 rounded p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#15803D]/20 text-[#79DB8D] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-semibold text-[#79DB8D] uppercase tracking-wider">AI Recommendation</div>
            <div className="text-xs sm:text-sm font-medium text-[#F4F4F5]">
              {topRecommendation?.actionPrompt || "Move 1.8km North to Koramangala → +₹430 projected gain today."}
            </div>
          </div>
        </div>
        <button className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded bg-[#15803D] hover:bg-[#166534] text-[#F4F4F5] text-xs font-semibold transition-all">
          <Navigation className="w-3.5 h-3.5" /> Route
        </button>
      </div>

      {/* SVG Interactive Map Grid */}
      <div className="relative w-full h-64 sm:h-72 bg-[#111318] rounded border border-[#272A31] overflow-hidden mb-4 flex items-center justify-center">
        {/* Map Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#272A31_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        {/* Concentric Radar Rings */}
        <div className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-[#272A31] pointer-events-none"></div>
        <div className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-[#272A31] pointer-events-none"></div>
        <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#15803D]/30 pointer-events-none"></div>
        
        {/* Radar Crosshairs */}
        <div className="absolute w-full h-[1px] bg-[#272A31] pointer-events-none"></div>
        <div className="absolute h-full w-[1px] bg-[#272A31] pointer-events-none"></div>

        {/* Current Worker Location Marker */}
        <div className="absolute z-20 flex flex-col items-center justify-center" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="w-4 h-4 rounded-full bg-[#15803D]/40 border border-[#79DB8D] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#79DB8D]"></div>
          </div>
          <span className="text-[9px] font-mono font-semibold text-[#F4F4F5] bg-[#111318] px-1.5 py-0.5 rounded border border-[#272A31] mt-1">YOU</span>
        </div>

        {/* Zone Markers on Map */}
        {zones.map((zone) => {
          const style = getDemandColor(zone.demand);
          const isSelected = currentZone.id === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              style={{ left: `${zone.coords?.x || 50}%`, top: `${zone.coords?.y || 50}%` }}
              className={`absolute z-10 transform -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-all`}
            >
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                isSelected
                  ? 'bg-[#111318] border-[#15803D] ring-1 ring-[#15803D] z-30 scale-105'
                  : `${style.bg}`
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                <span className="text-xs font-semibold text-[#F4F4F5] whitespace-nowrap">{zone.name}</span>
                <span className="text-[10px] font-mono font-semibold text-[#79DB8D]">₹{zone.ratePerHour}/h</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Zone Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {zones.map((zone) => {
          const style = getDemandColor(zone.demand);
          const isSelected = currentZone.id === zone.id;
          return (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`cursor-pointer rounded p-2.5 border transition-all ${
                isSelected
                  ? 'bg-[#111318] border-[#15803D]'
                  : 'bg-[#111318] border-[#272A31] hover:border-[#3F493F]'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-[#F4F4F5] truncate">{zone.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase ${style.badge}`}>
                  {zone.demand}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="font-mono font-bold text-[#79DB8D] text-sm">₹{zone.ratePerHour}<span className="text-[10px] text-[#A1A1AA] font-normal">/hr</span></span>
                <span className="text-[10px] text-[#A1A1AA] font-mono">{zone.distanceKm} km</span>
              </div>

              {isSelected && (
                <div className="mt-2 pt-1.5 border-t border-[#272A31] text-[10px] text-[#E4E4E7] flex items-center justify-between">
                  <span>Surge {zone.multiplier}</span>
                  <span className="text-[#79DB8D] font-semibold flex items-center gap-0.5">
                    Route <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
