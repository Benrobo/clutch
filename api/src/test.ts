// Internal Testing
import uploadFinalVideo from "./scripts/video-processing/uploadFinalVideo.js";
import MLBAPIHelper from "./helpers/mlb/mlb-api.helper.js";
import fs from "fs/promises";
import path from "path";
import searchWeb from "./services/RAG/tools/searchWeb.js";
import WebCrawler from "./helpers/web-crawler.js";
import { validateImageUrl } from "./lib/utils.js";
import ToolOrchestrator from "./services/RAG/orchestrator.js";
import ContentModeration from "./helpers/content-moderation.js";
import HighlightAIEngine from "./services/RAG/highlight-ai.engine.js";
import HighlightController from "./controllers/highlight.controller.js";

async function mlbTest() {
  // MLB API TEST
  const mlbApi = new MLBAPIHelper();
  console.log("Starting MLB API Tests...\n");

  // Test 1: Get Schedule
  //   console.log("Test 1: Get Schedule");
  //   const schedule = await mlbApi.getSchedule({
  //     startDate: "2024-09-01", // Opening Day 2024
  //     endDate: "2024-12-30",
  //     season: 2024,
  //   });
  //   console.log("Schedule Test:", schedule.totalGames > 0 ? "✅" : "❌");
  //   console.log(`Games found: ${schedule.totalGames}\n`);

  // Test 2: Get Team Schedule
  //   console.log("Test 2: Get Team Schedule");
  //   const braves = 144; // Atlanta Braves
  //   const teamSchedule = await mlbApi.getTeamSchedule(braves, {
  //     startDate: "2024-03-28",
  //     endDate: "2024-04-28",
  //   });
  //   console.log(
  //     "Team Schedule Test:",
  //     teamSchedule.totalGames > 0 ? "✅" : "❌"
  //   );
  //   console.log(`Team games found: ${teamSchedule.totalGames}\n`);

  // Test 3: Get All Teams
  //   console.log("Test 3: Get All Teams");
  //   const teams = await mlbApi.getAllTeams({
  //     activeStatus: true,
  //     // season: 2024,
  //   });
  //   console.log("All Teams Test:", teams.teams.length > 0 ? "✅" : "❌");
  //   console.log(`Active teams found: ${teams.teams.length}\n`);

  // Test 4: Get Single Team
  //   console.log("Test 4: Get Single Team");
  //   const team = await mlbApi.getTeam(143); // Atlanta Braves
  //   console.log("Single Team Test:", team.id === 143 ? "✅" : "❌");
  //   console.log(`Team Name: ${team.name}`);
  //   console.log("Team Logo URLs:");
  //   console.log(team.logo);

  // Test 5: Get Single Player
  //   console.log("Test 5: Get Single Player");
  //   const acuna = 660670; // Ronald Acuña Jr.
  //   const player = await mlbApi.getPlayer(acuna);
  //   console.log("Single Player Test:", player.id === acuna ? "✅" : "❌");
  //   console.log(`Player: ${player.fullName}`);
  //   console.log("Profile Pictures:", player.profilePicture ? "✅" : "❌");
  //   console.log(player.profilePicture, "\n");

  // Test 6: Get Multiple Players
  //   console.log("Test 6: Get Multiple Players");
  //   const playerIds = [660670, 656976]; // Acuña and Matt Olson
  //   const players = await mlbApi.getPlayers(playerIds);
  //   console.log(
  //     "Multiple Players Test:",
  //     players.length === playerIds.length ? "✅" : "❌"
  //   );
  //   console.log(
  //     "Players found:",
  //     players.map((p) => p.fullName).join(", "),
  //     "\n"
  //   );

  // Test 7: Get Team Roster
  //   console.log("Test 7: Get Team Roster");
  //   const roster = await mlbApi.getTeamRoster(114);
  //   console.log("Team Roster Test:", roster.length > 0 ? "✅" : "❌");
  //   console.log(`Roster size: ${roster.length}`);
  //   console.log("First player:", roster[0]?.person?.fullName, "\n");

  // Test 8: Get Game Content
  //   console.log("Test 8: Get Game Content");
  // Use first game from schedule for content test
  //   if (schedule.dates[0]?.games[0]) {
  //     const gamePk = schedule.dates[0].games[0].gamePk;
  //     // const content = await mlbApi.getGameContent(gamePk);
  //     // console.log("Game Content Test:", content.highlights ? "✅" : "❌");
  //     // console.log(
  //     //   `Content items: ${
  //     //     content.highlights?.highlights?.items?.length || 0
  //     //   }\n`
  //     // );

  //     // Test 9: Get Game Highlights
  //     // console.log("Test 9: Get Game Highlights");
  //     // const highlights = await mlbApi.getGameHighlights(gamePk);
  //     // console.log("Game Highlights Test:", highlights ? "✅" : "❌");
  //     // console.log(
  //     //   `Highlights found: ${highlights?.highlights?.items?.length || 0}\n`
  //     // );

  //     // Test 10: Get Live Game
  //     // console.log("Test 10: Get Live Game");
  //     // const liveGame = await mlbApi.getLiveGame(gamePk);
  //     // console.log(
  //     //   "Live Game Test:",
  //     //   liveGame.gamePk === gamePk ? "✅" : "❌"
  //     // );
  //     // console.log(`Game Status: ${liveGame.gameData.status.detailedState}\n`);
  //   }

  // Test 11: Get Player Stats
  // console.log("Test 11: Get Player Stats");
  // const playerId = 660670; // Ronald Acuña Jr.
  // const stats = await mlbApi.getPlayerStats(playerId);
  // console.log("Player Stats Test:", stats ? "✅" : "❌");
  // console.log(stats?.stats[0]?.splits[0]);
}

