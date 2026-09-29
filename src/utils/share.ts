import { Level } from '../types/game';

export interface SharedProblem {
  level: Level;
  titles: string[];
}

/**
 * Encodes problem data into a URL-safe Base64 string.
 */
export function encodeProblem(level: Level, titles: string[]): string {
  const payload: SharedProblem = {
    level,
    titles: titles.map(t => t.trim()),
  };
  const jsonStr = JSON.stringify(payload);

  // Encode UTF-8 string to Base64 safely
  const bytes = new TextEncoder().encode(jsonStr);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  // Make Base64 URL-safe (replace +, /, and remove =)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes a URL-safe Base64 string back into problem data.
 */
export function decodeProblem(encodedStr: string): SharedProblem | null {
  if (!encodedStr || typeof encodedStr !== 'string') return null;

  try {
    // Restore standard Base64 characters and padding
    let base64 = encodedStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const data = JSON.parse(jsonStr) as SharedProblem;

    // Validate problem structure
    if (
      (data.level === 1 || data.level === 2 || data.level === 3) &&
      Array.isArray(data.titles) &&
      data.titles.length === data.level &&
      data.titles.every(t => typeof t === 'string' && t.trim().length > 0)
    ) {
      return {
        level: data.level,
        titles: data.titles.map(t => t.trim()),
      };
    }
  } catch (e) {
    console.error('Failed to decode share URL:', e);
  }

  return null;
}

/**
 * Generates the full shareable URL for a given problem.
 */
export function generateShareUrl(level: Level, titles: string[]): string {
  const encoded = encodeProblem(level, titles);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?p=${encoded}`;
}
