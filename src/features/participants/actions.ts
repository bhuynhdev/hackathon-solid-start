import { action, query } from '@solidjs/router'
import { like, eq } from 'drizzle-orm'
import { Participant, participant, ParticipantUpdate } from '~/db/schema'
import { getDb, getNextAttendanceActions, determineNextAttendanceStatus, AttendanceAction } from '~/utils'

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
