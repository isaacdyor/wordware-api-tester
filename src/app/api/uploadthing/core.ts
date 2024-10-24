import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "8MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("Image upload complete for file", file);
    },
  ),

  audioUploader: f({ audio: { maxFileSize: "32MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("Audio upload completed:", file.name, file.url);
    },
  ),

  pdfUploader: f({ pdf: { maxFileSize: "8MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("PDF upload complete for file", file);
    },
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
