import IconTablerInfoCircle from '~icons/tabler/info-circle'
import { createCategoriesBulk, createCategory } from './actions'
import { For } from 'solid-js'
import { categoryTypes } from '~/db/schema'

interface AddCategoriesFormProps {
	isInModal?: boolean
}

export function AddCategoriesForm(props: AddCategoriesFormProps) {
	let bulkEntryFormRef!: HTMLFormElement
	return (
		<>
			<div class="tabs tabs-lift">
				<input type="radio" name="add_categories_form_tab" class="tab" aria-label="Manual entry" checked />
				<div class="tab-content border-base-300 bg-base-100 p-5">
					<form method="post" class="space-y-4" action={createCategory}>
						<label class="grid grid-cols-1 items-center gap-2 md:grid-cols-[3rem_1fr]">
							<span class="text-sm">Name</span>
							<input class="input" name="categoryName" placeholder="Best Education Hack" required />
						</label>
						<fieldset class="grid grid-cols-1 items-center gap-2 md:grid-cols-[3rem_1fr]">
							<legend class="contents text-sm">Type</legend>
							<div class="flex gap-2 sm:gap-4">
								<For each={categoryTypes}>
									{(categoryType, index) => (
										<label>
											<input type="radio" class="radio radio-xs mr-1.5" name="categoryType" value={categoryType} checked={index() === 1} />
											<span class="capitalize">{categoryType}</span>
										</label>
									)}
								</For>
							</div>
						</fieldset>
						<button type="submit" class="btn btn-primary ml-auto block">
							Submit
						</button>
					</form>
				</div>

				<input type="radio" name="add_categories_form_tab" class="tab" aria-label="Bulk entry" />
				<div class="tab-content border-base-300 bg-base-100 p-5">
					<form method="post" class="space-y-3" action={createCategoriesBulk} enctype="multipart/form-data" ref={bulkEntryFormRef}>
						<p>Extract categories from DevPost Projects CSV</p>
						<input type="file" name="devPostProjectsFile" class="file-input" aria-label="Upload DevPost Projects CSV" />
						<p>Or enter categories as comma-separated strings</p>
						<textarea
							aria-label="Categories string input"
							name="csvText"
							class="textarea w-full"
							placeholder="category1,sponsor&#10;category2,inhouse"
						/>
						<div class="space-x-3 text-right">
							<button type="submit" class="btn btn-neutral btn-outline" onclick={() => bulkEntryFormRef.reset()}>
								Reset
							</button>
							<button type="submit" class="btn btn-primary">
								Submit
							</button>
						</div>
						<div class="rounded-md border border-blue-400 bg-blue-100 p-3 text-sm">
							<p class="font-semibold">
								<IconTablerInfoCircle class="inline align-text-bottom" /> CSV format
							</p>
							<p>First column: category name</p>
							<p>Second column: type - 'sponsor' or 'inhouse'</p>
							<p>
								<span class="font-semibold">Note:</span> Don't provide headers. Entries will override existing categories if same name
							</p>
						</div>
					</form>
				</div>
			</div>
		</>
	)
}
