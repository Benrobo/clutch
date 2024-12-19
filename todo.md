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
   - [ ] Configure MLB API integration
   - [ ] Set up basic error handling

4. [ ] Frontend Foundation
   - [ ] Initialize SvelteKit
   - [ ] Set up TailwindCSS
   - [ ] Configure API client

## Features (In Order of Dependencies)

1. [x] Authentication (Core)

   - [x] Set up Auth schema
   - [x] Implement login/signup
   - [x] Create protected routes

2. [ ] User Preferences

   - [ ] Team selection
   - [ ] Player selection
   - [ ] Content preferences
   - [ ] Store user preferences

3. [ ] MLB Integration

   - [ ] Fetch game schedules
   - [ ] Get team rosters
   - [ ] Retrieve game highlights
   - [ ] Store game/highlight data

4. [ ] Video Processing

   - [ ] Set up FFMPEG
   - [ ] Create processing queue
   - [ ] Basic highlight extraction
   - [ ] Store processed videos

5. [ ] AI Integration

   - [ ] Configure Gemini
   - [ ] Process video insights
   - [ ] Generate strategic analysis
   - [ ] Store AI insights

6. [ ] Content Feed
   - [ ] Create video player
   - [ ] Implement feed UI
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
