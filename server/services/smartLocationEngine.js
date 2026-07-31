import axios from 'axios';
import { baseZones } from '../data/store.js';

// Coordinates for standard zones (Bangalore default centers)
const zoneCoordinates = {
  z7: { lat: 12.9410, lng: 77.5655, name: "Basavanagudi (BMSCE)" },
  z1: { lat: 12.9352, lng: 77.6245, name: "Koramangala" },
  z2: { lat: 12.9784, lng: 77.6408, name: "Indiranagar" },
  z3: { lat: 12.9121, lng: 77.6446, name: "HSR Layout" },
  z4: { lat: 12.9756, lng: 77.6066, name: "MG Road" },
  z5: { lat: 12.9698, lng: 77.7499, name: "Whitefield" },
  z6: { lat: 12.9250, lng: 77.5938, name: "Jayanagar" }
};

// Calculate Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Peak Time Window Analysis
export function getPeakTimeAnalysis(customHour) {
  const currentHour = customHour !== undefined ? customHour : new Date().getHours();

  if (currentHour >= 7 && currentHour < 11) {
    return {
      windowName: "Morning Breakfast & Office Rush",
      timeRange: "8:00 AM - 11:00 AM",
      demandMultiplier: 1.3,
      advice: "Position near commercial hubs & breakfast outlets. High volume of quick short-distance orders.",
      bestCategories: ["Breakfast", "Coffee/Tea", "Quick Grocery"]
    };
  } else if (currentHour >= 11 && currentHour < 16) {
    return {
      windowName: "Lunch Rush Peak",
      timeRange: "12:00 PM - 3:30 PM",
      demandMultiplier: 1.5,
      advice: "Highest order density of the day! Target restaurant clusters in Koramangala & Indiranagar for continuous stacked orders.",
      bestCategories: ["Full Meals", "Biryani", "Corporate Lunches"]
    };
  } else if (currentHour >= 16 && currentHour < 19) {
    return {
      windowName: "Evening Snacks & Quick-Commerce Surge",
      timeRange: "4:30 PM - 7:00 PM",
      demandMultiplier: 1.25,
      advice: "High surge in instant delivery / dark stores (Blinkit/Zepto) & cafes. Low distance, high turnaround.",
      bestCategories: ["Tea/Snacks", "Bakery", "Dark Stores"]
    };
  } else if (currentHour >= 19 && currentHour < 23) {
    return {
      windowName: "Dinner Prime Payout Peak",
      timeRange: "7:30 PM - 11:00 PM",
      demandMultiplier: 1.6,
      advice: "Maximum payout per order + highest surge bonuses! Position near major dining hubs.",
      bestCategories: ["Dinner Outlets", "Family Combos", "Cab Rides"]
    };
  } else {
    return {
      windowName: "Late Night Craving Surge",
      timeRange: "11:00 PM - 3:00 AM",
      demandMultiplier: 1.4,
      advice: "Fewer active drivers on road = zero competition! Focus on 24/7 dark stores & cloud kitchens.",
      bestCategories: ["Late Night Bites", "Desserts", "24/7 Kitchens"]
    };
  }
}

let cachedWeather = null;
let lastWeatherFetchTime = 0;

// Fetch real weather using OpenWeather API if available
export async function getWeatherData(lat = 12.9352, lon = 77.6245) {
  const now = Date.now();
  if (cachedWeather && (now - lastWeatherFetchTime < 300000)) {
    return cachedWeather;
  }

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey || apiKey.startsWith('demo')) {
    cachedWeather = {
      temp: "26°C",
      condition: "Light Rain / Monsoon Surge",
      rainImpact: "+25% Surge Payout (+5 min rain delay)",
      surgeBonusPct: 25,
      isRain: true
    };
    lastWeatherFetchTime = now;
    return cachedWeather;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const response = await axios.get(url, { timeout: 3000 });
    const data = response.data;
    
    const condition = data.weather?.[0]?.main || "Clear";
    const temp = `${Math.round(data.main?.temp || 26)}°C`;
    const isRain = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle') || condition.toLowerCase().includes('thunderstorm');
    
    cachedWeather = {
      temp,
      condition: `${condition} (${data.weather?.[0]?.description || ''})`,
      rainImpact: isRain ? "+25% Surge Payout (+5 min rain delay)" : "Normal weather flow",
      surgeBonusPct: isRain ? 25 : 0,
      isRain
    };
    lastWeatherFetchTime = now;
    return cachedWeather;
  } catch (err) {
    if (!cachedWeather) {
      cachedWeather = {
        temp: "27°C",
        condition: "Partly Cloudy",
        rainImpact: "Normal weather flow",
        surgeBonusPct: 0,
        isRain: false
      };
      lastWeatherFetchTime = now;
    }
    return cachedWeather;
  }
}

