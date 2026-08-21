import { Router } from "express";
import { shoppingAssistant } from "./ai.controller.js";

const aiRouter = Router();

aiRouter.post("/shopping-assistant", shoppingAssistant);

export default aiRouter;
