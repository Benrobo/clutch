import dayjs from "dayjs";
import prisma from "../prisma/index.js";
import {
  users,
  highlights,
  highlights_playbacks,
  VideoOrientation,
} from "@prisma/client";
import redis from "../config/redis.js";

export type FeedType = "ForYou" | "Explore";

export interface FeedParams {
  limit: number;
}

const SEEN_VIDEOS_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds
const SEEN_VIDEOS_KEY_PREFIX = "user:seen-videos:";
const VIEW_PLAYBACKS_KEY_PREFIX = "user:view-playbacks:";
const VIEW_PLAYBACKS_EXPIRY = 60 * 60 * 24 * 7; // 7 days

export interface HighlightItem {
  id: string;
  gameId: number;
  createdAt: Date;
  likes: number;
  views: number;
  youLiked: boolean;
  thumbnail: {
    main: string | null;
    fallback: string | null;
  };
  playback: {
    id: string;
    title: string;
    description: string;
    mlbVideoUrl: string;
    mlbVideoDuration: string;
    processedVideoUrl: string | null;
    processedVideoDuration: string | null;
    orientation: VideoOrientation;
  };
  game: {
    home_team: {
      id: number;
      name: string | null;
      logo_url: string | null;
    };
    away_team: {
      id: number;
      name: string | null;
      logo_url: string | null;
    };
    date: string;
    status: string;
  };
  transcript: {
    original: any;
    translated: any;
  };
}

export default class RecommendationService {
  private recentlyShownCache = new Map<string, number>();
  private readonly CACHE_EXPIRY = 1000 * 60 * 5; // 5 minutes

  private async getSeenVideos(userId: string): Promise<string[]> {
    const key = `${SEEN_VIDEOS_KEY_PREFIX}${userId}`;
    const seenVideos = await redis.smembers(key);
    return seenVideos;
  }

  private async getViewedPlaybacks(userId: string): Promise<string[]> {
    const key = `${VIEW_PLAYBACKS_KEY_PREFIX}${userId}`;
    const viewedPlaybacks = await redis.smembers(key);
    return viewedPlaybacks;
  }

  // For playback views purpose
  private async markPlaybackViewed(
    userId: string,
    playbackId: string
  ): Promise<void> {
    const key = `${VIEW_PLAYBACKS_KEY_PREFIX}${userId}`;
    const viewedPlaybacks = await redis.smembers(key);
    if (!viewedPlaybacks.includes(playbackId)) {
      const pipeline = redis.pipeline();
      pipeline.sadd(key, playbackId);
      pipeline.expire(key, VIEW_PLAYBACKS_EXPIRY);
      await pipeline.exec();
    }
  }

  // For recommendation purpose
  private async markPlaybackSeen(
    userId: string,
    playbackId: string
  ): Promise<void> {
    const seenVideos = await this.getSeenVideos(userId);
    if (!seenVideos.includes(playbackId)) {
      const key = `${SEEN_VIDEOS_KEY_PREFIX}${userId}`;
      const pipeline = redis.pipeline();
      pipeline.sadd(key, playbackId);
      pipeline.expire(key, SEEN_VIDEOS_EXPIRY);
      await pipeline.exec();
    }
  }

  async markHighlightViewed(userId: string, playbackId: string): Promise<void> {
    const viewedPlaybacks = await this.getViewedPlaybacks(userId);
    // Only update if not already viewed
    if (!viewedPlaybacks.includes(playbackId)) {
      await prisma.$transaction(async (tx) => {
        await tx.highlights_playbacks.update({
          where: {
            id: playbackId,
          },
          data: {
            views: { increment: 1 },
          },
        });

        await this.markPlaybackViewed(userId, playbackId);
        await this.markPlaybackSeen(userId, playbackId);
      });
    }
  }