// Smart Zone Recommendation Algorithm
export async function calculateSmartLocationRecommendation(userLat = 12.9352, userLng = 77.6245, customHour) {
  const weather = await getWeatherData(userLat, userLng);
  const timeAnalysis = getPeakTimeAnalysis(customHour);

  const processedZones = baseZones.map(zone => {
    const coords = zoneCoordinates[zone.id] || { lat: userLat + 0.02, lng: userLng + 0.02 };
    const distanceKm = calculateDistance(userLat, userLng, coords.lat, coords.lng);
    const estTravelTimeMin = Math.round(distanceKm * 3 + 2); // ~20km/h urban speed

    // Competition Index based on active drivers
    // Lower active drivers = lower competition index = higher score for worker!
    let competitionLevel = "Medium";
    let competitionFactor = 1.0;
    if (zone.activeDrivers < 15) {
      competitionLevel = "Low (High Order Priority)";
      competitionFactor = 0.75; // 25% advantage due to low competition
    } else if (zone.activeDrivers > 25) {
      competitionLevel = "High (Crowded Driver Zone)";
      competitionFactor = 1.35; // 35% penalty due to driver crowding
    }

    // Weather & Surge Multiplier
    const weatherBonus = weather.surgeBonusPct > 0 ? (1 + weather.surgeBonusPct / 100) : 1.0;
    const baseMult = parseFloat(zone.multiplier || "1.0");
    const effectiveSurge = Number((baseMult * timeAnalysis.demandMultiplier * weatherBonus).toFixed(2));

    // Expected Rate per Hour
    const baseRate = zone.ratePerHour || 150;
    const expectedRatePerHour = Math.round(baseRate * effectiveSurge);

    // Fuel cost to reach zone (₹6/km)
    const travelCost = Math.round(distanceKm * 6);
    const netGainFirstHour = expectedRatePerHour - travelCost;

    // Smart Score Formula:
    // High Rate * High Surge / (Competition Factor * Distance Penalty)
    const distancePenalty = 1 + (distanceKm * 0.08);
    const smartOpportunityScore = Math.round((expectedRatePerHour / (competitionFactor * distancePenalty)) * 10) / 10;

    return {
      id: zone.id,
      name: zone.name,
      coords: zone.coords,
      distanceKm,
      estTravelTimeMin,
      demand: zone.demand,
      activeDrivers: zone.activeDrivers,
      competitionLevel,
      baseRatePerHour: baseRate,
      effectiveSurge: `${effectiveSurge}x`,
      expectedRatePerHour,
      travelCostToZone: travelCost,
      netGainFirstHour,
      smartOpportunityScore
    };
  });

  // Sort by highest Smart Opportunity Score
  processedZones.sort((a, b) => b.smartOpportunityScore - a.smartOpportunityScore);

  const topZone = processedZones[0];

  return {
    userCoordinates: { lat: userLat, lng: userLng },
    weather,
    peakTimeAnalysis: timeAnalysis,
    recommendedZone: {
      zoneId: topZone.id,
      zoneName: topZone.name,
      distanceKm: topZone.distanceKm,
      travelTime: `${topZone.estTravelTimeMin} mins travel`,
      competitionLevel: topZone.competitionLevel,
      projectedRate: `₹${topZone.expectedRatePerHour}/hr (${topZone.effectiveSurge} surge)`,
      actionPrompt: topZone.distanceKm < 0.5
        ? `You are in ${topZone.name} (Top Hotspot) — Low driver competition & ${topZone.effectiveSurge} surge active. Stay in this zone to maximize orders (₹${topZone.expectedRatePerHour}/hr).`
        : `Head to ${topZone.name} (${topZone.distanceKm}km away, ~${topZone.estTravelTimeMin}m) — Low driver competition & ${topZone.effectiveSurge} surge. Projected earnings: ₹${topZone.expectedRatePerHour}/hr.`,
      netFirstHourProfit: `₹${topZone.netGainFirstHour} after travel fuel`
    },
    rankedZones: processedZones
  };
}
