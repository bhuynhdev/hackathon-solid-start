import { createAsync } from '@solidjs/router'
import { For, Suspense } from 'solid-js'
import { Judge } from '~/db/schema'
import IconTablerX from '~icons/tabler/x'
import { getCategoriesQuery, updateJudge } from './actions'

interface JudgeEditFormProps {
	judge: Judge
	onClose: () => void
}

export function JudgeEditForm(props: JudgeEditFormProps) {
	const categories = createAsync(() => getCategoriesQuery())
	return (
		<Suspense>
			<section>
				<header class="flex w-full justify-between">
					<h3 class="text-lg font-bold">Edit Judge</h3>
					<button aria-label="Close" type="button" onclick={props.onClose} class="cursor-pointer">
						<IconTablerX width="32" height="32" />
					</button>
				</header>
				<form method="post" class="border-base-300 mt-4 rounded-md border" action={updateJudge}>
					<header class="bg-gray-200 px-4 py-3">
						<h3 class="font-semibold">Judge Info</h3>
					</header>
					<div class="p-4">
						<input type="hidden" name="judgeId" value={props.judge.id} />
						<label class="fieldset">
							<span class="fieldset-legend text-sm">Name</span>
							<input type="text" class="input w-full" name="name" value={props.judge.name} required />
						</label>
						<label class="fieldset">
							<span class="fieldset-legend text-sm">Email</span>
							<input type="email" class="input w-full" name="email" value={props.judge.email} required />
						</label>
						<label class="fieldset">
							<span class="fieldset-legend text-sm">Category</span>
							<select name="categoryId" class="select w-full" required>
								<For each={categories()}>
									{(category) => (
										<option value={category.id} selected={category.id === props.judge.categoryId}>
											{category.name}
										</option>
									)}
								</For>
							</select>
						</label>
						<button type="submit" class="btn btn-primary mt-2 ml-auto block text-white">
							Save Changes
						</button>
					</div>
				</form>
			</section>
		</Suspense>
	)
}
