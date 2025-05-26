import { For, Match, Switch } from 'solid-js'
import { JudgeWithCategory } from '~/db/types'
import IconTablerTrash from '~icons/tabler/trash'
import { deleteJudge } from './actions'

type JudgeListProps = {
	judges: JudgeWithCategory[]
	onEditJudge?: (judge: JudgeWithCategory) => void
}

export function JudgeList(props: JudgeListProps) {
	const allowEditJudge = () => !!props.onEditJudge
	return (
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
									<button type="button" class="btn btn-primary h-8 text-white" onclick={() => props.onEditJudge && props.onEditJudge(judge)}>
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
	)
}
