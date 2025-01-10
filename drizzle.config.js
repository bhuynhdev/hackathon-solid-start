import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	schema: './src/db/schema.ts',

	dbCredentials: {
		url: process.env.DB_URL
	},

	out: './drizzle/migrations/',

	verbose: true,
	strict: true,
	dialect: 'sqlite'
})
