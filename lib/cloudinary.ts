import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadSignatureResult {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export function generateUploadSignature(
  resellerId: string,
  mediaType: "image" | "video",
): UploadSignatureResult {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `aurani/resellers/${resellerId}/${mediaType}s`;

  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
  };
}

export function getTransformedUrl(publicId: string, type: "image" | "video"): string {
  if (type === "video") {
    return cloudinary.url(publicId, {
      resource_type: "video",
      secure: true,
      format: "mp4",
      quality: "auto",
    });
  }
  return cloudinary.url(publicId, {
    resource_type: "image",
    secure: true,
    transformation: [{ width: 1200, crop: "limit", fetch_format: "auto", quality: "auto" }],
  });
}
