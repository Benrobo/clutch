import MLBAPIHelper from "../helpers/mlb/mlb-api.helper.js";
import { inngestClient } from "../config/inngest.js";
import GameService from "../services/game.service.js";
import { PLAYBACK_CONSTRAINT, TRACK_MLB_SEASON } from "../constant/mlb.js";
import redis from "../config/redis.js";
import { MLBScheduleResponse, MLBGame, MLBPlayer } from "../types/mlb.types.js";
import dayjs from "dayjs";
import { htmlToMarkdown } from "../helpers/turndown.js";
import { checkDurationConstraints } from "../lib/utils.js";
import retry from "async-retry";
import shortUUID from "short-uuid";

const SCHEDULE_PROCESSING_DATES_KEY = "mlb-schedule-processing-dates";
const mlbApi = new MLBAPIHelper({
  season: TRACK_MLB_SEASON,
  sportId: 1,
});
const gameService = new GameService();

export const generateGameHighlightsMetadata = inngestClient.createFunction(
  { id: "generate-game-highlights-metadata" },
  { event: "generate-game-highlights-metadata" },
  async () => {
    console.log(`\n🔃 Starting MLB game highlights generation...`);
    // await processMLBSchedule();
  }
);

// processMLBSchedule();

async function getProcessingDates(): Promise<string[]> {
  try {
    const datesStr = await redis.get(SCHEDULE_PROCESSING_DATES_KEY);
    if (!datesStr) return [];

    const dates = JSON.parse(datesStr);
    if (!Array.isArray(dates)) {
      console.warn(
        "Invalid processing dates format in Redis, resetting to empty array"
      );
      await redis.set(SCHEDULE_PROCESSING_DATES_KEY, "[]");
      return [];
    }

    return dates;
  } catch (error) {
    console.warn(
      "Error parsing processing dates from Redis, resetting to empty array:",
      error
    );
    await redis.set(SCHEDULE_PROCESSING_DATES_KEY, "[]");
    return [];
  }
}

async function getNextScheduleDate(scheduleResponse: MLBScheduleResponse) {
  const [processingDates, lastProcessedGame] = await Promise.all([
    getProcessingDates(),
    prisma.games.findFirst({
      orderBy: {
        date: "desc",
      },
      select: {
        date: true,
      },
    }),
  ]);

  // Find the first available date that isn't being processed and is after the last processed date
  return scheduleResponse.dates.find(
    (d) =>
      !processingDates.includes(d.date) &&
      (!lastProcessedGame || dayjs(d.date).isAfter(lastProcessedGame.date))
  )?.date;
}

async function addProcessingDate(date: string) {
  const dates = await getProcessingDates();
  dates.push(date);
  await redis.set(SCHEDULE_PROCESSING_DATES_KEY, JSON.stringify(dates));
}

async function removeProcessingDate(date: string) {
  const dates = await getProcessingDates();
  const updatedDates = dates.filter((d) => d !== date);
  await redis.set(SCHEDULE_PROCESSING_DATES_KEY, JSON.stringify(updatedDates));
}

async function processMLBSchedule() {
  try {
    await retry(
      async () => {
        const scheduleResponse = (await mlbApi.getSchedule({
          gameType: "R",
        })) as MLBScheduleResponse;

        const nextScheduleDate = await getNextScheduleDate(scheduleResponse);

        if (!nextScheduleDate) {
          console.log("No more dates to process in the schedule");
          return;
        }

        console.log(`📅 Processing games for date: ${nextScheduleDate}`);

        // Add date to processing list
        await addProcessingDate(nextScheduleDate);

        try {
          // Store the current date as previous before updating to new date
          // await redis.set(SCHEDULE_PROCESSING_DATES_KEY, nextScheduleDate);

          const gamesForDate =
            scheduleResponse.dates.find((d) => d.date === nextScheduleDate)
              ?.games || [];

          await processGamesForDate(gamesForDate);

          // Successfully processed - remove from processing list
          await removeProcessingDate(nextScheduleDate);
        } catch (error) {
          // If there's an error, remove the date from processing list
          await removeProcessingDate(nextScheduleDate);
          throw error; // Re-throw to trigger retry
        }
      },
      {
        retries: 3,
        minTimeout: 2000,
        onRetry: (e) => {
          console.error(`Error processing MLB schedule:`, e);
          console.log(`Retrying operation...`);
        },
      }
    );
  } catch (err) {
    console.error(`Error processing MLB schedule: ${err}`);
    console.error(err);
  }
}

