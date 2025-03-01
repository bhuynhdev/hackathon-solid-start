import { action, query } from '@solidjs/router'
import { like, eq, sql } from 'drizzle-orm'
import { AttendanceStatus, attendanceStatuses, Participant, participant, ParticipantUpdate } from '~/db/schema'
import { getDb, getNextAttendanceActions, determineNextAttendanceStatus, AttendanceAction } from '~/utils'

/** QUERIES */
export const ITEMS_PER_PAGE = 20

type GetParticipantsArg = {
	query?: string
	page?: number
}

export type ParticipantDto = Participant & { availableAttendanceActions: ReturnType<typeof getNextAttendanceActions> }

type GetParticipantsReturn = {
	totalCount: number
	participants: Array<ParticipantDto>
}

export const getParticipants = query(async ({ query = '', page = 1 }: GetParticipantsArg): Promise<GetParticipantsReturn> => {
	'use server'
	const db = getDb()
	const searchCriteria = query ? like(participant.nameEmail, `%${query}%`) : undefined
	const totalCount = await db.$count(participant, searchCriteria)

	/* Deferred Join technique to optimize offset-based pagination
	 * https://orm.drizzle.team/docs/guides/limit-offset-pagination
	 */
	const sq = db
		.select({ id: participant.id })
		.from(participant)
		.where(searchCriteria)
		.orderBy(participant.createdAt, participant.id)
		.limit(ITEMS_PER_PAGE)
		.offset((page - 1) * ITEMS_PER_PAGE)
		.as('subquery')

	const participants = await db.select().from(participant).innerJoin(sq, eq(participant.id, sq.id)).orderBy(participant.createdAt, participant.id)

	return {
		totalCount,
		participants: participants.map(({ participant }) => ({
			...participant,
			availableAttendanceActions: getNextAttendanceActions(participant.attendanceStatus)
		}))
	}
}, 'participants')

export const getQuickStats = query(async () => {
	'use server'
	const db = getDb()
	const result = await db
		.select({
			status: participant.attendanceStatus,
			count: sql<number>`COUNT(*)`.mapWith(Number)
		})
		.from(participant)
		.groupBy(participant.attendanceStatus)

	// Convert to object format { [status]: [count] }
	const participantCountByStatus = Object.fromEntries(attendanceStatuses.map((status) => [status, 0])) as Record<AttendanceStatus, number> // Init with 0s
	result.forEach(({ status, count }) => (participantCountByStatus[status] += count))

	return {
		participantCountByStatus
	}
}, 'participants-quick-stats')

/** ACTIONS **/
export const updateParticipantInfo = action(async (formData: FormData) => {
	'use server'
	const db = getDb()
	const now = new Date().toISOString()
	const { participantId, ...data } = Object.fromEntries(formData)
	const pId = parseInt(participantId.toString())

	const [updated] = await db
		.update(participant)
		.set({ ...data, updatedAt: now })
		.where(eq(participant.id, pId))
		.returning()
	return updated
})

export const advanceAttendanceStaus = action(async (formData: FormData) => {
	'use server'
	const db = getDb()
	const now = new Date().toISOString()
	const { participantId, attendanceAction } = Object.fromEntries(formData)
	const pId = parseInt(participantId.toString())

	const [participantInfo] = await db.select().from(participant).where(eq(participant.id, pId))
	const currentAttendanceStatus = participantInfo.attendanceStatus

	const newAttendanceStatus = determineNextAttendanceStatus({ currentStatus: currentAttendanceStatus, action: attendanceAction as AttendanceAction })

	const updateContent: ParticipantUpdate = { updatedAt: now }
	if (newAttendanceStatus) {
		updateContent.attendanceStatus = newAttendanceStatus
		if (attendanceAction === 'CheckIn') {
			updateContent.checkedInAt = now
		} else if (attendanceAction === 'ConfirmAttendance') {
			updateContent.lastConfirmedAttendanceAt = now
		}
	}

	if (newAttendanceStatus) {
		await db.update(participant).set(updateContent).where(eq(participant.id, pId))
	}
}, 'advance-attendance-status')
