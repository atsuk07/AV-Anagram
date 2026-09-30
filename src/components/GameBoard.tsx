import React, { useState } from 'react';
import { CardItem, Level } from '../types/game';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Layers,
  Ungroup,
  RotateCcw,
  Send,
  GripVertical,
  Share2,
  Check,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
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

interface SortableCardProps {
  card: CardItem;
  index: number;
  onToggleSelect: (id: string) => void;
  onToggleUsed: (id: string) => void;
  onQuickMove: (card: CardItem, index: number) => void;
}

const SortableCardItem: React.FC<SortableCardProps> = ({
  card,
  index,
  onToggleSelect,
  onToggleUsed,
  onQuickMove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const currentContainer = getCardContainerId(card);
  const isInPool = currentContainer === 'pool';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col items-center justify-between rounded-xl transition-all duration-150 select-none bg-slate-800 border ${
        isDragging
          ? 'shadow-2xl ring-2 ring-purple-400 z-50 opacity-40 scale-105 border-purple-400'
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

        {/* Quick Move Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickMove(card, index);
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

      {/* Drag Handle & Card Text */}
      <div
        {...attributes}
        {...listeners}
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
  );
};

interface DroppableZoneProps {
  id: string;
  items: CardItem[];
  children: React.ReactNode;
  placeholderText?: string;
  className?: string;
}

const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  items,
  children,
  placeholderText,
  className,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <SortableContext
      items={items.map((item) => item.id)}
      strategy={rectSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className={`${className} ${
          isOver ? 'ring-2 ring-purple-500/50 bg-slate-900/90 border-purple-500/50' : ''
        }`}
      >
        {items.length === 0 && placeholderText && (
          <p className="text-xs text-slate-500 w-full text-center py-6 select-none">
            {placeholderText}
          </p>
        )}
        {children}
      </div>
    </SortableContext>
  );
};

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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedCards = cards.filter((c) => c.isSelected);
  const canGroup = selectedCards.length > 1;

  const singleSelectedGroupCard =
    selectedCards.length === 1 && selectedCards[0].isGroup
      ? selectedCards[0]
      : null;

  const poolCards = cards.filter((c) => getCardContainerId(c) === 'pool');

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

  const handleQuickMove = (card: CardItem, sourceIndex: number) => {
    const currentContainer = getCardContainerId(card);
    if (currentContainer === 'pool') {
      const destContainer = 'answer-0';
      const destCards = cards.filter(
        (c) => getCardContainerId(c) === destContainer
      );
      onMoveCardContainer('pool', sourceIndex, destContainer, destCards.length);
    } else {
      onMoveCardContainer(
        currentContainer,
        sourceIndex,
        'pool',
        poolCards.length
      );
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    if (activeIdStr === overIdStr) return;

    const activeCard = cards.find((c) => c.id === activeIdStr);
    if (!activeCard) return;

    const activeContainer = getCardContainerId(activeCard);

    let overContainer = overIdStr;
    const overCard = cards.find((c) => c.id === overIdStr);
    if (overCard) {
      overContainer = getCardContainerId(overCard);
    }

    if (activeContainer !== overContainer) {
      const activeItems = cards.filter(
        (c) => getCardContainerId(c) === activeContainer
      );
      const sourceIndex = activeItems.findIndex((c) => c.id === activeIdStr);

      let targetIndex = 0;
      if (overCard) {
        const overItems = cards.filter(
          (c) => getCardContainerId(c) === overContainer
        );
        targetIndex = overItems.findIndex((c) => c.id === overIdStr);
      } else {
        const overItems = cards.filter(
          (c) => getCardContainerId(c) === overContainer
        );
        targetIndex = overItems.length;
      }

      if (sourceIndex !== -1) {
        onMoveCardContainer(
          activeContainer,
          sourceIndex,
          overContainer,
          targetIndex
        );
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const activeCard = cards.find((c) => c.id === activeIdStr);
    if (!activeCard) return;

    const activeContainer = getCardContainerId(activeCard);

    let overContainer = overIdStr;
    const overCard = cards.find((c) => c.id === overIdStr);
    if (overCard) {
      overContainer = getCardContainerId(overCard);
    }

    const containerCards = cards.filter(
      (c) => getCardContainerId(c) === activeContainer
    );
    const sourceIndex = containerCards.findIndex((c) => c.id === activeIdStr);

    let targetIndex = 0;
    if (overCard) {
      targetIndex = containerCards.findIndex((c) => c.id === overIdStr);
    } else {
      targetIndex = containerCards.length - 1;
    }

    if (
      sourceIndex !== -1 &&
      targetIndex !== -1 &&
      sourceIndex !== targetIndex
    ) {
      onMoveCardContainer(
        activeContainer,
        sourceIndex,
        overContainer,
        targetIndex
      );
    }
  };

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
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
          <DroppableZone
            id="pool"
            items={poolCards}
            placeholderText="すべてのカードが回答欄に配置されています"
            className="flex flex-wrap gap-2.5 sm:gap-3 justify-center min-h-[120px] p-4 bg-slate-900/60 rounded-xl border border-slate-700/50 transition-colors"
          >
            {poolCards.map((card, index) => (
              <SortableCardItem
                key={card.id}
                card={card}
                index={index}
                onToggleSelect={onToggleSelect}
                onToggleUsed={onToggleUsed}
                onQuickMove={handleQuickMove}
              />
            ))}
          </DroppableZone>
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
                          組み立てタイトル:{' '}
                          <span className="text-pink-300 font-bold text-sm ml-1">
                            {assembledText}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">未配置</span>
                      )}
                    </div>
                  </div>

                  <DroppableZone
                    id={containerId}
                    items={answerCards}
                    placeholderText="ここにカードをドラッグ＆ドロップ（またはカードの矢印ボタン）"
                    className="flex flex-wrap gap-2.5 items-center min-h-[90px] p-3 rounded-lg border border-dashed border-slate-700 bg-slate-950/50 transition-colors"
                  >
                    {answerCards.map((card, index) => (
                      <SortableCardItem
                        key={card.id}
                        card={card}
                        index={index}
                        onToggleSelect={onToggleSelect}
                        onToggleUsed={onToggleUsed}
                        onQuickMove={handleQuickMove}
                      />
                    ))}
                  </DroppableZone>
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

        {/* Drag Overlay for floating preview */}
        <DragOverlay>
          {activeCard ? (
            <div className="flex flex-col items-center justify-between rounded-xl bg-slate-800 border-2 border-purple-400 shadow-2xl scale-105 select-none opacity-90">
              <div className="w-full pt-1.5 pb-1 px-2 flex justify-between items-center bg-slate-900/40 rounded-t-xl border-b border-slate-700/50">
                <input
                  type="checkbox"
                  checked={activeCard.isUsed}
                  readOnly
                  className="w-3.5 h-3.5 rounded text-pink-600 bg-slate-800 border-slate-600"
                />
              </div>
              <div
                className={`px-4 py-2.5 w-full rounded-b-xl font-bold text-center flex items-center justify-center min-w-[48px] gap-1.5 ${
                  activeCard.isGroup
                    ? 'bg-gradient-to-br from-purple-900 to-indigo-900 text-purple-200'
                    : 'bg-slate-700 text-white'
                }`}
              >
                <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-lg tracking-wider">{activeCard.text}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
