import * as Minio from "minio";

// MinIO S3-compatible client singleton
const globalForMinio = globalThis as unknown as {
  minio: Minio.Client | undefined;
};

export const minioClient =
  globalForMinio.minio ??
  new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000"),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  });

if (process.env.NODE_ENV !== "production") {
  globalForMinio.minio = minioClient;
}

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "civicpulse-uploads";

/**
 * Ensure the upload bucket exists. Call once during app startup.
 */
export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
    // Set bucket policy to allow public read for serving images
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
  }
}

/**
 * Upload a file to MinIO.
 * @returns The object key used for storage
 */
export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "reports"
): Promise<{ key: string; url: string }> {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${folder}/${timestamp}-${sanitizedName}`;

  await minioClient.putObject(BUCKET_NAME, key, file, file.length, {
    "Content-Type": contentType,
  });

  const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL || "http://localhost:9000";
  const url = `${baseUrl}/${BUCKET_NAME}/${key}`;

  return { key, url };
}

/**
 * Delete a file from MinIO.
 */
export async function deleteFile(key: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, key);
}

/**
 * Generate a presigned URL for temporary access to a private object.
 * @param key Object key in MinIO
 * @param expirySeconds URL expiry time (default 1 hour)
 */
export async function getPresignedUrl(
  key: string,
  expirySeconds: number = 3600
): Promise<string> {
  return minioClient.presignedGetObject(BUCKET_NAME, key, expirySeconds);
}

export default minioClient;
