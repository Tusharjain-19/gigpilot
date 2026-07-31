import React, { useEffect } from 'react';
import { TrendingUp, ShieldCheck, ArrowRight, Bell, Route, Wallet, Zap, Sun, Moon } from 'lucide-react';
import GigPilotLogo from './GigPilotLogo';

export default function LandingPage({ onLaunchApp, onSimulateOrder, darkMode, onToggleTheme }) {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const lines = document.querySelectorAll('.radar-line');
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      
      lines.forEach((line, index) => {
        const depth = (index + 1) * 0.5;
        line.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
        line.style.transition = 'transform 0.2s ease-out';
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-[#111318] text-slate-900 dark:text-[#F4F4F5] font-sans min-h-screen selection:bg-[#15803D] selection:text-white transition-colors duration-200">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-8 md:px-12 lg:px-16 h-16 max-w-[1440px] left-1/2 -translate-x-1/2 bg-white/95 dark:bg-[#111318]/95 border-b border-slate-200 dark:border-[#272A31] backdrop-blur-md transition-colors">
        <div className="flex items-center gap-4 sm:gap-6">
          <GigPilotLogo size="md" />
          <div className="hidden md:flex gap-6 ml-4 lg:ml-6">
            <a className="text-slate-600 dark:text-[#becabc] hover:text-[#15803D] dark:hover:text-[#79DB8D] transition-colors text-xs sm:text-sm font-medium" href="#recommendations">Product</a>
            <a className="text-slate-600 dark:text-[#becabc] hover:text-[#15803D] dark:hover:text-[#79DB8D] transition-colors text-xs sm:text-sm font-medium" href="#gigdna">GigDNA</a>
            <a className="text-slate-600 dark:text-[#becabc] hover:text-[#15803D] dark:hover:text-[#79DB8D] transition-colors text-xs sm:text-sm font-medium" href="#features">Features</a>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded border border-slate-200 dark:border-[#272A31] bg-slate-100 dark:bg-[#1A1D23] text-slate-700 dark:text-[#A1A1AA] hover:text-emerald-600 dark:hover:text-[#F4F4F5] transition-all active:scale-95"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          )}

          <button
            onClick={onLaunchApp}
            className="bg-[#15803D] hover:bg-[#166534] text-white dark:text-[#d3ffd5] px-3 sm:px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 duration-150 border border-[#15803D]"
          >
            Launch Copilot App
          </button>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section with Clean Interactive Radar Line BG */}
        <section className="relative min-h-[500px] sm:min-h-[550px] flex flex-col items-center justify-center text-center px-4 sm:px-8 py-12 overflow-hidden bg-gradient-to-b from-white to-[var(--bg-primary)] dark:from-[#111318] dark:to-[#070A0F]">
          {/* Opportunity Radar Map Background */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-5 dark:opacity-10">
            <svg className="w-full h-full" height="100%" width="100%">
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" className="text-slate-300 dark:text-[#3f493f]" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#15803D]/10 border border-[#15803D]/30 text-[#15803D] dark:text-[#79DB8D] text-[11px] font-mono font-semibold uppercase tracking-wider">
              <Zap className="w-3 h-3" /> Real-time Proactive Copilot
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
              Don’t tell workers what happened.<br className="hidden sm:inline" />
              <span className="text-[#15803D] dark:text-[#79DB8D] block sm:inline"> Tell them what to do next.</span>
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed px-2 font-medium">
              GigPilot AI analyzes thousands of real-time data points to provide actionable navigation for independent professionals. Precision orchestration for the modern workforce.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2 max-w-xs sm:max-w-none mx-auto w-full">
              <button
                onClick={onLaunchApp}
                className="bg-[#15803D] hover:bg-[#166534] text-white px-5 py-2.5 rounded font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              >
                <span>Launch Live App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onSimulateOrder}
                className="border border-[var(--border-color)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:bg-[var(--surface-low)] px-5 py-2.5 rounded font-semibold text-xs uppercase tracking-wider transition-all"
              >
                Simulate Live Order
              </button>
            </div>
          </div>
        </section>

        {/* Live Recommendations Section */}
        <section id="recommendations" className="px-4 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 bg-slate-100 dark:bg-[#1a1b21]">
          <div className="max-w-[1280px] mx-auto">
            <div className="mb-6 sm:mb-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-[#e2e2e9] mb-2">Live Recommendations</h2>
              <div className="h-1 w-16 bg-[#15803D]"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Card 1 */}
              <div className="bg-white dark:bg-[#1a1b21] border border-slate-200 dark:border-[#272A31] p-5 sm:p-6 rounded flex flex-col justify-between group hover:border-[#15803D] dark:hover:border-[#79db8d] transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-slate-500 dark:text-[#becabc] text-xs font-mono font-semibold uppercase tracking-widest">Active Gig</span>
                    <span className="text-[#c5430f] font-bold text-xs font-mono">+18% Efficiency</span>
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-semibold text-slate-900 dark:text-[#e2e2e9] mb-1">Downtown Delivery</h3>
                  <p className="text-slate-600 dark:text-[#becabc] text-xs sm:text-sm mb-4">Optimal path identified avoiding heavy congestion on 5th Ave.</p>
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-[#e2e2e9] mb-6">₹260 <span className="text-xs sm:text-sm font-normal text-slate-500 dark:text-[#becabc]">est.</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={onLaunchApp} className="flex-1 bg-[#15803D] hover:bg-[#166534] text-white dark:text-[#e2e2e9] py-2 rounded text-xs font-semibold uppercase tracking-wider">Accept</button>
                  <button className="flex-1 border border-slate-300 dark:border-[#3f493f] text-slate-700 dark:text-[#e2e2e9] py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-[#282a2f]">Ignore</button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white dark:bg-[#1a1b21] border border-slate-200 dark:border-[#272A31] p-5 sm:p-6 rounded flex flex-col justify-between group hover:border-[#15803D] dark:hover:border-[#79db8d] transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-slate-500 dark:text-[#becabc] text-xs font-mono font-semibold uppercase tracking-widest">Surge Watch</span>
                    <span className="text-[#15803D] dark:text-[#79db8d] font-bold text-xs font-mono">High Value</span>
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-semibold text-slate-900 dark:text-[#e2e2e9] mb-1">North Station Hub</h3>
                  <p className="text-slate-600 dark:text-[#becabc] text-xs sm:text-sm mb-4">Arrival peak expected in 14 minutes. Recommended repositioning.</p>
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-[#e2e2e9] mb-6">₹360 <span className="text-xs sm:text-sm font-normal text-slate-500 dark:text-[#becabc]">est.</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={onLaunchApp} className="flex-1 bg-[#15803D] hover:bg-[#166534] text-white dark:text-[#e2e2e9] py-2 rounded text-xs font-semibold uppercase tracking-wider">Accept</button>
                  <button className="flex-1 border border-slate-300 dark:border-[#3f493f] text-slate-700 dark:text-[#e2e2e9] py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-[#282a2f]">Ignore</button>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white dark:bg-[#1a1b21] border border-slate-200 dark:border-[#272A31] p-5 sm:p-6 rounded flex flex-col justify-between group hover:border-[#15803D] dark:hover:border-[#79db8d] transition-colors col-span-1 sm:col-span-2 lg:col-span-1">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-slate-500 dark:text-[#becabc] text-xs font-mono font-semibold uppercase tracking-widest">Scheduled</span>
                    <span className="text-slate-500 dark:text-[#becabc] text-xs font-mono font-semibold">Consistent</span>
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-semibold text-slate-900 dark:text-[#e2e2e9] mb-1">Courier Route B</h3>
                  <p className="text-slate-600 dark:text-[#becabc] text-xs sm:text-sm mb-4">Reliable low-stress multi-stop route within current zone.</p>
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-[#e2e2e9] mb-6">₹225 <span className="text-xs sm:text-sm font-normal text-slate-500 dark:text-[#becabc]">est.</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={onLaunchApp} className="flex-1 bg-[#15803D] hover:bg-[#166534] text-white dark:text-[#e2e2e9] py-2 rounded text-xs font-semibold uppercase tracking-wider">Accept</button>
                  <button className="flex-1 border border-slate-300 dark:border-[#3f493f] text-slate-700 dark:text-[#e2e2e9] py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-[#282a2f]">Ignore</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GigDNA Profile Section */}
        <section id="gigdna" className="px-4 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white dark:bg-[#1e2025] border border-slate-200 dark:border-[#272A31] p-4 sm:p-6 rounded relative aspect-video flex items-center justify-center shadow-sm">
                {/* Simulated Data Viz */}
                <div className="w-full h-full flex items-end justify-between gap-1.5 sm:gap-2 px-2 sm:px-4 pb-2 sm:pb-4">
                  <div className="w-full bg-[#15803d] opacity-30 h-[30%] rounded-t"></div>
                  <div className="w-full bg-[#15803d] opacity-50 h-[60%] rounded-t"></div>
                  <div className="w-full bg-[#15803d] opacity-40 h-[45%] rounded-t"></div>
                  <div className="w-full bg-[#15803d] opacity-80 h-[90%] rounded-t"></div>
                  <div className="w-full bg-[#15803d] h-[75%] rounded-t"></div>
                  <div className="w-full bg-[#15803d] opacity-60 h-[40%] rounded-t"></div>
                  <div className="w-full bg-[#15803d] opacity-90 h-[100%] rounded-t"></div>
                </div>
                {/* Overlay Labels */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                  <div className="font-heading text-lg sm:text-xl font-semibold text-slate-900 dark:text-[#e2e2e9]">GigDNA Profile</div>
                  <div className="text-slate-500 dark:text-[#becabc] text-[10px] sm:text-xs font-mono uppercase tracking-widest mt-0.5">Worker: GP-9942</div>
                </div>
                <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 text-right">
                  <div className="text-[#15803D] dark:text-[#79db8d] font-bold text-xl sm:text-2xl font-heading">A+ Rating</div>
                  <div className="text-slate-500 dark:text-[#becabc] text-[9px] sm:text-[10px] font-mono uppercase">RELIABILITY INDEX</div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-3 sm:space-y-4">
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-[#e2e2e9] leading-tight">
                A blueprint of your professional value.
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-[#becabc] leading-relaxed">
                GigDNA maps your efficiency, reliability, and earnings growth across every platform. It’s a sovereign record of your skill that goes wherever you work.
              </p>
              <ul className="space-y-2.5 sm:space-y-3 pt-2">
                <li className="flex items-center gap-3">
                  <div className="p-1 rounded bg-[#15803D]/10 text-[#15803D] dark:text-[#79db8d]">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-slate-900 dark:text-[#e2e2e9] text-sm sm:text-base font-medium">Precision Efficiency Mapping</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1 rounded bg-[#15803D]/10 text-[#15803D] dark:text-[#79db8d]">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-slate-900 dark:text-[#e2e2e9] text-sm sm:text-base font-medium">Portable Reputation Scoring</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1 rounded bg-[#15803D]/10 text-[#15803D] dark:text-[#79db8d]">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-slate-900 dark:text-[#e2e2e9] text-sm sm:text-base font-medium">Long-term Income Forecasting</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-4 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20 bg-slate-100 dark:bg-[#0c0e13] border-y border-slate-200 dark:border-[#3f493f]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-[1280px] mx-auto">
            <div className="flex flex-col items-start bg-white dark:bg-[#1e2025] p-5 sm:p-6 rounded border border-slate-200 dark:border-[#272A31]">
              <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-[#272A31] rounded mb-3 sm:mb-4 text-[#15803D] dark:text-[#79db8d]">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="font-heading text-lg sm:text-xl font-semibold text-slate-900 dark:text-[#e2e2e9] mb-2">Proactive Alerts</h4>
              <p className="text-slate-600 dark:text-[#becabc] text-xs sm:text-sm leading-relaxed">
                Receive notifications before market shifts occur, allowing you to position yourself for maximum surge potential.
              </p>
            </div>

            <div className="flex flex-col items-start bg-white dark:bg-[#1e2025] p-5 sm:p-6 rounded border border-slate-200 dark:border-[#272A31]">
              <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-[#272A31] rounded mb-3 sm:mb-4 text-[#15803D] dark:text-[#79db8d]">
                <Route className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="font-heading text-lg sm:text-xl font-semibold text-slate-900 dark:text-[#e2e2e9] mb-2">Route Optimization</h4>
              <p className="text-slate-600 dark:text-[#becabc] text-xs sm:text-sm leading-relaxed">
                Proprietary algorithms calculate paths based on hourly data, reducing idle time by up to 22% daily.
              </p>
            </div>

            <div className="flex flex-col items-start bg-white dark:bg-[#1e2025] p-5 sm:p-6 rounded border border-slate-200 dark:border-[#272A31] col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-[#272A31] rounded mb-3 sm:mb-4 text-[#15803D] dark:text-[#79db8d]">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="font-heading text-lg sm:text-xl font-semibold text-slate-900 dark:text-[#e2e2e9] mb-2">Income Tracking</h4>
              <p className="text-slate-600 dark:text-[#becabc] text-xs sm:text-sm leading-relaxed">
                Consolidated dashboard for all gig earnings, automated tax estimation, and real-time net-profit analysis.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonial Quote Section */}
        <section className="px-4 sm:px-8 md:px-12 lg:px-16 py-16 sm:py-20 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
            <div className="text-[#15803D] dark:text-[#79db8d] text-3xl sm:text-4xl font-serif">“</div>
            <blockquote className="font-heading text-xl sm:text-3xl md:text-4xl italic text-slate-900 dark:text-[#e2e2e9] leading-snug">
              “It’s like having a senior partner in the passenger seat. I don’t hunt for work anymore; the work finds me when it’s most profitable.”
            </blockquote>
            <cite className="not-italic flex flex-col items-center pt-2">
              <span className="text-slate-900 dark:text-[#e2e2e9] font-heading font-semibold text-base sm:text-lg">Marcus Thorne</span>
              <span className="text-slate-500 dark:text-[#becabc] text-[10px] sm:text-xs font-mono uppercase tracking-widest mt-1">Independent Logistics Professional</span>
            </cite>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 sm:py-8 px-4 sm:px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1440px] mx-auto bg-slate-100 dark:bg-[#0c0e13] border-t border-slate-200 dark:border-[#3f493f]">
        <div className="flex flex-col gap-1 items-center md:items-start">
          <span className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-[#e2e2e9]">GigPilot AI</span>
          <p className="text-slate-500 dark:text-[#c6c6c7] text-xs font-mono">© 2026 GigPilot AI. Precision in every gig.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <a className="text-slate-600 dark:text-[#becabc] hover:text-[#15803D] dark:hover:text-[#79db8d] transition-colors text-xs font-mono" href="#">Privacy Policy</a>
          <a className="text-slate-600 dark:text-[#becabc] hover:text-[#15803D] dark:hover:text-[#79db8d] transition-colors text-xs font-mono" href="#">Terms of Service</a>
          <a className="text-slate-600 dark:text-[#becabc] hover:text-[#15803D] dark:hover:text-[#79db8d] transition-colors text-xs font-mono" href="#">Contact</a>
          <a className="text-slate-600 dark:text-[#becabc] hover:text-[#15803D] dark:hover:text-[#79db8d] transition-colors text-xs font-mono" href="#">Careers</a>
        </div>
      </footer>
    </div>
  );
}
