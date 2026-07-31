import React from 'react';
import { CheckCircle, XCircle, Zap, ArrowUpRight, Activity } from 'lucide-react';
import GigDNAScoreCard from './GigDNAScoreCard';
import BurnoutGuardian from './BurnoutGuardian';
import MissionPlanner from './MissionPlanner';

export default function Dashboard({ dashboardData, burnoutData, missionData, onSimulateOrder, onSwitchToRadar }) {
  if (!dashboardData) return null;

  const { earningsToday, ordersAccepted, ordersRejected, hoursActiveToday, compositeScore, gigDNA } = dashboardData;
  const ratePerHour = hoursActiveToday > 0 ? Math.round(earningsToday / hoursActiveToday) : 0;

  return (
    <div className="space-y-4 pb-20">

      {/* Hero Earnings Card */}
      <div className="card-panel p-5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-medium text-[#A1A1AA] mb-1">
          <span className="uppercase tracking-wider text-[#79DB8D] font-mono text-[10px] font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-[#15803D] text-[#15803D]" /> Shift Earnings Today
          </span>
          <span className="bg-[#111318] px-2.5 py-1 rounded border border-[#272A31] text-[#E4E4E7] font-mono text-xs">
            {hoursActiveToday}h Active
          </span>
        </div>

        <div className="flex items-baseline justify-between my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-heading font-bold text-[#F4F4F5] tracking-tight">₹{earningsToday}</span>
            <span className="text-xs font-mono font-semibold text-[#79DB8D] bg-[#15803D]/10 px-2 py-0.5 rounded border border-[#15803D]/30">
              +₹{ratePerHour}/hr
            </span>
          </div>

          <button
            onClick={onSimulateOrder}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#15803D] hover:bg-[#166534] text-[#F4F4F5] text-xs font-semibold active:scale-95 transition-all"
          >
            <Activity className="w-3.5 h-3.5" /> Simulate Order
          </button>
        </div>

        {/* Stat Chips */}
        <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-[#272A31]">
          <div className="bg-[#111318] rounded p-2.5 border border-[#272A31] flex items-center gap-3">
            <div className="p-2 rounded bg-[#15803D]/10 text-[#79DB8D]">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-semibold text-[#A1A1AA] uppercase">ACCEPTED</div>
              <div className="text-sm font-heading font-semibold text-[#F4F4F5]">{ordersAccepted} orders</div>
            </div>
          </div>

          <div className="bg-[#111318] rounded p-2.5 border border-[#272A31] flex items-center gap-3">
            <div className="p-2 rounded bg-[#C2410C]/10 text-[#FFB59D]">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-semibold text-[#A1A1AA] uppercase">REJECTED</div>
              <div className="text-sm font-heading font-semibold text-[#F4F4F5]">{ordersRejected} orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Burnout Guardian Banner */}
      <BurnoutGuardian burnoutData={burnoutData} onTakeBreak={() => alert("15-minute break logged! Burnout score updated.")} />

      {/* GigDNA Score Card */}
      <GigDNAScoreCard gigDNA={gigDNA} compositeScore={compositeScore} />

      {/* Quick Opportunity Radar Teaser */}
      <div
        onClick={onSwitchToRadar}
        className="cursor-pointer card-panel hover:border-[#15803D] p-4 flex items-center justify-between transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#111318] text-[#E4E4E7] border border-[#272A31]">
            <ArrowUpRight className="w-4 h-4 text-[#79DB8D]" />
          </div>
          <div>
            <h4 className="font-heading font-semibold text-sm text-[#F4F4F5]">
              View Opportunity Radar Map
            </h4>
            <p className="text-xs text-[#A1A1AA]">Koramangala surge active • ₹245/hr estimated</p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold text-[#79DB8D] bg-[#15803D]/10 px-3 py-1.5 rounded border border-[#15803D]/30">
          Open Radar →
        </span>
      </div>

      {/* Mission Planner Card */}
      <MissionPlanner mission={missionData} />

    </div>
  );
}
