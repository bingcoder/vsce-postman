import { atom } from 'recoil';

export const settingsOpenState = atom({
  key: 'settingsOpen',
  default: false,
});

export const groupTitleState = atom({
  key: 'groupTitle',
  default: '',
});

export const groupEnvState = atom<any[] | null>({
  key: 'groupEnv',
  default: null,
});
