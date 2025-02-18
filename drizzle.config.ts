import 'dotenv/config'
import { defineConfig, Config } from 'drizzle-kit'
import crypto from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

// Based on https://github.com/cloudflare/workers-sdk/blob/64710904ad4055054bea09ebb23ededab140aa79/packages/miniflare/src/plugins/shared/index.ts#L194
function idFromName(uniqueKey: string, name: string) {
	const key = new Uint8Array(crypto.createHash('sha256').update(uniqueKey).digest())
	const nameHmac = new Uint8Array(crypto.createHmac('sha256', key).update(name).digest().subarray(0, 16))
	const hmac = new Uint8Array(crypto.createHmac('sha256', key).update(nameHmac).digest().subarray(0, 16))
	return Buffer.concat([nameHmac, hmac]).toString('hex')
}

// Knowing the path used by wrangler allows drizzle-kit migrate/push to create the database in advance
function getLocalDbPath(databaseId: string) {
	const uniqueKey = 'miniflare-D1DatabaseObject'
	const dbDir = path.join('.wrangler', 'state', 'v3', 'd1', uniqueKey)
	mkdirSync(dbDir, { recursive: true })
	const dbPath = path.join(dbDir, idFromName(uniqueKey, databaseId) + '.sqlite')
	console.log('Using', dbPath)
	return dbPath
}

let config

if (process.env.NODE_ENV === 'production') {
	config = {
		schema: './src/db/schema.ts',
		out: './drizzle/migrations/',
		dialect: 'sqlite',
		verbose: true,
		strict: true,
		driver: 'd1-http',
		dbCredentials: {
			token: process.env.CLOUDFLARE_API_TOKEN!,
			databaseId: process.env.CLOUDFLARE_D1_ID!,
			accountId: process.env.CLOUDFLARE_ACCOUNT_ID!
		}
	} satisfies Config
} else {
	config = {
		schema: './src/db/schema.ts',
		out: './drizzle/migrations',
		dialect: 'sqlite',
		verbose: true,
		strict: true,
		dbCredentials: {
			url: getLocalDbPath(process.env.DB_ID!)
		}
	} satisfies Config
}

export default defineConfig(config)
