import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, RotateCcw, ExternalLink } from 'lucide-react';
import { getAffiliateUrl } from '../utils/affiliate';

interface ResultModalProps {
  isCorrect: boolean;
  correctTitles: string[];
  userAnswers: string[];
  onReset: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isCorrect,
  correctTitles,
  userAnswers,
  onReset,
}) => {
  useEffect(() => {
    if (isCorrect) {
      // Trigger celebratory confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isCorrect]);

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

        {/* Correct Answers Display with Conditional Affiliate Links */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/80 text-left space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
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

                  {/* Affiliate Link Button if configured */}
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
