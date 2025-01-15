import { JobType } from "@prisma/client";
import prisma from "../prisma/index.js";

type GetMatchupParams = {
  userId: string;
  challengerTeamId: number;
  opponentTeamId: number;
  position: string;
};

class MatchupService {
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

  async getMatchups(userId: string) {
    return await prisma.matchups.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  async getJobStatus(jobType: JobType) {
    return await prisma.jobs.findFirst({
      where: {
        type: jobType,
      },
    });
  }
}

export default MatchupService;
