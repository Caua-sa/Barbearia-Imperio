import { ClientUser } from '../types';
import { cleanPhoneDigits, registerOrUpdateCustomer } from './storage';

const STORAGE_AUTH_USER = 'imperio_barbearia_auth_user_v1';

export function getCurrentUser(): ClientUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loginWithGoogle(data?: {
  name?: string;
  email?: string;
  avatarUrl?: string;
  whatsapp?: string;
}): ClientUser {
  const email = data?.email || 'athensco2023@gmail.com';
  const name = data?.name || 'Cliente Império';
  const whatsapp = data?.whatsapp ? cleanPhoneDigits(data.whatsapp) : undefined;

  // Generate consistent initial/avatar
  const avatarUrl =
    data?.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=d97706`;

  const user: ClientUser = {
    id: 'google-usr-' + Date.now(),
    name,
    email,
    avatarUrl,
    whatsapp,
    provider: 'google',
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user));

  // If WhatsApp was provided, link into customers CRM
  if (whatsapp && whatsapp.length >= 8) {
    registerOrUpdateCustomer(name, whatsapp, `Conta Google vinculada: ${email}`);
  }

  // Dispatch custom event so reactive components can update
  window.dispatchEvent(new Event('imperio_auth_changed'));

  return user;
}

export function updateLinkedWhatsapp(phone: string): ClientUser | null {
  const current = getCurrentUser();
  if (!current) return null;

  const digits = cleanPhoneDigits(phone);
  const updated: ClientUser = {
    ...current,
    whatsapp: digits || undefined,
  };

  localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(updated));

  if (digits && digits.length >= 8) {
    registerOrUpdateCustomer(current.name, digits, `Conta Google vinculada: ${current.email}`);
  }

  window.dispatchEvent(new Event('imperio_auth_changed'));
  return updated;
}

export function logoutClient(): void {
  localStorage.removeItem(STORAGE_AUTH_USER);
  window.dispatchEvent(new Event('imperio_auth_changed'));
}
