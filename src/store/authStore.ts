import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UserRole } from '@types/models';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (params: { name: string; email: string; role: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
}

const AUTH_KEY = 'dentiscan_auth_user_v1';

async function loadPersistedUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

async function persistUser(user: User | null): Promise<void> {
  if (!user) {
    await AsyncStorage.removeItem(AUTH_KEY);
  } else {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
}

export const useAuthStore = create<AuthState>((set) => {
  loadPersistedUser().then((user) => {
    set({ user, loading: false });
  });

  return {
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
    login: async ({ name, email, role }) => {
      set({ loading: true });
      const user: User = {
        id: `${Date.now()}`,
        name,
        email,
        role,
      };
      await persistUser(user);
      set({ user, loading: false });
    },
    logout: async () => {
      set({ loading: true });
      await persistUser(null);
      set({ user: null, loading: false });
    },
  };
});


