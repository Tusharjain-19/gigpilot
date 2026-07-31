import React, { useState, useEffect } from 'react';
import { Upload, FileImage, Sparkles, CheckCircle2, XCircle, Fuel, Navigation, ShieldCheck, Car } from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../services/translations';

export default function ScreenshotOCR() {
  const [selectedPreset, setSelectedPreset] = useState('swiggy_high');
  const [trafficLevel, setTrafficLevel] = useState('moderate');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [lang, setLang] = useState(window.__selectedLang || 'en');

  useEffect(() => {
    const handleLang = (e) => setLang(e.detail || 'en');
    window.addEventListener('langChanged', handleLang);
    return () => window.removeEventListener('langChanged', handleLang);
  }, []);

  const presets = [
    { id: 'swiggy_high', title: 'Swiggy Dinner Order', payout: 165, distanceKm: 4.2, pickup: "Truffles, Koramangala", drop: "Sector 3, HSR Layout", badge: 'High Yield' },
    { id: 'zomato_long', title: 'Zomato Long Distance', payout: 110, distanceKm: 9.8, pickup: "Meghana Foods, Indiranagar", drop: "Whitefield Main Rd", badge: 'High Traffic Risk' },
    { id: 'uber_surge', title: 'Uber Package Delivery', payout: 210, distanceKm: 6.5, pickup: "MG Road Metro Station", drop: "Electronic City Phase 1", badge: 'Surge Order' }
  ];

  const handleParse = async (presetId, traffic) => {
    setIsScanning(true);
    const activePreset = presetId || selectedPreset;
    const activeTraffic = traffic || trafficLevel;

    try {
      const res = await api.parseScreenshotOCR({
        screenshotType: activePreset,
        trafficLevel: activeTraffic
      });
      setResult(res);
    } catch (err) {
      console.error("OCR parse error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    handleParse('swiggy_high', 'moderate');
  }, []);

  const handleSelectPreset = (p) => {
    setSelectedPreset(p.id);
    handleParse(p.id, trafficLevel);
  };

  const handleTrafficChange = (t) => {
    setTrafficLevel(t);
    handleParse(selectedPreset, t);
  };

  const t = translations[lang] || translations.en;

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="card-panel p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded bg-[#15803D]/10 border border-[#15803D]/30 text-[#79DB8D]">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-[#F4F4F5] tracking-tight flex items-center gap-2">
              {t.ocrPredictor}
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#111318] text-[#79DB8D] border border-[#272A31]">
                OCR PARSER
              </span>
            </h3>
            <p className="text-xs text-[#A1A1AA]">{t.screenshotUpload}</p>
          </div>
        </div>

        {/* Preset Sample Screenshots */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-[#272A31]">
          {presets.map((p) => {
            const isSelected = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-3 rounded border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#111318] text-[#F4F4F5] border-[#15803D]'
                    : 'bg-[#111318] border-[#272A31] hover:border-[#3F493F] text-[#A1A1AA]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-semibold truncate flex items-center gap-1.5 text-[#F4F4F5]">
                    <FileImage className="w-3.5 h-3.5 text-[#79DB8D]" /> {p.title}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#27272A] text-[#E4E4E7]">
                    {p.badge}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-mono font-bold text-[#79DB8D]">₹{p.payout}</span>
                  <span className="text-[10px] text-[#A1A1AA] font-mono">{p.distanceKm} km</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Traffic Level Selector */}
      <div className="card-panel p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[#F4F4F5]">
          <span className="flex items-center gap-1.5">
            <Car className="w-4 h-4 text-[#79DB8D]" /> Live Route Traffic Condition:
          </span>
          <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
            {trafficLevel} TRAFFIC
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'low', label: 'Low Traffic', desc: 'No delay (1.0x fuel)', color: 'border-[#15803D] text-[#79DB8D] bg-[#15803D]/10' },
            { id: 'moderate', label: 'Moderate Surge', desc: '+9 min delay (1.18x fuel)', color: 'border-[#C2410C] text-[#FFB59D] bg-[#C2410C]/10' },
            { id: 'heavy', label: 'Heavy Gridlock', desc: '+18 min delay (1.38x fuel)', color: 'border-[#C2410C] text-[#FFB59D] bg-[#C2410C]/20' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => handleTrafficChange(t.id)}
              className={`p-2.5 rounded border text-center transition-all ${
                trafficLevel === t.id
                  ? `${t.color} font-semibold`
                  : 'bg-[#111318] border-[#272A31] text-[#A1A1AA] hover:border-[#3F493F]'
              }`}
            >
              <div className="text-xs">{t.label}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* OCR Parsing Result & Traffic Profit Analysis */}
      {isScanning ? (
        <div className="card-panel p-8 text-center space-y-3">
          <Sparkles className="w-6 h-6 text-[#79DB8D] animate-spin mx-auto" />
          <p className="text-xs font-medium text-[#A1A1AA]">Scanning order slip & calculating traffic delay...</p>
        </div>
      ) : result && (
        <div className="card-panel p-4 sm:p-5 space-y-4">
          
          {/* Recommendation Banner */}
          <div className={`p-4 rounded flex items-center justify-between gap-3 ${
            result.recommendation.action === 'ACCEPT'
              ? 'bg-[#15803D] text-[#F4F4F5]'
              : 'bg-[#C2410C] text-[#F4F4F5]'
          }`}>
            <div className="flex items-center gap-3">
              {result.recommendation.action === 'ACCEPT' ? (
                <CheckCircle2 className="w-6 h-6 text-[#F4F4F5] shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-[#F4F4F5] shrink-0" />
              )}
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">
                  TRAFFIC DECISION
                </span>
                <h4 className="text-lg font-heading font-bold uppercase">{result.recommendation.action}</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-heading font-bold">₹{result.trafficAnalysis.effectiveHourlyRate}<span className="text-xs font-normal opacity-80">/hr</span></span>
              <div className="text-[9px] uppercase font-mono">REAL HOURLY RATE</div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="p-3 bg-[#111318] rounded border border-[#272A31] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#79DB8D] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium text-[#F4F4F5]">
              "{result.recommendation.reason}"
            </p>
          </div>

          {/* Traffic Breakdown Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-[#111318] p-2.5 rounded border border-[#272A31]">
              <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block mb-1">PAYOUT</span>
              <span className="text-base font-heading font-bold text-[#F4F4F5]">₹{result.parsedOrder.payout}</span>
            </div>

            <div className="bg-[#111318] p-2.5 rounded border border-[#272A31]">
              <span className="text-[10px] font-mono text-[#FFB59D] uppercase block mb-1">FUEL + TRAFFIC</span>
              <span className="text-base font-heading font-bold text-[#FFB59D]">-₹{result.trafficAnalysis.adjustedFuelCost}</span>
            </div>

            <div className="bg-[#111318] p-2.5 rounded border border-[#272A31]">
              <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block mb-1">DURATION</span>
              <span className="text-base font-heading font-bold text-[#F4F4F5]">{result.trafficAnalysis.totalTimeMin} m <span className="text-[10px] text-[#C2410C] font-normal">(+{result.trafficAnalysis.trafficDelayMin}m)</span></span>
            </div>

            <div className="bg-[#15803D]/10 p-2.5 rounded border border-[#15803D]/30">
              <span className="text-[10px] font-mono text-[#79DB8D] uppercase block mb-1">NET PROFIT</span>
              <span className="text-lg font-heading font-bold text-[#79DB8D]">₹{result.trafficAnalysis.adjustedProfit}</span>
            </div>
          </div>

          {/* Route details */}
          <div className="bg-[#111318] p-3 rounded border border-[#272A31] space-y-1 text-xs">
            <div className="flex items-center justify-between text-[#E4E4E7]">
              <span className="text-[#A1A1AA]">Pickup:</span>
              <span className="font-medium">{result.parsedOrder.pickupLocation}</span>
            </div>
            <div className="flex items-center justify-between text-[#E4E4E7]">
              <span className="text-[#A1A1AA]">Dropoff:</span>
              <span className="font-medium">{result.parsedOrder.dropLocation}</span>
            </div>
            <div className="text-[11px] text-[#A1A1AA] pt-1 border-t border-[#272A31] italic">
              {result.trafficAnalysis.trafficDescription}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
