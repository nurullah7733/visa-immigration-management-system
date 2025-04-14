// src/services/gDriveService.ts
import { google } from "googleapis";
import fs from "fs";
import mime from "mime-types"; // 👈 install this package for dynamic mime

const auth = new google.auth.GoogleAuth({
  keyFile: "bismillah-db2c4-37b6e207da79.json",
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// upload file to google drive
export const uploadToDrive = async (
  filePath: string,
  fileName: string,
  parentFolderId: string
) => {
  const mimeType = mime.lookup(filePath) || "application/octet-stream";

  const fileMetadata = {
    name: fileName,
    parents: [parentFolderId],
  };

  const media = {
    mimeType,
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, webViewLink, webContentLink, name",
  });

  return response.data;
};

// update file from google drive
export const updateFileToDrive = async (
  fileId: string,
  newFilePath: string,
  newFileName: string
) => {
  const fileMetadata = {
    name: newFileName,
  };

  const media = {
    mimeType: "application/octet-stream",
    body: fs.createReadStream(newFilePath),
  };

  const response = await drive.files.update({
    fileId,
    media,
    requestBody: fileMetadata,
    fields: "id, name, mimeType, webViewLink, webContentLink",
  });

  return response.data;
};

// delete file from google drive
export const deleteFileToDrive = async (fileId: string) => {
  const response = await drive.files.delete({
    fileId,
  });

  return response.status === 204;
};

// get or create folder
export const getOrCreateFolder = async (email: string) => {
  const CENTRAL_FOLDER_ID = "1AHQi54p4AZchw1Bndp6BDw2bk5wfzQUR";
  //   const CENTRAL_FOLDER_ID = process.env.CENTRAL_FOLDER_ID;

  if (!CENTRAL_FOLDER_ID) {
    console.log("Missing CENTRAL_FOLDER_ID");
    throw new Error("Missing CENTRAL_FOLDER_ID");
  }

  const query = `'${CENTRAL_FOLDER_ID}' in parents and name = '${email}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  const res = await drive.files.list({
    q: query,
    fields: "files(id, name)",
  });

  if (res.data.files?.length) {
    return res.data.files[0].id;
  } else {
    const folderMetadata = {
      name: email,
      mimeType: "application/vnd.google-apps.folder",
      parents: [CENTRAL_FOLDER_ID],
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id",
    });

    return folder.data.id;
  }
};
