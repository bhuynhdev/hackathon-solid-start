import { sha512_256 } from '@oslojs/crypto/sha2'
import { constantTimeEqual } from '@oslojs/crypto/subtle'
import { createMiddleware } from '@solidjs/start/middleware'
import { and, eq, gt } from 'drizzle-orm'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { getCookie } from 'vinxi/http'
import * as schema from './db/schema'
import { session, user } from './db/schema'
import { removeSessionCookie, SESSION_TOKEN_COOKIE_NAME } from './features/auth/authUtil'

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

    // Authentication middleware:
    // Works by assigning user to event.locals.user if they can be authenticated - i.e. session token is valid and exists
    // If not, pass through: No authorization should be done here
    // -> The server functions will have extra check and thus deny access if event.locals.user not set
    // -> Keeping authorization close to source instead of inside middleware
    if (!event.locals.user) { // Ignore the public login page
      const sessionToken = getCookie(SESSION_TOKEN_COOKIE_NAME)
      if (!sessionToken) {
        return
      }
      const tokenParts = sessionToken.split(".");
      if (tokenParts.length !== 2) {
        removeSessionCookie()
        return
      }
      const [sessionId, sessionSecret] = tokenParts;
      const [existingSession] = await event.locals.db.select().from(session).where(and(eq(session.id, sessionId), gt(session.expiresAt, new Date()))).limit(1)
      if (!existingSession) {
        removeSessionCookie()
        return
      }
      const tokenSecretHash = sha512_256(new TextEncoder().encode(sessionSecret));
      const isValidSecret = constantTimeEqual(tokenSecretHash, new Uint8Array(existingSession.secretHash))
      if (!isValidSecret) {
        removeSessionCookie()
        return
      }

      const [authenticatedUser] = await event.locals.db.select().from(user).where(eq(user.id, existingSession.userId))
      if (!authenticatedUser) {
        removeSessionCookie()
        return
      }
      event.locals.user = authenticatedUser
    }
	}
})
