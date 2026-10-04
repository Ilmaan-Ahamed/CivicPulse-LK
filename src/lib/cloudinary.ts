import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const requiredCloudinaryEnvironmentVariables = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

export function assertCloudinaryCredentials() {
  const missing = requiredCloudinaryEnvironmentVariables.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing ${missing.join(", ")}`);
  }
}

export async function uploadReportImage(fileBuffer: Buffer, folder = "civicpulse-reports") {
  assertCloudinaryCredentials();

  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        console.log("[CLOUDINARY UPLOAD RESPONSE]", {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          folder,
          resource_type: "image",
          response: result,
        });
        if (!result?.secure_url || !result.public_id) {
          reject(new Error("Cloudinary returned an incomplete upload response"));
          return;
        }
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(fileBuffer);
  });
}

export async function deleteReportImage(publicId: string) {
  assertCloudinaryCredentials();
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary image deletion failed: ${result.result}`);
  }
}