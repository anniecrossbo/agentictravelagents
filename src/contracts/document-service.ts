/**
 * Document service contract.
 *
 * Handles document uploads, review workflows, versioning, quarantine,
 * and retrieval for any entity (booking, agent, agency).
 */

import type { Document, DocumentStatus, DocumentType } from '../lib/types';

// ── Payloads ────────────────────────────────────────────────────────────────

export interface UploadDocumentFile {
  readonly fileName: string;
  readonly mimeType: string;
  readonly data: string; // base64 or URI
  readonly fileSize: number;
}

export interface UploadDocumentMetadata {
  readonly entityType: 'booking' | 'agent' | 'agency';
  readonly entityId: string;
  readonly documentTypeId: string;
  readonly uploadedBy: string;
}

export type ReviewDecision = 'approved' | 'rejected';

// ── Service interface ───────────────────────────────────────────────────────

export interface IDocumentService {
  getDocuments(
    entityType: 'booking' | 'agent' | 'agency',
    entityId: string,
  ): Promise<readonly Document[]>;

  uploadDocument(
    file: UploadDocumentFile,
    metadata: UploadDocumentMetadata,
  ): Promise<Document>;

  reviewDocument(
    id: string,
    decision: ReviewDecision,
    reason?: string,
  ): Promise<Document>;

  replaceDocument(
    id: string,
    file: UploadDocumentFile,
  ): Promise<Document>;

  downloadDocument(id: string): Promise<{
    fileName: string;
    mimeType: string;
    data: string; // base64 or download URL
  }>;

  getDocumentTypes(): Promise<readonly DocumentType[]>;

  quarantineDocument(
    id: string,
    reason: string,
  ): Promise<Document>;
}
