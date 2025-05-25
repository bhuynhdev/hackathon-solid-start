import { action, query } from '@solidjs/router'
import '@total-typescript/ts-reset/filter-boolean'
import { parse } from 'csv-parse/sync'
import { eq, inArray, notInArray } from 'drizzle-orm'
import { category, categoryTypes, judge, judgeGroup, project, projectSubmission } from '~/db/schema'
import { CategoryType, Judge } from '~/db/types'
import { getDb } from '~/utils'

const devPostCsvColsMapping = {
	'Project Title': 'title',
	'Submission Url': 'url',
	'Project Status': 'status',
	'Project Created At': 'createdAt',
	'"Try it out" Links': 'links',
	'Video Demo Link': 'videoLink',
	'Opt-In Prizes': 'categoriesCsv',
	'Submitter First Name': 'submitterFistName',
	'Submitter Last Name': 'submitterLastName',
	'Submitter Email': 'submitterEmail',
	'What Is The Table Number You Have Been Assigned By Organizers (Eg. 50)': 'location',
	'What School Do You Attend? If You Are No Longer In School, What University Did You Attend Most Recently?': 'school',
	'List All Of The Domain Names Your Team Has Registered With .Tech During This Hackathon.': 'domains'
} as const

type RawDevPostProject = Record<keyof typeof devPostCsvColsMapping, string> & {
	[key: string]: string
}

type TransformedDevPostProject = Record<(typeof devPostCsvColsMapping)[keyof typeof devPostCsvColsMapping], string> & {
	[key: string]: string
}

/** CATEGORIES */
export const getCategoriesQuery = query(async () => {
	'use server'
	const db = getDb()
	const categories = await db.select().from(category).orderBy(category.name)
	categories.sort((a, b) => categoryTypes.indexOf(a.type) - categoryTypes.indexOf(b.type)) // Sort by order defined in categoryTypes
	return categories
}, 'get-categories')

export const createCategory = action(async (form: FormData) => {
	'use server'
	const categoryName = form.get('categoryName') as string
	const categoryType = form.get('categoryType') as CategoryType
	const db = getDb()

	await db.insert(category).values({ name: categoryName, type: categoryType })
}, 'create-category')

export const createCategoriesBulk = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const devPostProjectsFile = form.get('devPostProjectsFile') as File
	const csvText = form.get('csvText') as string
	if (devPostProjectsFile.size === 0 && !csvText) {
		throw new Error('Please provide either File or Text input')
	}
	if (devPostProjectsFile.size > 0 && csvText) {
		throw new Error('Please provide only one of File or Text input')
	}
	if (csvText) {
		const categoriesInput: Array<{ name: string; type: 'sponsor' | 'inhouse' }> = parse(csvText, {
			columns: ['name', 'type'],
			skip_empty_lines: true
		})
		await db.insert(category).values(categoriesInput).onConflictDoNothing()
	} else {
		const csvContent = await devPostProjectsFile.text()
		const projectsInput: Array<RawDevPostProject> = parse(csvContent, {
			relaxColumnCount: true,
			skipEmptyLines: true,
			columns: true
		})
		const extractedCategories = Array.from(new Set(projectsInput.flatMap((p) => p['Opt-In Prizes'].split(',').map((c) => c.trim())))).filter(Boolean)
		await db
			.insert(category)
			.values(extractedCategories.map((c) => ({ name: c, type: c.includes('Sponsor') ? ('sponsor' as const) : ('inhouse' as const) }))) // Since we can't know category type from DevPost, default to 'inhouse'
			.onConflictDoNothing()
	}
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
	const judges = await db.query.judge.findMany({ with: { category: true }, orderBy: judge.name })
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

export const listJudgeGroups = query(async () => {
	'use server'
	const db = getDb()
	return await db.query.judgeGroup.findMany({ orderBy: judgeGroup.categoryId, with: { judges: true, category: true } })
}, 'query-judge-groups')

export const clearJudgeGroups = action(async () => {
	'use server'
	const db = getDb()
	await db.delete(judgeGroup)
}, 'clear-judge-groups')

