# Backend Build Doc — GigPilot AI

This doc has two parts:
1. **Spec** — endpoints, data model, and the recommendation/scoring logic.
2. **Ready-to-paste prompt** — give this directly to an AI coding tool to scaffold the backend fast.

---

## 1. Spec

### Stack
Node.js + Express. No real database — use an in-memory JS object (or a single JSON file) as the "database." This is the single biggest time-saver for a 6-hour build; do not set up Postgres/Mongo for a hackathon demo.

### Data model (in-memory)

```js
worker = {
  id: "demo-worker",
  earningsToday: 0,
  ordersAccepted: 0,
  ordersRejected: 0,
  hoursActiveToday: 0,        // increment on each simulated order for Burnout Guardian
  gigDNA: {
    reliability: 80,
    safety: 85,
    efficiency: 75,
    incomeStability: 70,
    customerHappiness: 88
  }
}

zones = [
  { id: "z1", name: "Koramangala", demand: "high", ratePerHour: 240, distanceKm: 1.8 },
  { id: "z2", name: "Indiranagar", demand: "medium", ratePerHour: 160, distanceKm: 3.2 },
  { id: "z3", name: "HSR Layout", demand: "low", ratePerHour: 70, distanceKm: 0.9 },
  ...
]
```
(Zone names/numbers are illustrative — randomize slightly on each request so the radar feels "live" during a demo.)

### Endpoints

**GET /api/dashboard**
Returns the current worker state (earnings, order counts, gigDNA).

**GET /api/radar**
Returns zones array. Optionally jitter `ratePerHour` and `demand` by a small random amount each call so repeated demo taps show slightly different numbers (feels alive, costs nothing).

**POST /api/order/simulate**
1. Generate a random mock order:
   - `payout` = random ₹40–₹180
   - `distanceKm` = random 1–10
   - `fuelCostEstimate` = distanceKm * ₹6 (mock rate)
   - `profitEstimate` = payout - fuelCostEstimate
2. Run it through the **Recommendation Engine** (below) to get `action` and `reason`.
3. Return `{ order, recommendation }`. Do NOT mutate worker state yet — that happens on `/order/decision`.

**POST /api/order/decision**  `{ orderId, workerDecision }`
1. Update `worker.earningsToday` if accepted (+profitEstimate), increment `ordersAccepted`/`ordersRejected`.
2. Increment `hoursActiveToday` by a small mock increment (e.g. +0.25).
3. Recalculate `gigDNA` (see scoring rules below).
4. Return updated `{ earningsToday, ordersAccepted, ordersRejected, gigDNA }`.

**GET /api/mission** (P1)
Returns a single mock mission object: `{ title, target, progress, reward }`.

**GET /api/burnout** (P1)
Returns `{ atRisk: boolean, hoursActiveToday, message }` — `atRisk = true` once `hoursActiveToday` crosses a threshold (e.g. 4).

### Recommendation Engine (the core "AI" — keep this deterministic, not a black box)

This is intentionally a **rules engine**, not a trained model — it's fast to build, has zero latency/API-key risk during a live demo, and is easy to explain to judges ("here's exactly why it recommends this").

```
function getRecommendation(order):
    profitMargin = order.profitEstimate / order.payout

    if order.profitEstimate <= 20:
        return {
          action: "REJECT",
          reason: `Fuel ₹${order.fuelCostEstimate}, profit only ₹${order.profitEstimate}. 
                    Wait ~12 min — better orders average ₹120 in this zone.`
        }

    if profitMargin < 0.35:
        return {
          action: "REJECT",
          reason: `Profit margin too low (${Math.round(profitMargin*100)}%). 
                    Platform underpaying for the distance — skip it.`
        }

    return {
      action: "ACCEPT",
      reason: `Solid order — ₹${order.profitEstimate} profit for ${order.distanceKm}km. 
                Worth taking.`
    }
```

