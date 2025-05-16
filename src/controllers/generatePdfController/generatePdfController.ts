import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import axios from "axios";

export const generatePDFController = async (req: any, res: any) => {
  const { documentsBySection, sortedSections } = req.body;

  try {
    const pdfDoc = await PDFDocument.create();

    for (const section of sortedSections) {
      const sectionDocs = documentsBySection[section.id] || [];
      if (sectionDocs.length === 0) continue;

      // Add section title page
      const fontSize = 24;
      const padding = 10;
      const pageWidth = 612;
      const pageHeight = fontSize + padding * 2;

      const titlePage = pdfDoc.addPage([pageWidth, pageHeight]);

      const text = section.name;
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const x = (pageWidth - textWidth) / 2;
      const y = (pageHeight - fontSize) / 2;

      titlePage.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
      });

      for (const doc of sectionDocs) {
        const url = doc.webContentLink;

        try {
          const response = await axios.get(url, {
            responseType: "arraybuffer",
          });

          const mimeType = doc.mimeType || "";

          if (mimeType === "application/pdf") {
            // Process PDF
            const externalPdf = await PDFDocument.load(response.data);
            const pages = await pdfDoc.copyPages(
              externalPdf,
              externalPdf.getPageIndices()
            );
            pages.forEach((page) => pdfDoc.addPage(page));
          } else if (mimeType.startsWith("image/")) {
            // Process Image
            const imageBytes = response.data;
            let embeddedImage;
            let imgDims;

            if (mimeType === "image/png") {
              embeddedImage = await pdfDoc.embedPng(imageBytes);
              imgDims = embeddedImage.scale(1);
            } else {
              embeddedImage = await pdfDoc.embedJpg(imageBytes); // fallback for jpg
              imgDims = embeddedImage.scale(1);
            }

            const imgPage = pdfDoc.addPage([imgDims.width, imgDims.height]);
            imgPage.drawImage(embeddedImage, {
              x: 0,
              y: 0,
              width: imgDims.width,
              height: imgDims.height,
            });
          } else {
            console.warn(`Unsupported file type: ${mimeType}`);
          }
        } catch (err) {
          console.error(`Error processing document ${doc.name}`, err);
        }
      }
    }

    const finalPdf = await pdfDoc.save();
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=merged.pdf",
    });
    res.send(Buffer.from(finalPdf));
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).send("Failed to generate PDF.");
  }
};
