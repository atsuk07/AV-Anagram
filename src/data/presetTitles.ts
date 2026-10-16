import { PresetTitle } from '../types/preset';

/**
 * 登録済み作品データリスト
 *
 * Excel/CSV列構成:
 * id | title | affiliateUrl | enabled
 */
export const PRESET_TITLES: PresetTitle[] = [
  {
    id: 'test-sample-01',
    title: 'サンプル女優の秘密な休日',
    affiliateUrl: 'https://al.dmm.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F-%2Fdetail%2F%3D%2Fcid%3Dsample001%2F&af_id=sample-999',
    enabled: true,
  },
  {
    id: 'test-sample-02',
    title: '真夜中の誘惑レッスン',
    affiliateUrl: 'https://al.dmm.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F-%2Fdetail%2F%3D%2Fcid%3Dsample002%2F&af_id=sample-999',
    enabled: true,
  },
  {
    id: 'test-sample-03',
    title: '放課後のヒミツ指導',
    affiliateUrl: null, // URLなし作品のテスト用
    enabled: true,
  },
  {
    id: 'test-sample-04',
    title: '非公開のテスト作品',
    affiliateUrl: null,
    enabled: false, // 無効作品のテスト用
  },
];
