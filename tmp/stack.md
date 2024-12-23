# Clutch

A TikTok style app which provides fans past video highlights, but the twist is, it shows fans what they want based on their team alongside provides a strategic insights towards the video where fan could get statistical data analysis based on the video, they could as well chat with the ai assistant for that specific video, also save the strategic for later.

I could write a video processing server which goes through all video highlights for each fan favorites and create a personalize highlights with AI. Users could selects their favorite players, and we give them first view short of that player in the generated shots.

## Techstack

### Backend

- Nodejs / Honojs
- Tensorflow (object detection / pose estimation / action recognition)

  - Track ball movement using object detection
  - Calculate pitch speed from frame-to-frame movement
  - Measure exit velocity when bat hits ball
  - Calculate launch angles from ball trajectory
  - Estimate distances using perspective transformation

  <!--
    Audio analysis for:


  - Crowd cheering
  - Bat crack sounds
  - Commentary excitement -->

- Gemini (LLM)

  **Action Detection in Baseball Videos:**

  - Use Gemini to detect key moments:
    - Sudden player movements
    - Ball trajectory changes
    - Crowd reactions
    - Player celebrations

- FFMPEG (video processing / generation)

  - Add visual effects:

    - Slow motion for key moments
    - Freeze frames with metric overlays
    - Trajectory line visualization
    - Speed/velocity numbers pop-ups

  - Transitions:

    - Quick cuts between actions
    - Zoom effects for important moments
    - Picture-in-picture for replays

  - Audio:
    - Keep original crowd reactions
    - Add sound effects for metrics
    - Background music for compilation

### Frontend

- Sveltekit (UI)
- TailwindCSS (UI)
- Capacitor.js (Native mobile app)

### Resources

### Design:

    - https://cdn.dribbble.com/userupload/10633558/file/original-4f31ad58e5d9fa8c31274884f14c7dc7.png
    - https://cdn.dribbble.com/userupload/2972973/file/original-ce29e4b4f0598bd77751a66077beb265.jpg
    - https://cdn.dribbble.com/userupload/15961285/file/original-c4e84a7b8a316c360d0e7390881e33a0.jpg
    - https://dribbble.com/shots/24040065-Gemstream-Gaming-Streaming-Platform
    - https://dribbble.com/shots/15963561-Esports-app
    - https://dribbble.com/shots/22396996-Balbalan-Live-Score-Football-App

### Packages

- https://lokeshdhakar.com/projects/color-thief/#getting-started

## Onboarding Flow

1. **Welcome Screen**

   - App introduction with value proposition
   - Highlight key features (personalized content, AI insights)
   - Start customization CTA

2. **Team Selection**

   - Organized by League (AL/NL) and Division
   - Visual grid of team logos and names
   - Multi-select with clear visual feedback
   - Teams shown with basic stats/info
   - Both teams in a game are processed for highlights

3. **Player Selection**

   - Smart suggestions based on selected teams
   - Search functionality for all MLB players
   - Player cards with:
     - Official headshot
     - Current team
     - Position
     - Key stats
   - Multi-select interface

4. **Content Preferences**

   - Quick toggles for highlight types:
     ```javascript
     const contentTypes = {
       hitting: {
         "Home Runs": true, // Dramatic home runs
         "Clutch Hits": false, // Game-winning hits
         "Base Running": false, // Stolen bases, tags
       },
       pitching: {
         Strikeouts: false, // K's and nasty pitches
         "No-Hit Innings": true, // Perfect/no-hit moments
       },
       fielding: {
         "Defensive Plays": true, // Diving catches, throws
         "Double Plays": false, // Smooth double plays
       },
       moments: {
         "Walk-Offs": true, // Game-ending plays
         "Milestone Plays": false, // Records, achievements
       },
     };
     ```
   - Each toggle affects what type of highlights show in "For You"
   - More specific = more targeted content feed
   - Content Preferences: The content preferences are essentially "filters" for the type of highlights the user wants to see in their "For You" feed. I've organized them into categories:
     - Hitting: Home runs, clutch hits, base running plays
     - Pitching: Strikeouts, no-hit innings
     - Fielding: Defensive plays, double plays
     - Moments: Walk-offs, milestones
   - Simple toggle interface
   - Visual examples of each category
   - Affects "For You" feed content mix

5. **Complete**
   - Success animation
   - Quick tutorial overlay
   - Enter main app interface

### Key Features

- Progress bar throughout flow
- Skip option available but not emphasized
- All preferences editable in settings
- Smooth transitions between steps
- Clear back/forward navigation
- Help tooltips where needed

This flow prioritizes:

- Quick, engaging setup
- Visual selection interfaces
- Smart defaults and suggestions
- Clear user feedback
- Flexible customization
