import { PrismaClient, Prisma } from "@prisma/client";
import retry from "async-retry";

// Initialize Prisma clients for both DBs
const localDb = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL, // local DB URL
});

const productionDb = new PrismaClient({
  datasourceUrl: process.env.PRODUCTION_DATABASE_URL, // production DB URL
});

async function migrateMLBData() {
  console.log("\n🚀 Starting MLB data migration to production...\n");

  try {
    // Migrate teams first (no dependencies)
    console.log("🔄 Migrating teams...");
    const teams = await localDb.teams.findMany();
    for (const team of teams) {
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
    }
    console.log(`✅ Migrated ${teams.length} teams`);

    // Migrate games (depends on teams)
    console.log("\n🔄 Migrating games...");
    const games = await localDb.games.findMany();
    for (const game of games) {
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
    }
    console.log(`✅ Migrated ${games.length} games`);

    // Migrate highlights (depends on games)
    console.log("\n🔄 Migrating highlights...");
    const highlights = await localDb.highlights.findMany();
    for (const highlight of highlights) {
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
    }
    console.log(`✅ Migrated ${highlights.length} highlights`);

    // Migrate highlights content (depends on highlights)
    console.log("\n🔄 Migrating highlights content...");
    const contents = await localDb.highlights_content.findMany();
    for (const content of contents) {
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
    }
    console.log(`✅ Migrated ${contents.length} highlight contents`);

    // Migrate highlights playbacks (depends on highlights)
    console.log("\n🔄 Migrating highlights playbacks...");
    const playbacks = await localDb.highlights_playbacks.findMany();
    for (const playback of playbacks) {
      await productionDb.highlights_playbacks.upsert({
        where: { id: playback.id },
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
    }
    console.log(`✅ Migrated ${playbacks.length} highlight playbacks`);

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
