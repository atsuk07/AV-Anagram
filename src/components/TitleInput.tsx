import React, { useState } from 'react';
import { Level } from '../types/game';
import { Sparkles, Play, Dices, Edit3 } from 'lucide-react';
import { getEnabledPresetTitles, getRandomPresetTitle } from '../utils/presetTitles';
import { PresetTitle } from '../types/preset';

interface TitleInputProps {
  onStartGame: (level: Level, titles: string[]) => void;
  onStartRandomGame: (preset: PresetTitle) => void;
}

export const TitleInput: React.FC<TitleInputProps> = ({
  onStartGame,
  onStartRandomGame,
}) => {
  const [mode, setMode] = useState<'custom' | 'random'>('custom');
  const [level, setLevel] = useState<Level>(1);
  const [titles, setTitles] = useState<string[]>(['', '', '']);
  const [error, setError] = useState<string | null>(null);

  const enabledPresetTitles = getEnabledPresetTitles();

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

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeTitles = titles.slice(0, level).map((t) => t.trim());

    if (activeTitles.some((t) => t.length === 0)) {
      setError('すべてのタイトルを入力してください。');
      return;
    }

    onStartGame(level, activeTitles);
  };

  const handleRandomSubmit = () => {
    const selected = getRandomPresetTitle();
    if (!selected) {
      setError('登録されている作品がありません。');
      return;
    }
    onStartRandomGame(selected);
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-400 rounded-full text-sm font-medium mb-2 border border-pink-500/20">
          <Sparkles className="w-4 h-4" />
          <span>AVアナグラム</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          モードを選択
        </h1>
        <p className="text-slate-400 text-sm">
          自分で問題を作成するか、登録済み作品からランダムに出題して遊べます！
        </p>
      </div>

      {/* Mode Selection Tabs */}
      <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700">
        <button
          type="button"
          onClick={() => {
            setMode('custom');
            setError(null);
          }}
          className={`py-2.5 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            mode === 'custom'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>自分で問題を作る</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('random');
            setError(null);
          }}
          className={`py-2.5 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            mode === 'random'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Dices className="w-4 h-4" />
          <span>ランダムに遊ぶ</span>
        </button>
      </div>

      {mode === 'custom' ? (
        /* Custom Free Input Form */
        <form onSubmit={handleCustomSubmit} className="space-y-6">
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
      ) : (
        /* Random Preset Selection Mode */
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/80 space-y-3 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-500/20 text-pink-400 rounded-full mb-1 border border-pink-500/30">
              <Dices className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">ランダム出題（Lv.1）</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              登録された作品タイトルの中からランダムに1作品を選んで問題を出題します。
            </p>
            <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
              現在の登録作品数:{' '}
              <span className="font-bold text-pink-400 text-sm">
                {enabledPresetTitles.length}
              </span>{' '}
              作品
            </div>
          </div>

          {enabledPresetTitles.length === 0 ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm text-center leading-relaxed">
              現在、登録されている作品がありません。運営者による作品追加をお待ちください。
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRandomSubmit}
              className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:via-rose-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-lg"
            >
              <Dices className="w-5 h-5" />
              <span>ランダム出題で遊ぶ</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
