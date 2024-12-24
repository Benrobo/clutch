import useCatchErrors from "../lib/error.js";
import UserController from "../controllers/user.controller.js";
import { Hono } from "hono";
import { validateSchema } from "../middlewares/validateSchema.js";
import { AddUserPreferencesSchema } from "../lib/schema-validator.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = new Hono();
const basePath = "/user";
const userController = new UserController();

router.post(
  `${basePath}/preference`,
  validateSchema(AddUserPreferencesSchema),
  useCatchErrors(
    isAuthenticated(userController.addPreference.bind(userController))
  )
);

router.get(
  basePath,
  useCatchErrors(
    isAuthenticated(userController.getAuthenticatedUser.bind(userController))
  )
);

router.get(
  `${basePath}/has-preference`,
  useCatchErrors(
    isAuthenticated(userController.hasPreference.bind(userController))
  )
);

export default router;
