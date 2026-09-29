/**
 * Affiliate link configuration map.
 * Key: Exact title name or title key
 * Value: DMM affiliate URL (e.g. https://al.dmm.co.jp/...)
 */
export const AFFILIATE_URLS: Record<string, string> = {
  // 後から作品ごとのアフィリエイトURLをここに追加・設定できます。
  // 例:
  // '専業主婦の秘密': 'https://al.dmm.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F-%2Fdetail%2F%3Fid%3Dsample123&af_id=xxxx',
};

/**
 * Default search fallback or empty check.
 * Returns the affiliate URL for a given title if configured and non-empty.
 */
export function getAffiliateUrl(title: string): string | undefined {
  if (!title) return undefined;
  const trimmed = title.trim();
  const url = AFFILIATE_URLS[trimmed];
  if (url && url.trim().length > 0) {
    return url.trim();
  }
  return undefined;
}
