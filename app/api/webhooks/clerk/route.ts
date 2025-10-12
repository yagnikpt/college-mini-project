import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id: clerkId, username, email_addresses, image_url } = evt.data;

      const primaryEmail = email_addresses?.[0]?.email_address;

      console.log(`Clerk Webhook Received for: ${primaryEmail}`);

      if (!primaryEmail) {
        console.error("No email found for user:", clerkId);
        return new Response("No email found", { status: 400 });
      }

      try {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkId))
          .limit(1);

        if (existingUser.length > 0) {
          return new Response("User already exists", { status: 200 });
        }

        await db.insert(users).values({
          clerkId,
          username: username || primaryEmail.split("@")[0],
          email: primaryEmail,
          avatarUrl: image_url || null,
        });

        return new Response("User created", { status: 201 });
      } catch (error) {
        console.error("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
