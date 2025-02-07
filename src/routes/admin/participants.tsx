import { action, createAsync, query, RouteDefinition, useSearchParams } from '@solidjs/router'
import { eq, like } from 'drizzle-orm'
import { TbSearch, TbX } from 'solid-icons/tb'
import { createSignal, For, Show } from 'solid-js'
import { db } from '~/db'
import { Participant, participant } from '~/db/schema'

const getParticipants = query(async (query: string = '') => {
	'use server'
	return await db
		.select()
		.from(participant)
		.where(query ? like(participant.nameEmail, `%${query}%`) : undefined)
		.orderBy(participant.id)
}, 'participants')

const updateParticipant = action(async (formData: FormData) => {
	'use server'
	const data = Object.fromEntries(formData)
	const { participantId, ...updateContent } = data
	const isCheckedIn = updateContent.checkedIn === 'yes'

	const [updated] = await db
		.update(participant)
		.set({ ...updateContent, checkedIn: isCheckedIn, updatedAt: new Date().toISOString() })
		.where(eq(participant.id, parseInt(participantId.toString())))
		.returning()
	return updated
})

export const route = {
	preload: () => getParticipants()
} satisfies RouteDefinition

export default function ParticipantPage() {
	const [searchParams, _] = useSearchParams()
	const query = String(searchParams.q ?? '')

	const participants = createAsync(() => getParticipants(query))

	const [selectedParticipantId, setSelectedParticipantId] = createSignal<number | null>(null)
	const participant = () => participants()?.find((p) => p.id == selectedParticipantId())

	return (
		<div class="drawer drawer-end m-auto flex w-4/5 flex-col items-center justify-center gap-6">
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
					<label class="input input-bordered flex w-full items-center gap-2">
						<TbSearch size="18" />
						<input aria-label="Search participant" id="query" type="text" name="q" placeholder="Search" class="grow" value={query} />
					</label>
				</form>
				<section aria-labelleby="participant-list-heading">
					<h2 id="participant-list-heading" class="mt-5 mb-3 font-bold">
						Participant list
					</h2>
					<table aria-labelledby="participant-list-heading" class="table table-auto">
						<thead>
							<tr class="font-bold">
								<th>Id</th>
								<th>First name</th>
								<th>Last name</th>
								<th>Email</th>
								<th>Checked In?</th>
								<th class="sr-only">Edit</th>
							</tr>
						</thead>
						<tbody>
							<For each={participants()}>
								{(p) => (
									<tr>
										<td>{p.id}</td>
										<td>{p.firstName}</td>
										<td>{p.lastName}</td>
										<td>{p.email}</td>
										<td>{p.checkedIn ? <span aria-label="Yes">✅</span> : <span aria-label="No">❌</span>}</td>
										<td>
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
				<div class="bg-base-100 min-h-full w-4/5 p-6 lg:w-2/5 xl:w-1/5">
					<Show when={participant()} fallback={<p>No participant selected</p>} keyed>
						{(p) => <ParticipantInfoForm participant={p} onClose={() => setSelectedParticipantId(null)} />}
					</Show>
				</div>
			</div>
		</div>
	)
}

function ParticipantInfoForm(props: { participant: Participant; onClose: () => void }) {
	const datetimeFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', dateStyle: 'short', timeStyle: 'long' })
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
		<form method="post" action={updateParticipant} class="flex w-full flex-col gap-2">
			<header class="flex w-full justify-between">
				<h2 class="font-bold">Participant #{props.participant.id}</h2>
				<button aria-label="Close" type="button" onclick={props.onClose} class="cursor-pointer">
					<TbX size="32" />
				</button>
			</header>
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
			<div>
				<label class="flex cursor-pointer justify-start gap-2">
					<input type="checkbox" name="checkedIn" value="yes" class="checkbox-primary checkbox" checked={props.participant.checkedIn} />
					<span>Checked in?</span>
				</label>
			</div>
			<input type="hidden" name="participantId" value={props.participant.id} />
			<div class="mt-6 flex w-full gap-8">
				<button type="button" class="btn btn-outline btn-error grow" onclick={props.onClose}>
					Cancel
				</button>
				<button type="submit" class="btn btn-primary grow">
					Save
				</button>
			</div>
			<div class="mt-4">
				<p class="text-sm text-gray-600 italic">Created at: {datetimeFormatter.format(new Date(props.participant.createdAt))}</p>
				<p class="text-sm text-gray-600 italic">
					{props.participant.updatedAt ? `Updated at: ${datetimeFormatter.format(new Date(props.participant.updatedAt))}` : 'No updates yet'}
				</p>
				<h3 class="text-md mt-4 mb-2 font-bold">Additional Information</h3>
				<ul class="mb-4 flex list-inside list-disc flex-col gap-0.5">
					<For each={extraInfoFields}>
						{(field) => (
							<li>
								<span>{camelCaseToTitleCase(field)}</span>: <span>{props.participant[field]}</span>
							</li>
						)}
					</For>
				</ul>
			</div>
		</form>
	)
}

function camelCaseToTitleCase(text: string) {
	const result = text.replace(/([A-Z])/g, ' $1') // Add a space before each capital letter
	const finalResult = result.charAt(0).toUpperCase() + result.slice(1) // Capitalize the first letter
	return finalResult
}
