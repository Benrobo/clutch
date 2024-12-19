import { Prisma } from "@prisma/client";
import { HttpException } from "./exception.js";
import sendResponse from "./send-response.js";
import type { Context } from "hono";

export default function useCatchErrors(fn: Function) {
  return async function (ctx: Context) {
    try {
      return await fn(ctx);
    } catch (err: any) {
      console.log(`😥 Error [${err.code}]: ${err?.message}`);
      console.log(err);
      if (
        err instanceof Prisma.PrismaClientKnownRequestError ||
        err instanceof Prisma.PrismaClientUnknownRequestError ||
        err instanceof Prisma.PrismaClientValidationError
      ) {
        return sendResponse.error(ctx, "INTERNAL SERVER ERROR", 500, err);
      }
      if (err instanceof HttpException) {
        return sendResponse.error(ctx, err.message, err.statusCode, err);
      }

      return sendResponse.error(ctx, "INTERNAL SERVER ERROR", 500, err);
    }
  };
}
