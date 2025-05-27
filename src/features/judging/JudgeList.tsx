import { createSignal, For, Match, Show, Switch } from 'solid-js'
import { JudgeWithCategory } from '~/db/types'
import IconTablerTrash from '~icons/tabler/trash'
import { deleteJudge } from './actions'
import { JudgeEditForm } from './JudgeEditForm'

type JudgeListProps = {
	judges: JudgeWithCategory[]
	allowEditJudge?: boolean
}

/**
 * Given a list of judges, display a table, with buttons to Edit and Delete each judge
 **/
export function JudgeList(props: JudgeListProps) {
	const [judgeToEdit, setJudgeToEdit] = createSignal<JudgeWithCategory | null>(null)
	const allowEditJudge = () => props.allowEditJudge ?? true
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
				<table class="table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Category</th>
							<th>Email</th>
							{allowEditJudge() && <th class="sr-only">Edit</th>}
							<th class="sr-only">Delete</th>
						</tr>
					</thead>
					<tbody>
						<For each={props.judges}>
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
									{allowEditJudge() && (
										<td>
											<button type="button" class="btn btn-primary h-8 text-white" onclick={() => setJudgeToEdit(judge)}>
												Edit
											</button>
										</td>
									)}
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
