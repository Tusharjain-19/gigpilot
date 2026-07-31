// External API Service Layer for GigPilot AI
// Integrates: OpenWeatherMap, TomTom Traffic, Browser GPS
// All functions gracefully fall back to realistic simulated data if no API key is provided

// ─── REAL BANGALORE FUEL ECONOMICS ─────────────────────────
// Petrol price Bangalore July 2026: ₹102.86/L
// Average delivery bike mileage: 45 km/L
// Real fuel cost per km: ₹2.29/km
export const FUEL_PRICE_PER_LITER = 102.86;
export const BIKE_MILEAGE_KM_PER_L = 45;
export const FUEL_COST_PER_KM = parseFloat((FUEL_PRICE_PER_LITER / BIKE_MILEAGE_KM_PER_L).toFixed(2)); // ₹2.29

// ─── WEATHER API (OpenWeatherMap) ───────────────────────────
export async function fetchWeather(lat, lng, apiKey) {
  if (!apiKey || apiKey.startsWith('demo') || apiKey.length < 10) {
    return getSimulatedWeather();
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenWeather API error: ${res.status}`);
    const data = await res.json();

    const isRaining = data.weather?.[0]?.main === 'Rain' || data.weather?.[0]?.main === 'Drizzle' || data.weather?.[0]?.main === 'Thunderstorm';
    const isHot = data.main?.temp > 36;
    const isStorm = data.weather?.[0]?.main === 'Thunderstorm';

    return {
      source: 'live',
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      condition: data.weather?.[0]?.description || 'clear',
      icon: data.weather?.[0]?.icon,
      isRaining,
      isHot,
      isStorm,
      windSpeed: data.wind?.speed,
      surgeMultiplier: isStorm ? 1.45 : isRaining ? 1.28 : isHot ? 1.12 : 1.0,
      surgeLabel: isStorm ? '⛈️ Storm Surge +45%' : isRaining ? '🌧️ Rain Surge +28%' : isHot ? '🔥 Heat Surge +12%' : '☀️ Clear — Normal',
      demandNote: isRaining
        ? 'Monsoon surge active. Platforms boosting delivery payouts by 25–40%. Accept orders aggressively!'
        : isHot
        ? 'Heat driving drink & ice cream orders. Grocery zones in demand.'
        : 'Normal demand conditions. Focus on high-density restaurant zones.'
    };
  } catch (err) {
    console.warn('[Weather] Falling back to simulated data:', err.message);
    return getSimulatedWeather();
  }
}

function getSimulatedWeather() {
  // Realistic Bangalore monsoon season simulation
  const scenarios = [
    { isRaining: true, temp: 24, condition: 'light rain', surgeMultiplier: 1.28, surgeLabel: '🌧️ Rain Surge +28%', demandNote: 'Monsoon surge active. Platforms boosting payouts by 25–40%!' },
    { isRaining: false, temp: 31, condition: 'partly cloudy', surgeMultiplier: 1.0, surgeLabel: '⛅ Partly Cloudy — Normal', demandNote: 'Normal demand. Focus on Koramangala restaurant corridor.' },
    { isRaining: false, temp: 37, condition: 'hot and sunny', surgeMultiplier: 1.12, surgeLabel: '🔥 Heat Surge +12%', demandNote: 'High heat driving drink & grocery orders in Indiranagar.' },
    { isRaining: true, temp: 22, condition: 'heavy rain', surgeMultiplier: 1.42, surgeLabel: '⛈️ Storm Surge +42%', demandNote: 'Heavy rain! Massive surge — take every profitable order now!' }
  ];
  const pick = scenarios[Math.floor(Date.now() / 300000) % scenarios.length]; // rotate every 5 mins for demo
  return { source: 'simulated', humidity: 78, windSpeed: 12, ...pick };
}

// ─── TRAFFIC API (TomTom) ────────────────────────────────────
export async function fetchTrafficFlow(fromLat, fromLng, toLat, toLng, apiKey) {
  if (!apiKey || apiKey.startsWith('demo') || apiKey.length < 10) {
    return getSimulatedTraffic(fromLat, fromLng, toLat, toLng);
  }

  // TomTom Flow Segment Data API - query midpoint of route
  const midLat = (fromLat + toLat) / 2;
  const midLng = (fromLng + toLng) / 2;

  try {
    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${midLat},${midLng}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TomTom API error: ${res.status}`);
    const data = await res.json();

    const segment = data.flowSegmentData;
    const currentSpeed = segment?.currentSpeed || 30;
    const freeFlowSpeed = segment?.freeFlowSpeed || 50;
    const congestionRatio = freeFlowSpeed / Math.max(currentSpeed, 1);
    const congestionLevel = congestionRatio > 2.5 ? 'heavy' : congestionRatio > 1.5 ? 'moderate' : 'light';

    return buildTrafficResult({
      source: 'live',
      currentSpeed,
      freeFlowSpeed,
      congestionRatio,
      congestionLevel
    });
  } catch (err) {
    console.warn('[Traffic] Falling back to simulated data:', err.message);
    return getSimulatedTraffic(fromLat, fromLng, toLat, toLng);
  }
}

