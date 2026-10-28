import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, UserRole } from './types';
import { users } from '../mocks/users';

// PROTO: fake auth — hardcoded users from mock data, no real authentication
const USER_BY_ROLE: Record<UserRole, User> = Object.fromEntries(
  users.map((u) => [u.role, u]),
) as Record<UserRole, User>;

interface AuthContextValue {
  user: User;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  hasPermission: (capability: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('reservation_manager');
  const user = USER_BY_ROLE[role];

  // PROTO: simple permission check — always returns true, no real backend enforcement
  const hasPermission = (_capability: string) => {
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, role, switchRole: setRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
