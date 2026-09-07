/**
 * apr.ts
 * 
 * Computes exact all-in APR using annualized cash-flow Internal Rate of Return (IRR),
 * in strict compliance with RBI's Key Facts Statement (KFS) guidelines (Oct 2024 / mid-2026).
 * Zero UI/React imports.
 */

import { RULES_CONFIG } from './rulesConfig.ts';

/**
 * Calculates monthly EMI given principal, annual interest rate (%), and tenure in months.
 */
export function calculateEmi(principal: number, annualRatePct: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePct <= 0) return Math.round(principal / tenureMonths);

  const monthlyRate = annualRatePct / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Calculates maximum loan principal that can be supported by a given monthly EMI ceiling.
 * Inverts the standard EMI formula: P = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
 */
export function calculatePrincipalFromEmi(maxEmi: number, annualRatePct: number, tenureMonths: number): number {
  if (maxEmi <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePct <= 0) return Math.round(maxEmi * tenureMonths);

  const monthlyRate = annualRatePct / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const principal = (maxEmi * (factor - 1)) / (monthlyRate * factor);
  return Math.round(principal);
}

/**
 * Computes all-in APR via true cash flow IRR.
 * 
 * At t=0: borrower receives (Principal - Upfront fees)
 * At t=1..N: borrower pays regular monthly EMI
 * 
 * Solves for monthly rate `r` where:
 * Net_Disbursed - EMI * [1 - (1+r)^(-n)] / r = 0
 * Annualizes via compounding: APR = ( (1 + r)^12 - 1 ) * 100
 */
export function calculateAllInApr(
  principal: number,
  annualNominalRatePct: number,
  tenureMonths: number,
  upfrontFeeRate: number = RULES_CONFIG.CHARGES.TOTAL_UPFRONT_FEE_RATE
): {
  apr: number;
  nominalRate: number;
  upfrontCharges: number;
  netDisbursal: number;
  monthlyEmi: number;
} {
  if (principal <= 0 || tenureMonths <= 0) {
    return {
      apr: 0,
      nominalRate: 0,
      upfrontCharges: 0,
      netDisbursal: 0,
      monthlyEmi: 0,
    };
  }

  const upfrontCharges = Math.round(principal * upfrontFeeRate);
  const netDisbursal = principal - upfrontCharges;
  const emi = calculateEmi(principal, annualNominalRatePct, tenureMonths);

  if (netDisbursal <= 0 || emi <= 0) {
    return {
      apr: annualNominalRatePct,
      nominalRate: annualNominalRatePct,
      upfrontCharges,
      netDisbursal,
      monthlyEmi: emi,
    };
  }

  // Numerical solver for monthly IRR rate 'r'
  const target = netDisbursal;
  let r = annualNominalRatePct / (12 * 100); // Initial guess based on nominal monthly rate
  if (r <= 0.0001) r = 0.01;

  // Newton-Raphson iteration with bounded fallback
  let converged = false;
  const maxIterations = 60;
  const tolerance = 1e-7;

  for (let i = 0; i < maxIterations; i++) {
    const powNeg = Math.pow(1 + r, -tenureMonths);
    // f(r) = target - emi * (1 - (1+r)^-n) / r
    const annuityFactor = (1 - powNeg) / r;
    const fVal = target - emi * annuityFactor;

    if (Math.abs(fVal) < tolerance) {
      converged = true;
      break;
    }

    // Derivative f'(r) = -emi * [ r * n*(1+r)^(-n-1) - (1 - (1+r)^-n) ] / r^2
    const dAnnuity_dr = (r * tenureMonths * Math.pow(1 + r, -tenureMonths - 1) - (1 - powNeg)) / (r * r);
    const fPrime = -emi * dAnnuity_dr;

    if (Math.abs(fPrime) < 1e-12) break;

    const nextR = r - fVal / fPrime;
    if (nextR <= 0.00001 || nextR > 0.35 || Number.isNaN(nextR)) {
      // Newton step jumped out of reasonable range, switch to bisection
      break;
    }
    r = nextR;
  }

  // Bisection fallback if Newton didn't converge within bounds
  if (!converged) {
    let low = 0.0001;
    let high = 0.35;
    for (let j = 0; j < 50; j++) {
      const mid = (low + high) / 2;
      const powNeg = Math.pow(1 + mid, -tenureMonths);
      const val = target - emi * ((1 - powNeg) / mid);
      if (Math.abs(val) < tolerance) {
        r = mid;
        converged = true;
        break;
      }
      if (val > 0) {
        // PV is too low, so interest rate 'mid' is too high
        high = mid;
      } else {
        low = mid;
      }
      r = mid;
    }
  }

  // Annualize: (1 + r)^12 - 1
  const effectiveApr = (Math.pow(1 + r, 12) - 1) * 100;
  const roundedApr = Math.round(effectiveApr * 100) / 100;

  return {
    apr: roundedApr,
    nominalRate: annualNominalRatePct,
    upfrontCharges,
    netDisbursal,
    monthlyEmi: emi,
  };
}
