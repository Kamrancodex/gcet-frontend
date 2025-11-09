import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

// Type definition for the file router
type OurFileRouter = {
  imageUploader: {
    input: void;
    output: { url: string; key: string; name: string; size: number };
  };
};

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
