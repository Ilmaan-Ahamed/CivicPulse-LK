"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VolunteerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/citizen?tab=inspections");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-600 dark:text-slate-400">Redirecting to Citizen Dashboard...</p>
    </div>
  );
}
