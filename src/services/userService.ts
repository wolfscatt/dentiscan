import { getDb } from '@services/db';
import type { User, UserRole } from '@types/models';

interface UserRow {
  id: string;
  role: string;
  name: string;
  email: string;
  password: string;
  created_at: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    role: row.role as UserRole,
    name: row.name,
    email: row.email,
  };
}

/**
 * Giriş mantığı:
 *  - E-posta + şifre eşleşiyorsa mevcut kullanıcıyı döndür.
 *  - E-posta hiç kayıtlı değilse yeni kullanıcı oluştur (ilk kayıt).
 *  - E-posta kayıtlı ama şifre yanlışsa null döndür.
 */
export async function loginOrRegister(params: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}): Promise<{ user: User | null; isNew: boolean; wrongPassword: boolean }> {
  const db = getDb();
  const { email, password, name, role } = params;

  const existing = db.getFirstSync<UserRow>(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email],
  );

  if (existing) {
    // Kayıtlı kullanıcı — şifreyi kontrol et
    if (existing.password !== password) {
      return { user: null, isNew: false, wrongPassword: true };
    }
    return { user: rowToUser(existing), isNew: false, wrongPassword: false };
  }

  // Yeni kullanıcı — kaydet
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  db.runSync(
    `INSERT INTO users (id, role, name, email, password, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, role, name, email, password, now],
  );

  return {
    user: { id, role, name, email },
    isNew: true,
    wrongPassword: false,
  };
}

/** Profil sayfası için kullanıcıyı ID ile getir */
export async function getUserById(id: string): Promise<User | null> {
  const db = getDb();
  const row = db.getFirstSync<UserRow>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return row ? rowToUser(row) : null;
}
