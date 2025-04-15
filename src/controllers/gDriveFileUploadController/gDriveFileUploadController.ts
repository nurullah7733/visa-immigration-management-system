import {
  deleteFileToDrive,
  getOrCreateFolder,
  listAllUsersFolder,
  listFilesFromDrive,
  updateFileToDrive,
  uploadToDrive,
} from "../../utils/gDrive/gDrive.js";
import fs from "fs";

// list files from google drive
export const gDriveAllUsersFoldersListController = async (
  req: any,
  res: any
) => {
  try {
    const folderId = process.env.CENTRAL_FOLDER_ID || "";
    const listResult = await listAllUsersFolder(folderId);
    return res.status(200).json({ status: "success", data: listResult });
  } catch (error: any) {
    return res.status(400).json({ status: "fail", data: error?.errors });
  }
};
// list files from google drive
export const gDriveAUserFileListController = async (req: any, res: any) => {
  const { folderId } = req.params;
  try {
    const listResult = await listFilesFromDrive(folderId);
    return res.status(200).json({ status: "success", data: listResult });
  } catch (error: any) {
    return res.status(400).json({ status: "fail", data: error?.errors });
  }
};

// upload file to google drive
export const gDriveFileUploadController = async (req: any, res: any) => {
  const file = req.file;
  const { userEmail, formField } = req.body;

  if (!file || !userEmail || !formField) {
    if (!file) {
      return res.status(400).json({
        status: "fail",
        data: "Missing file",
      });
    } else if (!userEmail) {
      return res.status(400).json({
        status: "fail",
        data: "Missing email",
      });
    } else if (!formField) {
      return res.status(400).json({
        status: "fail",
        data: "Missing formField",
      });
    } else {
      return res.status(400).json({
        status: "fail",
        data: "Missing file, email, or formField info",
      });
    }
  }

  try {
    const parentFolderId = await getOrCreateFolder(userEmail);
    const fileName = `${formField}_${file.originalname}`;

    if (!parentFolderId) {
      return res
        .status(400)
        .json({ status: "fail", data: "parentFolderId create or find failed" });
    }

    const uploadedFile = await uploadToDrive(
      file.path,
      fileName,
      parentFolderId,
      formField
    );

    // Clean local temp file
    fs.unlinkSync(file.path);

    return res.status(200).json({
      status: "success",
      data: {
        driveFileId: uploadedFile.id,
        webViewLink: uploadedFile.webViewLink,
        name: uploadedFile.name,
        formField,
        userEmail,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(400).json({ status: "fail", data: error?.errors });
  }
};

// update file to google drive
export const gDriveFileUpdateController = async (req: any, res: any) => {
  const file = req.file;
  const { fileId } = req.body;

  // newFileName

  if (!file || !fileId) {
    if (!file) {
      return res.status(400).json({
        status: "fail",
        data: "Missing file",
      });
    } else if (!fileId) {
      return res.status(400).json({
        status: "fail",
        data: "Missing fileId",
      });
    } else {
      return res.status(400).json({
        status: "fail",
        data: "Missing file, fileId info",
      });
    }
  }

  try {
    const newFileName = file.originalname;
    const newFilePath = file.path;

    const updatedFileResult = await updateFileToDrive(
      fileId,
      newFilePath,
      newFileName
    );

    return res.status(200).json({
      status: "success",
      data: updatedFileResult,
    });
  } catch (error: any) {
    console.error("Update error:", error);
    return res.status(400).json({ status: "fail", data: error?.errors });
  }
};

// delete file to google drive
export const gDriveFileDeleteController = async (req: any, res: any) => {
  const { fileId } = req.params;
  try {
    const deleteFileResult = await deleteFileToDrive(fileId);

    return res.status(200).json({
      status: "success",
      data: deleteFileResult,
    });
  } catch (error: any) {
    // console.error("Delete error:", error);
    return res.status(400).json({ status: "fail", data: error?.errors });
  }
};
