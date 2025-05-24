import { createAsync, RouteDefinition } from '@solidjs/router'
import { createSignal, For, Match, Show, Switch } from 'solid-js'
import { clearJudgeGroups, deleteJudge, getJudgesQuery, listJudgeGroups, resetAndOrganizeJudgeGroups } from '~/features/judging/actions'
import { AddJudgesForm } from '~/features/judging/AddJudgeForm'
import { JudgeEditForm } from '~/features/judging/JudgeEditForm'
import IconTablerHomeMove from '~icons/tabler/home-move'
import IconTablerPlus from '~icons/tabler/plus'
import IconTablerStack2 from '~icons/tabler/stack-2'
import IconTablerTrash from '~icons/tabler/trash'
import IconTablerTrashX from '~icons/tabler/trash-x'
import IconTablerX from '~icons/tabler/x'

export const route = {
	preload: () => Promise.all([getJudgesQuery(), listJudgeGroups()])
} satisfies RouteDefinition

export default function JudgesPage() {
	const judges = createAsync(() => getJudgesQuery())
	const judgeGroups = createAsync(() => listJudgeGroups())
	const [selectedJudgeId, setSelectedJudgeId] = createSignal<number | null>(null)
	const judge = () => judges()?.find((j) => j.id == selectedJudgeId())

	let addJudgesModal!: HTMLDialogElement
	return (
		<div class="drawer drawer-end m-auto flex flex-col items-center justify-center gap-6">
			<input
				/** This is a 'hidden' input that controls the drawer **/
				id="judge-info-drawer"
				type="checkbox"
				class="drawer-toggle"
				hidden
				checked={selectedJudgeId() !== null}
				onChange={(e) => !e.currentTarget.checked && setSelectedJudgeId(null)} /** Set category to null if drawer is checked off **/
			/>
			<div class="drawer-content w-full">
				<div class="flex items-end gap-10">
					<div>
						<h2>Judges</h2>
					</div>
					<div class="flex gap-4">
						<button type="button" class="btn btn-primary btn-outline w-fit" onclick={() => addJudgesModal.showModal()}>
							<span aria-hidden>
								<IconTablerPlus />
							</span>
							Add judges
						</button>
						<form action={resetAndOrganizeJudgeGroups} method="post">
							<button type="submit" class="btn btn-primary btn-outline w-fit">
								<span aria-hidden>
									<IconTablerStack2 />
								</span>
								{judgeGroups()?.length ? 'Re-generate judge groups' : 'Generate judge groups'}
							</button>
						</form>
						<form action={clearJudgeGroups} method="post" hidden={!judgeGroups()?.length}>
							<button type="submit" class="btn btn-error btn-outline w-fit">
								<span aria-hidden>
									<IconTablerTrashX />
								</span>
								Clear judge group
							</button>
						</form>
					</div>
				</div>
				<Show when={judgeGroups()?.length}>
					<div>
						<h3 class="my-4 font-semibold">Judge Groups ({judgeGroups()?.length})</h3>
						<div class="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-6">
							<For each={judgeGroups()}>
								{(group) => (
									<div class="h-72 rounded-xl border border-gray-400 p-4 shadow">
										<p class="ml-2 text-lg font-bold">Group {group.name}</p>
										<p class="my-1 ml-2 text-sm text-gray-600 italic">{group.category.name}</p>
										<div class="mt-2 flex flex-col">
											<For each={group.judges}>
												{(j) => (
													<div class="group flex items-center justify-between px-2 py-1 hover:bg-slate-100">
														<p>{j.name}</p>
														<button class="cursor-pointer opacity-0 group-hover:opacity-100" aria-label={`Move judge ${j.name} to another group`}>
															<IconTablerHomeMove />
														</button>
													</div>
												)}
											</For>
										</div>
									</div>
								)}
							</For>
							<div class="h-72 rounded-xl border border-dashed border-gray-400 shadow">
								<button type="button" class="h-full w-full cursor-pointer">
									New group
								</button>
							</div>
						</div>
					</div>
				</Show>
				<h3 class="my-6 font-semibold">Judge List ({judges()?.length})</h3>
				<table class="table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Category</th>
							<th>Email</th>
							<th class="sr-only">Edit</th>
							<th class="sr-only">Delete</th>
						</tr>
					</thead>
					<tbody>
						<For each={judges()}>
							{(judge) => (
								<tr>
									<td>
										<div class="flex w-56 justify-between">
											<span>{judge.name}</span>
											<Switch>
												<Match when={judge.category.type === 'inhouse'}>
													<span class="badge bg-amber-300">Inhouse</span>
												</Match>
												<Match when={judge.category.type === 'sponsor'}>
													<span class="badge bg-rose-400">Sponsor</span>
												</Match>
												<Match when={judge.category.type === 'general'}>
													<span class="badge bg-gray-200">General</span>
												</Match>
												<Match when={judge.category.type === 'mlh'}>
													<span class="badge bg-violet-400">MLH</span>
												</Match>
											</Switch>
										</div>
									</td>
									<td>{judge.category.name}</td>
									<td>{judge.email}</td>
									<td>
										<button type="button" class="btn btn-primary h-8 text-white" onclick={() => setSelectedJudgeId(judge.id)}>
											Edit
										</button>
									</td>
									<td class="pl-0">
										<form action={deleteJudge} method="post">
											<input type="hidden" name="judgeId" value={judge.id} />
											<button type="submit" class="btn btn-error btn-soft h-8" aria-label="Delete">
												<span class="hidden md:inline">Delete </span>
												<span>
													<IconTablerTrash />
												</span>
											</button>
										</form>
									</td>
								</tr>
							)}
						</For>
					</tbody>
				</table>
				<dialog id="add-judges-modal" class="modal" ref={addJudgesModal}>
					<div class="modal-box h-[600px] max-w-md lg:max-w-lg">
						<div class="flex justify-between">
							<h3 class="mb-4 text-lg font-bold">Add Judges</h3>
							<button class="cursor-pointer" aria-label="Close" onclick={() => addJudgesModal.close()}>
								<IconTablerX />
							</button>
						</div>
						<AddJudgesForm />
						<form method="dialog" class="modal-action">
							<button class="btn">Close</button>
						</form>
					</div>
				</dialog>
			</div>
			<div role="dialog" class="drawer-side">
				<label for="judge-info-drawer" class="drawer-overlay"></label>
				<div class="bg-base-100 min-h-full w-full max-w-[500px] p-6">
					<Show when={judge()} fallback={<p>No judge selected</p>}>
						<JudgeEditForm judge={judge()!} onClose={() => setSelectedJudgeId(null)} />
					</Show>
				</div>
			</div>
		</div>
	)
}
