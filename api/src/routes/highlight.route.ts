import { Hono } from "hono";
import HighlightController from "../controllers/highlight.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import useCatchErrors from "../lib/error.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import {
  AIChatConversationSchema,
  ProcessLastMessageSchema,
} from "../lib/schema-validator.js";

const router = new Hono();
const basePath = "/highlights";
const highlightController = new HighlightController();

// Toggle like status for a highlight
router.put(
  `${basePath}/:playbackId/like`,
  useCatchErrors(
    isAuthenticated(highlightController.toggleLike.bind(highlightController))
  )
);

router.post(
  `${basePath}/:playbackId/start-conversation`,
  useCatchErrors(
    isAuthenticated(
      highlightController.startConversation.bind(highlightController)
    )
  )
);

router.post(
  `${basePath}/chat/:chatId`,
  validateSchema(AIChatConversationSchema),
  useCatchErrors(
    isAuthenticated(
      highlightController.aiChatConversation.bind(highlightController)
    )
  )
);

router.post(
  `${basePath}/chat/:chatId/process`,
  useCatchErrors(
    isAuthenticated(
      highlightController.processLastMessage.bind(highlightController)
    )
  )
);

router.get(
  `${basePath}/chat/:chatId/messages`,
  useCatchErrors(
    isAuthenticated(
      highlightController.getChatMessages.bind(highlightController)
    )
  )
);

// LOCAL AI CHAT CONVERSATION
router.post(
  `${basePath}/chat/process/local`,
  validateSchema(ProcessLastMessageSchema),
  useCatchErrors(
    isAuthenticated(
      highlightController.processLastMessageLocal.bind(highlightController)
    )
  )
);

export default router;
