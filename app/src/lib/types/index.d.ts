declare module '$env/static/public' {
    export const PUBLIC_API_URL: string;
}

declare module 'nprogress';

export type BaseResponse<T> = {
	data: T;
	message: string;
};
