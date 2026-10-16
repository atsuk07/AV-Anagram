import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackAffiliateClick } from '../utils/analytics';

describe('trackAffiliateClick', () => {
  beforeEach(() => {
    if (typeof globalThis.window === 'undefined') {
      (globalThis as unknown as { window: Record<string, unknown> }).window = {};
    }
    delete (globalThis.window as unknown as { gtag?: unknown }).gtag;
  });

  afterEach(() => {
    if (globalThis.window) {
      delete (globalThis.window as unknown as { gtag?: unknown }).gtag;
    }
  });

  it('runs safely without throwing when window.gtag is undefined', () => {
    expect(() => {
      trackAffiliateClick('テスト作品', 'https://al.fanza.co.jp/test');
    }).not.toThrow();
  });

  it('calls window.gtag with affiliate_click event and parameters when defined', () => {
    const mockGtag = vi.fn();
    (globalThis.window as unknown as { gtag: unknown }).gtag = mockGtag;

    trackAffiliateClick('テスト作品タイトル', 'https://al.fanza.co.jp/sample');

    expect(mockGtag).toHaveBeenCalledWith('event', 'affiliate_click', {
      title: 'テスト作品タイトル',
      affiliate_url: 'https://al.fanza.co.jp/sample',
    });
  });
});
