import { STORAGE_KEYS } from './constants';
import { genId, now, addDays } from './utils';

export const seedStories = () => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
    if (existing.some(s => s.categoryId === 'story')) return;

    // We need an active cycle for 'story'
    const cycles = JSON.parse(localStorage.getItem(STORAGE_KEYS.CYCLES) || '[]');
    let cycle = cycles.find(c => c.categoryId === 'story' && c.phase === 'live');
    if (!cycle) {
      cycle = {
        id: genId('cyc'), categoryId: 'story', phase: 'live',
        createdAt: now(), start: now(), end: addDays(now(), 30)
      };
      cycles.push(cycle);
      localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(cycles));
    }

    const stories = [
      {
        id: genId('sub'), categoryId: 'story', cycleId: cycle.id, userId: 'user1',
        status: 'approved', title: 'Short Poem',
        text: 'The sun is bright,\nThe sky is blue,\nI like the light,\nAnd so do you.',
        createdAt: now(), score: 10, isLate: false, tags: ['poem', 'nature']
      },
      {
        id: genId('sub'), categoryId: 'story', cycleId: cycle.id, userId: 'user2',
        status: 'approved', title: 'A Medium Story with more text to take up space',
        text: 'Once upon a time, there was a developer who needed to test a UI. They decided to write a medium length story. It was not too short, but not too long either. It had just enough text to wrap onto a few lines and see how the masonry layout handled different heights. The developer was happy with the result.',
        createdAt: now(), score: 15, isLate: false, tags: ['fiction', 'test']
      },
      {
        id: genId('sub'), categoryId: 'story', cycleId: cycle.id, userId: 'user3',
        status: 'approved', title: 'Very Long Story Title That Might Wrap Multiple Lines Because It Is So Long',
        text: 'This is a much longer story. '.repeat(20) + '\n\n' + 'It even has multiple paragraphs. '.repeat(10) + '\n\n' + 'This should definitely take up a lot of vertical space in the UI, testing the limits of the text preview and the card height. If the UI is built correctly, it should handle this gracefully, perhaps by truncating the text or using a masonry layout to fit it in nicely with the shorter stories.',
        createdAt: now(), score: 5, isLate: false, tags: ['long', 'story']
      },
      {
        id: genId('sub'), categoryId: 'story', cycleId: cycle.id, userId: 'user4',
        status: 'approved', title: 'One Liner',
        text: 'Just a single line of text.',
        createdAt: now(), score: 20, isLate: false, tags: ['short']
      }
    ];

    existing.push(...stories);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(existing));
    
    // Also create some mock users if needed
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    ['user1', 'user2', 'user3', 'user4'].forEach((u, i) => {
      if (!users.find(x => x.id === u)) {
        users.push({ id: u, username: `Author${i+1}`, role: 'user', joinedAt: now() });
      }
    });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    console.log('Seeded stories!');
  } catch(e) {
    console.error(e);
  }
};
