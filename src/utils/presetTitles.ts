import { PresetTitle } from '../types/preset';
import { PRESET_TITLES } from '../data/presetTitles';

/**
 * 有効な（enabled === true）登録済み作品の一覧を取得します
 */
export const getEnabledPresetTitles = (
  list: PresetTitle[] = PRESET_TITLES
): PresetTitle[] => {
  return list.filter((item) => item.enabled);
};

/**
 * 有効な登録作品の中からランダムに1作品を選択します。
 * 登録作品が複数ある場合、可能な限り直前に出題した作品（previousId）と連続しないように選択します。
 */
export const getRandomPresetTitle = (
  previousId?: string,
  list: PresetTitle[] = PRESET_TITLES
): PresetTitle | null => {
  const enabledTitles = getEnabledPresetTitles(list);

  if (enabledTitles.length === 0) {
    return null;
  }

  if (enabledTitles.length === 1) {
    return enabledTitles[0];
  }

  // 直前のIDを除外した候補リストを作成
  const candidates = previousId
    ? enabledTitles.filter((item) => item.id !== previousId)
    : enabledTitles;

  const pool = candidates.length > 0 ? candidates : enabledTitles;
  const randomIndex = Math.floor(Math.random() * pool.length);

  return pool[randomIndex];
};
