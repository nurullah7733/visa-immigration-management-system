import {
  deleteFileToDrive,
  getOrCreateFolder,
  updateFileToDrive,
  uploadToDrive,
} from "../../utils/gDrive/gDrive.js";
import fs from "fs";

// upload file to google drive
export const gDriveFileUploadController = async (req: any, res: any) => {
  const file = req.file;
  const { userEmail, field } = req.body;

  if (!file || !userEmail || !field) {
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
    } else if (!field) {
      return res.status(400).json({
        status: "fail",
        data: "Missing field",
      });
    } else {
      return res.status(400).json({
        status: "fail",
        data: "Missing file, email, or field info",
      });
    }
  }

  try {
    const parentFolderId = await getOrCreateFolder(userEmail);
    const fileName = `${field}_${file.originalname}`;

    if (!parentFolderId) {
      return res
        .status(400)
        .json({ status: "fail", data: "parentFolderId create or find failed" });
    }

    const uploadedFile = await uploadToDrive(
      file.path,
      fileName,
      parentFolderId
    );

    // Clean local temp file
    fs.unlinkSync(file.path);

    return res.status(200).json({
      status: "success",
      data: {
        driveFileId: uploadedFile.id,
        webViewLink: uploadedFile.webViewLink,
        name: uploadedFile.name,
        field,
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
