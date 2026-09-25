import "server-only";
import { Client } from "minio";

const bucketName = process.env.MINIO_BUCKET_NAME || process.env.MINIO_BUCKET || "civicpulse-reports";
let client: Client | undefined;
let readClient: Client | undefined;
let bucketReady: Promise<void> | undefined;

function createClient(endpoint: string, port: number, useSSL: boolean) {
  const accessKey = process.env.MINIO_ACCESS_KEY || (process.env.NODE_ENV === "development" ? "minioadmin" : undefined);
  const secretKey = process.env.MINIO_SECRET_KEY || (process.env.NODE_ENV === "development" ? "minioadmin" : undefined);
  if (!accessKey || !secretKey) {
    throw new Error("MINIO_ACCESS_KEY and MINIO_SECRET_KEY must be configured");
  }

  return new Client({
    endPoint: endpoint,
    port,
    useSSL,
    accessKey,
    secretKey,
  });
}

function getClient() {
  if (client) return client;
  client = createClient(
    process.env.MINIO_ENDPOINT || "localhost",
    Number(process.env.MINIO_PORT || 9000),
    process.env.MINIO_USE_SSL === "true"
  );

  return client;
}

function getReadClient() {
  if (readClient) return readClient;
  const endpoint = process.env.MINIO_PUBLIC_ENDPOINT || process.env.MINIO_ENDPOINT || "localhost";
  const port = Number(process.env.MINIO_PUBLIC_PORT || process.env.MINIO_PORT || 9000);
  const useSSL = (process.env.MINIO_PUBLIC_USE_SSL || process.env.MINIO_USE_SSL) === "true";
  readClient = createClient(endpoint, port, useSSL);
  return readClient;
}

async function ensureBucket() {
  if (!bucketReady) {
    bucketReady = (async () => {
      const minio = getClient();
      if (!(await minio.bucketExists(bucketName))) {
        await minio.makeBucket(bucketName);
      }
    })().catch((error) => {
      bucketReady = undefined;
      throw error;
    });
  }

  await bucketReady;
}

export async function uploadFile(buffer: Buffer, key: string, contentType: string) {
  await ensureBucket();
  await getClient().putObject(bucketName, key, buffer, buffer.length, {
    "Content-Type": contentType,
  });
}

export async function getPresignedUrl(key: string, expiresInSeconds = 15 * 60) {
  return getReadClient().presignedGetObject(bucketName, key, expiresInSeconds);
}

export async function tryGetPresignedUrl(key: string) {
  try {
    return await getPresignedUrl(key);
  } catch (error) {
    console.error("[MINIO SIGN URL ERROR]", error);
    return null;
  }
}