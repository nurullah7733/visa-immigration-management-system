import express from "express";
const router = express.Router();
import {
  completeInviteController,
  sendInviteController,
  verifiyInviteController,
} from "../controllers/inviteController/inviteController.js";
import {
  gDriveFileDeleteController,
  gDriveFileUpdateController,
  gDriveFileUploadController,
} from "../controllers/gDriveFileUploadController/gDriveFileUploadController.js";
import { singleFileUpload } from "../middlewares/multerMiddleware.js";

// Invite Routes
router.post("/send/invite", sendInviteController);
router.get("/verify/invite", verifiyInviteController);
router.post("/invite/complete", completeInviteController);

// gdrive file upload routes
router.post(
  "/gdrive/file/upload",
  singleFileUpload,
  gDriveFileUploadController
);
// gdrive file update routes
router.post(
  "/gdrive/file/update",
  singleFileUpload,
  gDriveFileUpdateController
);
// gdrive file update routes
router.get("/gdrive/file/delete/:fileId", gDriveFileDeleteController);

export default router;