function getSimulatedTraffic(fromLat, fromLng, toLat, toLng) {
  // Bangalore traffic simulation based on time of day
  const hour = new Date().getHours();
  let congestionLevel, currentSpeed, freeFlowSpeed;

  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    // Peak hours — heavy congestion
    congestionLevel = 'heavy';
    currentSpeed = Math.floor(Math.random() * 8) + 6;  // 6–14 km/h
    freeFlowSpeed = 45;
  } else if ((hour >= 7 && hour <= 11) || (hour >= 16 && hour <= 21)) {
    // Semi-peak
    congestionLevel = 'moderate';
    currentSpeed = Math.floor(Math.random() * 12) + 18; // 18–30 km/h
    freeFlowSpeed = 45;
  } else {
    // Off-peak
    congestionLevel = 'light';
    currentSpeed = Math.floor(Math.random() * 10) + 35; // 35–45 km/h
    freeFlowSpeed = 45;
  }

  return buildTrafficResult({
    source: 'simulated',
    currentSpeed,
    freeFlowSpeed,
    congestionRatio: freeFlowSpeed / currentSpeed,
    congestionLevel
  });
}

function buildTrafficResult({ source, currentSpeed, freeFlowSpeed, congestionRatio, congestionLevel }) {
  const delayMinutes = congestionLevel === 'heavy' ? Math.floor(Math.random() * 8) + 14
    : congestionLevel === 'moderate' ? Math.floor(Math.random() * 6) + 7
    : Math.floor(Math.random() * 3) + 1;

  const fuelSurgeMultiplier = congestionLevel === 'heavy' ? 1.38
    : congestionLevel === 'moderate' ? 1.18
    : 1.0;

  const bottleneck = congestionLevel === 'heavy'
    ? 'Silk Board junction gridlock detected'
    : congestionLevel === 'moderate'
    ? 'Outer Ring Road moderate congestion'
    : 'Roads flowing freely';

  return {
    source,
    congestionLevel,
    currentSpeed,
    freeFlowSpeed,
    congestionRatio: parseFloat(congestionRatio.toFixed(2)),
    delayMinutes,
    fuelSurgeMultiplier,
    bottleneck,
    label: congestionLevel === 'heavy' ? '🔴 Heavy Gridlock'
      : congestionLevel === 'moderate' ? '🟡 Moderate Traffic'
      : '🟢 Traffic Flowing',
    color: congestionLevel === 'heavy' ? '#C2410C' : congestionLevel === 'moderate' ? '#D97706' : '#15803D'
  };
}

// ─── PROFIT CALCULATOR (using real fuel economics) ──────────
export function calculateRealProfit({
  payout,
  distanceKm,
  fuelPricePerLiter = FUEL_PRICE_PER_LITER,
  bikeMileageKmPerL = BIKE_MILEAGE_KM_PER_L,
  trafficFuelSurgeMultiplier = 1.0,
  weatherSurgeMultiplier = 1.0
}) {
  const fuelCostPerKm = fuelPricePerLiter / bikeMileageKmPerL;
  const baseFuelCost = parseFloat((distanceKm * fuelCostPerKm).toFixed(2));
  const adjustedFuelCost = parseFloat((baseFuelCost * trafficFuelSurgeMultiplier).toFixed(2));
  const adjustedPayout = parseFloat((payout * weatherSurgeMultiplier).toFixed(2));
  const netProfit = parseFloat((adjustedPayout - adjustedFuelCost).toFixed(2));
  const profitMargin = adjustedPayout > 0 ? netProfit / adjustedPayout : 0;

  return {
    fuelCostPerKm: parseFloat(fuelCostPerKm.toFixed(2)),
    baseFuelCost,
    adjustedFuelCost,
    adjustedPayout,
    netProfit,
    profitMargin: parseFloat(profitMargin.toFixed(3))
  };
}