Optional upgrade (only if there's spare time): after computing the rule-based `action`, make ONE call to an LLM purely to rephrase `reason` more naturally — never let the LLM decide accept/reject itself, since that introduces demo risk (latency, inconsistency). Keep the deterministic rules as the source of truth.

### GigDNA Scoring rules (keep simple and visibly reactive for the demo)

- On **accept**: `efficiency +1`, `incomeStability +1` (cap 100)
- On **reject of a bad order** (i.e. rejecting when the engine said REJECT): `reliability +1`, `safety +1`
- On **accept of a bad order** (worker overrides a REJECT recommendation): `safety -2`
- On **reject of a good order** (worker overrides an ACCEPT recommendation): `incomeStability -1`
- Clamp all scores to 0–100

This makes the score move visibly during the demo in response to whatever the presenter does on stage — which is the whole point of showing it live instead of as a static number.

---

## 2. Prompt to paste into your AI coding tool

```
Build a Node.js + Express backend for a hackathon prototype called "GigPilot AI" — 
a gig-worker copilot app. No real database: use a single in-memory JS object as the 
data store (reset on server restart is fine for a demo).

Data model:

worker = {
  id: "demo-worker",
  earningsToday: 0,
  ordersAccepted: 0,
  ordersRejected: 0,
  hoursActiveToday: 0,
  gigDNA: {
    reliability: 80,
    safety: 85,
    efficiency: 75,
    incomeStability: 70,
    customerHappiness: 88
  }
}

zones = an array of 5-6 objects: { id, name, demand: "high"|"medium"|"low", ratePerHour, distanceKm }
Use realistic Indian city neighborhood names. Slightly randomize ratePerHour and demand 
on each GET request so the radar feels "live."

Endpoints:

1. GET /api/dashboard
   Returns { earningsToday, ordersAccepted, ordersRejected, gigDNA } from the worker object.

2. GET /api/radar
   Returns { zones } with slightly randomized values each call.

3. POST /api/order/simulate
   Generates a random mock order:
     payout = random integer between 40 and 180
     distanceKm = random integer between 1 and 10
     fuelCostEstimate = distanceKm * 6
     profitEstimate = payout - fuelCostEstimate
   Then runs it through this deterministic recommendation function (do not use an LLM 
   for the decision itself, keep it rule-based and fast):

     - if profitEstimate <= 20: action = "REJECT", reason explains fuel cost, profit, 
       and says "wait ~12 min, better orders average ₹120 in this zone"
     - else if profitEstimate / payout < 0.35: action = "REJECT", reason cites the 
       profit margin percentage and says the platform is underpaying for the distance
     - else: action = "ACCEPT", reason states the profit and distance and says it's 
       worth taking

   Return { order: {...}, recommendation: { action, reason } }. Do not mutate worker 
   state in this endpoint — only generate and return.

4. POST /api/order/decision
   Body: { orderId, workerDecision: "accepted" | "rejected", order: {...}, 
   recommendedAction: "ACCEPT"|"REJECT" }  (pass the order and original recommendation 
   back in from the frontend since there's no order DB)
   
   Logic:
     - if workerDecision === "accepted": add order.profitEstimate to worker.earningsToday, 
       increment ordersAccepted
     - if workerDecision === "rejected": increment ordersRejected
     - increment worker.hoursActiveToday by 0.25
     - update gigDNA:
         - accepted -> efficiency +1, incomeStability +1
         - rejected AND recommendedAction was "REJECT" -> reliability +1, safety +1
         - accepted AND recommendedAction was "REJECT" -> safety -2 (worker overrode a warning)
         - rejected AND recommendedAction was "ACCEPT" -> incomeStability -1
         - clamp all gigDNA values between 0 and 100
   Return the updated { earningsToday, ordersAccepted, ordersRejected, gigDNA }.

5. GET /api/mission (optional, only if time allows)
   Returns a single hardcoded mission object: { title, target, progress, reward }, 
   e.g. "Complete 8 deliveries before 1PM" with a reward of ₹350.

6. GET /api/burnout (optional, only if time allows)
   Returns { atRisk: boolean, hoursActiveToday, message }. atRisk = true once 
   hoursActiveToday >= 4, with message like "You've been active for X hours. 
   Fatigue risk is high — consider a 15-minute break."

Enable CORS for all origins (this is a local hackathon demo). Keep the whole thing in 
as few files as reasonably possible — a single server.js with clear function separation 
is fine. Prioritize it working end-to-end over clean architecture; this is a 6-hour build.
```
