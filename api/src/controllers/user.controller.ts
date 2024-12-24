import { Context } from "hono";
import UserService from "../services/user.service.js";
import { AddUserPreferencePayload } from "../types/user.types.js";
import MLBAPIHelper from "../helpers/mlb/mlb-api.helper.js";
import { HttpException } from "../lib/exception.js";
import sendResponse from "../lib/send-response.js";

export default class UserController {
  private userService: UserService;
  private mlbApi: MLBAPIHelper;

  constructor() {
    this.userService = new UserService();
    this.mlbApi = new MLBAPIHelper();
  }

  private async validatePlayers(playerIds: number[]) {
    try {
      const players = await this.mlbApi.getPlayers(playerIds);
      const foundPlayerIds = players.map((player) => player.id);
      const invalidPlayerIds = playerIds.filter(
        (id) => !foundPlayerIds.includes(id)
      );

      if (invalidPlayerIds.length > 0) {
        throw new HttpException(
          `Invalid player IDs: ${invalidPlayerIds.join(", ")}`,
          400
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException("Failed to validate player IDs", 400);
    }
  }

  public getAuthenticatedUser = async (c: Context) => {
    const user = c.get("user");
    return sendResponse.success(c, "User retrieved successfully", 200, user);
  };

  async addPreference(c: Context) {
    const payload: AddUserPreferencePayload = await c.req.json();
    const user = c.get("user");

    await this.userService.validateTeams(payload.teams);
    if (payload?.players?.length > 0) {
      await this.validatePlayers(payload.players);
    }

    const updatedUser = await this.userService.savePreference(
      user?.id,
      payload
    );
    return sendResponse.success(
      c,
      "Preference saved",
      200,
      updatedUser?.preferences
    );
  }

  async hasPreference(c: Context) {
    const user = c.get("user");
    const hasPreference = await this.userService.hasPreference(user.id);
    return sendResponse.success(c, "Success", 200, { hasPreference });
  }
}
