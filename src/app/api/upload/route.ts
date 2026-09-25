import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/minio";
import { consumeUploadLimit } from "@/lib/upload-rate-limit";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const mimeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const uploadSchema = z
  .instanceof(File)
  .refine((file) => Boolean(mimeExtensions[file.type]), "Only JPEG, PNG, and WebP images are allowed")
  .refine((file) => file.size > 0 && file.size <= MAX_FILE_SIZE, "Images must be between 1 byte and 10 MB");

function matchesImageSignature(bytes: Buffer, contentType: string) {
  if (contentType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (contentType === "image/png") {
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  return (
    contentType === "image/webp" &&
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  );
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireRole(["CITIZEN"]);
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const limit = await consumeUploadLimit(user.id);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Upload limit reached. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE + 64 * 1024) {
      return NextResponse.json({ success: false, error: "Image must be 10 MB or smaller" }, { status: 413 });
    }

    const formData = await request.formData();
    const files = formData.getAll("file");
    if (files.length !== 1) {
      return NextResponse.json({ success: false, error: "Upload exactly one image per request" }, { status: 400 });
    }

    const parsed = uploadSchema.safeParse(files[0]);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid image file" },
        { status: 400 }
      );
    }

    const file = parsed.data;
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!matchesImageSignature(buffer, file.type)) {
      return NextResponse.json({ success: false, error: "File contents do not match an allowed image type" }, { status: 400 });
    }

    const key = `reports/${user.id}/${randomUUID()}.${mimeExtensions[file.type]}`;
    await uploadFile(buffer, key, file.type);

    return NextResponse.json({ success: true, key }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload image";
    const errorCode = typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "UNKNOWN";
    console.error("[UPLOAD ERROR]", { name: error instanceof Error ? error.name : "UnknownError", code: errorCode, message });
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ success: false, error: status === 500 ? "Unable to upload image" : message }, { status });
  }
}