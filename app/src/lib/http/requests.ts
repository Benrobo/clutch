import $axios from './axios';

export const logout = async () => {
	const res = await $axios.get('/auth/logout');
	return res.data;
};

export const getLoggedInUser = async () => {
	const res = await $axios.get('/user');
	return res.data;
};
