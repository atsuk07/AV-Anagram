/**
 * Utility to generate a vertical card result image (PNG) using HTML5 Canvas
 */

export interface ResultCardOptions {
  level: number;
  isCorrect: boolean;
  userAnswers: string[];
  correctTitles: string[];
}

export function generateResultCardCanvas(options: ResultCardOptions): HTMLCanvasElement {
  const { level, isCorrect, userAnswers, correctTitles } = options;

  const canvas = document.createElement('canvas');
  const width = 600;
  // Calculate dynamic height based on number of titles
  const baseHeight = 420;
  const itemHeight = 110;
  const height = baseHeight + level * itemHeight;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f172a'); // slate-900
  gradient.addColorStop(0.5, '#1e1b4b'); // indigo-950
  gradient.addColorStop(1, '#020617'); // slate-950
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Outer Decorative Border
  ctx.strokeStyle = isCorrect ? '#059669' : '#e11d48';
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // App Title Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f43f5e'; // rose-500
  ctx.font = 'bold 36px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('AVアナグラム', width / 2, 60);

  ctx.fillStyle = '#94a3b8'; // slate-400
  ctx.font = '14px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('無料AVタイトルアナグラムゲーム', width / 2, 85);

  // Status Badge (Correct / Incorrect)
  const badgeY = 135;
  const badgeWidth = 220;
  const badgeHeight = 48;
  const badgeX = (width - badgeWidth) / 2;

  ctx.fillStyle = isCorrect ? '#065f46' : '#881337'; // dark green or dark red
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY - 32, badgeWidth, badgeHeight, 24);
  ctx.fill();

  ctx.strokeStyle = isCorrect ? '#10b981' : '#f43f5e';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(isCorrect ? '【 正 解 ！ 】' : '【 不正解 ！ 】', width / 2, badgeY);

  // Card Level Banner
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 16px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(`難易度: Lv.${level} (${level}タイトル)`, width / 2, 175);

  // Answers Section Box
  let currentY = 210;
  const boxPadding = 30;
  const boxWidth = width - boxPadding * 2;

  for (let i = 0; i < level; i++) {
    const userAnswer = (userAnswers[i] || '').trim() || '(未入力)';
    const correctTitle = (correctTitles[i] || '').trim();

    // Box background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.roundRect(boxPadding, currentY, boxWidth, 96, 12);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Title label
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f472b6'; // pink-400
    ctx.font = 'bold 14px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(`【回答 ${i + 1}】`, boxPadding + 16, currentY + 30);

    // User answer
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(userAnswer, boxPadding + 90, currentY + 30);

    // Correct Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 13px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(`正解:`, boxPadding + 16, currentY + 68);

    ctx.fillStyle = '#38bdf8'; // sky-400
    ctx.font = 'bold 16px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(correctTitle, boxPadding + 90, currentY + 68);

    currentY += 110;
  }

  // Footer Branding
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '12px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('AVアナグラム | ブラウザで遊べる無料ゲーム', width / 2, height - 30);

  return canvas;
}

export function generateResultCardBlob(options: ResultCardOptions): Promise<Blob | null> {
  const canvas = generateResultCardCanvas(options);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export function generateResultCardDataUrl(options: ResultCardOptions): string {
  const canvas = generateResultCardCanvas(options);
  return canvas.toDataURL('image/png');
}

export async function shareResultImage(
  options: ResultCardOptions
): Promise<'shared' | 'downloaded'> {
  const blob = await generateResultCardBlob(options);
  const dataUrl = generateResultCardDataUrl(options);

  if (blob && navigator.canShare && navigator.share) {
    const file = new File([blob], 'av-anagram-result.png', { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'AVアナグラム 回答結果',
          text: `AVアナグラム Lv.${options.level} の結果です！`,
          files: [file],
        });
        return 'shared';
      } catch (e) {
        // Fallback to download if user cancelled or error occurred
        console.warn('Web share cancelled or failed, falling back to download', e);
      }
    }
  }

  // Fallback: trigger image download
  const link = document.createElement('a');
  link.download = 'av-anagram-result.png';
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return 'downloaded';
}
