import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Tenant } from '@/types';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  tenantId: string | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string, tenantId?: string) => void;
  setTenant: (tenant: Tenant) => void;
  switchTenant: (tenantId: string) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      tenantId: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token, tenantId) =>
        set({
          user,
          token,
          tenantId: tenantId || null,
          isAuthenticated: true,
        }),

      setTenant: (tenant) =>
        set({ tenant }),

      switchTenant: (tenantId) =>
        set({ tenantId }),

      logout: () =>
        set({
          user: null,
          tenant: null,
          tenantId: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'itsm-auth-storage',
      partialize: (state) => ({
        user: state.user,
        tenantId: state.tenantId,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
