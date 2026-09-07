/**
 * Header.tsx
 * 
 * Top bar with brand header, 1-click persona benchmark presets, and view navigation.
 */

import React from 'react';
import { FlowState } from '../state/flowReducer.ts';
import { Scale, RotateCcw, FileText, LayoutDashboard, SlidersHorizontal, Sparkles } from 'lucide-react';

interface HeaderProps {
  state: FlowState;
  onLoadPersona: (id: 'priya' | 'ravi' | 'anita') => void;
  onSelectStage: (stage: FlowState['currentStage']) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onLoadPersona,
  onSelectStage,
  onReset,
}) => {
  return (
    <header className="border-b border-lokta-rule bg-lokta-bg/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Eyebrow */}
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => onSelectStage('wizard')}
            >
              <div className="w-8 h-8 rounded-lg bg-lokta-accent flex items-center justify-center text-white shadow-sm">
                <Scale className="w-4 h-4 text-lokta-accent-ink" />
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-lokta-muted block leading-none">
                  Lokta · Build Challenge
                </span>
                <span className="font-display text-xl font-medium text-lokta-ink tracking-tight">
                  Borrower <em className="not-italic text-lokta-accent font-semibold">Copilot</em>
                </span>
              </div>
            </div>

            {/* Mobile Reset */}
            <button
              onClick={onReset}
              className="md:hidden p-2 text-lokta-muted hover:text-lokta-ink rounded-md transition-colors"
              title="Reset questionnaire"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Persona 1-Click Loaders (Rubric Requirement) */}
          <div className="flex items-center flex-wrap gap-1.5 p-1 bg-lokta-bg2 rounded-lg border border-lokta-rule text-xs">
            <span className="px-2 text-lokta-muted font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-lokta-accent" /> Presets:
            </span>
            <button
              onClick={() => onLoadPersona('priya')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                state.activePersonaId === 'priya'
                  ? 'bg-lokta-accent text-white shadow-xs'
                  : 'hover:bg-lokta-bg text-lokta-ink'
              }`}
            >
              Priya <span className="text-[10px] opacity-75">(Salaried)</span>
            </button>
            <button
              onClick={() => onLoadPersona('ravi')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                state.activePersonaId === 'ravi'
                  ? 'bg-lokta-accent text-white shadow-xs'
                  : 'hover:bg-lokta-bg text-lokta-ink'
              }`}
            >
              Ravi <span className="text-[10px] opacity-75">(Kirana/LAP)</span>
            </button>
            <button
              onClick={() => onLoadPersona('anita')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                state.activePersonaId === 'anita'
                  ? 'bg-lokta-accent text-white shadow-xs'
                  : 'hover:bg-lokta-bg text-lokta-ink'
              }`}
            >
              Anita <span className="text-[10px] opacity-75">(Informal/App)</span>
            </button>
          </div>

          {/* View Nav Tabs */}
          <div className="flex items-center gap-1.5 self-end md:self-auto">
            <button
              onClick={() => onSelectStage('wizard')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                state.currentStage === 'wizard'
                  ? 'bg-lokta-ink text-lokta-bg'
                  : 'text-lokta-muted hover:text-lokta-ink hover:bg-lokta-bg2'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Questions
            </button>

            <button
              onClick={() => onSelectStage('outputs')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                state.currentStage === 'outputs'
                  ? 'bg-lokta-ink text-lokta-bg'
                  : 'text-lokta-muted hover:text-lokta-ink hover:bg-lokta-bg2'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Evaluation (O1–O4)
            </button>

            <button
              onClick={() => onSelectStage('negotiation_card')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                state.currentStage === 'negotiation_card'
                  ? 'bg-lokta-accent text-white border-lokta-accent shadow-xs'
                  : 'border-lokta-accent/40 text-lokta-accent hover:bg-lokta-accent-soft'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Negotiation Card
            </button>

            <button
              onClick={onReset}
              className="hidden md:inline-flex p-1.5 text-lokta-muted hover:text-lokta-ink hover:bg-lokta-bg2 rounded-md transition-colors ml-1"
              title="Reset questionnaire"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
