import { google } from "googleapis";
import env from "../config/env.js";
import type { Context } from "hono";

interface ISignIn {
  state?: string | undefined;
  c: Context;
}

interface ICallBack {
  code: string;
}

export const googleClient = new google.auth.OAuth2({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.GOOGLE_REDIRECT_URL,
});

// Google authorize
export default class GoogleAuth {
  constructor() {}

  public static async signIn({ state, c }: ISignIn) {
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const url = googleClient.generateAuthUrl({
      scope: scopes,
      state,
      access_type: "offline",
      // Enable incremental authorization.
      include_granted_scopes: true,
      prompt: "consent",
    });

    return c.redirect(url);
  }

  public static async callBack({ code }: ICallBack) {
    const token = await googleClient.getToken(code);
    googleClient.setCredentials(token.tokens);
    return token;
  }

  public static async verifyIdToken({ idToken }: { idToken: string }) {
    return await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
  }

  public static async verifyAccessToken(accessToken: string) {
    return await googleClient.getTokenInfo(accessToken);
  }

  public async tokenExpired(token: string) {}
}
