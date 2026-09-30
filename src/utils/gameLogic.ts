import { CardItem } from '../types/game';

/**
 * Split text into array of characters, excluding all half-width and full-width spaces
 */
export function splitIntoChars(text: string): string[] {
  const stripped = text.replace(/[\s\u3000]+/g, '');
  return Array.from(stripped);
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
 * Reorders items in a list (drag and drop helper)
 */
export function reorderCards(cards: CardItem[], startIndex: number, endIndex: number): CardItem[] {
  const result = Array.from(cards);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
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
    containerId: 'pool',
  }));
}

/**
 * Returns containerId of card, defaulting to 'pool'
 */
export function getCardContainerId(card: CardItem): string {
  return card.containerId || 'pool';
}

/**
 * Moves a card between containers or reorders within a container.
 */
export function moveCardContainer(
  cards: CardItem[],
  sourceDroppableId: string,
  sourceIndex: number,
  destDroppableId: string,
  destIndex: number
): CardItem[] {
  const sourceItems = cards.filter(c => getCardContainerId(c) === sourceDroppableId);
  const destItems =
    sourceDroppableId === destDroppableId
      ? sourceItems
      : cards.filter(c => getCardContainerId(c) === destDroppableId);

  if (sourceDroppableId === destDroppableId) {
    const reordered = reorderCards(sourceItems, sourceIndex, destIndex);
    const reorderedMap = [...reordered];
    return cards.map(c => {
      if (getCardContainerId(c) === sourceDroppableId) {
        return reorderedMap.shift()!;
      }
      return c;
    });
  }

  const movedItem = { ...sourceItems[sourceIndex], containerId: destDroppableId };
  const newSourceItems = [...sourceItems];
  newSourceItems.splice(sourceIndex, 1);

  const newDestItems = [...destItems];
  newDestItems.splice(destIndex, 0, movedItem);

  let sourcePointer = 0;
  let destPointer = 0;

  const result: CardItem[] = [];

  for (const card of cards) {
    const cId = getCardContainerId(card);
    if (cId === sourceDroppableId) {
      if (sourcePointer < newSourceItems.length) {
        result.push(newSourceItems[sourcePointer++]);
      }
    } else if (cId === destDroppableId) {
      if (destPointer < newDestItems.length) {
        result.push(newDestItems[destPointer++]);
      }
    } else {
      result.push(card);
    }
  }

  while (destPointer < newDestItems.length) {
    result.push(newDestItems[destPointer++]);
  }

  return result;
}

/**
 * Returns concatenated text for all cards in a given container ID.
 */
export function getAnswerTextForContainer(cards: CardItem[], containerId: string): string {
  return cards
    .filter(c => getCardContainerId(c) === containerId)
    .map(c => c.text)
    .join('');
}

/**
 * Returns answer strings for all answer containers up to level count.
 */
export function getUserAnswersFromCards(cards: CardItem[], level: number): string[] {
  const answers: string[] = [];
  for (let i = 0; i < level; i++) {
    answers.push(getAnswerTextForContainer(cards, `answer-${i}`));
  }
  return answers;
}

/**
 * Groups selected cards together in order of their appearance in the cards array.
 */
export function groupSelectedCards(cards: CardItem[]): CardItem[] {
  const selectedCards = cards.filter(c => c.isSelected);
  if (selectedCards.length <= 1) {
    return cards; // Nothing to group
  }

  const firstSelected = selectedCards[0];
  const containerId = getCardContainerId(firstSelected);
  const groupedText = selectedCards.map(c => c.text).join('');
  const firstSelectedIndex = cards.findIndex(c => c.isSelected);

  const newGroupCard: CardItem = {
    id: `group-${Math.random().toString(36).substring(2, 9)}`,
    text: groupedText,
    isGroup: true,
    isSelected: false,
    isUsed: false,
    containerId,
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

  const containerId = getCardContainerId(targetCard);
  const chars = splitIntoChars(targetCard.text);
  const unstackedCards: CardItem[] = chars.map((char, index) => ({
    id: `card-${index}-${Math.random().toString(36).substring(2, 9)}`,
    text: char,
    isGroup: false,
    isSelected: false,
    isUsed: targetCard.isUsed, // Preserve used status or reset
    containerId,
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

  const normalizedUser = userAnswers.map(a => a.replace(/[\s\u3000]+/g, ''));
  const normalizedTargets = targetTitles.map(t => t.replace(/[\s\u3000]+/g, ''));

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
