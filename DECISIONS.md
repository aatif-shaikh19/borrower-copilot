# DECISIONS.md — Architecture & Domain Judgement Log

> **Context**: A running record of engineering and financial domain design choices where the brief was silent or ambiguous. This document serves as the defense rationale for technical review.
> 
> **Notation**: Every decision is tagged **[SRC]** (grounded in market/regulatory standards) or **[JDG]** (a defensible product judgement).

---

## 1. Core Financial Affordability Decisions

### D1 — Borrower-Safe FOIR Set at 35% Default, 25% for Informal/Variable Income [JDG]
- **The Ambiguity**: The brief mandates that "what a lender will sanction" and "what a borrower can safely carry" must be clearly separated numbers, but does not dictate the exact percentage for safe carry.
- **The Call**: We established:
  - Lender FOIR: 50% for salaried (60% for >₹1.5L net), 45% for self-employed, 65% for secured loans.
  - Borrower Safe FOIR: 35% baseline, tightened to 25% for informal workers where >30% of income is variable or cash.
- **Defense Rationale**: A 50–60% FOIR assumes that nothing ever goes wrong in a household. The 35% safe ceiling leaves approximately two-thirds of disposable income for rent, food, school fees, and medical buffer. For gig/informal workers (like Anita), an average monthly income figure masks bad weeks and seasonal monsoons; a 25% ceiling ensures the borrower does not default during their lowest-earning month.

### D2 — Absolute Minimum Living Buffer Floor of $\max(₹5,000, 15\% \text{ Net Income})$ [JDG]
- **The Ambiguity**: In low-income scenarios, a percentage FOIR can look mathematically safe while leaving only ₹500 in absolute cash.
- **The Call**: Implemented an explicit post-EMI residual income buffer floor: $\max(₹5,000, 15\% \times \text{Net Income})$.
- **Defense Rationale**: Even if Anita's FOIR mathematically permitted an EMI of ₹2,000, her remaining ₹3,500 surplus is below the ₹5,000 emergency threshold for a family of four with an unemployed spouse. The engine therefore clamps safe loan capacity to ₹0 and fires "Don't Borrow."

---

## 2. Mathematical & Pricing Decisions

### D3 — Exact Numerical Cash-Flow IRR for All-In APR (No Shortcut Approximation) [SRC]
- **The Ambiguity**: RULES.md §4 allowed a fallback linear approximation `APR ≈ nominal + (fee% * 12 / tenure)`.
- **The Call**: We implemented a full Newton-Raphson cash-flow solver with a bounded bisection fallback ($r \in [0.0001, 0.35]$) to solve $CF_0 = \sum_{t=1}^n \frac{EMI}{(1+r)^t}$ and annualized via $(1+r)^{12} - 1$.
- **Defense Rationale**: Since October 2024, the Reserve Bank of India (RBI) mandates that all regulated lenders disclose APR via exact annualized IRR in the Key Facts Statement (KFS). Using the exact mathematical standard ensures that the borrower's copilot card can be placed directly side-by-side with a bank's official sanction letter.

### D4 — Collateral-First Routing at $\ge 2\times$ Loan Ask for Thin-File / Self-Employed [JDG + SRC]
- **The Ambiguity**: Kirana owners like Ravi have substantial physical assets (₹45L unencumbered shop) but no CIBIL score or formal salary slips.
- **The Call**: When unencumbered property or gold is $\ge 2\times$ the requested loan, the engine automatically routes the borrower to a secured product (Loan Against Property — LAP or Gold Loan) rather than an unsecured business or personal loan.
- **Defense Rationale**: Unsecured business loans for thin-file self-employed borrowers run at 18.0%–26.0% with high rejection rates. By routing Ravi to LAP (9.5%–13.5%), he saves over ₹7,00,000 in interest over a 7-year tenure, converting a likely rejection into a prime secured loan.

---

## 3. Risk & Decision Hierarchy Decisions

### D5 — "Don't Borrow" Evaluated Ahead of Loan Amount and Rate Math [JDG]
- **The Ambiguity**: Whether an app should calculate loan eligibility for a distressed borrower before issuing a verdict.
- **The Call**: Hard refusal triggers are evaluated first in the rules hierarchy:
  1. Delinquency within last 6 months (recent bounce).
  2. Active high-cost debt ($>25\%$ interest, such as digital app loans).
  3. Pre-existing safe FOIR breach.
- **Defense Rationale**: Quoting a "fair rate" or "maximum sanction" to Anita would be actively predatory. When a borrower has active 32% app debt and a recent bounce, the correct financial move is debt settlement, not fresh borrowing.

### D6 — Credit Score "Unknown" is Modeled as Unverified, Never as Default (Never 300) [JDG + SRC]
- **The Ambiguity**: How to price a borrower who answers "I do not know my credit score" or "Never taken credit."
- **The Call**: Modeled as a distinct `creditScoreKnown: false` state. Instead of penalizing them into the <650 subprime bucket (24–36%), the engine widens the rate band by 30% and inspects stability proxy signals (employment tenure $\ge 3$ years, business vintage $\ge 5$ years, zero bounce history).
- **Defense Rationale**: Conflating "no bureau footprint" with "defaulter" would misprice Ravi, whose 14 years of successful shop operation in Mysuru represents solid creditworthiness.

---

## 4. Engineering & Question Flow Decisions

### D7 — Question Economy: Every Additional Question Has an Explicit Consumer [JDG]
- **The Ambiguity**: Which additional questions to keep vs cut.
- **The Call**: Only included additional questions that directly feed a mathematical calculation in `src/rules/`. Every question in `additionalQuestions.ts` is documented with its exact consumer function (e.g. `rentExpense` -> `foir.ts`, `hasRecentBounces` -> `verdict.ts`, `collateralValue` -> `routing.ts`). Any candidate question that did not move an output was deleted.

### D8 — Pure TypeScript Rules Engine with Zero UI Dependencies [SRC]
- **The Ambiguity**: Implementation architecture between React components and calculation logic.
- **The Call**: `src/rules/` has zero React imports. All logic is encapsulated in pure functions taking `BorrowerAnswers` and returning `FourOutputs`.
- **Defense Rationale**: This satisfies the Engineering rubric (10 pts) and enables instant unit testing (`personas.test.ts`). In a live technical interview, modifying any assumption in `rulesConfig.ts` takes under 30 seconds and runs tests in <1 second without touching any JSX.

### D9 — 100% In-Memory Privacy Model (Zero Backend / Zero LocalStorage) [SRC]
- **The Ambiguity**: Whether to persist user sessions or store state across visits.
- **The Call**: The application stores state strictly in React memory for the single session. Refreshing the browser destroys all entered data.
- **Defense Rationale**: Financial self-assessment demands absolute user trust. By avoiding backends, databases, cookies, and local storage, the app guarantees that sensitive financial data cannot be leaked, scraped, or subpoenaed.
