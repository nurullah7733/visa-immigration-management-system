import express from "express";
const router = express.Router();
import {
  completeInviteController,
  sendInviteController,
  verifiyInviteController,
} from "../controllers/inviteController/inviteController.js";
import {
  gDriveAUserFileListController,
  gDriveFileDeleteController,
  gDriveFileUpdateController,
  gDriveFileUploadController,
  gDriveAllUsersFoldersListController,
} from "../controllers/gDriveFileUploadController/gDriveFileUploadController.js";
import { singleFileUpload } from "../middlewares/multerMiddleware.js";
import {
  createOrUpdatePersonalInformationController,
  getPersonalInformationController,
} from "../controllers/personalInformationController/personalInformationController.js";
import {
  createOrUpdateCaseInfoController,
  getCaseInfoController,
} from "../controllers/caseInfoController/caseInfoController.js";

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
// gdrive file delete routes
router.get("/gdrive/file/delete/:fileId", gDriveFileDeleteController);
// gdrive file list routes
router.get("/gdrive/file/a-user-list/:folderId", gDriveAUserFileListController);
// gdrive file list routes
router.get("/gdrive/file/all-folder-list", gDriveAllUsersFoldersListController);

// case info
router.get("/get-case-info/:userId", getCaseInfoController);
router.post("/create-or-update-case-info", createOrUpdateCaseInfoController);

// personal information
router.get("/get-personal-info/:userId", getPersonalInformationController);
router.post(
  "/create-or-update-personal-info",
  createOrUpdatePersonalInformationController
);

export default router;
