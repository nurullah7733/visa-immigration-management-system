import {
  deleteFileToDrive,
  getOrCreateFolder,
  listAllUsersFolder,
  listFilesFromDrive,
  updateFileToDrive,
  uploadToDrive,
} from "../../services/gDrive/gDrive.js";
import fs from "fs";

// list folder from google drive
export const gDriveAllUsersFoldersListController = async (
  req: any,
  res: any
) => {
  try {
    const folderId = process.env.CENTRAL_FOLDER_ID || "";
    const listResult = await listAllUsersFolder(folderId);
    return res.status(200).json({ status: "success", data: listResult });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ status: "fail", data: error?.errors });
  }
};

// list files from google drive using (direct folderId)
export const gDriveAUserFileListController = async (req: any, res: any) => {
  const { folderId, pageSource } = req.query;
  try {
    const listResult = await listFilesFromDrive(folderId, pageSource);
    return res.status(200).json({ status: "success", data: listResult });
  } catch (error: any) {
    return res.status(400).json({ status: "fail", data: error?.errors });
  }
};

// list files from google drive using (direct userEmail)
export const gDriveAUserFileListByUserEmailController = async (
  req: any,
  res: any
) => {
  const { userEmail, pageSource } = req.query;
  try {
    const folderId = await getOrCreateFolder(userEmail);
    if (!folderId)
      return res.status(400).json({ status: "fail", data: "Folder not found" });
    const listResult = await listFilesFromDrive(folderId, pageSource);
    return res.status(200).json({ status: "success", data: listResult });
  } catch (error: any) {
    return res.status(400).json({ status: "fail", data: error?.errors });
  }
};

// upload file to google drive
export const gDriveFileUploadController = async (req: any, res: any) => {
  const file = req.file;
  const { userEmail, formField, pageSource, status, note } = req.body;

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

    const appProperties: Record<string, string> = {};

    if (userEmail) {
      appProperties["userEmail"] = userEmail;
    }

    if (status) {
      appProperties["status"] = status;
    } else {
      appProperties["status"] = "Pending";
    }
    if (note) {
      appProperties["note"] = note;
    }
    if (formField) {
      appProperties["formField"] = formField;
    }
    if (pageSource) {
      appProperties["pageSource"] = pageSource;
    }

    const uploadedFile = await uploadToDrive(
      file.path,
      fileName,
      parentFolderId,
      formField,
      appProperties
    );

    // Clean local temp file
    fs.unlinkSync(file.path);

    return res.status(200).json({
      status: "success",
      data: {
        ...uploadedFile,
        formField,
        userEmail,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(400).json({ status: "fail", data: error?.errors });
  }
};

// update/replace file to google drive
export const gDriveFileUpdateController = async (req: any, res: any) => {
  const file = req.file;
  const {
    fileId,
    userEmail,
    formField,
    pageSource,
    Approved,
    Pending,
    Rejected,
    status,
    note,
    googleScholarLink,
    publishedInOtherLocationsUrl,
    describeYourJudgingExperience,
    DescribeYourCriticalRole,
  } = req.body;

  try {
    let newFileName;
    let newFilePath;

    if (file) {
      newFileName = `${file.originalname}`;
      newFilePath = file.path;
    }

    const updatedFileResult = await updateFileToDrive({
      fileId,
      newFilePath,
      newFileName,
      formField,
      pageSource,
      status,
      note,
      googleScholarLink,
      publishedInOtherLocationsUrl,
      describeYourJudgingExperience,
      DescribeYourCriticalRole,
    });

    // Clean local temp file
    if (file) {
      fs.unlinkSync(file.path);
    }

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
