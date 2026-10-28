/**
 * Notification service contract.
 *
 * Delivers notifications and manages the "Needs You" signal queue —
 * the role-aware attention system that surfaces items requiring action.
 */

import type {
  Notification,
  NeedsYouSignal,
  UserRole,
} from '../lib/types';

// ── Service interface ───────────────────────────────────────────────────────

export interface INotificationService {
  getNotifications(
    userId: string,
  ): Promise<readonly Notification[]>;

  markRead(notificationId: string): Promise<void>;

  getNeedsYouSignals(
    userId: string,
    role: UserRole,
  ): Promise<readonly NeedsYouSignal[]>;

  dismissSignal(signalId: string): Promise<NeedsYouSignal>;

  snoozeSignal(
    signalId: string,
    until: string,
  ): Promise<NeedsYouSignal>;

  resolveSignal(signalId: string): Promise<NeedsYouSignal>;
}
