// src/lib/utils.ts
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 👇 HÀM MASK PHONE
export function maskPhone(
  phone: string | null | undefined,
  isAdmin: boolean
): string {
  if (!phone) return "";
  if (isAdmin) return phone;

  const value = String(phone).trim();

  if (value.length > 4) {
    return "*".repeat(value.length - 4) + value.slice(-4);
  }

  return "****";
}