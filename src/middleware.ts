import { createMiddleware } from '@solidjs/start/middleware'

import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql'
import * as schema from '~/db/schema'

export default createMiddleware({
	onRequest: async (event) => {
		if (!event.locals.db) {
			if (import.meta.env.DEV) {
				const db = drizzleLibsql(process.env.DB_URL!, { schema: schema })
				event.locals.db = db
			} else {
				const db = drizzleD1(event.nativeEvent.context.cloudflare.env.DB)
				event.locals.db = db
			}
		}
	}
})
