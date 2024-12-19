import type { StatusCode } from "hono/utils/http-status";

export class HttpException extends Error {
  public statusCode: StatusCode;
  constructor(message: string, statusCode: StatusCode) {
    super();
    this.name = "HttpException";
    this.message = message;
    this.statusCode = statusCode;
  }
}

export class WebhookException extends HttpException {
  constructor(message: string, statusCode: StatusCode = 400) {
    super(message, statusCode);
    this.name = "WebhookException";
  }
}
