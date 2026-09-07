# RULES.md — Complete Lending Rules, Bands & Assumptions

> **Sync Notice**: This file is the definitive domain specification for Borrower Copilot. Every constant here lives in typed code at `src/rules/rulesConfig.ts` with 100% agreement.
> 
> **Legend**:
> - **[SRC]**: Grounded in published Indian regulatory (RBI) or credit bureau / banking market data.
> - **[JDG]**: A product design judgement made by us to safeguard borrowers, defended in `DECISIONS.md`.

---

## 1. Income & Affordability (FOIR — Fixed Obligation to Income Ratio)

| Rule / Metric | Value | Rationale & Domain Why | Source |
|---|---|---|---|
| **FOIR Definition** | `(All existing EMIs + proposed EMI) ÷ Net Monthly Income` | Standard Indian banking standard for debt-servicing capacity | **[SRC]** RBI Master Directions |
| **Lender Ceiling — Salaried Unsecured** | **50%** | Standard bank/NBFC ceiling for salaried unsecured credit at prime to average credit | **[SRC]** Bank Underwriting Norms |
| **Lender Ceiling — Salaried High Income** | **60%** | Banks relax FOIR for high net income (> ₹1,50,000/mo) due to high absolute residual income | **[SRC + JDG on ₹1.5L threshold]** |
| **Lender Ceiling — Self-Employed Unsecured** | **45%** | Lenders discount undocumented/irregular income; self-employed unsecured runs tighter | **[SRC]** NBFC Lending Policy |
| **Lender Ceiling — Secured Loans (LAP / Gold)** | **65%** | High-quality collateral backing allows lenders to tolerate higher debt-servicing ratios | **[SRC]** Bank Secured Credit Guidelines |
| **Borrower-Safe Ceiling — Default** | **35%** | Preserves ~65% of net income for living expenses, healthcare, and savings. Deliberately lower than lender ceiling | **[JDG]** Core product thesis |
| **Borrower-Safe Ceiling — Informal / Irregular** | **25%** | For workers with >30% variable/cash earnings. Averages hide bad months; protects against cash flow shocks | **[JDG]** Cash Flow Stress Defense |
| **Productive Loan FOIR Boost** | **+5 percentage points** | If loan purchase directly generates verified incremental business revenue (e.g. delivery EV, shop inventory) | **[JDG]** Productive Capex Principle |
| **Minimum Residual Buffer (Floor)** | **$\max(₹5,000, 15\% \times \text{Net Income})$** | Absolute cash surplus floor after all living expenses and EMIs. If breached, "Don't Borrow" or "Borrow Less" triggers | **[JDG]** Basic living dignity buffer |

---

## 2. Market Interest Rate Bands (India, Mid-2026 Benchmark)

