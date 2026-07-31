// Algorithmic Recommendation & Scoring Service for GigPilot AI

export function getRecommendation(payout, distanceKm, fuelCostEstimate, profitEstimate) {
  const profitMargin = payout > 0 ? profitEstimate / payout : 0;

  if (profitEstimate <= 20) {
    return {
      action: "REJECT",
      reason: `Fuel ₹${fuelCostEstimate}, profit only ₹${profitEstimate}. Wait ~12 min — better orders average ₹120 in this zone.`,
      confidence: 95
    };
  }

  if (profitMargin < 0.35) {
    const marginPct = Math.round(profitMargin * 100);
    return {
      action: "REJECT",
      reason: `Profit margin too low (${marginPct}%). Platform underpaying for the distance — skip it.`,
      confidence: 92
    };
  }

  return {
    action: "ACCEPT",
    reason: `Solid order — ₹${profitEstimate} profit for ${distanceKm}km. Worth taking.`,
    confidence: 96
  };
}

export function updateGigDNAScore(worker, workerDecision, recommendedAction) {
  const dna = worker.gigDNA;
  const isAccepted = workerDecision === 'accepted';
  const isRejectRec = recommendedAction === 'REJECT';
  const isAcceptRec = recommendedAction === 'ACCEPT';

  if (isAccepted) {
    dna.efficiency += 1;
    dna.incomeStability += 1;
    if (isRejectRec) {
      // Worker overrode AI warning to reject a bad order -> penalty on safety
      dna.safety -= 2;
    }
  } else {
    // Rejected
    if (isRejectRec) {
      // Smart rejection following AI recommendation
      dna.reliability += 1;
      dna.safety += 1;
    } else if (isAcceptRec) {
      // Rejected a good order -> income stability penalty
      dna.incomeStability -= 1;
    }
  }

  // Clamp all scores strictly between 0 and 100
  for (const key in dna) {
    dna[key] = Math.max(0, Math.min(100, dna[key]));
  }

  const compositeScore = Math.round(
    (dna.reliability + dna.safety + dna.efficiency + dna.incomeStability + dna.customerHappiness) / 5
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

  const fuelCostEstimate = Math.round(selected.distanceKm * 6);
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

  const rec = getRecommendation(selected.payout, selected.distanceKm, adjustedFuelCost, adjustedProfit);

  return {
    parsedOrder: {
      id: `OCR-${Date.now().toString().slice(-4)}`,
      payout: selected.payout,
      distanceKm: selected.distanceKm,
      fuelCostEstimate: adjustedFuelCost,
      profitEstimate: adjustedProfit,
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
    recommendation: rec
  };
}
