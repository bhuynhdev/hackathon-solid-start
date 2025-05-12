import { Match, Switch } from 'solid-js'
import { AttendanceStatus } from '~/db/types'

export function AttendanceStatusBadge(props: { attendanceStatus: AttendanceStatus }) {
	return (
		<Switch fallback={<span>{props.attendanceStatus}</span>}>
			<Match when={props.attendanceStatus === 'registered'}>
				<span class="badge badge-neutral badge-soft">Registered</span>
			</Match>
			<Match when={props.attendanceStatus === 'declined'}>
				<span class="badge bg-gray-300">Declined</span>
			</Match>
			<Match when={props.attendanceStatus === 'confirmed'}>
				<span class="badge badge-primary">Confirmed</span>
			</Match>
			<Match when={props.attendanceStatus === 'attended'}>
				<span class="badge bg-emerald-400">Attended</span>
			</Match>
			<Match when={props.attendanceStatus === 'waitlist'}>
				<span class="badge bg-amber-400">Waitlist</span>
			</Match>
			<Match when={props.attendanceStatus === 'waitlistattended'}>
				<div class="flex flex-col gap-1 md:flex-row">
					<span class="badge bg-emerald-400">Attended</span>
					<span class="badge bg-amber-400">Waitlist</span>
				</div>
			</Match>
			<Match when={props.attendanceStatus === 'confirmeddelayedcheckin'}>
				<div class="flex gap-1">
					<span class="badge badge-primary">Confirmed</span>
					<span class="badge badge-error">Late</span>
				</div>
			</Match>
		</Switch>
	)
}
