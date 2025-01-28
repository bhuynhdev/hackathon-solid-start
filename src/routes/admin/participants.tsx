import { action, createAsync, query, RouteDefinition, useSearchParams } from '@solidjs/router'
import { eq, like } from 'drizzle-orm'
import { TbSearch, TbX } from 'solid-icons/tb'
import { createSignal, For, Show } from 'solid-js'
import { db } from '~/db'
import { Participant, participant } from '~/db/schema'

const getParticipants = query(async (query: string = '') => {
	'use server'
	const participants = await db
		.select()
		.from(participant)
		.where(query ? like(participant.nameEmail, `%${query}%`) : undefined)
		.orderBy(participant.id)
	return participants
}, 'participants')

const updateParticipant = action(async (formData: FormData) => {
	'use server'
	const data = Object.fromEntries(formData)
	const { participantId, ...updateContent } = data
	// HTML checkbox input either returns 'on' or undefined
	const isCheckedIn = updateContent.checkedIn === 'on'

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
	const query = searchParams.q?.toString()
	const participants = createAsync(() => getParticipants(query))
	const [selectedParticipantId, setSelectedParticipantId] = createSignal<number | null>(null)
	const participant = () => participants()?.find((p) => p.id == selectedParticipantId())

	const closeDrawer = () => setSelectedParticipantId(null)

	return (
		<div class="drawer drawer-end m-auto flex w-4/5 flex-col items-center justify-center gap-6">
			<input
				id="participant-info-drawer"
				type="checkbox"
				class="drawer-toggle"
				checked={selectedParticipantId() !== null}
				onChange={(e) => !e.currentTarget.checked && setSelectedParticipantId(null)}
			/>
			<div class="drawer-content w-full">
				<form method="get" class="w-full">
					<label class="input input-bordered flex w-full items-center gap-2">
						<TbSearch size="18" />
						<input id="query" type="text" name="q" placeholder="Search" class="grow" value={query} />
					</label>
				</form>
				<table class="table table-auto">
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
									<td>{p.checkedIn ? '✅' : '❌'}</td>
									<td>
										<button class="btn btn-primary h-8 min-h-8 text-white" onClick={() => setSelectedParticipantId(p.id)}>
											Edit
										</button>
									</td>
								</tr>
							)}
						</For>
					</tbody>
				</table>
			</div>
			<div class="drawer-side">
				<label for="participant-info-drawer" class="drawer-overlay"></label>
				<div class="min-h-full w-4/5 bg-base-100 p-6 lg:w-2/5 xl:w-1/5">
					<Show when={participant()} fallback={<p>No participant selected</p>} keyed>
						{(p) => <ParticipantInfoForm participant={p} onClose={closeDrawer} />}
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
				<button type="button" onclick={props.onClose}>
					<TbX size="32" />
				</button>
			</header>
			<div class="flex gap-4">
				<label class="flex-1">
					<div class="label">
						<span class="label-text">First name</span>
					</div>
					<input type="text" name="firstName" value={props.participant.firstName} class="input input-bordered w-full" />
				</label>
				<label class="flex-1">
					<div class="label">
						<span class="label-text">Last name</span>
					</div>
					<input type="text" name="lastName" value={props.participant.lastName} class="input input-bordered w-full" />
				</label>
			</div>
			<label class="grow">
				<div class="label">
					<span class="label-text">Email</span>
				</div>
				<input type="text" name="email" value={props.participant.email} class="input input-bordered w-full" />
			</label>
			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-4">
					<input type="checkbox" name="checkedIn" class="checkbox-primary checkbox" checked={props.participant.checkedIn} />
					<span class="label-text">Checked in?</span>
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
				<p class="text-sm italic text-gray-600">Created at: {datetimeFormatter.format(new Date(props.participant.createdAt))}</p>
				<p class="text-sm italic text-gray-600">
					{props.participant.updatedAt ? `Updated at: ${datetimeFormatter.format(new Date(props.participant.updatedAt))}` : 'No updates yet'}
				</p>
				<h3 class="text-md mb-2 mt-4 font-bold">Additional Information</h3>
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
