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