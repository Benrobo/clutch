import { Context, Next } from "hono";
import { ZodSchema } from "zod";
import { HttpException } from "../lib/exception.js";
import sendResponse from "../lib/send-response.js";

export function validateSchema(schema: ZodSchema) {
  return async (c: Context, next: Next) => {
    try {
      const params = c.req.param();
      let body = {};

      // Only try to parse body for non-GET requests
      if (c.req.method !== "GET") {
        body = await c.req.json();
      }

      const validatedData = schema.safeParse({ body, params });

      if (!validatedData.success) {
        const issues = validatedData.error?.issues;
        const msg =
          issues?.length > 0
            ? issues[0]?.message && issues[0]?.message === "Required"
              ? "VALIDATION ERROR"
              : issues[0]?.message
            : validatedData.error?.message ?? "VALIDATION ERROR";
        return sendResponse.error(c, msg, 400, validatedData.error);
      }

      c.set("validatedData", validatedData.data);
      await next();
    } catch (error) {
      return sendResponse.error(c, "Invalid request data", 400, error);
    }
  };
}
