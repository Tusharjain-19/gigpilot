// In-Memory Database Store for GigPilot AI - Realistic Gig Data

export const worker = {
  id: "demo-worker-01",
  name: "Rajesh Kumar",
  platform: "Swiggy / Zomato / Uber",
  earningsToday: 385,
  ordersAccepted: 6,
  ordersRejected: 2,
  hoursActiveToday: 2.8,
  location: {
    lat: 12.9166,
    lng: 77.6101,
    city: "Bangalore",
    area: "BTM Layout 2nd Stage"
  },
  weather: {
    temp: "26°C",
    condition: "Light Rain / Monsoon Surge",
    surgeBonus: 25,
    rainImpact: "+25% Surge Payout (+5 min rain delay)"
  },
  apiKeys: {
    openWeatherKey: "demo-weather-key-9921",
    swiggyToken: "swig-partner-token-8841",
    zomatoToken: "zom-partner-token-7732",
    uberKey: "uber-driver-key-4412"
  },
  gigDNA: {
    reliability: 84,
    safety: 88,
    efficiency: 78,
    incomeStability: 74,
    customerHappiness: 91
  }
};

export const baseZones = [
  { id: "z1", name: "Koramangala", demand: "high", ratePerHour: 165, distanceKm: 1.8, multiplier: "1.3x", activeDrivers: 14, coords: { x: 35, y: 40 } },
  { id: "z2", name: "Indiranagar", demand: "medium", ratePerHour: 135, distanceKm: 3.2, multiplier: "1.15x", activeDrivers: 22, coords: { x: 65, y: 25 } },
  { id: "z3", name: "HSR Layout", demand: "high", ratePerHour: 155, distanceKm: 2.4, multiplier: "1.25x", activeDrivers: 18, coords: { x: 45, y: 70 } },
  { id: "z4", name: "MG Road", demand: "medium", ratePerHour: 120, distanceKm: 4.5, multiplier: "1.1x", activeDrivers: 30, coords: { x: 75, y: 55 } },
  { id: "z5", name: "Whitefield", demand: "low", ratePerHour: 85, distanceKm: 8.1, multiplier: "1.0x", activeDrivers: 45, coords: { x: 88, y: 80 } },
  { id: "z6", name: "Jayanagar", demand: "high", ratePerHour: 150, distanceKm: 3.8, multiplier: "1.2x", activeDrivers: 12, coords: { x: 20, y: 65 } }
];

export const mockStores = [
  "Truffles, Koramangala",
  "Meghana Foods, Indiranagar",
  "Empire Restaurant, HSR",
  "Corner House Ice Cream",
  "Blinkit Dark Store #4",
  "Third Wave Coffee",
  "Subway, MG Road",
  "KFC, Jayanagar 4th Block"
];
