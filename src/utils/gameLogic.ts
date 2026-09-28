import { CardItem } from '../types/game';

/**
 * Split text into array of characters (supports unicode/emoji correctly if needed)
 */
export function splitIntoChars(text: string): string[] {
  return Array.from(text);
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Creates initial CardItems from input titles.
 * All characters from all titles are merged together and shuffled randomly.
 */
export function createAnagramCards(titles: string[]): CardItem[] {
  const combinedChars: string[] = [];
  titles.forEach(title => {
    const chars = splitIntoChars(title);
    combinedChars.push(...chars);
  });

  const shuffledChars = shuffleArray(combinedChars);

  return shuffledChars.map((char, index) => ({
    id: `card-${index}-${Math.random().toString(36).substring(2, 9)}`,
    text: char,
    isGroup: false,
    isSelected: false,
    isUsed: false,
  }));
}

/**
 * Groups selected cards together in order of their appearance in the cards array.
 */
export function groupSelectedCards(cards: CardItem[]): CardItem[] {
  const selectedCards = cards.filter(c => c.isSelected);
  if (selectedCards.length <= 1) {
    return cards; // Nothing to group
  }

  const groupedText = selectedCards.map(c => c.text).join('');
  const firstSelectedIndex = cards.findIndex(c => c.isSelected);

  const newGroupCard: CardItem = {
    id: `group-${Math.random().toString(36).substring(2, 9)}`,
    text: groupedText,
    isGroup: true,
    isSelected: false,
    isUsed: false,
  };

  const newCards: CardItem[] = [];
  let inserted = false;

  cards.forEach((card, idx) => {
    if (card.isSelected) {
      if (!inserted && idx === firstSelectedIndex) {
        newCards.push(newGroupCard);
        inserted = true;
      }
    } else {
      newCards.push(card);
    }
  });

  return newCards;
}

/**
 * Ungroups a grouped card back into individual single-character cards.
 */
export function ungroupCard(cards: CardItem[], targetCardId: string): CardItem[] {
  const targetCard = cards.find(c => c.id === targetCardId);
  if (!targetCard || !targetCard.isGroup) {
    return cards;
  }

  const chars = splitIntoChars(targetCard.text);
  const unstackedCards: CardItem[] = chars.map((char, index) => ({
    id: `card-${index}-${Math.random().toString(36).substring(2, 9)}`,
    text: char,
    isGroup: false,
    isSelected: false,
    isUsed: targetCard.isUsed, // Preserve used status or reset
  }));

  const targetIndex = cards.findIndex(c => c.id === targetCardId);
  const newCards = [...cards];
  newCards.splice(targetIndex, 1, ...unstackedCards);

  return newCards;
}

/**
 * Toggles the selection state of a card for grouping.
 */
export function toggleCardSelection(cards: CardItem[], cardId: string): CardItem[] {
  return cards.map(card => {
    if (card.id === cardId) {
      return { ...card, isSelected: !card.isSelected };
    }
    return card;
  });
}

/**
 * Toggles the used checkbox state of a card.
 */
export function toggleCardUsed(cards: CardItem[], cardId: string): CardItem[] {
  return cards.map(card => {
    if (card.id === cardId) {
      return { ...card, isUsed: !card.isUsed };
    }
    return card;
  });
}

/**
 * Validates user answers against expected titles.
 * Order-independent matching: user answers can match expected titles in any permutation.
 */
export function checkAnswers(userAnswers: string[], targetTitles: string[]): boolean {
  if (userAnswers.length !== targetTitles.length) {
    return false;
  }

  const normalizedUser = userAnswers.map(a => a.trim());
  const normalizedTargets = targetTitles.map(t => t.trim());

  // Copy target array to track unmatched titles
  const remainingTargets = [...normalizedTargets];

  for (const answer of normalizedUser) {
    const matchIndex = remainingTargets.indexOf(answer);
    if (matchIndex === -1) {
      return false; // No matching target title found
    }
    remainingTargets.splice(matchIndex, 1);
  }

  return remainingTargets.length === 0;
}
