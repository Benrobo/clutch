import { Context } from "hono";
import DugoutService from "../services/dugout.service.js";
import sendResponse from "../lib/send-response.js";
import { HttpException } from "../lib/exception.js";
import shortUUID from "short-uuid";
import {
  GAME_LEVELS,
  USER_GAME_LEVELS_MAP_TOTAL_POINTS,
  VALID_GAME_IDS,
} from "../constant/dugout.js";
import {
  CompletedChallenges,
  DugoutUserStats,
  GameLevel,
  VALID_GAME_IDS as VALID_GAME_IDS_TYPE,
} from "../types/dugout.types.js";
import { shuffleArray } from "../lib/utils.js";
import DugoutAIEngine from "../services/RAG/dugout-ai.engine.js";

interface GameHintPayload {
  // Base properties for all game types
  challengeId: string;
  gameId: string; // 4-pic-1-word, word-search, quiz
}

interface FourPicOneWordHintPayload extends GameHintPayload {
  selectedLetters: string[];
}

interface WordSearchHintPayload extends GameHintPayload {
  gameType: "word-search";
  // Add word-search specific properties
}

interface QuizHintPayload extends GameHintPayload {
  gameType: "quiz";
  // Add quiz specific properties
}

type HintPayload =
  | FourPicOneWordHintPayload
  | WordSearchHintPayload
  | QuizHintPayload;

class DugoutController {
  private dugoutService: DugoutService;
  private dugoutAIEngine: DugoutAIEngine;

  constructor() {
    this.dugoutService = new DugoutService();
    this.dugoutAIEngine = new DugoutAIEngine();
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
      // Get challenges for apprentice level (default level for new players)
      const challenges = await this.dugoutService.getGameLevelChallenges(
        gameId,
        "apprentice"
      );

      // Sort challenges by ID and select the first one
      const sortedChallenges = (challenges || []).sort((a, b) => a.id - b.id);
      const firstChallenge = sortedChallenges[0];

      const id = shortUUID.generate();
      game = await this.dugoutService.joinGame(
        gameId,
        user.id,
        id,
        firstChallenge?.id
      );
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

  async getGameChallenge(c: Context) {
    const { gameId } = c.req.param();
    const user = c.get("user");

    if (!user?.id) {
      throw new HttpException("Unauthorized", 401);
    }

    if (!VALID_GAME_IDS.includes(gameId as VALID_GAME_IDS_TYPE)) {
      throw new HttpException("Invalid game id", 400);
    }

    const result = await this.dugoutService.getCurrentOrNextChallenge(
      gameId,
      user.id
    );

    if (result.error) {
      throw new HttpException(result.code, 400);
    }

    return sendResponse.success(
      c,
      "Challenge fetched successfully",
      200,
      result.data
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

  async getUserStats(c: Context) {
    const user = c.get("user");

    if (!user?.id) {
      throw new HttpException("Unauthorized", 401);
    }

    const stats = await this.dugoutService.getUserStats(user.id);

    const getHighestLevel = (stats: DugoutUserStats[]) => {
      let highestLevel: string | null = null;
      const levelsOrder = GAME_LEVELS;

      if (stats.length === 0) return highestLevel;

      for (const stat of stats) {
        if (
          levelsOrder.indexOf(stat.level) >
          levelsOrder.indexOf(highestLevel as any)
        ) {
          highestLevel = stat.level;
        }
      }
      return highestLevel;
    };

    return sendResponse.success(c, "Stats fetched successfully", 200, {
      highest_level: getHighestLevel(stats as any),
      stats,
    });
  }

  async getUserPointsByGameId(c: Context) {
    const { gameId } = c.req.param();
    const user = c.get("user");

    if (!user?.id) {
      throw new HttpException("Unauthorized", 401);
    }

    const points = await this.dugoutService.getUserPointsByGameId(
      gameId,
      user.id
    );

    return sendResponse.success(c, "Points fetched successfully", 200, points);
  }

  async getGamePoints(c: Context) {
    const { gameId } = c.req.param();
    const user = c.get("user");

    if (!user?.id) {
      throw new HttpException("Unauthorized", 401);
    }

    const points = await this.dugoutService.getGamePoints(gameId, user.id);

    return sendResponse.success(c, "Points fetched successfully", 200, points);
  }

  private async checkChallengeCompleted(
    gameId: string,
    userId: string,
    challengeId: number
  ) {
    const gameProgress = await this.dugoutService.getGameProgress(
      gameId,
      userId
    );
    const completedChallenges =
      (gameProgress?.completed_challenges as CompletedChallenges)?.[
        gameProgress?.level as GameLevel
      ]?.played_challenges ?? [];
    return completedChallenges.includes(challengeId);
  }

  // use Gemini to get the hint
  async getGameChallengeHint(c: Context) {
    const user = c.get("user");
    const payload = (await c.req.json()) as HintPayload;

    if (!user?.id) {
      throw new HttpException("Unauthorized", 401);
    }

    if (!payload.challengeId || !payload.gameId) {
      throw new HttpException("Challenge id and game id are required", 400);
    }

    if (payload.gameId === "4-pic-1-word") {
      // Handle 4-pic-1-word hint logic with typed payload
      const { selectedLetters } = payload as FourPicOneWordHintPayload;
      const currentLevel = await this.dugoutService.getUserGameLevel(
        payload.gameId,
        user.id
      );
      const currentChallenge = await this.dugoutService.getGameChallenge(
        payload.gameId,
        currentLevel?.level as GameLevel,
        Number(payload.challengeId)
      );

      if (!currentChallenge) {
        throw new HttpException("Challenge not found", 404);
      }

      const isChallengeCompleted = await this.checkChallengeCompleted(
        payload.gameId,
        user.id,
        Number(payload.challengeId)
      );

      if (isChallengeCompleted) {
        throw new HttpException("Challenge already completed", 400);
      }

      const hint = await this.dugoutAIEngine.getFourPicOneWordHint({
        selectedLetters,
        secretWord: currentChallenge?.secret?.display ?? "",
      });

      return sendResponse.success(
        c,
        "Hint fetched successfully",
        200,

        {
          hint: hint?.hint,
          tips: hint?.tip.split("\n\n"),
          suggested_letters: hint?.suggested_letters,
          highlight_words: hint?.highlight_words,
        }
      );
    }
  }
}

export default DugoutController;