  async getForYouFeed(
    user: users,
    params: FeedParams
  ): Promise<HighlightItem[]> {
    // Get user preferences from the JSON field
    const userPrefs = user.preferences as {
      teams: number[];
      players: number[];
    } | null;

    if (!userPrefs?.teams?.length && !userPrefs?.players?.length) {
      return this.getExploreFeed(user.id, params);
    }

    const preferredCount = Math.ceil(params.limit * 0.7);
    const discoveryCount = params.limit - preferredCount;
    const now = dayjs();
    const seenVideos = await this.getSeenVideos(user.id);

    // Get preferred content within a time window
    const preferredHighlights = await prisma.highlights.findMany({
      where: {
        AND: [
          {
            game: {
              OR: [
                { home_team_id: { in: userPrefs.teams } },
                { away_team_id: { in: userPrefs.teams } },
              ],
            },
          },
          {
            created_at: {
              gte: now.subtract(7, "day").toDate(),
            },
          },
          {
            NOT: {
              id: { in: seenVideos },
            },
          },
          {
            highlights: {
              some: {
                NOT: {
                  saved_by: {
                    some: { user_id: user?.id },
                  },
                },
              },
            },
          },
        ],
      },
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      take: preferredCount,
      include: {
        content: {
          select: {
            photo: true,
          },
        },
        highlights: {
          take: 1,
          orderBy: [{ likes: "desc" }, { id: "asc" }],
          include: {
            liked_by: {
              where: { user_id: user?.id },
              select: { user_id: true },
            },
          },
        },
        game: {
          select: {
            home_team: {
              select: {
                id: true,
                name: true,
                logo_url: true,
              },
            },
            away_team: {
              select: {
                id: true,
                name: true,
                logo_url: true,
              },
            },
            date: true,
            status: true,
          },
        },
      },
    });

    // Get discovery content excluding seen videos
    const discoveryHighlights = await prisma.highlights.findMany({
      where: {
        AND: [
          {
            game: {
              NOT: {
                OR: [
                  { home_team_id: { in: userPrefs.teams } },
                  { away_team_id: { in: userPrefs.teams } },
                ],
              },
            },
          },
          {
            created_at: {
              gte: now.subtract(30, "day").toDate(),
            },
          },
          {
            NOT: {
              id: { in: seenVideos },
            },
          },
          {
            highlights: {
              some: {
                NOT: {
                  saved_by: {
                    some: { user_id: user?.id },
                  },
                },
              },
            },
          },
        ],
      },
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      take: discoveryCount,
      include: {
        content: {
          select: {
            photo: true,
          },
        },
        highlights: {
          take: 1,
          orderBy: [{ likes: "desc" }, { id: "asc" }],
          include: {
            liked_by: {
              where: { user_id: user?.id },
              select: { user_id: true },
            },
          },
        },
        game: {
          select: {
            home_team: {
              select: {
                id: true,
                name: true,
                logo_url: true,
              },
            },
            away_team: {
              select: {
                id: true,
                name: true,
                logo_url: true,
              },
            },
            date: true,
            status: true,
          },
        },
      },
    });

    const allHighlights = [...preferredHighlights, ...discoveryHighlights];

    return this.shuffleWithBias(this.mapHighlightsV2(allHighlights));
  }

  async getExploreFeed(
    userId: string,
    params: FeedParams
  ): Promise<HighlightItem[]> {
    const now = dayjs();
    const seenVideos = await this.getSeenVideos(userId);

    // Get trending highlights from last 7 days
    const trendingHighlights = await prisma.highlights.findMany({
      where: {
        AND: [
          {
            created_at: {
              gte: now.subtract(7, "day").toDate(),
            },
          },
          {
            NOT: {
              id: { in: seenVideos },
            },
          },
          {
            highlights: {
              some: {
                NOT: {
                  saved_by: {
                    some: { user_id: userId },
                  },
                },
              },
            },
          },
        ],
      },
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      take: Math.ceil(params.limit * 0.6),
      include: {
        content: {
          select: {
            photo: true,
          },
        },
        highlights: {
          take: 1,
          orderBy: [{ likes: "desc" }, { id: "asc" }],
          include: {
            liked_by: {
              where: { user_id: userId },
              select: { user_id: true },
            },
          },
        },
        game: {
          select: {
            home_team: {
              select: {
                id: true,
                name: true,
                logo_url: true,
              },
            },
            away_team: {
              select: {
                id: true,
                name: true,
                logo_url: true,
              },
            },
            date: true,
            status: true,
          },
        },
      },
    });

    // Get random highlights from last 30 days
    const randomHighlights = await prisma.highlights.findMany({
      where: {
        AND: [
          {
            created_at: {
              gte: now.subtract(30, "day").toDate(),
            },
          },
          {
            NOT: {
              id: { in: seenVideos },
            },
          },
          {
            highlights: {
              some: {
                NOT: {
                  saved_by: {
                    some: { user_id: userId },
                  },
                },
              },
            },
          },
        ],
      },
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      take: Math.floor(params.limit * 0.4),
      include: {
        content: {
          select: {
            photo: true,
          },
        },
        highlights: {
          take: 1,
          orderBy: [{ likes: "desc" }, { id: "asc" }],
          include: {
            liked_by: {
              where: { user_id: userId },
              select: { user_id: true },
            },
          },
        },
        game: {
          select: {
            home_team: {
              select: {
                id: true,
                name: true,
                logo_url: true,
              },
            },
            away_team: {
              select: {
                id: true,
                name: true,
                logo_url: true,
              },
            },
            date: true,
            status: true,
          },
        },
      },
    });

    const allHighlights = [...trendingHighlights, ...randomHighlights];

    return this.shuffleWithBias(this.mapHighlightsV2(allHighlights));
  }

