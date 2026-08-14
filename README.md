# AI Assistant Chatbot

A mobile AI chatbot application built using React Native and Expo for the
Global Buzz technical assessment — Option 1: Mobile AI Chatbot.

The application integrates two AI providers, Google Gemini and Groq. Both
services generate responses to the user's question, and Gemini performs a
comparison step to select the better response.

## Features

- Clean and responsive mobile chat interface
- Google Gemini AI integration
- Groq AI integration
- Dual-AI response generation and comparison
- Gemini-based response judging
- Persistent chat history
- Loading and typing indicators
- Error handling
- Voice input
- Image and document support
- Multiple chat conversations
- Analytics
- Clear chat functionality
- Android APK support

## AI Architecture

For each user message:

1. The message is sent to Groq.
2. The message is sent to Google Gemini.
3. Both AI services generate independent responses.
4. Gemini compares the two responses.
5. Gemini selects the better response.
6. The selected response is displayed to the user.

### AI Flow

```text
User Message
      |
      +------------------+
      |                  |
      v                  v
    Groq              Gemini
      |                  |
      v                  v
  Answer 1            Answer 2
      |                  |
      +--------+---------+
               |
               v
        Gemini Judge
               |
               v
        Best Response
               |
               v
             User