# AI Assistant Chatbot

A mobile AI chatbot application built using **React Native and Expo** for the
**Global Buzz Technical Assessment — Option 1: Mobile AI Chatbot**.

The application integrates **Google Gemini** and **Groq** to generate AI
responses. Both AI services generate candidate responses, and Gemini compares
the responses and selects the better answer before displaying it to the user.

---
## 📱 Download Android APK

[**⬇️ DOWNLOAD AI ASSISTANT APK**](https://expo.dev/artifacts/eas/_8BvFVr5EqziBgCrGTbBxlrvxRwj_LpQrLx4yhH4Vzo.apk)

## 🚀 Features

- 🤖 Google Gemini AI integration
- ⚡ Groq AI integration
- 🔄 Dual-AI response generation and comparison
- 🧠 Gemini-based response judging
- 💬 Clean and responsive mobile chat interface
- 💾 Persistent chat history using AsyncStorage
- 🗂️ Multiple chat conversations
- 🎤 Voice input
- 🖼️ Image support
- 📄 Document support
- ⏳ AI loading/typing indicator
- ⚠️ User-friendly error handling
- 📊 Analytics functionality
- 🧹 Clear chat functionality
- 📱 Android APK support

---

## 🧠 AI Architecture

The application uses two AI providers instead of relying on a single AI
service.

For each user query:

1. The query is sent to **Groq**.
2. The same query is sent to **Google Gemini**.
3. Both services generate independent responses.
4. Gemini receives both responses.
5. Gemini compares the candidate responses.
6. Gemini selects the better response.
7. The selected response is displayed to the user.

### AI Flow

```text
                         User Query
                              |
                 +------------+------------+
                 |                         |
                 v                         v
               Groq                     Gemini
                 |                         |
                 v                         v
             Response A                Response B
                 |                         |
                 +------------+------------+
                              |
                              v
                       Gemini Judge
                              |
                              v
                     Best Response
                              |
                              v
                            User
```

### API Call Flow

A normal text request involves three AI calls:

```text
Call 1 → Groq
         Generates candidate response

Call 2 → Gemini
         Generates candidate response

Call 3 → Gemini
         Compares both responses and selects the better response
```

Gemini therefore performs two roles:

- AI response generation
- Response comparison/judging

---

## 💡 Why Two AI Providers?

Different AI models can produce different responses for the same question.

Using both Gemini and Groq allows the application to:

- Generate multiple candidate responses
- Compare responses from different AI services
- Select a stronger response
- Demonstrate integration with multiple AI APIs
- Provide a more advanced workflow than a basic single-model chatbot

---

## 💬 Chat and Conversation Management

The application provides a complete mobile chat experience.

### Chat Features

- User and AI message bubbles
- Persistent chat history
- Multiple conversations
- Continue previous conversations
- Clear chat functionality
- Loading/typing indicators

Chat history is stored locally using **AsyncStorage**, allowing conversations
to remain available after restarting the application.

---

## 🎤 Voice, Image and Document Input

The application supports multiple types of user input:

- Text input
- Voice input
- Image input
- Document input

This allows users to interact with the assistant beyond traditional
text-only conversations.

---

## ⚠️ Error Handling

The application provides user-facing error handling for common problems such
as:

- Network connection failures
- AI service failures
- Invalid API credentials
- Failed API requests
- Empty or unavailable responses

A loading indicator is also displayed while AI responses are being generated.

---

## 📊 Analytics

The application includes analytics functionality for presenting
conversation-related information in a structured interface.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React Native | Mobile application development |
| Expo | React Native development and tooling |
| JavaScript | Application programming |
| Google Gemini API | AI response generation and comparison |
| Groq API | AI response generation |
| AsyncStorage | Local chat history persistence |
| Expo EAS | Android APK build |

---

## 📁 Project Structure

```text
ai-chatbot-app/
│
├── App.js
├── package.json
├── package-lock.json
│
├── src/
│   ├── screens/
│   ├── components/
│   ├── services/
│   └── utils/
│
├── app.json
├── eas.json
├── .gitignore
└── README.md
```

The project separates UI components, screens, AI services, utilities, and
configuration to keep the application organized and maintainable.

---

# ⚙️ Setup Instructions

## 1. Clone the Repository

```bash
git clone https://github.com/Vinyas212/ai-chatbot-app.git
cd ai-chatbot-app
```

## 2. Install Dependencies

Make sure Node.js is installed.

Then run:

```bash
npm install
```

## 3. Configure API Keys

The application requires API credentials for:

- Google Gemini
- Groq

Configure your local API credentials using the project's configuration
method.

**Never commit real API keys to GitHub.**

The API-key configuration is excluded from Git tracking.

## 4. Start the Application

Run:

```bash
npx expo start
```

The Expo development server will start and provide options for running the
application on a compatible Android/iOS device or emulator.

---

# 📱 Android APK

The project uses **Expo Application Services (EAS)** to create Android
builds.

To create a preview APK:

```bash
eas build -p android --profile preview
```

The generated APK can then be installed on an Android device for testing.

---

# 🔐 Security

API keys are sensitive credentials and should never be exposed in a public
repository.

Security practices followed in this project include:

- API keys are not committed to the public GitHub repository.
- API-key configuration is excluded from Git tracking.
- Real API keys should only be stored locally or through a secure
  environment/configuration system.
- If an API key is accidentally exposed, it should be revoked and replaced.

---

# 🧪 Testing

The Android application was tested on a physical Android device.

Testing includes:

- Application launch
- Sending AI questions
- Receiving AI responses
- Gemini integration
- Groq integration
- AI response comparison
- Chat history
- Multiple conversations
- Loading indicators
- Error handling
- Voice input
- Image/document functionality

---

# 🎯 Assessment Requirement

### Global Buzz Technical Assessment

**Selected Task: Option 1 — Mobile AI Chatbot**

The project satisfies the core requirements through:

| Requirement | Implementation |
|---|---|
| Mobile chat interface | React Native + Expo |
| AI integration | Gemini + Groq |
| Chat history | AsyncStorage |
| Loading indicator | AI typing/loading state |
| Error handling | User-facing error handling |
| Responsive UI | React Native mobile interface |
| Android application | Expo EAS APK |

The project extends the basic requirements with dual-AI response comparison,
voice input, image/document support, multiple conversations, and analytics.

---

# 🚀 Future Improvements

Possible future improvements include:

- Adding additional AI providers
- Using a dedicated AI model for response judging
- Cloud-based chat synchronization
- User authentication
- More advanced analytics
- Streaming AI responses
- Improved offline support
- Additional conversation management features

---

# 📌 Project Information

**Project:** AI Assistant Chatbot

**Assessment:** Global Buzz Technical Assessment

**Option:** Option 1 — Mobile AI Chatbot

**Framework:** React Native + Expo

**AI Services:** Google Gemini + Groq

**Platform:** Android

**Source Code:**  
[GitHub Repository](https://github.com/Vinyas212/ai-chatbot-app)

---

# 👨‍💻 Author

Developed as part of the **Global Buzz Technical Assessment**.