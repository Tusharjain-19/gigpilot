import React, { useState, useEffect, useRef } from 'react';
import { Radar, Navigation, ArrowUpRight, Compass, Sparkles, MapPin, Gauge, ExternalLink, Clock, CloudRain, X, CheckCircle } from 'lucide-react';
import L from 'leaflet';
import { translations } from '../services/translations';

// Default spatial coordinates around Bangalore center
const zoneMapCoordinates = {
  z1: { lat: 12.9352, lng: 77.6245, name: "Koramangala" },
  z2: { lat: 12.9784, lng: 77.6408, name: "Indiranagar" },
  z3: { lat: 12.9121, lng: 77.6446, name: "HSR Layout" },
  z4: { lat: 12.9756, lng: 77.6066, name: "MG Road" },
  z5: { lat: 12.9698, lng: 77.7499, name: "Whitefield" },
  z6: { lat: 12.9250, lng: 77.5938, name: "Jayanagar" }
};

export default function OpportunityRadar({ zones = [], topRecommendation, weather, peakTimeAnalysis }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [selectedZone, setSelectedZone] = useState(zones[0] || null);
  const [activeRouteModal, setActiveRouteModal] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 12.9166, lng: 77.6101, name: "BTM Layout (Live GPS)" });
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);
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

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // Dark Mode CartoDB Tile Layer (Google Maps Dark vector aesthetic)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers whenever userLocation or zones change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // 1. Add Pulsing YOU Marker at user live GPS coordinates
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-[#15803D]/40 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-[#15803D] border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-lg">
            YOU
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .bindPopup(`<div class="font-sans text-xs font-bold text-slate-800">📍 ${userLocation.name}</div>`)
      .addTo(map);

    markersRef.current.push(userMarker);

    // 2. Add Zone Markers
    zones.forEach(zone => {
      const coords = zoneMapCoordinates[zone.id] || { lat: userLocation.lat + 0.02, lng: userLocation.lng + 0.02 };
      const displayRate = zone.expectedRatePerHour || zone.ratePerHour;
      const isSelected = selectedZone?.id === zone.id;

      const markerColor = zone.demand === 'high' ? '#15803D' : (zone.demand === 'medium' ? '#C2410C' : '#71717A');

      const zoneIcon = L.divIcon({
        className: 'custom-zone-marker',
        html: `
          <div class="cursor-pointer transition-transform duration-200 hover:scale-110 flex items-center gap-1 px-2 py-0.5 rounded-full border shadow-md ${
            isSelected
              ? 'bg-[#111318] border-[#79DB8D] ring-2 ring-[#15803D] scale-110 z-30'
              : 'bg-[#111318]/90 border-[#272A31]'
          }">
            <span class="w-2 h-2 rounded-full" style="background-color: ${markerColor}"></span>
            <span class="text-[11px] font-bold text-white whitespace-nowrap">${zone.name}</span>
            <span class="text-[10px] font-mono font-bold text-[#79DB8D] bg-[#15803D]/20 px-1 py-0.2 rounded border border-[#15803D]/40">
              ₹${displayRate}/h
            </span>
          </div>
        `,
        iconSize: [120, 26],
        iconAnchor: [60, 13]
      });

      const zoneMarker = L.marker([coords.lat, coords.lng], { icon: zoneIcon })
        .on('click', () => setSelectedZone(zone))
        .addTo(map);

      markersRef.current.push(zoneMarker);
    });

  }, [userLocation, zones, selectedZone]);

  // Get Live Browser Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = {
          lat: Number(latitude.toFixed(4)),
          lng: Number(longitude.toFixed(4)),
          name: "Live GPS Location"
        };
        setUserLocation(newLoc);
        setIsLocating(false);

        // Center map on new location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
        }
      },
      (err) => {
        setIsLocating(false);
        setGpsError("Permission denied or GPS signal unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
    ratePerHour: 322,
    distanceKm: 2.6,
    activeDrivers: 14,
    effectiveSurge: '1.95x'
  };

  const currentDemandStyle = getDemandColor(currentZone.demand);

  const handleOpenGoogleMapsRoute = (zoneName) => {
    const coords = zoneMapCoordinates[selectedZone?.id || 'z1'] || { lat: 12.9352, lng: 77.6245 };
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${coords.lat},${coords.lng}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="space-y-4 pb-20">

      {/* Top Banner Header & GPS Trigger */}
      <div className="card-panel p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--text-primary)] flex items-center gap-2">
              <Radar className="w-5 h-5 text-[#15803D] dark:text-[#79DB8D] animate-spin" style={{ animationDuration: '6s' }} />
              Live 360° Opportunity Radar
            </h3>
            <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-[#15803D]/10 text-[#15803D] dark:text-[#79DB8D] border border-[#15803D]/30 uppercase">
              GPS ACTIVE
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#15803D]" /> Current Position: <span className="font-semibold text-[var(--text-primary)]">{userLocation.name} ({userLocation.lat}, {userLocation.lng})</span>
          </p>
        </div>

        <button
          onClick={handleGetLocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-3.5 py-2 rounded bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold active:scale-95 transition-all shadow-sm shrink-0"
        >
          <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Acquiring GPS...' : 'Locate Me (Live GPS)'}</span>
        </button>
      </div>

      {gpsError && (
        <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
          <span>⚠️ {gpsError} — Defaulting to Bangalore center.</span>
        </div>
      )}

      {/* Proactive Top Recommendation Banner */}
      {topRecommendation && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#15803D]/20 via-[#111318] to-[#111318] border border-[#15803D]/40 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#15803D] text-white shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold text-[#79DB8D] uppercase tracking-wider">TOP COPILOT RECOMMENDATION</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                  {topRecommendation.surgeMultiplier || '1.95x'} SURGE
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#F4F4F5] mt-0.5">
                {topRecommendation.actionPrompt || `Head to ${topRecommendation.zoneName} (${topRecommendation.distanceKm}km away) — Low competition.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenGoogleMapsRoute(topRecommendation.zoneName)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold transition-all shrink-0 active:scale-95 shadow"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            <span>Route</span>
          </button>
        </div>
      )}

      {/* Leaflet Live Vector Map Container */}
      <div className="relative card-panel rounded-xl overflow-hidden shadow-lg border border-[var(--border-color)]">
        
        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-80 sm:h-96 lg:h-[420px] bg-[#090B0E]" />

        {/* 360-Degree Rotating Conic Radar Sweep Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden">
          <div
            className="w-[450px] h-[450px] rounded-full border border-[#15803D]/20 animate-spin"
            style={{
              animationDuration: '7s',
              animationTimingFunction: 'linear',
              background: 'conic-gradient(from 0deg at 50% 50%, rgba(21, 128, 61, 0.25) 0deg, rgba(21, 128, 61, 0) 65deg, transparent 360deg)'
            }}
          />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-[#15803D]/25" />
          <div className="absolute w-[150px] h-[150px] rounded-full border border-[#15803D]/30" />
        </div>

        {/* Floating Map Legend Overlay */}
        <div className="absolute top-3 right-3 z-20 bg-[#111318]/90 backdrop-blur-md p-2.5 rounded-lg border border-[#272A31] text-[10px] text-slate-300 space-y-1 shadow-md hidden xs:block">
          <div className="font-mono font-bold text-[9px] text-[#A1A1AA] uppercase tracking-wider mb-1">LIVE DEMAND MAP</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#15803D]"></span> High Surge (&gt;₹240/h)</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#C2410C]"></span> Moderate (&gt;₹180/h)</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#71717A]"></span> Standard Flow</div>
        </div>
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
              className={`cursor-pointer rounded-lg p-2.5 sm:p-3 border transition-all ${
                isSelected
                  ? 'card-panel-active bg-[#15803D]/10 border-[#15803D] ring-1 ring-[#15803D]'
                  : 'card-panel hover:border-[var(--text-muted)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-heading font-semibold text-[var(--text-primary)] truncate">{zone.name}</span>
                <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-sm font-heading font-bold text-[#15803D] dark:text-[#79DB8D]">₹{displayRate}/h</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">{zone.distanceKm} km</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Zone Deep-Dive Details */}
      <div className="card-panel p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${currentDemandStyle.bg}`}>
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-bold text-base text-[var(--text-primary)]">{currentZone.name}</h4>
                <span className={`text-[9px] px-2 py-0.5 rounded ${currentDemandStyle.badge}`}>
                  {currentZone.demand?.toUpperCase()} DEMAND
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{currentZone.distanceKm} km from current location</p>
            </div>
          </div>

          <button
            onClick={() => setActiveRouteModal(currentZone)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold transition-all active:scale-95 shadow"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Route</span>
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[var(--surface-low)] p-2.5 rounded-lg border border-[var(--border-color)]">
            <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] block uppercase">Est. Hourly Earnings</span>
            <span className="text-base font-heading font-bold text-[#15803D] dark:text-[#79DB8D]">₹{currentZone.expectedRatePerHour || currentZone.ratePerHour}/hr</span>
          </div>

          <div className="bg-[var(--surface-low)] p-2.5 rounded-lg border border-[var(--border-color)]">
            <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] block uppercase">Surge Multiplier</span>
            <span className="text-base font-heading font-bold text-[var(--text-primary)]">{currentZone.effectiveSurge || currentZone.multiplier || '1.4x'}</span>
          </div>

          <div className="bg-[var(--surface-low)] p-2.5 rounded-lg border border-[var(--border-color)]">
            <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] block uppercase">Active Drivers</span>
            <span className="text-base font-heading font-bold text-[var(--text-primary)]">{currentZone.activeDrivers || 14} drivers</span>
          </div>

          <div className="bg-[var(--surface-low)] p-2.5 rounded-lg border border-[var(--border-color)]">
            <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] block uppercase">Driver Competition</span>
            <span className="text-base font-heading font-bold text-[#15803D] dark:text-[#79DB8D] capitalize">{currentZone.competitionLevel || 'Low'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Route Details Modal */}
      {activeRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111318] max-w-md w-full rounded-xl border border-[#272A31] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#272A31] pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#79DB8D]" />
                <h3 className="font-heading font-bold text-base text-white">Google Maps Route Details</h3>
              </div>
              <button onClick={() => setActiveRouteModal(null)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-[#1A1D23] border border-[#272A31] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Origin:</span>
                  <span className="font-semibold text-white">{userLocation.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination:</span>
                  <span className="font-semibold text-emerald-400">{activeRouteModal.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Distance & Time:</span>
                  <span className="font-semibold text-white">{activeRouteModal.distanceKm} km (~{Math.round(activeRouteModal.distanceKm * 3.5 + 4)} mins)</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#15803D]/10 border border-[#15803D]/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Low competition route — Projected yield ₹{activeRouteModal.expectedRatePerHour || activeRouteModal.ratePerHour}/hr.</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setActiveRouteModal(null)}
                className="py-2.5 rounded-lg border border-[#272A31] bg-[#1A1D23] hover:bg-[#272A31] text-slate-300 font-semibold text-xs transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleOpenGoogleMapsRoute(activeRouteModal.name);
                  setActiveRouteModal(null);
                }}
                className="py-2.5 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
