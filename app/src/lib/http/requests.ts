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

export const markHighlightVideoAsSeen = async (playbackId: string) => {
	let url = `/recommendations/highlight/mark-seen?playbackId=${playbackId}`;
	const res = await $axios.post(url);
	return res.data;
};