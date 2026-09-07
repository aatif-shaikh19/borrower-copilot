/**
 * ConfidenceBadge.tsx
 * 
 * Displays the calculation confidence level (Low, Medium, High)
 * and explains how silence widens output bands.
 */

import React from 'react';
import { ConfidenceLevel } from '../types/borrower.ts';
import { ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  answeredCount: number;
  multiplier: number;
  showExplanation?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  level,
  answeredCount,
  multiplier,
  showExplanation = false,
}) => {
  const config = {
    high: {
      label: 'High Confidence (±10%)',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: ShieldCheck,
      description: `Precise estimate. You answered ${answeredCount} detailed profile questions. Rate and amount bands are tightened to ±10%.`,
    },
    medium: {
      label: 'Medium Confidence (±20%)',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      icon: ShieldAlert,
      description: `Moderate precision (±20% band). Answer more profile questions to narrow down interest rates.`,
    },
    low: {
      label: 'Low Confidence (±30% Widened)',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
      icon: AlertCircle,
      description: `Silence penalty: Baseline answers only. Bands are widened by ±30% to account for unstated income regularity and asset details.`,
    },
  }[level];

  const IconComponent = config.icon;

  return (
    <div className="inline-flex flex-col gap-1">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badgeClass}`}
        title={`Confidence level: ${level.toUpperCase()}`}
      >
        <IconComponent className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </div>
      {showExplanation && (
        <p className="text-xs text-lokta-muted mt-1 leading-snug">
          {config.description}
        </p>
      )}
    </div>
  );
};
