import { query } from '@solidjs/router'
import { category } from '~/db/schema'
import { getDb } from '~/utils'

export const getCategoriesQuery = query(async () => {
	const db = getDb()
	const categories = await db.select().from(category)
	return categories
}, 'get-categories')
