declare module '$env/static/public' {
    export const PUBLIC_API_URL: string;
}

export type BaseResponse<T> = {
	data: T;
	message: string;
};
