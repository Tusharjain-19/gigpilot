import React from 'react';
import { Coffee, Clock, ShieldAlert } from 'lucide-react';

export default function BurnoutGuardian({ burnoutData, onTakeBreak }) {
  if (!burnoutData) return null;

  const { atRisk, hoursActiveToday, message } = burnoutData;

  return (
    <div className={`card-panel p-4 transition-all border ${
      atRisk
        ? 'bg-[#111318] border-[#C2410C]/60 text-[#F4F4F5]'
        : 'bg-[#1A1D23] border-[#272A31]'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded shrink-0 ${
            atRisk ? 'bg-[#C2410C]/20 text-[#FFB59D] border border-[#C2410C]/40' : 'bg-[#15803D]/10 text-[#79DB8D]'
          }`}>
            {atRisk ? <ShieldAlert className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-heading font-semibold text-sm text-[#F4F4F5] flex items-center gap-2">
                Burnout Guardian
                <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                  atRisk ? 'bg-[#C2410C] text-[#F4F4F5]' : 'bg-[#111318] text-[#79DB8D] border border-[#272A31]'
                }`}>
                  {atRisk ? 'FATIGUE ALERT' : 'OPTIMAL ENERGY'}
                </span>
              </h4>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {atRisk && (
          <button
            onClick={onTakeBreak}
            className="shrink-0 px-3 py-1.5 rounded bg-[#C2410C] hover:bg-[#9A3412] text-[#F4F4F5] text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Coffee className="w-3.5 h-3.5" /> 15m Break
          </button>
        )}
      </div>
    </div>
  );
}
