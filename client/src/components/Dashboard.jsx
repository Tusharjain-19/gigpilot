import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Zap, ArrowUpRight, Activity } from 'lucide-react';
import GigDNAScoreCard from './GigDNAScoreCard';
import BurnoutGuardian from './BurnoutGuardian';
import MissionPlanner from './MissionPlanner';
import { translations } from '../services/translations';

export default function Dashboard({ dashboardData, burnoutData, missionData, onSimulateOrder, onSwitchToRadar }) {
  const [lang, setLang] = useState(window.__selectedLang || 'en');

  useEffect(() => {
    const handleLang = (e) => setLang(e.detail || 'en');
    window.addEventListener('langChanged', handleLang);
    return () => window.removeEventListener('langChanged', handleLang);
  }, []);

  if (!dashboardData) return null;

  const t = translations[lang] || translations.en;
  const { earningsToday, ordersAccepted, ordersRejected, hoursActiveToday, compositeScore, gigDNA } = dashboardData;
  const ratePerHour = hoursActiveToday > 0 ? Math.round(earningsToday / hoursActiveToday) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">

      {/* Top Hero Row (Grid on Large Screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        
        {/* Hero Earnings Card */}
        <div className="card-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)] mb-1">
              <span className="uppercase tracking-wider text-[#15803D] dark:text-[#79DB8D] font-mono text-[10px] font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-[#15803D] text-[#15803D]" /> {t.shiftEarnings || 'Shift Earnings'}
              </span>
              <span className="bg-[var(--surface-low)] px-2.5 py-1 rounded border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-xs">
                {hoursActiveToday}{t.hoursActive || 'h active'}
              </span>
            </div>

            <div className="flex items-baseline justify-between my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-heading font-bold text-[var(--text-primary)] tracking-tight">₹{earningsToday}</span>
                <span className="text-xs font-mono font-semibold text-[#15803D] dark:text-[#79DB8D] bg-[#15803D]/10 px-2 py-0.5 rounded border border-[#15803D]/30">
                  +₹{ratePerHour}/hr
                </span>
              </div>

              <button
                onClick={onSimulateOrder}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold active:scale-95 transition-all shadow-sm"
              >
                <Activity className="w-3.5 h-3.5" /> {t.simulateOrder || 'Simulate Order'}
              </button>
            </div>
          </div>

          {/* Stat Chips */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-color)]">
            <div className="bg-[var(--surface-low)] rounded p-2.5 border border-[var(--border-color)] flex items-center gap-3">
              <div className="p-2 rounded bg-[#15803D]/10 text-[#15803D] dark:text-[#79DB8D]">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase">{t.accepted || 'Accepted'}</div>
                <div className="text-sm font-heading font-semibold text-[var(--text-primary)]">{ordersAccepted} {t.orders || 'orders'}</div>
              </div>
            </div>

            <div className="bg-[var(--surface-low)] rounded p-2.5 border border-[var(--border-color)] flex items-center gap-3">
              <div className="p-2 rounded bg-[#C2410C]/10 text-[#C2410C] dark:text-[#FFB59D]">
                <XCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase">{t.rejected || 'Rejected'}</div>
                <div className="text-sm font-heading font-semibold text-[var(--text-primary)]">{ordersRejected} {t.orders || 'orders'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* GigDNA Score Card */}
        <GigDNAScoreCard gigDNA={gigDNA} compositeScore={compositeScore} />

      </div>

      {/* Burnout Guardian Banner */}
      <BurnoutGuardian burnoutData={burnoutData} onTakeBreak={() => alert("15-minute break logged! Burnout score updated.")} />

      {/* Secondary Row (Grid on Large Screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Opportunity Radar Teaser */}
        <div
          onClick={onSwitchToRadar}
          className="cursor-pointer card-panel hover:border-[#15803D] p-5 flex items-center justify-between transition-all group shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-[var(--surface-low)] text-[var(--text-primary)] border border-[var(--border-color)] group-hover:border-[#15803D]">
              <ArrowUpRight className="w-5 h-5 text-[#15803D] dark:text-[#79DB8D]" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-base text-[var(--text-primary)]">
                {t.viewRadar || 'Live Opportunity Radar'}
              </h4>
              <p className="text-xs text-[var(--text-muted)]">{t.surgeActive || 'Monsoon surge active'} • {t.estRate || '₹322/hr projected'}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#15803D] dark:text-[#79DB8D] bg-[#15803D]/10 px-3.5 py-2 rounded-lg border border-[#15803D]/30 group-hover:bg-[#15803D] group-hover:text-white transition-all">
            {t.openRadar || 'Open Radar'}
          </span>
        </div>

        {/* Mission Planner Card */}
        <MissionPlanner mission={missionData} />
      </div>

    </div>
  );
}
