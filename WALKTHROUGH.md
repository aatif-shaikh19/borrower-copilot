# WALKTHROUGH.md — 5-Minute Technical & Product Walkthrough

> **Submission Deliverable 4**: A comprehensive written walkthrough explaining the product design, domain architecture, how the three personas test the engine, what we would build next, and what we would cut.

---

## 1. The Core Thesis

A borrower walks into an Indian bank or NBFC branch with zero leverage. The branch manager has a credit scorecard, an aggressive month-end disbursement target, and a system calibrated to stretch the borrower to a 50–65% Fixed Obligation to Income Ratio (FOIR). The borrower leaves paying 4 percentage points above fair market rate with an EMI that leaves zero margin for an emergency.

**Borrower Copilot is the borrower's independent model.** It operates under four non-negotiable rules:
1. **Self-Assessment, Not Credit Scoring**: Operates purely from what the borrower shares. Zero bureau inquiries, zero backend storage, 100% in-browser privacy.
2. **Lender Sanction $\ne$ Safe Carry**: We compute what a bank will offer and what the borrower should actually take. That gap is the entire product thesis.
3. **Every Number Has a Why**: Every output is backed by a one-sentence plain English traceability statement referencing specific answers given.
4. **Branch-Ready Counter-Offers**: Generates a one-page **Negotiation Card** with exact scripts countering predatory branch pricing.

---

## 2. Walkthrough of the Three Personas

### Persona 1: Priya — The Salaried MNC Baseline
- **The Case**: Net ₹1,10,000/mo, car loan EMI ₹14,000, rent ₹28,000, 780 CIBIL score. Asking for ₹8,00,000 personal loan for a wedding.
- **The Output**:
  - **O1 (Verdict)**: **Borrow**. Her proposed ₹20,689 EMI leaves ₹22,311 monthly cushion.
  - **O2 (Amounts)**: A lender model stretching to 50% FOIR will happily sanction **₹15.2 Lakhs**. Her borrower safe carry limit is **₹8.9 Lakhs**. The app explicitly directs her to reject the bank's up-sell.
  - **O3 (Pricing)**: Standard prime personal loan at **10.0% – 12.0%**. True all-in APR is **11.9%** (accounting for 1.77% upfront processing fees + GST via numerical IRR).
  - **O4 (Stress Case)**: A +2.0% floating rate hike raises her EMI by only ₹870/month; her surplus remains safe at >₹21,000.

### Persona 2: Ravi — The Collateral Arbitrage
- **The Case**: Kirana store for 14 years in Mysuru. Cash profit ₹60,000/mo, wife earns ₹18,000 teaching. No credit bureau score. Owns shop premises worth ~₹45,00,000 unencumbered. Asking for ₹15,00,000 for inventory and a delivery vehicle.
- **The Critical Engine Routing**:
  - Unsecured business loan underwriting would either reject Ravi for lack of bureau footprint or quote predatory NBFC rates (18.0%–24.0%).
  - The copilot detects that his unencumbered shop premises (₹45L) is $\ge 2\times$ his loan ask (₹15L).
  - **The app routes him to Loan Against Property (LAP)** at **9.5% – 13.5%**, saving him over ₹7,00,000 in interest over a 7-year tenure.
  - His Negotiation Card equips him to counter: *"I have unencumbered commercial premises worth ₹45L. Route this as a secured LAP at 10.5% instead of unsecured credit."*

### Persona 3: Anita — The Hard Rejection ("Don't Borrow")
- **The Case**: Gig delivery rider + home tailoring in Hubballi, earning ₹28,000/mo (>60% irregular). Husband unemployed for 8 months. Holds 3 instant digital app loans totaling ₹35,000 at 32% interest. **One EMI bounced last month.** Asking for ₹1,50,000 for an EV scooter.
- **The Critical Verdict Hierarchy**:
  - Anita's ask is productive (EV scooter could expand runs), but she is already trapped in high-cost debt with an active default signal.
  - The engine's prioritized risk check fires **"Don't Borrow"** immediately.
  - Safe loan capacity is clamped to **₹0**.
  - **Stress Case**: A 20% gig downturn drops her income to ₹22,400, producing a -₹2,100 monthly deficit. An extra ₹5,300 EMI would trigger total household insolvency.
  - Negotiation card instructs her: *"Decline fresh borrowing. Prioritize settling the ₹35,000 app debt and establish 6 months of clean payments first."*

---

## 3. What We Would Build Next (Product Roadmap)

If given another 2–3 weeks of engineering time, here is what we would prioritize:

1. **Client-Side Account Aggregator (AA) / PDF Statement Parsing**:
   - Rather than asking borrowers to estimate their "variable income share" or "average living expenses," let them drag-and-drop a password-protected bank PDF or connect via Sahamati AA.
   - Run purely client-side WASM parsing (e.g. via PDF.js / regex) to compute exact FOIR, recurring debit bounces, and living expense medians in-memory.
2. **KFS (Key Facts Statement) Document Scanner**:
   - Allow the borrower to upload a photo of a lender's sanction letter or Key Facts Statement.
   - Use client-side OCR to extract the quoted rate, processing fees, documentation charges, and loan shield insurance premiums, instantly displaying whether the lender's quote matches the copilot's fair band.
3. **Multi-Lingual Voice First Interface**:
   - Indian borrowers like Ravi or Anita often prefer vernacular spoken languages (Kannada, Hindi, Marathi) rather than English text.
   - Integrate client-side speech recognition and localized vernacular cards.

---

## 4. What We Would Cut (If Time Was Constrained)

If our build timebox had been compressed from 16 hours to 6 hours, we would have cut in this strict order:
1. **Visual polish and desktop layout extras** — keeping only basic mobile-first layouts (Product craft is 15 pts; domain reasoning is 30 pts).
2. **Interactive tenure trade-off table** — showing just one recommended tenure row instead of 4 comparison rows.
3. **Secondary branch questions** — retaining only the top 2 questions that move the numbers (bounces and collateral) and cutting the rest.

**What we would NEVER cut**:
- The pure TypeScript rules engine separation (`src/rules/` with zero React imports).
- The lender sanction vs borrower safe carry number separation.
- Ravi's secured LAP routing.
- Anita's non-"Borrow" hard rejection.
- The 100% synchronization between `RULES.md` and `rulesConfig.ts`.

---

## 5. Honesty About Limits (Scoring Rubric: 5 pts)

A financial model that claims complete certainty is either naive or deceptive. Here is where Borrower Copilot makes assumptions that have real-world limitations:

1. **Stated Collateral Valuation Assumption (60% LAP Haircut)**:
   - In `src/rules/foir.ts`, we assume an unverified property is worth 60% of what the borrower states. In reality, Indian property valuation depends heavily on circle rates vs market rates, municipal approvals (e.g. Khata A vs Khata B in Karnataka), and clear title history. If Ravi's shop had legal title defects, LAP could take 6 weeks or be rejected.
2. **Informal Cash Income Verification**:
   - Banks haircut unrecorded cash income by 30–50% unless supported by GST returns or bank turnover. Our model uses a proxy vintage credit for Ravi (14 years in business), but in practice, PSU banks may insist on 3 years of ITRs matching the loan ask.
3. **Linear Confidence Widening vs Probability Distribution**:
   - We widen rate bands by a simple linear factor ($\pm 30\%$ for low, $\pm 20\%$ for medium, $\pm 10\%$ for high) based on questions answered. A true Bayesian model would model conditional variance, but our linear model was chosen deliberately for transparent explainability.
