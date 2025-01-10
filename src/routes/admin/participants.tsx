import { action, createAsync, query, useSearchParams, useSubmission } from '@solidjs/router'
import { eq, like } from 'drizzle-orm'
import { TbSearch, TbX } from 'solid-icons/tb'
import { createSignal, For, Match, Show, Switch } from 'solid-js'
import { db } from '~/db'
import { Participant, participant } from '~/db/schema'

const getParticipants = query(async () => {
	'use server'
	const [searchParams, _] = useSearchParams()
	const query = searchParams.q
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
	const { participantId, ...toUpdate } = data
	// HTML checkbox input either returns 'on' or undefined
	const isCheckedIn = toUpdate.checkedIn === 'on'

	const [updated] = await db
		.update(participant)
		.set({ ...toUpdate, checkedIn: isCheckedIn })
		.where(eq(participant.id, parseInt(participantId.toString())))
		.returning()
	return updated
})

export const route = {
	preload: () => getParticipants()
}

export default function ParticipantPage() {
	const participants = createAsync(() => getParticipants())
	const [selectedParticipantId, setSelectedParticipantId] = createSignal<number | null>(null)
	const participant = () => participants()?.find((p) => p.id == selectedParticipantId())
	const updateParticipantSubmission = useSubmission(updateParticipant)
	const closeDrawer = () => setSelectedParticipantId(null)

	function ParticipantInfoForm(props: { participant: Participant }) {
		const p = props.participant
		return (
			<form method="post" action={updateParticipant} class="flex w-full flex-col gap-2">
				<header class="flex w-full justify-between">
					<h2 class="font-bold">Participant #{p.id}</h2>
					<button type="button" onclick={closeDrawer}>
						<TbX size="32" />
					</button>
				</header>
				<div class="flex gap-4">
					<label class="flex-1">
						<div class="label">
							<span class="label-text">First name</span>
						</div>
						<input type="text" name="firstName" value={p.firstName} class="input input-bordered w-full" disabled />
					</label>
					<label class="flex-1">
						<div class="label">
							<span class="label-text">Last name</span>
						</div>
						<input type="text" name="lastName" value={p.lastName} class="input input-bordered w-full" />
					</label>
				</div>
				<label class="grow">
					<div class="label">
						<span class="label-text">Email</span>
					</div>
					<input type="text" name="email" value={p.email} class="input input-bordered w-full" />
				</label>
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" name="checkedIn" class="checkbox-primary checkbox" checked={p.checkedIn} />
						<span class="label-text">Checked in?</span>
					</label>
				</div>
				<input type="hidden" name="participantId" value={p.id} />
				<div class="mt-6 flex w-full gap-8">
					<button type="button" class="btn btn-outline btn-error grow" onclick={closeDrawer}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary grow">
						Save
					</button>
				</div>
				<Switch>
					<Match when={updateParticipantSubmission.pending}>
						<p>Saving...</p>
					</Match>
					<Match when={updateParticipantSubmission.result && updateParticipantSubmission.result.id === p.id}>
						<pre>{JSON.stringify(updateParticipantSubmission.result, null, 1)}</pre>
					</Match>
				</Switch>
			</form>
		)
	}

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
						<input id="query" type="text" name="q" placeholder="Search" class="grow" autofocus />
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
						{/* Participant Info Form */}
						{(p) => <ParticipantInfoForm participant={p} />}
					</Show>
				</div>
			</div>
		</div>
	)
}
