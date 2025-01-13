import prisma from "../prisma/index.js";

class MatchupService {
  async createMatchup(userId: string, title: string, ref?: string) {
    return await prisma.chat.create({
      data: {
        user_id: userId,
        title,
        ref,
      },
      include: {
        messages: true,
      },
    });
  }
}

export default MatchupService;
