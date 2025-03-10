import IconTablerInfoCircle from '~icons/tabler/info-circle'
import { bulkCreateCategories } from './actions'

interface AddCategoriesFormProps {
	isInModal?: boolean
}

export function AddCategoriesForm(props: AddCategoriesFormProps) {
	let formRef!: HTMLFormElement
	return (
		<>
			<h3 class="mb-4 text-lg font-bold">Add Categories</h3>
			<div class="tabs tabs-lift">
				<input type="radio" name="my_tabs_2" class="tab" aria-label="Manual entry" />
				<div class="tab-content border-base-300 bg-base-100 p-5">Tab content 1</div>

				<input type="radio" name="my_tabs_2" class="tab" aria-label="Bulk entry" checked />
				<div class="tab-content border-base-300 bg-base-100 p-5">
					<form method="post" class="space-y-3" action={bulkCreateCategories} enctype="multipart/form-data" ref={formRef}>
						<p>Upload categories data as a CSV file</p>
						<input type="file" name="csvFile" class="file-input" aria-label="Upload CSV file" />
						<p>Or enter categories as comma-separated strings</p>
						<textarea
							aria-label="Categories string input"
							name="csvText"
							class="textarea w-full"
							placeholder="category1,sponsor&#10;category2,inhouse"
						/>
						<div class="space-x-3 text-right">
							<button type="submit" class="btn btn-neutral btn-outline" onclick={() => formRef.reset()}>
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
