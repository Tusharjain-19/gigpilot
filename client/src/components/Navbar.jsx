import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Radar, Trophy, MessageSquare, Upload, Key } from 'lucide-react';
import { translations } from '../services/translations';

export default function Navbar({ activeTab, setActiveTab }) {
  const [lang, setLang] = useState(window.__selectedLang || 'en');

  useEffect(() => {
    const handleLang = (e) => setLang(e.detail || 'en');
    window.addEventListener('langChanged', handleLang);
    return () => window.removeEventListener('langChanged', handleLang);
  }, []);

  const t = translations[lang] || translations.en;

  const tabs = [
    { id: 'dashboard', label: t.dashboardTab || 'Dashboard', icon: LayoutDashboard },
    { id: 'radar', label: t.radarTab || 'Radar Map', icon: Radar, badge: 'LIVE' },
    { id: 'ocr', label: t.ocrTab || 'OCR Predictor', icon: Upload },
    { id: 'keys', label: t.keysTab || 'API Keys', icon: Key },
    { id: 'missions', label: t.missionsTab || 'Missions', icon: Trophy },
    { id: 'chat', label: t.chatTab || 'Copilot Q&A', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111318]/95 border-t border-slate-200 dark:border-[#272A31] px-4 py-2 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded transition-all duration-200 ${
                isActive
                  ? 'text-[#15803D] dark:text-[#79DB8D] font-semibold'
                  : 'text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-[#F4F4F5]'
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 w-6 h-0.5 bg-[#15803D] rounded-full"></span>
              )}
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#15803D] dark:text-[#79DB8D]' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-3 text-[7px] font-mono font-bold px-1 rounded bg-[#15803D] text-white dark:text-[#F4F4F5]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight font-sans">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
