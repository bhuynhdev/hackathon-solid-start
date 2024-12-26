import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { config } from 'dotenv'

if (!process.env.DB_URL) throw new Error('DB_URL is not set')
const client = createClient({ url: process.env.DB_URL })
export const db = drizzle(client)
