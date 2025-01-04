import { Context } from "hono";
import DugoutService from "../services/dugout.service.js";
import sendResponse from "../lib/send-response.js";
import { HttpException } from "../lib/exception.js";
import shortUUID from "short-uuid";
import { GAME_LEVELS, VALID_GAME_IDS } from "../constant/dugout.js";
import {
  CompletedChallenges,
  GameLevel,
  VALID_GAME_IDS as VALID_GAME_IDS_TYPE,
} from "../types/dugout.types.js";

class DugoutController {
  private dugoutService: DugoutService;

  constructor() {
    this.dugoutService = new DugoutService();
  }

  async getUserGamesProgress(c: Context) {
    const user = c.get("user");

    if (!user?.id) {
      throw new HttpException("Unauthorized", 401);
    }

    const gamesProgress = await this.dugoutService.getUserGamesProgress(
      user.id
    );
    return sendResponse.success(
      c,
      "Games progress fetched successfully",
      200,
      gamesProgress
    );
  }

  async joinGame(c: Context) {
    const user = c.get("user");

    if (!user?.id) {
      throw new HttpException("Unauthorized", 401);
    }
    const { gameId } = c.req.param();

    if (!VALID_GAME_IDS.includes(gameId as VALID_GAME_IDS_TYPE)) {
      throw new HttpException("Invalid game id", 400);
    }

    let game = await this.dugoutService.getGameProgress(gameId, user.id);

    if (!game) {
      const id = shortUUID.generate();
      game = await this.dugoutService.joinGame(gameId, user.id, id);
    }

    return sendResponse.success(c, "Game joined successfully", 200, game);
  }

  async upgradeLevel(c: Context) {
    const user = c.get("user");
    const { gameId } = c.req.param();

    if (!user?.id) {
      throw new HttpException("Unauthorized", 401);
    }

    if (!VALID_GAME_IDS.includes(gameId as VALID_GAME_IDS_TYPE)) {
      throw new HttpException("Invalid game id", 400);
    }

    const result = await this.dugoutService.upgradeLevel(gameId, user.id);

    if (result.error) {
      throw new HttpException(result.error, 400);
    }

    return sendResponse.success(
      c,
      "Level upgraded successfully",
      200,
      result?.success
    );
  }

  async getGameLevelChallenges(c: Context) {
    const { gameId } = c.req.param();
    const user = c.get("user");

    if (!user?.id) {
      throw new HttpException("Unauthorized", 401);
    }

    if (!VALID_GAME_IDS.includes(gameId as VALID_GAME_IDS_TYPE)) {
      throw new HttpException("Invalid game id", 400);
    }

    const currentLevel = await this.dugoutService.getUserGameLevel(
      gameId,
      user.id
    );

    const completedChallenges =
      currentLevel?.completed_challenges as CompletedChallenges;

    const challenges = await this.dugoutService.getGameLevelChallenges(
      gameId,
      (currentLevel?.level ?? "apprentice") as GameLevel
    );

    const formattedChallenges = challenges.map((challenge) => {
      return {
        completed: completedChallenges[
          currentLevel?.level as keyof CompletedChallenges
        ].includes(challenge.id),
        ...challenge,
      };
    });

    return sendResponse.success(
      c,
      "Challenges fetched successfully",
      200,
      formattedChallenges
    );
  }

  async completeChallenge(c: Context) {
    const { gameId } = c.req.param();
    const user = c.get("user");

    if (!user?.id) {
      throw new HttpException("Unauthorized", 401);
    }

    const { challengeId } = c.req.param();

    const currentLevel = await this.dugoutService.getUserGameLevel(
      gameId,
      user.id
    );

    const gameChallenge = await this.dugoutService.getGameChallenge(
      gameId,
      (currentLevel?.level ?? "apprentice") as GameLevel,
      Number(challengeId)
    );

    if (!gameChallenge) {
      throw new HttpException("Challenge not found", 404);
    }

    let result;
    try {
      result = await this.dugoutService.completeChallenge(
        gameId,
        user.id,
        (currentLevel?.level ?? "apprentice") as GameLevel,
        Number(challengeId)
      );
    } catch (e: any) {
      throw new HttpException(e.message, 400);
    }

    return sendResponse.success(
      c,
      "Challenge completed successfully",
      200,
      result
    );
  }
}

export default DugoutController;
