# Clutch (Baseball Re-imagined)

[Read the full development journey here](journey.md)

## Overview

Ever wished baseball was easier to follow and more fun to watch? Clutch brings you the best moments from every MLB game in a format you'll love. Swipe through personalized highlights, get instant explanations of what's happening, and learn the game through interactive features. Whether you're a die-hard fan or just getting started, Clutch makes baseball more enjoyable for everyone.

## Core Features

### Smart Highlight Feed

Think TikTok, but for baseball highlights. As you scroll through:

- Videos play automatically and smoothly
- Content is personalized based on your favorite teams
- Each highlight has a bottom sheet (swipe up!) that shows:
  - What actually happened in normal human words
  - Key stats that matter for this play
  - Baseball terms are highlighted - tap them for quick explanations
  - Both teams' perspective on the play
  - Similar plays you might like
- Ask the AI anything about the highlight:
  - Get answers with source citations
  - Works in multiple languages
  - Explains baseball concepts as they come up

### Player Matchups

Want to compare players but hate drowning in numbers? We got you:

- See how players match up based on what matters for their position
- Visual comparisons that make sense
- Historical context and trends
- Daily featured player with performance breakdown
- Everything explained in plain English

### The Dugout (Baseball Learning Hub)

A collection of baseball-themed games to help you learn while having fun:

**4 Pics 1 Baseball Term:**

- Guess baseball terms from visual clues
- Progress through 5 levels: Apprentice → Planetary → Stellar → Universe → Domain Master
- Perfect for learning baseball's unique language
- More games coming soon!

### MLB Glossary Integration

Baseball has its own language, and we're here to translate:

- Terms like "RISP" or "ERA" are automatically highlighted in content
- Tap any highlighted term to see a simple explanation in a popup
- See real game examples of terms in action
- System remembers which terms you know

### Spotlight (Enhanced Baseball Articles)

Not your average news feed. We take MLB articles and make them better:

- Interactive reading experience with rich media integration
- Baseball terms automatically highlighted and explained
- Source citations embedded directly where they're relevant
- Related highlights and stats woven into the article
- Smart summaries for quick reading
- External sources and references organized by topic
- Optimized layout that adapts to your reading style

## Tech Stack

### Backend

- Node.js & TypeScript (Hono.js)
- PostgreSQL & Prisma
- Redis (Caching & Job Queues)
- FFmpeg
- Whisper
- Google Cloud Platform
  - Cloud Storage (Video & Audio Storage)
  - Cloud Speech-to-Text (Audio Transcription)
  - Cloud Translation (Multi-language Support)
  - Gemini (AI Analysis & Summaries)
  - OAuth2 (Authentication)
- Inngest (Job Scheduling)

### Frontend

- SvelteKit
- TailwindCSS

---

Built with ⚾️ by [Benrobo](https://github.com/benrobo)
