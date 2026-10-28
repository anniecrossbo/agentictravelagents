export type DocumentStatus =
  | 'missing'
  | 'uploaded'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'replaced'
  | 'quarantined'
  | 'not_required';

export interface DocumentVersion {
  readonly versionId: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly uploadedBy: string;
  readonly uploadedAt: string;
  readonly status: DocumentStatus;
}

export interface Document {
  readonly id: string;
  /** Human-readable identifier, e.g. 'DOC-0024'. */
  readonly humanId: string;
  readonly bookingId?: string;
  readonly agentId?: string;
  readonly agencyId?: string;
  readonly type: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly mimeType: string;
  readonly status: DocumentStatus;
  readonly uploadedBy: string;
  readonly uploadedAt: string;
  readonly reviewedBy?: string;
  readonly reviewedAt?: string;
  readonly rejectionReason?: string;
  readonly expiryDate?: string;
  readonly replacedById?: string;
  readonly quarantineReason?: string;
  readonly versions: readonly DocumentVersion[];
}

export interface DocumentType {
  readonly id: string;
  readonly name: string;
  readonly required: boolean;
  readonly requiresReview: boolean;
  readonly allowedFileTypes: readonly string[];
  readonly maxFileSize: number;
  readonly isActive: boolean;
}