  async getForYouFeedV2(
    userId: string,
    cursor?: string,
    limit = 10
  ): Promise<HighlightItem[]> {
    // Get user preferences
    const userPreferences = await this.getUserPreferences(userId);
    const seenVideos = await this.getSeenVideos(userId);

    // Get preferred playbacks based on user preferences
    const preferredPlaybacks = await prisma.highlights_playbacks.findMany({
      where: {
        NOT: {
          id: { in: seenVideos },
        },
        highlight: {
          game: {
            OR: [
              { home_team: { id: { in: userPreferences } } },
              { away_team: { id: { in: userPreferences } } },
            ],
          },
        },
      },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        highlight: {
          include: {
            content: true,
            game: {
              include: {
                home_team: true,
                away_team: true,
              },
            },
          },
        },
        liked_by: {
          where: {
            user_id: userId,
          },
          select: {
            user_id: true,
          },
        },
      },
      orderBy: {
        highlight: {
          created_at: "desc",
        },
      },
    });

    // Get discovery playbacks (random selection)
    const discoveryPlaybacks = await prisma.highlights_playbacks.findMany({
      where: {
        NOT: {
          OR: [
            { id: { in: seenVideos } },
            { id: { in: preferredPlaybacks.map((p) => p.id) } },
          ],
        },
      },
      take: Math.max(0, limit - preferredPlaybacks.length),
      include: {
        highlight: {
          include: {
            content: true,
            game: {
              include: {
                home_team: true,
                away_team: true,
              },
            },
          },
        },
        liked_by: {
          where: {
            user_id: userId,
          },
          select: {
            user_id: true,
          },
        },
      },
      orderBy: {
        highlight: {
          created_at: "desc",
        },
      },
    });

