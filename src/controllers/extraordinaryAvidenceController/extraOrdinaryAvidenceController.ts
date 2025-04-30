import {
  getOrCreateFolder,
  uploadToDrive,
} from "../../services/gDrive/gDrive.js";
import fs from "fs";
import { RequestHandler } from "express";

export const extraOrdinaryPagegDriveFileUploadController: RequestHandler =
  async (req, res, next) => {
    try {
      const data = (req as any).formData;

      const userEmail = data?.userEmail;
      const formField = data?.formField || [];
      const pageSource = data?.pageSource || "";

      const approve = data?.approve || [];
      const reject = data?.reject || [];
      const note = data?.note || [];

      const scholarly_articles = data?.scholarly_articles || {};
      const judging = data?.judging || {};
      const critical_role = data?.critical_role || {};

      const googleScholarLink = scholarly_articles.google_scholar_link || "";
      const otherPublicationUrl =
        scholarly_articles.other_publication_url || "";
      const describeYourJudgingExperience = judging.description || "";
      const describeYourCriticalRole = critical_role.description || "";

      const files = req.files as Express.Multer.File[];

      if (!files || !userEmail) {
        res.status(400).json({
          status: "fail",
          data: "Missing files or userEmail",
        });
        return; // 👈 TypeScript now knows this function ends here (void)
      }

      const parentFolderId = await getOrCreateFolder(userEmail);

      if (!parentFolderId) {
        res.status(400).json({
          status: "fail",
          data: "parentFolderId create or find failed",
        });
        return;
      }

      const uploadedFiles = await Promise.all(
        files.map(async (file: any) => {
          let rawFieldName = file.fieldname || "unknown";
          let section = rawFieldName.split(".")[0];

          const fileName = `${section}_${file.originalname}`;

          let appProperties: Record<string, string> = {
            userEmail,
            pageSource,
          };

          // Add section-specific data
          switch (section) {
            case "scholarly_articles":
              appProperties.googleScholarLink =
                data?.scholarly_articles?.google_scholar_link || "";
              appProperties.otherPublicationUrl =
                data?.scholarly_articles?.other_publication_url || "";
              break;

            case "judging":
              appProperties.describeYourJudgingExperience =
                data?.judging?.description || "";
              break;

            case "critical_role":
              appProperties.describeYourCriticalRole =
                data?.critical_role?.description || "";
              break;
            default:
              break;
          }

          const uploaded = await uploadToDrive(
            file.path,
            fileName,
            parentFolderId,
            section,
            appProperties
          );

          fs.unlinkSync(file.path);

          return uploaded;
        })
      );

      res.status(200).json({
        status: "success",
        data: uploadedFiles,
      });
      return; // 👈 TypeScript happy now (void)
    } catch (error: any) {
      console.error("extra ordinary page Upload error:", error);
      res.status(400).json({ status: "fail", data: error?.message });
      return;
    }
  };
