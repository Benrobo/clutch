import {
  GAME_LEVELS,
  GAME_PROGRESSION_CHALLENGES,
} from "../constant/dugout.js";
import prisma from "../prisma/index.js";
import { CompletedChallenges, GameLevel } from "../types/dugout.types.js";

type ResultCode =
  | "CURRENT_CHALLENGE"
  | "NEW_CHALLENGE"
  | "LEVEL_UP"
  | "GAME_COMPLETE"
  | "GAME_NOT_FOUND"
  | "INVALID_GAME_STATE";

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

  async joinGame(
    gameId: string,
    userId: string,
    uuid?: string,
    challengeId?: number
  ) {
    return await prisma.dugout_game_progress.create({
      data: {
        dugout_game_id: gameId,
        level: "apprentice",
        user_id: userId,
        id: uuid,
        total_challenges:
          GAME_PROGRESSION_CHALLENGES[
            gameId as keyof typeof GAME_PROGRESSION_CHALLENGES
          ].apprentice.count,
        completed_challenges: {
          apprentice: {
            completed: false,
            played_challenges: [],
          },
          planetary: {
            completed: false,
            played_challenges: [],
          },
          stellar: {
            completed: false,
            played_challenges: [],
          },
        },
        current_challenge: challengeId ? challengeId.toString() : null,
      },
    });
  }

  async getUserGameLevel(gameId: string, userId: string) {
    return await prisma.dugout_game_progress.findFirst({
      where: { dugout_game_id: gameId, user_id: userId },
      select: { level: true, completed_challenges: true },
    });
  }

  async getGameChallenge(
    gameId: string,
    level: GameLevel,
    challengeId: number
  ) {
    const gameChallenges =
      GAME_PROGRESSION_CHALLENGES[
        gameId as keyof typeof GAME_PROGRESSION_CHALLENGES
      ][level as keyof CompletedChallenges]?.challenges;

    return gameChallenges?.find((challenge) => challenge.id === challengeId);
  }

  async completeChallenge(
    gameId: string,
    userId: string,
    level: GameLevel,
    challengeId: number
  ) {
    const game = await prisma.dugout_game_progress.findFirst({
      where: { dugout_game_id: gameId, user_id: userId },
    });

    if (!game) {
      throw new Error("Game not found");
    }

    const completedChallenges =
      game.completed_challenges as CompletedChallenges;
    const playedChallenges = completedChallenges[level].played_challenges;
    const nonDuplicateChallenges = [...playedChallenges, challengeId].filter(
      (id, index, self) => self.indexOf(id) === index
    );

    const allChallenges = GAME_PROGRESSION_CHALLENGES[
      gameId as keyof typeof GAME_PROGRESSION_CHALLENGES
    ][level].challenges.sort((a, b) => a.id - b.id); // Sort challenges by ID

    const totalChallenges = allChallenges.length;
    const isLevelComplete = nonDuplicateChallenges.length === totalChallenges;
    const nextLevel = isLevelComplete
      ? GAME_LEVELS[GAME_LEVELS.indexOf(level) + 1]
      : level;

    // Find the next challenge in sequence
    const currentChallengeIndex = allChallenges.findIndex(
      (c) => c.id === challengeId
    );
    const nextChallenge = allChallenges[currentChallengeIndex + 1];

    const updatedCompletedChallenges = {
      ...completedChallenges,
      [level]: {
        completed: isLevelComplete,
        played_challenges: nonDuplicateChallenges,
      },
    };

    const updatedGame = await prisma.dugout_game_progress.update({
      where: {
        dugout_game_id: gameId,
        id: game?.id,
        user_id: userId,
      },
      data: {
        completed_challenges: updatedCompletedChallenges,
        points: {
          increment:
            GAME_PROGRESSION_CHALLENGES[
              gameId as keyof typeof GAME_PROGRESSION_CHALLENGES
            ][level].points,
        },
        ...(isLevelComplete && nextLevel && { level: nextLevel }),
        // Set the next challenge ID, or null if level is complete
        current_challenge: isLevelComplete
          ? null
          : nextChallenge?.id.toString() ?? null,
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
        ][level as keyof CompletedChallenges].count;

      if (
        completedChallenges[level as keyof CompletedChallenges]
          .played_challenges.length === totalChallenges
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

  async getGameLevelChallenges(gameId: string, level: GameLevel) {
    return GAME_PROGRESSION_CHALLENGES[
      gameId as keyof typeof GAME_PROGRESSION_CHALLENGES
    ][level as keyof CompletedChallenges]?.challenges;
  }

  async getUserStats(userId: string) {
    return await prisma.dugout_game_progress.findMany({
      where: { user_id: userId },
      select: { points: true, level: true, dugout_game_id: true },
    });
  }

  async getUserPointsByGameId(gameId: string, userId: string) {
    return await prisma.dugout_game_progress.findFirst({
      where: { dugout_game_id: gameId, user_id: userId },
      select: { points: true },
    });
  }

  async getGamePoints(gameId: string, userId: string) {
    return await prisma.dugout_game_progress.findFirst({
      where: { dugout_game_id: gameId, user_id: userId },
      select: { points: true },
    });
  }

  async getCurrentOrNextChallenge(gameId: string, userId: string) {
    let result: {
      error: string | null;
      success: boolean;
      data: any | null;
      code: ResultCode;
    } = {
      error: null,
      success: false,
      data: null,
      code: "INVALID_GAME_STATE",
    };

    const game = await prisma.dugout_game_progress.findFirst({
      where: { dugout_game_id: gameId, user_id: userId },
    });

    if (!game) {
      result.error = "Game not found";
      result.code = "GAME_NOT_FOUND";
      return result;
    }

    const currentLevel = game.level as GameLevel;
    const completedChallenges =
      game.completed_challenges as CompletedChallenges;
    const playedChallenges =
      completedChallenges[currentLevel].played_challenges;

    // If there's a current challenge, return that challenge
    if (game.current_challenge) {
      const currentChallengeId = parseInt(game.current_challenge);
      const challenge = await this.getGameChallenge(
        gameId,
        currentLevel,
        currentChallengeId
      );
      result.success = true;
      result.data = challenge;
      result.code = "CURRENT_CHALLENGE";
      return result;
    }

    // Get all challenges for the current level
    const allChallenges =
      GAME_PROGRESSION_CHALLENGES[
        gameId as keyof typeof GAME_PROGRESSION_CHALLENGES
      ][currentLevel].challenges;

    // Filter out played challenges and sort by ID
    const unplayedChallenges = allChallenges
      .filter((challenge) => !playedChallenges.includes(challenge.id))
      .sort((a, b) => a.id - b.id); // Sort in ascending order by ID

    // If no unplayed challenges in current level, try to level up
    if (unplayedChallenges.length === 0) {
      const nextLevel = GAME_LEVELS[GAME_LEVELS.indexOf(currentLevel) + 1];

      // Check if next level exists AND has challenges defined
      if (
        !nextLevel ||
        !GAME_PROGRESSION_CHALLENGES[
          gameId as keyof typeof GAME_PROGRESSION_CHALLENGES
        ][nextLevel as GameLevel]
      ) {
        result.error = "No more challenges or levels available";
        result.code = "GAME_COMPLETE";
        return result;
      }

      // Update user's level
      await prisma.dugout_game_progress.update({
        where: { id: game.id },
        data: {
          level: nextLevel,
          current_challenge: null,
        },
      });

      // Get challenges for the new level and select first one
      const nextLevelChallenges = GAME_PROGRESSION_CHALLENGES[
        gameId as keyof typeof GAME_PROGRESSION_CHALLENGES
      ][nextLevel as GameLevel].challenges.sort((a, b) => a.id - b.id); // Sort in ascending order by ID

      const selectedChallenge = nextLevelChallenges[0]; // Take first challenge after sorting

      // Update the current challenge
      await prisma.dugout_game_progress.update({
        where: { id: game.id },
        data: {
          current_challenge: selectedChallenge.id.toString(),
        },
      });

      result.success = true;
      result.data = selectedChallenge;
      result.code = "LEVEL_UP";
      return result;
    }

    // Select the first challenge after sorting
    const selectedChallenge = unplayedChallenges[0];

    // Update the current challenge in the database
    await prisma.dugout_game_progress.update({
      where: {
        id: game.id,
      },
      data: {
        current_challenge: selectedChallenge.id.toString(),
      },
    });

    result.success = true;
    result.data = selectedChallenge;
    result.code = "NEW_CHALLENGE";
    return result;
  }
}
