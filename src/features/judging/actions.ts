import { action, query } from '@solidjs/router'
import { ColumnOption, parse } from 'csv-parse/sync'
import { eq, notInArray, sql } from 'drizzle-orm'
import { category, judge, project, projectSubmission } from '~/db/schema'
import { getDb } from '~/utils'

/** CATEGORIES */
export const getCategoriesQuery = query(async () => {
	'use server'
	const db = getDb()
	const categories = await db.select().from(category).orderBy(category.name)
	return categories
}, 'get-categories')

export const createCategory = action(async (form: FormData) => {
	'use server'
	const categoryName = form.get('categoryName') as string
	const categoryType = form.get('categoryType') as 'sponsor' | 'inhouse'
	const db = getDb()

	await db.insert(category).values({ name: categoryName, type: categoryType })
}, 'create-category')

export const createCategoriesBulk = action(async (form: FormData) => {
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
}, 'create-categories-bulk')

export const updateCategory = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const categoryId = form.get('categoryId') as string
	const { categoryName, categoryType } = Object.fromEntries(form)
	await db
		.update(category)
		.set({ name: String(categoryName), type: categoryType as 'sponsor' | 'inhouse' | 'general' })
		.where(eq(category.id, Number(categoryId)))
}, 'update-category')

export const deleteCategory = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const categoryId = form.get('categoryId') as string
	await db.delete(category).where(eq(category.id, Number(categoryId)))
}, 'delete-category')

/** JUDGES */
export const getJudgesQuery = query(async () => {
	'use server'
	const db = getDb()
	const judges = await db.query.judge.findMany({ with: { category: true } })
	return judges
}, 'get-judges')

export const createJudge = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const judgeName = form.get('name') as string
	const email = form.get('email') as string
	const categoryId = form.get('categoryId') as string
	await db.insert(judge).values({ name: judgeName, email, categoryId: Number(categoryId) })
}, 'create-judge')

export const createJudgesBulk = action(async (form: FormData) => {
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
	const judgesInput: Array<{ name: string; email: string; categoryId: number }> = parse(csvContent, {
		columns: ['name', 'email', 'categoryId'],
		skip_empty_lines: true,
		cast: (value, context) => (context.column === 'categoryId' ? Number(value) : String(value))
	})

	await db.insert(judge).values(judgesInput)
}, 'create-judges-bulk')

export const updateJudge = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const judgeId = form.get('judgeId') as string
	const { name, email, categoryId } = Object.fromEntries(form)

	await db
		.update(judge)
		.set({
			name: String(name),
			email: String(email),
			categoryId: Number(categoryId)
		})
		.where(eq(judge.id, Number(judgeId)))
}, 'update-judge')

export const deleteJudge = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const judgeId = form.get('judgeId') as string
	await db.delete(judge).where(eq(judge.id, Number(judgeId)))
}, 'delete-judge')

/** PROJECTS **/
export const getProjectsQuery = query(async () => {
	'use server'
	const db = getDb()
	const projectAndSubmissions = await db.query.project.findMany({ with: { submissions: true } })
	return projectAndSubmissions
}, 'get-projects')

export const createProjectAndSubmissions = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const projectName = form.get('name') as string
	const categoryIds = form.getAll('categoryIds') as string[]
	const location = (form.get('location') as string) || ''
	const location2 = (form.get('location2') as string) || ''
	const [newProject] = await db.insert(project).values({ name: projectName, location, location2 }).returning()
	await Promise.all(
		categoryIds.map((categoryId) => db.insert(projectSubmission).values({ projectId: newProject.id, categoryId: Number(categoryId) }))
	)
}, 'create-project-and-submissions')

export const importProjectsFromDevpost = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const devPostCsvColsMapping = {
		'Project Title': 'title',
		'Submission Url': 'url',
		'Project Status': 'status',
		'Project Created At': 'createdAt',
		'"Try it out" Links': 'links',
		'Video Demo Link': 'videoLink',
		'Opt-In Prizes': 'prizes',
		'Submitter First Name': 'submitterFistName',
		'Submitter Last Name': 'submitterLastName',
		'Submitter Email': 'submitterEmail',
		'What Is The Table Number You Have Been Assigned By Organizers (Eg. 50)': 'location',
		'What School Do You Attend? If You Are No Longer In School, What University Did You Attend Most Recently?': 'school',
		'List All Of The Domain Names Your Team Has Registered With .Tech During This Hackathon.': 'domains'
	} as const

	type DevPostProject = Record<keyof typeof devPostCsvColsMapping, string> & {
		[key: string]: string
	}

	const categories = await db.select().from(category)
	const categoryNameToIdMap = categories.reduce((acc, category) => ({ ...acc, [category.name]: category.id }), {} as Record<string, number>)

	const csvFile = form.get('csvFile') as File
	if (csvFile.size === 0) {
		throw new Error('Error: File is empty!')
	}
	const csvContent = await csvFile.text()
	const projectsInput: Array<DevPostProject> = parse(csvContent, {
		relaxColumnCount: true,
		skipEmptyLines: true,
		columns: (headers: string[]) =>
			headers.flatMap((header) => {
				if (header in devPostCsvColsMapping) {
					// Map DevPost long-text header to shorter headers
					return devPostCsvColsMapping[header as keyof typeof devPostCsvColsMapping]
				}
				if (header === '...') {
					// DevPost doesn't have headers for team members after 1 (it's just '...'), so we supply the headers manually here
					return [2, 3, 4].flatMap((i) => [`Team Member ${i} First Name`, `Team Member ${i} Last Name`, `Team Member ${i} Email`])
				}
				return header
			})
	})
	console.log(projectsInput[2])
}, 'import-devpost-projects')

export const updateProject = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const projectId = Number(form.get('projectId'))
	const projectName = form.get('name') as string
	const categoryIds = form.getAll('categoryIds').map(Number)
	const location = (form.get('location') as string) || ''
	const location2 = (form.get('location2') as string) || ''
	await db.update(project).set({ name: projectName, location, location2 }).where(eq(project.id, projectId))

	// Remove submissions not in the given category Ids
	await db.delete(projectSubmission).where(notInArray(projectSubmission.categoryId, categoryIds))
	// Add new categories, ignoring already existed
	await Promise.all(
		categoryIds.map((categoryId) =>
			db
				.insert(projectSubmission)
				.values({ projectId: projectId, categoryId: categoryId })
				.onConflictDoNothing({ target: [projectSubmission.categoryId, projectSubmission.projectId] })
		)
	)
}, 'create-project-and-submissions')

export const deleteProject = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const projectId = form.get('projectId') as string
	await db.delete(project).where(eq(project.id, Number(projectId)))
}, 'delete-project')