async function testUploadingVideo() {
  const videoPath = path.join(
    process.cwd(),
    "/public/processed/2_2RLCVD8czMzhJGWp1seVvp/vertical.mp4"
  );

  const { downloadUrl, gcsUri } = await uploadFinalVideo(videoPath);

  console.log("Download URL:", downloadUrl);
  console.log("GCS URI:", gcsUri);
}

(async () => {
  setTimeout(async () => {
    console.log("\n");
    try {
      // await mlbTest();
      // await testUploadingVideo();
      // const result = await searchWeb(
      //   "When was the last time the Guardians won a championship?"
      // );
      // console.log(result);
      // const webCrawler = new WebCrawler();
      // const webMetadata = await webCrawler.getWebsiteMetadata(
      //   `https://apnews.com/article/cleveland-guardians-cecac3263d06ed2b8592ea22488b6b00`
      // );
      // console.log(webMetadata);
      // const validateFavicon = await validateImageUrl(
      //   // "https://wager6.ag/wp-content/uploads/2020/01/cropped-w6logo-2-180x180.png"
      //   "https://apnews.com/apple-touch-icon.png"
      // );
      // console.log({ validateFavicon });

      const toolOrchestrator = new ToolOrchestrator();
      // const result = await toolOrchestrator.queryRoute(
      //   // "Who hit the most home runs in 2021?"
      //   // "What was the last time the Yankees won a championship?"
      //   // "hello"
      //   // "what services do you offer?"
      //   "Hey gemini, wsup. how's your day going."
      // );

      // console.log({ result });

      const contentModerator = new ContentModeration();
      // const result = await contentModerator.safetyCheck(
      //   // "I am a bad person."
      //   // "Hey gemini, wsup. how's your day going."
      //   "hello"
      // );
      // console.log({ result });

      const hlAIEngine = new HighlightAIEngine();
      // const result = await hlAIEngine.generateAIResponse(
      //   "What was the last time the Yankees won a championship?"
      // );

      const highlightController = new HighlightController();
      // const result = await highlightController.getTeamInfo(
      //   ["114", "115"],
      //   "md"
      // );
      // console.log(result);
    } catch (error) {
      console.error("Test Error:", error);
    }
  }, 500);
})();
