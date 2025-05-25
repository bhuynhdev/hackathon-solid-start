import { createAsync } from '@solidjs/router'
import { For, Show, Suspense } from 'solid-js'
import { Judge } from '~/db/types'
import { listJudgeGroups, moveJudge } from './actions'

interface MoveJudgeFormProps {
	judge: Judge
	onClose?: () => void
}

export function MoveJudgeForm(props: MoveJudgeFormProps) {
	const allJudgeGroups = createAsync(() => listJudgeGroups())
	const currentGroup = () => allJudgeGroups()?.filter((g) => g.id === props.judge.judgeGroupId)[0]
	const applicableJudgeGroups = () => allJudgeGroups()?.filter((g) => g.categoryId === props.judge.categoryId && g.id !== props.judge.judgeGroupId)

	return (
		<Suspense>
			<p>
				Current group: {currentGroup()?.name} - {currentGroup()?.category.name}
			</p>
			<Show when={applicableJudgeGroups()?.length} fallback={<p class="my-3">No applicable groups to move to. Consider creating new groups</p>}>
				<form method="post" action={moveJudge}>
					<input type="hidden" name="judgeId" value={props.judge.id} />
					<label class="fieldset">
						<span class="fieldset-legend text-sm">New group</span>
						<select name="newGroupId" class="select w-full" required>
							<For each={applicableJudgeGroups()}>
								{(group, i) => (
									<option value={group.id} selected={i() === 0}>
										{group.name} - {group.category.name}
									</option>
								)}
							</For>
						</select>
					</label>
					<button type="submit" class="btn btn-primary mt-2 ml-auto block text-white">
						Submit
					</button>
				</form>
			</Show>
		</Suspense>
	)
}
