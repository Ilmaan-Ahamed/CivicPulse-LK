<<<<<<< HEAD
﻿import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function ProtectedLayout({
=======
// This layout exists only to host the legacy redirect shims below.
// All active routes have moved to /citizen, /ds-officer, /ngo, /agency.
export default function LegacyProtectedLayout({
>>>>>>> 7548f6d (Update CivicPulse development features)
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


