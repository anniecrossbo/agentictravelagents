/**
 * Auth service contract.
 *
 * Provides authentication, authorization, and role switching.
 *
 * // PROTO: Authentication is entirely faked — login always succeeds,
 * // tokens are not validated, and session persistence is simulated.
 * // Real implementation needs OAuth / OIDC integration, token refresh,
 * // and server-side permission evaluation.
 */

import type { User, UserRole, Permission, Capability } from '../lib/types';

// ── Service interface ───────────────────────────────────────────────────────

export interface IAuthService {
  getCurrentUser(): Promise<User | null>;

  getPermissions(userId: string): Promise<readonly Permission[]>;

  hasPermission(userId: string, capability: Capability): Promise<boolean>;

  // PROTO: fake auth — always succeeds with a mock user
  login(email: string, password: string): Promise<User>;

  logout(): Promise<void>;

  switchRole(role: UserRole): Promise<User>;
}
