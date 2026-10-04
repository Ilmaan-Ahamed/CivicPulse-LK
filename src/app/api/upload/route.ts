import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deleteReportImage, uploadReportImage } from "@/lib/cloudinary";
import { consumeUploadLimit } from "@/lib/upload-rate-limit";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const uploadSchema = z
  .instanceof(File)
  .refine((file) => allowedMimeTypes.includes(file.type), "Only JPEG, PNG, and WebP images are allowed")
  .refine((file) => file.size > 0 && file.size <= MAX_FILE_SIZE, "Images must be between 1 byte and 5 MB");

const deleteSchema = z.object({ public_id: z.string().min(1).max(300) });

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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Please sign in to upload a photo." }, { status: 401 });
    }

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
      return NextResponse.json({ success: false, error: "Image must be 5 MB or smaller" }, { status: 400 });
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

    const image = await uploadReportImage(buffer, `civicpulse-reports/${user.id}`);

    return NextResponse.json(
      { success: true, ...image },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errorCode = typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "UNKNOWN";
    const status = 500;
    console.error("[UPLOAD ERROR]", {
      name: error instanceof Error ? error.name : "UnknownError",
      code: errorCode,
      message,
      status,
    });

    return NextResponse.json(
      { success: false, error: "Failed to upload photo, please try again." },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Please sign in to remove a photo." }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const parsed = deleteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid image reference" }, { status: 400 });
    }

    const { public_id: publicId } = parsed.data;
    const ownedPrefix = `civicpulse-reports/${user.id}/`;
    if (!publicId.startsWith(ownedPrefix) || !/^[A-Za-z0-9_-]+$/.test(publicId.slice(ownedPrefix.length))) {
      return NextResponse.json({ success: false, error: "Invalid image reference" }, { status: 400 });
    }

    const attachedReport = await db.report.findFirst({
      where: {
        OR: [
          { imagePublicId: publicId },
          { photos: { some: { key: publicId } } },
        ],
      },
      select: { id: true },
    });
    if (attachedReport) {
      return NextResponse.json({ success: false, error: "This photo is already attached to a report" }, { status: 409 });
    }

    await deleteReportImage(publicId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UPLOAD DELETE ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove photo, please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}