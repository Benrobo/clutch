import dayjs from "dayjs";
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
      orderBy: [{ created_at: "desc" }],
      take: preferredCount,
      ...(params.cursor ? { cursor: { id: params.cursor } } : {}),
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

    // Get discovery content
    const discoveryHighlights = await prisma.highlights.findMany({
      where: {
        game: {
          NOT: {
            OR: [
              { home_team_id: { in: userPrefs.teams } },
              { away_team_id: { in: userPrefs.teams } },
            ],
          },
        },
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
      orderBy: [{ created_at: "desc" }],
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

    return this.shuffleWithBias(
      this.mapHighlights([...preferredHighlights, ...discoveryHighlights])
    );
  }

  async getExploreFeed(
    userId: string,
    params: FeedParams
  ): Promise<HighlightItem[]> {
    const now = dayjs();
    const trendingHighlights = await prisma.highlights.findMany({
      where: {
        created_at: {
          gte: now.subtract(7, "day").toDate(),
        },
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
      orderBy: [{ created_at: "desc" }],
      take: Math.ceil(params.limit * 0.6),
      ...(params.cursor ? { cursor: { id: params.cursor } } : {}),
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

    // Get random highlights
    const randomHighlights = await prisma.highlights.findMany({
      where: {
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
      orderBy: [{ created_at: "desc" }],
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

    return this.shuffleWithBias(
      this.mapHighlights([...trendingHighlights, ...randomHighlights])
    );
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
        youLiked: playback?.liked_by.length > 0 ?? false,
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
      };
    });
  }

  private shuffleWithBias(items: HighlightItem[]): HighlightItem[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      if (Math.random() > 0.7) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
    }
    return result;
  }
}
