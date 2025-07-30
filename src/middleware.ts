import { sha512_256 } from '@oslojs/crypto/sha2'
import { constantTimeEqual } from '@oslojs/crypto/subtle'
import { redirect } from '@solidjs/router'
import { createMiddleware } from '@solidjs/start/middleware'
import { and, eq, lte } from 'drizzle-orm'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { getCookie } from 'vinxi/http'
import * as schema from './db/schema'
import { session, user } from './db/schema'
import { removeSessionCookie, SESSION_TOKEN_COOKIE_NAME } from './features/auth/auth'

export default createMiddleware({
	onRequest: async (event) => {
		if (!event.locals.db) {
			if (import.meta.env.DEV) {
				const { getPlatformProxy } = await import('wrangler')
				const proxy = await getPlatformProxy()
				const db = drizzleD1(proxy.env.DB as D1Database, { schema: schema, logger: true })
				event.locals.db = db
			} else {
				const db = drizzleD1(event.nativeEvent.context.cloudflare.env.DB, { schema: schema })
				event.locals.db = db
			}
		}

    const pathname = new URL(event.request.url).pathname
    if (pathname !== "/admin" && pathname !== "/admin/" && !event.locals.user) { // Ignore the public login page
      const sessionToken = getCookie(SESSION_TOKEN_COOKIE_NAME)
      if (!sessionToken) {
        return redirect("/admin", 302)
      }
      const tokenParts = sessionToken.split(".");
      if (tokenParts.length !== 2) {
        removeSessionCookie()
        return redirect("/admin", 403);
      }
      const [sessionId, sessionSecret] = tokenParts;
      const [existingSession] = await event.locals.db.select().from(session).where(and(eq(session.id, sessionId), lte(session.expiresAt, new Date()))).limit(1)
      if (!existingSession) {
        removeSessionCookie()
        return redirect("/admin", 403)
      }
      const tokenSecretHash = sha512_256(new TextEncoder().encode(sessionSecret));
      const isValidSecret = constantTimeEqual(tokenSecretHash, existingSession.secretHash)
      if (!isValidSecret) {
        removeSessionCookie()
        return redirect("/admin", 403)
      }

      const [authenticatedUser] = await event.locals.db.select().from(user).where(eq(user.id, existingSession.userId))
      if (!authenticatedUser) {
        removeSessionCookie()
        return redirect("/admin", 403)
      }
      event.locals.user = authenticatedUser
    }
	}
})
