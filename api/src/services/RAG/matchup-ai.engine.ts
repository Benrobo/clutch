import MLBAPIHelper from "../../helpers/mlb/mlb-api.helper.js";
import Gemini from "../../helpers/gemini.helper.js";
import retry from "async-retry";
import prisma from "../../prisma/index.js";
import { getPositionType } from "../../lib/utils.js";
import {
  PLAYER_ENGAGEMENT_QUESTIONS,
  PLAYER_POSITION_STATS_MAP,
} from "../../constant/matchup.js";
import {
  MLBPlayer,
  MLBPositionStats,
  MLBTeamDetail,
} from "../../types/mlb.types.js";
import {
  matchupPlayerComparisonPrompt,
  playerOfTheDayInsightPrompt,
} from "../../data/prompts/llm-prompts.js";

type PlayerStatsAnalysisFinalResponse = {
  title: string;
  players: {
    [key: string]: {
      stats: Array<{ key: string; value: string | number }>;
      visualization: {
        percentage: number;
        trending: "up" | "down";
      };
    };
  };
  insight: string;
};

type ParsedMatchupResponse = {
  players: {
    [playerId: string]: {
      visualization: {
        percentage: number;
        trending: "up" | "down";
      };
    };
  };
  insight: string;
};

interface PlayerOfTheDayResponse {
  analysis: Array<{
    title: string;
    players: {
      [playerId: string]: {
        stats: Array<{ key: string; value: string }>;
      };
    };
  }>;
  playerOfTheDay: {
    id: string;
    score: number;
    fullName: string;
    position: string;
  };
}

export default class MatchupAIEngine {
  private gemini: Gemini;
  private mlbApi: MLBAPIHelper;
  constructor() {
    this.gemini = new Gemini();
    this.mlbApi = new MLBAPIHelper();
  }

  private async getPlayerAndTeamInfo(playerId: number, teamId: number) {
    const [playerInfo, teamInfo] = await Promise.all([
      this.mlbApi.getPlayer(playerId),
      this.mlbApi.getTeam(teamId),
    ]);

    return {
      playerInfo,
      teamInfo,
    };
  }

  private async getPlayerInfo(playerId: number) {
    const playerInfo = await this.mlbApi.getPlayer(playerId);
    return playerInfo;
  }

  private async getPlayerStats(data: {
    challenger: number;
    opponent: number;
    season: number;
    position: string;
  }) {
    try {
      return await retry(
        async () => {
          const playarPosition = getPositionType(data?.position);
          if (!playarPosition) {
            throw new Error("Invalid position");
          }
          const [challengerStats, opponentStats] = await Promise.all([
            this.mlbApi.getPlayerStats(
              data?.challenger,
              playarPosition as any,
              {
                season: data?.season,
              }
            ),
            this.mlbApi.getPlayerStats(data?.opponent, playarPosition as any, {
              season: data?.season,
            }),
          ]);
          return {
            challengerStats: challengerStats?.stats[0]?.splits[0] ?? null,
            opponentStats: opponentStats?.stats[0]?.splits[0] ?? null,
          };
        },
        {
          retries: 3,
          onRetry(e, attempt) {
            console.log(`Failed to get player stats, attempt ${attempt}`);
          },
        }
      );
    } catch (e: any) {
      throw new Error("Failed to get player stats");
    }
  }

  private extractNeededStats(stats: MLBPositionStats, positon: string) {
    const positionStats = PLAYER_POSITION_STATS_MAP[positon as any];
    const availableStats = Object.keys(stats);
    const neededStats = [];
    for (const stat of positionStats) {
      if (availableStats.includes(stat)) {
        neededStats.push({
          key: stat,
          value: stats[stat],
        });
      }
    }
    return neededStats;
  }

  private async getPlayerNeededStats(data: {
    challengerId: number;
    opponentId: number;
    position: string;
    season: number;
  }) {
    const { challengerStats, opponentStats } = await this.getPlayerStats({
      challenger: data?.challengerId,
      opponent: data?.opponentId,
      season: data?.season,
      position: data?.position,
    });

    const challengerNeededStats = this.extractNeededStats(
      challengerStats?.stat,
      data?.position
    );

    const opponentNeededStats = this.extractNeededStats(
      opponentStats?.stat,
      data?.position
    );

    return {
      challengerNeededStats,
      opponentNeededStats,
    };
  }

  private transformToFinalResponse(
    parsedData: ParsedMatchupResponse,
    question: string,
    challengerStats: Array<{ key: string; value: string | number }>,
    opponentStats: Array<{ key: string; value: string | number }>,
    challengerId: string,
    opponentId: string
  ): PlayerStatsAnalysisFinalResponse {
    return {
      title: question,
      players: {
        [challengerId]: {
          stats: challengerStats,
          visualization: parsedData.players[challengerId].visualization,
        },
        [opponentId]: {
          stats: opponentStats,
          visualization: parsedData.players[opponentId].visualization,
        },
      },
      insight: parsedData.insight,
    };
  }

