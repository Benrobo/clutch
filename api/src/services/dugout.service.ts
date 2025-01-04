import prisma from "../prisma/index.js";

export default class DugoutService {
  async getUserGamesProgress(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        dugout_game_progress: true,
      },
    });

    return user?.dugout_game_progress;
  }

  async getGameProgress(gameId: string, userId: string) {
    const game = await prisma.dugout_game_progress.findFirst({
      where: {
        dugout_game_id: gameId,
        user_id: userId,
      },
    });

    return game;
  }

  async joinGame(gameId: string, userId: string, uuid?: string) {
    const game = await prisma.dugout_game_progress.upsert({
      where: {
        user_id: userId,
        dugout_game_id: gameId,
        id: uuid,
      },
      update: {
        dugout_game_id: gameId,
        level: "apprentice",
      },
      create: {
        dugout_game_id: gameId,
        level: "apprentice",
        user_id: userId,
        id: uuid,
      },
    });

    return game;
  }
}
