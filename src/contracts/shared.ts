/**
 * Shared pagination and filtering types used across all service contracts.
 */

export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

export interface SortParams {
  readonly sortBy: string;
  readonly sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  readonly [key: string]: string | number | boolean | string[] | undefined;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export interface DateRangeFilter {
  readonly from?: string;
  readonly to?: string;
}
