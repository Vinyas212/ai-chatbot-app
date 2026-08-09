# 20-Day Build Plan — AI Chatbot in React Native

Goal: by Day 20 you don't just have a working app, you understand every file
in it well enough to explain it in an interview. Roughly 1–2 hrs/day.

Every day has: **Learn** (concept) → **Do** (build/type it yourself) → **Check** (how to verify it worked).

---

## Week 1 — Environment + React Native Basics

**Day 1 — Tooling setup**
- Learn: what Node.js, npm, and Expo are and how they relate.
- Do: Install Node.js (v18+), VS Code, and the **Expo Go** app on your phone
  (Play Store / App Store). Install the VS Code extensions: "ES7+ React
  snippets", "Prettier".
- Do: `npx create-expo-app my-test-app`, then `cd my-test-app && npx expo start`,
  scan the QR with Expo Go.
- Check: default Expo screen loads on your phone.

**Day 2 — JSX & core components**
- Learn: `View`, `Text`, `StyleSheet` — RN's building blocks (like `div`/`span`/CSS on web).
- Do: In `App.js` of your test app, render a few `View`s with different
  `backgroundColor`, nested `Text`, and `flexDirection: 'row'` vs `'column'`.
- Check: you can predict layout changes before running the app.

**Day 3 — State & events**
- Learn: `useState`, `onPress`, `onChangeText`.
- Do: Build a tiny counter screen (button increments a number shown in `Text`).
  Then a `TextInput` that mirrors what you type into a `Text` below it live.
- Check: you understand *why* the screen re-renders when state changes.

**Day 4 — Lists**
- Learn: `FlatList` vs `.map()` — why FlatList is used for chat-style lists
  (it only renders visible items — performance).
- Do: Render a hardcoded array of 20 fake messages using `FlatList`.
- Check: scrolling is smooth; you know what `keyExtractor` and `renderItem` do.

**Day 5 — Components & props**
- Learn: breaking UI into reusable components, passing data via props.
- Do: Pull one item's rendering out of Day 4 into a separate `MessageBubble.js`
  component that takes a `message` prop.
- Check: same visual result, but the FlatList's `renderItem` is now one line.

**Day 6 — Async/await & fetch**
- Learn: promises, `async/await`, calling a public API.
- Do: Call `https://jsonplaceholder.typicode.com/posts/1` with `fetch` and
  display the result. Add a loading spinner (`ActivityIndicator`) while waiting.
- Check: you can explain why you need `await` before reading `response.json()`.

**Day 7 — Review + set up the real project**
- Do: Unzip/clone the provided `ai-chatbot-app` project. Run `npm install`,
  then `npx expo start`. Get it running on your phone with a placeholder API key
  (it'll error on send — that's expected, fix comes Day 9).
- Check: the chat UI renders, you can type in the input box.

---

## Week 2 — Wiring Up the Real App

**Day 8 — Read `ChatScreen.js` line by line**
- Do: Go through every function (`handleSend`, `handleClearChat`) and every
  `useState`/`useEffect` in the provided code. Add comments in your own words
  above each block explaining what it does.
- Check: you can explain out loud what happens from tapping Send to the
  message appearing on screen.

**Day 9 — Get your real API key working**
- Learn: how OpenAI's Chat Completions API request/response shape works.
- Do: Get an OpenAI key (or Gemini — see README), paste into `config.js`.
  Send a real message in the app.
- Check: you get a real AI reply in the chat. If you get a 401, re-check the key.

**Day 10 — Understand `aiService.js` deeply**
- Learn: why API logic is separated from UI (separation of concerns).
- Do: Deliberately break the API URL, observe the error Alert. Fix it.
  Then add a `console.log` right before the `fetch` call to see the exact
  payload being sent.
- Check: you understand why the whole `messages` array (not just the latest
  message) is sent every time — that's what gives the AI conversational memory.

**Day 11 — Persistence (AsyncStorage)**
- Learn: why local storage is needed (state is wiped on app restart).
- Do: Read `storage.js`. Close and reopen the app — confirm your chat history
  survives. Try `clearChatHistory()` via the trash icon.
- Check: you can explain the load-on-mount / save-on-change pattern in
  `ChatScreen.js`'s two `useEffect`s.

**Day 12 — Styling pass**
- Learn: RN's Flexbox model (default `flexDirection: 'column'`, unlike web).
- Do: Customize colors, bubble corner radius, and font sizes in
  `ChatBubble.js` and `ChatScreen.js` to make it visually yours.
- Check: app still works after style changes (styling should never break logic).

**Day 13 — Error handling edge cases**
- Do: Turn off your phone's Wi-Fi and try sending a message — confirm you get
  a friendly error, not a crash. Test sending an empty message (should do nothing).
- Check: no red error screen ("unhandled promise rejection") ever appears —
  all failures are caught and shown via `Alert`.

**Day 14 — Mid-point review**
- Do: Re-read the whole codebase once more, front to back, no notes.
  Write a one-paragraph summary (for yourself) of how data flows:
  input → state → API → state → storage → UI.
- Check: you could rebuild this app from a blank file if you had to.

---

## Week 3 — Polish, Extend, and Prepare Submission

**Day 15 — Add a small original feature**
- Pick ONE: (a) timestamp under each message, (b) a "regenerate response"
  button, (c) dark mode toggle.
- Do: Implement it yourself using what you've learned (state + conditional
  styling). This is what makes the submission *yours*, not a copy.
- Check: feature works without breaking existing chat/send/persist flow.

**Day 16 — Testing on both loading & error states**
- Do: Deliberately test: very long messages, rapid double-tapping Send,
  rotating the phone. Fix any layout breaks you find.
- Check: app behaves reasonably under all of these.

**Day 17 — Code cleanup**
- Do: Remove unused imports/console.logs, make sure naming is consistent,
  make sure every file has a short comment at the top explaining its purpose
  (already started for you).
- Check: run through `README.md`'s setup steps on a fresh checkout (or ask a
  friend to) to confirm nothing is missing.

**Day 18 — GitHub repo setup**
- Learn: git basics (`init`, `add`, `commit`, `push`), why `.gitignore`
  matters (never commit your API key).
- Do: `git init`, confirm `config.js` is in `.gitignore`, create a repo on
  GitHub, push your code.
- Check: browsing the repo on GitHub, your real API key is nowhere visible.

**Day 19 — Finalize README + record a short demo (optional but strong)**
- Do: Update `README.md` with anything you changed on Day 15. Consider a
  30–60 second screen recording of the app working, linked in the README.
- Check: someone who's never seen the project could clone it and run it
  using only your README.

**Day 20 — Final review & submit**
- Do: Re-read the assessment PDF's requirements one more time, check every
  bullet is covered (chat UI ✅, AI integration ✅, history persistence ✅,
  loading/error handling ✅, clean UI ✅, README ✅, libraries mentioned ✅).
  Submit the GitHub link (or ZIP) well before Aug 15th.

---

## If you get stuck
- Expo docs: https://docs.expo.dev
- React Native docs: https://reactnative.dev/docs/getting-started
- OpenAI API reference: https://platform.openai.com/docs/api-reference/chat
- Search error messages verbatim — RN error messages are usually googleable
  and someone's hit the same one on Stack Overflow or GitHub issues.
