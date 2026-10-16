import { describe, it, expect } from 'vitest';
import {
  getEnabledPresetTitles,
  getRandomPresetTitle,
} from '../utils/presetTitles';
import { PresetTitle } from '../types/preset';

describe('presetTitles', () => {
  const mockList: PresetTitle[] = [
    { id: '1', title: '作品A', affiliateUrl: 'http://example.com/1', enabled: true },
    { id: '2', title: '作品B', affiliateUrl: null, enabled: true },
    { id: '3', title: '作品C', affiliateUrl: 'http://example.com/3', enabled: false },
  ];

  it('filters enabled preset titles correctly', () => {
    const enabled = getEnabledPresetTitles(mockList);
    expect(enabled.length).toBe(2);
    expect(enabled.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('returns null if there are zero enabled titles', () => {
    const emptyList: PresetTitle[] = [
      { id: '1', title: '無効作品', affiliateUrl: null, enabled: false },
    ];
    expect(getRandomPresetTitle(undefined, emptyList)).toBeNull();
  });

  it('returns the single title if only one title is enabled', () => {
    const singleList: PresetTitle[] = [
      { id: '1', title: '作品A', affiliateUrl: null, enabled: true },
      { id: '2', title: '作品B', affiliateUrl: null, enabled: false },
    ];
    const picked = getRandomPresetTitle('1', singleList);
    expect(picked?.id).toBe('1');
  });

  it('avoids consecutive repeat selection when multiple titles are enabled', () => {
    // Repeat selection 20 times with previousId='1'
    for (let i = 0; i < 20; i++) {
      const picked = getRandomPresetTitle('1', mockList);
      expect(picked?.id).toBe('2');
    }
  });
});
