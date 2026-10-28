export type RoomCategory = 'room' | 'suite' | 'villa' | 'apartment';

export interface RoomType {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly category: RoomCategory;
  readonly description: string;
  readonly maxOccupancy: number;
  readonly maxAdults: number;
  readonly maxChildren: number;
  readonly amenities: readonly string[];
  readonly images: readonly string[];
  readonly basePrice: number;
  readonly currency: string;
}

export type OperaRoomStatus =
  | 'sellable'
  | 'occupied'
  | 'out_of_order'
  | 'out_of_service'
  | 'on_hold';

export interface PhysicalRoom {
  readonly id: string;
  readonly roomTypeId: string;
  readonly roomNumber: string;
  readonly floor: number;
  readonly operaStatus: OperaRoomStatus;
}

export interface RateCode {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly currency: string;
  readonly pricePerNight: number;
  readonly isPublic: boolean;
  readonly isStatic: boolean;
  readonly isDynamic: boolean;
  readonly dynamicBasis?: string;
  readonly isNet: boolean;
  readonly isCommissionable: boolean;
  readonly commissionRate?: number;
  readonly restrictions: readonly string[];
  readonly cancellationPolicy: string;
  readonly mealPlan?: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly isActive: boolean;
}

export type RateAssigneeType = 'agency' | 'agent';

export interface RateAssignment {
  readonly id: string;
  readonly rateCodeId: string;
  readonly assigneeType: RateAssigneeType;
  readonly assigneeId: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly isOverride: boolean;
  readonly createdBy: string;
  readonly createdAt: string;
}

export interface OccupancySummary {
  readonly roomTypeId: string;
  readonly totalRooms: number;
  readonly occupied: number;
  readonly sellable: number;
  readonly outOfOrder: number;
  readonly outOfService: number;
  readonly onHold: number;
  readonly date: string;
}

export type StaySegment = 'single' | 'couple' | 'family' | 'group';

export type BookingChannel = 'ota' | 'direct' | 'agent';

/** Performance analytics for one room type, shown on its detail view. */
export interface RoomTypeInsights {
  readonly roomTypeId: string;
  /** Business date the figures were computed for. */
  readonly asOf: string;
  readonly lengthOfStayBySegment: readonly {
    readonly segment: StaySegment;
    readonly averageNights: number;
  }[];
  /** Rooms allocated per channel: this period vs the previous one. */
  readonly allocationByChannel: readonly {
    readonly channel: BookingChannel;
    readonly current: number;
    readonly previous: number;
  }[];
}

export type ExperienceCategory = 'dining' | 'wellness' | 'activity' | 'leisure';

/** An on-property experience guests can book or visit (restaurant, spa, class…). */
export interface HotelExperience {
  readonly id: string;
  readonly name: string;
  readonly category: ExperienceCategory;
  readonly description: string;
  readonly schedule: {
    readonly frequency: 'daily' | 'weekdays' | 'weekends';
    /** 'HH:mm'. A slot without `closes` is a fixed start time, e.g. a class. */
    readonly slots: readonly { readonly opens: string; readonly closes?: string }[];
  };
  /** Media key; the media service resolves it to an image URL. */
  readonly imageKey: string;
}

/** Forecast rooms sold for one night, from OPERA's on-the-books position. */
export interface OccupancyForecastDay {
  readonly date: string;
  readonly occupied: number;
  readonly total: number;
}
