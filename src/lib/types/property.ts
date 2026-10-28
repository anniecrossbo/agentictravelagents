export interface Property {
  readonly id: string;
  readonly name: string;
  readonly timezone: string;
  readonly businessDate: string;
  readonly reportingCurrency: string;
  readonly address: string;
  readonly phone: string;
  readonly email: string;
  readonly checkInTime: string;
  readonly checkOutTime: string;
  readonly operaPropertyId?: string;
}
