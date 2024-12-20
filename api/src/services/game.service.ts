import {
  CreateGameInput,
  CreatePlayersInput,
  CreateTeamInput,
} from "../types/game.types.js";
import prisma from "../prisma/index.js";

export default class GameService {
  async findGameById(id: number) {
    return await prisma.games.findUnique({
      where: { id },
      include: {
        home_team: true,
        away_team: true,
        highlights: true,
      },
    });
  }

  async findGamesByDate(date: string) {
    return await prisma.games.findMany({
      where: { date },
      include: {
        home_team: true,
        away_team: true,
      },
    });
  }

  async findGamesByTeam(teamId: number) {
    return await prisma.games.findMany({
      where: {
        OR: [{ home_team_id: teamId }, { away_team_id: teamId }],
      },
      include: {
        home_team: true,
        away_team: true,
      },
    });
  }

  async findPlayerById(id: number) {
    return await prisma.players.findUnique({
      where: { id },
    });
  }

  async findPlayerByIdAndTeamId(id: number, teamId: number) {
    return await prisma.player_team_refs.findFirst({
      where: { player_id: id, team_id: teamId },
    });
  }

  async createGame(data: CreateGameInput) {
    return await prisma.games.create({
      data: {
        ...data,
        decisions: data?.decisions as any,
      },
      include: {
        home_team: true,
        away_team: true,
      },
    });
  }

  async createTeam(data: CreateTeamInput) {
    return await prisma.teams.create({
      data: {
        ...data,
        league: data?.league as any,
      },
    });
  }

  async findGameWithHighlights(id: number) {
    return await prisma.games.findUnique({
      where: { id },
      include: {
        home_team: true,
        away_team: true,
        highlights: {
          include: {
            saved_by: true,
          },
        },
      },
    });
  }
}
