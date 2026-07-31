import React, { useState, useEffect } from 'react';
import { Dna, ShieldCheck, TrendingUp, Zap, Heart, AlertTriangle } from 'lucide-react';
import { translations } from '../services/translations';

export default function GigDNAScoreCard({ gigDNA, compositeScore }) {
  const [lang, setLang] = useState(window.__selectedLang || 'en');

  useEffect(() => {
    const handleLang = (e) => setLang(e.detail || 'en');
    window.addEventListener('langChanged', handleLang);
    return () => window.removeEventListener('langChanged', handleLang);
  }, []);

  if (!gigDNA) return null;

  const t = translations[lang] || translations.en;

  const metrics = [
    { label: t.reliability, score: gigDNA.reliability, icon: ShieldCheck, color: 'bg-[#15803D]', desc: 'Acceptance accuracy' },
    { label: t.safety, score: gigDNA.safety, icon: AlertTriangle, color: 'bg-[#C2410C]', desc: 'Fatigue avoidance' },
    { label: t.efficiency, score: gigDNA.efficiency, icon: Zap, color: 'bg-[#15803D]', desc: 'Net ₹/km profit ratio' },
    { label: t.incomeStability, score: gigDNA.incomeStability, icon: TrendingUp, color: 'bg-[#15803D]', desc: 'Consistent high-margin picks' },
    { label: t.customerHappiness, score: gigDNA.customerHappiness, icon: Heart, color: 'bg-[#15803D]', desc: 'Estimated satisfaction' },
  ];

  const getScoreBadge = (score) => {
    if (score >= 85) return { text: 'EXCELLENT', color: 'bg-[#15803D]/10 text-[#15803D] dark:text-[#79DB8D] border-[#15803D]/30' };
    if (score >= 70) return { text: 'GOOD', color: 'bg-[var(--surface-low)] text-[var(--text-secondary)] border-[var(--border-color)]' };
    return { text: 'NEEDS CARE', color: 'bg-[#C2410C]/10 text-[#C2410C] dark:text-[#FFB59D] border-[#C2410C]/30' };
  };

  const badge = getScoreBadge(compositeScore || 80);

  return (
    <div className="card-panel p-4 sm:p-5 relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-[#15803D]/10 border border-[#15803D]/30 text-[#15803D] dark:text-[#79DB8D]">
            <Dna className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              {t.compositeScore}
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${badge.color}`}>
                {badge.text}
              </span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">{t.gigDnaCardDesc}</p>
          </div>
        </div>

        {/* Composite Score Box */}
        <div className="flex flex-col items-center justify-center min-w-[56px] py-1 px-2.5 rounded bg-[var(--surface-low)] border border-[var(--border-color)]">
          <span className="text-xl font-heading font-bold text-[var(--text-primary)]">
            {compositeScore || 80}
          </span>
          <span className="text-[8px] uppercase font-mono font-semibold text-[var(--text-muted)]">DNA INDEX</span>
        </div>
      </div>

      {/* 5 Metrics List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-[var(--surface-low)] rounded p-2.5 border border-[var(--border-color)]">
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <Icon className="w-3.5 h-3.5 text-[#71717A]" />
                  {item.label}
                </span>
                <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">{item.score}/100</span>
              </div>

              {/* Thin 2px Progress Bar */}
              <div className="w-full h-1 bg-[var(--border-color)] rounded-full overflow-hidden">
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
