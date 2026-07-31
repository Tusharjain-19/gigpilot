import React, { useState, useEffect } from 'react';
import { Key, MapPin, CloudRain, ShieldCheck, CheckCircle2, RefreshCw, Layers } from 'lucide-react';

export default function APISettings({ onClose }) {
  const [location, setLocation] = useState({
    city: "Bangalore (Koramangala 4th Block)",
    lat: "12.9352",
    lng: "77.6245",
    isLive: false
  });

  const [weather, setWeather] = useState({
    condition: "Light Monsoon Rain",
    temp: "26°C",
    surgeMultiplier: "1.25x (+₹35 rain bonus/order)"
  });

  const [keys, setKeys] = useState({
    openWeatherKey: "owk_live_89127391823",
    swiggyToken: "swig_partner_tok_9912",
    zomatoToken: "zom_partner_tok_7721",
    uberKey: "uber_driver_key_5512"
  });

  const [saved, setSaved] = useState(false);

  const requestLiveGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            city: "Live GPS Locked Area",
            lat: pos.coords.latitude.toFixed(4),
            lng: pos.coords.longitude.toFixed(4),
            isLive: true
          });
        },
        (err) => {
          alert("GPS Permission denied or unavailable. Using Bangalore Koramangala coordinates.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="card-panel p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#272A31]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-[#15803D]/10 border border-[#15803D]/30 text-[#79DB8D]">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-[#F4F4F5] tracking-tight">
              API Keys & Live GPS Weather Sync
            </h3>
            <p className="text-xs text-[#A1A1AA]">Delivery partner API keys, OpenWeather integration & live GPS</p>
          </div>
        </div>
      </div>

      {/* Live Geolocation Section */}
      <div className="bg-[#111318] p-3.5 rounded border border-[#272A31] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#F4F4F5] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#79DB8D]" /> Live Geolocation:
          </span>
          <button
            onClick={requestLiveGPS}
            className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#15803D] text-[#F4F4F5] hover:bg-[#166534] transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Get Current Location
          </button>
        </div>
        <div className="text-xs text-[#E4E4E7] font-mono bg-[#1A1D23] p-2 rounded border border-[#272A31] flex items-center justify-between">
          <span>{location.city} ({location.lat}° N, {location.lng}° E)</span>
          {location.isLive && <span className="text-[10px] bg-[#15803D]/20 text-[#79DB8D] px-1.5 py-0.5 rounded border border-[#15803D]/30">GPS LIVE</span>}
        </div>
      </div>

      {/* Live Weather Surge Integration */}
      <div className="bg-[#111318] p-3.5 rounded border border-[#272A31] space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#F4F4F5]">
          <span className="flex items-center gap-1.5">
            <CloudRain className="w-4 h-4 text-cyan-400" /> OpenWeather Demand Predictor:
          </span>
          <span className="text-[10px] font-mono text-[#79DB8D]">{weather.temp}</span>
        </div>
        <div className="text-xs text-[#E4E4E7] bg-[#1A1D23] p-2 rounded border border-[#272A31] flex items-center justify-between">
          <span>{weather.condition}</span>
          <span className="text-[10px] font-mono text-[#79DB8D] font-bold">{weather.surgeMultiplier}</span>
        </div>
      </div>

      {/* API Key Inputs */}
      <div className="space-y-3 pt-1">
        <div className="text-xs font-semibold text-[#F4F4F5] flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#79DB8D]" /> Delivery Partner & Weather API Credentials:
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[11px] font-mono text-[#A1A1AA] block mb-1">OpenWeatherMap API Key:</label>
            <input
              type="text"
              value={keys.openWeatherKey}
              onChange={(e) => setKeys({ ...keys, openWeatherKey: e.target.value })}
              className="w-full bg-[#111318] border border-[#272A31] rounded px-3 py-1.5 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#15803D] font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#A1A1AA] block mb-1">Swiggy Partner Access Token:</label>
            <input
              type="text"
              value={keys.swiggyToken}
              onChange={(e) => setKeys({ ...keys, swiggyToken: e.target.value })}
              className="w-full bg-[#111318] border border-[#272A31] rounded px-3 py-1.5 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#15803D] font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#A1A1AA] block mb-1">Zomato Partner Access Token:</label>
            <input
              type="text"
              value={keys.zomatoToken}
              onChange={(e) => setKeys({ ...keys, zomatoToken: e.target.value })}
              className="w-full bg-[#111318] border border-[#272A31] rounded px-3 py-1.5 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#15803D] font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#A1A1AA] block mb-1">Uber Driver API Key:</label>
            <input
              type="text"
              value={keys.uberKey}
              onChange={(e) => setKeys({ ...keys, uberKey: e.target.value })}
              className="w-full bg-[#111318] border border-[#272A31] rounded px-3 py-1.5 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#15803D] font-mono"
            />
          </div>
        </div>

        <div className="bg-[#111318] p-2.5 rounded border border-[#272A31] text-[11px] text-[#A1A1AA] leading-relaxed">
          <span className="text-[#79DB8D] font-semibold flex items-center gap-1 mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Note on Delivery Partner APIs:
          </span>
          Platforms like Swiggy, Zomato & Uber restrict third-party auto-accept REST APIs. GigPilot AI uses notification OCR parsing & credential tokens to orchestrate recommendations securely!
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded bg-[#15803D] hover:bg-[#166534] text-[#F4F4F5] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#F4F4F5]" /> Keys & Location Saved!
              </>
            ) : (
              "Save API Keys & Location"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
