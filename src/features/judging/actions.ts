import { action, query, reload } from '@solidjs/router'
import '@total-typescript/ts-reset/filter-boolean'
import { parse } from 'csv-parse/sync'
import { eq, getTableColumns, inArray, notInArray, sql } from 'drizzle-orm'
import { assignment, category, categoryTypes, judge, judgeGroup, project, submission } from '~/db/schema'
import { Category, CategoryType, Judge, JudgeGroup, NewAssignment } from '~/db/types'
import { getDb, RotatingQueue } from '~/utils'
import { strictEqual } from 'assert'

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
export const listCategories = query(async () => {
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
export const listJudges = query(async () => {
	'use server'
	const db = getDb()
	const judges = await db.query.judge.findMany({ with: { category: true }, orderBy: judge.categoryId })
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

/** JUDGE GROUPS **/
export const listJudgeGroups = query(async () => {
	'use server'
	const db = getDb()
	return await db.query.judgeGroup.findMany({ orderBy: [judgeGroup.categoryId, judgeGroup.name], with: { judges: true, category: true } })
}, 'query-judge-groups')

export const createJudgeGroup = action(async (form: FormData) => {
	'use server'
	const categoryId = Number(form.get('categoryId'))
	const name = form.get('name') as string
	const db = getDb()
	const newGroup = await db.insert(judgeGroup).values({ categoryId, name }).returning()
	return newGroup
}, 'query-judge-groups')

export const clearJudgeGroups = action(async () => {
	'use server'
	const db = getDb()
	await db.delete(judgeGroup)
}, 'clear-judge-groups')

export const deleteEmptyJudgeGroup = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const groupId = Number(form.get('groupId'))
	const memberCount = await db.$count(judge, eq(judge.judgeGroupId, groupId))
	if (memberCount > 0) {
		throw Error('Group must be empty to be manually deleted.')
	}
	await db.delete(judgeGroup).where(eq(judgeGroup.id, groupId))
	return reload({ revalidate: [listJudgeGroups.key, listJudges.key] })
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
export const listProjects = query(async () => {
	'use server'
	const db = getDb()
	const projectAndSubmissions = await db.query.project.findMany({ with: { submissions: true } })
	return projectAndSubmissions
}, 'get-projects')

export const createProjectAndSubmissions = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const projectName = form.get('name') as string
	const url = form.get('url') as string
	const categoryIds = form.getAll('categoryIds').map(Number)
	const location = (form.get('location') as string) || ''
	const location2 = (form.get('location2') as string) || ''
	const [newProject] = await db.insert(project).values({ name: projectName, url, location, location2 }).returning()
	await db.insert(submission).values(categoryIds.map((categoryId) => ({ projectId: newProject.id, categoryId })))
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
	await db.delete(submission)
	await db.delete(project)

	for (const p of projectsInput) {
		if (p.status.toLowerCase() === 'draft') continue // Skip 'Draft' projects

		const [{ insertedProjectId }] = await db
			.insert(project)
			.values({ name: p.title, location: p.location, location2: '', url: p.url })
			.returning({ insertedProjectId: project.id })

		const submittedCategories = p.categoriesCsv.split(',')
		if (!submittedCategories.includes('General')) {
			submittedCategories.push('General')
		}

		const submittedCategoryIds = submittedCategories
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

		await db.insert(submission).values(submittedCategoryIds.map((c) => ({ categoryId: c, projectId: insertedProjectId })))
	}
}, 'import-devpost-projects')

export const updateProjectInfo = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const projectId = Number(form.get('projectId'))
	const projectName = form.get('name') as string
	const categoryIds = form.getAll('categoryIds').map(Number)
	const location = (form.get('location') as string) || ''
	const location2 = (form.get('location2') as string) || ''
	await db.update(project).set({ name: projectName, location, location2 }).where(eq(project.id, projectId))

	// Remove submissions not in the given category Ids
	await db.delete(submission).where(notInArray(submission.categoryId, categoryIds))
	// Add new submissions, ignoring already existed
	await db
		.insert(submission)
		.values(categoryIds.map((categoryId) => ({ projectId: projectId, categoryId })))
		.onConflictDoNothing({ target: [submission.categoryId, submission.projectId] })
}, 'update-project-info')

/**
 * Disqualify project if not yet, or re-qualify if already disqualified
 **/
export const toggleProjectDisqualification = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const projectId = Number(form.get('projectId'))
	const disqualifyReason = form.get('disqualifyReason') as string
	const shouldUpdateDisqualifyReasonOnly = form.get('update-disqualify-reason-only') === 'true'

	const [projectToUpdate] = await db.select().from(project).where(eq(project.id, projectId)).limit(1)

	if (shouldUpdateDisqualifyReasonOnly || projectToUpdate.status !== 'disqualified') {
		await db.update(project).set({ status: 'disqualified', disqualifyReason: disqualifyReason })
	} else {
		await db.update(project).set({ status: 'created', disqualifyReason: null })
	}
}, 'update-project-info')

export const deleteProject = action(async (form: FormData) => {
	'use server'
	const db = getDb()
	const projectId = form.get('projectId') as string
	await db.delete(project).where(eq(project.id, Number(projectId)))
}, 'delete-project')

/** PROJECT ASSIGNMENTS **/
export const listAssignments = query(async () => {
  'use server'
  const db = getDb()
  return await db.query.assignment.findMany(
    {
      with: {
        submission: { with: { project: true } },
        judgeGroup: { with: { category: true } }
      },
    })
}, 'list-assignments')


