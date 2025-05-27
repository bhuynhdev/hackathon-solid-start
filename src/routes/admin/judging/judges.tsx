import { createAsync, RouteDefinition } from '@solidjs/router'
import { Show } from 'solid-js'
import { clearJudgeGroups, listJudgeGroups, listJudges, resetAndOrganizeJudgeGroups } from '~/features/judging/actions'
import { JudgeCreateForm } from '~/features/judging/JudgeCreateForm'
import { JudgeGroupListing } from '~/features/judging/JudgeGroupListing'
import { JudgeList } from '~/features/judging/JudgeList'
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

	return (
		<>
			<div class="flex items-end gap-10">
				<div>
					<h2>Judges</h2>
				</div>
				<div class="flex gap-4">
					<AddJudgesButtonAndModal />
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
					<Show when={judgeGroups()}>
						<JudgeGroupListing judgeGroups={judgeGroups()!} />
					</Show>
				</div>
			</Show>
			<h3 class="my-6 font-semibold">Judge List ({allJudges()?.length})</h3>
			<Show when={allJudges()}>
				<JudgeList judges={allJudges()!} />
			</Show>
		</>
	)
}

function AddJudgesButtonAndModal() {
	let addJudgesModal!: HTMLDialogElement

	return (
		<>
			<button type="button" class="btn btn-primary btn-outline w-fit" onclick={() => addJudgesModal.showModal()}>
				<span aria-hidden>
					<IconTablerPlus />
				</span>
				Add judges
			</button>
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
		</>
	)
}
