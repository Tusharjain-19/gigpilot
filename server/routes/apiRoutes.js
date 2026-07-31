import express from 'express';
import { worker, baseZones, mockStores } from '../data/store.js';
import { getRecommendation, updateGigDNAScore, parseOrderOCR } from '../services/recommendationEngine.js';
import { calculateSmartLocationRecommendation, getPeakTimeAnalysis } from '../services/smartLocationEngine.js';
import { calculateTomTomRouteTraffic, fetchTomTomTrafficFlow } from '../services/tomtomTrafficService.js';
import routesApi from './routesApi.js';
import db from '../db.js';

const router = express.Router();

function calculateCompositeScore(gigDNA) {
  return Math.round(
    (gigDNA.reliability +
     gigDNA.safety +
     gigDNA.efficiency +
     gigDNA.incomeStability +
     gigDNA.customerHappiness) / 5
  );
}

// Profile & Auth Routes
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ user: row });
  });
});

router.get('/profile/:id', (req, res) => {
  const userId = req.params.id;
  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    db.all("SELECT * FROM jobs WHERE user_id = ?", [userId], (err, jobs) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ user, jobs });
    });
  });
});

router.put('/profile/:id/goal', (req, res) => {
  const userId = req.params.id;
  const { savings_goal } = req.body;
  db.run("UPDATE users SET savings_goal = ? WHERE id = ?", [savings_goal, userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updatedRows: this.changes });
  });
});

router.get('/benchmarks', (req, res) => {
  db.all("SELECT * FROM fare_benchmarks", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 1. GET /api/dashboard
router.get('/dashboard', (req, res) => {
  const compositeScore = calculateCompositeScore(worker.gigDNA);

  res.json({
    worker: {
      id: worker.id,
      name: worker.name,
      platform: worker.platform,
      location: worker.location
    },
    earningsToday: worker.earningsToday,
    ordersAccepted: worker.ordersAccepted,
    ordersRejected: worker.ordersRejected,
    hoursActiveToday: Number(worker.hoursActiveToday.toFixed(2)),
    compositeScore,
    gigDNA: worker.gigDNA
  });
});

// 2. GET /api/radar - Smart Location & Competition Aware Radar
router.get('/radar', async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat) : worker.location.lat;
    const lng = req.query.lng ? parseFloat(req.query.lng) : worker.location.lng;
    const hour = req.query.hour ? parseInt(req.query.hour) : undefined;

    const smartResult = await calculateSmartLocationRecommendation(lat, lng, hour);

    res.json({
      zones: smartResult.rankedZones,
      topRecommendation: smartResult.recommendedZone,
      peakTimeAnalysis: smartResult.peakTimeAnalysis,
      weather: smartResult.weather,
      userCoordinates: smartResult.userCoordinates
    });
  } catch (err) {
    console.error("Radar calculation error:", err);
    res.status(500).json({ error: "Failed to compute radar recommendations" });
  }
});

// 3. POST /api/recommend-location
router.post('/recommend-location', async (req, res) => {
  try {
    const { lat, lng, area, customHour } = req.body;
    const userLat = lat ? parseFloat(lat) : worker.location.lat;
    const userLng = lng ? parseFloat(lng) : worker.location.lng;

    if (area) {
      worker.location.area = area;
    }
    worker.location.lat = userLat;
    worker.location.lng = userLng;

    const recommendation = await calculateSmartLocationRecommendation(userLat, userLng, customHour);

    res.json({
      success: true,
      message: `Location updated to (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`,
      ...recommendation
    });
  } catch (err) {
    console.error("Recommend location error:", err);
    res.status(500).json({ error: "Location recommendation engine failure" });
  }
});

// 4. GET /api/live-traffic - TomTom Traffic Flow API Endpoint
router.get('/live-traffic', async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat) : worker.location.lat;
    const lng = req.query.lng ? parseFloat(req.query.lng) : worker.location.lng;

    const traffic = await fetchTomTomTrafficFlow(lat, lng);
    res.json(traffic);
  } catch (err) {
    res.status(500).json({ error: "TomTom traffic API request failed" });
  }
});

// 5. POST /api/order/simulate - Live TomTom Traffic Enhanced Simulation
router.post('/order/simulate', async (req, res) => {
  const payout = Math.floor(Math.random() * (180 - 40 + 1)) + 40;
  const distanceKm = Math.floor(Math.random() * 10) + 1;
  const store = mockStores[Math.floor(Math.random() * mockStores.length)];
  const customerLoc = `Sector ${Math.floor(Math.random() * 7) + 1}, Bangalore`;

  // Fetch live TomTom traffic calculation for route
  const trafficData = await calculateTomTomRouteTraffic(store, customerLoc, distanceKm);

  const fuelCostEstimate = trafficData.totalAdjustedFuelCost;
  const profitEstimate = payout - fuelCostEstimate;
  const recommendation = getRecommendation(payout, distanceKm, fuelCostEstimate, profitEstimate);

  const mockOrder = {
    id: `ORD-${Date.now().toString().slice(-5)}`,
    payout,
    distanceKm,
    fuelCostEstimate,
    profitEstimate,
    pickupLocation: store,
    dropLocation: customerLoc,
    timeEstimateMin: trafficData.travelTimeMin,
    trafficDelayMin: trafficData.trafficDelayMin,
    trafficSource: trafficData.source,
    timestamp: new Date().toISOString()
  };

  res.json({
    order: mockOrder,
    tomtomTraffic: trafficData,
    recommendation
  });
});

