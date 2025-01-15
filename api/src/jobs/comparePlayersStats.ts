import { inngestClient } from "../config/inngest.js";
import redis from "../config/redis.js";
import retry from "async-retry";
import MatchupAIEngine from "../services/RAG/matchup-ai.engine.js";
import prisma from "../prisma/index.js";
import { JobStatus } from "@prisma/client";

export const comparePlayersStats = inngestClient.createFunction(
  {
    id: "compare-players-stats",
    retries: 1,
    onFailure: async ({ event }) => {
      console.log(`🔃 Compare players stats job failed`, event);
      const jobId = event.data?.event?.data?.jobId;
      const matchupId = event.data?.event?.data?.matchupId;
      if (!jobId || !matchupId) return;

      await prisma.$transaction(async (tx) => {
        await tx.jobs.update({
          where: { id: jobId },
          data: {
            status: JobStatus.FAILED,
            error: event.data?.error?.message,
            output_data: {
              error: event.data?.error?.message,
            } as unknown as never,
          },
        });

        await tx.matchups.update({
          where: { id: matchupId },
          data: {
            highlights: null as any,
            player_position_stats: null as any,
            error: event.data?.error?.message,
          },
        });
      });
    },
  },
  {
    event: "compare-players-stats",
  },
  async ({ step, event }) => {
    console.log(`🔃 Compare players stats job started`);
    const matchupId = event.data.matchupId;
    const jobId = event.data.jobId;

    // update job status
    await prisma.jobs.update({
      where: { id: jobId },
      data: { started: true },
    });

    // generate matchup highlights
    const matchupAIEngine = new MatchupAIEngine();
    const matchupHighlights = await matchupAIEngine.generateMatchupHighlights(
      matchupId
    );

    await prisma.$transaction(async (tx) => {
      await tx.jobs.update({
        where: { id: jobId },
        data: {
          output_data: matchupHighlights as any,
          status: JobStatus.COMPLETED,
          error: null,
        },
      });

      await tx.matchups.update({
        where: { id: matchupId },
        data: {
          highlights: {
            analysis: matchupHighlights?.analysis,
            playerOfTheDay: matchupHighlights?.playerOfTheDay,
          } as any,
          player_position_stats: matchupHighlights?.playerMetadata as any,
          error: null,
        },
      });
    });

    console.log(`✅ Players matchup stats completed`);
    return matchupHighlights;
  }
);
