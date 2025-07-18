import { getParticipants, ITEMS_PER_PAGE } from '@participants/actions'
import { AttendanceStatusBadge } from '@participants/AttendanceStatusBadge'
import { ParticipantInfoForm } from '@participants/ParticipantInfoForm'
import { createAsync, RouteDefinition, useSearchParams } from '@solidjs/router'
import { createSignal, For, Show } from 'solid-js'
import { attendanceStatuses } from '~/db/schema'
import IconTablerChevronLeft from '~icons/tabler/chevron-left'
import IconTablerChevronRight from '~icons/tabler/chevron-right'

export const route = {
	preload: () => getParticipants({})
} satisfies RouteDefinition

export default function ParticipantPage() {
	const [searchParams, setSearchParams] = useSearchParams()
	const query = () => String(searchParams.q ?? '')
	const status = () => String(searchParams.status ?? '')
	const page = () => Number(searchParams.page ?? 1)

	const participantData = createAsync(() => getParticipants({ query: query(), page: page(), status: status() }))
	const totalCount = () => participantData()?.totalCount ?? 999
	const recordRange = () => ({ start: Math.max((page() - 1) * ITEMS_PER_PAGE + 1, 1), end: Math.min(page() * ITEMS_PER_PAGE, totalCount()) })

	const [selectedParticipantId, setSelectedParticipantId] = createSignal<number | null>(null)
	const participant = () => participantData()?.participants.find((p) => p.id == selectedParticipantId())

	function nextPage() {
		setSearchParams({ page: page() + 1 })
	}

	function previousPage() {
		setSearchParams({ page: Math.max(1, page() - 1) })
	}

	return (
		<div class="drawer drawer-end m-auto flex flex-col items-center justify-center gap-6">
			<input
				/** This is a 'hidden' input that controls the drawer **/
				id="participant-info-drawer"
				type="checkbox"
				class="drawer-toggle"
				aria-hidden
				checked={selectedParticipantId() !== null}
				onChange={(e) => !e.currentTarget.checked && setSelectedParticipantId(null)} /** Set participant to null if drawer is checked off **/
			/>
			<div class="drawer-content w-full">
				<Show when={participantData()?.alltimeStats.participantCountByStatus} keyed>
					{({ attended, waitlist, waitlistattended, confirmed, confirmeddelayedcheckin }) => (
						<div class="mb-6 grid grid-cols-3 gap-3">
							<div class="rounded-lg bg-sky-200 p-4">
								<p class="text-xl font-bold">{confirmed + confirmeddelayedcheckin + attended + waitlistattended}</p>
								<p class="text-gray-500">Confirmed Attendance</p>
							</div>
							<div class="rounded-lg bg-emerald-200 p-4">
								<p class="text-xl font-bold">{attended + waitlistattended}</p>
								<p class="text-gray-500">Checked in</p>
								<p class="text-gray-500 italic">{waitlistattended} from waitlist</p>
							</div>
							<div class="rounded-lg bg-amber-200 p-4">
								<p class="text-xl font-bold">{waitlist}</p>
								<p class="text-gray-500">Waitlist</p>
							</div>
						</div>
					)}
				</Show>
				<form
					method="get"
					class="grid grid-flow-col grid-cols-[repeat(auto-fit,minmax(100px,1fr))] items-end gap-2 rounded-lg bg-gray-100 p-4"
					role="search"
				>
					<label class="fieldset py-0">
						<span class="fieldset-legend pt-0 text-sm">Name &amp; Email</span>
						{/* <IconTablerSearch width="18" height="18" /> */}
						<input class="input pb-0" aria-label="Search participant" type="text" name="q" placeholder="Search" value={query()} />
					</label>
					<label class="fieldset py-0">
						<span class="fieldset-legend pt-0 text-sm">Attendance status</span>
						<select class="select" name="status">
							<option value="" selected={!status()}>
								--All--
							</option>
							<For each={attendanceStatuses}>
								{(attendanceStatus) => (
									<option value={attendanceStatus} selected={status() === attendanceStatus}>
										{attendanceStatus}
									</option>
								)}
							</For>
						</select>
					</label>
					<button type="submit" class="btn btn-primary my-1 max-w-42">
						Search
					</button>
				</form>
				<section aria-labelleby="participant-list-heading">
					<div class="my-5 flex items-center gap-16">
						<h2 id="participant-list-heading">Participant list</h2>
						<div class="flex items-center gap-2">
							<button
								type="button"
								class="btn btn-sm btn-soft btn-primary"
								aria-label="Previous page"
								title="Previous page"
								onclick={previousPage}
								disabled={page() === 1}
							>
								<IconTablerChevronLeft />
							</button>
							<button
								type="button"
								class="btn btn-sm btn-soft btn-primary"
								aria-label="Next page"
								title="Next page"
								onclick={nextPage}
								disabled={recordRange().end >= totalCount()}
							>
								<IconTablerChevronRight />
							</button>
							<p class="ml-2 text-sm text-gray-600 italic">
								{recordRange().start} - {recordRange().end} of {participantData()?.totalCount}
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
							<For each={participantData()?.participants}>
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
										<td class="hidden sm:table-cell">
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
