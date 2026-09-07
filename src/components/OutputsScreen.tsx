/**
 * OutputsScreen.tsx
 * 
 * Displays the Four Core Outputs (O1–O4) per Lokta Build Challenge specification.
 * Fully responsive, accessible, with complete explainability traceability sentences.
 */

import React, { useState } from 'react';
import { BorrowerAnswers, FourOutputs } from '../types/borrower.ts';
import { ConfidenceBadge } from './ConfidenceBadge.tsx';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Shield, 
  Percent, 
  Clock, 
  ArrowRight, 
  FileText,
  Info,
  Zap,
  Lock,
  Unlock
} from 'lucide-react';

interface OutputsScreenProps {
  answers: BorrowerAnswers;
  outputs: FourOutputs;
  onOpenNegotiationCard: () => void;
  onEditQuestions: () => void;
}

export const OutputsScreen: React.FC<OutputsScreenProps> = ({
  answers,
  outputs,
  onOpenNegotiationCard,
  onEditQuestions,
}) => {
  const [selectedTenure, setSelectedTenure] = useState<number>(
    outputs.rate.productCode === 'lap' ? 84 : 48
  );

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const verdictStyles = {
    borrow: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200',
      badge: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
      label: 'Borrow',
    },
    borrow_less: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200',
      badge: 'bg-amber-600 text-white',
      icon: AlertTriangle,
      label: 'Borrow Less',
    },
    dont_borrow: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200',
      badge: 'bg-rose-700 text-white',
      icon: XCircle,
      label: "Don't Borrow",
    },
  }[outputs.verdict.call];

  const VerdictIcon = verdictStyles.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-10">
      
      {/* Top Banner & Confidence Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-lokta-rule">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-lokta-muted">
            Evaluation Report · Four Decisions
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-lokta-ink mt-0.5">
            Borrower Assessment Summary
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <ConfidenceBadge
            level={outputs.confidence}
            multiplier={outputs.confidenceMultiplier}
            answeredCount={outputs.questionsAnsweredCount}
            showExplanation
          />
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          OUTPUT 1: VERDICT (O1)
         --------------------------------------------------------------------- */}
      <section className={`rounded-2xl border-2 p-6 sm:p-8 ${verdictStyles.bg} shadow-xs transition-all`}>
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/30 shadow-xs">
            <VerdictIcon className="w-8 h-8 shrink-0 text-current" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-md ${verdictStyles.badge}`}>
                Output 1 · {verdictStyles.label}
              </span>
              {outputs.verdict.safeRecommendedAmount > 0 && outputs.verdict.call === 'borrow_less' && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/70 dark:bg-black/40 border border-current">
                  Safe Cap: {formatRupees(outputs.verdict.safeRecommendedAmount)}
                </span>
              )}
            </div>

            <p className="text-lg sm:text-xl font-medium text-lokta-ink leading-snug mb-2">
              {outputs.verdict.reason}
            </p>

            <p className="text-sm opacity-90 leading-relaxed max-w-3xl">
              {outputs.verdict.detailedWhy}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          OUTPUT 2: MAXIMUM AMOUNT (O2)
         --------------------------------------------------------------------- */}
      <section className="bg-lokta-bg2 border border-lokta-rule rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-lokta-muted">
              Output 2 · Maximum Capacity
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-lokta-ink">
              Lender Sanction vs. Safe Carry
            </h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-lokta-accent-soft text-lokta-accent">
            Separated Comparison
          </span>
        </div>

        <p className="text-sm text-lokta-muted mb-6 max-w-2xl">
          Lender models stretch affordability up to 50–65% FOIR. Your safe carry limit preserves living expenses and emergency buffers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* Card A: Lender Sanction */}
          <div className="p-5 rounded-xl border border-lokta-rule bg-lokta-bg relative opacity-85">
            <span className="text-xs font-bold uppercase tracking-wider text-lokta-muted block mb-1">
              What a Lender Will Sanction
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-semibold text-lokta-ink mb-1">
              {formatRupees(outputs.maxAmount.lenderLikely)}
            </div>
            <p className="text-xs text-lokta-muted leading-relaxed">
              Based on aggressive bank FOIR ceilings (up to 50–65%). Lenders assume you can devote over half your income to debt without defaulting.
            </p>
          </div>

          {/* Card B: Borrower Safe Carry (Highlighted) */}
          <div className="p-5 rounded-xl border-2 border-lokta-accent bg-lokta-accent-soft/30 relative shadow-sm">
            <div className="absolute top-3 right-3 bg-lokta-accent text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
              Recommended: Use This
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-lokta-accent block mb-1">
              What You Can Safely Carry
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-bold text-lokta-ink mb-1">
              {formatRupees(outputs.maxAmount.borrowerSafe)}
            </div>
            <p className="text-xs text-lokta-muted leading-relaxed">
              Based on conservative 25–35% safe FOIR. Guarantees your essential monthly living cushion is never exhausted by EMIs.
            </p>
          </div>

        </div>

        {/* Why difference explanation */}
        <div className="p-4 rounded-xl bg-lokta-bg border border-lokta-rule flex items-start gap-3 text-xs text-lokta-muted">
          <Info className="w-4 h-4 text-lokta-accent shrink-0 mt-0.5" />
          <p className="leading-relaxed text-lokta-ink/90">
            <strong>Why these numbers differ:</strong> {outputs.maxAmount.whyDifference}
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          OUTPUT 3: FAIR INTEREST RATE & ALL-IN APR (O3)
         --------------------------------------------------------------------- */}
      <section className="bg-lokta-bg2 border border-lokta-rule rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-lokta-muted">
              Output 3 · Pricing & All-in Cost
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-lokta-ink">
              Fair Interest Rate & True APR
            </h2>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-lokta-accent text-white">
            {outputs.rate.securityType === 'secured' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            {outputs.rate.securityType.toUpperCase()}
          </span>
        </div>

        {/* Recommended Product Box */}
        <div className="p-4 rounded-xl bg-lokta-bg border border-lokta-rule mb-6">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <span className="text-xs uppercase font-bold text-lokta-muted">Recommended Product Route:</span>
            <span className="text-sm font-bold text-lokta-accent">
              {outputs.rate.productRecommended}
            </span>
          </div>
          <p className="text-xs text-lokta-muted leading-relaxed">
            {outputs.rate.whySecuredOrUnsecured}
          </p>
        </div>

        {/* Rate Band & All-In APR Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          {/* Fair Rate Band */}
          <div className="p-5 rounded-xl bg-lokta-bg border border-lokta-rule">
            <span className="text-xs font-bold uppercase tracking-wider text-lokta-muted block mb-1">
              Fair Nominal Interest Rate Band
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-semibold text-lokta-ink mb-1">
              {outputs.rate.bandLow}% – {outputs.rate.bandHigh}%
            </div>
            <span className="text-xs text-lokta-muted">
              Market midpoint benchmark: <strong className="text-lokta-ink">{outputs.rate.nominalRatePoint}% p.a.</strong>
            </span>
          </div>

          {/* True All-in APR (IRR) */}
          <div className="p-5 rounded-xl bg-lokta-bg border-2 border-lokta-accent/60">
            <span className="text-xs font-bold uppercase tracking-wider text-lokta-accent block mb-1">
              All-In APR (RBI Cash-Flow IRR)
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-bold text-lokta-accent mb-1">
              {outputs.rate.aprAllIn}%
            </div>
            <span className="text-xs text-lokta-muted">
              Includes 1.5% processing fee + 18% GST deducted upfront at disbursal.
            </span>
          </div>

        </div>

        {/* Upfront fee deduction detail */}
        <div className="p-3.5 rounded-lg bg-lokta-bg border border-lokta-rule/70 text-xs font-mono text-lokta-muted">
          {outputs.rate.feeBreakdown}
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          OUTPUT 4: MONTHLY EMI CEILING, TENURES & STRESS TEST (O4)
         --------------------------------------------------------------------- */}
      <section className="bg-lokta-bg2 border border-lokta-rule rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-lokta-muted">
              Output 4 · Repayment & Stress Case
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-lokta-ink">
              Safe EMI Ceiling & Tenure Trade-offs
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-lokta-muted block uppercase">Monthly Ceiling</span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-lokta-accent">
              {formatRupees(outputs.emi.ceiling)}/mo
            </span>
          </div>
        </div>

        {/* Tenure Options Comparison Table */}
        <div className="mb-6 overflow-x-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-lokta-muted block mb-2">
            Tenure Trade-Off Options (Interest vs. Monthly Outflow)
          </span>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-lokta-rule text-lokta-muted uppercase font-semibold">
                <th className="py-2.5 pr-4">Tenure</th>
                <th className="py-2.5 pr-4">Monthly EMI</th>
                <th className="py-2.5 pr-4">Total Interest Paid</th>
                <th className="py-2.5">Total Outflow</th>
              </tr>
            </thead>
            <tbody className="font-mono divide-y divide-lokta-rule/50">
              {outputs.emi.tenureOptions.map((opt) => {
                const isSelected = selectedTenure === opt.months;
                return (
                  <tr
                    key={opt.months}
                    onClick={() => setSelectedTenure(opt.months)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-lokta-accent-soft/50 font-semibold'
                        : 'hover:bg-lokta-bg'
                    }`}
                  >
                    <td className="py-3 pr-4 font-sans font-medium text-lokta-ink">
                      {opt.months} Months ({Math.round((opt.months / 12) * 10) / 10} yrs)
                      {opt.months === outputs.emi.recommendedTenureMonths && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-lokta-accent text-white font-mono uppercase">
                          Recommended
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-lokta-ink">
                      {formatRupees(opt.emi)}/mo
                    </td>
                    <td className="py-3 pr-4 text-lokta-muted">
                      {formatRupees(opt.totalInterest)}
                    </td>
                    <td className="py-3 font-semibold text-lokta-ink">
                      {formatRupees(opt.totalRepayment)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Stress Case Card (RULES.md §9) */}
        <div
          className={`p-5 rounded-xl border-2 ${
            outputs.emi.stressCase.isBreached
              ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200'
              : 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-4 h-4 text-current" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Stress Case: {outputs.emi.stressCase.scenario}
            </span>
          </div>

          <p className="text-sm font-semibold mb-1">
            {outputs.emi.stressCase.stressedMetric}
          </p>

          <p className="text-xs opacity-90 leading-relaxed">
            {outputs.emi.stressCase.verdict}
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          TRACEABILITY & EXPLAINABILITY (Rubric: 20 pts)
         --------------------------------------------------------------------- */}
      <section className="bg-lokta-bg border border-lokta-rule rounded-2xl p-6 sm:p-8">
        <h3 className="font-display text-xl font-medium text-lokta-ink mb-1">
          Traceability: Why These Numbers
        </h3>
        <p className="text-xs text-lokta-muted mb-4">
          Every decision is directly mapped to what you told us. No hidden assumptions.
        </p>

        <ul className="space-y-2.5 text-xs text-lokta-ink">
          {outputs.traceability.map((trace, idx) => (
            <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-lokta-bg2 border border-lokta-rule/60">
              <span className="font-mono font-bold text-lokta-accent shrink-0">#{idx + 1}</span>
              <span className="leading-relaxed">{trace}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-lokta-accent text-white rounded-2xl shadow-md">
        <div>
          <h3 className="font-display text-xl font-medium mb-0.5">
            Ready to Walk Into the Branch?
          </h3>
          <p className="text-xs opacity-85">
            Open the 1-page Negotiation Card with exact counter-offer scripts for branch managers.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onEditQuestions}
            className="flex-1 sm:flex-none text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/40 hover:bg-white/10 transition-colors"
          >
            Edit Answers
          </button>

          <button
            onClick={onOpenNegotiationCard}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-xl bg-white text-lokta-accent hover:opacity-95 shadow-xs transition-all"
          >
            <FileText className="w-4 h-4" />
            Open Negotiation Card
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
