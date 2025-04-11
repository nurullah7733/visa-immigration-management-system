import express from "express";
const router = express.Router();
import {
  completeInviteController,
  sendInviteController,
  verifiyInviteController,
} from "../controllers/inviteController/inviteController.js";
import { createUserController } from "../controllers/userController/userController.js";

// Invite Routes
router.post("/send/invite", sendInviteController);
router.get("/verify/invite", verifiyInviteController);
router.post("/invite/complete", completeInviteController);

// user Routes
router.post("/create/user", createUserController);

export default router;
