import { DEV } from "esm-env";

const inDev: boolean = DEV;

const env = {
  apiUrl: DEV ? "http://localhost:4050" : "https://clutch-api.benlab.space"
};

export default env;