export const resetAndOrganizeJudgeGroups = action(async () => {
	'use server'
	const db = getDb()
	const allJudges = await db.query.judge.findMany({ with: { category: true } })
	const judgesByCategories = allJudges.reduce(
		(acc, judge) => {
			const categoryId = judge.categoryId
			if (!acc.has(categoryId)) {
				acc.set(categoryId, [])
			}
			acc.get(categoryId)!.push(judge)
			return acc
		},
		new Map() as Map<Judge['categoryId'], Array<(typeof allJudges)[number]>>
	)

	// Judge group organization logic: If they are in a sponsor category, put these judges into one group
	// Else, split off into groups of 2
	const judgeGroups = []
	for (const [categoryId, judgesOfThisCategory] of judgesByCategories) {
		const category = judgesOfThisCategory[0].category
		if (category.type === 'sponsor') {
			judgeGroups.push({ categoryId, members: judgesOfThisCategory, name: String.fromCharCode(categoryId + 64) })
		} else {
			// Chunk into groups of two
			for (let i = 0; i < judgesOfThisCategory.length; i += 2) {
				judgeGroups.push({ categoryId, members: judgesOfThisCategory.slice(i, i + 2), name: '' })
			}
		}
	}

	const judgeGroupCountByCategory: Record<number, number> = {}

	// Assign a two-character name to each group following this convention:
	// - First char is categoryId converted to ASCII (1 -> A, 2 -> B, etc.)
	// - Second char is the ordering of this group within the category (1st group of cateogyId 1 -> A1, etc.)
	for (const group of judgeGroups) {
		const count = (judgeGroupCountByCategory[group.categoryId] || 0) + 1
		judgeGroupCountByCategory[group.categoryId] = count

		const firstChar = String.fromCharCode(64 + group.categoryId)
		const secondChar = count.toString()

		group.name = `${firstChar}${secondChar}`
	}

	await db.delete(judgeGroup)
	for (const g of judgeGroups) {
		const [{ id: createdGroupId }] = await db.insert(judgeGroup).values(g).returning({ id: judgeGroup.id })
		const judgeIds = g.members.map((j) => j.id)
		await db.update(judge).set({ judgeGroupId: createdGroupId }).where(inArray(judge.id, judgeIds))
	}
}, 'organize-judge-groups')

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

export const moveJudge = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const judgeId = Number(form.get('judgeId'))
	const newGroupId = Number(form.get('newGroupId'))
	const [judgeToMove] = await db.select().from(judge).where(eq(judge.id, judgeId))
	const [newGroup] = await db.select().from(judgeGroup).where(eq(judgeGroup.id, newGroupId))
	if (judgeToMove.categoryId !== newGroup.categoryId) {
		throw Error(`Judge ${judgeId} of category ${judgeToMove.categoryId} cannot move to group of category ${newGroup.categoryId}`)
	}

	await db.update(judge).set({ judgeGroupId: newGroupId }).where(eq(judge.id, judgeId))
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
	const categoryIds = form.getAll('categoryIds').map(Number)
	const location = (form.get('location') as string) || ''
	const location2 = (form.get('location2') as string) || ''
	const [newProject] = await db.insert(project).values({ name: projectName, location, location2 }).returning()
	await db.insert(projectSubmission).values(categoryIds.map((categoryId) => ({ projectId: newProject.id, categoryId })))
}, 'create-project-and-submissions')

export const importProjectsFromDevpost = action(async (form: FormData) => {
	'use server'
	// TODO: Don't allow create/import projects with judging has been assigned
	const db = getDb()
	const categories = await db.select().from(category)
	const categoryNameToIdMap = categories.reduce((acc, category) => ({ ...acc, [category.name]: category.id }), {} as Record<string, number>)

	const csvFile = form.get('csvFile') as File
	if (csvFile.size === 0) {
		throw new Error('Error: File is empty!')
	}
	const csvContent = await csvFile.text()
	const projectsInput: Array<TransformedDevPostProject> = parse(csvContent, {
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

	// Delete all current projects and submissions, and insert new ones obtained from the CSV
	await db.delete(projectSubmission)
	await db.delete(project)

	for (const p of projectsInput) {
		const [{ insertedProjectId }] = await db
			.insert(project)
			.values({ name: p.title, location: p.location, location2: '' })
			.returning({ insertedProjectId: project.id })

		const submittedCategoryIds = p.categoriesCsv
			.split(',')
			.concat('General')
			.map((individualCategoryName) => {
				const trimmedCategoryName = individualCategoryName.trim()
				if (!trimmedCategoryName) return
				if (!(trimmedCategoryName in categoryNameToIdMap)) {
					console.log(`Project: '${p.title}': Category '${trimmedCategoryName}' doesn't exist. Skipping submission to this category.`)
					return
				}
				return categoryNameToIdMap[trimmedCategoryName]
			})
			.filter(Boolean)

		await db.insert(projectSubmission).values(submittedCategoryIds.map((c) => ({ categoryId: c, projectId: insertedProjectId })))
	}
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
	// Add new submissions, ignoring already existed
	await db
		.insert(projectSubmission)
		.values(categoryIds.map((categoryId) => ({ projectId: projectId, categoryId })))
		.onConflictDoNothing({ target: [projectSubmission.categoryId, projectSubmission.projectId] })
}, 'create-project-and-submissions')

export const deleteProject = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const projectId = form.get('projectId') as string
	await db.delete(project).where(eq(project.id, Number(projectId)))
}, 'delete-project')
