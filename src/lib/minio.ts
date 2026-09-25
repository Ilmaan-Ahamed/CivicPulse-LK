import "server-only";
import { Client } from "minio";
import { isIP } from "node:net";

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

function assertProductionEndpoint(endpoint: string, port: number, useSSL: boolean, name: string) {
  if (process.env.NODE_ENV !== "production") return;

  const host = endpoint.toLowerCase().replace(/^\[|\]$/g, "");
  const ipVersion = isIP(host);
  const octets = ipVersion === 4 ? host.split(".").map(Number) : [];
  const privateIPv4 = ipVersion === 4 && (
    octets[0] === 0 ||
    octets[0] === 10 ||
    octets[0] === 127 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168) ||
    (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127)
  );
  const privateIPv6 = ipVersion === 6 && (
    host === "::" || host === "::1" ||
    host.startsWith("fc") || host.startsWith("fd") ||
    /^fe[89ab]/.test(host)
  );

  if (
    !endpoint ||
    endpoint.includes("://") ||
    endpoint.includes("/") ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    privateIPv4 ||
    privateIPv6
  ) {
    throw new Error(`${name} must be a publicly reachable hostname or IP in production`);
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} port must be a valid TCP port`);
  }
  if (!useSSL) {
    throw new Error(`${name} must use HTTPS in production`);
  }
}

function getClient() {
  if (client) return client;
  const endpoint = process.env.MINIO_ENDPOINT || (process.env.NODE_ENV === "development" ? "localhost" : "");
  const port = Number(process.env.MINIO_PORT || (process.env.NODE_ENV === "production" ? 443 : 9000));
  const useSSL = process.env.MINIO_USE_SSL === "true";
  assertProductionEndpoint(endpoint, port, useSSL, "MINIO_ENDPOINT");
  if (!endpoint) throw new Error("MINIO_ENDPOINT must be configured");
  client = createClient(endpoint, port, useSSL);

  return client;
}

function getReadClient() {
  if (readClient) return readClient;
  const endpoint = process.env.MINIO_PUBLIC_ENDPOINT || process.env.MINIO_ENDPOINT || "localhost";
  const port = Number(process.env.MINIO_PUBLIC_PORT || process.env.MINIO_PORT || (process.env.NODE_ENV === "production" ? 443 : 9000));
  const useSSL = (process.env.MINIO_PUBLIC_USE_SSL || process.env.MINIO_USE_SSL) === "true";
  assertProductionEndpoint(endpoint, port, useSSL, "MINIO_PUBLIC_ENDPOINT");
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