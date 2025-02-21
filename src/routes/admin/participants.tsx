import { action, createAsync, query, RouteDefinition, useSearchParams } from '@solidjs/router'
import { eq, like } from 'drizzle-orm'
import { createSignal, For, Match, Show, Switch } from 'solid-js'
import { AttendanceStatus, Participant, participant, ParticipantUpdate } from '~/db/schema'
import { determineNextAttendanceStatus, getDb, getNextAttendanceAction } from '~/utils'
import IconTablerChevronLeft from '~icons/tabler/chevron-left'
import IconTablerChevronRight from '~icons/tabler/chevron-right'
import IconTablerSearch from '~icons/tabler/search'
import IconTablerX from '~icons/tabler/x'

const ITEMS_PER_PAGE = 20

const getParticipants = query(async (query: string = '') => {
	'use server'
	const db = getDb()
	const criteria = query ? like(participant.nameEmail, `%${query}%`) : undefined
	const totalCount = await db.$count(participant, criteria)
	const participants = await db.select().from(participant).where(criteria).orderBy(participant.id).limit(ITEMS_PER_PAGE)
	return { totalCount, participants }
}, 'participants')

const updateParticipantInfo = action(async (formData: FormData) => {
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

const advanceAttendanceStaus = action(async (formData: FormData) => {
	'use server'
	const db = getDb()
	const now = new Date().toISOString()
	const { participantId, toggleLateCheckIn } = Object.fromEntries(formData)
	const pId = parseInt(participantId.toString())

	const [participantInfo] = await db.select().from(participant).where(eq(participant.id, pId))
	const currentAttendanceStatus = participantInfo.attendanceStatus

	const { status: newAttendanceStatus, actionPerformed } = determineNextAttendanceStatus({
		currentStatus: currentAttendanceStatus,
		toggleLateCheckIn: toggleLateCheckIn === 'yes'
	})

	const updateContent: ParticipantUpdate = { updatedAt: now }
	if (newAttendanceStatus) {
		updateContent.attendanceStatus = newAttendanceStatus
		if (actionPerformed === 'CheckIn') {
			updateContent.checkedInAt = now
		}
	}

	if (newAttendanceStatus) {
		await db.update(participant).set(updateContent).where(eq(participant.id, pId))
	}
}, 'advance-attendance-status')

export const route = {
	preload: () => getParticipants()
} satisfies RouteDefinition

function AttendanceStatusBadge(props: { attendanceStatus: AttendanceStatus }) {
	return (
		<Switch fallback={<span>{props.attendanceStatus}</span>}>
			<Match when={props.attendanceStatus === 'registered'}>
				<span class="badge badge-neutral badge-soft">Registered</span>
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
			<Match when={props.attendanceStatus === 'waitlist-attended'}>
				<div class="flex gap-1">
					<span class="badge bg-emerald-400">Attended</span>
					<span class="badge bg-amber-400">Waitlist</span>
				</div>
			</Match>
			<Match when={props.attendanceStatus === 'confirmed-delayedcheckin'}>
				<div class="flex gap-1">
					<span class="badge badge-primary">Confirmed</span>
					<span class="badge badge-error">Late</span>
				</div>
			</Match>
		</Switch>
	)
}

export default function ParticipantPage() {
	const [searchParams, _] = useSearchParams()
	const query = () => String(searchParams.q ?? '')

	const participants = createAsync(() => getParticipants(query()))

	const [selectedParticipantId, setSelectedParticipantId] = createSignal<number | null>(null)
	const participant = () => participants()?.participants.find((p) => p.id == selectedParticipantId())

	return (
		<div class="drawer drawer-end m-auto flex flex-col items-center justify-center gap-6 lg:w-4/5">
			<input
				id="participant-info-drawer"
				type="checkbox"
				class="drawer-toggle"
				aria-hidden
				checked={selectedParticipantId() !== null}
				onChange={(e) => !e.currentTarget.checked && setSelectedParticipantId(null)} /** Set participant to null if drawer is checked off **/
			/>
			<div class="drawer-content w-full">
				<form method="get" class="w-full" role="search">
					<label class="input input-bordered flex w-full items-center gap-2 text-base">
						<IconTablerSearch width="18" height="18" />
						<input aria-label="Search participant" id="query" type="text" name="q" placeholder="Search" class="grow" value={query()} />
					</label>
				</form>
				<section aria-labelleby="participant-list-heading">
					<div class="my-5 flex items-center gap-16">
						<h2 id="participant-list-heading" class="text-lg font-bold">
							Participant list
						</h2>
						<div class="flex items-center gap-2">
							<button class="btn btn-sm btn-soft btn-primary" disabled aria-label="Previous page" title="Previous page">
								<IconTablerChevronLeft />
							</button>
							<button class="btn btn-sm btn-soft btn-primary" aria-label="Next page" title="Next page">
								<IconTablerChevronRight />
							</button>
						</div>
					</div>

					<table aria-labelledby="participant-list-heading" class="table table-auto">
						<thead>
							<tr class="font-bold">
								<th>Name &amp; Email</th>
								<th>Status</th>
								<th class="sr-only hidden md:table-cell">Edit</th>
							</tr>
						</thead>
						<tbody>
							<For each={participants()?.participants}>
								{(p) => (
									<tr onpointerup={(e) => e.pointerType === 'touch' && setSelectedParticipantId(p.id)}>
										<td>
											<p>
												{p.firstName} {p.lastName}
											</p>
											<p class="text-gray-500 italic">{p.email}</p>
										</td>
										<td>
											<AttendanceStatusBadge attendanceStatus={p.attendanceStatus} />
										</td>
										<td class="hidden md:table-cell">
											<button
												aria-label="Open Participant edit modal"
												class="btn btn-primary h-8 min-h-8 text-white"
												onClick={() => setSelectedParticipantId(p.id)}
											>
												Edit
											</button>
										</td>
									</tr>
								)}
							</For>
						</tbody>
					</table>
				</section>
			</div>
			<div role="dialog" class="drawer-side">
				<label for="participant-info-drawer" class="drawer-overlay"></label>
				<div class="bg-base-100 min-h-full w-full max-w-[500px] p-6">
					<Show when={participant()} fallback={<p>No participant selected</p>} keyed>
						{(p) => <ParticipantInfoForm participant={p} onClose={() => setSelectedParticipantId(null)} />}
					</Show>
				</div>
			</div>
		</div>
	)
}

function ParticipantInfoForm(props: { participant: Participant; onClose: () => void }) {
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
	const nextAttendanceAction = () => getNextAttendanceAction({ currentStatus: props.participant.attendanceStatus })

	return (
		<div class="flex w-full flex-col gap-2">
			<div class="flex w-full justify-between">
				<div class="flex gap-2">
					<h2 class="font-bold">Participant #{props.participant.id}</h2>
					<AttendanceStatusBadge attendanceStatus={props.participant.attendanceStatus} />
				</div>
				<button aria-label="Close" type="button" onclick={props.onClose} class="cursor-pointer">
					<IconTablerX width="32" height="32" />
				</button>
			</div>
			<div class="flex gap-6">
				<p class="text-sm text-gray-600 italic">
					Created: <br /> {datetimeFormatter.format(new Date(props.participant.createdAt))}
				</p>
				<p class="text-sm text-gray-600 italic">
					Updated: <br />
					{props.participant.updatedAt ? `${datetimeFormatter.format(new Date(props.participant.updatedAt))}` : 'No updates yet'}
				</p>
				<p class="text-sm text-gray-600 italic">
					Checked in: <br />
					{props.participant.checkedInAt ? `${datetimeFormatter.format(new Date(props.participant.checkedInAt))}` : 'Not yet'}
				</p>
			</div>
			<form id="participant-profile" method="post" action={updateParticipantInfo} class="border-base-300 mt-4 rounded-md border-1">
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
			<hr class="divider mx-auto w-4/5 border-none" />
			<form method="post" action={advanceAttendanceStaus} class="border-base-300 rounded-md border-1">
				<header class="bg-gray-200 px-4 py-3">
					<h3 class="font-semibold">Attendance Status</h3>
				</header>
				<input type="hidden" name="participantId" value={props.participant.id} />
				<div class="space-y-4 p-4">
					<p>
						Attendance Status: <span class="font-bold">{props.participant.attendanceStatus}</span>
					</p>
					<div class="flex items-center gap-2">
						<Show when={nextAttendanceAction() === null}>
							<div>
								<p>No action needed</p>
								{props.participant.attendanceStatus.includes('waitlist') && (
									<p>Remind participant to keep an eye on their emails for waitlist status updates</p>
								)}
							</div>
						</Show>
						<Show when={nextAttendanceAction()?.includes('ConfirmAttendance')}>
							<button type="submit" class="btn btn-primary text-base-100">
								Confirm Attendance
							</button>
						</Show>
						<Show when={nextAttendanceAction()?.includes('CheckIn')}>
							<button type="submit" class="btn btn-primary text-base-100">
								Check in
							</button>
						</Show>
						<Show when={nextAttendanceAction()?.includes('ToggleLateCheckIn')}>
							<button type="submit" name="toggleLateCheckIn" value="yes" class="btn btn-outline">
								{props.participant.attendanceStatus === 'confirmed' ? 'Mark as' : 'Unmark'} Late Check-in
							</button>
						</Show>
					</div>
				</div>
			</form>
		</div>
	)
}

function camelCaseToTitleCase(text: string) {
	const result = text.replace(/([A-Z])/g, ' $1') // Add a space before each capital letter
	const finalResult = result.charAt(0).toUpperCase() + result.slice(1) // Capitalize the first letter
	return finalResult
}
