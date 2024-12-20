import MLBAPIHelper from "../helpers/mlb/mlb-api.helper.js";
import { inngestClient } from "../config/inngest.js";
import GameService from "../services/game.service.js";
import { TRACK_MLB_SEASON } from "../constant/mlb.js";
import redis from "../config/redis.js";
import { MLBScheduleResponse, MLBGame, MLBPlayer } from "../types/mlb.types.js";
import dayjs from "dayjs";

const SCHEDULE_PROCESSING_KEY = "mlb-schedule-processing-date";
const mlbApi = new MLBAPIHelper({
  season: TRACK_MLB_SEASON,
  sportId: 1,
});
const gameService = new GameService();

export const generateGameHighlightsMetadata = inngestClient.createFunction(
  { id: "generate-game-highlights-metadata" },
  { event: "generate-game-highlights-metadata" },
  async () => {
    console.log(`🔃 Starting MLB game highlights generation...`);
    await processMLBSchedule();
  }
);

processMLBSchedule();

async function processMLBSchedule() {
  const scheduleResponse = (await mlbApi.getSchedule({
    gameType: "R",
  })) as MLBScheduleResponse;

  const currentProcessingDate = await redis.get(SCHEDULE_PROCESSING_KEY);

  if (!currentProcessingDate) {
    await redis.set(SCHEDULE_PROCESSING_KEY, scheduleResponse.dates[0].date);
    console.log(
      `📅 Processing games for date: ${scheduleResponse.dates[0].date}`
    );

    await processGamesForDate(scheduleResponse.dates[0].games);
  } else {
    console.log(`📅 Processing games for date: ${currentProcessingDate}`);

    const scheduleGame = await processGamesForDate(
      scheduleResponse?.dates.find((d) => d.date === currentProcessingDate)
        ?.games || []
    );
  }
}

async function processGamesForDate(games: MLBGame[]) {
  const gamesCount = games.length;
  let processedGames = 0;
  for (const game of games) {
    try {
      if (processedGames === gamesCount) {
        await redis.del(SCHEDULE_PROCESSING_KEY);
        console.log(
          `📅 Finished processing games for date: ${dayjs(game.gameDate).format(
            "YYYY-MM-DD"
          )}`
        );
        break;
      }

      const existingGame = await gameService.findGameById(game.gamePk);
      if (existingGame) {
        console.log(`⏭️  Skipping processed game: ${game.gamePk}`);
        return;
      }

      const liveGameData = await mlbApi.getLiveGame(game.gamePk);
      if (!liveGameData) {
        console.log(`❌ No live data available for game: ${game.gamePk}`);
        return;
      }

      console.log(`✨ Processing live game: ${game.gamePk}`);

      const gameStatus = game.status?.abstractGameState;
      const gameDecisions = liveGameData?.liveData?.decisions;
      const gameType = game.gameType;

      // teams
      const homeTeam = liveGameData?.gameData?.teams?.home;
      const awayTeam = liveGameData?.gameData?.teams?.away;

      const homeLeague = homeTeam?.league;
      const homeTeamName = homeTeam?.teamName;
      const homeTeamAbbr = homeTeam?.abbreviation;
      const homeTeamId = homeTeam?.id;

      const awayLeague = awayTeam?.league;
      const awayTeamName = awayTeam?.teamName;
      const awayTeamAbbr = awayTeam?.abbreviation;
      const awayTeamId = awayTeam?.id;

      const homeTeamLogo = mlbApi.getTeamLogo(homeTeamId);
      const awayTeamLogo = mlbApi.getTeamLogo(awayTeamId);

      // players
      const teamRosters = formatPlayers(
        liveGameData?.gameData?.players ?? {}
      )?.map((p) => ({
        id: p.id,
        fullname: p.fullName,
        age: p.currentAge,
        height: p.height,
        gender: p.gender,
        verified: p.isVerified,
        position: p?.primaryPosition?.name,
        profile_pic: mlbApi.getPlayerProfilePictures(p.id)?.medium,
        stats: {
          batSide: p.batSide,
          pitchHand: p.pitchHand,
        },
      }));

      // highlights
      const gameContent = await mlbApi.getGameContent(game.gamePk);

      console.log({ gameContent });

      //   console.log({
      //     home: {
      //       homeLeague,
      //       homeTeamName,
      //       homeTeamAbbr,
      //       homeTeamLogo,
      //     },
      //     away: {
      //       awayLeague,
      //       awayTeamName,
      //       awayTeamAbbr,
      //       awayTeamLogo,
      //     },
      //   });
      //   console.log(teamRosters);
    } catch (error) {
      console.error(`❌ Error processing game ${game.gamePk}:`, error);
    }
  }
}

function formatPlayers(data: Record<string, MLBPlayer>) {
  const players: MLBPlayer[] = [];
  for (const [key, value] of Object.entries(data)) {
    players.push(value);
  }
  return players;
}
