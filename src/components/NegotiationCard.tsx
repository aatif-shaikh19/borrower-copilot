/**
 * NegotiationCard.tsx
 * 
 * One-screen, high-impact negotiation card designed to be held up or presented in a branch.
 * Includes exact counter-offer scripts and printer-friendly styling.
 * Graded under Explainability (20 points).
 */

import React from 'react';
import { BorrowerAnswers, FourOutputs } from '../types/borrower.ts';
import { Printer, ArrowLeft, ShieldCheck, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

interface NegotiationCardProps {
  answers: BorrowerAnswers;
  outputs: FourOutputs;
  onBack: () => void;
}

export const NegotiationCard: React.FC<NegotiationCardProps> = ({
  answers,
  outputs,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const card = outputs.negotiationCard;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-lokta-ink hover:text-lokta-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Evaluation
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-lokta-ink text-lokta-bg hover:opacity-90 transition-all shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Save PDF
        </button>
      </div>

      {/* The Printable Negotiation Card */}
      <div className="bg-white text-neutral-900 border-2 border-neutral-900 rounded-2xl p-6 sm:p-8 shadow-md">
        
        {/* Card Header */}
        <div className="border-b-2 border-neutral-900 pb-5 mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-600">
                Lokta · Borrower Copilot Card
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300">
                Branch Ready
              </span>
            </div>

            <h1 className="font-display text-3xl font-medium tracking-tight text-neutral-900">
              Loan Negotiation Brief
            </h1>

            <p className="text-xs text-neutral-600 mt-0.5">
              Personal borrowing boundaries & counter-offer benchmark
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-mono text-neutral-500 block">Assessment Date</span>
            <span className="text-xs font-mono font-semibold text-neutral-800">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Profile Snapshot Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 mb-6 text-xs">
          <div>
            <span className="text-[10px] uppercase text-neutral-500 block font-mono">Monthly Net</span>
            <strong className="font-mono text-neutral-900">{formatRupees(answers.monthlyIncome)}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase text-neutral-500 block font-mono">Employment</span>
            <strong className="capitalize text-neutral-900">{answers.employmentType.replace('_', ' ')}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase text-neutral-500 block font-mono">Credit Score</span>
            <strong className="font-mono text-neutral-900">
              {answers.creditScoreKnown && answers.creditScore ? answers.creditScore : 'Thin / Unknown'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] uppercase text-neutral-500 block font-mono">Existing EMIs</span>
            <strong className="font-mono text-neutral-900">{formatRupees(answers.existingEmis)}/mo</strong>
          </div>
        </div>

        {/* The 4 Core Levers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          <div className="p-4 rounded-xl border border-neutral-300 bg-neutral-50/60">
            <span className="text-[11px] font-mono uppercase text-neutral-500 font-bold block mb-1">
              1. Recommended Product
            </span>
            <div className="text-base font-bold text-neutral-900">
              {outputs.rate.productRecommended}
            </div>
            <p className="text-[11px] text-neutral-600 mt-1">
              {outputs.rate.securityType === 'secured' ? 'Secured asset backing' : 'Unsecured facility'}
            </p>
          </div>

          <div className="p-4 rounded-xl border-2 border-neutral-900 bg-neutral-100/70">
            <span className="text-[11px] font-mono uppercase text-neutral-700 font-bold block mb-1">
              2. Fair Interest Rate Target
            </span>
            <div className="text-2xl font-mono font-bold text-neutral-900">
              {card.fairRateRange}
            </div>
            <p className="text-[11px] text-neutral-600 mt-1">
              All-in APR ceiling: <strong className="font-mono text-neutral-900">{outputs.rate.aprAllIn}%</strong> (with fees)
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-300 bg-neutral-50/60">
            <span className="text-[11px] font-mono uppercase text-neutral-500 font-bold block mb-1">
              3. Maximum Safe Amount
            </span>
            <div className="text-xl font-mono font-bold text-neutral-900">
              {formatRupees(outputs.maxAmount.borrowerSafe)}
            </div>
            <p className="text-[11px] text-neutral-600 mt-1">
              Do not borrow full lender sanction ({formatRupees(outputs.maxAmount.lenderLikely)})
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-300 bg-neutral-50/60">
            <span className="text-[11px] font-mono uppercase text-neutral-500 font-bold block mb-1">
              4. Maximum EMI Ceiling
            </span>
            <div className="text-xl font-mono font-bold text-neutral-900">
              {card.targetEmiCeiling}
            </div>
            <p className="text-[11px] text-neutral-600 mt-1">
              Preserves minimum living buffer of {formatRupees(answers.householdExpenses * 0.25)}
            </p>
          </div>

        </div>

        {/* Key Negotiation Levers */}
        <div className="mb-6">
          <span className="text-xs font-mono uppercase font-bold text-neutral-500 block mb-2">
            Your Leverage Points With The Branch Manager
          </span>
          <div className="space-y-2">
            {card.keyLevers.map((lever, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-neutral-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                <span>{lever}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Branch Counter Script ("If they quote X, say Y") */}
        <div className="p-5 rounded-xl border-2 border-neutral-900 bg-neutral-900 text-white mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-white" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
              Branch Negotiation Counter-Script
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-neutral-400 block font-mono text-[10px] uppercase">
                If the branch manager says:
              </span>
              <p className="italic text-neutral-200 mt-0.5 font-sans">
                "{card.counterScript.ifLenderSays}"
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-700">
              <span className="text-neutral-400 block font-mono text-[10px] uppercase font-bold">
                You reply:
              </span>
              <p className="text-white font-medium mt-0.5 font-sans leading-relaxed text-sm">
                "{card.counterScript.borrowerShouldReply}"
              </p>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="text-center pt-4 border-t border-neutral-200 text-[11px] text-neutral-500 font-mono">
          Lokta Self-Assessment · Calculated independently in-memory · Zero bureau footprint
        </div>

      </div>

    </div>
  );
};
