export interface CardItem {
  id: string;
  text: string;
  isGroup: boolean;
  isSelected: boolean;
  isUsed: boolean;
  containerId?: string; // 'pool' | 'answer-0' | 'answer-1' | 'answer-2'
}

export type Level = 1 | 2 | 3;

export interface GameState {
  level: Level;
  titles: string[];
  cards: CardItem[];
  userAnswers: string[];
  isSubmitted: boolean;
  isCorrect: boolean | null;
}
