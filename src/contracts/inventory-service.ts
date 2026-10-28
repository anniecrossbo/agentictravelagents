/**
 * Inventory service contract.
 *
 * Provides room type browsing, physical room queries, occupancy summaries,
 * and hotel offering lookups.
 */

import type {
  RoomType,
  RoomCategory,
  PhysicalRoom,
  OccupancySummary,
  RoomTypeInsights,
  HotelExperience,
  OccupancyForecastDay,
  Property,
} from '../lib/types';
import type { PaginatedResult, PaginationParams, SortParams } from './shared';

// ── Filters ─────────────────────────────────────────────────────────────────

export interface RoomTypeFilters {
  readonly category?: RoomCategory;
  readonly propertyId?: string;
  readonly minOccupancy?: number;
}

// ── Hotel offerings (aggregate view for booking flow) ───────────────────────

export interface HotelOfferings {
  readonly property: Property;
  readonly roomTypes: readonly RoomType[];
  readonly amenities: readonly string[];
  readonly experiences: readonly HotelExperience[];
  readonly policies: {
    readonly checkInTime: string;
    readonly checkOutTime: string;
    readonly cancellationDefault: string;
  };
}

// ── Service interface ───────────────────────────────────────────────────────

export interface IInventoryService {
  getRoomTypes(
    filters: RoomTypeFilters,
    pagination?: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<RoomType>>;

  getRoomTypeById(id: string): Promise<RoomType | null>;

  getPhysicalRooms(roomTypeId: string): Promise<readonly PhysicalRoom[]>;

  getOccupancySummary(date?: string): Promise<readonly OccupancySummary[]>;

  getHotelOfferings(): Promise<HotelOfferings>;

  getRoomTypeInsights(roomTypeId: string): Promise<RoomTypeInsights | null>;

  /** Nightly occupancy on the books from `fromDate` for `days` nights. */
  getOccupancyForecast(fromDate: string, days: number): Promise<readonly OccupancyForecastDay[]>;
}
