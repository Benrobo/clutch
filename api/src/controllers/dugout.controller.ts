import { Context } from "hono";
import DugoutService from "../services/dugout.service.js";
import sendResponse from "../lib/send-response.js";
import { HttpException } from "../lib/exception.js";
import shortUUID from "short-uuid";
import { VALID_GAME_IDS } from "../constant/dugout.js";

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

    if (!VALID_GAME_IDS.includes(gameId)) {
      throw new HttpException("Invalid game id", 400);
    }

    let game = await this.dugoutService.getGameProgress(gameId, user.id);

    if (!game) {
      const id = shortUUID.generate();
      game = await this.dugoutService.joinGame(gameId, user.id, id);
    }

    return sendResponse.success(c, "Game joined successfully", 200, game);
  }
}

export default DugoutController;
