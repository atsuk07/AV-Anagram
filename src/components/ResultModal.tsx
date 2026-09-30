import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ExternalLink,
  Share2,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { getAffiliateUrl } from '../utils/affiliate';
import { generateShareUrl } from '../utils/share';
import { shareResultImage } from '../utils/imageGenerator';
import { Level } from '../types/game';

interface ResultModalProps {
  isCorrect: boolean;
  correctTitles: string[];
  userAnswers: string[];
  level?: Level;
  onReset: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isCorrect,
  correctTitles,
  userAnswers,
  level = correctTitles.length as Level,
  onReset,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [imageShareStatus, setImageShareStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isCorrect]);

  const handleShareResultImage = async () => {
    try {
      const result = await shareResultImage({
        level,
        isCorrect,
        userAnswers,
        correctTitles,
      });
      if (result === 'shared') {
        setImageShareStatus('結果をシェアしました！');
      } else {
        setImageShareStatus('結果画像を保存しました！');
      }
      setTimeout(() => setImageShareStatus(null), 3000);
    } catch (err) {
      console.error('Failed to share result image:', err);
    }
  };

  const handleCopyProblemUrl = async () => {
    const url = generateShareUrl(level, correctTitles);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch (err) {
      console.error('Failed to copy share URL:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md bg-slate-800 border rounded-2xl p-6 shadow-2xl text-center space-y-6 ${
          isCorrect
            ? 'border-emerald-500/50 shadow-emerald-500/10 animate-bounce-gentle'
            : 'border-rose-500/50 shadow-rose-500/10 animate-shake'
        }`}
      >
        {/* Status Icon & Header */}
        <div className="space-y-2">
          {isCorrect ? (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full mb-2 border border-emerald-500/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-500/20 text-rose-400 rounded-full mb-2 border border-rose-500/30">
              <XCircle className="w-12 h-12" />
            </div>
          )}

          <h2
            className={`text-4xl font-extrabold tracking-tight ${
              isCorrect ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isCorrect ? '正解！' : '不正解！'}
          </h2>
          <p className="text-slate-400 text-sm">
            {isCorrect
              ? '素晴らしい！すべてのタイトルを正確に見破りました！'
              : '残念！もう一度挑戦してみてください。'}
          </p>
        </div>

        {/* User Answers & Correct Answers Display */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/80 text-left space-y-3">
          <div>
            <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider block mb-1">
              あなたの回答
            </span>
            <div className="space-y-1.5">
              {Array.from({ length: level }).map((_, idx) => (
                <div
                  key={`user-${idx}`}
                  className="px-3 py-1.5 bg-slate-800 rounded text-slate-200 text-sm border border-slate-700 font-medium"
                >
                  <span className="text-xs text-slate-400 mr-2">回答 {idx + 1}:</span>
                  <span className="break-all">
                    {userAnswers[idx] ? userAnswers[idx] : '(未入力)'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              正解タイトル
            </span>
            <div className="space-y-2.5">
              {correctTitles.map((title, idx) => {
                const affiliateUrl = getAffiliateUrl(title);
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800 rounded-lg text-white font-medium text-sm border border-slate-700 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold">
                        {idx + 1}
                      </span>
                      <span className="break-all">{title}</span>
                    </div>

                    {affiliateUrl && (
                      <div className="pt-1 border-t border-slate-700/60">
                        <a
                          href={affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-pink-600/20 active:scale-[0.98]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>この作品を見る</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Share Buttons Section */}
        <div className="space-y-2">
          {/* 1. Share Result Image */}
          <button
            onClick={handleShareResultImage}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {imageShareStatus ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>{imageShareStatus}</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                <span>回答結果を画像としてシェア</span>
              </>
            )}
          </button>

          {/* 2. Share Problem URL */}
          <button
            onClick={handleCopyProblemUrl}
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
              copiedUrl
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200'
            }`}
          >
            {copiedUrl ? (
              <>
                <Check className="w-4 h-4" />
                <span>URLをコピーしました！</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>この問題をシェア</span>
              </>
            )}
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={onReset}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:via-rose-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>もう一度遊ぶ / 新しい問題を作成</span>
        </button>
      </div>
    </div>
  );
};
