import { createAsync } from '@solidjs/router'
import { createSignal, For, Suspense } from 'solid-js'
import { createJudgeGroup, listCategories, listJudgeGroups } from './actions'
import { JudgeGroup } from '~/db/types'

export function JudgeGroupCreateForm() {
	const categories = createAsync(() => listCategories())
	const judgeGroups = createAsync(() => listJudgeGroups())
	const [chosenCategoryId, setChosenCategoryId] = createSignal<number>(1)
	const suggestedGroupName = () => {
		const gs = judgeGroups()
		return gs && chosenCategoryId() ? generateNewJudgeGroupName(gs, chosenCategoryId()) : ''
	}

	return (
		<Suspense>
			<form method="post" action={createJudgeGroup}>
				<label class="fieldset">
					<span class="fieldset-legend text-sm">Name</span>
					<input class="input" name="name" placeholder="B1" value={suggestedGroupName()} required />
					<p class="label">Suggested group name: {suggestedGroupName()}</p>
				</label>

				<label class="fieldset">
					<span class="fieldset-legend text-sm">Category</span>
					<select name="categoryId" class="select w-full" required onChange={(e) => setChosenCategoryId(Number(e.currentTarget.value))}>
						<For each={categories()}>
							{(category, i) => (
								<option value={category.id} selected={i() === 0}>
									{category.name}
								</option>
							)}
						</For>
					</select>
				</label>
				<button type="submit" class="btn btn-primary mt-2 ml-auto block text-white">
					Submit
				</button>
			</form>
		</Suspense>
	)
}

function generateNewJudgeGroupName(currentJudgeGroups: JudgeGroup[], chosenCategoryId: number) {
	// Judge Group name convention (see `resetAndOrganizeJudgeGroups` action):
	// - First char is categoryId converted to ASCII (1 -> A, 2 -> B, etc.)
	// - Second char is the ordering of this group within the category (1st group of cateogyId 1 -> A1, etc.)
	// So we just need to count how many groups are already in current category to be able to derive a next name
	const currentGroupCountInThisCategory = currentJudgeGroups.filter((g) => g.categoryId === chosenCategoryId).length

	const firstChar = String.fromCharCode(64 + chosenCategoryId)
	const secondChar = (currentGroupCountInThisCategory + 1).toString()
	return `${firstChar}${secondChar}`
}
