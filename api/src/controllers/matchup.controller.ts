import { Context } from "hono";
import MatchupService from "../services/matchup.service.js";
import sendResponse from "../lib/send-response.js";
import { HttpException } from "../lib/exception.js";
import MLBAPIHelper from "../helpers/mlb/mlb-api.helper.js";
import { inngestClient } from "../config/inngest.js";
import { JobStatus, JobType } from "@prisma/client";
import { getPositionType } from "../lib/utils.js";
import { MLBStatGroup } from "../types/mlb.types.js";
import prisma from "../prisma/index.js";
import retry from "async-retry";
import redis from "../config/redis.js";

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

    if (existingMatchup) {
      if (
        existingMatchup?.status === JobStatus.PENDING ||
        existingMatchup?.error
      ) {
        await inngestClient.send({
          name: "compare-players-stats",
          data: {
            matchupId: existingMatchup.id,
          },
        });
      } else if (existingMatchup?.status === JobStatus.COMPLETED) {
        return sendResponse?.success(
          c,
          "Matchup already exists",
          200,
          existingMatchup
        );
      } else {
        return sendResponse?.success(
          c,
          "Players matchups are being generated. Please wait.",
          200
        );
      }
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

      inngestClient.send({
        name: "compare-players-stats",
        data: {
          matchupId: matchup.id,
        },
      });
    });

    return sendResponse?.success(c, "Players matchups queued", 201);
  }

  async getMatchups(c: Context) {
    const user = c.get("user");
    const matchups = await this.matchupService.getMatchups(user?.id);
    return sendResponse?.success(c, "Matchups fetched", 200, matchups);
  }

  async getTeamPlayers(c: Context) {
    const teamId = c.req.param("teamId");
    let players: any[] = [];

    try {
      const cachedPlayers = await redis.get(`team-players-${teamId}`);
      if (cachedPlayers) {
        try {
          players = JSON.parse(cachedPlayers);
        } catch (parseError) {
          console.error("Error parsing cached players:", parseError);
          // If parsing fails, fetch fresh data
          players = await this.fetchTeamPlayers(teamId);
        }
      } else {
        players = await this.fetchTeamPlayers(teamId);
      }
    } catch (e: any) {
      console.error(`Error fetching team players:`, e);
      throw new Error("Failed to fetch team players");
    }
    return sendResponse?.success(c, "Team players fetched", 200, players);
  }

  private async fetchTeamPlayers(teamId: string) {
    return retry(
      async () => {
        const roster = await this.mlbApi.getTeamRoster(Number(teamId));
        const rosterIds = roster.map((player) => player?.person?.id);
        const players = await Promise.all(
          rosterIds.map(async (id) => {
            const player = await this.mlbApi.getPlayer(id);
            return {
              id: player.id,
              fullName: player.fullName,
              currentAge: player.currentAge,
              height: player.height,
              weight: player.weight,
              active: player.active,
              position: player.primaryPosition?.abbreviation,
              gender: player.gender,
              verified: player.isVerified,
              batSide: player.batSide?.code,
              profilePicture: player.profilePicture?.medium ?? "",
              jerseyNumber: player.primaryNumber,
            };
          })
        );

        const cacheDuration = 2 * 60 * 60; // 2hr
        await redis.set(`team-players-${teamId}`, JSON.stringify(players));
        await redis.expire(`team-players-${teamId}`, cacheDuration);

        return players;
      },
      {
        retries: 3,
        onRetry(e, attempt) {
          console.error(`Error fetching team players:`, e);
          console.error(`Attempt:`, attempt);
        },
      }
    );
  }
}

export default MatchupController;
