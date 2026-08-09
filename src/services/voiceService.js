// src/services/voiceService.js
//
// Speech-to-text using Groq's free Whisper API — the same Groq key
// already stored in config.js (in the OPENAI_API_KEY slot) works here.

import { OPENAI_API_KEY } from '../utils/config';

const GROQ_TRANSCRIBE_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

/**
 * @param {string} uri - local file uri of the recorded audio (from expo-audio)
 * @returns {Promise<string>} transcribed text
 */
export async function transcribeAudio(uri) {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'recording.m4a',
    type: 'audio/m4a',
  });
  formData.append('model', 'whisper-large-v3-turbo');

  const response = await fetch(GROQ_TRANSCRIBE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Transcription error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  if (!data.text) throw new Error('No transcription returned');
  return data.text.trim();
}