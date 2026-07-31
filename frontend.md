# Frontend Build Doc — GigPilot AI

This doc has two parts:
1. **Spec** — screens, components, data contracts your frontend needs.
2. **Ready-to-paste prompt** — give this directly to an AI coding tool (Claude Code, v0, bolt.new, Cursor, etc.) to scaffold the app fast.

---

## 1. Spec

### Screens (in build priority order)
1. **Login (mock)** — single "Continue as Demo Worker" button, no real auth. Sets a fake worker in state/localStorage.
2. **Dashboard (home)**
   - Today's earnings (big number)
   - Orders accepted / rejected count
   - GigDNA Score card (5 mini-metrics: Reliability, Safety, Efficiency, Income Stability, Customer Happiness — each 0–100, shown as small radial/bar indicators)
   - "New Order" button (the Order Simulator trigger)
3. **Opportunity Radar**
   - Grid or simple SVG map of 5–6 zones, each colored green/yellow/red by demand
   - Each zone shows: zone name, ₹/hour estimate, distance from current position
   - Tapping a zone shows: "Move here. Estimated +₹X today."
4. **Live Order Decision Modal/Card** (appears when a new order fires)
   - Shows: payout, distance, estimated fuel cost, estimated profit
   - Big recommendation banner: **ACCEPT** (green) or **REJECT** (red) with one-line reason
   - Two buttons: Accept anyway / Reject (both just log the decision and update score)
5. **Mission Card** (P1, only if time allows) — one active mission with a progress bar
6. **Burnout Banner** (P1) — dismissible top banner that appears after N orders

### Component list
- `<Dashboard />`
- `<GigDNAScoreCard scores={...} />`
- `<OpportunityRadar zones={...} onSelectZone={...} />`
- `<OrderDecisionCard order={...} recommendation={...} onAccept={...} onReject={...} />`
- `<SimulateOrderButton />`
- `<MissionCard mission={...} />` (P1)
- `<BurnoutBanner />` (P1)
- `<ChatFallback />` (P1, simple text-in text-out box)

### Data contracts (what frontend expects from backend)

```ts
// GET /api/dashboard
{
  earningsToday: number,
  ordersAccepted: number,
  ordersRejected: number,
  gigDNA: {
    reliability: number,   // 0-100
    safety: number,
    efficiency: number,
    incomeStability: number,
    customerHappiness: number
  }
}

// GET /api/radar
{
  zones: [
    { id: string, name: string, demand: "high" | "medium" | "low", ratePerHour: number, distanceKm: number }
  ]
}

// POST /api/order/simulate  -> triggers a new mock order and returns it + recommendation
{
  order: { id: string, payout: number, distanceKm: number, fuelCostEstimate: number, profitEstimate: number },
  recommendation: {
    action: "ACCEPT" | "REJECT",
    reason: string,       // e.g. "Fuel ₹38, profit ₹14. Wait ~12 min for a better order (~₹120 expected)."
    confidence: number    // 0-100, optional, for UI flourish
  }
}

// POST /api/order/decision  { orderId, workerDecision: "accepted" | "rejected" }
// -> returns updated gigDNA + earnings, so the frontend can refresh the score live
```

### Design direction
- Mobile-first (gig workers use phones), single-column layout, big tap targets
- Color system: green = good/accept/high-demand, amber = caution, red = reject/low-demand/risk — keep this consistent everywhere so judges read it instantly without explanation
- Recommendation text is always short, bolded, numeric — never a paragraph
- Avoid a generic dashboard look; the Radar screen should feel like the visual centerpiece, not an afterthought
- Use a dark or high-contrast theme — reads well on a projector during the demo

---

## 2. Prompt to paste into your AI coding tool

```
Build a mobile-first React (Vite + Tailwind CSS) single-page app called "GigPilot AI" — 
an AI copilot for gig workers (delivery/ride-hailing drivers) that gives proactive, 
numeric, one-line recommendations instead of a passive chatbot.

Screens needed, in this priority order:

1. Mock login: a single "Continue as Demo Worker" button. No real auth — just set a 
   fake worker name in app state and go to Dashboard.

2. Dashboard (home screen):
   - Big "Today's Earnings" number at top
   - Row of stat chips: orders accepted, orders rejected
   - A "GigDNA Score" card showing 5 metrics (Reliability, Safety, Efficiency, 
     Income Stability, Customer Happiness), each 0-100, rendered as small horizontal 
     bar or radial indicators with a number
   - A prominent "New Order" button that simulates an incoming order

3. Opportunity Radar screen (this is the visual centerpiece of the app):
   - Show 5-6 zones as cards or an SVG grid layout, each colored green (high demand), 
     yellow (medium), or red (low), each showing zone name, ₹/hour estimate, and 
     distance in km
   - Tapping a zone shows a small callout: "Move here. Estimated +₹X today."

4. Order Decision Card/Modal — triggered by the "New Order" button:
   - Shows payout, distance, estimated fuel cost, estimated profit
   - A large colored banner: ACCEPT (green) or REJECT (red), with one bold, short, 
     numeric reason line, e.g. "Fuel ₹38, profit ₹14. Wait ~12 min — next order 
     ~₹120 expected."
   - Two buttons: "Accept" and "Reject" that both just record the decision and 
     close the modal, then update the dashboard's earnings and GigDNA score

Use this mock data shape and simulate it entirely in frontend state/localStorage 
for now (a backend will be wired in later, so structure API calls behind a small 
service layer / fetch wrapper so they're easy to swap for real endpoints later):

- GET /api/dashboard -> { earningsToday, ordersAccepted, ordersRejected, gigDNA: { reliability, safety, efficiency, incomeStability, customerHappiness } }
- GET /api/radar -> { zones: [{ id, name, demand: "high"|"medium"|"low", ratePerHour, distanceKm }] }
- POST /api/order/simulate -> { order: { id, payout, distanceKm, fuelCostEstimate, profitEstimate }, recommendation: { action: "ACCEPT"|"REJECT", reason, confidence } }
- POST /api/order/decision { orderId, workerDecision } -> updated gigDNA + earnings

Design requirements:
- Mobile-first, single column, large tap targets, dark/high-contrast theme suitable 
  for demoing on a projector
- Consistent color language everywhere: green = good/accept/high-demand, amber = 
  caution, red = reject/low-demand/risk
- All AI-generated text must be short, bold, and numeric — never a vague paragraph
- Bottom nav or simple tab bar with 2 tabs: Dashboard, Radar
- No generic "admin dashboard" look — the Radar screen should feel distinctive and be 
  the thing people remember

Keep the whole app to a small number of files, avoid unnecessary abstraction — this 
is a 6-hour hackathon build, prioritize working and demoable over architecturally 
perfect.
```
