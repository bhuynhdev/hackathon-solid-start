import { redirect } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { eq } from "drizzle-orm";
import { getCookie } from "vinxi/http";
import { session } from "~/db/schema";
import { removeSessionCookie, SESSION_TOKEN_COOKIE_NAME } from "~/features/auth/authUtil";
import { getDb } from "~/utils";

export async function GET(event: APIEvent) {
  const currentToken = getCookie(SESSION_TOKEN_COOKIE_NAME)
  if (currentToken) {
    removeSessionCookie()
    const db = getDb()
    await db.delete(session).where(eq(session.id, currentToken.split(".")[0]))
  }

  return redirect("/admin", 302)
}

