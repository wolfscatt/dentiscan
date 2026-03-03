import { create } from 'zustand';
import type { User, UserRole } from '@types/models';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  loginMock: (params: { name: string; email: string; role: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  setUser: (user) => set({ user }),
  loginMock: async ({ name, email, role }) => {
    set({ loading: true });
    // Basit mock gecikme
    await new Promise((resolve) => setTimeout(resolve, 600));
    const user: User = {
      id: `${Date.now()}`,
      name,
      email,
      role,
    };
    set({ user, loading: false });
  },
  logout: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ user: null, loading: false });
  },
}));

