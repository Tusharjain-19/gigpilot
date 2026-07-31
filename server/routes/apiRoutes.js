import express from 'express';
import { worker, baseZones, mockStores } from '../data/store.js';
import { getRecommendation, updateGigDNAScore, parseOrderOCR } from '../services/recommendationEngine.js';

const router = express.Router();

// 1. GET /api/dashboard
router.get('/dashboard', (req, res) => {
  const compositeScore = Math.round(
    (worker.gigDNA.reliability +
     worker.gigDNA.safety +
     worker.gigDNA.efficiency +
     worker.gigDNA.incomeStability +
     worker.gigDNA.customerHappiness) / 5
  );

  res.json({
    worker: {
      id: worker.id,
      name: worker.name,
      platform: worker.platform
    },
    earningsToday: worker.earningsToday,
    ordersAccepted: worker.ordersAccepted,
    ordersRejected: worker.ordersRejected,
    hoursActiveToday: Number(worker.hoursActiveToday.toFixed(1)),
    compositeScore,
    gigDNA: worker.gigDNA
  });
});

// 2. GET /api/radar
router.get('/radar', (req, res) => {
  const jitteredZones = baseZones.map(zone => {
    const jitterRate = Math.floor((Math.random() - 0.5) * 16);
    const jitterDist = (Math.random() - 0.5) * 0.4;
    return {
      ...zone,
      ratePerHour: Math.max(70, zone.ratePerHour + jitterRate),
      distanceKm: Number(Math.max(0.5, zone.distanceKm + jitterDist).toFixed(1))
    };
  });

  res.json({
    zones: jitteredZones,
    topRecommendation: {
      zoneId: "z1",
      zoneName: "Koramangala",
      actionPrompt: "Move 1.8km North → +₹430 projected gain today.",
      surgeMultiplier: "1.4x"
    }
  });
});

// 3. POST /api/order/simulate
router.post('/order/simulate', (req, res) => {
  const payout = Math.floor(Math.random() * (95 - 38 + 1)) + 38;
  const distanceKm = Number((Math.random() * 4.5 + 1.2).toFixed(1));
  const fuelCostEstimate = Math.round(distanceKm * 5.2);
  const profitEstimate = payout - fuelCostEstimate;

  const store = mockStores[Math.floor(Math.random() * mockStores.length)];
  const customerLoc = `Sector ${Math.floor(Math.random() * 7) + 1}, Bangalore`;
  const timeEstimateMin = Math.round(distanceKm * 4.5 + 8);

  const recommendation = getRecommendation(payout, distanceKm, fuelCostEstimate, profitEstimate);

  const mockOrder = {
    id: `ORD-${Date.now().toString().slice(-5)}`,
    payout,
    distanceKm,
    fuelCostEstimate,
    profitEstimate,
    pickupLocation: store,
    dropLocation: customerLoc,
    timeEstimateMin,
    timestamp: new Date().toISOString()
  };

  res.json({
    order: mockOrder,
    recommendation
  });
});

// 4. POST /api/order/decision
router.post('/order/decision', (req, res) => {
  const { workerDecision, order, recommendedAction } = req.body;

  if (workerDecision === 'accepted') {
    worker.earningsToday += (order?.profitEstimate || 40);
    worker.ordersAccepted += 1;
  } else {
    worker.ordersRejected += 1;
  }

  worker.hoursActiveToday += 0.25;

  const compositeScore = updateGigDNAScore(worker, workerDecision, recommendedAction);

  res.json({
    earningsToday: worker.earningsToday,
    ordersAccepted: worker.ordersAccepted,
    ordersRejected: worker.ordersRejected,
    hoursActiveToday: Number(worker.hoursActiveToday.toFixed(1)),
    compositeScore,
    gigDNA: worker.gigDNA
  });
});

// 5. GET /api/mission
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

// 6. GET /api/burnout
router.get('/burnout', (req, res) => {
  const atRisk = worker.hoursActiveToday >= 4.0;
  res.json({
    atRisk,
    hoursActiveToday: Number(worker.hoursActiveToday.toFixed(1)),
    message: atRisk
      ? `You've been active for ${worker.hoursActiveToday.toFixed(1)}h continuous driving. High fatigue warning — take a 15-min break to protect safety & GigDNA.`
      : `Optimal energy zone. 3.5h active today. Keep up the high efficiency!`
  });
});

// 7. POST /api/chat
router.post('/chat', (req, res) => {
  const { question } = req.body;
  const query = (question || '').toLowerCase();

  let answer = "";
  if (query.includes('earn') || query.includes('money') || query.includes('today')) {
    answer = `You've earned ₹${worker.earningsToday} today across ${worker.ordersAccepted} completed orders. Net profit margin is sitting at 74%.`;
  } else if (query.includes('zone') || query.includes('where') || query.includes('go')) {
    answer = `Head to Koramangala! Demand is High (1.4x surge) averaging ₹245/hr. It's only 1.8km from your location.`;
  } else if (query.includes('break') || query.includes('fatigue') || query.includes('tired')) {
    answer = worker.hoursActiveToday >= 4.0
      ? `Yes! You've been active ${worker.hoursActiveToday.toFixed(1)} hours. Take a 15-minute break now to recover fatigue.`
      : `You're currently at ${worker.hoursActiveToday.toFixed(1)} hours active. Energy levels good!`;
  } else {
    answer = `GigPilot AI recommends staying near Koramangala / Indiranagar corridor for maximum orders with >35% profit margin.`;
  }

  res.json({ answer });
});

// 8. POST /api/order/ocr-parse
router.post('/order/ocr-parse', (req, res) => {
  const result = parseOrderOCR(req.body);
  res.json(result);
});

export default router;
