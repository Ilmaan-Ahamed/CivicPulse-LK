import { requireRole } from "@/lib/auth-guard";
import db from "@/lib/db"; // your better-sqlite3 instance

export async function deleteIssue(issueId: string) {
  // check happens INSIDE the DB function, not just in the caller
  await requireRole(["department_admin", "super_admin"]);

  db.prepare("DELETE FROM issues WHERE id = ?").run(issueId);
}

export async function createIssue(data: { title: string; description: string }) {
  const { userId } = await requireRole(["citizen", "field_officer", "department_admin", "super_admin"]);

  db.prepare(
    "INSERT INTO issues (title, description, created_by) VALUES (?, ?, ?)"
  ).run(data.title, data.description, userId);
}

export async function updateIssueStatus(issueId: string, status: string) {
  await requireRole(["field_officer", "department_admin", "super_admin"]);

  db.prepare("UPDATE issues SET status = ? WHERE id = ?").run(status, issueId);
}