"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityIndicator } from "@/components/ui/PriorityIndicator";

interface Report {
  id: string;
  title: string;
  description: string;
  summary?: string;
  category: string;
  status: string;
  district?: string;
  createdAt: string;
  aiConfidence?: number;
}

interface Agency {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export default function DSConsolePage() {
  const [verifiedReports, setVerifiedReports] = useState<Report[]>([]);
  const [assignedReports, setAssignedReports] = useState<Report[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningReport, setAssigningReport] = useState<Report | null>(null);
  const [selectedAgency, setSelectedAgency] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [verifiedRes, assignedRes, agenciesRes] = await Promise.all([
        fetch("/api/reports?status=VERIFIED"),
        fetch("/api/reports?status=ASSIGNED"),
        fetch("/api/agencies"),
      ]);

      const verifiedData = await verifiedRes.json();
      const assignedData = await assignedRes.json();
      const agenciesData = await agenciesRes.json();

      setVerifiedReports(verifiedData.data || []);
      setAssignedReports(assignedData.data || []);
      setAgencies(agenciesData.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assigningReport || !selectedAgency) return;

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: assigningReport.id,
          agencyId: selectedAgency,
          notes,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setVerifiedReports(verifiedReports.filter((r) => r.id !== assigningReport.id));
        setAssigningReport(null);
        setSelectedAgency("");
        setNotes("");
        fetchData(); // Refresh data
      } else {
        alert(data.error || "Failed to assign report");
      }
    } catch (error) {
      console.error("Failed to assign report:", error);
      alert("Failed to assign report");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">DS Officer Console</h1>
        <p className="mt-2 text-muted-foreground">
          Review verified reports and assign to implementing agencies
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Verified Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Verified Queue ({verifiedReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : verifiedReports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No verified reports pending assignment
              </p>
            ) : (
              <div className="space-y-4">
                {verifiedReports.map((report) => (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{report.title}</h3>
                          {report.aiConfidence && (
                            <PriorityIndicator score={report.aiConfidence * 100} />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {report.summary || report.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <StatusBadge status={report.status} />
                      <span className="text-muted-foreground">•</span>
                      <span>{report.category}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{report.district || "Unknown"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      <Button size="sm" onClick={() => setAssigningReport(report)}>
                        Assign
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Reports */}
        <Card>
          <CardHeader>
            <CardTitle>In Progress ({assignedReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : assignedReports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No reports currently assigned
              </p>
            ) : (
              <div className="space-y-4">
                {assignedReports.map((report) => (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{report.title}</h3>
                          {report.aiConfidence && (
                            <PriorityIndicator score={report.aiConfidence * 100} />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {report.summary || report.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <StatusBadge status={report.status} />
                      <span className="text-muted-foreground">•</span>
                      <span>{report.category}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{report.district || "Unknown"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignment Modal */}
      {assigningReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Assign Report to Agency</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAssigningReport(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
              <p className="font-medium">{assigningReport.title}</p>
              <p className="text-sm text-muted-foreground">{assigningReport.category}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Select Agency</label>
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Choose an agency...</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name} ({agency.type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                rows={3}
                placeholder="Add any instructions or notes..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssigningReport(null)}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={!selectedAgency}>
                Assign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
