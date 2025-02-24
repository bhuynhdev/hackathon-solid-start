import { action, createAsync, query, RouteDefinition, useSearchParams } from '@solidjs/router'
import { eq, like } from 'drizzle-orm'
import { createSignal, For, Match, Show, Switch } from 'solid-js'
import { AttendanceStatus, Participant, participant, ParticipantUpdate } from '~/db/schema'
import { AttendanceAction, determineNextAttendanceStatus, getDb, getNextAttendanceActions } from '~/utils'
import IconTablerChevronLeft from '~icons/tabler/chevron-left'
import IconTablerChevronRight from '~icons/tabler/chevron-right'
import IconTablerSearch from '~icons/tabler/search'
import IconTablerX from '~icons/tabler/x'

const ITEMS_PER_PAGE = 20

type GetParticipantsArg = {
	query?: string
	page?: number
}

type ParticipantDto = Participant & { availableAttendanceActions: ReturnType<typeof getNextAttendanceActions> }

type GetParticipantsReturn = {
	totalCount: number
	participants: Array<ParticipantDto>
}

const getParticipants = query(async ({ query = '', page = 1 }: GetParticipantsArg): Promise<GetParticipantsReturn> => {
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

export const route = {
	preload: () => getParticipants({})
} satisfies RouteDefinition

function AttendanceStatusBadge(props: { attendanceStatus: AttendanceStatus }) {
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
	const [searchParams, setSearchParams] = useSearchParams()
	const query = () => String(searchParams.q ?? '')
	const page = () => Number(searchParams.page ?? 1)

	const participants = createAsync(() => getParticipants({ query: query(), page: page() }))

	const totalCount = () => participants()?.totalCount ?? 999
	const recordRange = () => ({ start: Math.max((page() - 1) * ITEMS_PER_PAGE + 1, 1), end: Math.min(page() * ITEMS_PER_PAGE, totalCount()) })

	const [selectedParticipantId, setSelectedParticipantId] = createSignal<number | null>(null)
	const participant = () => participants()?.participants.find((p) => p.id == selectedParticipantId())

	function nextPage() {
		setSearchParams({ page: page() + 1 })
	}

	function previousPage() {
		setSearchParams({ page: Math.max(1, page() - 1) })
	}

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
						<h2 id="participant-list-heading">Participant list</h2>
						<div class="flex items-center gap-2">
							<button
								class="btn btn-sm btn-soft btn-primary"
								aria-label="Previous page"
								title="Previous page"
								onclick={previousPage}
								disabled={page() === 1}
							>
								<IconTablerChevronLeft />
							</button>
							<button
								class="btn btn-sm btn-soft btn-primary"
								aria-label="Next page"
								title="Next page"
								onclick={nextPage}
								disabled={recordRange().end >= totalCount()}
							>
								<IconTablerChevronRight />
							</button>
							<p class="ml-2 text-sm text-gray-600 italic">
								{recordRange().start} - {recordRange().end} of {participants()?.totalCount}
							</p>
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

function ParticipantInfoForm(props: { participant: ParticipantDto; onClose: () => void }) {
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
					<div tabindex="0" class="collapse-arrow collapse-open collapse">
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
