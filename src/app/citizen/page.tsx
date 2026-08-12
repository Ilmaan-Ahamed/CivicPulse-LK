import { redirect } from "next/navigation";

// Citizen home — redirect to the reports feed as the default landing.
export default function CitizenHomePage() {
  redirect("/citizen/reports");
}
