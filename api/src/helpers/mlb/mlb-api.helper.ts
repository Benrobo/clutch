import { AxiosError } from "axios";
import axios from "../../config/axios.js";
import {
  MLBAPIConfig,
  MLBGameContent,
  MLBLiveGameData,
  MLBScheduleResponse,
  MLBTeamDetail,
  MLBTeamsResponse,
  MLBPlayerResponse,
  MLBRosterResponse,
  MLBRosterPlayer,
  MLBPlayer,
  GameType,
} from "../../types/mlb.types.js";

class MLBAPIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any
  ) {
    super(`${status} ${statusText}: ${JSON.stringify(data)}`);
    this.name = "MLBAPIError";
  }
}

export default class MLBAPIHelper {
  private baseUrl: string;
  private sportId: number;
  private season: number;
  private gameType: GameType;

  constructor(config?: MLBAPIConfig) {
    this.baseUrl = config?.baseUrl || "https://statsapi.mlb.com/api/v1";
    this.sportId = config?.sportId || 1;
    this.season = config?.season || new Date().getFullYear();
    this.gameType = config?.gameType || "R";
  }

  /**
   * Get MLB schedule for specified parameters
   */
  async getSchedule(params?: {
    teamId?: number;
    startDate?: string;
    endDate?: string;
    gameType?: GameType;
    season?: number;
    hydrate?: string;
  }): Promise<MLBScheduleResponse> {
    try {
      const queryParams = new URLSearchParams({
        sportId: this.sportId.toString(),
        season: (params?.season || this.season).toString(),
        gameType: params?.gameType || this.gameType,
      });

      if (params?.teamId)
        queryParams.append("teamId", params.teamId.toString());
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.hydrate) queryParams.append("hydrate", params.hydrate);

      const { data } = await axios.get<MLBScheduleResponse>(
        `${this.baseUrl}/schedule?${queryParams.toString()}`
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new MLBAPIError(
          error.response?.status || 500,
          error.response?.statusText || "Internal Server Error",
          error.response?.data || error.message
        );
      }
      throw error;
    }
  }

  /**
   * Get team-specific schedule
   */
  async getTeamSchedule(
    teamId: number,
    params?: {
      season?: number;
      hydrate?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<MLBScheduleResponse> {
    return this.getSchedule({ teamId, ...params });
  }

  /**
   * Get all MLB teams
   */
  async getAllTeams(params?: {
    season?: number;
    activeStatus?: boolean;
  }): Promise<(MLBTeamDetail & { logo: string })[]> {
    try {
      const queryParams = new URLSearchParams({
        sportId: this.sportId.toString(),
        season: (params?.season || this.season).toString(),
      });

      if (params?.activeStatus !== undefined) {
        queryParams.append("activeStatus", params.activeStatus.toString());
      }

      const { data } = await axios.get<MLBTeamsResponse>(
        `${this.baseUrl}/teams?${queryParams.toString()}`
      );
      return data.teams.map((team) => ({
        ...team,
        logo: this.getTeamLogo(team.id),
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new MLBAPIError(
          error.response?.status || 500,
          error.response?.statusText || "Internal Server Error",
          error.response?.data || error.message
        );
      }
      throw error;
    }
  }

  /**
   * Get specific team by ID
   */
  async getTeam(teamId: number): Promise<MLBTeamDetail & { logo: string }> {
    try {
      const { data } = await axios.get<MLBTeamsResponse>(
        `${this.baseUrl}/teams/${teamId}`
      );
      return {
        ...data.teams[0],
        logo: this.getTeamLogo(teamId),
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new MLBAPIError(
          error.response?.status || 500,
          error.response?.statusText || "Internal Server Error",
          error.response?.data || error.message
        );
      }
      throw error;
    }
  }

  /**
   * Get content for a specific game
   */
  async getGameContent(
    gamePk: number,
    params?: {
      language?: string;
      fields?: string;
      mediaType?: string;
    }
  ): Promise<MLBGameContent> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.language) queryParams.append("language", params.language);
      if (params?.fields) queryParams.append("fields", params.fields);
      if (params?.mediaType) queryParams.append("mediaType", params.mediaType);

      const queryString = queryParams.toString();
      const { data } = await axios.get<MLBGameContent>(
        `${this.baseUrl}/game/${gamePk}/content${
          queryString ? `?${queryString}` : ""
        }`
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new MLBAPIError(
          error.response?.status || 500,
          error.response?.statusText || "Internal Server Error",
          error.response?.data || error.message
        );
      }
      throw error;
    }
  }

  /**
   * Get highlights for a specific game
   */
  async getGameHighlights(
    gamePk: number
  ): Promise<MLBGameContent["highlights"]> {
    const content = await this.getGameContent(gamePk, { fields: "highlights" });
    return content.highlights;
  }

  /**
   * Get live game data
   */
  async getLiveGame(gamePk: number): Promise<MLBLiveGameData> {
    try {
      const { data } = await axios.get<MLBLiveGameData>(
        `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new MLBAPIError(
          error.response?.status || 500,
          error.response?.statusText || "Internal Server Error",
          error.response?.data || error.message
        );
      }
      throw error;
    }
  }

  /**
   * Get player information by ID
   */
  async getPlayer(playerId: number): Promise<
    MLBPlayer & {
      profilePicture: ReturnType<MLBAPIHelper["getPlayerProfilePictures"]>;
    }
  > {
    try {
      const { data } = await axios.get<MLBPlayerResponse>(
        `${this.baseUrl}/people/${playerId}`
      );
      const player = data.people[0];
      return {
        ...player,
        profilePicture: this.getPlayerProfilePictures(playerId),
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new MLBAPIError(
          error.response?.status || 500,
          error.response?.statusText || "Internal Server Error",
          error.response?.data || error.message
        );
      }
      throw error;
    }
  }

  /**
   * Get multiple players by their IDs
   */
  async getPlayers(playerIds: number[]): Promise<
    (MLBPlayer & {
      profilePicture: ReturnType<MLBAPIHelper["getPlayerProfilePictures"]>;
    })[]
  > {
    try {
      const { data } = await axios.get<MLBPlayerResponse>(
        `${this.baseUrl}/people?personIds=${playerIds.join(",")}`
      );
      return data.people.map((player) => ({
        ...player,
        profilePicture: this.getPlayerProfilePictures(player.id),
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new MLBAPIError(
          error.response?.status || 500,
          error.response?.statusText || "Internal Server Error",
          error.response?.data || error.message
        );
      }
      throw error;
    }
  }

  /**
   * Get team roster
   * @param teamId - MLB team ID
   * @param rosterType - Type of roster (40Man, Active, etc.). Defaults to 'Active'
   */
  async getTeamRoster(
    teamId: number,
    rosterType: string = "Active"
  ): Promise<
    (MLBRosterPlayer & {
      profilePicture: ReturnType<MLBAPIHelper["getPlayerProfilePictures"]>;
    })[]
  > {
    try {
      const { data } = await axios.get<MLBRosterResponse>(
        `${this.baseUrl}/teams/${teamId}/roster/${rosterType}`
      );

      if (!data.roster) {
        return [];
      }

      return data.roster.map((player) => ({
        ...player,
        profilePicture: this.getPlayerProfilePictures(player.person.id),
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new MLBAPIError(
          error.response?.status || 500,
          error.response?.statusText || "Internal Server Error",
          error.response?.data || error.message
        );
      }
      throw error;
    }
  }

  public getTeamLogo(teamId: number): string {
    return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
  }

  async getTeams(): Promise<(MLBTeamDetail & { logo: string })[]> {
    try {
      const { data } = await axios.get<MLBTeamsResponse>(
        `${this.baseUrl}/teams`
      );
      return data.teams.map((team) => ({
        ...team,
        logo: this.getTeamLogo(team.id),
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new MLBAPIError(
          error.response?.status || 500,
          error.response?.statusText || "Internal Server Error",
          error.response?.data || error.message
        );
      }
      throw error;
    }
  }

  /**
   * Constructs profile picture URLs for a player in different sizes
   * @private
   */
  public getPlayerProfilePictures(playerId: number): {
    small: string;
    medium: string;
    large: string;
  } {
    const baseUrl = "https://img.mlbstatic.com/mlb-photos/image/upload";
    const fallback = "d_people:generic:headshot:silo:current.png";
    const quality = "q_auto:best,f_auto";
    const path = `v1/people/${playerId}/headshot/silo/current`;

    return {
      small: `${baseUrl}/w_60,${fallback},${quality}/${path}`,
      medium: `${baseUrl}/w_213,${fallback},${quality}/${path}`,
      large: `${baseUrl}/w_426,${fallback},${quality}/${path}`,
    };
  }
}
