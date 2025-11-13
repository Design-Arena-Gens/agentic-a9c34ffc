# JarviSpark Agent

JarviSpark is a cinematic mobile-first assistant experience inspired by Iron Man's Jarvis. The interface presents a friendly holographic robot that glides across the screen while you chat in Hinglish. Behind the scenes the agent plans and responds with Google Gemini 1.5 Flash, delivering actionable steps for every task you assign.

## Prerequisites

- Node.js 18+
- npm 9+
- A Google AI Studio API key with access to Gemini 1.5 Flash (`GEMINI_API_KEY`).

## Quick Start

```bash
npm install
cp .env.example .env.local # then add GEMINI_API_KEY
npm run dev
```

Visit http://localhost:3000 to open the live “video call” with JarviSpark.

## Production Build

```bash
npm run lint
npm run build
```

The build step requires `GEMINI_API_KEY` to be present (Next.js loads env vars at build time for the API route).

## Environment

Create a `.env.local` file with:

```bash
GEMINI_API_KEY=your_google_ai_studio_key
```

## Deployment

The project is optimized for Vercel. After setting the production `GEMINI_API_KEY`, run:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-a9c34ffc
```

## Tech Stack

- Next.js 16 App Router + React Compiler
- Tailwind CSS utility-first styling with custom holographic effects
- Google Gemini 1.5 Flash for task planning responses via `/api/agent`
- Animated CSS robot avatar with multi-layered lighting and walk cycle

## Project Structure

```
app/
  api/agent/route.ts  # Serverless route that forwards chat history to Gemini
  page.tsx            # Entry point rendering the JarviSpark interface
components/
  AgentInterface.tsx  # Interactive UI, chat handling, and robot hologram
```

## Notes

- Press Enter to send, Shift+Enter for multi-line prompts.
- When Gemini is thinking the robot glows and a typing indicator appears.
- Responses mix Hindi and English to match the requested tone.
