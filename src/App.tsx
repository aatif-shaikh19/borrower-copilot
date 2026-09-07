/**
 * App.tsx
 * 
 * Root container for Borrower Copilot.
 * Integrates flow state machine, header, wizard, evaluation dashboard, and negotiation card.
 */

import React, { useReducer } from 'react';
import { 
  flowReducer, 
  INITIAL_ANSWERS, 
  FlowState 
} from './state/flowReducer.ts';
import { evaluate } from './rules/index.ts';
import { Header } from './components/Header.tsx';
import { QuestionScreen } from './components/QuestionScreen.tsx';
import { OutputsScreen } from './components/OutputsScreen.tsx';
import { NegotiationCard } from './components/NegotiationCard.tsx';
import { BorrowerAnswers } from './types/borrower.ts';

const initialOutputs = evaluate(INITIAL_ANSWERS);

const initialState: FlowState = {
  currentStage: 'wizard',
  currentStepIndex: 0,
  answers: INITIAL_ANSWERS,
  outputs: initialOutputs,
  activePersonaId: null,
};

export const App: React.FC = () => {
  const [state, dispatch] = useReducer(flowReducer, initialState);

  const handleAnswerChange = (field: keyof BorrowerAnswers, value: unknown) => {
    dispatch({ type: 'SET_ANSWER', field, value });
  };

  const handleNext = () => dispatch({ type: 'NEXT_STEP' });
  const handlePrev = () => dispatch({ type: 'PREV_STEP' });
  const handleSkip = () => dispatch({ type: 'SKIP_STEP' });
  const handleViewOutputs = () => dispatch({ type: 'GO_TO_STAGE', stage: 'outputs' });
  const handleOpenNegotiationCard = () => dispatch({ type: 'GO_TO_STAGE', stage: 'negotiation_card' });
  const handleLoadPersona = (personaId: 'priya' | 'ravi' | 'anita') => dispatch({ type: 'LOAD_PERSONA', personaId });
  const handleReset = () => dispatch({ type: 'RESET' });
  const handleSelectStage = (stage: FlowState['currentStage']) => dispatch({ type: 'GO_TO_STAGE', stage });

  return (
    <div className="min-h-screen bg-lokta-bg text-lokta-ink flex flex-col font-body selection:bg-lokta-accent selection:text-white">
      {/* Brand Header & Persona Switcher */}
      <Header
        state={state}
        onLoadPersona={handleLoadPersona}
        onSelectStage={handleSelectStage}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {state.currentStage === 'wizard' && (
          <QuestionScreen
            answers={state.answers}
            outputs={state.outputs}
            stepIndex={state.currentStepIndex}
            onAnswerChange={handleAnswerChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
            onViewOutputs={handleViewOutputs}
          />
        )}

        {state.currentStage === 'outputs' && state.outputs && (
          <OutputsScreen
            answers={state.answers}
            outputs={state.outputs}
            onOpenNegotiationCard={handleOpenNegotiationCard}
            onEditQuestions={() => dispatch({ type: 'GO_TO_STAGE', stage: 'wizard' })}
          />
        )}

        {state.currentStage === 'negotiation_card' && state.outputs && (
          <NegotiationCard
            answers={state.answers}
            outputs={state.outputs}
            onBack={handleViewOutputs}
          />
        )}
      </main>

      {/* Brand Footer */}
      <footer className="no-print border-t border-lokta-rule py-6 bg-lokta-bg2/40 text-center text-xs text-lokta-muted">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-display text-sm italic text-lokta-ink">
            "What we are really testing: can you turn lending judgement into rules a borrower can see and a machine can run?"
          </p>
          <p className="text-[11px]">
            Lokta Borrower Copilot · 100% Client-side in-memory computation · Zero backend / No bureau footprint
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
