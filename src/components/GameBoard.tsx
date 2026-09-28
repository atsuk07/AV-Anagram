import React from 'react';
import { CardItem, Level } from '../types/game';
import { Layers, Ungroup, RotateCcw, Send } from 'lucide-react';

interface GameBoardProps {
  level: Level;
  cards: CardItem[];
  userAnswers: string[];
  onToggleSelect: (cardId: string) => void;
  onToggleUsed: (cardId: string) => void;
  onGroupSelected: () => void;
  onUngroup: (cardId: string) => void;
  onAnswerChange: (index: number, value: string) => void;
  onSubmitAnswer: () => void;
  onReset: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  level,
  cards,
  userAnswers,
  onToggleSelect,
  onToggleUsed,
  onGroupSelected,
  onUngroup,
  onAnswerChange,
  onSubmitAnswer,
  onReset,
}) => {
  const selectedCards = cards.filter((c) => c.isSelected);
  const canGroup = selectedCards.length > 1;

  // Single selected group card for ungrouping option
  const singleSelectedGroupCard =
    selectedCards.length === 1 && selectedCards[0].isGroup
      ? selectedCards[0]
      : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700">
        <div>
          <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider block">
            Difficulty
          </span>
          <h2 className="text-lg font-bold text-white">
            Lv.{level} （{level === 1 ? '1タイトル' : `${level}タイトル`}）
          </h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>タイトル入力に戻る</span>
        </button>
      </div>

      {/* Cards Display Section */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300">
            シャッフルされた文字（タップで選択 / チェックで使用済み）
          </h3>
          <span className="text-xs text-slate-400">
            {cards.length} 文字
          </span>
        </div>

        {/* Card Control Toolbar */}
        <div className="flex items-center gap-3 pt-1 border-t border-slate-700/50">
          <button
            onClick={onGroupSelected}
            disabled={!canGroup}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              canGroup
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>グループ化</span>
          </button>

          {singleSelectedGroupCard && (
            <button
              onClick={() => onUngroup(singleSelectedGroupCard.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30 transition-all"
            >
              <Ungroup className="w-4 h-4" />
              <span>グループ解除</span>
            </button>
          )}

          {selectedCards.length > 0 && (
            <span className="text-xs text-purple-300 ml-auto font-medium">
              {selectedCards.length}個 選択中
            </span>
          )}
        </div>

        {/* Cards Grid/Wrap Container */}
        <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center min-h-[120px] p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
          {cards.map((card) => {
            return (
              <div
                key={card.id}
                className={`flex flex-col items-center justify-between rounded-xl transition-all duration-150 select-none ${
                  card.isSelected
                    ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-slate-900 scale-[1.03]'
                    : ''
                }`}
              >
                {/* Checkbox Container for Used Status */}
                <div
                  onClick={() => onToggleUsed(card.id)}
                  title={card.isUsed ? '未使用に戻す' : '使用済みにする'}
                  className="w-full pt-1.5 pb-1 flex justify-center items-center hover:bg-slate-700/30 rounded-t-xl transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={card.isUsed}
                    onChange={() => {}} // handled by parent div click
                    className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 focus:ring-offset-slate-900 bg-slate-800 border-slate-600 cursor-pointer"
                  />
                </div>

                {/* Card Text Content */}
                <button
                  type="button"
                  onClick={() => onToggleSelect(card.id)}
                  className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-b-xl font-bold text-center transition-all cursor-pointer flex items-center justify-center min-w-[44px] ${
                    card.isUsed
                      ? 'bg-slate-800/40 text-slate-500 line-through opacity-60 border border-slate-800'
                      : card.isGroup
                      ? 'bg-gradient-to-br from-purple-900/90 to-indigo-900/90 text-purple-200 border border-purple-500/50 shadow-sm'
                      : 'bg-slate-700/90 hover:bg-slate-650 text-white border border-slate-600'
                  }`}
                >
                  <span className="text-base sm:text-lg tracking-wider">
                    {card.text}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer Inputs Section */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-300">
          回答欄（正解タイトルを当てよう）
        </h3>

        <div className="space-y-3">
          {Array.from({ length: level }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 min-w-[50px]">
                回答 {idx + 1}
              </span>
              <input
                type="text"
                value={userAnswers[idx] || ''}
                onChange={(e) => onAnswerChange(idx, e.target.value)}
                placeholder={`作品タイトル${idx + 1}`}
                className="flex-1 px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>
          ))}
        </div>

        {/* FINAL ANSWER Submit Button */}
        <button
          onClick={onSubmitAnswer}
          className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:via-rose-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-lg tracking-wider"
        >
          <Send className="w-5 h-5" />
          <span>FINAL ANSWER</span>
        </button>
      </div>
    </div>
  );
};
