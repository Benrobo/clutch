import env from '@/config/env';
import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: `${env.apiUrl}/api`,
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true,
	timeout: 120 * 1000
});

export default axiosInstance;
