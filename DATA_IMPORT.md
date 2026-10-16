# 作品データ（Excel / CSV）の追加・更新方法

本サイトはサーバーレス（GitHub Pages）の静的構成で動作しています。
Excelで管理している作品リストおよびDMMアフィリエイトURLは、CSV形式で書き出して `src/data/presetTitles.ts` に反映させることで簡単にデータ更新できます。

---

## 1. Excel / CSVの推奨列構成

Excelまたはスプレッドシートで以下の4列を管理してください。

| 列名 | 説明 | 例 |
|---|---|---|
| **id** | 作品識別用の一意なID (英数字・ハイフン) | `title-001` |
| **title** | 作品の正式タイトル | `専業主婦の秘密` |
| **affiliateUrl** | DMMアフィリエイトURL（未設定の場合は空欄） | `https://al.dmm.co.jp/...` |
| **enabled** | ランダム出題の対象にするか (`TRUE` / `FALSE` または `1` / `0`) | `TRUE` |

---

## 2. データの登録手順

### 手順 1: CSVファイルの書き出し
Excelで「名前を付けて保存」から **CSV UTF-8（コンマ区切り）(*.csv)** を選択して保存します。

### 手順 2: `src/data/presetTitles.ts` の更新
書き出したCSVの内容を参考に、`src/data/presetTitles.ts` の `PRESET_TITLES` 配列を更新します。

```typescript
import { PresetTitle } from '../types/preset';

export const PRESET_TITLES: PresetTitle[] = [
  {
    id: 'title-001',
    title: '専業主婦の秘密',
    affiliateUrl: 'https://al.dmm.co.jp/...',
    enabled: true,
  },
  {
    id: 'title-002',
    title: '真夜中の誘惑',
    affiliateUrl: null, // URLがない場合は null または省略
    enabled: true,
  },
  // 必要に応じて追加...
];
```

### 手順 3: ビルド確認とデプロイ
変更を保存したら、ローカル環境でビルドを確認します。

```bash
npm run build
```

問題がなければ、リポジトリにコミットしてPushすることで、GitHub ActionsによりGitHub Pagesに自動デプロイされます。

---

## 3. 注意事項

- **ゲーム本体ロジックの変更は不要**です。`src/data/presetTitles.ts` の配列表現を差し替えるだけで作品が反映されます。
- `enabled: false` に設定された作品は、ランダム出題の対象から自動的に除外されます。
- `affiliateUrl` が未設定（`null` または空文字）の作品であっても、ランダム出題ゲームは通常通りプレイできます（正解発表画面で「この作品を見る」ボタンが表示されなくなります）。
