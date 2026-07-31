import React from 'react';
import { Activity, Zap, Sun, Moon, Home } from 'lucide-react';

export default function Header({ worker, onSimulateOrder, isSimulating, darkMode, onToggleTheme, onGoLanding }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111318]/95 border-b border-slate-200 dark:border-[#272A31] px-3 sm:px-4 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#15803D] text-white font-extrabold shadow-sm shrink-0">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-heading font-semibold text-sm sm:text-base tracking-tight text-slate-900 dark:text-[#F4F4F5]">
                GigPilot<span className="text-[#15803D]">.AI</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#15803D]/10 border border-[#15803D]/30 text-[#15803D] dark:text-[#79DB8D] uppercase tracking-wider">
                COPILOT
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-[#A1A1AA] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
              {worker?.name || "Demo Worker"} • <span className="text-slate-700 dark:text-[#E4E4E7] font-medium">{worker?.platform || "Swiggy / Zomato"}</span>
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher */}
          <div className="relative">
            <select
              value={window.__selectedLang || 'en'}
              onChange={async (e) => {
                const newLang = e.target.value;
                window.__selectedLang = newLang;
                if (window.__onLanguageChange) {
                  window.__onLanguageChange(newLang);
                }
              }}
              className="p-1 sm:p-1.5 rounded border border-slate-200 dark:border-[#272A31] bg-slate-100 dark:bg-[#1A1D23] text-slate-700 dark:text-[#A1A1AA] hover:text-[#15803D] dark:hover:text-[#79DB8D] text-xs transition-all focus:outline-none"
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>

          {/* Landing Page Button */}
          {onGoLanding && (
            <button
              onClick={onGoLanding}
              title="Return to Landing Page"
              className="p-1.5 sm:p-2 rounded border border-slate-200 dark:border-[#272A31] bg-slate-100 dark:bg-[#1A1D23] text-slate-700 dark:text-[#A1A1AA] hover:text-[#15803D] dark:hover:text-[#79DB8D] transition-all active:scale-95 text-xs font-mono flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landing</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 sm:p-2 rounded border border-slate-200 dark:border-[#272A31] bg-slate-100 dark:bg-[#1A1D23] text-slate-700 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-[#F4F4F5] transition-all active:scale-95"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />}
          </button>

          {/* Hero Order Simulator Button */}
          <button
            onClick={onSimulateOrder}
            disabled={isSimulating}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded text-xs font-semibold transition-all active:scale-95 ${
              isSimulating
                ? 'bg-slate-200 dark:bg-[#282A2F] text-slate-400 dark:text-[#71717A] cursor-not-allowed border border-slate-300 dark:border-[#272A31]'
                : 'bg-[#15803D] hover:bg-[#166534] text-white dark:text-[#F4F4F5] border border-[#15803D]'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span className="whitespace-nowrap">{isSimulating ? 'Evaluating...' : 'Simulate Order'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
