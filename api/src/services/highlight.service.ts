import prisma from "../prisma/index.js";
import { HttpException } from "../lib/exception.js";

type PlaybackResponse = {
  id: string;
  highlight_id: string;
  title: string;
  description: string;
  metadata: null;
  thumbnail: string | null;
  likes: number;
  views: number;
  mlb_video_url: string;
};

export default class HighlightService {
  async toggleLike(userId: string, playbackId: string): Promise<boolean> {
    const playback = await prisma.highlights_playbacks.findUnique({
      where: { id: playbackId },
      include: {
        liked_by: {
          where: { user_id: userId },
        },
      },
    });

    if (!playback) {
      throw new HttpException("Playback not found", 404);
    }

    const hasLiked = playback.liked_by.length > 0;

    if (hasLiked) {
      // Unlike: Remove user like and decrement count
      await prisma.$transaction([
        prisma.user_highlight_likes.delete({
          where: {
            user_id_playback_id: {
              user_id: userId,
              playback_id: playbackId,
            },
          },
        }),
        prisma.highlights_playbacks.update({
          where: { id: playbackId },
          data: { likes: { decrement: 1 } },
        }),
      ]);
      return false;
    } else {
      // Like: Add user like and increment count
      await prisma.$transaction([
        prisma.user_highlight_likes.create({
          data: {
            user_id: userId,
            playback_id: playbackId,
          },
        }),
        prisma.highlights_playbacks.update({
          where: { id: playbackId },
          data: { likes: { increment: 1 } },
        }),
      ]);
      return true;
    }
  }

  async getPlayback(playbackId: string) {
    return await prisma.highlights_playbacks.findUnique({
      where: { id: playbackId },
      include: {
        highlight: {
          include: {
            game: true,
          },
        },
      },
    });
  }
}
