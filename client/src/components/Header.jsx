import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Sun, Moon, Home, Globe, ChevronDown, Check } from 'lucide-react';
import GigPilotLogo from './GigPilotLogo';

export default function Header({ worker, onSimulateOrder, isSimulating, darkMode, onToggleTheme, onGoLanding }) {
  const [lang, setLang] = useState(window.__selectedLang || 'en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleLang = (e) => {
      setLang(e.detail || 'en');
    };
    window.addEventListener('langChanged', handleLang);

    // Close dropdown on click outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('langChanged', handleLang);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' }
  ];

  const handleSelectLanguage = (code) => {
    window.__selectedLang = code;
    setLang(code);
    setIsLangOpen(false);

    if (window.__onLanguageChange) {
      window.__onLanguageChange(code);
    }
    window.dispatchEvent(new CustomEvent('langChanged', { detail: code }));
  };

  const currentLangLabel = languageOptions.find(l => l.code === lang)?.name || 'English';

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface-card)] border-b border-[var(--border-color)] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <GigPilotLogo size="sm" />
          <div className="hidden xs:block text-[10px] sm:text-[11px] text-[var(--text-muted)] border-l border-[var(--border-color)] pl-2.5 py-0.5">
            <span className="text-[var(--text-secondary)] font-medium">{worker?.name || "Demo Worker"}</span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsLangOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded border border-[var(--border-color)] bg-[var(--surface-low)] text-[var(--text-primary)] hover:text-[#15803D] dark:hover:text-[#79DB8D] text-xs font-semibold tracking-wide transition-all focus:outline-none focus:ring-1 focus:ring-[#15803D]"
            >
              <Globe className="w-3.5 h-3.5 text-[#15803D]" />
              <span className="truncate max-w-[90px] sm:max-w-[120px]">{currentLangLabel}</span>
              <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Custom Dropdown Options list */}
            {isLangOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {languageOptions.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleSelectLanguage(l.code)}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#15803D]/10 hover:text-[#15803D] dark:hover:text-[#79DB8D] transition-colors flex items-center justify-between ${
                      lang === l.code
                        ? 'text-[#15803D] dark:text-[#79DB8D] font-bold bg-[#15803D]/10'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <span>{l.name}</span>
                    {lang === l.code && <Check className="w-3.5 h-3.5 text-[#15803D] dark:text-[#79DB8D]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Landing Page Button */}
          {onGoLanding && (
            <button
              onClick={onGoLanding}
              title="Return to Landing Page"
              className="p-1.5 sm:p-2 rounded border border-[var(--border-color)] bg-[var(--surface-low)] text-[var(--text-secondary)] hover:text-[#15803D] dark:hover:text-[#79DB8D] transition-all active:scale-95 text-xs font-mono flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landing</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 sm:p-2 rounded border border-[var(--border-color)] bg-[var(--surface-low)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />}
          </button>

          {/* Hero Order Simulator Button */}
          <button
            onClick={onSimulateOrder}
            disabled={isSimulating}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded text-xs font-semibold transition-all active:scale-95 ${
              isSimulating
                ? 'bg-slate-200 dark:bg-[#282A2F] text-slate-400 dark:text-[#71717A] cursor-not-allowed border border-slate-300 dark:border-[var(--border-color)]'
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
