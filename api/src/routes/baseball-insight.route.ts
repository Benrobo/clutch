import { Hono } from "hono";
import BaseballInsightController from "../controllers/baseball-insight.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import useCatchErrors from "../lib/error.js";

const router = new Hono();
const basePath = "/baseball-insight";
const baseballInsightController = new BaseballInsightController();

router.post(
  `${basePath}/chat`,
  useCatchErrors(
    isAuthenticated(
      baseballInsightController.createChat.bind(baseballInsightController)
    )
  )
);

router.get(
  `${basePath}/chats`,
  useCatchErrors(
    isAuthenticated(
      baseballInsightController.getChats.bind(baseballInsightController)
    )
  )
);

router.get(
  `${basePath}/chat/:chatId`,
  useCatchErrors(
    isAuthenticated(
      baseballInsightController.getChatById.bind(baseballInsightController)
    )
  )
);

export default router;
