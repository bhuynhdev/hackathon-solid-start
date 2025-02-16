import { AttendanceStatus } from './db/schema'

type AttendanceAction = 'CheckIn' | 'ConfirmAttendance' | 'Waitlist' | null

/**
 * Given the current attendance status, determine the next attendance status
 * Return the new status, and the action performed ("CheckIn" | "ConfirmAttendance" | "Waitlist" | null)
 */
export function determineNextAttendanceStatus(args: { currentStatus: AttendanceStatus; delayCheckIn?: boolean }): {
	status: AttendanceStatus | null
	actionPerformed: AttendanceAction
} {
	const { currentStatus, delayCheckIn } = args
	if (currentStatus === 'registered') {
		// TODO: Check waitlist
		const isWaitlisted = false
		return isWaitlisted ? { status: 'waitlist', actionPerformed: 'Waitlist' } : { status: 'confirmed', actionPerformed: 'ConfirmAttendance' }
	}
	if (currentStatus === 'confirmed' || currentStatus === 'confirmed-delayedcheckin') {
		return delayCheckIn ? { status: 'confirmed-delayedcheckin', actionPerformed: 'CheckIn' } : { status: 'attended', actionPerformed: 'CheckIn' }
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
export function getNextAttendanceAction({ currentStatus }: { currentStatus: AttendanceStatus }) {
	if (currentStatus === 'registered') {
		return 'ConfirmAttendance'
	}
	if (currentStatus === 'confirmed' || currentStatus === 'confirmed-delayedcheckin' || currentStatus === 'waitlist') {
		return 'CheckIn'
	}
	return null
}
