import React from 'react';
import { CheckCircle2, XCircle, Fuel, TrendingUp, Navigation, ShieldCheck } from 'lucide-react';

export default function OrderDecisionModal({ orderData, onAccept, onReject, onClose }) {
  if (!orderData) return null;

  const { order, recommendation } = orderData;
  const isAccept = recommendation?.action === 'ACCEPT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1A1D23] max-w-lg w-full rounded-lg overflow-hidden border border-[#272A31] shadow-xl">
        
        {/* Recommendation Header Banner */}
        <div className={`p-4 flex items-center gap-3.5 ${
          isAccept ? 'bg-[#15803D] text-[#F4F4F5]' : 'bg-[#C2410C] text-[#F4F4F5]'
        }`}>
          <div className="p-2 rounded bg-black/20 shrink-0">
            {isAccept ? (
              <CheckCircle2 className="w-7 h-7 text-[#F4F4F5]" />
            ) : (
              <XCircle className="w-7 h-7 text-[#F4F4F5]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest px-2 py-0.5 rounded bg-black/30 text-[#F4F4F5]">
                COPILOT DECISION
              </span>
              <span className="text-xs font-mono opacity-90">
                {recommendation?.confidence || 94}% Confidence
              </span>
            </div>
            <h2 className="text-xl font-heading font-bold uppercase tracking-tight">
              RECOMMENDATION: {recommendation?.action}
            </h2>
          </div>
        </div>

        {/* Proactive One-Line Reasoning */}
        <div className="p-4 bg-[#111318] border-b border-[#272A31]">
          <div className="flex items-start gap-2.5">
            <div className={`p-1 rounded shrink-0 mt-0.5 ${isAccept ? 'bg-[#15803D]/10 text-[#79DB8D]' : 'bg-[#C2410C]/10 text-[#FFB59D]'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#F4F4F5] leading-snug">
              "{recommendation?.reason}"
            </p>
          </div>
        </div>

        {/* Order Economics Grid */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#111318] rounded p-3 border border-[#272A31] text-center">
              <span className="text-[10px] font-mono font-semibold text-[#A1A1AA] uppercase block mb-1">PAYOUT</span>
              <span className="text-lg font-heading font-bold text-[#F4F4F5]">₹{order.payout}</span>
            </div>

            <div className="bg-[#111318] rounded p-3 border border-[#272A31] text-center">
              <span className="text-[10px] font-mono font-semibold text-[#FFB59D] uppercase block mb-1 flex items-center justify-center gap-1">
                <Fuel className="w-3 h-3 text-[#C2410C]" /> FUEL COST
              </span>
              <span className="text-lg font-heading font-bold text-[#FFB59D]">-₹{order.fuelCostEstimate}</span>
            </div>

            <div className="bg-[#15803D]/10 rounded p-3 border border-[#15803D]/30 text-center">
              <span className="text-[10px] font-mono font-semibold text-[#79DB8D] uppercase block mb-1">NET PROFIT</span>
              <span className="text-xl font-heading font-bold text-[#79DB8D]">₹{order.profitEstimate}</span>
            </div>
          </div>

          {/* Route & Store Info */}
          <div className="bg-[#111318] rounded p-3.5 border border-[#272A31] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#79DB8D]" /> Distance:
              </span>
              <span className="font-semibold text-[#F4F4F5]">{order.distanceKm} km ({order.timeEstimateMin} mins)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Pickup:</span>
              <span className="font-medium text-[#E4E4E7] truncate max-w-[200px]">{order.pickupLocation}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Dropoff:</span>
              <span className="font-medium text-[#E4E4E7] truncate max-w-[200px]">{order.dropLocation}</span>
            </div>
          </div>

          {/* GigDNA Impact Preview */}
          <div className="bg-[#111318] p-2.5 rounded border border-[#272A31] flex items-center justify-between text-[11px]">
            <span className="text-[#A1A1AA] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#79DB8D]" /> Projected GigDNA Impact:
            </span>
            {isAccept ? (
              <span className="text-[#79DB8D] font-mono font-semibold">+2 Efficiency, +1 Income Stability</span>
            ) : (
              <span className="text-[#E4E4E7] font-mono font-semibold">+2 Reliability, +2 Safety</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onReject(order, recommendation?.action)}
              className="w-full py-3 rounded font-semibold text-xs border border-[#272A31] bg-[#111318] hover:bg-[#272A31] text-[#E4E4E7] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <XCircle className="w-4 h-4 text-[#C2410C]" />
              <span>Reject Order</span>
            </button>

            <button
              onClick={() => onAccept(order, recommendation?.action)}
              className="w-full py-3 rounded font-bold text-xs bg-[#15803D] hover:bg-[#166534] text-[#F4F4F5] transition-all border border-[#15803D] flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-[#F4F4F5]" />
              <span>Accept (+₹{order.profitEstimate})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
