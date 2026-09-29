import { describe, it, expect, beforeEach } from 'vitest';
import { getAffiliateUrl, AFFILIATE_URLS } from '../utils/affiliate';

describe('affiliate utility', () => {
  beforeEach(() => {
    // Clear dictionary keys before each test
    for (const key in AFFILIATE_URLS) {
      delete AFFILIATE_URLS[key];
    }
  });

  it('returns undefined when no affiliate URL is configured for title', () => {
    expect(getAffiliateUrl('未登録作品')).toBeUndefined();
  });

  it('returns affiliate URL when configured for title', () => {
    AFFILIATE_URLS['専業主婦の秘密'] = 'https://al.dmm.co.jp/sample';
    expect(getAffiliateUrl('専業主婦の秘密')).toBe('https://al.dmm.co.jp/sample');
  });

  it('handles surrounding whitespace gracefully', () => {
    AFFILIATE_URLS['専業主婦の秘密'] = 'https://al.dmm.co.jp/sample';
    expect(getAffiliateUrl(' 専業主婦の秘密 ')).toBe('https://al.dmm.co.jp/sample');
  });

  it('returns undefined for empty or whitespace-only URL values', () => {
    AFFILIATE_URLS['空作品'] = '   ';
    expect(getAffiliateUrl('空作品')).toBeUndefined();
  });
});