  async playersStatsAnalysis(data: {
    challenger: {
      stats: Array<{ key: string; value: string | number }>;
      player: {
        id: number;
        fullName: string;
        position: string;
        team: string;
      };
    };
    opponent: {
      stats: Array<{ key: string; value: string | number }>;
      player: {
        id: number;
        fullName: string;
        position: string;
        team: string;
      };
    };
    question: string;
  }) {
    console.log(`Analyzing player stats for matchup: ${data?.question}`);
    try {
      return await retry(
        async () => {
          const { challenger, opponent, question } = data;

          const prompt = matchupPlayerComparisonPrompt({
            challenger,
            opponent,
            question,
          });

          const response = await this.gemini.callAI({
            user_prompt: prompt,
            enable_call_history: false,
            model: "gemini-2.0-flash-exp",
            log: false,
          });

          if (!response?.data) {
            throw new Error("Failed to get player analysis");
          }

          const cleanData = response?.data
            ?.replace(/```json/g, "")
            .replace(/```/g, "");

          let parsedData;
          try {
            parsedData = JSON.parse(cleanData);
          } catch (e: any) {
            console.log(e);
            throw new Error("Failed to parse player analysis");
          }

          const finalResponse = this.transformToFinalResponse(
            parsedData,
            question,
            challenger?.stats,
            opponent?.stats,
            challenger?.player?.id.toString(),
            opponent?.player?.id.toString()
          );

          return finalResponse;
        },
        {
          retries: 3,
          onRetry(e, attempt) {
            console.log(
              `Player analysis failed, retrying.. attempt ${attempt}`
            );
          },
        }
      );
    } catch (e: any) {
      console.error("Failed to generate matchup highlights", e);
      throw new Error("Failed to generate matchup highlights");
    }
  }

  extractPlayerInfo(player: MLBPlayer & { team: MLBTeamDetail }) {
    return {
      id: player?.id,
      name: player?.fullName,
      team: {
        name: player?.team?.name,
        logo: player?.team?.logo,
        id: player?.team?.id,
      },
      position: player?.primaryPosition?.abbreviation,
      profilePicture: player?.profilePicture?.large,
      batSide: player?.batSide,
      birthCity: player?.birthCity,
      birthCountry: player?.birthCountry,
      height: player?.height,
      weight: player?.weight,
      active: player?.active,
      verified: player?.isVerified,
      gender: player?.gender,
      currentAge: player?.currentAge,
    };
  }

  async generateMatchupHighlights(matchupId: string) {
    try {
      const matchup = await prisma.matchups.findUnique({
        where: { id: matchupId },
      });

      if (!matchup) {
        throw new Error("Matchup not found");
      }

      const challenger = matchup?.challenger_id;
      const opponent = matchup?.opponent_id;

      if (!challenger || !opponent) {
        throw new Error("Challenger or opponent not found");
      }

      const challengerInfo = await this.getPlayerAndTeamInfo(
        Number(challenger),
        Number(matchup?.challenger_team_id)
      );

      const opponentInfo = await this.getPlayerAndTeamInfo(
        Number(opponent),
        Number(matchup?.opponent_team_id)
      );

      const { challengerNeededStats, opponentNeededStats } =
        await this.getPlayerNeededStats({
          challengerId: Number(challenger),
          opponentId: Number(opponent),
          position: matchup?.position,
          season: Number(matchup?.season),
        });

      const playerStatsComparisonQuestions =
        PLAYER_ENGAGEMENT_QUESTIONS[matchup?.position as any];

      const finalAnalysis: PlayerStatsAnalysisFinalResponse[] = [];

      for (const question of playerStatsComparisonQuestions) {
        const requiredStats = question?.stats;
        const challengerStats = requiredStats
          .map((stat) => challengerNeededStats.find((s) => s.key === stat))
          .map((stat) => {
            const validValue = isNaN(parseFloat(stat?.value as any))
              ? stat?.value
              : parseFloat(stat?.value as any);
            return {
              key: stat?.key,
              value: validValue,
            };
          })
          .filter(
            (
              stat
            ): stat is {
              key: keyof MLBPositionStats;
              value: string | number;
            } => stat !== undefined
          );

        const opponentStats = requiredStats
          .map((stat) => opponentNeededStats.find((s) => s.key === stat))
          .map((stat) => {
            const validValue = isNaN(parseFloat(stat?.value as any))
              ? stat?.value
              : parseFloat(stat?.value as any);
            return {
              key: stat?.key,
              value: validValue,
            };
          })
          .filter(
            (
              stat
            ): stat is {
              key: keyof MLBPositionStats;
              value: string | number;
            } => stat !== undefined
          );

        if (challengerStats?.length > 0 && opponentStats?.length > 0) {
          const analysis = await this.playersStatsAnalysis({
            challenger: {
              stats: challengerStats as any,
              player: {
                id: challenger,
                fullName: challengerInfo?.playerInfo?.fullName,
                position: challengerInfo?.playerInfo?.primaryPosition?.name,
                team: challengerInfo?.teamInfo?.name,
              },
            },
            opponent: {
              stats: opponentStats as any,
              player: {
                id: Number(opponent),
                fullName: opponentInfo?.playerInfo?.fullName,
                position: opponentInfo?.playerInfo?.primaryPosition?.name,
                team: opponentInfo?.teamInfo?.name,
              },
            },
            question: question?.question,
          });

          finalAnalysis.push(analysis);
        }
      }

      const playerScores = this.aggregatePlayerScores(finalAnalysis);

      const playerOfTheDay = await this.determinePlayerOfTheDay(
        finalAnalysis,
        playerScores
      );

      const playerOfTheDayInsight = await this.generatePlayerOfTheDayInsight(
        playerOfTheDay
      );

      return {
        analysis: finalAnalysis,
        playerOfTheDay: {
          ...playerOfTheDay?.playerOfTheDay,
          insight: playerOfTheDayInsight,
        },
        playerMetadata: {
          challenger: {
            info: this.extractPlayerInfo({
              ...challengerInfo?.playerInfo,
              team: challengerInfo?.teamInfo,
            }),
            stats: challengerNeededStats,
          },
          opponent: {
            info: this.extractPlayerInfo({
              ...opponentInfo?.playerInfo,
              team: opponentInfo?.teamInfo,
            }),
            stats: opponentNeededStats,
          },
        },
      };
    } catch (e: any) {
      console.error("Failed to generate matchup highlights", e);
      throw new Error(`Failed to generate matchup highlights: ${e?.message}`);
    }
  }

