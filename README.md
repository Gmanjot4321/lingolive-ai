# LingoLive AI — Real-Time Conversational Language Tutor 🗣️🌍

[![Live Demo](https://img.shields.io/badge/Live_Demo-lingolive-ai.onrender.com-success?style=for-the-badge&logo=render)](https://lingolive-ai.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Gmanjot4321/lingolive-ai)

> 🔗 **Live Demo:** [https://lingolive-ai.onrender.com](https://lingolive-ai.onrender.com)

**LingoLive AI** is a comprehensive, multimodal language learning platform designed to simulate immersive, real-time conversational practice and rigorous CEFR-standardized examinations. 

Moving beyond traditional flashcards, LingoLive utilizes advanced WebSocket audio streaming and the Gemini API to create an autonomous voice partner that dynamically adapts to a user’s proficiency level, providing instant phonetic feedback, grammatical corrections, and interactive dialogue.

⚡ Key Highlights & Architecture
Real-Time Voice Interrogation (WebSockets + Web Audio API): Streams 16kHz raw PCM audio directly from the user's microphone to the backend via WebSockets (server.ts), processing speech dynamically using a custom Gapless Audio Queue (audio.ts) for sub-second, interruptible conversational cadence.

CEFR-Calibrated Pedagogical Engine: Generative prompts and scenario flows are strictly bound to CEFR parameters (A0 to C1) via structured system instructions and progression logic (levelProgression.ts, levelGreetings.ts), adjusting vocabulary complexity and syntax in real-time.

Multimodal Curriculum Generation & Practice Studios: Leverages generative AI as a backend curriculum factory (server.ts) to dynamically synthesize interactive Video Masterclasses, Reading Passages, Mock Exams, and Phonetic Drills on demand.

Aggressive Client-Side Caching & Fault Tolerance: Implements robust in-memory caching layers (ttsAudioCache, wordLookupCache) and multi-model fallback routines (generateContentWithRetryAndFallback) to guarantee high availability and instant UI responsiveness.

Persistent Gamification & Analytics: Tracks study minutes, XP, daily streaks, and CEFR exam histories, persisting state seamlessly between client local storage and Supabase PostgreSQL (progressDatabase.ts, streakManager.ts).

Multimodal Speech Processing: Orchestrates concurrent transcription (gemini-3.5-transcribe), text-to-speech (gemini-3.1-flash-tts-preview), and rapid evaluation pipelines (gemini-3.1-flash-lite) to deliver comprehensive language coaching.

🛠️ Tech Stack & Technologies Used
### Frontend & Voice UI
* Core Framework: React 19, TypeScript
* Build Tooling: Vite, ESBuild
* Styling & Design System: Tailwind CSS v4, Custom Neumorphic Glassmorphism
* Motion & Animation: Framer Motion (motion-dom)
* Audio Engineering: Web Audio API, ScriptProcessorNode, Custom PCM to Base64 Encoders

### Backend & AI Infrastructure
* Runtime & Server: Node.js, Express.js
* WebSocket Server: ws (Real-time bidirectional audio streaming)
* AI Engine: Google GenAI SDK (@google/genai)
* Database & Auth: Supabase (PostgreSQL), Brevo SMTP Email Integration for OTP Verification
* Local Storage Layer: File-system JSON persistence (user_profiles.json, user_accounts.json)

📁 System Architecture Overview
lingolive-ai/
├── server.ts                  # Express server: WebSocket audio streaming & GenAI orchestration
├── supabase_schema.sql        # PostgreSQL table layout for profiles and exam records
├── src/
│   ├── App.tsx                # Main application state, routing, and progress persistence
│   ├── main.tsx               # Client entrypoint
│   ├── types.ts               # Global TypeScript interfaces (CEFR, Analytics, Chat)
│   ├── index.css              # Global styles, custom scrollbars, and keyframe animations
│   │
│   ├── components/            # [UI Tier]
│   │   ├── Header.tsx                 # Navigation, level switching, and gamification HUD
│   │   ├── InteractiveChat.tsx        # Turn-based text/voice chat with interactive reply options
│   │   ├── LiveVoicePartner.tsx       # WebSocket-driven real-time continuous voice stage
│   │   ├── AIVoiceSphere.tsx          # CSS-animated fluid orb reacting to microphone volume
│   │   ├── PerformanceDashboardView.tsx # Gamification stats, XP, and streak tracking
│   │   ├── MockTestExamView.tsx       # Standardized 4-skill CEFR examination UI
│   │   ├── LearningHubView.tsx        # Video masterclasses and reading comprehension modules
│   │   ├── WordLookupModal.tsx        # Deep-dive contextual dictionary popover
│   │   ├── PronunciationCoachModal.tsx# Speech evaluation and phonetic drill UI
│   │   ├── AuthModal.tsx              # User login, registration, and OTP verification modal
│   │   ├── BeginnerFoundationsModal.tsx # Zero-knowledge introductory soundboard & starter kit
│   │   ├── GlassBackground.tsx        # Luminous frosted glass container and layout wrapper
│   │   ├── NovaNexusLogo.tsx          # Animated brand logo component
│   │   ├── PromotionExamModal.tsx     # Official CEFR level promotion exam modal
│   │   ├── ScenarioSelectorModal.tsx  # Immersive practice scenario picker
│   │   ├── SessionSummaryModal.tsx    # Fluency report and CEFR breakdown review modal
│   │   ├── StreakModal.tsx            # Daily goal celebration and milestone rewards
│   │   ├── StreakCelebrationModal.tsx # Confetti milestone modal for active streaks
│   │   └── VocabularyDeckModal.tsx    # Saved flashcards and mastery review deck
│   │
│   ├── components/practice/   # [Specialized Skill Studios]
│   │   ├── ListeningPracticeView.tsx  # Audio tracking and dictation comprehension studio
│   │   ├── PhoneticsStudioView.tsx    # Tongue twisters, minimal pairs, and accent drills
│   │   ├── ReadingPracticeView.tsx    # Graded reading passages with comprehension checks
│   │   ├── SpeakingPracticeView.tsx   # Oral challenge prompts and recorded spoken practice
│   │   ├── StoryReaderModal.tsx       # Interactive graded story reader with embedded glossary
│   │   ├── VideoTeachingStudioView.tsx# Video masterclasses with synchronized transcripts
│   │   └── WritingPracticeView.tsx    # Composition workspace with real-time AI grading
│   │
│   ├── utils/                 # [Audio & Logic Tier]
│   │   ├── audio.ts                   # PCM/Base64 encoding, Web Audio context, Gapless Queue
│   │   └── streakManager.ts           # XP algorithms, daily goal tracking, and local syncing
│   │
│   ├── data/                  # [Static Curriculum Tier]
│   │   ├── languages.ts               # Supported languages, scenarios, and AI personas
│   │   ├── levelProgression.ts        # CEFR unlock logic and promotion requirements
│   │   ├── levelGreetings.ts          # Calibrated initial messages per proficiency level
│   │   ├── cefrStories.ts             # Graded story repository across CEFR bands
│   │   ├── dictionary.ts              # Built-in fallback dictionary terms
│   │   └── mockExams.ts               # Standardized examination datasets
│   │
│   └── services/              # [Persistence Tier]
│       └── progressDatabase.ts        # Supabase API wrappers for profile and exam history
