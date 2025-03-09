import { action, query } from '@solidjs/router'
import { category } from '~/db/schema'
import { getDb } from '~/utils'

export const getCategoriesQuery = query(async () => {
	'use server'
	const db = getDb()
	const categories = await db.select().from(category)
	return categories
}, 'get-categories')

export const bulkCreateCategories = action(async (form: FormData) => {
	'use server'
	const csvFile = form.get('csvFile') as File
	const csvText = form.get('csvText') as string
})
