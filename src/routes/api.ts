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
import {
  singleFileUpload,
  multipleFileUpload,
  parseFormData,
} from "../middlewares/multerMiddleware.js";
import {
  createOrUpdatePersonalInformationController,
  getPersonalInformationController,
} from "../controllers/personalInformationController/personalInformationController.js";
import {
  createOrUpdateCaseInfoController,
  getAllCaseInfoController,
  getCaseInfoController,
} from "../controllers/caseInfoController/caseInfoController.js";
import {
  createOrUpdateEmploymentInfoController,
  getEmploymentInfoController,
} from "../controllers/employmentInfoController/employmentInfoController.js";
import {
  createOrUpdateEmployerInfoController,
  getEmployerInfoController,
} from "../controllers/employerInfoController/employerInfoController.js";
import { extraOrdinaryPagegDriveFileUploadController } from "../controllers/extraordinaryAvidenceController/extraOrdinaryAvidenceController.js";
import { updateUserEmailOrPasswordController } from "../controllers/userControllers/userController.js";

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
router.get("/gdrive/file/a-user-list", gDriveAUserFileListController);
// gdrive file list routes
router.get("/gdrive/file/all-folder-list", gDriveAllUsersFoldersListController);

// case info
router.get("/get-case-info/:userId", getCaseInfoController);
router.get("/get-all-case-info/", getAllCaseInfoController);
router.post("/create-or-update-case-info", createOrUpdateCaseInfoController);

// personal information
router.get("/get-personal-info/:userId", getPersonalInformationController);
router.post(
  "/create-or-update-personal-info",
  createOrUpdatePersonalInformationController
);

// Employment information
router.get("/get-employment-info/:userId", getEmploymentInfoController);
router.post(
  "/create-or-update-employment-info",
  createOrUpdateEmploymentInfoController
);

// employer information
router.get("/get-employer-info/:userId", getEmployerInfoController);
router.post(
  "/create-or-update-employer-info",
  createOrUpdateEmployerInfoController
);

// extraordinary evidence (get, delete, update same as gdrive)
router.post(
  "/upload-extra-ordinary-files",
  parseFormData,
  extraOrdinaryPagegDriveFileUploadController
);

// users email and password update
router.post(
  "/update-user-email-or-password",
  updateUserEmailOrPasswordController
);

export default router;
