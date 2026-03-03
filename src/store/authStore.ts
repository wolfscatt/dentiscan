import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UserRole } from '@types/models';
import { loginOrRegister } from '@services/userService';

interface AuthState {
  user: User | null;
  loading: boolean;
  loginError: string | null;
  setUser: (user: User | null) => void;
  /**
   * Giriş / kayıt: SQLite'ta e-posta arar.
   *  - Yeni kullanıcı → kaydeder ve giriş yapar.
   *  - Mevcut kullanıcı, doğru şifre → giriş yapar.
   *  - Mevcut kullanıcı, yanlış şifre → loginError set edilir.
   */
  login: (params: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
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
  // Uygulama açılışında AsyncStorage'dan oturumu yükle
  loadPersistedUser().then((user) => {
    set({ user, loading: false });
  });

  return {
    user: null,
    loading: true,
    loginError: null,
    setUser: (user) => set({ user }),

    login: async ({ name, email, password, role }) => {
      set({ loading: true, loginError: null });
      try {
        const { user, wrongPassword } = await loginOrRegister({ email, password, name, role });
        if (wrongPassword || !user) {
          set({ loading: false, loginError: 'E-posta veya şifre hatalı.' });
          return;
        }
        await persistUser(user);
        set({ user, loading: false, loginError: null });
      } catch {
        set({ loading: false, loginError: 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.' });
      }
    },

    logout: async () => {
      set({ loading: true });
      await persistUser(null);
      set({ user: null, loading: false, loginError: null });
    },
  };
});


