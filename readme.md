# Clutch (Baseball Re-imagined)

![image](tmp/screenshots/1.png)

[Read the full development journey here](journey.md)

## Overview

Ever wished baseball was easier to follow and more fun to watch? Clutch brings you the best moments from every MLB game in a format you'll love. Swipe through personalized highlights, get instant explanations of what's happening, and learn the game through interactive features. Whether you're a die-hard fan or just getting started, Clutch makes baseball more enjoyable for everyone.

## Core Features

### Smart Highlight Feed

![image](tmp/screenshots/2.png)

Think TikTok, but for baseball highlights. As you scroll through:

- Videos play automatically and smoothly
- Content is personalized based on your favorite teams
- Watch highlights in multiple languages (English, Spanish, Japanese)
- Each highlight has a bottom sheet (swipe up!) that shows:

### MLB Glossary Integration

Baseball has its own language, and we're here to translate:

- Terms like "RISP" or "ERA" are automatically highlighted in content
- Tap any highlighted term to see a simple explanation in a popup

![image](tmp/screenshots/3.png)

- What actually happened in normal human words
- Key stats that matter for this play
- Baseball terms are highlighted - tap them for quick explanations
- Both teams' perspective on the play
- Ask the AI anything about the highlight:

![image](tmp/screenshots/4.png)

- Get answers with source citations
- Works in multiple languages
- Explains baseball concepts as they come up

### Player Matchups

![image](tmp/screenshots/6.png)
![image](tmp/screenshots/5.png)

Compare any two players head-to-head with insights that make sense:

- Pick players by position (Catcher, Center Field, Pitcher, etc.)
- Get instant probability analysis (like "Who's more likely to hit a home run?")
- See clear visual comparisons with percentages
- Stats explained in plain English with context
- Player of the Day with performance highlights
- One-click access to detailed player stats and history

### The Dugout (Baseball Learning Hub)

A collection of baseball-themed games to help you learn while having fun:

**4 Pics 1 Baseball Term:**

![image](tmp/screenshots/7.png)
![image](tmp/screenshots/8.png)

- Guess baseball terms from visual clues
- Progress through 5 levels: Apprentice → Planetary → Stellar → Universe → Domain Master
- Get helpful hints to guide you.
- Perfect for learning baseball's unique language
- More games coming soon!

### Spotlight (Enhanced Baseball Articles)

![image](tmp/screenshots/9.png)

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
