import { PrismaClient, Prisma } from "@prisma/client";
import retry from "async-retry";

// Initialize Prisma clients for both DBs
const localDb = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL, // local DB URL
});

const productionDb = new PrismaClient({
  datasourceUrl: process.env.PRODUCTION_DATABASE_URL, // production DB URL
});

// Helper function to check if records match
async function recordsMatch<T extends { id: number | string }>(
  localRecord: T,
  prodRecord: T | null,
  excludeFields: string[] = []
): Promise<boolean> {
  if (!prodRecord) return false;

  const localCopy = { ...localRecord };
  const prodCopy = { ...prodRecord };

  // Remove fields we don't want to compare
  excludeFields.forEach((field) => {
    delete localCopy[field as keyof T];
    delete prodCopy[field as keyof T];
  });

  return JSON.stringify(localCopy) === JSON.stringify(prodCopy);
}

async function migrateMLBData() {
  console.log("\n🚀 Starting MLB data migration to production...\n");

  try {
    // Migrate teams first (no dependencies)
    console.log("🔄 Migrating teams...");
    const teams = await localDb.teams.findMany();
    let teamsUpdated = 0;
    for (const team of teams) {
      const prodTeam = await productionDb.teams.findUnique({
        where: { id: team.id },
      });

      if (!recordsMatch(team, prodTeam)) {
        await productionDb.teams.upsert({
          where: { id: team.id },
          create: {
            id: team.id,
            name: team.name,
            abbreviation: team.abbreviation,
            league: team.league as Prisma.InputJsonValue,
            logo_url: team.logo_url,
          },
          update: {
            name: team.name,
            abbreviation: team.abbreviation,
            league: team.league as Prisma.InputJsonValue,
            logo_url: team.logo_url,
          },
        });
        teamsUpdated++;
      }
    }
    console.log(
      `✅ Migrated ${teamsUpdated} teams (${
        teams.length - teamsUpdated
      } already in sync)`
    );

    // Migrate games (depends on teams)
    console.log("\n🔄 Migrating games...");
    const games = await localDb.games.findMany();
    let gamesUpdated = 0;
    for (const game of games) {
      const prodGame = await productionDb.games.findUnique({
        where: { id: game.id },
      });

      if (!recordsMatch(game, prodGame)) {
        await productionDb.games.upsert({
          where: { id: game.id },
          create: {
            id: game.id,
            date: game.date,
            home_team_id: game.home_team_id,
            away_team_id: game.away_team_id,
            status: game.status,
            season: game.season,
            game_type: game.game_type,
            decisions: game.decisions as Prisma.InputJsonValue,
          },
          update: {
            date: game.date,
            home_team_id: game.home_team_id,
            away_team_id: game.away_team_id,
            status: game.status,
            season: game.season,
            game_type: game.game_type,
            decisions: game.decisions as Prisma.InputJsonValue,
          },
        });
        gamesUpdated++;
      }
    }
    console.log(
      `✅ Migrated ${gamesUpdated} games (${
        games.length - gamesUpdated
      } already in sync)`
    );

    // Migrate highlights (depends on games)
    console.log("\n🔄 Migrating highlights...");
    const highlights = await localDb.highlights.findMany();
    let highlightsUpdated = 0;
    for (const highlight of highlights) {
      const prodHighlight = await productionDb.highlights.findUnique({
        where: { id: highlight.id },
      });

      if (!recordsMatch(highlight, prodHighlight)) {
        await productionDb.highlights.upsert({
          where: { id: highlight.id },
          create: {
            id: highlight.id,
            game_id: highlight.game_id,
          },
          update: {
            game_id: highlight.game_id,
          },
        });
        highlightsUpdated++;
      }
    }
    console.log(
      `✅ Migrated ${highlightsUpdated} highlights (${
        highlights.length - highlightsUpdated
      } already in sync)`
    );

    // Migrate highlights content (depends on highlights)
    console.log("\n🔄 Migrating highlights content...");
    const contents = await localDb.highlights_content.findMany();
    let contentsUpdated = 0;
    for (const content of contents) {
      const prodContent = await productionDb.highlights_content.findUnique({
        where: { id: content.id },
      });

      if (!recordsMatch(content, prodContent)) {
        await productionDb.highlights_content.upsert({
          where: { id: content.id },
          create: {
            id: content.id,
            highlight_id: content.highlight_id,
            title: content.title,
            headline: content.headline,
            keywords: content.keywords,
            body: content.body,
            photo: content.photo,
            sources: content.sources as Prisma.InputJsonValue,
          },
          update: {
            title: content.title,
            headline: content.headline,
            keywords: content.keywords,
            body: content.body,
            photo: content.photo,
            sources: content.sources as Prisma.InputJsonValue,
          },
        });
        contentsUpdated++;
      }
    }
    console.log(
      `✅ Migrated ${contentsUpdated} highlight contents (${
        contents.length - contentsUpdated
      } already in sync)`
    );

    // Migrate highlights playbacks (depends on highlights)
    console.log("\n🔄 Migrating highlights playbacks...");
    const playbacks = await localDb.highlights_playbacks.findMany({
      where: {
        summary: {
          not: null as any,
        },
        transcript: {
          not: null as any,
        },
      },
    });

    console.log(`Found ${playbacks.length} highlights playbacks to check...`);
    let playbacksUpdated = 0;
    for (const playback of playbacks) {
      const prodPlayback = await productionDb.highlights_playbacks.findUnique({
        where: { id: playback.id },
      });

      // Exclude engagement metrics from comparison
      if (!recordsMatch(playback, prodPlayback, ["likes", "views"])) {
        await productionDb.highlights_playbacks.upsert({
          where: {
            id: playback.id,
          },
          create: {
            id: playback.id,
            highlight_id: playback.highlight_id,
            title: playback.title,
            description: playback.description,
            metadata: playback.metadata as Prisma.InputJsonValue,
            thumbnail: playback.thumbnail,
            likes: 0, // Reset engagement metrics
            views: 0,
            mlb_video_url: playback.mlb_video_url,
            mlb_video_duration: playback.mlb_video_duration,
            processed_video_url: playback.processed_video_url,
            processed_video_duration: playback.processed_video_duration,
            orientation: playback.orientation,
            transcript: playback.transcript as Prisma.InputJsonValue,
            translated_transcript:
              playback.translated_transcript as Prisma.InputJsonValue,
            subtitles: playback.subtitles,
            summary: playback.summary as Prisma.InputJsonValue,
            processed: playback.processed,
          },
          update: {
            title: playback.title,
            description: playback.description,
            metadata: playback.metadata as Prisma.InputJsonValue,
            thumbnail: playback.thumbnail,
            mlb_video_url: playback.mlb_video_url,
            mlb_video_duration: playback.mlb_video_duration,
            processed_video_url: playback.processed_video_url,
            processed_video_duration: playback.processed_video_duration,
            orientation: playback.orientation,
            transcript: playback.transcript as Prisma.InputJsonValue,
            translated_transcript:
              playback.translated_transcript as Prisma.InputJsonValue,
            subtitles: playback.subtitles,
            summary: playback.summary as Prisma.InputJsonValue,
            processed: playback.processed,
          },
        });
        playbacksUpdated++;
      }
    }
    console.log(
      `✅ Migrated ${playbacksUpdated} highlight playbacks (${
        playbacks.length - playbacksUpdated
      } already in sync)`
    );

    console.log("\n✨ MLB data migration completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Error during migration:", error);
    throw error;
  } finally {
    // Cleanup connections
    await localDb.$disconnect();
    await productionDb.$disconnect();
  }
}

// Retry logic to automatically recover from temporary errors
const run = async () => {
  try {
    await retry(
      async () => {
        await migrateMLBData();
      },
      {
        retries: 3,
        minTimeout: 2000,
        onRetry: (error) => {
          console.error("\n🔄 Retrying migration due to error:", error);
        },
      }
    );
  } catch (error) {
    console.error("\n❌ Migration failed after retries:", error);
    process.exit(1);
  }
};

// Check for production URL
if (!process.env.PRODUCTION_DATABASE_URL) {
  console.error(
    "\n❌ PRODUCTION_DATABASE_URL environment variable is required"
  );
  process.exit(1);
}

run();
