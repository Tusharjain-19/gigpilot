# PRD — GigPilot AI
**"Don't tell workers what happened. Tell them what to do next."**

Hackathon build window: **6 hours**. This PRD is scoped deliberately tight — everything in P0 is buildable solo or in a 2–3 person team in that window. P1/P2 are stretch and only attempted if P0 is done with time to spare.

---

## 1. Problem

Every team at this hackathon will build some version of: OCR for earnings slips, a dashboard, an AI chatbot, a fairness/rating score, a weekly report. These are table stakes — judges will see the same five features twenty times. A reactive Q&A chatbot answering "how much did I earn today?" is forgettable.

## 2. Insight

Gig workers don't need a report of the past. They need a decision made *right now*: accept this order or not, move to this zone or not, keep driving or take a break. The winning product is not an assistant that answers — it's a **copilot that acts on the worker's behalf, continuously**.

## 3. Solution — One Sentence

An AI copilot that watches a gig worker's live conditions (order value, distance, fuel cost, fatigue, demand zones, time of day) and pushes short, specific, one-line decisions — visualized as a live "opportunity radar" map and summarized as a single memorable score (GigDNA).

## 4. Target User

Delivery/ride-hailing gig workers (Swiggy, Zomato, Uber, Rapido, Blinkit-type platforms) who juggle multiple apps, have thin per-order margins, and make dozens of accept/reject micro-decisions a day with no help.

## 5. Demo Narrative (what judges see in 3 minutes)

1. Worker logs in → sees a live map with green/yellow/red demand zones (**Opportunity Radar**).
2. A new order comes in → **GigPilot instantly says**: "Reject. Fuel ₹38, profit ₹14. Wait 12 min, next order ~₹120 expected." One tap to accept/reject.
3. Worker taps "What should I do next?" → copilot proactively suggests: move 1.8km north (+₹430 today), or take a break (fatigue rising).
4. Dashboard shows earnings + a single **GigDNA Score** (Reliability, Safety, Efficiency, Income Stability) instead of a plain star rating.
5. Judge reaction target: "Wait, it's not just answering — it's deciding for the worker."

## 6. Features — Prioritized

### P0 — Must ship in 6 hours (the demo depends on these)
| # | Feature | Why P0 |
|---|---|---|
| 1 | **Proactive Recommendation Engine** — rule-based "AI" that scores each incoming order (fuel cost vs. payout vs. distance vs. time-of-day) and returns Accept/Reject + one-line reason | This IS the product |
| 2 | **Live Opportunity Radar** — map/grid with 4–6 mock zones colored by demand (green/yellow/red), each showing ₹/hour estimate | The single most "wow" visual, easy for judges to grasp instantly |
| 3 | **Order Simulator** — button that fires a new mock order (payout, distance, time) every time it's tapped, feeding the recommendation engine live | Needed since we have no real order feed |
| 4 | **Dashboard** — today's earnings, orders accepted/rejected, and the GigDNA Score card | Baseline requirement, also houses the score |
| 5 | **GigDNA Score** — single composite score (Reliability, Safety, Efficiency, Income Stability), recalculated after each decision | Memorable differentiator, replaces plain star rating |

### P1 — Build if P0 is done early
| # | Feature |
|---|---|
| 6 | **Burnout Guardian** — after N consecutive accepted orders or X hours mock-elapsed, banner: "You've been active 6h 40m. Fatigue rising. Take a 15-min break." |
| 7 | **Mission Planner** — one daily gamified mission card, e.g. "Complete 8 deliveries before 1PM → ₹350 bonus" with a progress bar |
| 8 | **Chat fallback** — a simple chat box for ad-hoc questions ("how much have I earned today"), answered from the same mock data. This satisfies the "AI chatbot" baseline expectation without being the star of the show |

### P2 — Only if there's real time left
| # | Feature |
|---|---|
| 9 | OCR upload for a payout screenshot (mock parse, pre-filled demo image is fine) |
| 10 | Weekly report screen (simple aggregated chart) |
| 11 | Scam/fraud flag on a mock "risky customer" order |

### Explicitly out of scope for the 6-hour build
- Real platform integrations (Swiggy/Uber APIs)
- Real GPS/live traffic data
- Auth beyond a single mock login
- Real LLM fine-tuning — an LLM call (or a rules engine, see Backend doc) is enough; it just needs to feel proactive and specific

## 7. Core UX Principle
Every AI output must be **short, specific, and numeric** — never generic advice. Bad: "You might want to consider taking a break." Good: "Take a break now. You've earned ₹680 today; fatigue risk is high after 4h continuous driving."

## 8. Success Metrics (for this hackathon, not production)
- Judges can understand the differentiator within 30 seconds of the demo starting
- At least 3 of the 5 P0 features are fully clickable/live, not just mockup screenshots
- The GigDNA score visibly changes in response to a demo action (proves it's not static)

## 9. Suggested Tech Stack (optimized for speed, not scale)
- **Frontend:** React (Vite) + Tailwind, single-page app, no auth backend needed (mock login)
- **Backend:** Node.js + Express, in-memory / JSON-file "database" (no real DB setup time)
- **"AI":** deterministic rules engine for scoring (fast, demo-safe, zero API latency risk) with an optional single LLM call layered on top purely to phrase the recommendation text in natural language (nice-to-have, not required — see Backend doc for both options)
- **Map/Radar:** no real maps API needed — a styled SVG/CSS grid of zones is faster to build and just as effective on stage than a real map with API key setup risk

## 10. 6-Hour Build Timeline
| Time | Block |
|---|---|
| 0:00–0:30 | Finalize scope, split team (frontend / backend / "AI" logic), agree on mock data shape |
| 0:30–1:00 | Backend: scaffold Express + mock data + endpoint stubs |
| 1:00–2:30 | Backend: recommendation engine + GigDNA scoring logic + radar zone data |
| 1:00–3:00 | Frontend (parallel): dashboard shell, radar screen, order simulator UI |
| 2:30–4:00 | Wire frontend to backend endpoints, get the order → recommendation loop working end-to-end |
| 4:00–4:45 | GigDNA score card + live update on decisions |
| 4:45–5:15 | P1 stretch (Burnout Guardian or Mission Planner) if time allows |
| 5:15–5:45 | Polish: styling pass, remove placeholder text, tighten copy on recommendations |
| 5:45–6:00 | Rehearse the 3-minute demo narrative (Section 5) end-to-end, fix anything that breaks live |

## 11. One-Line Pitch for Judges
> "Every other app tells you what happened today. GigPilot tells you what to do in the next 10 minutes — and shows you on a live map exactly where the money is."
