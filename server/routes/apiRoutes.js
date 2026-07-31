import express from 'express';
import { worker, baseZones, mockStores } from '../data/store.js';
import { getRecommendation, updateGigDNAScore, parseOrderOCR } from '../services/recommendationEngine.js';

import db from '../db.js';

const router = express.Router();

// Profile / Auth Routes

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
    
    // Log the job to the database for the profile live feed
    const today = new Date().toISOString().split('T')[0];
    db.run(
      "INSERT INTO jobs (user_id, date, earnings, hours) VALUES (?, ?, ?, ?)",
      [1, today, order?.profitEstimate || 40, (order?.timeEstimateMin || 15) / 60],
      function(err) {
        if (err) console.error("Error logging job to DB:", err.message);
      }
    );
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
router.post('/chat', async (req, res) => {
  const { question } = req.body;
  const query = (question || '').trim();

  if (!query) {
    return res.status(400).json({ error: "Empty query provided" });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey || groqApiKey.startsWith('gsk_fakeKey')) {
    // Elegant fallback if Groq API is not configured or is using fake key placeholder
    let answer = "";
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('earn') || lowerQuery.includes('money') || lowerQuery.includes('today')) {
      answer = `You've earned ₹${worker.earningsToday} today across ${worker.ordersAccepted} completed orders. Net profit margin is sitting at 74%.`;
    } else if (lowerQuery.includes('zone') || lowerQuery.includes('where') || lowerQuery.includes('go')) {
      answer = `Head to Koramangala! Demand is High (1.4x surge) averaging ₹245/hr. It's only 1.8km from your location.`;
    } else if (lowerQuery.includes('break') || lowerQuery.includes('fatigue') || lowerQuery.includes('tired')) {
      answer = worker.hoursActiveToday >= 4.0
        ? `Yes! You've been active ${worker.hoursActiveToday.toFixed(1)} hours. Take a 15-minute break now to recover fatigue.`
        : `You're currently at ${worker.hoursActiveToday.toFixed(1)} hours active. Energy levels good!`;
    } else {
      answer = `[Local Mode] GigPilot AI recommends staying near Koramangala / Indiranagar corridor for maximum orders with >35% profit margin. Please configure GROQ_API_KEY in the server .env for full AI response capability.`;
    }
    return res.json({ answer });
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
          content: `You are GigPilot AI, a supportive, plain-language companion and rights advisor for gig-workers (delivery riders, cab drivers).
Keep answers short, specific, supportive and numeric.
Focus on safety, fairness, and worker dignity.
Current shift context:
- Earnings Today: ₹${worker.earningsToday}
- Orders Accepted: ${worker.ordersAccepted}
- Orders Rejected: ${worker.ordersRejected}
- Hours Active Today: ${worker.hoursActiveToday.toFixed(1)}h
- GigDNA scores: Reliability: ${worker.gigDNA.reliability}, Safety: ${worker.gigDNA.safety}, Efficiency: ${worker.gigDNA.efficiency}, Income Stability: ${worker.gigDNA.incomeStability}, Customer Happiness: ${worker.gigDNA.customerHappiness}
- Fare Benchmarks: ${benchmarksText}`
        },
        {
          role: "user",
          content: query
        }
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: messages,
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || "No response content from Groq.";
      res.json({ answer });
    } catch (error) {
      console.error("Groq API Call Error:", error);
      res.json({
        answer: `I had trouble connecting to my brain, but based on your local metrics: You have earned ₹${worker.earningsToday} today, and safety remains at ${worker.gigDNA.safety}/100. Rest if you feel fatigued!`
      });
    }
  });
});

// 8. POST /api/order/ocr-parse
router.post('/order/ocr-parse', (req, res) => {
  const result = parseOrderOCR(req.body);
  res.json(result);
});

// 9. POST /api/translate
router.post('/translate', async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing text or targetLang parameters." });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey || groqApiKey.startsWith('gsk_fakeKey')) {
    // local mockup response if API key is not ready
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
          {
            role: "system",
            content: `You are a translator. Translate the given text into the language code specified: "${targetLang}". Translate precisely, preserving the tone. Return ONLY the translated string.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API translate failed`);
    }

    const data = await response.json();
    const translatedText = (data.choices?.[0]?.message?.content || text).trim();
    res.json({ translatedText });
  } catch (err) {
    console.error("Translation API error:", err);
    res.json({ translatedText: `[${targetLang}] ${text}` });
  }
});

export default router;
