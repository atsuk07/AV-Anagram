import { describe, it, expect } from 'vitest';
import {
  splitIntoChars,
  createAnagramCards,
  groupSelectedCards,
  ungroupCard,
  toggleCardSelection,
  toggleCardUsed,
  reorderCards,
  getCardContainerId,
  moveCardContainer,
  getAnswerTextForContainer,
  getUserAnswersFromCards,
  checkAnswers,
} from '../utils/gameLogic';
import { CardItem } from '../types/game';

describe('gameLogic', () => {
  it('splits titles into characters correctly', () => {
    expect(splitIntoChars('女優作品')).toEqual(['女', '優', '作', '品']);
  });

  it('combines and shuffles characters for anagram cards', () => {
    const titles = ['ABC', 'DEF'];
    const cards = createAnagramCards(titles);

    expect(cards.length).toBe(6);
    const charList = cards.map(c => c.text).sort();
    expect(charList).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  it('reorders cards correctly', () => {
    const initialCards: CardItem[] = [
      { id: '1', text: 'A', isGroup: false, isSelected: false, isUsed: false },
      { id: '2', text: 'B', isGroup: false, isSelected: false, isUsed: false },
      { id: '3', text: 'C', isGroup: false, isSelected: false, isUsed: false },
    ];

    const reordered = reorderCards(initialCards, 0, 2);
    expect(reordered.map(c => c.text)).toEqual(['B', 'C', 'A']);
  });

  it('groups selected cards correctly', () => {
    const initialCards: CardItem[] = [
      { id: '1', text: '女', isGroup: false, isSelected: true, isUsed: false },
      { id: '2', text: '優', isGroup: false, isSelected: true, isUsed: false },
      { id: '3', text: '作', isGroup: false, isSelected: false, isUsed: false },
    ];

    const grouped = groupSelectedCards(initialCards);
    expect(grouped.length).toBe(2);
    expect(grouped[0].text).toBe('女優');
    expect(grouped[0].isGroup).toBe(true);
    expect(grouped[0].isSelected).toBe(false);
    expect(grouped[1].text).toBe('作');
  });

  it('ungroups a grouped card into individual characters', () => {
    const initialCards: CardItem[] = [
      { id: 'g1', text: '女優', isGroup: true, isSelected: false, isUsed: false },
      { id: '3', text: '作', isGroup: false, isSelected: false, isUsed: false },
    ];

    const ungrouped = ungroupCard(initialCards, 'g1');
    expect(ungrouped.length).toBe(3);
    expect(ungrouped[0].text).toBe('女');
    expect(ungrouped[0].isGroup).toBe(false);
    expect(ungrouped[1].text).toBe('優');
    expect(ungrouped[1].isGroup).toBe(false);
    expect(ungrouped[2].text).toBe('作');
  });

  it('toggles selection and used flags correctly', () => {
    const cards: CardItem[] = [
      { id: '1', text: 'A', isGroup: false, isSelected: false, isUsed: false },
    ];

    const selected = toggleCardSelection(cards, '1');
    expect(selected[0].isSelected).toBe(true);

    const used = toggleCardUsed(cards, '1');
    expect(used[0].isUsed).toBe(true);
  });

  describe('container movement and answer building', () => {
    it('returns default pool container if containerId is not set', () => {
      const card: CardItem = { id: '1', text: 'A', isGroup: false, isSelected: false, isUsed: false };
      expect(getCardContainerId(card)).toBe('pool');
    });

    it('moves card from pool to answer container', () => {
      const initialCards: CardItem[] = [
        { id: '1', text: '女', isGroup: false, isSelected: false, isUsed: false, containerId: 'pool' },
        { id: '2', text: '優', isGroup: false, isSelected: false, isUsed: false, containerId: 'pool' },
      ];

      const moved = moveCardContainer(initialCards, 'pool', 0, 'answer-0', 0);
      expect(moved.find(c => c.id === '1')?.containerId).toBe('answer-0');
      expect(getAnswerTextForContainer(moved, 'answer-0')).toBe('女');
      expect(getAnswerTextForContainer(moved, 'pool')).toBe('優');
    });

    it('moves card from answer container back to pool', () => {
      const initialCards: CardItem[] = [
        { id: '1', text: '女', isGroup: false, isSelected: false, isUsed: false, containerId: 'answer-0' },
        { id: '2', text: '優', isGroup: false, isSelected: false, isUsed: false, containerId: 'pool' },
      ];

      const moved = moveCardContainer(initialCards, 'answer-0', 0, 'pool', 1);
      expect(moved.find(c => c.id === '1')?.containerId).toBe('pool');
      expect(getAnswerTextForContainer(moved, 'answer-0')).toBe('');
      expect(getAnswerTextForContainer(moved, 'pool')).toBe('優女');
    });

    it('reorders cards inside an answer container', () => {
      const initialCards: CardItem[] = [
        { id: '1', text: '優', isGroup: false, isSelected: false, isUsed: false, containerId: 'answer-0' },
        { id: '2', text: '女', isGroup: false, isSelected: false, isUsed: false, containerId: 'answer-0' },
      ];

      const reordered = moveCardContainer(initialCards, 'answer-0', 0, 'answer-0', 1);
      expect(getAnswerTextForContainer(reordered, 'answer-0')).toBe('女優');
    });

    it('extracts answers array for all level containers', () => {
      const cards: CardItem[] = [
        { id: '1', text: '女', isGroup: false, isSelected: false, isUsed: false, containerId: 'answer-0' },
        { id: '2', text: '優', isGroup: false, isSelected: false, isUsed: false, containerId: 'answer-0' },
        { id: '3', text: '作', isGroup: false, isSelected: false, isUsed: false, containerId: 'answer-1' },
        { id: '4', text: '品', isGroup: false, isSelected: false, isUsed: false, containerId: 'answer-1' },
      ];

      const answers = getUserAnswersFromCards(cards, 2);
      expect(answers).toEqual(['女優', '作品']);
    });
  });

  describe('checkAnswers', () => {
    it('returns true for exact order match', () => {
      expect(checkAnswers(['タイトル1', 'タイトル2'], ['タイトル1', 'タイトル2'])).toBe(true);
    });

    it('returns true for reverse order match (order independence)', () => {
      expect(checkAnswers(['タイトル2', 'タイトル1'], ['タイトル1', 'タイトル2'])).toBe(true);
    });

    it('returns false for incorrect titles', () => {
      expect(checkAnswers(['タイトル1', '間違え'], ['タイトル1', 'タイトル2'])).toBe(false);
    });

    it('handles extra whitespace cleanly', () => {
      expect(checkAnswers([' タイトル1 ', 'タイトル2'], ['タイトル1', 'タイトル2'])).toBe(true);
    });
  });
});
