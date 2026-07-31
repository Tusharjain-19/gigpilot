import axios from 'axios';

// Coordinates for Bangalore key zones
const locationCoordinates = {
  koramangala: { lat: 12.9352, lng: 77.6245 },
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  'hsr layout': { lat: 12.9121, lng: 77.6446 },
  'mg road': { lat: 12.9756, lng: 77.6066 },
  whitefield: { lat: 12.9698, lng: 77.7499 },
  jayanagar: { lat: 12.9250, lng: 77.5938 },
  'btm layout': { lat: 12.9166, lng: 77.6101 },
  'electronic city': { lat: 12.8399, lng: 77.6770 }
};

// Get coordinates for location string
function resolveCoordinates(locationName, defaultLat = 12.9352, defaultLng = 77.6245) {
  if (!locationName) return { lat: defaultLat, lng: defaultLng };
  const lower = locationName.toLowerCase();
  for (const key in locationCoordinates) {
    if (lower.includes(key)) {
      return locationCoordinates[key];
    }
  }
  return { lat: defaultLat + (Math.random() - 0.5) * 0.04, lng: defaultLng + (Math.random() - 0.5) * 0.04 };
}

// 1. Fetch live Traffic Flow from TomTom Traffic Flow API
export async function fetchTomTomTrafficFlow(lat = 12.9352, lng = 77.6245) {
  const apiKey = process.env.TOMTOM_API_KEY;
  if (!apiKey || apiKey.startsWith('demo')) {
    return {
      currentSpeed: 22,
      freeFlowSpeed: 38,
      congestionRatio: 1.72,
      trafficDelayMin: 11,
      source: "Simulation Fallback"
    };
  }

  try {
    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point=${lat},${lng}&key=${apiKey}`;
    const res = await axios.get(url, { timeout: 3500 });
    const flowData = res.data?.flowSegmentData;

    if (flowData) {
      const currentSpeed = flowData.currentSpeed || 25;
      const freeFlowSpeed = flowData.freeFlowSpeed || 45;
      const currentTravelTime = flowData.currentTravelTime || 300;
      const freeFlowTravelTime = flowData.freeFlowTravelTime || 180;
      
      const trafficDelaySec = Math.max(0, currentTravelTime - freeFlowTravelTime);
      const trafficDelayMin = Math.round(trafficDelaySec / 60);
      const congestionRatio = Number((freeFlowSpeed / Math.max(1, currentSpeed)).toFixed(2));

      return {
        currentSpeed,
        freeFlowSpeed,
        currentTravelTimeSec: currentTravelTime,
        freeFlowTravelTimeSec: freeFlowTravelTime,
        trafficDelayMin,
        congestionRatio,
        confidence: flowData.confidence || 0.9,
        source: "Live TomTom Traffic API"
      };
    }
  } catch (err) {
    console.warn("TomTom Traffic Flow API error:", err.message);
  }

  return {
    currentSpeed: 20,
    freeFlowSpeed: 40,
    congestionRatio: 2.0,
    trafficDelayMin: 12,
    source: "TomTom API Fallback Model"
  };
}

// 2. Calculate live Route and Traffic Delays using TomTom Routing API
export async function calculateTomTomRouteTraffic(pickupLoc, dropLoc, distanceKm) {
  const origin = resolveCoordinates(pickupLoc, 12.9352, 77.6245);
  const dest = resolveCoordinates(dropLoc, 12.9784, 77.6408);
  const apiKey = process.env.TOMTOM_API_KEY;

  let liveTrafficData = null;

  if (apiKey && !apiKey.startsWith('demo')) {
    try {
      const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${origin.lat},${origin.lng}:${dest.lat},${dest.lng}/json?key=${apiKey}&traffic=true`;
      const res = await axios.get(routeUrl, { timeout: 4000 });
      const summary = res.data?.routes?.[0]?.summary;

      if (summary) {
        const travelTimeMin = Math.round(summary.travelTimeInSeconds / 60);
        const trafficDelayMin = Math.round((summary.trafficDelayInSeconds || 0) / 60);
        const liveDistanceKm = Number((summary.lengthInMeters / 1000).toFixed(1));

        liveTrafficData = {
          travelTimeMin,
          trafficDelayMin,
          liveDistanceKm: liveDistanceKm > 0 ? liveDistanceKm : distanceKm,
          hasLiveTraffic: true,
          source: "TomTom Live Routing Engine"
        };
      }
    } catch (err) {
      console.warn("TomTom Routing API fallback:", err.message);
    }
  }

  // Fallback / complement with Traffic Flow API
  if (!liveTrafficData) {
    const flow = await fetchTomTomTrafficFlow(origin.lat, origin.lng);
    const baseTimeMin = Math.round(distanceKm * 3.5 + 6);
    const trafficDelayMin = flow.trafficDelayMin;
    const travelTimeMin = baseTimeMin + trafficDelayMin;

    liveTrafficData = {
      travelTimeMin,
      trafficDelayMin,
      liveDistanceKm: distanceKm,
      hasLiveTraffic: false,
      source: flow.source
    };
  }

  // Fuel Surcharge calculation based on live traffic delay
  const baseFuelCost = Math.round(liveTrafficData.liveDistanceKm * 6.0);
  const trafficFuelPenalty = Math.round(liveTrafficData.trafficDelayMin * 1.5); // ₹1.5 per idling min in gridlock
  const totalAdjustedFuelCost = baseFuelCost + trafficFuelPenalty;

  return {
    ...liveTrafficData,
    baseFuelCost,
    trafficFuelPenalty,
    totalAdjustedFuelCost
  };
}
