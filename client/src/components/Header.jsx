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
          <div className="relative group">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 dark:border-[#272A31] bg-slate-100 dark:bg-[#1A1D23] text-slate-800 dark:text-[#E4E4E7] hover:text-[#15803D] dark:hover:text-[#79DB8D] text-xs font-semibold tracking-wide transition-all focus:outline-none focus:ring-1 focus:ring-[#15803D]"
            >
              <span className="font-mono">🌐</span>
              <span>{
                {
                  'en': 'English',
                  'hi': 'हिन्दी (Hindi)',
                  'kn': 'ಕನ್ನಡ (Kannada)',
                  'bn': 'বাংলা (Bengali)',
                  'mr': 'मराठी (Marathi)',
                  'te': 'తెలుగు (Telugu)',
                  'ta': 'தமிழ் (Tamil)'
                }[window.__selectedLang || 'en']
              }</span>
            </button>
            
            {/* Custom Dropdown Options list */}
            <div className="absolute right-0 mt-1 w-44 rounded bg-white dark:bg-[#1A1D23] border border-slate-200 dark:border-[#272A31] shadow-lg hidden group-hover:block hover:block z-50 py-1 transition-all animate-fade-in">
              {[
                { code: 'en', name: 'English' },
                { code: 'hi', name: 'हिन्दी (Hindi)' },
                { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
                { code: 'bn', name: 'বাংলা (Bengali)' },
                { code: 'mr', name: 'मराठी (Marathi)' },
                { code: 'te', name: 'తెలుగు (Telugu)' },
                { code: 'ta', name: 'தமிழ் (Tamil)' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={async () => {
                    window.__selectedLang = lang.code;
                    if (window.__onLanguageChange) {
                      await window.__onLanguageChange(lang.code);
                    }
                    // Trigger a re-render by dispatching a custom event
                    window.dispatchEvent(new CustomEvent('langChanged', { detail: lang.code }));
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#15803D]/10 hover:text-[#15803D] dark:hover:text-[#79DB8D] transition-colors flex items-center justify-between ${
                    (window.__selectedLang || 'en') === lang.code
                      ? 'text-[#15803D] dark:text-[#79DB8D] font-semibold bg-[#15803D]/5'
                      : 'text-slate-700 dark:text-[#becabc]'
                  }`}
                >
                  <span>{lang.name}</span>
                  {(window.__selectedLang || 'en') === lang.code && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
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
