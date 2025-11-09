import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

// Use a generic type since we don't have access to the backend FileRouter
// This is a workaround for the build - in production, you'd share types properly
export const UploadButton = generateUploadButton();
export const UploadDropzone = generateUploadDropzone();
