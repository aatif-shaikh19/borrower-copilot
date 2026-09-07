/**
 * QuestionScreen.tsx
 * 
 * Adaptive question wizard.
 * Presents one clean, focused question at a time with instant real-time output feedback.
 * Works seamlessly on mobile and desktop viewports.
 */

import React from 'react';
import { BorrowerAnswers, FourOutputs } from '../types/borrower.ts';
import { getActiveQuestionsList } from '../state/flowReducer.ts';
import { ConfidenceBadge } from './ConfidenceBadge.tsx';
import { ChevronRight, ChevronLeft, ArrowRight, Check, HelpCircle } from 'lucide-react';

interface QuestionScreenProps {
  answers: BorrowerAnswers;
  outputs: FourOutputs | null;
  stepIndex: number;
  onAnswerChange: (field: keyof BorrowerAnswers, value: unknown) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onViewOutputs: () => void;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  answers,
  outputs,
  stepIndex,
  onAnswerChange,
  onNext,
  onPrev,
  onSkip,
  onViewOutputs,
}) => {
  const allQuestions = getActiveQuestionsList(answers);
  const currentQ = allQuestions[stepIndex] || allQuestions[0];
  const isMustQuestion = stepIndex < 8;
  const isLastQuestion = stepIndex === allQuestions.length - 1;

  // Format currency helpers
  const formatRupees = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currentValue = answers[currentQ.field];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
      
      {/* Progress & Branch Banner */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-lokta-muted">
              Question {stepIndex + 1} of {allQuestions.length}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-lokta-bg2 border border-lokta-rule text-lokta-ink">
              {isMustQuestion ? 'Core Question' : `${answers.employmentType.replace('_', ' ')} Path`}
            </span>
          </div>
          <div className="w-48 sm:w-64 h-1.5 bg-lokta-rule rounded-full overflow-hidden">
            <div
              className="h-full bg-lokta-accent transition-all duration-300 rounded-full"
              style={{ width: `${((stepIndex + 1) / allQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {outputs && (
          <ConfidenceBadge
            level={outputs.confidence}
            multiplier={outputs.confidenceMultiplier}
            answeredCount={outputs.questionsAnsweredCount}
          />
        )}
      </div>

      {/* Main Question Card */}
      <div className="bg-lokta-bg2 border border-lokta-rule rounded-2xl p-6 sm:p-8 shadow-xs mb-6">
        
        <h2 className="font-display text-2xl sm:text-3xl font-medium text-lokta-ink mb-2 leading-tight">
          {currentQ.title}
        </h2>
        
        <p className="text-sm text-lokta-muted mb-6 leading-relaxed">
          {currentQ.subtitle}
        </p>

        {/* Input Controls */}
        <div className="mb-6">
          
          {/* Currency Input */}
          {currentQ.type === 'currency' && (
            <div>
              <div className="relative rounded-xl border-2 border-lokta-rule focus-within:border-lokta-accent bg-lokta-bg transition-colors p-3.5 flex items-center">
                <span className="text-2xl font-mono text-lokta-muted mr-2 font-medium">₹</span>
                <input
                  type="number"
                  min={currentQ.min ?? 0}
                  max={currentQ.max}
                  step={currentQ.step ?? 1000}
                  value={currentValue !== undefined && currentValue !== null ? Number(currentValue) : ''}
                  onChange={(e) => onAnswerChange(currentQ.field, e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder={currentQ.placeholder || '0'}
                  className="w-full text-2xl sm:text-3xl font-mono font-medium bg-transparent text-lokta-ink focus:outline-none"
                  autoFocus
                />
              </div>

              {Number(currentValue) > 0 && (
                <div className="mt-2 text-right">
                  <span className="text-xs font-mono font-semibold text-lokta-accent bg-lokta-accent-soft px-2.5 py-1 rounded-md">
                    {formatRupees(Number(currentValue))}
                  </span>
                </div>
              )}

              {/* Quick Increment Chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[50000, 100000, 500000, 1000000].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => {
                      const cur = Number(currentValue) || 0;
                      onAnswerChange(currentQ.field, cur + delta);
                    }}
                    className="text-xs font-mono px-2.5 py-1 bg-lokta-bg border border-lokta-rule hover:border-lokta-accent rounded-md text-lokta-muted hover:text-lokta-ink transition-colors"
                  >
                    +₹{(delta / 100000) >= 1 ? `${delta / 100000}L` : `${delta / 1000}k`}
                  </button>
                ))}
                {Number(currentValue) > 0 && (
                  <button
                    type="button"
                    onClick={() => onAnswerChange(currentQ.field, 0)}
                    className="text-xs font-mono px-2.5 py-1 bg-lokta-bg border border-lokta-rule hover:border-lokta-rose rounded-md text-lokta-muted hover:text-lokta-rose transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Number Input (Years, Months, Age) */}
          {currentQ.type === 'number' && (
            <div className="relative rounded-xl border-2 border-lokta-rule focus-within:border-lokta-accent bg-lokta-bg transition-colors p-3.5 flex items-center">
              <input
                type="number"
                min={currentQ.min ?? 0}
                max={currentQ.max}
                step={currentQ.step ?? 1}
                value={currentValue !== undefined && currentValue !== null ? Number(currentValue) : ''}
                onChange={(e) => onAnswerChange(currentQ.field, e.target.value === '' ? 0 : Number(e.target.value))}
                placeholder={currentQ.placeholder || '0'}
                className="w-full text-2xl sm:text-3xl font-mono font-medium bg-transparent text-lokta-ink focus:outline-none"
                autoFocus
              />
              {currentQ.unit && (
                <span className="text-sm font-semibold text-lokta-muted ml-2 uppercase">
                  {currentQ.unit}
                </span>
              )}
            </div>
          )}

          {/* Radio Card Options */}
          {currentQ.type === 'radio' && currentQ.options && (
            <div className="grid grid-cols-1 gap-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = currentValue === opt.value;
                return (
                  <label
                    key={String(opt.value)}
                    onClick={() => onAnswerChange(currentQ.field, opt.value)}
                    className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-lokta-accent bg-lokta-accent-soft/40 shadow-xs'
                        : 'border-lokta-rule bg-lokta-bg hover:border-lokta-muted/60'
                    }`}
                  >
                    <div className="pr-3">
                      <div className="text-sm font-semibold text-lokta-ink">
                        {opt.label}
                      </div>
                      {opt.hint && (
                        <div className="text-xs text-lokta-muted mt-0.5">
                          {opt.hint}
                        </div>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition-colors ${
                        isSelected
                          ? 'border-lokta-accent bg-lokta-accent text-white'
                          : 'border-lokta-rule bg-lokta-bg'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

        </div>

        {/* Question rationale helper */}
        {currentQ.helpText && (
          <div className="flex items-start gap-2 p-3 bg-lokta-bg rounded-lg border border-lokta-rule/70 text-xs text-lokta-muted">
            <HelpCircle className="w-4 h-4 text-lokta-accent shrink-0 mt-0.5" />
            <span>{currentQ.helpText}</span>
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={stepIndex === 0}
          className={`inline-flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            stepIndex === 0
              ? 'opacity-40 cursor-not-allowed text-lokta-muted'
              : 'text-lokta-ink hover:bg-lokta-bg2 border border-lokta-rule'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {!isMustQuestion && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-lokta-muted hover:text-lokta-ink px-3 py-2 transition-colors font-medium"
            >
              Skip (Keep Wide Band)
            </button>
          )}

          {isLastQuestion ? (
            <button
              type="button"
              onClick={onViewOutputs}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-lokta-accent text-white hover:opacity-95 shadow-md transition-all"
            >
              See All 4 Outputs
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-lokta-ink text-lokta-bg hover:opacity-90 shadow-sm transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Live Mini Output Peek (Shows borrower how rules react live) */}
      {outputs && (
        <div className="mt-8 p-4 rounded-xl border border-lokta-rule bg-lokta-bg2/80 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase text-lokta-muted">Live Status:</span>
            <span
              className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md ${
                outputs.verdict.call === 'borrow'
                  ? 'bg-emerald-100 text-emerald-800'
                  : outputs.verdict.call === 'borrow_less'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {outputs.verdict.call.replace('_', ' ')}
            </span>
            <span className="text-xs font-mono text-lokta-ink font-semibold">
              Safe limit: {formatRupees(outputs.maxAmount.borrowerSafe)}
            </span>
          </div>

          <button
            onClick={onViewOutputs}
            className="text-xs font-semibold text-lokta-accent hover:underline flex items-center gap-1 self-end sm:self-auto"
          >
            Open Full Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
