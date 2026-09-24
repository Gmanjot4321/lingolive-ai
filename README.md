# LingoLive AI — Real-Time AI Language Learning Partner 🗣️🌍

[![Live Demo](https://img.shields.io/badge/Live_Demo-lingolive--ai.onrender.com-success?style=for-the-badge&logo=render)](https://lingolive-ai.onrender.com)

> 🔗 **Live Demo:** [https://lingolive-ai.onrender.com](https://lingolive-ai.onrender.com)

**LingoLive AI** is a full-stack, AI-powered language learning platform that pairs learners with a live conversational AI partner across nine languages. It combines real-time voice conversation, structured CEFR-based progression (A0 through C1), and a full suite of practice modes (speaking, listening, reading, writing, and pronunciation) into a single adaptive learning experience.

Rather than static lessons, LingoLive AI generates scenarios, exams, stories, and feedback on the fly using Google's Gemini models, then tracks each learner's progress, streaks, and vocabulary in a persistent Supabase-backed profile.

---

## ⚡ Key Highlights & Architecture

* **Live Voice Conversation Partner:** A WebSocket-driven (`/ws/live`) real-time voice session powered by Gemini's live audio model, letting learners hold a spoken conversation with an AI partner instead of typing.
* **CEFR-Aligned Progression System:** Learners move through six proficiency levels (A0 to C1), unlocking new levels through promotion exams and required practice counts tracked per level.
* **Six Structured Practice Modes:** Dedicated studios for Speaking, Listening, Reading, Writing, Phonetics, and AI-generated Video Masterclasses, each with its own Gemini-generated content endpoint.
* **AI-Generated Everything:** Practice scenarios, mock exams, reading passages, listening prompts, stories, pronunciation feedback, and word lookups are all generated dynamically per request rather than hard-coded.
* **Resilient Multi-Model AI Layer:** A custom retry-and-fallback wrapper cycles through multiple Gemini text models on rate limits or high-demand errors, so generation stays reliable under load.
* **Gamified Retention Loop:** A streak manager with daily check-ins, streak freezes, milestone rewards, and celebration modals to keep learners coming back.
* **Persistent Learner Profiles:** Supabase (PostgreSQL) stores user profiles, saved vocabulary, and exam history, with email/OTP-based authentication handled server-side.
* **Text-to-Speech & Transcription:** Server-side endpoints for TTS playback of AI responses and transcription of learner speech, so every practice mode can be fully voice-driven.

---

## 🛠️ Tech Stack & Technologies Used

### Frontend
* **Core Framework:** React 19, TypeScript
* **Build Tooling:** Vite, Bun
* **Styling & Animation:** Tailwind CSS (v4), Framer Motion (`motion`)
* **UI & Feedback:** Lucide React icons, Recharts (progress dashboards), Canvas Confetti (celebrations)

### Backend & AI Orchestration
* **Server:** Express (TypeScript, run via `tsx`), bundled with esbuild for production
* **Real-Time Layer:** `ws` (WebSocket Server) for the live voice partner session
* **AI Provider:** Google Gemini (`@google/genai`) — text generation, live audio, TTS, and transcription across multiple fallback models
* **Auth & Email:** Nodemailer with Brevo (Sendinblue) SMTP for OTP-based signup and verification
* **Database & Auth:** Supabase (PostgreSQL)
* **Deployment:** Render

---

## 📁 Comprehensive System Architecture

```text
lingolive-ai/
│
├── server.ts                       # Express + WebSocket server, all Gemini API orchestration
├── supabase_schema.sql             # Postgres schema: user_profiles, saved_vocabulary, exam_history
├── vite.config.ts                  # Vite build configuration
│
└── src/
    ├── App.tsx                     # Main app shell, view routing, and global learner state
    ├── main.tsx                    # React client entrypoint
    ├── types.ts                    # Global TypeScript interfaces
    ├── index.css                   # Global styles and Tailwind directives
    │
    ├── components/                 # [UI Tier]
    │   ├── Header.tsx               # Navigation and language/level switcher
    │   ├── LiveVoicePartner.tsx     # Real-time WebSocket voice conversation UI
    │   ├── InteractiveChat.tsx      # Text-based conversational practice
    │   ├── AIVoiceSphere.tsx        # Animated voice-activity visualizer
    │   ├── AuthModal.tsx            # OTP-based sign up / sign in flow
    │   ├── ScenarioSelectorModal.tsx# Scenario picker for guided practice
    │   ├── PronunciationCoachModal.tsx # AI pronunciation scoring and feedback
    │   ├── WordLookupModal.tsx      # On-demand AI dictionary/word lookup
    │   ├── VocabularyDeckModal.tsx  # Saved vocabulary review deck
    │   ├── SessionSummaryModal.tsx  # End-of-session AI performance recap
    │   ├── MockTestExamView.tsx     # Full AI-generated mock exams
    │   ├── PromotionExamModal.tsx   # Level-up gating exam
    │   ├── PerformanceDashboardView.tsx # Recharts-based progress analytics
    │   ├── LearningHubView.tsx      # Central navigation hub for practice modes
    │   ├── StreakModal.tsx / StreakCelebrationModal.tsx # Gamified streak tracking
    │   ├── BeginnerFoundationsModal.tsx # A0 onboarding content
    │   ├── GlassBackground.tsx      # Ambient UI background
    │   │
    │   └── practice/                # [Dedicated Practice Studios]
    │       ├── SpeakingPracticeView.tsx
    │       ├── ListeningPracticeView.tsx
    │       ├── ReadingPracticeView.tsx
    │       ├── WritingPracticeView.tsx
    │       ├── PhoneticsStudioView.tsx
    │       ├── VideoTeachingStudioView.tsx
    │       └── StoryReaderModal.tsx
    │
    ├── data/                       # [Static Reference Data]
    │   ├── languages.ts             # 9 supported languages, AI partner personas, scenarios
    │   ├── levelProgression.ts      # CEFR level order, unlock rules, required practice counts
    │   ├── levelGreetings.ts        # Per-level onboarding greetings
    │   ├── cefrStories.ts           # Seed story content by level
    │   ├── mockExams.ts             # Mock exam scaffolding
    │   └── dictionary.ts            # Local dictionary fallback data
    │
    ├── services/                    # [Client-Side Data Layer]
    │   └── progressDatabase.ts      # Supabase read/write for profiles, exams, vocabulary
    │
    ├── lib/
    │   └── supabase.ts              # Supabase client initialization
    │
    └── utils/                       # [Core Utilities]
        ├── streakManager.ts         # Streak, milestone, and check-in logic
        └── audio.ts                 # Audio playback/recording helpers
```

---

## 🔌 API Surface (Express Server)

All AI generation and account logic runs server-side so the Gemini API key is never exposed to the client.

| Endpoint | Purpose |
|---|---|
| `POST /api/chat` | Core conversational language coaching |
| `POST /api/tts` | Text-to-speech playback of AI responses |
| `POST /api/transcribe` | Speech-to-text transcription of learner audio |
| `POST /api/generate-scenario` | AI-generated practice scenarios |
| `POST /api/pronunciation-feedback` | Pronunciation scoring and correction |
| `POST /api/word-lookup` | On-demand AI dictionary lookups |
| `POST /api/session-summary` | End-of-session performance recap |
| `POST /api/generate-mock-test` / `evaluate-mock-test` | Full mock exam generation and grading |
| `POST /api/evaluate-writing` | AI-graded writing feedback |
| `POST /api/generate-story` | Level-appropriate AI-generated stories |
| `POST /api/generate-phonetics-drill` | Phonetics practice drills |
| `POST /api/generate-video-masterclass` | AI video-style teaching content |
| `POST /api/generate-reading-passage` / `listening-scenario` / `speaking-prompt` / `writing-prompt` | Per-skill practice content generation |
| `POST /api/auth/send-otp` / `verify-otp-and-signup` / `signup` / `signin` | Email OTP authentication flow |
| `GET/POST /api/profile` | Learner profile read/write |
| `WS /ws/live` | Real-time live voice conversation session |

---

## 🌐 Supported Languages

Spanish · French · Japanese · German · Italian · Mandarin Chinese · Portuguese · Korean · English

Each language ships with a dedicated AI partner persona, native sample phrases, and speech-locale configuration for text-to-speech and transcription.

---

## 🚀 Getting Started

```bash
# Install dependencies
bun install   # or npm install

# Configure environment variables (see below)
cp .env.example .env

# Run in development
bun run dev

# Build and run in production
bun run build
bun run start
```


## 📦 Deployment

LingoLive AI is deployed on **Render**, running the bundled Express server (`dist/server.cjs`) which serves both the built Vite frontend and the API/WebSocket backend from a single process.

**Live app:** [https://lingolive-ai.onrender.com](https://lingolive-ai.onrender.com)
