import React, { useState } from 'react';
import { CardItem, Level } from '../types/game';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { Layers, Ungroup, RotateCcw, Send, GripVertical, Share2, Check, ArrowDown, ArrowUp } from 'lucide-react';
import { generateShareUrl } from '../utils/share';
import { getCardContainerId } from '../utils/gameLogic';

interface GameBoardProps {
  level: Level;
  titles: string[];
  cards: CardItem[];
  userAnswers: string[];
  onToggleSelect: (cardId: string) => void;
  onToggleUsed: (cardId: string) => void;
  onGroupSelected: () => void;
  onUngroup: (cardId: string) => void;
  onMoveCardContainer: (
    sourceDroppableId: string,
    sourceIndex: number,
    destDroppableId: string,
    destIndex: number
  ) => void;
  onSubmitAnswer: () => void;
  onReset: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  level,
  titles,
  cards,
  userAnswers,
  onToggleSelect,
  onToggleUsed,
  onGroupSelected,
  onUngroup,
  onMoveCardContainer,
  onSubmitAnswer,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const selectedCards = cards.filter((c) => c.isSelected);
  const canGroup = selectedCards.length > 1;

  // Single selected group card for ungrouping option
  const singleSelectedGroupCard =
    selectedCards.length === 1 && selectedCards[0].isGroup
      ? selectedCards[0]
      : null;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    onMoveCardContainer(
      source.droppableId,
      source.index,
      destination.droppableId,
      destination.index
    );
  };

  const handleCopyShareUrl = async () => {
    const url = generateShareUrl(level, titles);
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy share URL:', err);
    }
  };

  const poolCards = cards.filter((c) => getCardContainerId(c) === 'pool');

  const handleQuickMove = (card: CardItem, sourceIndex: number) => {
    const currentContainer = getCardContainerId(card);
    if (currentContainer === 'pool') {
      // Find first answer box or answer-0
      const destContainer = 'answer-0';
      const destCards = cards.filter(c => getCardContainerId(c) === destContainer);
      onMoveCardContainer('pool', sourceIndex, destContainer, destCards.length);
    } else {
      // Move back to pool
      onMoveCardContainer(currentContainer, sourceIndex, 'pool', poolCards.length);
    }
  };

  const renderCardItem = (card: CardItem, index: number) => {
    const currentContainer = getCardContainerId(card);
    const isInPool = currentContainer === 'pool';

    return (
      <Draggable key={card.id} draggableId={card.id} index={index}>
        {(draggableProvided, snapshot) => (
          <div
            ref={draggableProvided.innerRef}
            {...draggableProvided.draggableProps}
            className={`flex flex-col items-center justify-between rounded-xl transition-all duration-150 select-none bg-slate-800 border ${
              snapshot.isDragging
                ? 'shadow-2xl ring-2 ring-purple-400 z-50 opacity-90 scale-105 border-purple-400'
                : 'border-slate-700'
            } ${
              card.isSelected
                ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-slate-900 scale-[1.03]'
                : ''
            }`}
          >
            {/* Top Bar with Checkbox & Quick Move Button */}
            <div className="w-full pt-1.5 pb-1 px-2 flex justify-between items-center bg-slate-900/40 rounded-t-xl border-b border-slate-700/50">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleUsed(card.id);
                }}
                title={card.isUsed ? '未使用に戻す' : '使用済みにする'}
                className="flex items-center cursor-pointer p-0.5 hover:bg-slate-700/50 rounded"
              >
                <input
                  type="checkbox"
                  checked={card.isUsed}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-500 bg-slate-800 border-slate-600 cursor-pointer"
                />
              </div>

              {/* Quick Move Button for Tap/Click accessibility */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickMove(card, index);
                }}
                title={isInPool ? '回答欄1へ移動' : 'プールへ戻す'}
                className="p-1 text-slate-400 hover:text-pink-400 hover:bg-slate-700/60 rounded transition-colors"
              >
                {isInPool ? (
                  <ArrowDown className="w-3.5 h-3.5" />
                ) : (
                  <ArrowUp className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Drag Handle & Card Body */}
            <div
              {...draggableProvided.dragHandleProps}
              onClick={() => onToggleSelect(card.id)}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 w-full rounded-b-xl font-bold text-center transition-all cursor-grab active:cursor-grabbing flex items-center justify-center min-w-[48px] gap-1.5 ${
                card.isUsed
                  ? 'bg-slate-800/40 text-slate-500 line-through opacity-60'
                  : card.isGroup
                  ? 'bg-gradient-to-br from-purple-900/90 to-indigo-900/90 text-purple-200 shadow-sm'
                  : 'bg-slate-700/90 hover:bg-slate-650 text-white'
              }`}
            >
              <GripVertical className="w-3.5 h-3.5 text-slate-400 opacity-60" />
              <span className="text-base sm:text-lg tracking-wider">
                {card.text}
              </span>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
        <div>
          <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider block">
            Difficulty
          </span>
          <h2 className="text-lg font-bold text-white">
            Lv.{level} （{level === 1 ? '1タイトル' : `${level}タイトル`}）
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            onClick={handleCopyShareUrl}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-md shadow-pink-600/20'
            }`}
          >
            {copied ? (
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

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>タイトル入力に戻る</span>
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Cards Display Section (Card Pool) */}
        <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300">
              文字プール（ドラッグ＆ドロップまたは矢印ボタンで回答欄へ移動 / タップで選択）
            </h3>
            <span className="text-xs text-slate-400">
              プール内: {poolCards.length} / 全{cards.length}文字
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

          {/* Drag and Drop Container for Card Pool */}
          <Droppable droppableId="pool" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex flex-wrap gap-2.5 sm:gap-3 justify-center min-h-[120px] p-4 rounded-xl border transition-colors ${
                  snapshot.isDraggingOver
                    ? 'bg-slate-900/90 border-purple-500/50 ring-2 ring-purple-500/30'
                    : 'bg-slate-900/60 border-slate-700/50'
                }`}
              >
                {poolCards.length === 0 && !snapshot.isDraggingOver && (
                  <p className="text-xs text-slate-500 w-full text-center py-8 select-none">
                    すべてのカードが回答欄に配置されています
                  </p>
                )}
                {poolCards.map((card, index) => renderCardItem(card, index))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Answer Drop Zones Section */}
        <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300">
              回答エリア（カードをドロップしてタイトルを作成）
            </h3>
            <span className="text-xs text-slate-400">
              カードをドラッグまたは矢印でプールに戻せます
            </span>
          </div>

          <div className="space-y-4">
            {Array.from({ length: level }).map((_, idx) => {
              const containerId = `answer-${idx}`;
              const answerCards = cards.filter(
                (c) => getCardContainerId(c) === containerId
              );
              const assembledText = userAnswers[idx] || '';

              return (
                <div
                  key={containerId}
                  className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-400 px-2 py-0.5 bg-pink-500/10 rounded border border-pink-500/20">
                      回答 {idx + 1}
                    </span>
                    <div className="text-xs text-slate-300 font-medium">
                      {assembledText ? (
                        <span>
                          組み立てタイトル: <span className="text-pink-300 font-bold text-sm ml-1">{assembledText}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">未配置</span>
                      )}
                    </div>
                  </div>

                  <Droppable droppableId={containerId} direction="horizontal">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-wrap gap-2.5 items-center min-h-[90px] p-3 rounded-lg border border-dashed transition-all ${
                          snapshot.isDraggingOver
                            ? 'bg-pink-950/30 border-pink-500 ring-2 ring-pink-500/20'
                            : 'bg-slate-950/50 border-slate-700'
                        }`}
                      >
                        {answerCards.length === 0 && !snapshot.isDraggingOver && (
                          <p className="text-xs text-slate-500 w-full text-center py-4 select-none">
                            ここにカードをドラッグ＆ドロップ（またはカードの矢印ボタン）
                          </p>
                        )}
                        {answerCards.map((card, index) => renderCardItem(card, index))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
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
      </DragDropContext>
    </div>
  );
};
