import prisma from "../prisma/index.js";

type GetMatchupParams = {
  userId: string;
  challengerTeamId: number;
  opponentTeamId: number;
  position: string;
};

type CreateMatchupParams = {
  userId: string;
  challengerId: string;
  opponentId: string;
  challengerTeamId: number;
  opponentTeamId: number;
  position: string;
  season: number;
};

class MatchupService {
  async createMatchup(params: CreateMatchupParams) {
    return await prisma.matchups.create({
      data: {
        user_id: params.userId,
        challenger_id: params.challengerId,
        opponent_id: params.opponentId,
        challenger_team_id: params.challengerTeamId,
        opponent_team_id: params.opponentTeamId,
        position: params.position,
        season: params.season,
      },
    });
  }

  async getMatchup(params: GetMatchupParams) {
    return await prisma.matchups.findFirst({
      where: {
        user_id: params.userId,
        opponent_team_id: params.opponentTeamId,
        challenger_team_id: params.challengerTeamId,
        position: params.position,
      },
    });
  }
}

export default MatchupService;
