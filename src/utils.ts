import { getRequestEvent } from 'solid-js/web'
import { AttendanceStatus } from './db/schema'
import { Database } from './db'

export type AttendanceAction = 'CheckIn' | 'ConfirmAttendance' | 'Unconfirm' | 'Waitlist' | 'ToggleLateCheckIn'

const ATTENDANCE_STATUS_STATE_MACHINE: Record<AttendanceStatus, Partial<Record<AttendanceAction, AttendanceStatus>>> = {
	registered: {
		get ConfirmAttendance() {
			// TODO: Check waitlist
			const isWaitlisted = true
			return isWaitlisted ? 'waitlist' : 'confirmed'
		}
	},
	confirmed: {
		CheckIn: 'attended',
		ToggleLateCheckIn: 'confirmed-delayedcheckin',
		Unconfirm: 'registered'
	},
	'confirmed-delayedcheckin': {
		CheckIn: 'attended',
		ToggleLateCheckIn: 'confirmed'
	},
	waitlist: {
		CheckIn: 'waitlist-attended'
	},
	attended: {},
	'waitlist-attended': {}
} as const

/**
 * Given the current attendance status and action, determine the next attendance status
 */
export function determineNextAttendanceStatus(args: { currentStatus: AttendanceStatus; action: AttendanceAction }): AttendanceStatus | null {
	const currentState = ATTENDANCE_STATUS_STATE_MACHINE[args.currentStatus]
	const potentialTransitions = Object.keys(currentState)
	if (potentialTransitions.length == 0) {
		return null // No more transition available at this state
	}
	if (args.action in currentState) {
		return currentState[args.action as keyof typeof currentState] ?? null
	}
	throw Error(`AttendanceAtion ${args.action} is not possible given state ${args.currentStatus}`)
}

/**
 * Determine the next attendance action to display on the UI
 * given the current attendance status
 */
export function getNextAttendanceActions(currentStatus: AttendanceStatus): Array<AttendanceAction> {
	return Object.keys(ATTENDANCE_STATUS_STATE_MACHINE[currentStatus]) as Array<keyof (typeof ATTENDANCE_STATUS_STATE_MACHINE)[AttendanceStatus]>
}

export const getDb = () => {
	const event = getRequestEvent()
	return event?.locals.db as Database
}
