import { createSignal, For } from 'solid-js'
import { Judge, JudgeGroupWithJudges } from '~/db/types'
import IconTablerHomeMove from '~icons/tabler/home-move'
import IconTablerX from '~icons/tabler/x'
import { MoveJudgeForm } from './MoveJudgeForm'

type JudgeGroupListingProps = {
	judgeGroups: JudgeGroupWithJudges[]
}

/**
 * Given list of judge groups, display them in a grid of cards, with buttons to create new groups, and move judges
 **/
export function JudgeGroupListing(props: JudgeGroupListingProps) {
	const [judgeToMove, setJudgeToMove] = createSignal<Judge | null>(null)
	let moveJudgeModal!: HTMLDialogElement

	return (
		<div class="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-6">
			<For each={props.judgeGroups}>
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
	)
}
