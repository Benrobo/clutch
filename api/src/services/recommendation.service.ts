import prisma from "../prisma/index.js";
import {
  users,
  highlights,
  highlights_content,
  highlights_playbacks,
  VideoOrientation,
} from "@prisma/client";

export type FeedType = "ForYou" | "Explore";

export interface FeedParams {
  cursor?: string;
  limit: number;
}

export interface HighlightItem {
  id: string;
  gameId: number;
  createdAt: Date;
  likes: number;
  thumbnail: string | null; // First photo from content
  playback: {
    title: string;
    description: string;
    mlbVideoUrl: string;
    mlbVideoDuration: string;
    processedVideoUrl: string | null;
    processedVideoDuration: string | null;
    orientation: VideoOrientation;
  };
  game: {
    homeTeamId: number;
    awayTeamId: number;
    date: string;
    status: string;
  };
}

export default class RecommendationService {
  async getForYouFeed(
    user: users,
    params: FeedParams
  ): Promise<HighlightItem[]> {
    const userPrefs = user.preferences as {
      teams: number[];
      players: number[];
    } | null;

    if (!userPrefs?.teams.length && !userPrefs?.players.length) {
      // If user has no preferences, return explore feed
      return this.getExploreFeed(user.id, params);
    }

    const preferredCount = Math.ceil(params.limit * 0.7);
    const discoveryCount = params.limit - preferredCount;

    // Get preferred content (from teams user follows)
    const preferredHighlights = await prisma.highlights.findMany({
      where: {
        game: {
          OR: [
            { home_team_id: { in: userPrefs.teams } },
            { away_team_id: { in: userPrefs.teams } },
          ],
        },
        NOT: {
          saved_by: {
            some: { user_id: user.id },
          },
        },
      },
      orderBy: [{ likes: "desc" }, { created_at: "desc" }],
      take: preferredCount,
      ...(params.cursor ? { cursor: { id: params.cursor } } : {}),
      include: {
        content: {
          select: {
            photos: true,
          },
        },
        highlights: {
          take: 1, // Get first playback
          orderBy: { id: "asc" },
        },
        game: {
          select: {
            home_team_id: true,
            away_team_id: true,
            date: true,
            status: true,
          },
        },
      },
    });

    // Get discovery content
    const discoveryHighlights = await prisma.highlights.findMany({
      where: {
        // get highlights where the game does NOT involve any of the user's preferred teams
        game: {
          NOT: {
            OR: [
              { home_team_id: { in: userPrefs.teams } },
              { away_team_id: { in: userPrefs.teams } },
            ],
          },
        },
        // get highlights that have NOT been saved by this user
        NOT: {
          saved_by: {
            some: { user_id: user.id },
          },
        },
      },
      orderBy: [{ likes: "desc" }, { created_at: "desc" }],
      take: discoveryCount,
      include: {
        content: {
          select: {
            photos: true,
          },
        },
        highlights: {
          take: 1,
          orderBy: { id: "asc" },
        },
        game: {
          select: {
            home_team_id: true,
            away_team_id: true,
            date: true,
            status: true,
          },
        },
      },
    });

    return this.shuffleWithBias(
      this.mapHighlights([...preferredHighlights, ...discoveryHighlights])
    );
  }

  async getExploreFeed(
    userId: string,
    params: FeedParams
  ): Promise<HighlightItem[]> {
    // Get recent trending content (last 7 days)
    const trendingHighlights = await prisma.highlights.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        NOT: {
          saved_by: {
            some: { user_id: userId },
          },
        },
      },
      orderBy: [{ likes: "desc" }, { created_at: "desc" }],
      take: Math.ceil(params.limit * 0.6),
      ...(params.cursor ? { cursor: { id: params.cursor } } : {}),
      include: {
        content: {
          select: {
            photos: true,
          },
        },
        highlights: {
          take: 1,
          orderBy: { id: "asc" },
        },
        game: {
          select: {
            home_team_id: true,
            away_team_id: true,
            date: true,
            status: true,
          },
        },
      },
    });

    // Get random highlights
    const randomHighlights = await prisma.highlights.findMany({
      where: {
        NOT: {
          saved_by: {
            some: { user_id: userId },
          },
        },
      },
      orderBy: [{ created_at: "desc" }],
      take: Math.floor(params.limit * 0.4),
      include: {
        content: {
          select: {
            photos: true,
          },
        },
        highlights: {
          take: 1,
          orderBy: { id: "asc" },
        },
        game: {
          select: {
            home_team_id: true,
            away_team_id: true,
            date: true,
            status: true,
          },
        },
      },
    });

    return this.shuffleWithBias(
      this.mapHighlights([...trendingHighlights, ...randomHighlights])
    );
  }

  private mapHighlights(
    highlights: (highlights & {
      content: { photos: string[] } | null;
      highlights: highlights_playbacks[];
      game: {
        home_team_id: number;
        away_team_id: number;
        date: string;
        status: string;
      };
    })[]
  ): HighlightItem[] {
    return highlights.map((highlight) => ({
      id: highlight.id,
      gameId: highlight.game_id,
      createdAt: highlight.created_at,
      likes: highlight.likes,
      thumbnail: highlight.content?.photos[0] || null,
      playback: highlight.highlights[0]
        ? {
            title: highlight.highlights[0].title,
            description: highlight.highlights[0].description,
            mlbVideoUrl: highlight.highlights[0].mlb_video_url,
            mlbVideoDuration: highlight.highlights[0].mlb_video_duration,
            processedVideoUrl: highlight.highlights[0].processed_video_url,
            processedVideoDuration:
              highlight.highlights[0].processed_video_duration,
            orientation: highlight.highlights[0].orientation,
            // the transcript would be gotten from a different endpoint
            // transcript: highlight.highlights[0].transcript,
            // translated_transcript:
            //   highlight.highlights[0].translated_transcript,
          }
        : {
            // Fallback if no playback exists
            title: "",
            description: "",
            mlbVideoUrl: "",
            mlbVideoDuration: "",
            processedVideoUrl: null,
            processedVideoDuration: null,
            orientation: "HORIZONTAL",
          },
      game: {
        homeTeamId: highlight.game.home_team_id,
        awayTeamId: highlight.game.away_team_id,
        date: highlight.game.date,
        status: highlight.game.status,
      },
    }));
  }

  // Knuth shuffle Algorithm (Modified Fisher-Yates)
  private shuffleWithBias(items: HighlightItem[]): HighlightItem[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      // For each item, flip a coin (with 70% chance of keeping it in place)
      if (Math.random() > 0.7) {
        // If we decide to move it (30% chance):
        // 1. Pick a random position to swap with
        const j = Math.floor(Math.random() * (i + 1));

        // 2. swap the items
        [result[i], result[j]] = [result[j], result[i]];
      }
    }
    return result;
  }
}
