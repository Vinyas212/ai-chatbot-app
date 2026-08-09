// src/services/aiService.js
//
// Talks to OpenAI and Gemini. Gemini also supports sending an image
// alongside text (Gemini's "vision" capability, free tier included).

import { OPENAI_API_KEY, GEMINI_API_KEY } from '../utils/config';

const OPENAI_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

const SYSTEM_PROMPT = 'You are a helpful, friendly assistant inside a mobile app.';

async function getOpenAIResponse(messages) {
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.map(m => ({ role: m.role, content: m.content }))],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error('No reply returned from OpenAI');
  return reply.trim();
}

/**
 * @param {Array<{role, content}>} messages
 * @param {{base64: string, mimeType: string}|null} imageAttachment - optional image on the LAST user message
 */
async function getGeminiResponse(messages, imageAttachment = null) {
  const contents = messages.map((m, idx) => {
    const parts = [];
    if (m.content) parts.push({ text: m.content });

    const isLastMessage = idx === messages.length - 1;
    if (isLastMessage && imageAttachment && m.role === 'user') {
      parts.push({
        inlineData: {
          mimeType: imageAttachment.mimeType,
          data: imageAttachment.base64,
        },
      });
    }

    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) throw new Error('No reply returned from Gemini');
  return reply.trim();
}

async function judgeBetterReply(userQuestion, replyA, replyB) {
  try {
    const judgePrompt = `A user asked: "${userQuestion}"

Response 1: "${replyA}"

Response 2: "${replyB}"

Which response is more helpful, accurate, and clear? Reply with ONLY the single digit 1 or 2, nothing else.`;

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: judgePrompt }] }],
        generationConfig: { maxOutputTokens: 5, temperature: 0 },
      }),
    });

    const data = await response.json();
    const verdict = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return verdict === '2' ? '2' : '1';
  } catch (error) {
    console.error('Judge call failed, defaulting to response 1:', error);
    return '1';
  }
}

/**
 * @param {Array<{role, content}>} messages
 * @param {{base64: string, mimeType: string}|null} imageAttachment
 * @returns {Promise<{text: string, source: string}>}
 */
export async function getAIResponse(messages, imageAttachment = null) {
  // If an image is attached, go straight to Gemini (supports vision for
  // free) — skip the dual-AI comparison since OpenAI would need a
  // different image format and it's not worth the extra complexity here.
  if (imageAttachment) {
    const text = await getGeminiResponse(messages, imageAttachment);
    return { text, source: 'Gemini (image)' };
  }

  const lastUserMessage = messages[messages.length - 1]?.content ?? '';

  const [openaiResult, geminiResult] = await Promise.allSettled([
    getOpenAIResponse(messages),
    getGeminiResponse(messages),
  ]);

  const openaiOk = openaiResult.status === 'fulfilled';
  const geminiOk = geminiResult.status === 'fulfilled';

  if (openaiOk && !geminiOk) {
    return { text: openaiResult.value, source: 'Groq' };
  }
  if (!openaiOk && geminiOk) {
    return { text: geminiResult.value, source: 'Gemini' };
  }
  if (!openaiOk && !geminiOk) {
    console.error('OpenAI error:', openaiResult.reason);
    console.error('Gemini error:', geminiResult.reason);
    throw new Error(
      'Both AI services failed. Check your API keys in config.js and your internet connection.'
    );
  }

  const winner = await judgeBetterReply(
    lastUserMessage,
    openaiResult.value,
    geminiResult.value
  );

  return winner === '2'
    ? { text: geminiResult.value, source: 'Gemini' }
    : { text: openaiResult.value, source: 'Groq' };
}