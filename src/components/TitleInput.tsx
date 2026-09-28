import React, { useState } from 'react';
import { Level } from '../types/game';
import { Sparkles, Play } from 'lucide-react';

interface TitleInputProps {
  onStartGame: (level: Level, titles: string[]) => void;
}

export const TitleInput: React.FC<TitleInputProps> = ({ onStartGame }) => {
  const [level, setLevel] = useState<Level>(1);
  const [titles, setTitles] = useState<string[]>(['', '', '']);
  const [error, setError] = useState<string | null>(null);

  const handleLevelChange = (newLevel: Level) => {
    setLevel(newLevel);
    setError(null);
  };

  const handleTitleChange = (index: number, value: string) => {
    const updated = [...titles];
    updated[index] = value;
    setTitles(updated);
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeTitles = titles.slice(0, level).map(t => t.trim());

    // Validate inputs
    if (activeTitles.some(t => t.length === 0)) {
      setError('すべてのタイトルを入力してください。');
      return;
    }

    onStartGame(level, activeTitles);
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-400 rounded-full text-sm font-medium mb-2 border border-pink-500/20">
          <Sparkles className="w-4 h-4" />
          <span>アナグラム作成</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">AVアナグラム</h1>
        <p className="text-slate-400 text-sm">
          AV作品のタイトルを入力して難易度を選択し、アナグラム問題を作成しよう！
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            難易度を選択（タイトルの数）
          </label>
          <div className="grid grid-cols-3 gap-3">
            {( [1, 2, 3] as Level[] ).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleLevelChange(lvl)}
                className={`py-3 px-4 rounded-lg font-bold transition-all text-center border ${
                  level === lvl
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-500 shadow-lg shadow-pink-500/25 scale-[1.02]'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                }`}
              >
                Lv.{lvl}
                <span className="block text-xs font-normal opacity-80 mt-0.5">
                  {lvl === 1 ? '1タイトル' : `${lvl}タイトル`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title Input Fields */}
        <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          {Array.from({ length: level }).map((_, idx) => (
            <div key={idx}>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {level === 1 ? 'タイトルを入力してください' : `タイトル${idx + 1}`}
              </label>
              <input
                type="text"
                value={titles[idx]}
                onChange={(e) => handleTitleChange(idx, e.target.value)}
                placeholder={
                  idx === 0
                    ? '例：専業主婦の秘密'
                    : idx === 1
                    ? '例：真夜中の誘惑'
                    : '例：秘密の放課後'
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:via-rose-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-lg"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>問題を作成</span>
        </button>
      </form>
    </div>
  );
};
