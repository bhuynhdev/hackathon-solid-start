import { createMiddleware } from '@solidjs/start/middleware'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import * as schema from './db/schema'

export default createMiddleware({
	onRequest: async (event) => {
		if (!event.locals.db) {
			if (import.meta.env.DEV) {
				const { getPlatformProxy } = await import('wrangler')
				const proxy = await getPlatformProxy()
				const db = drizzleD1(proxy.env.DB as D1Database, { schema: schema })
				event.locals.db = db
			} else {
				const db = drizzleD1(event.nativeEvent.context.cloudflare.env.DB, { schema: schema })
				event.locals.db = db
			}
		}
	}
})
