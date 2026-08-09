// src/utils/storage.js
//
// Stores MULTIPLE chat sessions (conversations), not just one. Each
// session looks like: { id, title, messages, updatedAt }.

import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = '@chat_sessions_v2';

export async function loadSessions() {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
}

export async function saveSessions(sessions) {
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save sessions:', error);
  }
}

export function createEmptySession() {
  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    title: 'New chat',
    messages: [],
    updatedAt: Date.now(),
  };
}