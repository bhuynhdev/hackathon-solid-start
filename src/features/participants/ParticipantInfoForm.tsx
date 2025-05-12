import { For, Show } from 'solid-js'
import { Participant } from '~/db/types'
import IconTablerX from '~icons/tabler/x'
import { advanceAttendanceStatus, ParticipantDto, updateParticipantInfo } from './actions'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'

export function ParticipantInfoForm(props: { participant: ParticipantDto; onClose: () => void }) {
	const datetimeFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', dateStyle: 'short', timeStyle: 'medium' })
	const extraInfoFields = [
		'phone',
		'gender',
		'age',
		'country',
		'school',
		'levelOfStudy',
		'graduationYear',
		'dietRestrictions',
		'resumeUrl',
		'notes'
	] satisfies Array<keyof Participant>

	return (
		<section class="flex w-full flex-col gap-2">
			<header class="flex w-full justify-between">
				<div class="flex items-center gap-2">
					<h2 class="text-base">Participant #{props.participant.id}</h2>
					<AttendanceStatusBadge attendanceStatus={props.participant.attendanceStatus} />
				</div>
				<button aria-label="Close" type="button" onclick={props.onClose} class="cursor-pointer">
					<IconTablerX width="32" height="32" />
				</button>
			</header>
			<section class="flex gap-6" aria-label="Timestamp information">
				<p class="text-sm text-gray-600 italic">
					Created: <br /> {datetimeFormatter.format(new Date(props.participant.createdAt))}
				</p>
				<p class="text-sm text-gray-600 italic">
					Confirmed Attendance: <br />
					{props.participant.lastConfirmedAttendanceAt
						? `${datetimeFormatter.format(new Date(props.participant.lastConfirmedAttendanceAt))}`
						: 'No changes yet'}
				</p>
				<p class="text-sm text-gray-600 italic">
					Checked in: <br />
					{props.participant.checkedInAt ? `${datetimeFormatter.format(new Date(props.participant.checkedInAt))}` : 'Not yet'}
				</p>
			</section>
			<form id="participant-profile" method="post" action={updateParticipantInfo} class="border-base-300 mt-4 rounded-md border">
				<header class="bg-gray-200 px-4 py-3">
					<h3 class="font-semibold">Profile</h3>
				</header>
				<div class="p-4">
					<div class="flex gap-4">
						<label class="fieldset flex-1">
							<span class="fieldset-legend text-sm">First name</span>
							<input type="text" name="firstName" value={props.participant.firstName} class="input input-bordered w-full" />
						</label>
						<label class="fieldset flex-1">
							<span class="fieldset-legend text-sm">Last name</span>
							<input type="text" name="lastName" value={props.participant.lastName} class="input input-bordered w-full" />
						</label>
					</div>
					<label class="fieldset grow">
						<span class="fieldset-legend text-sm">Email</span>
						<input type="text" name="email" value={props.participant.email} class="input input-bordered w-full" />
					</label>
					<div tabindex="0" class="collapse-arrow collapse">
						<input type="checkbox" />
						<div class="collapse-title px-0 text-sm font-semibold">Additional Information</div>
						<div class="collapse-content pl-1 text-sm">
							<ul class="-mt-4 flex list-inside list-disc flex-col gap-0.5">
								<For each={extraInfoFields}>
									{(field) => (
										<li>
											<span>{camelCaseToTitleCase(field)}</span>: <span>{props.participant[field]}</span>
										</li>
									)}
								</For>
							</ul>
						</div>
					</div>
					<input type="hidden" name="participantId" value={props.participant.id} />
					<button type="submit" class="btn btn-primary text-base-100 ml-auto block w-32">
						Save changes
					</button>
				</div>
			</form>
			<form method="post" action={advanceAttendanceStatus} class="border-base-300 rounded-md border-1">
				<header class="bg-gray-200 px-4 py-3">
					<h3 class="font-semibold">Attendance Status</h3>
				</header>
				<input type="hidden" name="participantId" value={props.participant.id} />
				<div class="space-y-4 p-4">
					<p>
						Attendance Status: <span class="font-bold">{props.participant.attendanceStatus}</span>
					</p>
					<div class="flex items-center gap-2">
						<Show when={props.participant.availableAttendanceActions.length === 0}>
							<div>
								<p>No action needed</p>
								{props.participant.attendanceStatus.includes('waitlist') && (
									<p>Remind participant to keep an eye on their emails for waitlist status updates</p>
								)}
							</div>
						</Show>
						<Show when={props.participant.availableAttendanceActions.includes('ConfirmAttendance')}>
							<button type="submit" name="attendanceAction" value="ConfirmAttendance" class="btn btn-primary text-base-100">
								Confirm Attendance
							</button>
						</Show>
						<Show when={props.participant.availableAttendanceActions.includes('CheckIn')}>
							<button type="submit" name="attendanceAction" value="CheckIn" class="btn btn-primary text-base-100">
								Check in
							</button>
						</Show>
						<Show when={props.participant.availableAttendanceActions.includes('Unconfirm')}>
							<button type="submit" name="attendanceAction" value="Unconfirm" class="btn btn-outline">
								Unconfirm
							</button>
						</Show>
						<Show when={props.participant.availableAttendanceActions.includes('ToggleLateCheckIn')}>
							<button type="submit" name="attendanceAction" value="ToggleLateCheckIn" class="btn btn-outline">
								{props.participant.attendanceStatus === 'confirmed' ? 'Mark Late Check-in' : 'Unmark Late Check-in'}
							</button>
						</Show>
					</div>
				</div>
			</form>
		</section>
	)
}

function camelCaseToTitleCase(text: string) {
	const result = text.replace(/([A-Z])/g, ' $1') // Add a space before each capital letter
	const finalResult = result.charAt(0).toUpperCase() + result.slice(1) // Capitalize the first letter
	return finalResult
}
