import IconTablerInfoCircle from '~icons/tabler/info-circle'
import { bulkCreateCategories } from './actions'

interface AddCategoriesFormProps {
	isInModal?: boolean
}

export function AddCategoriesForm(props: AddCategoriesFormProps) {
	return (
		<>
			<h3 class="mb-4 text-lg font-bold">Add Categories</h3>
			<div class="tabs tabs-lift">
				<input type="radio" name="my_tabs_2" class="tab" aria-label="Manual entry" />
				<div class="tab-content border-base-300 bg-base-100 p-5">Tab content 1</div>

				<input type="radio" name="my_tabs_2" class="tab" aria-label="Bulk entry" checked />
				<div class="tab-content border-base-300 bg-base-100 p-5">
					<form method="post" class="space-y-3" action={bulkCreateCategories} enctype="multipart/form-data">
						<p>Upload categories data as a CSV file</p>
						<input type="file" name="csvFile" class="file-input" aria-label="Upload CSV file" />
						<p>Or enter categories as comma-separated strings</p>
						<textarea
							aria-label="Categories string input"
							name="csvText"
							class="textarea w-full"
							placeholder="category1,sponsor&#10;category2,inhouse"
						/>
						<button type="submit" class="btn btn-primary ml-auto block">
							Submit
						</button>
						<div class="rounded-md border border-blue-400 bg-blue-100 p-3 text-sm">
							<p class="font-semibold">
								<IconTablerInfoCircle class="inline align-text-bottom" /> CSV format
							</p>
							<p>First column is category name</p>
							<p>Second column is type - 'sponsor' or 'inhouse'</p>
						</div>
					</form>
				</div>
			</div>
		</>
	)
}
