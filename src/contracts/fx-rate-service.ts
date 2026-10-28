/**
 * FX rate service contract.
 *
 * Provides currency conversion for reporting purposes.
 */

// ── Result ──────────────────────────────────────────────────────────────────

export interface FxConversionResult {
  readonly fromCurrency: string;
  readonly toCurrency: string;
  readonly originalAmount: number;
  readonly convertedAmount: number;
  readonly exchangeRate: number;
  readonly rateSource: string;
  readonly rateTimestamp: string;
}

// ── Service interface ───────────────────────────────────────────────────────

export interface IFxRateService {
  convertForReporting(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date?: string,
  ): Promise<FxConversionResult>;
}
