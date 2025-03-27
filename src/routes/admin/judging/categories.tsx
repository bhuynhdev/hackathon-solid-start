import { createAsync, RouteDefinition } from '@solidjs/router'
import { createSignal, For, Match, Show, Switch } from 'solid-js'
import { deleteCategory, getCategoriesQuery } from '~/features/judging/actions'
import { AddCategoriesForm } from '~/features/judging/AddCategoriesForm'
import { CategoryEditForm } from '~/features/judging/CategoryEditForm'
import IconTablerPlus from '~icons/tabler/plus'
import IconTablerTrash from '~icons/tabler/trash'

export const route = {
	preload: () => getCategoriesQuery()
} satisfies RouteDefinition

export default function CategoriesPage() {
	const categories = createAsync(() => getCategoriesQuery())
	const [selectedCategoryId, setSelectedCategoryId] = createSignal<number | null>(null)
	const category = () => categories()?.find((c) => c.id == selectedCategoryId())

	let addCategoriesModal!: HTMLDialogElement
	return (
		<div class="drawer drawer-end m-auto flex flex-col items-center justify-center gap-6">
			<input
				/** This is a 'hidden' input that controls the drawer **/
				id="category-info-drawer"
				type="checkbox"
				class="drawer-toggle"
				hidden
				checked={selectedCategoryId() !== null}
				onChange={(e) => !e.currentTarget.checked && setSelectedCategoryId(null)} /** Set category to null if drawer is checked off **/
			/>
			<div class="drawer-content w-full">
				<div class="flex items-end gap-10">
					<div>
						<h2>Categories</h2>
						<p>Names should appear exactly as in DevPost</p>
					</div>
					<button type="button" class="btn btn-primary btn-outline w-fit" onclick={() => addCategoriesModal.showModal()}>
						<span aria-hidden>
							<IconTablerPlus />
						</span>
						Add categories
					</button>
				</div>
				<table class="mt-6 table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Type</th>
							<th class="sr-only">Edit</th>
							<th class="sr-only">Delete</th>
						</tr>
					</thead>
					<tbody>
						<For each={categories()}>
							{(category) => (
								<tr>
									<td>{category.name}</td>
									<td>
										<Switch>
											<Match when={category.type === 'inhouse'}>
												<span class="badge bg-amber-300">Inhouse</span>
											</Match>
											<Match when={category.type === 'sponsor'}>
												<span class="badge bg-rose-400">Sponsor</span>
											</Match>
											<Match when={category.type === 'general'}>
												<span class="badge bg-gray-200">General</span>
											</Match>
										</Switch>
									</td>
									<td>
										<button type="button" class="btn btn-primary h-8 text-white" onclick={() => setSelectedCategoryId(category.id)}>
											Edit
										</button>
									</td>
									<td class="pl-0">
										<form action={deleteCategory} method="post">
											<input type="hidden" name="categoryId" value={category.id} />
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
				<dialog id="add-categories-modal" class="modal" ref={addCategoriesModal}>
					<div class="modal-box h-[600px] max-w-md lg:max-w-lg">
						<AddCategoriesForm />
						<form method="dialog" class="modal-action">
							<button class="btn">Close</button>
						</form>
					</div>
				</dialog>
			</div>
			<div role="dialog" class="drawer-side">
				<label for="category-info-drawer" class="drawer-overlay"></label>
				<div class="bg-base-100 min-h-full w-full max-w-[500px] p-6">
					<Show when={category()} fallback={<p>No category selected</p>} keyed>
						{(c) => <CategoryEditForm category={c} onClose={() => setSelectedCategoryId(null)} />}
					</Show>
				</div>
			</div>
		</div>
	)
}
