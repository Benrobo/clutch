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
  `${basePath}/add-preference`,
  validateSchema(AddUserPreferencesSchema),
  useCatchErrors(
    isAuthenticated(userController.addPreference.bind(userController))
  )
);

export default router;
