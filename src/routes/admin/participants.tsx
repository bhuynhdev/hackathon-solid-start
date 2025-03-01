import { getParticipants, getQuickStats, ITEMS_PER_PAGE } from '@participants/actions'
import { AttendanceStatusBadge } from '@participants/AttendanceStatusBadge'
import { ParticipantInfoForm } from '@participants/ParticipantInfoForm'
import { createAsync, RouteDefinition, useSearchParams } from '@solidjs/router'
import { createSignal, For, Show } from 'solid-js'
import IconTablerChevronLeft from '~icons/tabler/chevron-left'
import IconTablerChevronRight from '~icons/tabler/chevron-right'
import IconTablerSearch from '~icons/tabler/search'

export const route = {
	preload: () => {
		getParticipants({})
		getQuickStats()
	}
} satisfies RouteDefinition

export default function ParticipantPage() {
	const [searchParams, setSearchParams] = useSearchParams()
	const query = () => String(searchParams.q ?? '')
	const page = () => Number(searchParams.page ?? 1)

	const participants = createAsync(() => getParticipants({ query: query(), page: page() }))
	const totalCount = () => participants()?.totalCount ?? 999
	const recordRange = () => ({ start: Math.max((page() - 1) * ITEMS_PER_PAGE + 1, 1), end: Math.min(page() * ITEMS_PER_PAGE, totalCount()) })

	const participantsQuickStats = createAsync(() => getQuickStats())

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
				<Show when={participantsQuickStats()?.participantCountByStatus} keyed>
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
