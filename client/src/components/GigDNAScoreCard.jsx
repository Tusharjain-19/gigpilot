import React from 'react';
import { Dna, ShieldCheck, TrendingUp, Zap, Heart, AlertTriangle } from 'lucide-react';

export default function GigDNAScoreCard({ gigDNA, compositeScore }) {
  if (!gigDNA) return null;

  const metrics = [
    { label: 'Reliability', score: gigDNA.reliability, icon: ShieldCheck, color: 'bg-[#15803D]', desc: 'Acceptance accuracy' },
    { label: 'Safety', score: gigDNA.safety, icon: AlertTriangle, color: 'bg-[#C2410C]', desc: 'Fatigue avoidance' },
    { label: 'Efficiency', score: gigDNA.efficiency, icon: Zap, color: 'bg-[#15803D]', desc: 'Net ₹/km profit ratio' },
    { label: 'Income Stability', score: gigDNA.incomeStability, icon: TrendingUp, color: 'bg-[#15803D]', desc: 'Consistent high-margin picks' },
    { label: 'Customer Happiness', score: gigDNA.customerHappiness, icon: Heart, color: 'bg-[#15803D]', desc: 'Estimated satisfaction' },
  ];

  const getScoreBadge = (score) => {
    if (score >= 85) return { text: 'EXCELLENT', color: 'bg-[#15803D]/10 text-[#79DB8D] border-[#15803D]/30' };
    if (score >= 70) return { text: 'GOOD', color: 'bg-[#282A2F] text-[#E4E4E7] border-[#272A31]' };
    return { text: 'NEEDS CARE', color: 'bg-[#C2410C]/10 text-[#FFB59D] border-[#C2410C]/30' };
  };

  const badge = getScoreBadge(compositeScore || 80);

  return (
    <div className="card-panel p-4 sm:p-5 relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-[#15803D]/10 border border-[#15803D]/30 text-[#79DB8D]">
            <Dna className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-[#F4F4F5] tracking-tight flex items-center gap-2">
              GigDNA Score
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${badge.color}`}>
                {badge.text}
              </span>
            </h3>
            <p className="text-xs text-[#A1A1AA]">Continuous AI performance index (recalculated live)</p>
          </div>
        </div>

        {/* Composite Score Box */}
        <div className="flex flex-col items-center justify-center min-w-[56px] py-1 px-2.5 rounded bg-[#111318] border border-[#272A31]">
          <span className="text-xl font-heading font-bold text-[#F4F4F5]">
            {compositeScore || 80}
          </span>
          <span className="text-[8px] uppercase font-mono font-semibold text-[#A1A1AA]">DNA INDEX</span>
        </div>
      </div>

      {/* 5 Metrics List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-[#111318] rounded p-2.5 border border-[#272A31]">
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="flex items-center gap-1.5 text-[#E4E4E7]">
                  <Icon className="w-3.5 h-3.5 text-[#71717A]" />
                  {item.label}
                </span>
                <span className="font-mono text-xs font-semibold text-[#F4F4F5]">{item.score}/100</span>
              </div>

              {/* Thin 2px Progress Bar */}
              <div className="w-full h-1 bg-[#272A31] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
