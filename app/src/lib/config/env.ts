import { DEV } from "esm-env";

const inDev: boolean = DEV;

const env = {
  apiUrl: process.env.VITE_API_URL || "",
};

export default env;