// 6. POST /api/order/decision
router.post('/order/decision', (req, res) => {
  const { workerDecision, order, recommendedAction } = req.body;

  const orderProfit = order?.profitEstimate !== undefined ? order.profitEstimate : 40;
  const recAction = recommendedAction || order?.recommendation?.action || 'ACCEPT';

  if (workerDecision === 'accepted') {
    worker.earningsToday += orderProfit;
    worker.ordersAccepted += 1;
    
    const today = new Date().toISOString().split('T')[0];
    db.run(
      "INSERT INTO jobs (user_id, date, earnings, hours) VALUES (?, ?, ?, ?)",
      [1, today, orderProfit, (order?.timeEstimateMin || 15) / 60],
      function(err) {
        if (err) console.error("Error logging job to DB:", err.message);
      }
    );
  } else {
    worker.ordersRejected += 1;
  }

  worker.hoursActiveToday += 0.25;

  const compositeScore = updateGigDNAScore(worker, workerDecision, recAction);

  res.json({
    earningsToday: worker.earningsToday,
    ordersAccepted: worker.ordersAccepted,
    ordersRejected: worker.ordersRejected,
    hoursActiveToday: Number(worker.hoursActiveToday.toFixed(2)),
    compositeScore,
    gigDNA: worker.gigDNA
  });
});

// 7. GET /api/mission
router.get('/mission', (req, res) => {
  const target = 10;
  const progress = worker.ordersAccepted;
  res.json({
    id: "m-01",
    title: "Lunch Rush Dominator",
    description: "Complete 10 deliveries before 2:30 PM",
    target,
    progress: Math.min(target, progress),
    reward: 350,
    expiresIn: "1h 20m",
    isCompleted: progress >= target
  });
});

// 8. GET /api/burnout
router.get('/burnout', (req, res) => {
  const hours = Number(worker.hoursActiveToday.toFixed(2));
  const atRisk = hours >= 4.0;
  res.json({
    atRisk,
    hoursActiveToday: hours,
    message: atRisk
      ? `You've been active for ${hours}h continuous driving. High fatigue warning — take a 15-min break to protect safety & GigDNA.`
      : `Optimal energy zone (${hours}h active today). Keep up the high efficiency!`
  });
});

