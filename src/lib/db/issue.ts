import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { Category, ReportStatus } from "@prisma/client";

export async function deleteIssue(issueId: string) {
  await requireRole(["department_admin", "super_admin"]);
  return await db.report.delete({ where: { id: issueId } });
}

export async function createIssue(data: { title: string; description: string }) {
  const { userId } = await requireRole(["citizen", "field_officer", "department_admin", "super_admin"]);
  return await db.report.create({
    data: {
      title: data.title,
      description: data.description,
      citizenId: userId,
      category: Category.OTHER,
      latitude: 6.9271,
      longitude: 79.8612,
    },
  });
}

export async function updateIssueStatus(issueId: string, status: ReportStatus) {
  await requireRole(["field_officer", "department_admin", "super_admin"]);
  return await db.report.update({
    where: { id: issueId },
    data: { status },
  });
}