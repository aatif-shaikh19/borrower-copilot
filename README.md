# Borrower Copilot — Lokta Build Challenge v1.0

> **A self-assessment personal assistant that arms an Indian borrower before walking into a lender.**
> Answers four questions: **Should I borrow? How much is safe? What is a fair rate? What EMI should I agree to?** and hands them a branch-ready **Negotiation Card**.

---

## Quickstart (< 3 minutes from clone)

### Prerequisites
- Node.js 18+ or 20+
- npm 9+ or pnpm / yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Persona Benchmark Tests
Runs Vitest against Priya, Ravi, and Anita through the pure TypeScript rules engine:
```bash
npm test
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deliverables Checklist (Root Deliverables)

All four required deliverables from the challenge brief reside at the repository root:

1. **The Working App**: Client-side React 18 + TypeScript + Tailwind CSS application.
2. **[RULES.md](./RULES.md)**: Every rule, threshold, band, and assumption in a table with *what · value · why · source or "my judgement"*.
3. **[PERSONAS.md](./PERSONAS.md)**: Three complete persona run-throughs (Priya, Ravi, Anita) with question transcripts, four outputs (O1–O4), and Negotiation Cards.
4. **[WALKTHROUGH.md](./WALKTHROUGH.md)**: Five-minute written walkthrough covering domain decisions, what to build next, and what to cut.
5. **[DECISIONS.md](./DECISIONS.md)**: Engineering judgement log defending all trade-offs made during the build.

---

## Core Architecture & Rubric Alignment

```
src/
├── types/
│   └── borrower.ts        # Pure data contracts (BorrowerAnswers, FourOutputs)
├── rules/                 # ZERO React imports — Pure TypeScript Engine
│   ├── rulesConfig.ts     # Syncs 1-to-1 with RULES.md
│   ├── foir.ts            # Lender vs Safe max amount calculations
│   ├── apr.ts             # Numerical Newton-Raphson cash-flow IRR solver
│   ├── routing.ts         # Secured (LAP/Gold) vs Unsecured routing
│   ├── verdict.ts         # Borrow / Don't borrow / Borrow less hierarchy
│   ├── confidence.ts      # Silence penalty & band widening
│   ├── index.ts           # Master evaluate(answers) entrypoint
│   └── __tests__/
│       └── personas.test.ts # Vitest suite asserting Priya, Ravi, Anita
├── questions/
│   ├── mustQuestions.ts       # 8 core questions required for evaluation
│   ├── additionalQuestions.ts # Adaptive branch questions (every question moves a number)
│   └── branching.ts           # Maps employment type to questions
├── state/
│   └── flowReducer.ts     # In-memory reducer for wizard & live evaluation
└── components/
    ├── Header.tsx         # Brand header & 1-click persona benchmark switcher
    ├── QuestionScreen.tsx # Adaptive wizard with currency masks & live preview
    ├── OutputsScreen.tsx  # O1 to O4 comprehensive dashboard with traceability
    ├── NegotiationCard.tsx# Printable 1-page branch counter-offer card
    └── ConfidenceBadge.tsx# Visual indicator of calculation certainty
```

---

## Three Benchmark Personas (1-Click in UI Header)

| Persona | Key Profile Characteristics | Critical Test Condition | Expected Result |
|---|---|---|---|
| **Priya, 29** | Bengaluru, Salaried MNC 5 yrs, Net ₹1.1L/mo, Car EMI ₹14k, Rent ₹28k, CIBIL 780, Wedding ₹8L ask | Tests core FOIR/APR separation for easy salaried case | **Borrow** verdict; Lender Max (₹15.2L) $\ne$ Safe Carry (₹8.9L); Prime personal loan (10–12%) |
| **Ravi, 42** | Mysuru, Kirana owner 14 yrs, Cash ₹60k/mo, Wife ₹18k, Unencumbered shop premises ₹45L, No credit score, ₹15L ask | Tests collateral-first product routing for thin-file borrowers | **Routed to Secured LAP** (9.5–13.5%), saving 8–10% interest over unsecured credit |
| **Anita, 35** | Hubballi, Gig rider + tailoring, Net ₹28k/mo, 3 app loans ₹35k at 32%, 1 bounce last month, EV scooter ₹1.5L ask | Tests hard refusal on delinquency & high-cost debt | **DON'T BORROW** verdict; Safe carry ₹0; Urgent advice to settle app loans first |

---

## Complete Financial Privacy Guarantee
- **No Backend**: Runs 100% in-memory in the borrower's web browser.
- **No Database / No LocalStorage**: No financial credentials, income slips, or answers are persisted. Refreshing the browser resets all state.
- **No Bureau Pull**: Zero credit bureau footprint (no hard inquiries).