export const assignSubmissionsToJudgeGroups = action(async () => {
  'use server'
  const db = getDb()

  // Preconditions: Each project should be seen by at least 6 judges, meaning we must have >= 6 General judges, since some projects only submit to General
  const MINIMUM_JUDGES_PER_PROJECT = 6
  const countGeneralJudges = await db.$count(judge, eq(judge.categoryId, 1))
  if (countGeneralJudges < MINIMUM_JUDGES_PER_PROJECT) {
    throw Error(`There must be at least ${MINIMUM_JUDGES_PER_PROJECT} General judges`);
  }

  await db.delete(assignment)

  const allSubmissions = await db.query.submission.findMany({ with: { category: true }})
  const allGroups = await db.select({
    id: judgeGroup.id,
    categoryId: judgeGroup.categoryId,
    judgeCount: sql<number>`count(${judge.id})`.mapWith(Number)
  })
  .from(judgeGroup)
  .leftJoin(judge, eq(judgeGroup.id, judge.judgeGroupId))
  .groupBy(judgeGroup.id)

  const groupsByCategory = allGroups.reduce((acc, curr) => {
    if (!acc.has(curr.categoryId)) {
      acc.set(curr.categoryId, new RotatingQueue([curr]));
    } else {
      acc.get(curr.categoryId)!.enqueue(curr); // custom method we'll define
    }
    return acc
  }, new Map<Category['id'], RotatingQueue<typeof allGroups[number]>>())

  const PHASE_1_JUDGE_GROUPS_PER_PROJECT: Record<Category['type'], number> = {
    'inhouse': 2,
    'general': 1,
    'sponsor': 1,
    'mlh': 0
  }

  // Project assignment algorithm:
  // Phase 1: Assign submissions to judge groups of corresponding category, ensuring JUDGE_GROUPS_PER_PROJECT groups per project, while recording how many judges per project
  // Phase 2: Make additional General assignments if any projects have less than MINIMUM_JUDGE_PER_PROJECT judges
  const assignmentsByProject = allSubmissions.reduce((acc, s) => {
    const howManyJudgeGroups = groupsByCategory.get(s.categoryId)?.length || 0
    const suggestedJudgeGroupNumber = PHASE_1_JUDGE_GROUPS_PER_PROJECT[s.category.type]
    const judgeGroupsPerSubmission = Math.min(howManyJudgeGroups, suggestedJudgeGroupNumber)

    const assignments = Array.from({ length: judgeGroupsPerSubmission }).map(() => {
      const groupToAssign = groupsByCategory.get(s.categoryId)!.getNext()
      return { submissionId: s.id, judgeGroup: groupToAssign }
    })

    acc.set(s.projectId, (acc.get(s.projectId) || []).concat(assignments))

    return acc
  }, new Map<number, Array<{ submissionId: number, judgeGroup: typeof allGroups[number]}>>())

  // Phase 2: Assign additional General groups
  for (const [projectId, assignments] of assignmentsByProject) {
    let howManyJudgesThisProject = assignments.reduce((acc, curr) => acc + curr.judgeGroup.judgeCount, 0)
    const GENERAL_CATEGORY_ID = 1
    const generalSubmissionOfThisProject = allSubmissions.find(s => s.projectId === projectId && s.categoryId === GENERAL_CATEGORY_ID)!
    while (howManyJudgesThisProject < MINIMUM_JUDGES_PER_PROJECT) {
      const nextGeneralGroup = groupsByCategory.get(GENERAL_CATEGORY_ID)!.getNext()
      const currentGroups = assignments.map(a => a.judgeGroup.id)
      if (!currentGroups.includes(nextGeneralGroup.id)) {
        assignments.push({ submissionId: generalSubmissionOfThisProject.id, judgeGroup: nextGeneralGroup })
        howManyJudgesThisProject += nextGeneralGroup.judgeCount
      }
    }
  }


  // Some final post-condition checks
  const projectsWithInsufficientJudges = [...assignmentsByProject.entries()]
    .map(([projectId, assignments]) => ([ projectId, assignments.reduce((acc, curr) => acc + curr.judgeGroup.judgeCount, 0) ]) as const)
    .filter(([_, judgeCount]) => judgeCount < MINIMUM_JUDGES_PER_PROJECT )

  strictEqual(projectsWithInsufficientJudges.length, 0)

  const assignmentsToInsert = [...assignmentsByProject.values()]
    .flatMap(
      assignments => assignments.map(a => ({ submissionId: a.submissionId, judgeGroupId: a.judgeGroup.id} ))
    )

  const seen = new Set();
  const duplicates = [];
  for (const entry of assignmentsToInsert) {
    const key = `${entry.submissionId}:${entry.judgeGroupId}`;
    if (seen.has(key)) {
      duplicates.push(entry);
    } else {
      seen.add(key);
    }
  }

  strictEqual(duplicates.length, 0)

  // Split into batch because Cloudflare D1 has limit on SQL statement size
  const BATCH_SIZE = 50;
  for (let i = 0; i < assignmentsToInsert.length; i += BATCH_SIZE) {
    const batch = assignmentsToInsert.slice(i, i + BATCH_SIZE);
    await db.insert(assignment).values(batch);
  }
}, 'assign-submissions-to-judge-groups')

