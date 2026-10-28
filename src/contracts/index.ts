/**
 * Service contracts barrel export.
 *
 * Re-exports every service interface and its supporting types so consumers
 * can import from '@/contracts' without knowing the internal file layout.
 */

// ── Shared ──────────────────────────────────────────────────────────────────
export type {
  PaginationParams,
  SortParams,
  FilterParams,
  PaginatedResult,
  DateRangeFilter,
} from './shared';

// ── Opera PMS ───────────────────────────────────────────────────────────────
export type {
  IOperaService,
  AvailabilityRequest,
  AvailabilityResult,
  AvailabilityResponse,
  ReservationCreateRequest,
  ReservationCreateResponse,
  ReservationUpdateRequest,
  ReservationUpdateResponse,
  CancellationRequest,
  CancellationResponse,
  GuestProfileMatch,
  OperaEvent,
} from './opera-service';

// ── Booking ─────────────────────────────────────────────────────────────────
export type {
  IBookingRepository,
  BookingFilters,
  BookingSearchFilters,
  CreateBookingData,
  BookingStateMetadata,
  CreateVersionData,
  VersionDiff,
} from './booking-repository';

// ── Agent / Agency ──────────────────────────────────────────────────────────
export type {
  IAgentRepository,
  AgentFilters,
  AgencyFilters,
} from './agent-repository';

// ── Finance ─────────────────────────────────────────────────────────────────
export type {
  IFinanceRepository,
  ObligationFilters,
  CreateObligationData,
  ObligationStatusMetadata,
  RecordSettlementData,
  ReconciliationFile,
  ReconciliationResult,
  ExportFormat,
} from './finance-repository';

// ── Document ────────────────────────────────────────────────────────────────
export type {
  IDocumentService,
  UploadDocumentFile,
  UploadDocumentMetadata,
  ReviewDecision,
} from './document-service';

// ── Voucher ─────────────────────────────────────────────────────────────────
export type {
  IVoucherService,
  UpdateTemplateData,
  VoucherPreview,
} from './voucher-service';

// ── Communication ───────────────────────────────────────────────────────────
export type {
  ICommunicationService,
  ConversationFilters,
  SendMessageAttachment,
  StartConversationContent,
} from './communication-service';

// ── Rate ────────────────────────────────────────────────────────────────────
export type {
  IRateService,
  RateLookupRequest,
  RateLookupResult,
  RateCodeFilters,
  RateAssignmentFilters,
} from './rate-service';

// ── Inventory ───────────────────────────────────────────────────────────────
export type {
  IInventoryService,
  RoomTypeFilters,
  HotelOfferings,
} from './inventory-service';

// ── Notification ────────────────────────────────────────────────────────────
export type { INotificationService } from './notification-service';

// ── Audit ───────────────────────────────────────────────────────────────────
export type {
  IAuditService,
  AuditFilters,
  RecordAuditEventData,
} from './audit-service';

// ── FX Rate ─────────────────────────────────────────────────────────────────
export type {
  IFxRateService,
  FxConversionResult,
} from './fx-rate-service';

// ── AI Briefing ─────────────────────────────────────────────────────────────
export type {
  IAiBriefingService,
  BriefingSection,
  Briefing,
} from './ai-briefing-service';

// ── Auth ────────────────────────────────────────────────────────────────────
export type { IAuthService } from './auth-service';
