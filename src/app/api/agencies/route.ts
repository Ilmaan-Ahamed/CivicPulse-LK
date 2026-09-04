import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth-guard";
import { Role } from "@/lib/roles";

async function listAgencies(req: Request) {
  const { userId } = await requireRole(["DS_OFFICER", "ADMIN", "NGO_PARTNER"] as any);
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const district = url.searchParams.get("district");

  const where: any = {};
  if (type) where.type = type;
  if (district) where.district = district;

  const agencies = await db.agency.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: agencies,
  });
}

async function createAgency(req: Request) {
  const { userId } = await requireRole(["DS_OFFICER", "ADMIN"] as any);
  const body = await req.json();
  const { name, type, contactName, contactPhone, contactEmail, district } = body;

  if (!name || !type) {
    return NextResponse.json(
      { success: false, error: "name and type are required" },
      { status: 400 }
    );
  }

  // Create agency and write audit log in a transaction
  const result = await db.$transaction(async (tx) => {
    const agency = await tx.agency.create({
      data: {
        name,
        type,
        contactPhone,
        contactEmail,
        district,
        isActive: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "AGENCY_CREATED",
        entity: "Agency",
        entityId: agency.id,
        metadata: {
          name,
          type,
          contactPhone,
          contactEmail,
          district,
        },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      },
    });

    return { agency };
  });

  return NextResponse.json({
    success: true,
    data: result.agency,
  });
}

async function updateAgency(req: Request) {
  const { userId } = await requireRole(["DS_OFFICER", "ADMIN"] as any);
  const body = await req.json();
  const { id, name, type, contactName, contactPhone, contactEmail, district, active } = body;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "id is required" },
      { status: 400 }
    );
  }

  // Get current agency
  const agency = await db.agency.findUnique({
    where: { id },
  });

  if (!agency) {
    return NextResponse.json(
      { success: false, error: "Agency not found" },
      { status: 404 }
    );
  }

  // Check if agency has existing assignments before deactivating
  if (active === false) {
    const assignmentCount = await db.assignment.count({
      where: { assignedToId: id },
    });

    if (assignmentCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot deactivate agency with existing assignments",
        },
        { status: 400 }
      );
    }
  }

  // Update agency and write audit log in a transaction
  const result = await db.$transaction(async (tx) => {
    const updatedAgency = await tx.agency.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(district !== undefined && { district }),
        ...(active !== undefined && { isActive: active }),
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "AGENCY_UPDATED",
        entity: "Agency",
        entityId: id,
        metadata: {
          previous: {
            name: agency.name,
            type: agency.type,
            contactPhone: agency.contactPhone,
            contactEmail: agency.contactEmail,
            district: agency.district,
            isActive: agency.isActive,
          },
          new: {
            name: updatedAgency.name,
            type: updatedAgency.type,
            contactPhone: updatedAgency.contactPhone,
            contactEmail: updatedAgency.contactEmail,
            district: updatedAgency.district,
            isActive: updatedAgency.isActive,
          },
        },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      },
    });

    return { updatedAgency };
  });

  return NextResponse.json({
    success: true,
    data: result.updatedAgency,
  });
}

async function deleteAgency(req: Request) {
  const { userId } = await requireRole(["DS_OFFICER", "ADMIN"] as any);
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "id is required" },
      { status: 400 }
    );
  }

  // Get current agency
  const agency = await db.agency.findUnique({
    where: { id },
  });

  if (!agency) {
    return NextResponse.json(
      { success: false, error: "Agency not found" },
      { status: 404 }
    );
  }

  // Check if agency has existing assignments
  const assignmentCount = await db.assignment.count({
    where: { assignedToId: id },
  });

  if (assignmentCount > 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Cannot delete agency with existing assignments",
      },
      { status: 400 }
    );
  }

  // Soft-delete (set active=false) and write audit log in a transaction
  const result = await db.$transaction(async (tx) => {
    const updatedAgency = await tx.agency.update({
      where: { id },
      data: { isActive: false },
    });

    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "AGENCY_DEACTIVATED",
        entity: "Agency",
        entityId: id,
        metadata: {
          name: agency.name,
          type: agency.type,
        },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      },
    });

    return { updatedAgency };
  });

  return NextResponse.json({
    success: true,
    data: result.updatedAgency,
  });
}

export const GET = withErrorHandler(listAgencies);
export const POST = withErrorHandler(createAgency);
export const PATCH = withErrorHandler(updateAgency);
export const DELETE = withErrorHandler(deleteAgency);
