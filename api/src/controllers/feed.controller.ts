import { Context } from "hono";
import MLBAPIHelper from "../helpers/mlb/mlb-api.helper.js";
import { HttpException } from "../lib/exception.js";
import sendResponse from "../lib/send-response.js";
import prisma from "../prisma/index.js";

export default class FeedController {
  private mlbApi: MLBAPIHelper;

  constructor() {
    this.mlbApi = new MLBAPIHelper();
  }

  async getTeams(c: Context) {
    const teams = await prisma.teams.findMany({
      select: {
        id: true,
        name: true,
        abbreviation: true,
        league: true,
        logo_url: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return sendResponse.success(c, null, 200, teams);
  }

  async getTeamRosters(c: Context) {
    const { teamIds } = await c.req.json();

    // First verify if all teams exist in our database
    const teams = await prisma.teams.findMany({
      where: {
        id: {
          in: teamIds,
        },
      },
      select: { id: true },
    });

    if (teams.length !== teamIds.length) {
      const foundTeamIds = teams.map((team) => team.id);
      const invalidTeamIds = teamIds.filter(
        (id: number) => !foundTeamIds.includes(id)
      );
      throw new HttpException(
        `Teams not found: ${invalidTeamIds.join(", ")}`,
        404
      );
    }

    // Fetch rosters for all teams in parallel
    const rostersPromises = teamIds.map(async (teamId: number) => {
      // Get team roster to get list of players
      const roster = await this.mlbApi.getTeamRoster(teamId);

      // Get detailed player information
      const playerIds = roster.map((player) => player.person.id);
      const detailedPlayers = await this.mlbApi.getPlayers(playerIds);

      // Map roster position info with detailed player info
      return roster.map((rosterPlayer) => {
        const playerDetails = detailedPlayers.find(
          (p) => p.id === rosterPlayer.person.id
        );
        return {
          teamId,
          id: rosterPlayer.person.id,
          fullName: rosterPlayer.person.fullName,
          verified: playerDetails?.isVerified,
          active: playerDetails?.active,
          position: rosterPlayer.position.abbreviation,
          jerseyNumber: rosterPlayer.jerseyNumber,
          profilePicture: playerDetails?.profilePicture?.medium,
          height: playerDetails?.height,
          weight: playerDetails?.weight,
          currentAge: playerDetails?.currentAge,
        };
      });
    });

    const rosters = await Promise.all(rostersPromises);
    const players = rosters.flat();

    return sendResponse.success(c, null, 200, players);
  }
}
