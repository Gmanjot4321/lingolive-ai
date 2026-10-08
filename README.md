# LingoLive AI — Real-Time AI Language Learning Partner

[![Live Demo](https://img.shields.io/badge/Live_Demo-lingolive--ai.onrender.com-success?style=for-the-badge&logo=render)](https://lingolive-ai.onrender.com)

> 🔗 **Live Demo:** [https://lingolive-ai.onrender.com](https://lingolive-ai.onrender.com)

**LingoLive AI** is a full-stack, AI-powered language learning platform that pairs learners with a live conversational AI partner across nine languages. It combines real-time voice conversation, structured CEFR-based progression (A0 through C1), and a full suite of practice modes (speaking, listening, reading, writing, and pronunciation) into a single adaptive learning experience.

Rather than static lessons, LingoLive AI generates scenarios, exams, stories, and feedback on the fly using Google's Gemini models, then tracks each learner's progress, streaks, and vocabulary in a persistent Supabase-backed profile.

---

## Key Highlights & Architecture

* **Live Voice Conversation Partner:** A WebSocket-driven (`/ws/live`) real-time voice session powered by Gemini's live audio model, letting learners hold a spoken conversation with an AI partner instead of typing.
* **CEFR-Aligned Progression System:** Learners move through six proficiency levels (A0 to C1), unlocking new levels through promotion exams and required practice counts tracked per level.
* **Six Structured Practice Modes:** Dedicated studios for Speaking, Listening, Reading, Writing, Phonetics, and AI-generated Video Masterclasses, each with its own Gemini-generated content endpoint.
* **AI-Generated Everything:** Practice scenarios, mock exams, reading passages, listening prompts, stories, pronunciation feedback, and word lookups are all generated dynamically per request rather than hard-coded.
* **Resilient Multi-Model AI Layer:** A custom retry-and-fallback wrapper cycles through multiple Gemini text models on rate limits or high-demand errors, so generation stays reliable under load.
* **Gamified Retention Loop:** A streak manager with daily check-ins, streak freezes, milestone rewards, and celebration modals to keep learners coming back.
* **Persistent Learner Profiles:** Supabase (PostgreSQL) stores user profiles, saved vocabulary, and exam history, with email/OTP-based authentication handled server-side.
* **Text-to-Speech & Transcription:** A server-side TTS endpoint for AI response playback (`POST /api/tts`); voice input in the practice modes goes through the browser Web Speech API, with a server-side `/api/transcribe` endpoint available.

---

## Tech Stack & Technologies Used

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

## Comprehensive System Architecture

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

##  API Surface (Express Server)

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
| `POST /api/generate-reading-passage` / `/api/generate-listening-scenario` / `/api/generate-speaking-prompt` / `/api/generate-writing-prompt` | Per-skill practice content generation |
| `POST /api/auth/send-otp` / `/api/auth/verify-otp-and-signup` / `/api/auth/signup` / `/api/auth/signin` | Email OTP authentication flow |
| `GET/POST /api/profile` | Learner profile read/write |
| `WS /ws/live` | Real-time live voice conversation session |

---

## Supported Languages

Spanish · French · Japanese · German · Italian · Mandarin Chinese · Portuguese · Korean · English

Each language ships with a dedicated AI partner persona, native sample phrases, and speech-locale configuration for text-to-speech and transcription.

---


##  Getting Started

### Prerequisites

* Node.js 18+ (or [Bun](https://bun.sh))
* A Google Gemini API key — get one free at [Google AI Studio](https://aistudio.google.com/apikey)
* (Optional) A Supabase project for persistent profiles, saved vocabulary, and exam history
* (Optional) A Brevo account for OTP signup emails

### 1. Install dependencies

```bash
npm install        # or: bun install
```

### 2. Configure environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Powers all AI generation, live voice, TTS, and transcription |
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | No | Enables persistent profiles, saved vocabulary, exam history |
| `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY`) | No | Server-side Supabase access |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | No | Client-side Supabase access |
| `BREVO_API_KEY` (or `BREVO_KEY` / `SENDINBLUE_API_KEY`) | No | Sends OTP signup emails (falls back to Brevo SMTP relay) |
| `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` | No | Sender identity for OTP emails |

Without Supabase or Brevo configured, the app still runs in guest mode with a local JSON profile store — those features degrade gracefully.

### 3. Run it

```bash
npm run dev     # dev server at http://localhost:3000 (tsx + Vite)
npm run build   # production bundle -> dist/
npm start       # serve the production build (node dist/server.cjs)
```

A single Express process serves the Vite frontend, the API, and the WebSocket backend on port `3000`.

---

## 📦 Deployment

LingoLive AI is deployed on **Render**, running the bundled Express server (`dist/server.cjs`) which serves both the built Vite frontend and the API/WebSocket backend from a single process.

**Live app:** [https://lingolive-ai.onrender.com](https://lingolive-ai.onrender.com)
