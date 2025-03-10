import { action, query } from '@solidjs/router'
import { category } from '~/db/schema'
import { getDb } from '~/utils'
import { sql } from 'drizzle-orm'
import { parse } from 'csv-parse/sync'

export const getCategoriesQuery = query(async () => {
	'use server'
	const db = getDb()
	const categories = await db.select().from(category)
	return categories
}, 'get-categories')

export const bulkCreateCategories = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const csvFile = form.get('csvFile') as File
	const csvText = form.get('csvText') as string
	if (csvFile.size === 0 && !csvText) {
		throw new Error('Please provide either File or Text input')
	}
	if (csvFile.size > 0 && csvText) {
		throw new Error('Please provide only one of File or Text input')
	}
	const csvContent = csvText || (await csvFile.text())
	const categoriesInput: Array<{ name: string; type: 'sponsor' | 'inhouse' }> = parse(csvContent, {
		columns: ['name', 'type'],
		skip_empty_lines: true
	})
	// Upsert - data in the file will override any existing data in Database
	await db
		.insert(category)
		.values(categoriesInput)
		.onConflictDoUpdate({
			target: category.name,
			set: { type: sql.raw(`excluded.${category.type.name}`) }
		})
})
