import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

if (!process.env.DB_URl) throw new Error('DB_URL is not set')
const client = createClient({ url: process.env.DB_URl })
export const db = drizzle(client)
