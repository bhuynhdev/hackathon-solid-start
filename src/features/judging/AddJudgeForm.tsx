import { createAsync } from '@solidjs/router'
import IconTablerInfoCircle from '~icons/tabler/info-circle'
import { createJudge, createJudgesBulk, getCategoriesQuery } from './actions'

export function AddJudgesForm() {
	const categories = createAsync(() => getCategoriesQuery())
	let bulkEntryFormRef!: HTMLFormElement
	return (
		<>
			<h3 class="mb-4 text-lg font-bold">Add Judges</h3>
			<div class="tabs tabs-lift">
				<input type="radio" name="add_judges_form_tab" class="tab" aria-label="Manual entry" checked />
				<div class="tab-content border-base-300 bg-base-100 p-5">
					<form method="post" action={createJudge} class="space-y-4">
						<div class="grid grid-cols-[7rem_1fr] items-center">
							<span class="text-sm">Judge Name</span>
							<input class="input" name="name" placeholder="Best Education Judge" required />
						</div>
						<div class="grid grid-cols-[7rem_1fr] items-center">
							<span class="text-sm">Email</span>
							<input class="input" name="email" placeholder="best@education.com" type="email" required />
						</div>
						<div class="grid grid-cols-[7rem_1fr] items-center">
							<span class="text-sm">Category</span>
							<select class="select" name="categoryId">
								{categories()?.map((category) => <option value={category.id}>{category.name}</option>)}
							</select>
						</div>
						<button type="submit" class="btn btn-primary ml-auto block">
							Submit
						</button>
					</form>
				</div>

				<input type="radio" name="add_judges_form_tab" class="tab" aria-label="Bulk entry" />
				<div class="tab-content border-base-300 bg-base-100 p-5">
					<form method="post" action={createJudgesBulk} enctype="multipart/form-data" ref={bulkEntryFormRef}>
						<p>Upload judges data as a CSV file</p>
						<input type="file" name="csvFile" class="file-input" aria-label="Upload CSV file" />
						<p>Or enter judges as comma-separated strings</p>
						<textarea
							aria-label="Judges string input"
							name="csvText"
							class="textarea w-full"
							placeholder="judge1,judge2&#10;email1,email2"
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
							<p>First column: Judge's name</p>
							<p>Second column: Email</p>
							<p>Third column: Category ID</p>
							<p>
								<span class="font-semibold">Note:</span> Don't provide headers. Entries will override existing judges if same name
							</p>
						</div>
					</form>
				</div>
			</div>
		</>
	)
}
