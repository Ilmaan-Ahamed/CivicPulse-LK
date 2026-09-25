"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

type ReportDetails = {
  referenceNo: string;
  title: string;
  description: string;
  category: string;
  status: string;
  address: string | null;
  createdAt: string;
  photos: Array<{ id: string; url: string | null; caption: string | null }>;
};

export default function ReportDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/reports/${id}`, { credentials: "include" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Unable to load report");
        }
        if (active) setReport(result.data as ReportDetails);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load report");
      });

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/dashboard/citizen" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          My reports
        </Link>

        {error ? (
          <p role="alert" className="rounded border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>
        ) : !report ? (
          <p className="text-sm text-slate-400">Loading report...</p>
        ) : (
          <article className="space-y-6">
            <header className="space-y-3 border-b border-slate-800 pb-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-orange-400">{report.referenceNo}</span>
                <StatusBadge status={report.status} size="sm" />
                <span className="text-xs text-slate-400">{new Date(report.createdAt).toLocaleString()}</span>
              </div>
              <h1 className="text-2xl font-semibold text-white">{report.title}</h1>
              <p className="text-sm leading-6 text-slate-300">{report.description}</p>
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 shrink-0" />
                {report.address || "Location not provided"}
              </p>
            </header>

            {report.photos.length > 0 && (
              <section aria-label="Report photos" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {report.photos.map((photo) => photo.url && (
                  <figure key={photo.id} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                    <img src={photo.url} alt={photo.caption || report.title} className="aspect-[4/3] w-full object-cover" />
                    {photo.caption && <figcaption className="p-3 text-xs text-slate-300">{photo.caption}</figcaption>}
                  </figure>
                ))}
              </section>
            )}
          </article>
        )}
      </div>
    </main>
  );
}