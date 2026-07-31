import React from 'react';
import { Target, Trophy, Clock, CheckCircle } from 'lucide-react';

export default function MissionPlanner({ mission }) {
  if (!mission) return null;

  const percentage = Math.min(100, Math.round((mission.progress / mission.target) * 100));

  return (
    <div className="card-panel p-4 relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-[#111318] border border-[#272A31] text-[#E4E4E7]">
            <Trophy className="w-4 h-4 text-[#79DB8D]" />
          </div>
          <div>
            <h4 className="font-heading font-semibold text-sm text-[#F4F4F5] flex items-center gap-2">
              {mission.title}
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#111318] text-[#E4E4E7] border border-[#272A31]">
                MISSION
              </span>
            </h4>
            <p className="text-xs text-[#A1A1AA]">{mission.description}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-semibold text-[#79DB8D] bg-[#15803D]/10 border border-[#15803D]/30 px-2.5 py-1 rounded block">
            +₹{mission.reward} BONUS
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-[#A1A1AA] flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-[#15803D]" /> Progress: {mission.progress} / {mission.target} orders
          </span>
          <span className="text-[#79DB8D] font-mono">{percentage}%</span>
        </div>

        <div className="w-full h-1 bg-[#111318] rounded-full overflow-hidden border border-[#272A31]">
          <div
            className="h-full rounded-full bg-[#15803D] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#A1A1AA]">
        <span className="flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3 text-[#71717A]" /> Expires in {mission.expiresIn}
        </span>
        {mission.isCompleted && (
          <span className="text-[#79DB8D] font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Mission Completed!
          </span>
        )}
      </div>
    </div>
  );
}
