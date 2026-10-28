import type { Booking, CashflowStep, FinanceStage, Invoice } from '@/contracts';

export function paidSoFar(booking: Booking): number {
  return booking.steps
    .filter((s) => s.direction === 'in' && s.party === 'customer' && s.settled)
    .reduce((sum, s) => sum + s.amount, 0);
}

export function stillToCollect(booking: Booking): number {
  return booking.steps
    .filter((s) => s.direction === 'in' && s.party === 'customer' && !s.settled)
    .reduce((sum, s) => sum + s.amount, 0);
}

export function stepsPaidShare(booking: Booking): { paid: number; open: number } {
  const paid = paidSoFar(booking);
  const open = stillToCollect(booking);
  const total = paid + open;
  return { paid: total === 0 ? 0 : (paid / total) * 100, open: total === 0 ? 0 : (open / total) * 100 };
}

export function stageTotals(bookings: Booking[]): Record<FinanceStage, { count: number; total: number }> {
  return {
    'pending-customer': { count: bookings.length, total: bookings.reduce((s, b) => s + stillToCollect(b), 0) },
    'pending-hotel': { count: bookings.length, total: bookings.reduce((s, b) => s + b.commission, 0) },
    'to-pay': { count: bookings.length, total: bookings.reduce((s, b) => s + b.payout, 0) },
  };
}

export function invoiceTotal(invoice: Invoice): number {
  return invoice.lines.reduce((s, l) => s + l.amount, 0);
}

export function invoiceBalance(invoice: Invoice): number {
  return invoiceTotal(invoice) - invoice.credits.reduce((s, c) => s + c.amount, 0);
}

export function stepIsMoneyIn(step: CashflowStep): boolean {
  return step.direction === 'in';
}