// 9. POST /api/chat
router.post('/chat', async (req, res) => {
  const { question } = req.body;
  const query = (question || '').trim();

  if (!query) {
    return res.status(400).json({ error: "Empty query provided" });
  }

  const lowerQuery = query.toLowerCase();

  // Petrol / Fuel / Diesel / Gas / Price intent (checked BEFORE generic keywords)
  if (lowerQuery.includes('petrol') || lowerQuery.includes('fuel') || lowerQuery.includes('diesel') || lowerQuery.includes('gas') || (lowerQuery.includes('price') && !lowerQuery.includes('earn'))) {
    return res.json({
      answer: `Current petrol price in Bangalore is ₹110.93 – ₹111.68/L (Diesel: ₹94.50/L, EV Charging: ₹18/kWh). Vehicle running cost estimate: ₹6.50/km for 2-wheeler, ₹10.20/km for cab. Always factor fuel cost into order decisions!`
    });
  }

  // Spending / Expense / Fuel Cost Spent intent
  if (lowerQuery.includes('spend') || lowerQuery.includes('spent') || lowerQuery.includes('expense') || lowerQuery.includes('cost today')) {
    const estSpent = Math.round(worker.ordersAccepted * 24);
    return res.json({
      answer: `Today's estimated vehicle fuel expenses: ₹${estSpent} (across ${worker.ordersAccepted} completed deliveries). Net profit after fuel: ₹${worker.earningsToday}.`
    });
  }

  // Earnings / Money / Income intent
  if (lowerQuery.includes('earn') || lowerQuery.includes('money') || lowerQuery.includes('payout') || lowerQuery.includes('revenue') || lowerQuery.includes('how much')) {
    return res.json({
      answer: `You've earned ₹${worker.earningsToday} today across ${worker.ordersAccepted} accepted orders (${worker.ordersRejected} rejected). Active hours: ${worker.hoursActiveToday.toFixed(1)}h.`
    });
  }

  // Zone / Hotspot / Navigation intent
  if (lowerQuery.includes('zone') || lowerQuery.includes('where') || lowerQuery.includes('go') || lowerQuery.includes('location') || lowerQuery.includes('hotspot') || lowerQuery.includes('radar')) {
    return res.json({
      answer: `Head to Koramangala or Indiranagar corridor! Koramangala currently has Low Driver Competition with 1.95x surge bonus, projected at ₹322/hr.`
    });
  }

  // Break / Fatigue / Rest intent
  if (lowerQuery.includes('break') || lowerQuery.includes('fatigue') || lowerQuery.includes('rest') || lowerQuery.includes('tired') || lowerQuery.includes('sleep')) {
    const atRisk = worker.hoursActiveToday >= 4.0;
    return res.json({
      answer: atRisk
        ? `Warning: You've been active for ${worker.hoursActiveToday.toFixed(1)} hours continuous driving. High fatigue risk — take a 15-minute break now to protect safety & GigDNA.`
        : `You've been active for ${worker.hoursActiveToday.toFixed(1)} hours. You're in the optimal energy zone, but listen to your body!`
    });
  }

  // Benchmarks / Fair Pay intent
  if (lowerQuery.includes('benchmark') || lowerQuery.includes('fair') || lowerQuery.includes('underpay') || lowerQuery.includes('rights') || lowerQuery.includes('minimum')) {
    return res.json({
      answer: `Fair rate benchmark in Bangalore for delivery is ₹25–₹35/km (min base pay ₹40). Always reject orders with <35% profit margin!`
    });
  }

  // Mission / Reward / Target intent
  if (lowerQuery.includes('mission') || lowerQuery.includes('reward') || lowerQuery.includes('target') || lowerQuery.includes('bonus') || lowerQuery.includes('goal')) {
    return res.json({
      answer: `Active Mission: 'Lunch Rush Dominator' — Complete 10 deliveries before 2:30 PM for a ₹350 bonus reward! Progress: ${worker.ordersAccepted}/10 completed.`
    });
  }

  // Weather / Rain intent
  if (lowerQuery.includes('weather') || lowerQuery.includes('rain') || lowerQuery.includes('monsoon') || lowerQuery.includes('temp')) {
    return res.json({
      answer: `Current weather in Bangalore: 29°C. Monsoon rain surge adds +25% bonus payout per order. Drive safely on wet roads!`
    });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey || groqApiKey.startsWith('gsk_fakeKey')) {
    return res.json({
      answer: `GigPilot AI Status: You've earned ₹${worker.earningsToday} today (${worker.hoursActiveToday.toFixed(1)}h active). Best recommended area: Koramangala corridor (>35% profit margin).`
    });
  }

  db.all("SELECT * FROM fare_benchmarks", [], async (err, benchmarks) => {
    let benchmarksText = "No benchmarks available.";
    if (!err && benchmarks && benchmarks.length > 0) {
      benchmarksText = benchmarks.map(b => `${b.city} ${b.service_type}: ₹${b.fair_rate_per_km}/km, min base ₹${b.min_base_pay}`).join("; ");
    }

    try {
      const messages = [
        {
          role: "system",
          content: `You are GigPilot AI, a supportive companion for gig-workers. Short, specific, supportive answers.
Current shift context:
- Earnings Today: ₹${worker.earningsToday}
- Orders Accepted: ${worker.ordersAccepted}
- Hours Active: ${worker.hoursActiveToday.toFixed(1)}h
- Petrol Rate: ₹102.86/L
- GigDNA: ${JSON.stringify(worker.gigDNA)}`
        },
        { role: "user", content: query }
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) throw new Error(`Groq API returned ${response.status}`);
      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || "No response content from Groq.";
      res.json({ answer });
    } catch (error) {
      console.error("Groq API Error:", error);
      res.json({
        answer: `GigPilot AI Status: Earned ₹${worker.earningsToday} today. Petrol rate: ₹102.86/L. Keep up the high efficiency!`
      });
    }
  });
});

// 10. POST /api/order/ocr-parse - Enhanced with TomTom Traffic
router.post('/order/ocr-parse', async (req, res) => {
  const result = parseOrderOCR(req.body);
  const trafficData = await calculateTomTomRouteTraffic(result.parsedOrder.pickupLocation, result.parsedOrder.dropLocation, result.parsedOrder.distanceKm);

  res.json({
    ...result,
    tomtomLiveTraffic: trafficData
  });
});

// 11. POST /api/translate
router.post('/translate', async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing text or targetLang parameters." });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey || groqApiKey.startsWith('gsk_fakeKey')) {
    return res.json({ translatedText: `[${targetLang}] ${text}` });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: `Translate into ${targetLang}. Return ONLY translated string.` },
          { role: "user", content: text }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    });

    if (!response.ok) throw new Error("Groq translate error");
    const data = await response.json();
    const translatedText = (data.choices?.[0]?.message?.content || text).trim();
    res.json({ translatedText });
  } catch (err) {
    res.json({ translatedText: `[${targetLang}] ${text}` });
  }
});

router.use('/routes', routesApi);
export default router;
