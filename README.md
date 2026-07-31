# GigPilot AI

Submission for the GigShield Hackathon

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_Llama3.3-70B-F05032?style=for-the-badge&logo=openai&logoColor=white)

## Problem Statement Chosen
**Domain:** GigShield  
**Problem Statement:** Proactive AI Copilot and Rights Advisor for Gig-Workers to optimize shift earnings, evaluate order profitability, protect health, and prevent exploitation.

## Team & About the Developers
**Team Name:** Infinity Loopers  

### 👨‍💻 Developers:
- **Tushar Jain**  — [Website: tusharjain.in](https://tusharjain.in) | [GitHub: @Tusharjain-19](https://github.com/Tusharjain-19)
- **Ayush Kumar** (Contributor)
- **Syed Ather** (Contributor)

---

## Our Solution
GigPilot AI is a proactive, real-time companion application built specifically for delivery riders and gig workers. Instead of merely logging past trips, GigPilot AI analyzes live traffic, weather surges, and driver density to guide workers to high-yield hotspots before demand shifts occur. It includes an **AI Screenshot OCR Profit Analyzer** that parses uploaded order slips to calculate true net income after fuel and idling delays, protecting workers from underpaid orders. Additionally, it tracks continuous driving hours with **Burnout Guardian** and offers multilingual AI rights advisory.

## AI Component
The AI component is not mandatory, but it directly affects your AI Integration & Creativity score. Teams that skip it entirely, or fake/hardcode it instead of genuinely integrating it, will be scored significantly lower on this criterion. If you did include one, be specific below name the exact model/API used and what it does in your project.

● **What AI is used:**
- **Groq Llama 3.3-70B via API**: Powers the multilingual Copilot Q&A chatbot and rights advisor.
- **Tesseract.js Client-Side OCR Engine**: Extracts payout (₹), distance (km), platform name, and locations directly from uploaded order screenshots.
- **OpenWeatherMap & TomTom Live Traffic AI Engines**: Fetches real-time weather surge multipliers, traffic segment delays, and driver competition ratios.

● **What it does in your app:**
1. **Screenshot OCR Profit/Loss Detector**: Parses order slip screenshots to calculate base fuel cost, idling traffic penalties, profit margin %, and real hourly rate.
2. **Opportunity Radar**: Sweeps 360 degrees around worker coordinates to recommend optimal shift locations based on low competition and high surge rates.
3. **Multilingual Copilot Q&A**: Answers worker queries regarding fuel prices (₹110.93–₹111.68/L), shift spending, earnings summaries, and fair fare benchmarks in 7 Indian languages.

● **Why we chose this approach:**
A rule-backed hybrid approach ensures zero-latency deterministic decisioning during live navigation while leveraging LLMs and OCR for natural language assistance and document vision. This eliminates black-box hallucinations and guarantees exact financial accuracy for gig workers.

## Tech Stack
● **Frontend:** React.js (v18), Tailwind CSS, Lucide Icons, Vite, Tesseract.js  
● **Backend:** Node.js, Express.js, Axios, Dotenv  
● **AI/ML:** Groq Llama 3.3-70B LLM, Tesseract OCR Engine  
● **Database/Storage:** SQLite3 + Dual In-Memory Store  
● **Deployment & Hosting:** Vercel / Node Server  (not deployed yet) 
● **Other tools/APIs:** TomTom Live Traffic & Routing API, OpenWeatherMap API, Google Maps Directions API  

## Features Implemented

### Core Requirements:
- [x] **Real-Time Opportunity Radar**: 360-degree rotating radar beam with spaced-out Google Maps location pins displaying live hourly rates (`₹322/hr`, `₹270/hr`).
- [x] **AI Screenshot OCR Analyzer**: Upload or pick sample order slips (Swiggy, Zomato, Uber, Blinkit) to parse payout, distance, fuel expenses, and profit vs loss.
- [x] **Smart Location & Competition Engine**: Calculates net hourly yield considering live driver density, travel distance, and time-of-day peak windows (Lunch Rush, Dinner Prime).
- [x] **Direct Google Maps Navigation**: One-click **Route** button opens turn-by-turn navigation directly to high-profit zones.
- [x] **Shift & Burnout Guardian**: Monitors continuous driving hours ($\ge 4.0\text{h}$) and triggers fatigue alerts to protect worker safety.
- [x] **GigDNA Reputation Index**: 5-dimensional score (`Reliability`, `Safety`, `Efficiency`, `Income Stability`, `Customer Happiness`) reacting dynamically to worker decisions.

### Bonus Features Attempted:
- [x] **Multilingual Support**: Supports 7 regional Indian languages (English, Hindi, Kannada, Bengali, Marathi, Telugu, Tamil).
- [x] **Live TomTom Traffic Surcharge**: Integrates TomTom Traffic Flow API to add idling fuel penalties to congested order routes.
- [x] **Smart Chatbot Intent Engine**: Answers petrol/fuel rate queries (`₹110.93–₹111.68/L`), daily fuel expenses, and shift summaries accurately.
- [x] **Dark / Light Aesthetic Design**: Custom human-centric aesthetic brand mark and theme toggle.

## How to Run This Project

```bash
# Clone the repo
git clone https://github.com/Tusharjain-19/gigpilot.git
cd gigpilot

# Install dependencies
npm install
npm --prefix client install
npm --prefix server install

# Copy the example env file and fill in your own keys
cp .env.example .env
cp server/.env.example server/.env

# Run the project
npm run dev:all
```

If your project needs an API key to run, make sure `.env.example` is up to date so judges can test it easily (or provide a demo mode/mock key if the key is private).

### API Keys / Environment Variables
Do not hardcode API keys or upload them directly to GitHub. Instead:
1. Create a `.env` file in your project root and put all your API keys/secrets there.
2. Add `.env` to your `.gitignore` file so it never gets pushed to your public repo.
3. Create a `.env.example` file (this one should be committed) listing the variable names your project needs, without real values so judges know exactly which keys to add on their end.

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
TOMTOM_API_KEY=your_tomtom_api_key_here
WEATHER_API_KEY=your_openweather_api_key_here
```

## Screenshots (Optional)

| Swiggy High Yield Order | Zomato Underpaid Order |
| :---: | :---: |
| ![Swiggy Screenshot](screenshots/swiggy_high.png) | ![Zomato Screenshot](screenshots/zomato_long.png) |

| Uber Package Surge Order | Blinkit Quick Commerce Order |
| :---: | :---: |
| ![Uber Screenshot](screenshots/uber_surge.png) | ![Blinkit Screenshot](screenshots/blinkit_low.png) |
