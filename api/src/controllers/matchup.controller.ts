import { Context } from "hono";
import MatchupService from "../services/matchup.service.js";
import sendResponse from "../lib/send-response.js";
import { HttpException } from "../lib/exception.js";
import MLBAPIHelper from "../helpers/mlb/mlb-api.helper.js";
import { inngestClient } from "../config/inngest.js";
import { JobType } from "@prisma/client";
import { getPositionType } from "../lib/utils.js";
import { MLBStatGroup } from "../types/mlb.types.js";
import shortUUID from "short-uuid";

class MatchupController {
  private matchupService: MatchupService;
  private mlbApi: MLBAPIHelper;

  constructor() {
    this.matchupService = new MatchupService();
    this.mlbApi = new MLBAPIHelper();
  }

  private validatePlayersPosition(position: string) {
    const positionType = getPositionType(position);
    if (!positionType) {
      throw new HttpException("Invalid position", 400);
    }

    return positionType;
  }

  private async checkIfPlayerHasAnyStats(
    playerId: number,
    position: string,
    season: number,
    type: "challenger" | "opponent"
  ) {
    try {
      const playerStats = await this.mlbApi.getPlayerStats(
        playerId,
        position as MLBStatGroup,
        {
          season: season,
        }
      );

      if (!playerStats) {
        throw new HttpException(
          `Player has no stats, choose a different ${type} player`,
          404
        );
      }

      if (playerStats?.stats?.length === 0) {
        throw new HttpException(
          `Player has no stats, choose a different ${type} player`,
          404
        );
      }

      return playerStats;
    } catch (e: any) {
      console.log(`Error checking if player has any stats:`, e);
      throw new HttpException(
        e?.message ?? "Something went wrong.. try again later",
        500
      );
    }
  }

  private async checkIfPlayerBelongsToTeam(
    playerId: number,
    teamId: number,
    type: "challenger" | "opponent"
  ) {
    const roster = await this.mlbApi.getTeamRoster(teamId);
    const player = roster.find((p) => p?.person?.id === Number(playerId));
    if (!player) {
      throw new HttpException(`${type} player not found in team`, 404);
    }
  }

  private async checkIfPlayerExists(
    playerId: number,
    type: "challenger" | "opponent"
  ) {
    try {
      const player = await this.mlbApi.getPlayer(playerId);
    } catch (e: any) {
      throw new HttpException(`${type} player not found`, 404);
    }
  }

  async createMatchup(c: Context) {
    const user = c.get("user");
    const {
      challengerId,
      opponentId,
      challengerTeamId,
      opponentTeamId,
      position,
      season,
    } = await c.req.json();

    if (challengerId === opponentId) {
      throw new HttpException(
        "Challenger and opponent cannot be the same",
        400
      );
    }

    this.validatePlayersPosition(position);

    await Promise.all([
      this.checkIfPlayerExists(challengerId, "challenger"),
      this.checkIfPlayerExists(opponentId, "opponent"),
      this.checkIfPlayerBelongsToTeam(
        challengerId,
        challengerTeamId,
        "challenger"
      ),
      this.checkIfPlayerBelongsToTeam(opponentId, opponentTeamId, "opponent"),
      this.checkIfPlayerHasAnyStats(
        challengerId,
        position,
        season ?? 2024,
        "challenger"
      ),
      this.checkIfPlayerHasAnyStats(
        opponentId,
        position,
        season ?? 2024,
        "opponent"
      ),
    ]);

    // check if user has already created a matchup for this team, challenger, opponent and position
    const existingMatchup = await this.matchupService.getMatchup({
      userId: user?.id,
      challengerTeamId,
      opponentTeamId,
      position,
    });

    const jobStatus = await this.matchupService.getJobStatus(
      JobType.COMPARE_PLAYERS_HIGHLIGHT
    );

    if (existingMatchup && jobStatus?.status === "PENDING") {
      if (!jobStatus?.started) {
        await inngestClient.send({
          name: "compare-players-stats",
          data: {
            matchupId: existingMatchup.id,
            jobId: jobStatus?.id,
          },
        });
      }
      return sendResponse?.success(
        c,
        "Players matchups are being generated. Please wait.",
        200
      );
    }

    await prisma.$transaction(async (tx) => {
      const matchup = await tx.matchups.create({
        data: {
          user_id: user?.id,
          challenger_id: challengerId,
          opponent_id: opponentId,
          challenger_team_id: challengerTeamId,
          opponent_team_id: opponentTeamId,
          position: position,
          season: season ?? 2024,
        },
      });

      // create job
      const jobId = shortUUID.generate();
      await tx.jobs.create({
        data: {
          id: jobId,
          type: JobType.COMPARE_PLAYERS_HIGHLIGHT,
          input_data: {
            matchupId: matchup.id,
          },
        },
      });

      inngestClient.send({
        name: "compare-players-stats",
        data: {
          matchupId: matchup.id,
          jobId: jobId,
        },
      });
    });

    return sendResponse?.success(c, "Players matchups queued", 201);
  }
}

export default MatchupController;
