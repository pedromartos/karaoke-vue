import { defineStore } from 'pinia';
import API from '../api';

export type MusicState = {
};

export const useMusicStore = defineStore('music', {
  state: () =>
    ({

    } as MusicState),
  getters: {},
  actions: {
    getLyrics() {
      return API().get('/lyrics.json')
    }
  }
});