  private aggregatePlayerScores(
    analysis: PlayerStatsAnalysisFinalResponse[]
  ): Record<string, number> {
    const playerScores: Record<string, number> = {};

    analysis.forEach((question) => {
      Object.entries(question.players).forEach(([playerId, playerData]) => {
        const baseScore = playerData.visualization.percentage;
        const trendingModifier =
          playerData.visualization.trending === "up" ? 10 : -10;
        const finalScore = baseScore + trendingModifier;

        if (!playerScores[playerId]) {
          playerScores[playerId] = 0;
        }
        playerScores[playerId] += finalScore;
      });
    });

    return playerScores;
  }

  private async determinePlayerOfTheDay(
    analysis: PlayerStatsAnalysisFinalResponse[],
    scores: Record<string, number>
  ): Promise<PlayerOfTheDayResponse> {
    // Find player with highest score
    const [topPlayerId, topScore] = Object.entries(scores).reduce(
      (max, [id, score]) => (score > max[1] ? [id, score] : max),
      ["", -Infinity]
    );

    // Extract required information from analysis
    const simplifiedAnalysis = analysis.map((question) => ({
      title: question.title,
      players: Object.entries(question.players).reduce(
        (acc, [playerId, data]) => ({
          ...acc,
          [playerId]: {
            stats: data.stats,
          },
        }),
        {}
      ),
    }));

    let playerOfTheDayInfo = null;
    try {
      playerOfTheDayInfo = await retry(
        async () => {
          const playerOfTheDayInfo = await this.getPlayerInfo(
            Number(topPlayerId)
          );
          if (!playerOfTheDayInfo) {
            throw new Error("Failed to get player of the day info");
          }
          return playerOfTheDayInfo;
        },
        {
          retries: 3,
          onRetry(e, attempt) {
            console.log(
              `Failed to get player of the day info, attempt ${attempt}`
            );
          },
        }
      );
    } catch (e: any) {
      console.error("Failed to get player of the day info", e);
      throw new Error("Failed to get player of the day info");
    }

    return {
      analysis: simplifiedAnalysis,
      playerOfTheDay: {
        id: topPlayerId,
        score: topScore,
        fullName: playerOfTheDayInfo?.fullName,
        position: playerOfTheDayInfo?.primaryPosition?.name,
      },
    };
  }

  private async generatePlayerOfTheDayInsight(
    playerOfTheDay: PlayerOfTheDayResponse
  ) {
    try {
      const response = await retry(
        async () => {
          const prompt = playerOfTheDayInsightPrompt({
            playerOfTheDay: playerOfTheDay?.playerOfTheDay as any,
            analysis: playerOfTheDay?.analysis,
          });

          const response = await this.gemini.callAI({
            user_prompt: prompt,
            enable_call_history: false,
            model: "gemini-2.0-flash-exp",
          });

          if (!response?.data) {
            throw new Error("Failed to generate player of the day insight");
          }

          const cleanData = response?.data
            ?.replace(/```json/g, "")
            .replace(/```/g, "");

          let finalInsight = null;
          try {
            const parsedData = JSON.parse(cleanData);
            finalInsight = parsedData?.insight;
          } catch (e: any) {
            console.log(e);
            throw new Error("Failed to parse player of the day insight");
          }

          return finalInsight;
        },
        {
          retries: 3,
          onRetry(e, attempt) {
            console.log(
              `Failed to generate player of the day insight, attempt ${attempt}`
            );
          },
        }
      );

      return response;
    } catch (e: any) {
      console.error("Failed to generate player of the day insight", e);
      throw new Error("Failed to generate player of the day insight");
    }
  }
}
