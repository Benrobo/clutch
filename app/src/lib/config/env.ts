import { DEV } from "esm-env";

// @ts-expect-error
import { PUBLIC_API_URL } from '$env/static/public';

const inDev: boolean = DEV;

const env = {
  apiUrl: PUBLIC_API_URL
};

export default env;