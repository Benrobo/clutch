import { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HttpException } from "../lib/exception.js";
import UserService from "../services/user.service.js";
import type { CustomContext } from "../types/index.js";
import type { TokenInfo } from "google-auth-library";
import GoogleAuth, { googleClient } from "../lib/google.auth.js";

const userService = new UserService();

export function isAuthenticated(fn: Function) {
  return async (c: CustomContext, next: Next) => {
    const token = getCookie(c, "token");
    const userId = getCookie(c, "uId");

    if (!token || !userId) {
      throw new HttpException("Unauthorized", 401);
    }

    let decoded: TokenInfo | null = null;
    try {
      // verify token
      decoded = await GoogleAuth.verifyAccessToken(token);
    } catch (e: any) {
      console.log(`Refreshing token...`);

      const user = await prisma.users.findFirst({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new HttpException("Unauthorized, user not found", 401);
      }

      const refToken = user.google_ref_token;

      // refresh token
      googleClient.setCredentials({
        refresh_token: refToken,
      });

      const credentials = (await googleClient.refreshAccessToken()).credentials;

      if (!credentials) {
        throw new HttpException("Unauthorized", 401);
      }

      const userInfo = await googleClient.getTokenInfo(
        credentials.access_token!
      );

      if (!userInfo) {
        throw new HttpException("Unauthorized", 401);
      }

      // set cookie
      setCookie(c, "token", credentials.access_token!, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      // set userId in cookie
      setCookie(c, "uId", user.id!, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return await fn(c, next);
    }

    const email = decoded?.email;

    // check if user exists in our db
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        avatar: true,
        name: true,
        email: true,
        preferences: true,
      },
    });

    if (!email || !user) {
      // clear cookie
      deleteCookie(c, "token");
      deleteCookie(c, "uId");
      throw new HttpException("Unauthorized", 401);
    }

    c.set("user", user);
    return await fn(c, next);
  };
}
