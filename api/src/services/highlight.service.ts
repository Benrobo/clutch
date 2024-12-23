import prisma from "../prisma/index.js";
import { HttpException } from "../lib/exception.js";

export default class HighlightService {
  async toggleLike(userId: string, highlightId: string): Promise<boolean> {
    const highlight = await prisma.highlights.findUnique({
      where: { id: highlightId },
      include: {
        liked_by: {
          where: { user_id: userId }
        }
      }
    });

    if (!highlight) {
      throw new HttpException("Highlight not found", 404);
    }

    const hasLiked = highlight.liked_by.length > 0;

    if (hasLiked) {
      // Unlike: Remove user like and decrement count
      await prisma.$transaction([
        prisma.user_highlight_likes.delete({
          where: {
            user_id_highlight_id: {
              user_id: userId,
              highlight_id: highlightId
            }
          }
        }),
        prisma.highlights.update({
          where: { id: highlightId },
          data: { likes: { decrement: 1 } }
        })
      ]);
      return false;
    } else {
      // Like: Add user like and increment count
      await prisma.$transaction([
        prisma.user_highlight_likes.create({
          data: {
            user_id: userId,
            highlight_id: highlightId
          }
        }),
        prisma.highlights.update({
          where: { id: highlightId },
          data: { likes: { increment: 1 } }
        })
      ]);
      return true;
    }
  }
}
