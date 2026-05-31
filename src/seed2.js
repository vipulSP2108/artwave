import { STORAGE_KEYS } from './constants';

export const forceLive = () => {
  try {
    const cycles = JSON.parse(localStorage.getItem(STORAGE_KEYS.CYCLES) || '[]');
    cycles.forEach(c => {
      if (c.categoryId === 'story' && c.phase !== 'archive') {
        c.phase = 'live';
      }
    });
    localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(cycles));
    console.log('Forced story cycle to live!');
  } catch(e) {
    console.error(e);
  }
};