    const allPlaybacks = [...preferredPlaybacks, ...discoveryPlaybacks];
    return this.shuffleWithBias(this.mapPlaybacksToHighlights(allPlaybacks));
  }

  async getExploreFeedV2(
    userId: string,
    cursor?: string,
    limit = 10
  ): Promise<HighlightItem[]> {
    const seenVideos = await this.getSeenVideos(userId);

    // Get trending playbacks (most liked/viewed)
    const trendingPlaybacks = await prisma.highlights_playbacks.findMany({
      where: {
        NOT: {
          id: { in: seenVideos },
        },
        summary: {
          not: null as any,
        },
      },
      take: Math.floor(limit * 0.7), // 70% trending
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        highlight: {
          select: {
            content: true,
            game: {
              select: {
                home_team: true,
                away_team: true,
              },
            },
            id: true,
            created_at: true,
          },
        },
        liked_by: {
          where: {
            user_id: userId,
          },
          select: {
            user_id: true,
          },
        },
      },
      orderBy: [{ likes: "desc" }, { views: "desc" }],
    });

    // Get random playbacks
    const randomPlaybacks = await prisma.highlights_playbacks.findMany({
      where: {
        NOT: {
          OR: [
            { id: { in: seenVideos } },
            { id: { in: trendingPlaybacks.map((p) => p.id) } },
          ],
        },
      },
      take: Math.max(0, limit - trendingPlaybacks.length),
      include: {
        highlight: {
          select: {
            content: {
              select: {
                photo: true,
              },
            },
            game: {
              select: {
                home_team: {
                  select: {
                    id: true,
                    name: true,
                    logo_url: true,
                  },
                },
                away_team: {
                  select: {
                    id: true,
                    name: true,
                    logo_url: true,
                  },
                },
                date: true,
                status: true,
              },
            },
            id: true,
            created_at: true,
          },
        },
        liked_by: {
          where: {
            user_id: userId,
          },
          select: {
            user_id: true,
          },
        },
      },
      orderBy: {
        highlight: {
          created_at: "desc",
        },
      },
    });

    const allPlaybacks = [...trendingPlaybacks, ...randomPlaybacks];
    return this.shuffleWithBias(this.mapPlaybacksToHighlights(allPlaybacks));
  }

  private async getUserPreferences(userId: string): Promise<number[]> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    if (!user?.preferences) {
      return [];
    }

    // preferences is a JSON field with { teams: number[], players: number[] }
    const prefs = user.preferences as { teams: number[]; players: number[] };
    return prefs.teams || [];
  }

  private mapPlaybacksToHighlights(
    playbacks: (highlights_playbacks & {
      liked_by: { user_id: string }[];
      highlight: {
        content: { photo: string } | null;
        created_at: Date;
        id: string;
        game: {
          home_team: {
            id: number;
            name: string;
            logo_url: string | null;
          };
          away_team: {
            id: number;
            name: string;
            logo_url: string | null;
          };
          date: string;
          status: string;
        };
      };
    })[]
  ): HighlightItem[] {
    return playbacks.map((playback) => ({
      id: playback.id,
      higlightId: playback.highlight?.id,
      gameId: playback.highlight?.game?.home_team?.id,
      createdAt: playback.highlight?.created_at,
      likes: playback.likes ?? 0,
      views: playback.views ?? 0,
      youLiked: playback.liked_by.length > 0,
      thumbnail: {
        main: playback.thumbnail ?? null,
        fallback: playback.highlight.content?.photo || null,
      },
      summary: playback?.summary ?? null,
      playback: {
        id: playback.id,
        title: playback.title,
        description: playback.description,
        mlbVideoUrl: playback.mlb_video_url,
        mlbVideoDuration: playback.mlb_video_duration,
        processedVideoUrl: playback.processed_video_url,
        processedVideoDuration: playback.processed_video_duration,
        orientation: playback.orientation,
      },
      game: {
        home_team: {
          id: playback.highlight.game.home_team?.id,
          name: playback.highlight.game.home_team?.name ?? null,
          logo_url: playback.highlight.game.home_team?.logo_url ?? null,
        },
        away_team: {
          id: playback.highlight.game.away_team?.id,
          name: playback.highlight.game.away_team?.name ?? null,
          logo_url: playback.highlight.game.away_team?.logo_url ?? null,
        },
        date: playback.highlight.game.date,
        status: playback.highlight.game.status,
      },
      transcript: {
        original: playback.transcript,
        translated: playback.translated_transcript,
      },
    }));
  }

  private mapHighlights(
    highlights: (highlights & {
      content: { photo: string } | null;
      highlights: (highlights_playbacks & {
        liked_by: { user_id: string }[];
      })[];
      game: {
        home_team: {
          id: number;
          name: string;
          logo_url: string | null;
        };
        away_team: {
          id: number;
          name: string;
          logo_url: string | null;
        };
        date: string;
        status: string;
      };
    })[]
  ): HighlightItem[] {
    return highlights.map((highlight) => {
      const playback = highlight.highlights[0];
      return {
        id: highlight.id,
        gameId: highlight.game_id,
        createdAt: highlight.created_at,
        likes: playback?.likes ?? 0,
        youLiked: playback?.liked_by.length > 0,
        views: playback?.views ?? 0,
        thumbnail: {
          main: playback?.thumbnail ?? null,
          fallback: highlight.content?.photo || null,
        },
        playback: playback
          ? {
              id: playback.id,
              title: playback.title,
              description: playback.description,
              mlbVideoUrl: playback.mlb_video_url,
              mlbVideoDuration: playback.mlb_video_duration,
              processedVideoUrl: playback.processed_video_url,
              processedVideoDuration: playback.processed_video_duration,
              orientation: playback.orientation,
            }
          : {
              id: "",
              title: "",
              description: "",
              mlbVideoUrl: "",
              mlbVideoDuration: "",
              processedVideoUrl: null,
              processedVideoDuration: null,
              orientation: "HORIZONTAL",
            },
        game: {
          home_team: {
            id: highlight.game.home_team?.id,
            name: highlight.game.home_team?.name ?? null,
            logo_url: highlight.game.home_team?.logo_url ?? null,
          },
          away_team: {
            id: highlight.game.away_team?.id,
            name: highlight.game.away_team?.name ?? null,
            logo_url: highlight.game.away_team?.logo_url ?? null,
          },
          date: highlight.game.date,
          status: highlight.game.status,
        },
        transcript: {
          original: playback?.transcript,
          translated: playback?.translated_transcript,
        },
      };
    });
  }

  private mapHighlightsV2(
    highlights: (highlights & {
      content: { photo: string } | null;
      highlights: (highlights_playbacks & {
        liked_by: { user_id: string }[];
      })[];
      game: {
        home_team: {
          id: number;
          name: string;
          logo_url: string | null;
        };
        away_team: {
          id: number;
          name: string;
          logo_url: string | null;
        };
        date: string;
        status: string;
      };
    })[]
  ): HighlightItem[] {
    const items: HighlightItem[] = [];

    for (const highlight of highlights) {
      // Skip highlights without playbacks
      if (!highlight.highlights?.length) continue;

      // Add each playback as a separate item
      for (const playback of highlight.highlights) {
        items.push({
          id: playback.id, // Use playback ID as main identifier
          gameId: highlight.game_id,
          createdAt: highlight.created_at,
          likes: playback.likes ?? 0,
          views: playback.views ?? 0,
          youLiked: playback.liked_by.length > 0,
          thumbnail: {
            main: playback.thumbnail ?? null,
            fallback: highlight.content?.photo || null,
          },
          playback: {
            id: playback.id,
            title: playback.title,
            description: playback.description,
            mlbVideoUrl: playback.mlb_video_url,
            mlbVideoDuration: playback.mlb_video_duration,
            processedVideoUrl: playback.processed_video_url,
            processedVideoDuration: playback.processed_video_duration,
            orientation: playback.orientation,
          },
          game: {
            home_team: {
              id: highlight.game.home_team?.id,
              name: highlight.game.home_team?.name ?? null,
              logo_url: highlight.game.home_team?.logo_url ?? null,
            },
            away_team: {
              id: highlight.game.away_team?.id,
              name: highlight.game.away_team?.name ?? null,
              logo_url: highlight.game.away_team?.logo_url ?? null,
            },
            date: highlight.game.date,
            status: highlight.game.status,
          },
          transcript: {
            original: playback?.transcript,
            translated: playback?.translated_transcript,
          },
        });
      }
    }

    return items;
  }

  private shuffleWithBias(items: HighlightItem[]): HighlightItem[] {
    if (items.length <= 1) return items;

    // First, create chunks of the array to maintain some original ordering
    const chunkSize = Math.max(2, Math.floor(items.length / 3));
    const chunks: HighlightItem[][] = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }

    // Shuffle within each chunk
    chunks.forEach((chunk) => {
      for (let i = chunk.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chunk[i], chunk[j]] = [chunk[j], chunk[i]];
      }
    });

    // Shuffle the chunks themselves
    for (let i = chunks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chunks[i], chunks[j]] = [chunks[j], chunks[i]];
    }

    // Randomly decide whether to reverse some chunks
    chunks.forEach((chunk) => {
      if (Math.random() > 0.5) {
        chunk.reverse();
      }
    });

    // Flatten the chunks back into a single array
    return chunks.flat();
  }
}
