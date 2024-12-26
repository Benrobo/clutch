import type { Context } from "hono";
import UserService from "../services/user.service.js";
import { deleteCookie, setCookie } from "hono/cookie";
import env from "../config/env.js";
import shortUUID from "short-uuid";
import GoogleAuth from "../lib/google.auth.js";

export default class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async googleAuth(c: Context) {
    const state = shortUUID.generate();
    return await GoogleAuth.signIn({ c, state });
  }

  public async googleAuthCallback(c: Context) {
    try {
      const code = c.req.query("code") as string;
      const { tokens } = await GoogleAuth.callBack({ code });

      if (!tokens || !tokens.id_token) {
        // redirect to client with error param
        c.redirect(`${env.CLIENT_URL}/auth?error=google_auth_failed`);
        console.log("Google Auth failed");
        return;
      }

      const { id_token, refresh_token } = tokens;
      const ticket = await GoogleAuth.verifyIdToken({ idToken: id_token! });

      const payload = ticket.getPayload();
      let email = payload?.email;

      if (!email) {
        // redirect to client with error param
        c.redirect(`${env.CLIENT_URL}/auth?error=email_not_found`);
        console.log("Email not found in Google Auth response");
        return;
      }

      const user = await prisma.users.findFirst({
        where: {
          email,
        },
      });

      if (!user) {
        // create one
        const uId = shortUUID.generate();
        const username = email.split("@")[0];
        const fullname = payload?.name;
        const avatar = payload?.picture;

        await this.userService.createOrUpdateUser({
          email,
          name: fullname!,
          id: uId,
          avatar: avatar!,
        });

        setCookie(c, "token", tokens.access_token!);
        setCookie(c, "uId", uId);

        console.log(`User created: ${email}`);

        return c.redirect(`${env.CLIENT_URL}/home/feed`);
      }

      // update
      await prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          google_ref_token: refresh_token,
        },
      });

      setCookie(c, "token", tokens.access_token!);
      setCookie(c, "uId", user.id);

      console.log(`User logged in with email: ${email}`);

      return c.redirect(`${env.CLIENT_URL}/home/feed`);
    } catch (e: any) {
      console.error(e);
      const msg = e.message || "Google Auth failed";
      // redirect to client with error param
      return c.redirect(
        `${env.CLIENT_URL}/auth?error=google_auth_failed&msg=${msg}`
      );
    }
  }

  public async logout(c: Context) {
    // clear cookie
    deleteCookie(c, "token");
    deleteCookie(c, "uId");
    return c.json({ message: "Logged out successfully" }, 200);
  }
}
