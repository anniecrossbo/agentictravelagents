/**
 * Rate lookup evaluation. Framework-free: PRD 7.17.1 requires a price
 * breakdown, currency, restrictions, cancellation and commission treatment.
 * Copying a quote never holds inventory — approval revalidates with OPERA.
 */

import type { RateCode, RoomType } from './types';
import { nightsBetween } from './booking-view';

export type RateQuote = {
  rateCodeId: string;
  rateCode: string;
  rateName: string;
  roomTypeId: string;
  roomTypeName: string;
  currency: string;
  nights: number;
  pricePerNight: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  isCommissionable: boolean;
  commissionRate?: number;
  commissionAmount?: number;
  restrictions: readonly string[];
  cancellationPolicy: string;
  mealPlan?: string;
};

export type RateQuoteInput = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomTypeId?: string;
};

/** PROTO: a flat 10% tax stands in for the OPERA tax engine. */
const TAX_RATE = 0.1;

/** Extra-adult supplement beyond double occupancy, as a share of nightly rate. */
export const EXTRA_ADULT_RATE = 0.16;

/** PROTO: flat extra-child supplement; real pricing comes from OPERA child-age bands. */
export const EXTRA_CHILD_RATE = 0.09;

/** PROTO: flat group price as a share of the nightly rate; real groups are negotiated per block. */
export const GROUP_RATE_FACTOR = 0.89;

export function buildRateQuotes(
  input: RateQuoteInput,
  roomTypes: readonly RoomType[],
  rateCodes: readonly RateCode[],
): RateQuote[] {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights <= 0) return [];

  const eligibleRooms = input.roomTypeId
    ? roomTypes.filter((rt) => rt.id === input.roomTypeId)
    : roomTypes;

  const quotes: RateQuote[] = [];

  for (const room of eligibleRooms) {
    if (input.adults + input.children > room.maxOccupancy) continue;

    for (const rate of rateCodes) {
      if (!rate.isActive) continue;
      if (rate.currency !== room.currency) continue;

      const extraAdults = Math.max(input.adults - 2, 0);
      const pricePerNight =
        rate.pricePerNight + rate.pricePerNight * EXTRA_ADULT_RATE * extraAdults;
      const subtotal = pricePerNight * nights;
      const taxAmount = subtotal * TAX_RATE;
      const commissionAmount =
        rate.isCommissionable && rate.commissionRate
          ? subtotal * rate.commissionRate
          : undefined;

      quotes.push({
        rateCodeId: rate.id,
        rateCode: rate.code,
        rateName: rate.name,
        roomTypeId: room.id,
        roomTypeName: room.name,
        currency: rate.currency,
        nights,
        pricePerNight,
        subtotal,
        taxAmount,
        total: subtotal + taxAmount,
        isCommissionable: rate.isCommissionable,
        commissionRate: rate.commissionRate,
        commissionAmount,
        restrictions: rate.restrictions,
        cancellationPolicy: rate.cancellationPolicy,
        mealPlan: rate.mealPlan,
      });
    }
  }

  return quotes.sort((a, b) => a.total - b.total);
}
