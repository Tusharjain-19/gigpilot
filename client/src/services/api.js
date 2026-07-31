// API Service Layer for GigPilot AI

const API_BASE = '/api';

export const api = {
  // GET /api/dashboard
  async getDashboard() {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      if (!res.ok) throw new Error("API network error");
      return await res.json();
    } catch (err) {
      console.warn("Using fallback dashboard data:", err);
      return {
        worker: { id: "demo-worker-01", name: "Rajesh Kumar", platform: "Swiggy / Zomato / Uber" },
        earningsToday: 680,
        ordersAccepted: 8,
        ordersRejected: 3,
        hoursActiveToday: 3.5,
        compositeScore: 83,
        gigDNA: {
          reliability: 84,
          safety: 88,
          efficiency: 78,
          incomeStability: 74,
          customerHappiness: 91
        }
      };
    }
  },

  // GET /api/radar
  async getRadar() {
    try {
      const res = await fetch(`${API_BASE}/radar`);
      if (!res.ok) throw new Error("API network error");
      return await res.json();
    } catch (err) {
      console.warn("Using fallback radar data:", err);
      return {
        zones: [
          { id: "z1", name: "Koramangala", demand: "high", ratePerHour: 245, distanceKm: 1.8, multiplier: "1.4x", activeDrivers: 14, coords: { x: 35, y: 40 } },
          { id: "z2", name: "Indiranagar", demand: "medium", ratePerHour: 185, distanceKm: 3.2, multiplier: "1.2x", activeDrivers: 22, coords: { x: 65, y: 25 } },
          { id: "z3", name: "HSR Layout", demand: "high", ratePerHour: 220, distanceKm: 2.4, multiplier: "1.35x", activeDrivers: 18, coords: { x: 45, y: 70 } },
          { id: "z4", name: "MG Road", demand: "medium", ratePerHour: 155, distanceKm: 4.5, multiplier: "1.1x", activeDrivers: 30, coords: { x: 75, y: 55 } },
          { id: "z5", name: "Whitefield", demand: "low", ratePerHour: 95, distanceKm: 8.1, multiplier: "1.0x", activeDrivers: 45, coords: { x: 88, y: 80 } },
          { id: "z6", name: "Jayanagar", demand: "high", ratePerHour: 210, distanceKm: 3.8, multiplier: "1.3x", activeDrivers: 12, coords: { x: 20, y: 65 } }
        ],
        topRecommendation: {
          zoneId: "z1",
          zoneName: "Koramangala",
          actionPrompt: "Move 1.8km North → +₹430 projected gain today.",
          surgeMultiplier: "1.4x"
        }
      };
    }
  },

  // POST /api/order/simulate
  async simulateOrder() {
    try {
      const res = await fetch(`${API_BASE}/order/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error("API network error");
      return await res.json();
    } catch (err) {
      console.warn("Using fallback simulated order:", err);
      const isGoodOrder = Math.random() > 0.4;
      const payout = isGoodOrder ? Math.floor(Math.random() * 80) + 110 : Math.floor(Math.random() * 35) + 40;
      const distanceKm = Number((Math.random() * 8 + 1.5).toFixed(1));
      const fuelCostEstimate = Math.round(distanceKm * 6.2);
      const profitEstimate = payout - fuelCostEstimate;
      const profitMargin = profitEstimate / payout;

      let action = "ACCEPT";
      let reason = `High payout — ₹${profitEstimate} net profit for ${distanceKm}km (${Math.round(profitMargin * 100)}% margin). Take immediately!`;

      if (profitEstimate <= 22) {
        action = "REJECT";
        reason = `Fuel ₹${fuelCostEstimate}, profit only ₹${profitEstimate}. Skip — Koramangala orders average ₹135+ expected in 10 mins.`;
      } else if (profitMargin < 0.35) {
        action = "REJECT";
        reason = `Low profit margin (${Math.round(profitMargin * 100)}%). Platform underpaying for ${distanceKm}km distance.`;
      }

      return {
        order: {
          id: `ORD-${Date.now().toString().slice(-5)}`,
          payout,
          distanceKm,
          fuelCostEstimate,
          profitEstimate,
          pickupLocation: "Truffles, Koramangala",
          dropLocation: "Sector 4, HSR Layout",
          timeEstimateMin: Math.round(distanceKm * 4 + 8)
        },
        recommendation: {
          action,
          reason,
          confidence: 94
        }
      };
    }
  },

  // POST /api/order/decision
  async sendDecision(order, workerDecision, recommendedAction) {
    try {
      const res = await fetch(`${API_BASE}/order/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          order,
          workerDecision,
          recommendedAction
        })
      });
      if (!res.ok) throw new Error("API network error");
      return await res.json();
    } catch (err) {
      console.warn("Using fallback decision handler:", err);
      // local fallback update calculation
      return null;
    }
  },

  // GET /api/mission
  async getMission() {
    try {
      const res = await fetch(`${API_BASE}/mission`);
      if (!res.ok) throw new Error("API network error");
      return await res.json();
    } catch (err) {
      return {
        id: "m-01",
        title: "Lunch Rush Dominator",
        description: "Complete 10 deliveries before 2:30 PM",
        target: 10,
        progress: 8,
        reward: 350,
        expiresIn: "1h 20m",
        isCompleted: false
      };
    }
  },

  // GET /api/burnout
  async getBurnout() {
    try {
      const res = await fetch(`${API_BASE}/burnout`);
      if (!res.ok) throw new Error("API network error");
      return await res.json();
    } catch (err) {
      return {
        atRisk: false,
        hoursActiveToday: 3.5,
        message: "Optimal energy zone. 3.5h active today. Keep up the high efficiency!"
      };
    }
  },

  // POST /api/chat
  async sendChatMessage(question) {
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      if (!res.ok) throw new Error("API network error");
      return await res.json();
    } catch (err) {
      const q = (question || '').toLowerCase();
      if (q.includes('petrol') || q.includes('fuel') || q.includes('diesel') || q.includes('gas') || q.includes('price')) {
        return { answer: "Current petrol price in Bangalore is ₹110.93 – ₹111.68/L (Diesel: ₹94.50/L, EV Charging: ₹18/kWh). Vehicle running cost estimate: ₹6.50/km for 2-wheeler, ₹10.20/km for cab." };
      }
      if (q.includes('spend') || q.includes('spent') || q.includes('expense') || q.includes('cost')) {
        return { answer: "Today's estimated vehicle fuel expenses: ₹144 (across completed deliveries). Net earnings today: ₹680." };
      }
      if (q.includes('earn') || q.includes('money') || q.includes('payout')) {
        return { answer: "You've earned ₹680 today across 8 completed orders (3 rejected). Active hours: 3.5h." };
      }
      if (q.includes('zone') || q.includes('where') || q.includes('go')) {
        return { answer: "Head to Koramangala or Indiranagar corridor! Low driver competition & 1.95x surge bonus active." };
      }
      return { answer: "GigPilot AI recommends staying near Koramangala / Indiranagar corridor for orders with >35% profit margin." };
    }
  },

  // POST /api/order/ocr-parse
  async parseScreenshotOCR(payload) {
    try {
      const res = await fetch(`${API_BASE}/order/ocr-parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("API network error");
      return await res.json();
    } catch (err) {
      console.warn("Using fallback OCR parser logic:", err);
      const payout = payload?.payout || 125;
      const distanceKm = payload?.distanceKm || 5.0;
      const trafficLevel = payload?.trafficLevel || 'moderate';

      const fuelCost = Math.round(distanceKm * 6.5);
      const trafficDelayMin = trafficLevel === 'heavy' ? 18 : (trafficLevel === 'moderate' ? 9 : 0);
      const adjustedFuelCost = Math.round(fuelCost * (trafficLevel === 'heavy' ? 1.38 : (trafficLevel === 'moderate' ? 1.18 : 1.0)));
      const adjustedProfit = payout - adjustedFuelCost;
      const totalTimeMin = Math.round(distanceKm * 4 + 8) + trafficDelayMin;
      const effectiveHourlyRate = Math.round((adjustedProfit / totalTimeMin) * 60);

      let action = "ACCEPT";
      let reason = `Good yield — ₹${adjustedProfit} net profit for ${totalTimeMin}m trip (₹${effectiveHourlyRate}/hr rate).`;

      if (adjustedProfit <= 22 || effectiveHourlyRate < 115) {
        action = "REJECT";
        reason = `Traffic adds ${trafficDelayMin}m delay! Effective earnings drop to ₹${effectiveHourlyRate}/hr (net profit ₹${adjustedProfit}). Skip order.`;
      }

      return {
        parsedOrder: {
          id: `OCR-LOCAL`,
          payout,
          distanceKm,
          pickupLocation: payload?.pickupLocation || "Truffles, Koramangala",
          dropLocation: payload?.dropLocation || "Sector 3, HSR Layout",
          baseTimeMin: Math.round(distanceKm * 4 + 8)
        },
        trafficAnalysis: {
          trafficLevel,
          trafficDelayMin,
          fuelCostEstimate: fuelCost,
          adjustedFuelCost,
          adjustedProfit,
          totalTimeMin,
          effectiveHourlyRate,
          trafficDescription: trafficLevel === 'heavy'
            ? "Heavy gridlock (+18m delay, +38% fuel idling)"
            : (trafficLevel === 'moderate' ? "Moderate congestion (+9m delay)" : "Traffic flowing smoothly")
        },
        recommendation: { action, reason, confidence: 94 }
      };
    }
  },

  // POST /api/translate
  async translateText(text, targetLang) {
    try {
      const res = await fetch(`${API_BASE}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang })
      });
      if (!res.ok) throw new Error("API network error");
      const data = await res.json();
      return data.translatedText || text;
    } catch (err) {
      console.warn("Translation fallback:", err);
      return text;
    }
  }
};
