import { Category } from '~/db/schema'
import { updateCategory } from './actions'
import IconTablerX from '~icons/tabler/x'

interface CategoryEditFormProps {
	category: Category
	onClose: () => void
}

export function CategoryEditForm(props: CategoryEditFormProps) {
	return (
		<section>
			<header class="flex w-full justify-between">
				<h3 class="text-lg font-bold">Edit Category</h3>
				<button aria-label="Close" type="button" onclick={props.onClose} class="cursor-pointer">
					<IconTablerX width="32" height="32" />
				</button>
			</header>
			<form method="post" class="border-base-300 mt-4 rounded-md border" action={updateCategory}>
				<header class="bg-gray-200 px-4 py-3">
					<h3 class="font-semibold">Category Info</h3>
				</header>
				<div class="p-4">
					<input type="hidden" name="categoryId" value={props.category.id} />
					<label class="fieldset">
						<span class="fieldset-legend text-sm">Name</span>
						<input class="input w-full" name="categoryName" value={props.category.name} />
					</label>
					<fieldset class="fieldset">
						<legend class="fieldset-legend text-sm">Type</legend>
						<label class="flex items-center gap-2">
							<input type="radio" name="categoryType" value="sponsor" class="radio radio-sm" checked={props.category.type === 'sponsor'} />
							<span class="text-base">Sponsor</span>
						</label>
						<label class="flex items-center gap-2">
							<input type="radio" name="categoryType" value="inhouse" class="radio radio-sm" checked={props.category.type === 'inhouse'} />
							<span class="text-base">In-house</span>
						</label>
						<label class="flex items-center gap-2">
							<input type="radio" name="categoryType" value="general" class="radio radio-sm" checked={props.category.type === 'general'} />
							<span class="text-base">General</span>
						</label>
					</fieldset>
					<button type="submit" class="btn btn-primary ml-auto block text-white">
						Save Changes
					</button>
				</div>
			</form>
		</section>
	)
}
