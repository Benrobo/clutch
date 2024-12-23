import { Context, Next } from "hono";
import { ZodSchema } from "zod";
import { HttpException } from "../lib/exception.js";
import sendResponse from "../lib/send-response.js";

export function validateSchema(schema: ZodSchema) {
  return async (c: Context, next: Next) => {
    const body = await c.req.json();
    const validatedData = schema.safeParse(body);

    console.log(validatedData.error);

    if (validatedData.error) {
      const issues = validatedData.error?.issues;
      const msg =
        issues?.length > 0
          ? issues[0]?.message
          : validatedData.error?.message ?? "VALIDATION ERROR";
      return sendResponse.error(c, msg, 400);
    }

    c.set("validatedData", validatedData.data);
    await next();
  };
}