async function processGamesForDate(games: MLBGame[]) {
  console.log(`📅 Processing ${games.length} games...`);

  for (const game of games) {
    try {
      const existingGame = await gameService.findGameById(game.gamePk);
      if (existingGame) {
        console.log(`⏭️  Skipping processed game: ${game.gamePk}`);
        continue;
      }

      const liveGameData = await mlbApi.getLiveGame(game.gamePk);
      if (!liveGameData) {
        console.log(`❌ No live data available for game: ${game.gamePk}`);
        continue;
      }

      console.log(`✨ Processing live game: ${game.gamePk}`);

      const gamePk = game.gamePk;
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
      const awayTeamId = awayTeam?.id;
      const awayLeague = awayTeam?.league;
      const awayTeamName = awayTeam?.teamName;
      const awayTeamAbbr = awayTeam?.abbreviation;

      const homeTeamLogo = mlbApi.getTeamLogo(homeTeamId);
      const awayTeamLogo = mlbApi.getTeamLogo(awayTeamId);

      // players
      // This would have been used, but the live data doesn't have anyway to determine
      // what team a player belongs to.
      // const teamRosters = formatPlayers(
      //   liveGameData?.gameData?.players ?? {}
      // )?.map((p) => ({
      //   id: p.id,
      //   fullname: p.fullName,
      //   age: p.currentAge,
      //   height: p.height,
      //   gender: p.gender,
      //   verified: p.isVerified,
      //   position: p?.primaryPosition?.name,
      //   profile_pic: mlbApi.getPlayerProfilePictures(p.id)?.medium,
      //   stats: {
      //     batSide: p.batSide,
      //     pitchHand: p.pitchHand,
      //   },
      // }));

      // UPDATE: There's no point storing this players data in our DB since the
      // API provides an endpoint where it can be retrieved without ratelimiting.

      // const homeTeamPlayers = await getTeamRoster(homeTeamId);
      // const awayTeamPlayers = await getTeamRoster(awayTeamId);
      // const homeTeamPlayersFormatted = homeTeamPlayers.map((p) => ({
      //   id: p.id,
      //   fullname: p.fullName,
      //   age: p.currentAge,
      //   height: p.height,
      //   gender: p.gender,
      //   verified: p.isVerified,
      //   position: p?.primaryPosition?.name,
      //   profile_pic: mlbApi.getPlayerProfilePictures(p.id)?.medium,
      //   stats: {
      //     batSide: p.batSide,
      //     pitchHand: p.pitchHand,
      //   } as any,
      //   team_id: homeTeamId,
      // }));
      // const awayTeamPlayersFormatted = awayTeamPlayers.map((p) => ({
      //   id: p.id,
      //   fullname: p.fullName,
      //   age: p.currentAge,
      //   height: p.height,
      //   gender: p.gender,
      //   verified: p.isVerified,
      //   position: p?.primaryPosition?.name,
      //   profile_pic: mlbApi.getPlayerProfilePictures(p.id)?.medium,
      //   stats: {
      //     batSide: p.batSide,
      //     pitchHand: p.pitchHand,
      //   } as any,
      //   team_id: awayTeamId,
      // }));

      // highlights
      const gameContent = await mlbApi.getGameContent(game.gamePk);
      const recap = gameContent?.editorial?.recap?.mlb;
      const highlightContent = {
        title: recap?.seoTitle,
        headline: recap?.headline,
        keywords: recap?.keywordsAll.map((k) => k.displayName),
        body: htmlToMarkdown(recap?.body!),
        photo: recap?.photo?.cuts[0]?.src,
      };

      const highlightsPlaybacks: {
        url: string; // video url
        duration: string;
        title: string;
        description: string;
      }[] = [];

      for (const playback of gameContent?.highlights?.highlights?.items ?? []) {
        const videoPlayback = playback?.playbacks?.find(
          (p) => p.name === "mp4Avc"
        );
        if (videoPlayback) {
          // Check if duration is between 1-5 minutes
          const validMinutesConstraints = checkDurationConstraints(
            playback?.duration,
            {
              type: "minutes",
              min: PLAYBACK_CONSTRAINT.MIN.MINUTES,
              max: PLAYBACK_CONSTRAINT.MAX.MINUTES,
            }
          );

          // Check if duration is between 15-59 seconds (only for videos under 1 minute)
          const [hours, minutes] = playback?.duration.split(":").map(Number);
          const validSecondsConstraints =
            hours === 0 &&
            minutes === 0 &&
            checkDurationConstraints(playback?.duration, {
              type: "seconds",
              min: PLAYBACK_CONSTRAINT.MIN.SECONDS,
              max: PLAYBACK_CONSTRAINT.MAX.SECONDS,
            });

          // console.log(
          //   `Checking duration for "${playback.title}":`,
          //   `\n- Duration: ${playback.duration}`,
          //   `\n- Valid for 1-5 minutes: ${validMinutesConstraints}`,
          //   `\n- Valid for 15-59 seconds: ${validSecondsConstraints}`
          // );

          if (validMinutesConstraints || validSecondsConstraints) {
            highlightsPlaybacks.push({
              url: videoPlayback?.url,
              duration: playback.duration,
              title: playback.title,
              description: playback.description,
            });
          } else {
            console.log(
              `⏭️ Skipping "${playback.title}" - ${playback.duration} outside of allowed ranges`
            );
          }
        }
      }

      // save data in db
      await retry(
        async () => {
          await prisma.$transaction(async (tx) => {
            // Create game
            const createdGame = await tx.games.upsert({
              where: { id: gamePk },
              update: {},
              create: {
                id: gamePk,
                home_team_id: homeTeamId,
                away_team_id: awayTeamId,
                game_type: gameType,
                status: gameStatus,
                date: game.gameDate,
                decisions: gameDecisions as any,
                season: dayjs(game.gameDate).year(),
              },
            });

            if (!createdGame) {
              throw new Error(`Error creating game: ${gamePk}`);
            }

            // Create teams
            if (
              !homeTeamName ||
              !homeTeamAbbr ||
              !homeTeamLogo ||
              !homeLeague ||
              !awayTeamName ||
              !awayTeamAbbr ||
              !awayTeamLogo ||
              !awayLeague
            ) {
              throw new Error(`Missing required team data for game ${gamePk}`);
            }

            await Promise.all([
              tx.teams.upsert({
                where: { id: homeTeamId },
                update: {},
                create: {
                  id: homeTeamId,
                  name: homeTeamName,
                  abbreviation: homeTeamAbbr,
                  logo_url: homeTeamLogo,
                  league: homeLeague as any,
                },
              }),
              tx.teams.upsert({
                where: { id: awayTeamId },
                update: {},
                create: {
                  id: awayTeamId,
                  name: awayTeamName,
                  abbreviation: awayTeamAbbr,
                  logo_url: awayTeamLogo,
                  league: awayLeague as any,
                },
              }),
            ]);

            // UPDATE: No need to store this data in our DB since the API provides an endpoint
            // where it can be retrieved without ratelimiting.

            // Create players
            // await Promise.all([
            //   ...homeTeamPlayersFormatted.map(async (player) => {
            //     // First check if player exists by ID or name
            //     const existingPlayer = await tx.players.findFirst({
            //       where: {
            //         OR: [{ id: player.id }, { fullname: player.fullname }],
            //       },
            //     });

            //     // If player doesn't exist, create them
            //     const playerRecord =
            //       existingPlayer ||
            //       (await tx.players.create({
            //         data: {
            //           id: player.id,
            //           fullname: player.fullname,
            //           age: player.age,
            //           height: player.height,
            //           gender: player.gender,
            //           verified: player.verified,
            //           profile_pic: player.profile_pic,
            //         },
            //       }));

            //     // Create or update team reference
            //     await tx.player_team_refs.upsert({
            //       where: {
            //         player_id_team_id: {
            //           player_id: playerRecord.id,
            //           team_id: player.team_id,
            //         },
            //       },
            //       update: {
            //         position: player.position,
            //         stats: player.stats,
            //       },
            //       create: {
            //         player_id: playerRecord.id,
            //         team_id: player.team_id,
            //         position: player.position,
            //         stats: player.stats,
            //       },
            //     });
            //   }),
            //   ...awayTeamPlayersFormatted.map(async (player) => {
            //     // First check if player exists by ID or name
            //     const existingPlayer = await tx.players.findFirst({
            //       where: {
            //         OR: [{ id: player.id }, { fullname: player.fullname }],
            //       },
            //     });

            //     // If player doesn't exist, create them
            //     const playerRecord =
            //       existingPlayer ||
            //       (await tx.players.create({
            //         data: {
            //           id: player.id,
            //           fullname: player.fullname,
            //           age: player.age,
            //           height: player.height,
            //           gender: player.gender,
            //           verified: player.verified,
            //           profile_pic: player.profile_pic,
            //         },
            //       }));

            //     // Create or update team reference
            //     await tx.player_team_refs.upsert({
            //       where: {
            //         player_id_team_id: {
            //           player_id: playerRecord.id,
            //           team_id: player.team_id,
            //         },
            //       },
            //       update: {
            //         position: player.position,
            //         stats: player.stats,
            //       },
            //       create: {
            //         player_id: playerRecord.id,
            //         team_id: player.team_id,
            //         position: player.position,
            //         stats: player.stats,
            //       },
            //     });
            //   }),
            // ]);

            // Create highlights
            let highlight = await tx.highlights.findFirst({
              where: { game_id: gamePk },
            });

            if (!highlight) {
              highlight = await tx.highlights.create({
                data: {
                  game_id: gamePk,
                  id: shortUUID.generate(),
                },
              });
            }

            // Create highlight playbacks
            await Promise.all(
              highlightsPlaybacks.map(async (playback) => {
                const exists = await tx.highlights_playbacks.findFirst({
                  where: { mlb_video_url: playback.url },
                });

                if (!exists) {
                  await tx.highlights_playbacks.create({
                    data: {
                      mlb_video_url: playback.url,
                      mlb_video_duration: playback.duration,
                      title: playback.title,
                      description: playback?.description ?? "N/A",
                      highlight: {
                        connect: { id: highlight!.id },
                      },
                    },
                  });
                }
              })
            );

            // Create highlight content
            await tx.highlights_content.upsert({
              where: { highlight_id: highlight!.id },
              update: {},
              create: {
                photo: highlightContent?.photo!,
                title: highlightContent?.title!,
                headline: highlightContent?.headline!,
                keywords: highlightContent?.keywords!,
                body: highlightContent?.body!,
                highlight: {
                  connect: { id: highlight!.id },
                },
              },
            });
          });

          console.log(`\n✅ Game ${gamePk} processed successfully\n`);
          return true;
        },
        {
          retries: 3,
          onRetry: (e) => {
            console.error(`Error processing game ${game.gamePk}:`, e);
            console.log(`Retrying operation...`);
          },
        }
      );
    } catch (error) {
      console.error(`❌ Error processing game ${game.gamePk}:`, error);
      throw new Error(`Error processing game ${game.gamePk}: ${error}`);
    }
  }
}

async function getTeamRoster(teamId: number) {
  const teamRosters = await mlbApi.getTeamRoster(teamId);
  let teamPlayers: MLBPlayer[] = [];
  if (teamRosters.length > 0) {
    teamPlayers = await Promise.all(
      teamRosters.map(async (p) => {
        return await mlbApi.getPlayer(p.person.id);
      })
    );
  }
  return teamPlayers;
}

function formatPlayers(data: Record<string, MLBPlayer>) {
  const players: MLBPlayer[] = [];
  for (const [key, value] of Object.entries(data)) {
    players.push(value);
  }
  return players;
}
