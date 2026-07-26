import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { syncUserToDatabase } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Missing CLERK_WEBHOOK_SECRET. Add it to your .env.local file."
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  // Handle the event
  const eventType = event.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    try {
      await syncUserToDatabase({
        id,
        email_addresses: email_addresses as { email_address: string }[],
        first_name,
        last_name,
        image_url,
      });

      console.log(`User ${eventType}: ${id}`);
    } catch (error) {
      console.error(`Error syncing user ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to sync user" },
        { status: 500 }
      );
    }
  }

  if (eventType === "user.deleted") {
    // We don't delete users, just deactivate them
    console.log(`User deleted event received: ${event.data.id}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
