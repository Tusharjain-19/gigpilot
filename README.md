# GigPilot AI ⚡

> **"Don't tell workers what happened. Tell them what to do next."**

GigPilot AI is a proactive copilot for delivery and ride-hailing gig workers (Swiggy, Zomato, Uber, Rapido, Blinkit). Instead of passive retrospective reports, it continuously evaluates live order economics, fuel costs, traffic congestion, and fatigue risk to push short, specific, one-line decisions (*ACCEPT* vs *REJECT*) and visualizes earning hotspots on a live **Opportunity Radar** heatmap.

---

## 🌟 Key Features

- **Proactive Recommendation Engine**: Algorithmic decision engine calculating net profit margin (`payout - distanceKm * fuelRate`) and traffic congestion delays.
- **Live Opportunity Radar**: Interactive map displaying demand density across city corridors (Koramangala, Indiranagar, HSR Layout), surge multipliers, and click-to-route prompts (*"Move 1.8km North → +₹430 projected gain"*).
- **Screenshot OCR & Traffic Predictor**: Upload or select platform order slips (Swiggy, Zomato, Uber) to predict traffic delays (+18m gridlock) and traffic-adjusted hourly earnings.
- **Dynamic GigDNA Scorecard**: Composite 5-metric performance index (Reliability, Safety, Efficiency, Income Stability, Customer Happiness) that recalculates live on every accept/reject decision.
- **Live GPS & OpenWeather Sync**: Geolocation coordinates locking and monsoon/rain surge demand detection (+25% surge payout boost).
- **Burnout Guardian & Daily Missions**: Active fatigue alerts protecting safety scores and daily gamified target missions.

---

## 🎨 Organic Minimalism Design System

Built with a restrained, human-centric design aesthetic:
- **Foundational Surface**: Matte Charcoal Slate (`#111318`) with 1px solid borders (`#272A31`).
- **Primary Accent**: Forest Pine (`#15803D`) for success states and primary actions.
- **Secondary Accent**: Terracotta Clay (`#C2410C`) for alerts and surge warnings.
- **Typography**: `Outfit` geometric display headings and `Inter` body text.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Mode
```bash
# Starts both Express API Backend (Port 5000) and Vite React Client (Port 3000)
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 📁 Repository Structure

```
gigpilot/
├── client/                # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/    # OpportunityRadar, GigDNAScoreCard, OrderDecisionModal, ScreenshotOCR, APISettings, LandingPage
│   │   ├── services/      # REST API Service Wrapper
│   │   ├── App.jsx
│   │   └── index.css
│   └── vite.config.js
├── server/                # Node.js + Express REST API Backend
│   ├── data/              # In-memory store (worker state & radar zones)
│   ├── services/          # Recommendation rules & OCR engine
│   ├── routes/            # REST API Routes
│   └── server.js
├── package.json           # Monorepo scripts
└── README.md
```

---

## 📜 License

MIT License © 2026 GigPilot AI.
