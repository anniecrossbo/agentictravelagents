import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Agent } from './types';
import { agents } from '../mocks/agents';

// PROTO: fake auth — always succeeds with the first mock agent, no real authentication
type AgentPortalAuthContextValue = {
  agent: Agent | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AgentPortalAuthContext = createContext<AgentPortalAuthContextValue | null>(null);

export function AgentPortalAuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null);

  // PROTO: fake login — matches by email, ignores password
  const login = async (email: string, _password: string): Promise<boolean> => {
    const found = agents.find(
      (a) => a.email.toLowerCase() === email.toLowerCase(),
    );
    if (found) {
      setAgent(found);
      return true;
    }
    return false;
  };

  const logout = () => setAgent(null);

  return (
    <AgentPortalAuthContext.Provider
      value={{ agent, isAuthenticated: agent !== null, login, logout }}
    >
      {children}
    </AgentPortalAuthContext.Provider>
  );
}

export function useAgentPortalAuth() {
  const ctx = useContext(AgentPortalAuthContext);
  if (!ctx)
    throw new Error(
      'useAgentPortalAuth must be used within AgentPortalAuthProvider',
    );
  return ctx;
}
