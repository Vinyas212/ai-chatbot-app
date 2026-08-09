# AI Assistant Chatbot (React Native / Expo)

A mobile chat app where users talk to an AI assistant (OpenAI GPT). Built for the
Global Buzz technical assessment — Option 1: Mobile AI Chatbot.

## Features
- Clean, WhatsApp-style chat interface (user bubbles vs. AI bubbles)
- Integration with OpenAI's chat completion API (swappable for Gemini)
- Chat history persisted locally with AsyncStorage — survives app restarts
- Loading indicator while the AI is "typing"
- Error handling with user-facing alerts (bad API key, network issues, etc.)
- Clear-chat option

## Tech Stack
- React Native + Expo (managed workflow)
- OpenAI Chat Completions API (`gpt-4o-mini`)
- `@react-native-async-storage/async-storage` for local persistence
- `@expo/vector-icons` for icons

## Project Structure
```
ai-chatbot-app/
├── App.js
├── package.json
├── src/
│   ├── screens/
│   │   └── ChatScreen.js       # main screen: input, list, send logic
│   ├── components/
│   │   ├── ChatBubble.js       # single message bubble
│   │   └── TypingIndicator.js  # "AI is typing..." indicator
│   ├── services/
│   │   └── aiService.js        # all API calls to OpenAI live here
│   └── utils/
│       ├── config.js           # API key (DO NOT commit real key)
│       └── storage.js          # AsyncStorage wrapper for chat history
```

## Setup Instructions

1. **Install Node.js** (v18+) if you don't have it: https://nodejs.org

2. **Install Expo CLI globally** (optional, `npx` works without this too):
   ```
   npm install -g expo-cli
   ```

3. **Install dependencies**:
   ```
   cd ai-chatbot-app
   npm install
   ```

4. **Add your OpenAI API key**:
   Open `src/utils/config.js` and replace `YOUR_OPENAI_API_KEY_HERE` with a real
   key from https://platform.openai.com/api-keys

5. **Run the app**:
   ```
   npx expo start
   ```
   Then scan the QR code with the **Expo Go** app on your Android/iOS phone,
   or press `a` for Android emulator / `i` for iOS simulator.

## Using Gemini instead of OpenAI
Google offers a free tier for Gemini which is a good alternative if you don't
have OpenAI credits. To switch:
1. Get a free key at https://aistudio.google.com/apikey
2. In `aiService.js`, replace the `fetch` call with a request to
   `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY`
   and adjust the request/response body shape to match Gemini's format
   (see Google's docs for the exact JSON schema).

## Implementation Notes
- All AI-related networking is isolated in `aiService.js` so the API provider
  can be swapped without touching any UI code.
- Chat history is stored as a JSON array of `{ role, content }` objects —
  the same shape OpenAI expects, so the whole history can be sent back on
  every request for conversational context.
- Errors thrown by `aiService.js` are caught in `ChatScreen.js` and shown via
  a native `Alert`, so the user never sees a silent failure or a crash.

## Third-Party Libraries Used
- `expo` — React Native tooling and managed workflow
- `@react-native-async-storage/async-storage` — local persistence
- `@expo/vector-icons` — icon set (Ionicons)
- OpenAI Chat Completions API — AI model backend
