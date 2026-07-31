import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileImage, Sparkles, CheckCircle2, XCircle, Fuel, Navigation, ShieldCheck, Car, Image as ImageIcon, AlertTriangle, RefreshCw, DollarSign, ArrowRight } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { api } from '../services/api';
import { translations } from '../services/translations';

export default function ScreenshotOCR() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('swiggy_high');
  const [trafficLevel, setTrafficLevel] = useState('moderate');
  const [isScanning, setIsScanning] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [extractedRawText, setExtractedRawText] = useState('');

  // Editable parsed fields
  const [payout, setPayout] = useState(165);
  const [distanceKm, setDistanceKm] = useState(4.2);
  const [pickupLoc, setPickupLoc] = useState('Truffles, Koramangala');
  const [dropLoc, setDropLoc] = useState('Sector 3, HSR Layout');
  const [platformName, setPlatformName] = useState('Swiggy');

  const [analysisResult, setAnalysisResult] = useState(null);
  const [lang, setLang] = useState(window.__selectedLang || 'en');

  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleLang = (e) => setLang(e.detail || 'en');
    window.addEventListener('langChanged', handleLang);
    return () => window.removeEventListener('langChanged', handleLang);
  }, []);

  const presets = [
    { id: 'swiggy_high', title: 'Swiggy High Yield', payout: 185, distanceKm: 4.2, pickup: "Truffles, Koramangala", drop: "Sector 3, HSR Layout", badge: 'High Yield', platform: 'Swiggy', imgUrl: '/test_screenshots/swiggy_high.png' },
    { id: 'zomato_long', title: 'Zomato Long Distance', payout: 45, distanceKm: 9.8, pickup: "Meghana Foods, Indiranagar", drop: "Whitefield Main Rd", badge: 'High Traffic Risk', platform: 'Zomato', imgUrl: '/test_screenshots/zomato_long.png' },
    { id: 'uber_surge', title: 'Uber Package Surge', payout: 240, distanceKm: 6.5, pickup: "MG Road Metro Station", drop: "Electronic City Phase 1", badge: 'Surge Order', platform: 'Uber', imgUrl: '/test_screenshots/uber_surge.png' },
    { id: 'low_pay_loss', title: 'Blinkit Underpaid Loss', payout: 35, distanceKm: 8.0, pickup: "Blinkit Dark Store #4", drop: "Sector 7, BTM Layout", badge: 'Loss Risk', platform: 'Blinkit', imgUrl: '/test_screenshots/blinkit_low.png' }
  ];

  // Perform Profit/Loss Calculation
  const calculateProfitLoss = (currentPayout, currentDist, traffic) => {
    const numPayout = Number(currentPayout) || 0;
    const numDist = Number(currentDist) || 0;

    const baseFuelRate = 6.0; // ₹6 per km
    const baseFuelCost = Math.round(numDist * baseFuelRate);

    let trafficDelayMin = 0;
    let fuelMult = 1.0;
    let trafficDesc = "Smooth flow";

    if (traffic === 'moderate') {
      trafficDelayMin = 9;
      fuelMult = 1.18;
      trafficDesc = "Moderate congestion (+9 min delay, +18% fuel cost)";
    } else if (traffic === 'heavy') {
      trafficDelayMin = 18;
      fuelMult = 1.38;
      trafficDesc = "Heavy gridlock (+18 min delay, +38% fuel burned idling)";
    }

    const totalFuelCost = Math.round(baseFuelCost * fuelMult);
    const netProfit = numPayout - totalFuelCost;
    const isProfit = netProfit > 0;
    const profitMarginPct = numPayout > 0 ? Math.round((netProfit / numPayout) * 100) : 0;

    const baseTimeMin = Math.round(numDist * 4 + 8);
    const totalTimeMin = baseTimeMin + trafficDelayMin;
    const effectiveHourlyRate = totalTimeMin > 0 ? Math.round((netProfit / totalTimeMin) * 60) : 0;

    let action = "ACCEPT";
    let statusText = "PROFITABLE ORDER";
    let reason = `Solid profit — net ₹${netProfit} (${profitMarginPct}% margin) for ${numDist}km trip. Hourly rate ₹${effectiveHourlyRate}/hr.`;

    if (netProfit <= 20) {
      action = "REJECT";
      statusText = "LOSS / VERY LOW PROFIT";
      reason = `High loss/fuel impact! Payout is ₹${numPayout} but total fuel & delay cost is ₹${totalFuelCost}. Net return is only ₹${netProfit}. Skip order.`;
    } else if (profitMarginPct < 35) {
      action = "REJECT";
      statusText = "LOW MARGIN UNDERPAID";
      reason = `Profit margin (${profitMarginPct}%) is below fair threshold. Platform is underpaying for ${numDist}km travel.`;
    }

    setAnalysisResult({
      payout: numPayout,
      distanceKm: numDist,
      baseFuelCost,
      totalFuelCost,
      netProfit,
      isProfit,
      profitMarginPct,
      totalTimeMin,
      trafficDelayMin,
      effectiveHourlyRate,
      trafficDesc,
      recommendation: {
        action,
        statusText,
        reason
      }
    });
  };

  useEffect(() => {
    calculateProfitLoss(payout, distanceKm, trafficLevel);
  }, [payout, distanceKm, trafficLevel]);

  // Run Tesseract OCR on uploaded image
  const processImageOCR = async (imageSrc) => {
    setIsScanning(true);
    setOcrStatus('Initializing AI OCR Engine...');
    try {
      const worker = await createWorker('eng');
      setOcrStatus('Scanning screenshot text & numbers...');

      const ret = await worker.recognize(imageSrc);
      const text = ret.data.text;
      setExtractedRawText(text);

      setOcrStatus('Analyzing extracted payout, distance & location...');

      // Extract Payout (₹)
      let detectedPayout = payout;
      const payoutMatch = text.match(/(?:₹|rs\.?|inr|pay(?:out)?|total)\s*:?\s*(\d{2,4})/i) ||
                          text.match(/(\d{2,4})\s*(?:₹|rs|rupees)/i) ||
                          text.match(/\b([4-9]\d|[1-9]\d{2,3})\b/);
      if (payoutMatch && payoutMatch[1]) {
        detectedPayout = parseInt(payoutMatch[1], 10);
      }

      // Extract Distance (km)
      let detectedDistance = distanceKm;
      const distMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers|kms)/i);
      if (distMatch && distMatch[1]) {
        detectedDistance = parseFloat(distMatch[1]);
      }

      // Extract Platform
      let detectedPlatform = platformName;
      if (/swiggy/i.test(text)) detectedPlatform = 'Swiggy';
      else if (/zomato/i.test(text)) detectedPlatform = 'Zomato';
      else if (/uber/i.test(text)) detectedPlatform = 'Uber';
      else if (/blinkit|zepto/i.test(text)) detectedPlatform = 'Blinkit / Zepto';

      setPayout(detectedPayout);
      setDistanceKm(detectedDistance);
      setPlatformName(detectedPlatform);

      calculateProfitLoss(detectedPayout, detectedDistance, trafficLevel);
      await worker.terminate();
    } catch (err) {
      console.warn("OCR recognition fallback:", err);
    } finally {
      setIsScanning(false);
      setOcrStatus('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setImagePreview(dataUrl);
      setSelectedPreset(null);
      processImageOCR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (p) => {
    setSelectedPreset(p.id);
    setImagePreview(p.imgUrl);
    setUploadedImage(null);
    setPayout(p.payout);
    setDistanceKm(p.distanceKm);
    setPickupLoc(p.pickup);
    setDropLoc(p.drop);
    setPlatformName(p.platform);
    if (p.imgUrl) {
      processImageOCR(p.imgUrl);
    } else {
      calculateProfitLoss(p.payout, p.distanceKm, trafficLevel);
    }
  };

  const t = translations[lang] || translations.en;

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="card-panel p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#15803D]/10 border border-[#15803D]/30 text-[#15803D] dark:text-[#79DB8D]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                {t.ocrPredictor || 'AI Screenshot OCR Profit Analyzer'}
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#15803D]/20 text-[#15803D] dark:text-[#79DB8D] border border-[#15803D]/30">
                  LIVE MODEL
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)]">Upload any order screenshot to extract payout, distance & compute real profit or loss</p>
            </div>
          </div>
        </div>

        {/* File Upload Dropzone */}
        <div className="mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#15803D]/50 hover:border-[#15803D] bg-[var(--surface-low)] rounded-xl p-5 text-center cursor-pointer transition-all hover:bg-[#15803D]/5 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#15803D]/10 text-[#15803D] dark:text-[#79DB8D] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-all">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-heading font-bold text-[var(--text-primary)]">
              Click to Upload Order Screenshot
            </h4>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Supports Swiggy, Zomato, Uber, Blinkit, Zepto order slips (PNG, JPG, WEBP)
            </p>
          </div>
        </div>

        {/* Sample Screenshot Presets */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
          <div className="text-[11px] font-mono font-semibold text-[var(--text-muted)] uppercase mb-2">
            Or test with sample screenshots:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((p) => {
              const isSelected = selectedPreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2.5 rounded border text-left transition-all ${
                    isSelected
                      ? 'bg-[var(--surface-low)] text-[var(--text-primary)] border-[#15803D] ring-1 ring-[#15803D]/30'
                      : 'bg-[var(--surface-card)] border-[var(--border-color)] hover:border-[#15803D] text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-semibold truncate text-[var(--text-primary)]">{p.title}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-mono font-bold text-[#15803D] dark:text-[#79DB8D]">₹{p.payout}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{p.distanceKm} km</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Traffic Level Selector */}
      <div className="card-panel p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
          <span className="flex items-center gap-1.5">
            <Car className="w-4 h-4 text-[#15803D] dark:text-[#79DB8D]" /> Live Route Traffic Condition:
          </span>
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
            {trafficLevel} TRAFFIC
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'low', label: 'Low Traffic', desc: 'No delay (1.0x fuel)', color: 'border-[#15803D] text-[#15803D] dark:text-[#79DB8D] bg-[#15803D]/10' },
            { id: 'moderate', label: 'Moderate Surge', desc: '+9 min delay (1.18x fuel)', color: 'border-[#C2410C] text-[#C2410C] dark:text-[#FFB59D] bg-[#C2410C]/10' },
            { id: 'heavy', label: 'Heavy Gridlock', desc: '+18 min delay (1.38x fuel)', color: 'border-[#C2410C] text-[#C2410C] dark:text-[#FFB59D] bg-[#C2410C]/20' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTrafficLevel(t.id)}
              className={`p-2.5 rounded border text-center transition-all ${
                trafficLevel === t.id
                  ? `${t.color} font-semibold`
                  : 'bg-[var(--surface-low)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#15803D]'
              }`}
            >
              <div className="text-xs">{t.label}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detected / Editable Fields Bar */}
      <div className="card-panel p-4 space-y-3">
        <div className="text-xs font-heading font-bold text-[var(--text-primary)] flex items-center justify-between">
          <span>Detected Order Slip Parameters</span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">Edit values to recalculate profit</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] block mb-1">PLATFORM</label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full bg-[var(--surface-low)] border border-[var(--border-color)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-semibold"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] block mb-1">PAYOUT (₹)</label>
            <input
              type="number"
              value={payout}
              onChange={(e) => setPayout(Number(e.target.value))}
              className="w-full bg-[var(--surface-low)] border border-[var(--border-color)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-bold font-mono text-[#15803D] dark:text-[#79DB8D]"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] block mb-1">DISTANCE (KM)</label>
            <input
              type="number"
              step="0.1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full bg-[var(--surface-low)] border border-[var(--border-color)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-bold font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] block mb-1">PICKUP LOCATION</label>
            <input
              type="text"
              value={pickupLoc}
              onChange={(e) => setPickupLoc(e.target.value)}
              className="w-full bg-[var(--surface-low)] border border-[var(--border-color)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>

      {/* OCR Image Preview & Raw Text */}
      {imagePreview && (
        <div className="card-panel p-4 flex flex-col sm:flex-row items-center gap-4">
          <img src={imagePreview} alt="Screenshot Preview" className="w-32 h-32 object-cover rounded border border-[var(--border-color)] shrink-0" />
          <div className="flex-1 space-y-1.5 text-xs">
            <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <FileImage className="w-4 h-4 text-[#15803D]" /> Uploaded Screenshot Preview
            </div>
            {extractedRawText && (
              <div className="bg-[var(--surface-low)] p-2 rounded border border-[var(--border-color)] max-h-20 overflow-y-auto text-[10px] font-mono text-[var(--text-muted)]">
                <span className="font-bold text-[var(--text-primary)] block mb-0.5">Raw Extracted OCR Text:</span>
                {extractedRawText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scanning State */}
      {isScanning ? (
        <div className="card-panel p-8 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#15803D] dark:text-[#79DB8D] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[var(--text-primary)]">{ocrStatus || 'Scanning screenshot & running AI profit model...'}</p>
        </div>
      ) : analysisResult && (
        <div className="card-panel p-4 sm:p-5 space-y-4">
          
          {/* Recommendation Banner */}
          <div className={`p-4 rounded-xl flex items-center justify-between gap-3 shadow-md ${
            analysisResult.recommendation.action === 'ACCEPT'
              ? 'bg-[#15803D] text-white'
              : 'bg-[#C2410C] text-white'
          }`}>
            <div className="flex items-center gap-3">
              {analysisResult.recommendation.action === 'ACCEPT' ? (
                <CheckCircle2 className="w-7 h-7 text-white shrink-0" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-white shrink-0" />
              )}
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">
                  {analysisResult.recommendation.statusText}
                </span>
                <h4 className="text-xl font-heading font-bold uppercase">{analysisResult.recommendation.action}</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-heading font-bold">₹{analysisResult.effectiveHourlyRate}<span className="text-xs font-normal opacity-80">/hr</span></span>
              <div className="text-[9px] uppercase font-mono">EFFECTIVE HOURLY RATE</div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="p-3 bg-[var(--surface-low)] rounded border border-[var(--border-color)] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#15803D] dark:text-[#79DB8D] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
              "{analysisResult.recommendation.reason}"
            </p>
          </div>

          {/* Traffic Breakdown Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-[var(--surface-low)] p-2.5 rounded border border-[var(--border-color)]">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block mb-1">GROSS PAYOUT</span>
              <span className="text-base font-heading font-bold text-[var(--text-primary)]">₹{analysisResult.payout}</span>
            </div>

            <div className="bg-[var(--surface-low)] p-2.5 rounded border border-[var(--border-color)]">
              <span className="text-[10px] font-mono text-[#C2410C] dark:text-[#FFB59D] uppercase block mb-1">TOTAL FUEL COST</span>
              <span className="text-base font-heading font-bold text-[#C2410C] dark:text-[#FFB59D]">-₹{analysisResult.totalFuelCost}</span>
            </div>

            <div className="bg-[var(--surface-low)] p-2.5 rounded border border-[var(--border-color)]">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block mb-1">PROFIT MARGIN</span>
              <span className={`text-base font-heading font-bold ${analysisResult.profitMarginPct >= 35 ? 'text-[#15803D] dark:text-[#79DB8D]' : 'text-[#C2410C] dark:text-[#FFB59D]'}`}>
                {analysisResult.profitMarginPct}%
              </span>
            </div>

            <div className={`p-2.5 rounded border ${analysisResult.isProfit ? 'bg-[#15803D]/10 border-[#15803D]/30' : 'bg-[#C2410C]/10 border-[#C2410C]/30'}`}>
              <span className="text-[10px] font-mono uppercase block mb-1 text-[var(--text-muted)]">NET PROFIT / LOSS</span>
              <span className={`text-lg font-heading font-bold ${analysisResult.isProfit ? 'text-[#15803D] dark:text-[#79DB8D]' : 'text-[#C2410C] dark:text-[#FFB59D]'}`}>
                {analysisResult.isProfit ? `+₹${analysisResult.netProfit}` : `-₹${Math.abs(analysisResult.netProfit)}`}
              </span>
            </div>
          </div>

          {/* Traffic Description */}
          <div className="bg-[var(--surface-low)] p-3 rounded border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center justify-between">
            <span>Route Traffic Analysis:</span>
            <span className="font-semibold text-[var(--text-primary)]">{analysisResult.trafficDesc}</span>
          </div>

        </div>
      )}
    </div>
  );
}
