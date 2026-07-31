import React, { useState, useEffect } from 'react';
import { Radar, Navigation, ArrowUpRight, Compass, Sparkles, MapPin, Gauge, ExternalLink, Clock, CloudRain, X } from 'lucide-react';
import { translations } from '../services/translations';

// Default spatial coordinates around worker center (50%, 50%)
const fallbackZoneCoords = {
  koramangala: { x: 32, y: 38 },
  indiranagar: { x: 72, y: 24 },
  'hsr layout': { x: 42, y: 76 },
  'mg road': { x: 76, y: 52 },
  whitefield: { x: 88, y: 20 },
  jayanagar: { x: 18, y: 64 }
};

export default function OpportunityRadar({ zones = [], topRecommendation, weather, peakTimeAnalysis }) {
  const [selectedZone, setSelectedZone] = useState(zones[0] || null);
  const [activeRouteModal, setActiveRouteModal] = useState(null);
  const [lang, setLang] = useState(window.__selectedLang || 'en');

  useEffect(() => {
    const handleLang = (e) => setLang(e.detail || 'en');
    window.addEventListener('langChanged', handleLang);
    return () => window.removeEventListener('langChanged', handleLang);
  }, []);

  useEffect(() => {
    if (zones.length > 0 && !selectedZone) {
      setSelectedZone(zones[0]);
    }
  }, [zones]);

  const getDemandColor = (demand) => {
    switch (demand) {
      case 'high':
        return {
          bg: 'bg-[#15803D]/10 border-[#15803D]/40 text-[#15803D] dark:text-[#79DB8D]',
          dot: 'bg-[#15803D]',
          badge: 'bg-[#15803D] text-white font-mono font-semibold',
          accent: 'text-[#15803D] dark:text-[#79DB8D]'
        };
      case 'medium':
        return {
          bg: 'bg-[#C2410C]/10 border-[#C2410C]/40 text-[#C2410C] dark:text-[#FFB59D]',
          dot: 'bg-[#C2410C]',
          badge: 'bg-[#C2410C] text-white font-mono font-semibold',
          accent: 'text-[#C2410C] dark:text-[#FFB59D]'
        };
      default:
        return {
          bg: 'bg-[var(--surface-low)] border-[var(--border-color)] text-[var(--text-muted)]',
          dot: 'bg-[#71717A]',
          badge: 'bg-[var(--surface-low)] text-[var(--text-muted)] border border-[var(--border-color)] font-mono',
          accent: 'text-[var(--text-muted)]'
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

  const openGoogleMapsRoute = (zone) => {
    const destination = encodeURIComponent(`${zone.name}, Bangalore, Karnataka`);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(mapsUrl, '_blank');
  };

  const handleStartNavigation = (zone) => {
    setActiveRouteModal(zone);
    openGoogleMapsRoute(zone);
  };

  const t = translations[lang] || translations.en;

  const recZoneName = topRecommendation?.zoneName || currentZone?.name || 'Koramangala';
  const recZoneObj = zones.find(z => z.name.toLowerCase() === recZoneName.toLowerCase()) || currentZone;

  return (
    <div className="card-panel p-4 sm:p-5 relative overflow-hidden">
      
      {/* Dynamic Keyframe Animations for Radar Sweep */}
      <style>{`
        @keyframes radarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseRipple {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .radar-sweep-beam {
          animation: radarSpin 4s linear infinite;
          transform-origin: center center;
        }
        .radar-pulse-ring {
          animation: pulseRipple 3s ease-out infinite;
        }
      `}</style>

      {/* Section Title */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-[#15803D]/10 border border-[#15803D]/30 text-[#15803D] dark:text-[#79DB8D]">
            <Radar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              {t.radarTitle || 'Opportunity Radar'}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">{t.radarDesc || 'Live demand density & real-time rate hotspots'}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-primary)] bg-[var(--surface-low)] border border-[var(--border-color)] px-2.5 py-1 rounded flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping"></span>
            <Compass className="w-3 h-3 text-[#15803D]" /> {t.gpsSweep || 'LIVE GPS SWEEP'}
          </span>
        </div>
      </div>

      {/* Dynamic AI Recommendation Banner */}
      <div className="mb-4 bg-[var(--surface-low)] border border-[#15803D]/40 rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded bg-[#15803D]/20 text-[#15803D] dark:text-[#79DB8D] shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-semibold text-[#15803D] dark:text-[#79DB8D] uppercase tracking-wider">{t.aiRecommendation || 'AI RECOMMENDATION'}</div>
            <div className="text-xs sm:text-sm font-medium text-[var(--text-primary)] leading-tight">
              {topRecommendation?.actionPrompt || `Head to ${recZoneName} → Low competition & high profit surge zone.`}
            </div>
          </div>
        </div>
        <button
          onClick={() => handleStartNavigation(recZoneObj)}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded bg-[#15803D] hover:bg-[#166534] active:scale-95 text-white text-xs font-semibold transition-all shrink-0 shadow-md"
        >
          <Navigation className="w-3.5 h-3.5" /> {t.route || 'Route'}
        </button>
      </div>

      {/* Google Maps Styled Interactive Radar Canvas */}
      <div className="relative w-full h-72 sm:h-80 bg-[#0B0F17] rounded-xl border border-[var(--border-color)] overflow-hidden mb-4 flex items-center justify-center shadow-inner">
        
        {/* Map Vector Grid & Road Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#15803D_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        
        {/* Simulated Road Lines (Google Maps dark theme aesthetic) */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none stroke-[#79DB8D]" strokeWidth="1.5" fill="none">
          <path d="M 0 100 Q 150 140 400 120 T 800 200" strokeDasharray="4 4" />
          <path d="M 120 0 Q 180 180 220 350" />
          <path d="M 300 0 Q 250 160 380 350" strokeWidth="2" />
          <path d="M 0 220 Q 200 200 400 260 T 800 240" strokeWidth="2" />
        </svg>

        {/* Concentric Radar Distance Rings */}
        <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-[#15803D]/20 pointer-events-none"></div>
        <div className="absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full border border-[#15803D]/30 pointer-events-none"></div>
        <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#15803D]/40 pointer-events-none"></div>
        
        {/* Radar Crosshair Axes */}
        <div className="absolute w-full h-[1px] bg-[#15803D]/25 pointer-events-none"></div>
        <div className="absolute h-full w-[1px] bg-[#15803D]/25 pointer-events-none"></div>

        {/* Pulsing Radar Ripple Ring */}
        <div className="absolute w-36 h-36 rounded-full border border-[#79DB8D] radar-pulse-ring pointer-events-none"></div>

        {/* 360-Degree Rotating Radar Beam Sweep */}
        <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full pointer-events-none radar-sweep-beam">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, rgba(21, 128, 61, 0.35) 0deg, rgba(121, 219, 141, 0.15) 30deg, transparent 60deg)'
            }}
          ></div>
        </div>

        {/* Center Marker: YOU (Current Worker Location) */}
        <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="relative flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-[#15803D]/40 border-2 border-[#79DB8D] flex items-center justify-center shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-[#79DB8D] animate-ping"></div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-white bg-[#15803D] px-2 py-0.5 rounded-full border border-[#79DB8D] mt-1 shadow-md">
            {t.you || 'YOU'}
          </span>
        </div>

        {/* Nearby Map Location Pins with Hourly Rates */}
        {zones.map((zone) => {
          const keyName = zone.name.toLowerCase();
          const defaultPos = fallbackZoneCoords[keyName] || { x: 50, y: 50 };
          const posX = zone.coords?.x !== undefined ? zone.coords.x : defaultPos.x;
          const posY = zone.coords?.y !== undefined ? zone.coords.y : defaultPos.y;

          const style = getDemandColor(zone.demand);
          const isSelected = currentZone.id === zone.id;
          const displayRate = zone.expectedRatePerHour || zone.ratePerHour;

          return (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              style={{ left: `${posX}%`, top: `${posY}%` }}
              className={`absolute z-10 transform -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-all duration-200 group`}
            >
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-lg transition-all ${
                isSelected
                  ? 'bg-[#111318] border-[#79DB8D] ring-2 ring-[#15803D] scale-110 z-30'
                  : 'bg-[#111318]/90 border-[#272A31] hover:border-[#15803D] hover:scale-105'
              }`}>
                <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`}></span>
                <span className="text-xs font-semibold text-white whitespace-nowrap">{zone.name}</span>
                <span className="text-[10px] font-mono font-bold text-[#79DB8D] bg-[#15803D]/20 px-1.5 py-0.5 rounded border border-[#15803D]/40">
                  ₹{displayRate}/h
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Zone Cards Grid below Map */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {zones.map((zone) => {
          const style = getDemandColor(zone.demand);
          const isSelected = currentZone.id === zone.id;
          const displayRate = zone.expectedRatePerHour || zone.ratePerHour;
          return (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`cursor-pointer rounded p-2.5 border transition-all ${
                isSelected
                  ? 'bg-[var(--surface-low)] border-[#15803D] ring-1 ring-[#15803D]/30'
                  : 'bg-[var(--surface-card)] border-[var(--border-color)] hover:border-[#15803D]'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{zone.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase ${style.badge}`}>
                  {zone.demand}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="font-mono font-bold text-[#15803D] dark:text-[#79DB8D] text-sm">₹{displayRate}<span className="text-[10px] text-[var(--text-muted)] font-normal">/hr</span></span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{zone.distanceKm} km</span>
              </div>

              <div className="mt-2 pt-1.5 border-t border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] flex items-center justify-between">
                <span className="truncate">{zone.competitionLevel ? zone.competitionLevel.split(' ')[0] + ' Drivers' : `Surge ${zone.multiplier || zone.effectiveSurge}`}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartNavigation(zone);
                  }}
                  className="text-[#15803D] dark:text-[#79DB8D] hover:underline font-semibold flex items-center gap-0.5 shrink-0"
                >
                  Route <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Modal / Route Details Drawer */}
      {activeRouteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface-card)] border border-[var(--border-color)] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-[#15803D]/10 text-[#15803D] dark:text-[#79DB8D]">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                    Navigation Route: {activeRouteModal.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">Opening turn-by-turn route on Google Maps</p>
                </div>
              </div>
              <button
                onClick={() => setActiveRouteModal(null)}
                className="p-1 rounded hover:bg-[var(--surface-low)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Route Highlights */}
            <div className="space-y-2.5">
              <div className="bg-[var(--surface-low)] rounded p-3 border border-[var(--border-color)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#15803D]" /> Distance & Time
                </span>
                <span className="font-mono font-semibold text-[var(--text-primary)]">
                  {activeRouteModal.distanceKm} km ({activeRouteModal.estTravelTimeMin || Math.round(activeRouteModal.distanceKm * 3 + 2)} mins travel)
                </span>
              </div>

              <div className="bg-[var(--surface-low)] rounded p-3 border border-[var(--border-color)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-[#15803D]" /> Projected Rate / Surge
                </span>
                <span className="font-mono font-bold text-[#15803D] dark:text-[#79DB8D]">
                  ₹{activeRouteModal.expectedRatePerHour || activeRouteModal.ratePerHour}/hr ({activeRouteModal.effectiveSurge || activeRouteModal.multiplier || '1.4x'})
                </span>
              </div>

              <div className="bg-[var(--surface-low)] rounded p-3 border border-[var(--border-color)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#15803D]" /> Driver Competition
                </span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {activeRouteModal.competitionLevel || 'Low Driver Density'}
                </span>
              </div>

              {peakTimeAnalysis && (
                <div className="bg-[var(--surface-low)] rounded p-3 border border-[var(--border-color)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#15803D]" /> Optimal Shift Window
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {peakTimeAnalysis.windowName}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => openGoogleMapsRoute(activeRouteModal)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded bg-[#15803D] hover:bg-[#166534] text-white font-semibold text-xs active:scale-95 transition-all shadow-md"
              >
                <ExternalLink className="w-4 h-4" /> Launch Google Maps Navigation
              </button>
              <button
                onClick={() => setActiveRouteModal(null)}
                className="px-4 py-2.5 rounded bg-[var(--surface-low)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-semibold text-xs transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
