# MindMate AI — Student Wellness Companion 🌟

MindMate AI is a warm, empathetic student wellness companion designed specifically for aspirants preparing for high-stakes exams in India (including JEE, NEET, UPSC, GATE, CAT, CUET, and Board Exams). It provides a support system like a caring older sibling, helping students navigate stress, anxiety, burnout, and comparison, while encouraging healthy habits, mindfulness, and study-life balance.

---

## 🚀 Key Features

### 1. Daily Check-ins & Mood Tracking
- **Interactive Check-in Modal**: Students can easily track their mood, stress levels, energy, sleep hours, study hours, and academic confidence daily.
- **Dynamic Visual Feedback**: Visual representation of wellness metrics using charts and clean dashboard elements.

### 2. Reflection Journal
- **Full CRUD Support**: Add, view, edit, and soft-delete personal reflections.
- **Categorized Tagging**: Organize entries with core emotional tags: `Anxiety`, `Motivation`, `Confidence`, `Burnout`, and `Gratitude`.
- **AI-Powered Reflections**: Integration with Gemini to offer supportive summaries and insights on journaling patterns.
- **Search & Filter**: Find specific entries by tag or text content quickly.

### 3. AI Wellness Coach (Empathetic AI Sibling)
- **Real-Time Streaming**: Uses Vercel AI SDK streaming for instant, responsive conversation.
- **Curated Safety Safeguards**: Built-in crisis triggers that detect sensitive inputs (e.g., self-harm or deep distress) and provide immediate support, including helpline numbers like iCall and Vandrevala Foundation.
- **Powered by Gemini 2.5 Flash Lite**: Utilizes the optimized `gemini-2.5-flash-lite-preview-06-17` model to ensure low-latency, empathetic interactions.

### 4. Interactive Insights Card
- **Pattern Recognition**: Highlights student trends based on study hours, sleep patterns, and mood check-ins.
- **Actionable Tips**: Delivers personalized suggestions (e.g., 2-minute breathing breaks or sleep improvements) using dynamic seed/synthetic fallback data.

### 5. Gamification & Streaks
- **Streak Counters**: Displays current and longest streaks for daily check-ins, journaling, and wellness tasks to encourage daily engagement.
- **XP & Levels System**: Awards experience points (XP) and levels as students maintain their check-ins and reflection logs.
- **Achievements & Badges**: Unlock badges (e.g., *7-Day Check-In*, *30-Day Journal Streak*, *Stress Awareness Champion*, *Healthy Balance Builder*) based on real achievement milestones.

### 6. Accessibility & Responsiveness
- **Screen Reader Friendly**: Full ARIA compliance across all interactive modals (Crisis Modal, Check-In Modal, etc.) and pages.
- **3D Interactive Experiences**: Subtle, beautiful 3D animations and transitions implemented via Framer Motion, Three.js, React Three Fiber, and Drei.

---

## 🛠️ Technology Stack

- **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (with TanStack Router) for high-performance React application routing and Server-Side Rendering (SSR).
- **Core UI**: React 19, TypeScript, TailwindCSS v4, [Shadcn UI](https://ui.shadcn.com/), and Framer Motion for premium, modern aesthetics.
- **3D Graphics**: Three.js, `@react-three/fiber`, and `@react-three/drei` for engaging 3D components.
- **Database & Auth**: [Firebase v12](https://firebase.google.com/) (Firestore database for real-time document storage, Firebase Auth for email/password authentication).
- **AI Integration**: Gemini API via Vercel AI SDK (`ai` & `@ai-sdk/google`) powered by `gemini-2.5-flash-lite-preview-06-17`.
- **State Management & Data Fetching**: TanStack React Query v5 for cached server state management.
- **Testing Suite**: Vitest for robust unit, integration, safety, and accessibility testing.

---

## 📁 Directory Structure

```
Mindscape Heal/
├── src/
│   ├── __tests__/           # Vitest unit & integration test suites
│   ├── components/          # Reusable UI components (InsightsCard, CrisisModal, CheckInModal, SiteNav, etc.)
│   ├── contexts/            # React Contexts (e.g., AuthContext)
│   ├── hooks/               # Custom TanStack Query & data hooks with seed fallback
│   ├── integrations/        # Integration setups
│   ├── lib/
│   │   ├── api/             # Firebase Firestore CRUD function modules
│   │   ├── firebase.ts      # Firebase client initialization
│   │   ├── ai-gateway.server.ts # Gemini model configuration
│   │   └── seed-data.ts     # Synthetic fallback data
│   ├── routes/              # TanStack Router page routes & server API endpoints
│   ├── types/               # TypeScript interface & type definitions
│   ├── main.tsx             # App mounting entrypoint
│   ├── router.tsx           # TanStack Router setup
│   └── styles.css           # Tailwind CSS styles config
├── firestore.rules          # Firestore Security Rules
├── package.json             # NPM dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite bundler config
└── vitest.config.ts         # Vitest setup configuration
```

---

## ⚙️ Project Setup & Installation

### Prerequisites
- Node.js (v18+)
- Firebase Project setup with Email/Password Auth & Firestore enabled.
- Gemini API Key from Google AI Studio.

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd "Mindscape Heal"
   ```

2. Install the dependencies using the legacy peer deps flag:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Create a `.env` file in the root of the project:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
   VITE_FIREBASE_APP_ID=YOUR_APP_ID
   VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID

   # Gemini AI API Key
   GOOGLE_GENERATIVE_AI_API_KEY=YOUR_GEMINI_API_KEY
   VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:8080` in your browser to view the application.

---

## 🧪 Testing & Verification

The project includes unit, integration, security, and accessibility tests.

- **Run all tests**:
  ```bash
  npm run test
  ```
- **Run tests in watch mode**:
  ```bash
  npm run test:watch
  ```
- **Check coverage**:
  ```bash
  npm run test:coverage
  ```

---

## 📄 License

This project is configured for evaluation and development purposes.
