import { db } from "@/lib/db";

/**
 * Check for duplicate reports based on location and category
 * @param latitude - Report latitude
 * @param longitude - Report longitude
 * @param category - Report category
 * @param radiusMeters - Search radius in meters (default: 100)
 */
export async function findDuplicateReports(
  latitude: number,
  longitude: number,
  category?: string,
  radiusMeters: number = 100
) {
  try {
    // Using PostGIS ST_DWithin for geospatial distance check
    // This requires PostGIS extension to be enabled
    const nearbyReports = await db.$queryRaw<Array<{ id: string; distance: number }>>`
      SELECT id, 
             ST_Distance(
               ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
               ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
             ) as distance
      FROM "Report"
      WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusMeters}
      )
      AND status != 'RESOLVED'
      AND status != 'CLOSED'
      AND status != 'REJECTED'
      ${category ? `AND category = ${category}` : ``}
      ORDER BY distance ASC
      LIMIT 5
    `;

    return nearbyReports;
  } catch (error) {
    console.error("[DUPLICATE DETECTION] Error finding duplicates:", error);
    // Fallback to simple distance calculation if PostGIS fails
    return findDuplicatesFallback(latitude, longitude, category, radiusMeters);
  }
}

/**
 * Fallback duplicate detection using Haversine formula
 */
async function findDuplicatesFallback(
  latitude: number,
  longitude: number,
  category?: string,
  radiusMeters: number = 100
) {
  try {
    const reports = await db.report.findMany({
      where: {
        status: {
          notIn: ["RESOLVED", "CLOSED", "REJECTED"],
        },
        ...(category && { category }),
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
      },
    });

    const nearby = reports
      .map((report) => ({
        id: report.id,
        distance: haversineDistance(
          latitude,
          longitude,
          report.latitude,
          report.longitude
        ),
      }))
      .filter((r) => r.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    return nearby;
  } catch (error) {
    console.error("[DUPLICATE DETECTION] Fallback error:", error);
    return [];
  }
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Mark a report as a duplicate of another report
 * @param reportId - The report ID to mark as duplicate
 * @param duplicateOfId - The original report ID
 */
export async function markAsDuplicate(reportId: string, duplicateOfId: string) {
  try {
    await db.report.update({
      where: { id: reportId },
      data: {
        duplicateOfId,
        isDuplicate: true,
      },
    });

    console.info("[DUPLICATE DETECTION] Marked as duplicate:", {
      reportId,
      duplicateOfId,
    });
  } catch (error) {
    console.error("[DUPLICATE DETECTION] Error marking as duplicate:", error);
  }
}
