import { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

class SendResponse {
  private capitalizeWord(word: string) {
    const capWrd = word.split("")[0].toUpperCase() + word.slice(1);
    return capWrd;
  }

  error(ctx: Context, message: string, statusCode: StatusCode, data?: any) {
    return ctx.json(
      {
        message: message ?? this.capitalizeWord("error-message"),
        data,
      },
      statusCode
    );
  }

  success(
    ctx: Context,
    message: string | null,
    statusCode: StatusCode,
    data?: any
  ) {
    return ctx.json(
      {
        ...(message && { message }),
        data,
      },
      statusCode
    );
  }
}

const sendResponse = new SendResponse();
export default sendResponse;
