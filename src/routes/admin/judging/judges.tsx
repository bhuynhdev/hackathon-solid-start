import { createAsync, RouteDefinition } from '@solidjs/router'
import { createSignal, For, Show } from 'solid-js'
import { Judge } from '~/db/types'
import { clearJudgeGroups, listJudgeGroups, listJudges, resetAndOrganizeJudgeGroups } from '~/features/judging/actions'
import { JudgeCreateForm } from '~/features/judging/JudgeCreateForm'
import { JudgeEditForm } from '~/features/judging/JudgeEditForm'
import { JudgeList } from '~/features/judging/JudgeList'
import { MoveJudgeForm } from '~/features/judging/MoveJudgeForm'
import IconTablerHomeMove from '~icons/tabler/home-move'
import IconTablerPlus from '~icons/tabler/plus'
import IconTablerStack2 from '~icons/tabler/stack-2'
import IconTablerTrashX from '~icons/tabler/trash-x'
import IconTablerX from '~icons/tabler/x'

export const route = {
	preload: () => Promise.all([listJudges(), listJudgeGroups()])
} satisfies RouteDefinition

export default function JudgesPage() {
	const allJudges = createAsync(() => listJudges())
	const judgeGroups = createAsync(() => listJudgeGroups())
	const [judgeToEdit, setJudgeToEdit] = createSignal<Judge | null>(null)

	const [judgeToMove, setJudgeToMove] = createSignal<Judge | null>(null)

	let addJudgesModal!: HTMLDialogElement
	let moveJudgeModal!: HTMLDialogElement
	return (
		<div class="drawer drawer-end m-auto flex flex-col items-center justify-center gap-6">
			<input
				/** This is a 'hidden' input that controls the drawer **/
				id="judge-info-drawer"
				type="checkbox"
				class="drawer-toggle"
				hidden
				checked={judgeToEdit() !== null}
				onChange={(e) => !e.currentTarget.checked && setJudgeToEdit(null)} /** Set category to null if drawer is checked off **/
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
														<button
															class="cursor-pointer opacity-0 group-hover:opacity-100"
															aria-label={`Move judge ${j.name} to another group`}
															onClick={() => {
																setJudgeToMove(j)
																moveJudgeModal.showModal()
															}}
														>
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
				<h3 class="my-6 font-semibold">Judge List ({allJudges()?.length})</h3>
				<Show when={allJudges()}>
					<JudgeList judges={allJudges()!} onEditJudge={(j) => setJudgeToEdit(j)} />
				</Show>

				<dialog id="add-judges-modal" class="modal" ref={addJudgesModal}>
					<div class="modal-box h-[600px] max-w-md lg:max-w-lg">
						<div class="flex justify-between">
							<h3 class="mb-4 text-lg font-bold">Add Judges</h3>
							<button class="cursor-pointer" aria-label="Close" onclick={() => addJudgesModal.close()}>
								<IconTablerX />
							</button>
						</div>
						<JudgeCreateForm />
						<form method="dialog" class="modal-action">
							<button class="btn">Close</button>
						</form>
					</div>
				</dialog>

				<dialog id="add-judges-modal" class="modal" ref={moveJudgeModal}>
					<div class="modal-box h-[320px] max-w-md lg:max-w-lg">
						<div class="flex justify-between">
							<h3 class="mb-4 text-lg font-bold">Move Judge {judgeToMove()?.name}</h3>
							<button class="cursor-pointer" aria-label="Close" onclick={() => moveJudgeModal.close()}>
								<IconTablerX />
							</button>
						</div>
						{judgeToMove() && <MoveJudgeForm judge={judgeToMove()!} />}
						<form method="dialog" class="modal-action">
							<button class="btn">Close</button>
						</form>
					</div>
				</dialog>
			</div>
			<div role="dialog" class="drawer-side">
				<label for="judge-info-drawer" class="drawer-overlay"></label>
				<div class="bg-base-100 min-h-full w-full max-w-[500px] p-6">
					<Show when={judgeToEdit()} fallback={<p>No judge selected</p>}>
						<JudgeEditForm judge={judgeToEdit()!} onClose={() => setJudgeToEdit(null)} />
					</Show>
				</div>
			</div>
		</div>
	)
}
