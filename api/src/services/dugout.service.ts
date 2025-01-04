import {
  GAME_LEVELS,
  GAME_PROGRESSION_CHALLENGES,
} from "../constant/dugout.js";
import prisma from "../prisma/index.js";
import { CompletedChallenges, GameLevel } from "../types/dugout.types.js";

export default class DugoutService {
  async getUserGamesProgress(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        dugout_game_progress: true,
      },
    });

    return user?.dugout_game_progress;
  }

  async getGameProgress(gameId: string, userId: string) {
    return await prisma.dugout_game_progress.findFirst({
      where: {
        dugout_game_id: gameId,
        user_id: userId,
      },
    });
  }

  async joinGame(gameId: string, userId: string, uuid?: string) {
    return await prisma.dugout_game_progress.create({
      data: {
        dugout_game_id: gameId,
        level: "apprentice",
        user_id: userId,
        id: uuid,
        total_challenges:
          GAME_PROGRESSION_CHALLENGES[
            gameId as keyof typeof GAME_PROGRESSION_CHALLENGES
          ].apprentice,
        completed_challenges: {
          apprentice: [],
          planetary: [],
          stellar: [],
        },
      },
    });
  }

  async completeChallenge(
    gameId: string,
    userId: string,
    level: GameLevel,
    challengeId: number
  ) {
    const game = await prisma.dugout_game_progress.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error("Game not found");
    }

    const completedChallenges =
      game.completed_challenges as CompletedChallenges;

    const updatedGame = await prisma.dugout_game_progress.update({
      where: { id: gameId, user_id: userId },
      data: {
        completed_challenges: {
          ...completedChallenges,
          [level as keyof CompletedChallenges]: [
            ...(completedChallenges[level as keyof CompletedChallenges] || []),
            challengeId,
          ],
        },
      },
    });

    return updatedGame;
  }

  async upgradeLevel(gameId: string, userId: string) {
    let result: {
      error: string | null;
      success: boolean;
    } = {
      error: null,
      success: false,
    };
    return await prisma.$transaction(async (tx) => {
      // check if the user has completed all the challenges for the current level
      const game = await tx.dugout_game_progress.findFirst({
        where: { dugout_game_id: gameId, user_id: userId },
      });

      if (!game) {
        result.error = "Game not found";
        return result;
      }

      const completedChallenges =
        game.completed_challenges as CompletedChallenges;

      const level = game.level as GameLevel;

      const totalChallenges =
        GAME_PROGRESSION_CHALLENGES[
          game.dugout_game_id as keyof typeof GAME_PROGRESSION_CHALLENGES
        ][level as keyof CompletedChallenges];

      if (
        completedChallenges[level as keyof CompletedChallenges].length ===
        totalChallenges
      ) {
        const nextLevel = GAME_LEVELS[GAME_LEVELS.indexOf(level) + 1];
        if (nextLevel) {
          // upgrade the level
          await tx.dugout_game_progress.update({
            where: { id: gameId, user_id: userId },
            data: { level: nextLevel as string },
          });
          result.success = true;
        } else {
          result.error = "No next level found";
        }
      } else {
        console.log(
          `Not all challenges completed for ${game.dugout_game_id} at level ${level}`
        );
        result.error = "Not all challenges completed";
      }

      return result;
    });
  }
}
