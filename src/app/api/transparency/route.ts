import { NextResponse } from "next/server";
import { Category, ReportStatus } from "@prisma/client";
import { db } from "@/lib/db";

const fallbackCases = [
  {
    id: "case-1042",
    caseNumber: "CP-2026-1042",
    title: "Hazardous Deep Potholes near Bambalapitiya Junction",
    description: "Severe road surface damage causing vehicle accidents and traffic congestion on A2 main corridor near Galle Road Bamba junction.",
    category: "ROAD_DAMAGE",
    status: "VERIFIED",
    latitude: 6.8905,
    longitude: 79.855,
    address: "Galle Road, Bambalapitiya, Colombo 04",
    district: "Colombo DS Office",
    createdAt: "2026-08-10T00:00:00.000Z",
  },
  {
    id: "case-1043",
    caseNumber: "CP-2026-1043",
    title: "Blocked Main Canal Causing Pettah Market Flooding",
    description: "Polythene and debris blockages in the primary drainage channel adjacent to Central Bus Stand during heavy rains.",
    category: "DRAINAGE",
    status: "IN_PROGRESS",
    latitude: 6.9344,
    longitude: 79.8519,
    address: "Bodhiraja Mawatha, Pettah, Colombo 11",
    district: "Colombo DS Office",
    createdAt: "2026-08-11T00:00:00.000Z",
  },
  {
    id: "case-1044",
    caseNumber: "CP-2026-1044",
    title: "Non-Functional Streetlights on Kandy Peradeniya Corridor",
    description: "Five consecutive solar streetlights have gone dark along the main university access road, compromising safety at night.",
    category: "STREETLIGHT",
    status: "UNDER_VERIFICATION",
    latitude: 7.2625,
    longitude: 80.5972,
    address: "Gatembe, Peradeniya Road, Kandy",
    district: "Kandy Four Gravets DS",
    createdAt: "2026-08-12T00:00:00.000Z",
  },
  {
    id: "case-1045",
    caseNumber: "CP-2026-1045",
    title: "Burst Main Water Pipe at Galle Fort Pedestrian Walkway",
    description: "Clean water leak under high pressure washing away paved heritage stones near Rampart Street.",
    category: "WATER_SUPPLY",
    status: "RESOLVED",
    latitude: 6.0268,
    longitude: 80.217,
    address: "Rampart Street, Galle Fort, Galle",
    district: "Galle Four Gravets DS",
    createdAt: "2026-08-12T00:00:00.000Z",
  },
];

const categoryMap: Record<Category, string> = {
  ROAD_DAMAGE: "ROAD_DAMAGE",
  DRAINAGE: "DRAINAGE",
  STREETLIGHT: "STREETLIGHT",
  WATER_SUPPLY: "WATER_SUPPLY",
  WASTE: "WASTE",
  BRIDGE: "BRIDGE",
  PUBLIC_BUILDING: "PUBLIC_BUILDING",
  SIDEWALK: "SIDEWALK",
  TRAFFIC_SIGNAL: "TRAFFIC_SIGNAL",
  OTHER: "OTHER",
};

const statusMap: Record<ReportStatus, string> = {
  SUBMITTED: "SUBMITTED",
  UNDER_VERIFICATION: "UNDER_VERIFICATION",
  VERIFIED: "VERIFIED",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  FIELD_VERIFIED: "FIELD_VERIFIED",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
  CLOSED: "CLOSED",
};

function normalizeCategory(value: Category | string | null | undefined) {
  if (!value) return "OTHER";
  const key = typeof value === "string" ? value.toUpperCase() : value;
  const mapped = categoryMap[key as Category] ?? key;
  return mapped;
}

function normalizeStatus(value: ReportStatus | string | null | undefined) {
  if (!value) return "SUBMITTED";
  const key = typeof value === "string" ? value.toUpperCase() : value;
  const mapped = statusMap[key as ReportStatus] ?? key;
  return mapped;
}

export async function GET() {
  try {
    const reports = await db.report.findMany({
      select: {
        id: true,
        referenceNo: true,
        title: true,
        description: true,
        category: true,
        status: true,
        latitude: true,
        longitude: true,
        address: true,
        district: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const cases = reports.map((report) => ({
      id: report.id,
      caseNumber: report.referenceNo,
      title: report.title,
      description: report.description,
      category: normalizeCategory(report.category),
      status: normalizeStatus(report.status),
      latitude: report.latitude,
      longitude: report.longitude,
      address: report.address ?? "Location not provided",
      district: report.district ?? "Unknown DS Division",
      createdAt: report.createdAt.toISOString(),
    }));

    return NextResponse.json({ cases: cases.length ? cases : fallbackCases });
  } catch (error) {
    return NextResponse.json({ cases: fallbackCases }, { status: 200 });
  }
}
