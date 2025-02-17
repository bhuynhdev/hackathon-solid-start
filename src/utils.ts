import { getRequestEvent } from 'solid-js/web'
import { AttendanceStatus } from './db/schema'
import { Database } from './db'

type AttendanceAction = 'CheckIn' | 'ConfirmAttendance' | 'Waitlist' | 'ToggleLateCheckIn'

type DetermineNextAttendanceStatusReturn = { status: AttendanceStatus; actionPerformed: AttendanceAction } | { status: null; actionPerformed: null }

/**
 * Given the current attendance status, determine the next attendance status
 * Return the new status, and the action performed ("CheckIn" | "ConfirmAttendance" | "Waitlist" | null)
 */
export function determineNextAttendanceStatus(args: {
	currentStatus: AttendanceStatus
	toggleLateCheckIn?: boolean
}): DetermineNextAttendanceStatusReturn {
	const { currentStatus, toggleLateCheckIn } = args
	if (currentStatus === 'registered') {
		// TODO: Check waitlist
		const isWaitlisted = false
		return isWaitlisted ? { status: 'waitlist', actionPerformed: 'Waitlist' } : { status: 'confirmed', actionPerformed: 'ConfirmAttendance' }
	}
	if (currentStatus === 'confirmed') {
		return toggleLateCheckIn
			? { status: 'confirmed-delayedcheckin', actionPerformed: 'ToggleLateCheckIn' }
			: { status: 'attended', actionPerformed: 'CheckIn' }
	}
	if (currentStatus === 'confirmed-delayedcheckin') {
		return toggleLateCheckIn ? { status: 'confirmed', actionPerformed: 'ToggleLateCheckIn' } : { status: 'attended', actionPerformed: 'CheckIn' }
	}
	if (currentStatus === 'waitlist') {
		return { status: 'waitlist-attended', actionPerformed: 'CheckIn' }
	}
	return { status: null, actionPerformed: null }
}

/**
 * Determine the next attendance action to display on the UI
 * given the current attendance status
 */
export function getNextAttendanceAction({ currentStatus }: { currentStatus: AttendanceStatus }): Array<AttendanceAction> | null {
	if (currentStatus === 'registered') {
		return ['ConfirmAttendance']
	}
	if (currentStatus === 'confirmed' || currentStatus === 'confirmed-delayedcheckin') {
		return ['CheckIn', 'ToggleLateCheckIn']
	}
	if (currentStatus === 'waitlist') {
		return ['CheckIn']
	}
	return null
}

export const getDb = () => {
	const event = getRequestEvent()
	return event?.locals.db as Database
}
