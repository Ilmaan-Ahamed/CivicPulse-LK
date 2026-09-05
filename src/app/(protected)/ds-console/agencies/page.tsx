import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getAgencies() {
  try {
    const agencies = await db.agency.findMany({
      orderBy: { createdAt: "desc" },
    });
    return agencies;
  } catch (error) {
    console.error("Failed to fetch agencies:", error);
    return [];
  }
}

async function AgenciesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  try {
    await requireRole(["DS_OFFICER", "ADMIN"] as any);
  } catch (error) {
    redirect("/dashboard");
  }

  const agencies = await getAgencies();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Agencies Management</h1>
        <p className="mt-2 text-muted-foreground">
          Manage implementing agencies, NGOs, and field teams
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Agencies</CardTitle>
            <Button>Add Agency</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">District</th>
                  <th className="text-left p-3 font-medium">Contact</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agencies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                      No agencies found
                    </td>
                  </tr>
                ) : (
                  agencies.map((agency) => (
                    <tr key={agency.id} className="border-b">
                      <td className="p-3 font-medium">{agency.name}</td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-1 text-xs rounded-full border">
                          {agency.type}
                        </span>
                      </td>
                      <td className="p-3">{agency.district || "-"}</td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>{agency.contactPhone || "-"}</div>
                          <div className="text-muted-foreground">{agency.contactEmail || "-"}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            agency.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {agency.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          {!agency.isActive && (
                            <Button variant="outline" size="sm">
                              Activate
                            </Button>
                          )}
                          {agency.isActive && (
                            <Button variant="destructive" size="sm">
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AgenciesPage;
