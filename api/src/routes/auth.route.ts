import { Hono } from "hono";
import useCatchErrors from "../lib/error.js";
import AuthController from "../controllers/auth.controller.js";

const router = new Hono();
const basePath = "/auth";
const authController = new AuthController();

router.get(
  `${basePath}/logout`,
  useCatchErrors(authController.logout.bind(authController))
);

router.get(
  `${basePath}/google`,
  useCatchErrors(authController.googleAuth.bind(authController))
);

router.get(
  `${basePath}/google/cb`,
  useCatchErrors(authController.googleAuthCallback.bind(authController))
);

export default router;
