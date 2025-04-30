import {
  deleteFileToDrive,
  getOrCreateFolder,
  listAllUsersFolder,
  listFilesFromDrive,
  updateFileToDrive,
  uploadToDrive,
} from "../../services/gDrive/gDrive.js";
import fs from "fs";
import supabase from "../../utils/supabase/supabaseClient.js";
import { file } from "googleapis/build/src/apis/file/index.js";

// list All evidences
export const getAllEvidences = async (req: any, res: any) => {
  const userId = req.params.userId;

  try {
    if (!userId) {
      return res.status(200).json({ status: "fail", data: "Missing user id" });
    }

    const { data, error } = await supabase
      .from("evidences")
      .select()
      .eq("user_id", userId);

    if (!error) {
      return res.status(200).json({ status: "success", data });
    } else {
      return res.status(400).json({ status: "fail", data: error });
    }
  } catch (error: any) {
    return res.status(400).json({ status: "fail", data: error?.errors });
  }
};

export const uploadEvidenceGdriveAndSaveToDb = async (req: any, res: any) => {
  const files = req.files;
  const reqBody = req.body;
  const userEmail = reqBody.userEmail;
  const userId = reqBody.userId;
  const pageSource = reqBody.pageSource;

  if (!files) {
    return res.status(400).json({
      status: "fail",
      data: "No files received",
    });
  }

  try {
    if (userId) {
      const { data, error } = await supabase
        .from("users")
        .select("id", userId)
        .eq("id", userId);

      if (error) {
        return res.status(400).json({
          status: "fail",
          data: "Database error: " + error.message,
        });
      }

      if (!data || data.length === 0) {
        return res.status(400).json({
          status: "fail",
          data: "User not found!",
        });
      }
    } else {
      return res.status(400).json({
        status: "fail",
        data: "Missing user id",
      });
    }

    // Step 1: Create/Get Parent Folder
    const parentFolderId = (await getOrCreateFolder(userEmail)) as string;

    const tempInsertData: any[] = [];

    // Step 2: Upload each file
    for (const [fieldName, fileArray] of Object.entries(files)) {
      for (const file of fileArray as any[]) {
        const type = fieldName.replace("_files", ""); // eg: awards_files -> awards

        const uploadedFile = await uploadToDrive(
          file.path,
          file.originalname,
          parentFolderId,
          type,
          pageSource
        );

        // Local temp file delete
        fs.unlinkSync(file.path);

        if (uploadedFile) {
          tempInsertData.push({
            type: type,
            file_name: file.originalname,
            file_url: uploadedFile.webViewLink,
            file_id: uploadedFile.id,
          });
        }
      }
    }

    // Step 3: Push description / link / url fields
    for (const [key, value] of Object.entries(reqBody)) {
      if (
        key.endsWith("_description") ||
        key.endsWith("_link") ||
        key.endsWith("_url")
      ) {
        const type = key.split("_")[0];
        tempInsertData.push({
          type: type,
          [key]: value,
        });
      }
    }

    // Step 4: Group by type
    const groupedData: any = {};

    for (const item of tempInsertData) {
      const { type, file_id, file_url, file_name, ...others } = item;

      if (!groupedData[type]) {
        groupedData[type] = { type, files: [], ...others };
      }

      if (file_id && file_url && file_name) {
        groupedData[type].files = groupedData[type].files || [];
        groupedData[type].files.push({ file_id, file_url, file_name });
      }

      Object.assign(groupedData[type], others);
    }

    const initialInsertData = Object.values(groupedData);

    // Step 5: Merge types by first word
    const mergeByFirstWord = (data: any[]) => {
      const groupMap: any = {};

      data.forEach((item) => {
        let { type, files, ...rest } = item;

        // Step 1: extract first word based on "_" or " "
        const firstWord = type.split(/[_\s]/)[0];

        // Step 2: create group if not exist
        if (!groupMap[firstWord]) {
          groupMap[firstWord] = { type, files: [], ...rest };
        } else {
          // Prefer longer type if type is different
          if (type.length > groupMap[firstWord].type.length) {
            groupMap[firstWord].type = type;
          }
          Object.assign(groupMap[firstWord], rest);
        }

        // Step 3: add files if exist
        if (files && files.length) {
          files.forEach((file: { file_name: any }) => {
            groupMap[firstWord].files.push({
              ...file,
              file_name: `${type}_${file.file_name}`, // temporarily add type
            });
          });
        }
      });

      // Step 4: Final adjustment: fix file_names
      const finalData = Object.values(groupMap).map((group) => {
        group.files = group.files.map((file: { file_name: string }) => ({
          ...file,
          file_name: `${group.type}_${file.file_name.split("_").slice(1).join("_")}`,
        }));
        return group;
      });

      return finalData;
    };

    const finalInsertData = mergeByFirstWord(initialInsertData);

    // Step 6: Upsert to Supabase
    const { data, error } = await supabase
      .from("evidences")
      .upsert(
        { user_id: userId, evidences: finalInsertData },
        { onConflict: "user_id" }
      )
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json({
        status: "fail",
        data: "Database insert error",
      });
    }

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: "fail",
      message: "Server error",
    });
  }
};

// delete file to google drive
export const deleteFileToGdriveAndUpdateDb = async (req: any, res: any) => {
  const { fileId, userId } = req.body;
  try {
    if (!fileId || !userId) {
      return res
        .status(400)
        .json({ status: "fail", data: "Missing fileId or userId!" });
    }

    const deleteFileResult = await deleteFileToDrive(fileId);
    // const deleteFileResult = true;
    if (deleteFileResult) {
      const { data, error } = await supabase
        .from("evidences")
        .select()
        .eq("user_id", userId);

      if (!data || error) {
        return res
          .status(200)
          .json({ status: "fail", data: "user data not found!" });
      }

      let evidences = data[0].evidences || [];

      // console.log(evidences[0].files[0], "evidences");

      let updated = false;
      evidences = evidences.map((item) => {
        if (item.files) {
          const updatedFiles = item.files.filter(
            (file) => file.file_id !== fileId
          );
          if (updatedFiles.length !== item.files.length) {
            updated = true;
            return { ...item, files: updatedFiles };
          }
        }
        return item;
      });

      evidences = evidences.filter(
        (item) => !item.files || item.files.length > 0
      );

      if (!updated) {
        return res.status(400).json({
          status: "fail",
          data: "file not found in database",
        });
      }

      const { error: updateError } = await supabase
        .from("evidences")
        .update({ evidences })
        .eq("user_id", userId);

      if (updateError) {
        return res.status(400).json({
          status: "fail",
          data: updateError.message,
        });
      }

      return res.status(200).json({
        status: "success",
        data: "updated success",
      });
    }
  } catch (error: any) {
    // console.error("Delete error:", error);
    return res.status(400).json({ status: "fail", data: error?.errors });
  }
};
