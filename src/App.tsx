import React, { useState } from 'react';
import { TitleInput } from './components/TitleInput';
import { GameBoard } from './components/GameBoard';
import { ResultModal } from './components/ResultModal';
import { Level, GameState } from './types/game';
import {
  createAnagramCards,
  toggleCardSelection,
  toggleCardUsed,
  groupSelectedCards,
  ungroupCard,
  checkAnswers,
} from './utils/gameLogic';

export default function App() {
  const [stage, setStage] = useState<'input' | 'playing'>('input');
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    titles: [],
    cards: [],
    userAnswers: [],
    isSubmitted: false,
    isCorrect: null,
  });

  const handleStartGame = (level: Level, titles: string[]) => {
    const cards = createAnagramCards(titles);
    setGameState({
      level,
      titles,
      cards,
      userAnswers: Array(level).fill(''),
      isSubmitted: false,
      isCorrect: null,
    });
    setStage('playing');
  };

  const handleToggleSelect = (cardId: string) => {
    setGameState((prev) => ({
      ...prev,
      cards: toggleCardSelection(prev.cards, cardId),
    }));
  };

  const handleToggleUsed = (cardId: string) => {
    setGameState((prev) => ({
      ...prev,
      cards: toggleCardUsed(prev.cards, cardId),
    }));
  };

  const handleGroupSelected = () => {
    setGameState((prev) => ({
      ...prev,
      cards: groupSelectedCards(prev.cards),
    }));
  };

  const handleUngroup = (cardId: string) => {
    setGameState((prev) => ({
      ...prev,
      cards: ungroupCard(prev.cards, cardId),
    }));
  };

  const handleAnswerChange = (index: number, value: string) => {
    setGameState((prev) => {
      const updated = [...prev.userAnswers];
      updated[index] = value;
      return { ...prev, userAnswers: updated };
    });
  };

  const handleSubmitAnswer = () => {
    const isCorrect = checkAnswers(gameState.userAnswers, gameState.titles);
    setGameState((prev) => ({
      ...prev,
      isSubmitted: true,
      isCorrect,
    }));
  };

  const handleReset = () => {
    setStage('input');
    setGameState({
      level: 1,
      titles: [],
      cards: [],
      userAnswers: [],
      isSubmitted: false,
      isCorrect: null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 font-sans antialiased">
      <header className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 inline-block">
          AVアナグラム
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          シャッフルされた文字から元のAVタイトルを推測する無料アナグラムゲーム
        </p>
      </header>

      <main className="container mx-auto">
        {stage === 'input' ? (
          <TitleInput onStartGame={handleStartGame} />
        ) : (
          <GameBoard
            level={gameState.level}
            cards={gameState.cards}
            userAnswers={gameState.userAnswers}
            onToggleSelect={handleToggleSelect}
            onToggleUsed={handleToggleUsed}
            onGroupSelected={handleGroupSelected}
            onUngroup={handleUngroup}
            onAnswerChange={handleAnswerChange}
            onSubmitAnswer={handleSubmitAnswer}
            onReset={handleReset}
          />
        )}

        {gameState.isSubmitted && gameState.isCorrect !== null && (
          <ResultModal
            isCorrect={gameState.isCorrect}
            correctTitles={gameState.titles}
            userAnswers={gameState.userAnswers}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="mt-12 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} AVアナグラム. Client-side only. No AI API required.
      </footer>
    </div>
  );
}
