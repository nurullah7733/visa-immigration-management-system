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
  parentFolderId: string,
  field: string, // e.g. 'press', 'awards', 'judging'
  appProperties: Record<string, string> // Dynamic properties per file
) => {
  const mimeType = mime.lookup(filePath) || "application/octet-stream";

  const fileNameWithoutSpace = fileName.replace(/ /g, "-");

  const fileMetadata = {
    name: fileNameWithoutSpace,
    parents: [parentFolderId],
    appProperties: {
      field,
      ...appProperties,
    },
  };

  const media = {
    mimeType,
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields:
      "id, webViewLink, webContentLink, name, appProperties, thumbnailLink, shared, mimeType",
  });

  if (response.data.id) {
    await drive.permissions.create({
      fileId: response.data.id ?? "",
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
  }
  return response.data;
};

// update file from google drive
export const updateFileToDrive = async (data: any) => {
  const updateOptions: any = {
    fileId: data["fileId"],
    fields:
      "id, webViewLink, webContentLink, name, appProperties, thumbnailLink, shared, mimeType",
  };

  // If there is any metadata to update
  if (
    data?.newFileName ||
    data?.formField ||
    data?.pageSource ||
    data?.status ||
    data?.note ||
    data?.googleScholarLink ||
    data?.publishedInOtherLocationsUrl ||
    data?.describeYourJudgingExperience ||
    data?.DescribeYourCriticalRole
  ) {
    const fileNameWithoutSpace = data?.newFileName
      ? data?.newFileName.replace(/ /g, "-")
      : undefined;

    updateOptions.requestBody = {
      ...(fileNameWithoutSpace && { name: fileNameWithoutSpace }),
      appProperties: {
        ...(data?.formField && { formField: data?.formField }),
        ...(data?.pageSource && { pageSource: data?.pageSource }),
        ...(data?.status !== undefined && { status: data?.status }),
        ...(data?.note !== undefined && { note: data?.note }),
        ...(data?.googleScholarLink !== undefined && {
          googleScholarLink: data?.googleScholarLink,
        }),
        ...(data?.publishedInOtherLocationsUrl !== undefined && {
          publishedInOtherLocationsUrl: data?.publishedInOtherLocationsUrl,
        }),
        ...(data?.describeYourJudgingExperience !== undefined && {
          describeYourJudgingExperience: data?.describeYourJudgingExperience,
        }),
        ...(data?.DescribeYourCriticalRole !== undefined && {
          DescribeYourCriticalRole: data?.DescribeYourCriticalRole,
        }),
      },
    };
  }

  // If there is a new file to upload
  if (data?.newFilePath) {
    updateOptions.media = {
      mimeType: "application/octet-stream",
      body: fs.createReadStream(data?.newFilePath),
    };
  }

  const response = await drive.files.update(updateOptions);
  return response.data;
};

// delete file from google drive
export const deleteFileToDrive = async (fileId: string) => {
  const response = await drive.files.delete({
    fileId,
  });

  return response.status === 204;
};

// list files from google drive
export const listFilesFromDrive = async (
  parentFolderId: string,
  pageSource?: string
) => {
  let query = `'${parentFolderId}' in parents and trashed = false`;

  if (pageSource) {
    query += ` and appProperties has { key='pageSource' and value='${pageSource}' }`;
  }

  const response = await drive.files.list({
    q: query,
    fields:
      "files(id, webViewLink, webContentLink, name, appProperties, thumbnailLink, shared, mimeType)",
    spaces: "drive",
  });

  return response.data.files || [];
};

// list all users folder from google drive
export const listAllUsersFolder = async (parentFolderId: string) => {
  const response = await drive.files.list({
    q: `'${parentFolderId}' in parents and trashed = false`,
    fields: "files(id, name, createdTime)",
    spaces: "drive",
  });

  return response.data.files;
};

// get or create folder
export const getOrCreateFolder = async (email: string) => {
  const CENTRAL_FOLDER_ID = process.env.CENTRAL_FOLDER_ID;

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