| Product | Security | Typical Fair Band (% p.a.) | Midpoint | Market Context & Credit Tiering | Source |
|---|---|---|---|---|---|
| **Personal Loan** (CIBIL 750+) | Unsecured | **10.0% – 12.0%** | 11.0% | Tier-1 prime salaried pricing (HDFC, ICICI, SBI) | **[SRC]** Published Card Rates |
| **Personal Loan** (CIBIL 700–749) | Unsecured | **12.0% – 16.0%** | 14.0% | Standard private bank / prime NBFC | **[SRC]** Market Aggregator Data |
| **Personal Loan** (CIBIL 650–699) | Unsecured | **16.0% – 24.0%** | 20.0% | Mid-tier NBFCs (Bajaj, Tata Capital, Poonawalla) | **[SRC]** NBFC Pricing Schedules |
| **Personal Loan** (<650 or Unknown) | Unsecured | **24.0% – 36.0%** | 30.0% | Subprime / digital fintech / thin file pricing | **[SRC]** Fintech Lending Disclosure |
| **Loan Against Property (LAP)** — Salaried | Secured | **8.5% – 12.5%** | 10.5% | Pledged residential/commercial property | **[SRC]** Housing Finance Company Rates |
| **Loan Against Property (LAP)** — Self-Employed | Secured | **9.5% – 14.0%** | 11.75% | Pledged commercial premises (e.g. Ravi's shop) | **[SRC]** MSME LAP Benchmark |
| **Gold Loan** (Bank Tier-1) | Secured | **8.5% – 14.0%** | 11.25% | Low processing friction, high liquidity | **[SRC]** PSU & Private Bank Rates |
| **Gold Loan** (NBFC Specialist) | Secured | **12.0% – 24.0%** | 18.0% | Muthoot, Manappuram doorstep models | **[SRC]** NBFC Gold Loan Filings |
| **Two-Wheeler / EV Hypothecation** (Prime) | Secured | **8.5% – 16.0%** | 12.25% | Manufacturer captive finance / Bank prime | **[SRC]** Auto Loan Rate Sheets |
| **Two-Wheeler / EV** (Informal / NBFC) | Secured | **18.0% – 26.0%** | 22.0% | Gig worker underwriting (WheelsEMI, Hero FinCorp) | **[SRC]** Two-Wheeler NBFCs |
| **MSME Business Loan** (Secured) | Secured | **7.5% – 13.0%** | 10.25% | Priority sector lending with asset pledge | **[SRC]** CGTMSE / Bank MSME Norms |
| **MSME Business Loan** (Unsecured) | Unsecured | **14.0% – 24.0%** | 19.0% | Cash-flow based, 3–7pp premium over secured | **[SRC]** Fintech SME Lenders |
| **High-Cost Digital App Loans** | Unsecured | **30%+ effective (up to 120%)** | >35% | Predatory short-term app debt. Flagged as hard risk | **[SRC]** RBI Digital Lending WG |

---

## 3. Secured Loan LTV (Loan-To-Value) Caps

| Product | Max LTV Cap | Rationale & Regulatory Origin | Source |
|---|---|---|---|
| **Gold Loan (< ₹2,50,000)** | **Up to 85%** | RBI tiered LTV guidelines effective April 2026 | **[SRC]** RBI Notification |
| **Gold Loan (₹2.5L – ₹5.0L)** | **Up to 80%** | Tier-2 gold LTV bracket | **[SRC]** RBI Notification |
| **Gold Loan (> ₹5,00,000)** | **Up to 75%** | Tier-3 large gold loan bracket | **[SRC]** RBI Notification |
| **Loan Against Property (LAP)** | **60%** (Assumed) | Conservative unverified stated valuation default | **[JDG]** Prudent appraisal haircut |
| **Vehicle Hypothecation** | **85%** | Standard on-road invoice hypothecation limit | **[SRC]** Auto Lending Standards |

---

## 4. All-in APR & Upfront Fees Methodology (O3)

- **Regulatory Compliance**: Computed strictly via annualized Internal Rate of Return (IRR) of actual net cash flows, in conformance with **RBI Key Facts Statement (KFS)** mandates.
- **Cash Flow at Disbursal ($t_0$)**: $\text{Net Disbursed} = \text{Principal} - \text{Processing Fee} - \text{18\% GST on Fee}$.
  - Baseline processing fee: `1.50%` of principal **[SRC]**.
  - 18% GST on processing fee: `0.27%` of principal **[SRC]**.
  - Total upfront deduction: `1.77%` of principal **[SRC]**.
- **Cash Flows During Repayment ($t_1 \dots t_n$)**: Regular monthly EMI payments.
- **Solving Engine**: High-precision numerical Newton-Raphson solver iterating on:
  $$\text{Net Disbursed} - \text{EMI} \times \left[ \frac{1 - (1 + r)^{-n}}{r} \right] = 0$$
  with bounded bisection fallback ($r \in [0.0001, 0.35]$).
- **Annualization**: $\text{APR} = ((1 + r_{\text{monthly}})^{12} - 1) \times 100$.

---

## 5. Credit Score & "Unknown" Handling

| Bureau Score State | Engine Routing & Band Impact | Source |
|---|---|---|
| **750+ (Excellent)** | Best-tier prime bank rate (10.0% – 12.0%) | **[SRC]** Prime Bank Policy |
| **700 – 749 (Good)** | Standard tier pricing (12.0% – 16.0%) | **[SRC]** Market Standard |
| **650 – 699 (Fair)** | NBFC pricing bracket (16.0% – 24.0%) | **[SRC]** Risk-based Pricing |
| **< 650 (Poor)** | High-cost fintech rates (24.0% – 36.0%) | **[SRC]** Subprime Underwriting |
| **Unknown / Thin File** | **Never treated as bad credit (never 300).** Treated as unverified profile. Band widened by one full tier (+30%). Proxy signals used: years of business/job vintage and clean payment records provide stability credit. | **[JDG]** Brief Mandate ("Unknown is never zero") |

---

## 6. Primary Verdict Engine Hierarchy (O1)

Conditions are evaluated strictly in descending rank order:

1. **Hard Rejection ("Don't Borrow")**:
   - **Recent Delinquency**: Any EMI, card, or cheque bounce within the last 6 months **[JDG]**.
   - **Existing High-Cost Debt**: Carrying active debt at $>25\%$ interest (e.g. Anita's 30%+ app loans) **[SRC + JDG]**.
   - **Pre-existing Safe FOIR Breach**: Current obligations alone exceed the borrower safe FOIR ceiling **[JDG]**.
   - **Living Cushion Deficit**: Current living surplus is already below the minimum cash buffer ($\max(₹5,000, 15\%)$) **[JDG]**.
2. **Over-Leveraged Ask ("Borrow Less")**:
   - Requested amount exceeds borrower safe carry capacity, but a smaller loan fits within safe FOIR.
   - Output explicitly quotes the safe amount: `safeCarryAmount`.
3. **Sustainable Request ("Borrow")**:
   - Requested loan fits within borrower safe FOIR and preserves the residual living buffer.

---

## 7. Product Routing & Collateral Arbitrage

- **Collateral-First Arbitrage**: If borrower owns unencumbered collateral (property or gold) worth $\ge 2\times$ loan ask, route to **LAP (Secured)** or **Gold Loan**.
  - Slashes interest rates by 6–10 percentage points compared to unsecured personal or business loans.
  - Shields thin-file borrowers (like Ravi) from bureau rejection.
- **Vehicle Purchase**: Always routed to hypothecated two-wheeler / auto loan rather than personal loan.
- **Productive Loan Boost**: Business capex / productive equipment gains +5pp safe FOIR headroom if expected return is stated.

---

## 8. Confidence Model ("Silence Penalty")

- **Low Confidence (±30% Widening)**: Only must-questions answered. Bands are widened by 30% to account for unknown stability.
- **Medium Confidence (±20% Widening)**: At least 2 additional branch questions answered.
- **High Confidence (±10% Tightening)**: At least 3 additional branch questions answered.

---

## 9. Stress Testing (O4)

- **Informal / Gig Workers**: Stressed against a **20% monthly income drop**. Verifies whether essential expenses can be serviced during slow weeks or seasonal lulls.
- **Salaried / Secured Borrowers**: Stressed against a **+2.0% (+200 bps) floating interest rate hike**. Verifies whether RBI rate tightening cycles breach the household buffer.
