import type { SavePreference } from '@/types/games';
import $axios from './axios';

export const logout = async () => {
	const res = await $axios.get('/auth/logout');
	return res.data;
};

export const getLoggedInUser = async () => {
	const res = await $axios.get('/user');
	return res.data;
};

export const savePreference = async (data: SavePreference) => {
	const res = await $axios.post('/user/preference', data);
	return res.data;
};

export const hasPreference = async () => {
	const res = await $axios.get('/user/has-preference');
	return res.data;
};

export const getRecommendations = async (props: {
	type?: "foryou" | "explore";
	cursor?: string | null;
	limit?: number;
}) => {
	let url = `/recommendations/feed`;
	const urlParams = new URLSearchParams();

	if(props.type) urlParams.append("type", props.type);
	if(props.cursor) urlParams.append("cursor", props.cursor);
	if(props.limit) urlParams.append("limit", String(props.limit));

	if(urlParams.toString()) url += `?${urlParams.toString()}`

	const res = await $axios.get(url);
	return res.data;
};


export const getRecommendationsV2 = async (props: {
	type?: "foryou" | "explore";
	cursor?: string | null;
	limit?: number;
}) => {
	let url = `/recommendations/feed/v2`;
	const urlParams = new URLSearchParams();

	if(props.type) urlParams.append("type", props.type);
	if(props.cursor) urlParams.append("cursor", props.cursor);
	if(props.limit) urlParams.append("limit", String(props.limit));

	if(urlParams.toString()) url += `?${urlParams.toString()}`

	const res = await $axios.get(url);
	return res.data;
};

export const markHighlightVideoAsSeen = async (playbackId: string) => {
	let url = `/recommendations/highlight/mark-seen?playbackId=${playbackId}`;
	const res = await $axios.post(url);
	return res.data;
};

export const startPlaybackChatConversation = async (ref: string)=> {
  const res = await $axios.post(`/highlights/${ref}/start-conversation`);
	return res.data;
}

export const getChatMessages = async (ref: string)=> {
  const res = await $axios.get(`/highlights/chat/${ref}/messages`);
  return res.data;
}

export const sendMessage = async (ref: string, message: string)=> {
  const res = await $axios.post(`/highlights/chat/${ref}`, {message});
  return res.data;
}

export const processLastMsg = async (ref: string)=> {
  const res = await $axios.post(`/highlights/chat/${ref}/process`);
  return res.data;
}

export const processLastMsgLocal = async (payload: {
	last_message: string;
	pbId: string;
}) => {
	const res = await $axios.post(`/highlights/chat/process/local`, payload);
	return res.data;
};

export const getSpotlights = async ()=> {
  const res = await $axios.get(`/spotlights`);
  return res.data;
}

export const getSpotlightContent = async (id: string)=> {
  const res = await $axios.get(`/spotlight/${id}`);
  return res.data;
}

// GAME REQUESTS

export const getUserStats = async ()=> {
  const res = await $axios.get(`/dugout/stats`);
  return res.data;
}

export const getUserPointsByGameId = async (gameId: string)=> {
  const res = await $axios.get(`/dugout/${gameId}/points`);
  return res.data;
}

export const joinGame = async (gameId: string)=> {
  const res = await $axios.post(`/dugout/${gameId}/join`);
  return res.data;
}

export const getGamesProgress = async ()=> {
  const res = await $axios.get(`/dugout/games-progress`);
  return res.data;
}

export const upgradeLevel = async (gameId: string)=> {
  const res = await $axios.post(`/dugout/${gameId}/upgrade-level`);
  return res.data;
}

export const getGameChallenge = async (gameId: string) => {
  const res = await $axios.get(`/dugout/${gameId}/challenge`);
  return res.data;
}

export const completeChallenge = async (gameId: string, challengeId: string) => {
  const res = await $axios.post(`/dugout/${gameId}/challenges/${challengeId}/complete`);
  return res.data;
}

export const getGameHint = async (payload: {
	gameId: string;
	challengeId: string;
	selectedLetters?: string[];
	secretWord?: string;
}) => {
  const res = await $axios.post(`/dugout/hint`, {
    gameId: payload.gameId,
    challengeId: payload.challengeId,
    selectedLetters: payload.selectedLetters,
    secretWord: payload.secretWord
  });
  return res.data;
}


export const getMatchups = async () => {
  const res = await $axios.get(`/matchups`);
  return res.data;
}

export const createMatchup = async (payload: {
  challengerId: number;
  opponentId: number;
  challengerTeamId: number;
  opponentTeamId: number;
  position: string;
  season: number;
}) => {
  const res = await $axios.post(`/matchup`, payload);
  return res.data;
}

export const getTeamPlayers = async (teamId: number) => {
  const res = await $axios.get(`/matchup/players/${teamId}`);
  return res.data;
}