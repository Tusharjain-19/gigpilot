// Algorithmic Recommendation & Scoring Service for GigPilot AI

export function getRecommendation(payout, distanceKm, fuelCostEstimate, profitEstimate) {
  const profitMargin = profitEstimate / payout;

  if (profitEstimate <= 14) {
    return {
      action: "REJECT",
      reason: `Fuel ₹${fuelCostEstimate}, profit only ₹${profitEstimate}. Skip — Koramangala orders average ₹65+ expected in 10 mins.`,
      confidence: 96
    };
  }

  if (profitMargin < 0.35) {
    return {
      action: "REJECT",
      reason: `Low profit margin (${Math.round(profitMargin * 100)}%). Platform underpaying for ${distanceKm}km travel.`,
      confidence: 91
    };
  }

  return {
    action: "ACCEPT",
    reason: `Solid yield — ₹${profitEstimate} net profit for ${distanceKm}km (${Math.round(profitMargin * 100)}% margin). Take immediately!`,
    confidence: 94
  };
}

export function updateGigDNAScore(worker, workerDecision, recommendedAction) {
  if (workerDecision === 'accepted') {
    worker.gigDNA.efficiency = Math.min(100, worker.gigDNA.efficiency + 2);
    worker.gigDNA.incomeStability = Math.min(100, worker.gigDNA.incomeStability + 1);
    worker.gigDNA.customerHappiness = Math.min(100, worker.gigDNA.customerHappiness + 1);

    if (recommendedAction === 'REJECT') {
      // Overrode warning -> safety score penalty
      worker.gigDNA.safety = Math.max(0, worker.gigDNA.safety - 4);
      worker.gigDNA.efficiency = Math.max(0, worker.gigDNA.efficiency - 2);
    }
  } else {
    if (recommendedAction === 'REJECT') {
      // Smart rejection following AI recommendation
      worker.gigDNA.reliability = Math.min(100, worker.gigDNA.reliability + 2);
      worker.gigDNA.safety = Math.min(100, worker.gigDNA.safety + 2);
    } else {
      // Rejected good order -> penalty
      worker.gigDNA.incomeStability = Math.max(0, worker.gigDNA.incomeStability - 3);
    }
  }

  const compositeScore = Math.round(
    (worker.gigDNA.reliability +
     worker.gigDNA.safety +
     worker.gigDNA.efficiency +
     worker.gigDNA.incomeStability +
     worker.gigDNA.customerHappiness) / 5
  );

  return compositeScore;
}

export function parseOrderOCR({ screenshotType, payout: inputPayout, distanceKm: inputDistance, pickupLocation: inputPickup, dropLocation: inputDrop, trafficLevel = 'moderate' }) {
  const templates = {
    swiggy_high: { payout: 165, distanceKm: 4.2, pickupLocation: "Truffles, Koramangala", dropLocation: "Sector 3, HSR Layout" },
    zomato_long: { payout: 110, distanceKm: 9.8, pickupLocation: "Meghana Foods, Indiranagar", dropLocation: "Whitefield Main Rd" },
    uber_surge: { payout: 210, distanceKm: 6.5, pickupLocation: "MG Road Metro Station", dropLocation: "Electronic City Phase 1" }
  };

  const selected = templates[screenshotType] || {
    payout: Number(inputPayout) || 125,
    distanceKm: Number(inputDistance) || 5.0,
    pickupLocation: inputPickup || "Empire Restaurant, Koramangala",
    dropLocation: inputDrop || "BTM Layout 2nd Stage"
  };

  const fuelCostEstimate = Math.round(selected.distanceKm * 6.5);

  let trafficDelayMin = 0;
  let fuelSurgeMult = 1.0;
  let trafficDescription = "Flowing traffic smoothly (no delays)";

  if (trafficLevel === 'moderate') {
    trafficDelayMin = 9;
    fuelSurgeMult = 1.18;
    trafficDescription = "Moderate congestion along Outer Ring Road (+9 min delay)";
  } else if (trafficLevel === 'heavy') {
    trafficDelayMin = 18;
    fuelSurgeMult = 1.38;
    trafficDescription = "Heavy gridlock around Silk Board bottleneck (+18 min delay, +38% fuel burned idling)";
  }

  const adjustedFuelCost = Math.round(fuelCostEstimate * fuelSurgeMult);
  const adjustedProfit = selected.payout - adjustedFuelCost;
  const baseTimeMin = Math.round(selected.distanceKm * 4 + 8);
  const totalTimeMin = baseTimeMin + trafficDelayMin;
  const effectiveHourlyRate = Math.round((adjustedProfit / totalTimeMin) * 60);

  let action = "ACCEPT";
  let reason = `Good return despite traffic — ₹${adjustedProfit} net profit for ${totalTimeMin}m total trip (₹${effectiveHourlyRate}/hr rate).`;

  if (adjustedProfit <= 22 || effectiveHourlyRate < 115) {
    action = "REJECT";
    reason = `Traffic congestion adds ${trafficDelayMin}m delay! Effective earnings collapse to ₹${effectiveHourlyRate}/hr (net profit ₹${adjustedProfit}). Skip order.`;
  }

  return {
    parsedOrder: {
      id: `OCR-${Date.now().toString().slice(-4)}`,
      payout: selected.payout,
      distanceKm: selected.distanceKm,
      pickupLocation: selected.pickupLocation,
      dropLocation: selected.dropLocation,
      baseTimeMin
    },
    trafficAnalysis: {
      trafficLevel,
      trafficDelayMin,
      fuelCostEstimate,
      adjustedFuelCost,
      adjustedProfit,
      totalTimeMin,
      effectiveHourlyRate,
      trafficDescription
    },
    recommendation: {
      action,
      reason,
      confidence: 95
    }
  };
}
