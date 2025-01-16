# Clutch Todo List

## Project Setup (Dependencies)

1. [x] Initial Project Structure

   - [x] Set up monorepo structure
   - [x] Configure TypeScript
   - [x] Set up ESLint/Prettier

2. [x] Database Setup

   - [x] Design initial Prisma schema
   - [x] Set up PostgreSQL
   - [x] Create initial migrations

3. [x] API Foundation

   - [x] Set up Hono.js
   - [x] Configure MLB API integration
   - [x] Set up basic error handling

4. [x] Frontend Foundation
   - [x] Initialize SvelteKit
   - [x] Set up TailwindCSS
   - [x] Configure API client

## Features (In Order of Dependencies)

1. [x] Authentication (Core)

   - [x] Set up Auth schema
   - [x] Implement login/signup
   - [x] Create protected routes

2. [x] User Preferences

   - [x] Team selection
   - [x] Player selection
   - [x] Content preferences
   - [x] Store user preferences

3. [x] MLB Integration

   - [x] Fetch game schedules
   - [x] Get team rosters
   - [x] Retrieve game highlights
   - [x] Store game/highlight data

4. [x] Video Processing

   - [x] Set up FFMPEG
   - [x] Create processing queue
   - [x] Basic highlight extraction
   - [x] Store processed videos

5. [x] AI Integration

   - [x] Configure Gemini
   - [x] Process video insights
   - [x] Generate strategic analysis
   - [x] Store AI insights

6. [x] Content Feed
   - [x] Create video player
   - [x] Implement feed UI
   - [ ] Add stats overlay
   - [ ] Like/save functionality

Each feature builds upon the previous ones, ensuring a logical development flow.

```js
interface ActionDetectionConfig {
  motionThreshold: number;
  audioThreshold: number;
  sceneThreshold: number;
  regionOfInterest: {
    pitcher: BoundingBox,
    batter: BoundingBox,
  };
}

async function detectBaseballActions(video: string) {
  // 1. Initial Scene Detection
  const scenes = await detectScenes(video, config.sceneThreshold);

  // 2. For each scene, analyze:
  const actions = await Promise.all(
    scenes.map(async (scene) => {
      // a. Motion in ROIs (pitcher's mound, batter's box)
      const motionVectors = await getMotionVectors(
        scene,
        config.regionOfInterest
      );

      // b. Audio peaks
      const audioMarkers = await detectAudioPeaks(scene, config.audioThreshold);

      // c. Correlate signals
      return correlateSignals(motionVectors, audioMarkers);
    })
  );

  // 3. Extract frames around confirmed actions
  const actionFrames = await extractActionFrames(actions, {
    beforeAction: 1000, // ms
    afterAction: 2000, // ms
  });

  return actionFrames;
}
```

## Bugs

- Fix the video chatbot feature where the tool to search web is been called on query that doesn't need any web search
- Fix the matchup page where the selected players are not being updated when the team is changed
-
