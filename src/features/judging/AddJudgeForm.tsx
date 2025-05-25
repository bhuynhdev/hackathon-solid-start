import { createAsync } from '@solidjs/router'
import IconTablerInfoCircle from '~icons/tabler/info-circle'
import { createJudge, createJudgesBulk, listCategories } from './actions'
import { Suspense } from 'solid-js'

export function AddJudgesForm() {
	const categories = createAsync(() => listCategories())
	let bulkEntryFormRef!: HTMLFormElement
	return (
		<Suspense>
			<div class="tabs tabs-lift">
				<input type="radio" name="add_judges_form_tab" class="tab" aria-label="Manual entry" checked />
				<div class="tab-content border-base-300 bg-base-100 p-5">
					<form method="post" action={createJudge} class="space-y-4">
						<div class="grid grid-cols-[7rem_1fr] items-center">
							<span class="text-sm">Judge Name</span>
							<input class="input" name="name" placeholder="John Doe" required />
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
					<form method="post" class="space-y-3" action={createJudgesBulk} enctype="multipart/form-data" ref={bulkEntryFormRef}>
						<p>Upload judges data as a CSV file</p>
						<input type="file" name="csvFile" class="file-input" aria-label="Upload CSV file" />
						<p>Or enter judges as comma-separated strings</p>
						<textarea
							aria-label="Judges string input"
							name="csvText"
							class="textarea w-full"
							placeholder="judge1,email1&#10;judge2,email2"
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
							<p>1st column: Judge name</p>
							<p>2nd column: Email</p>
							<p>Edit judges' categories after creation</p>
							<p>
								<span class="font-semibold">Note:</span> Don't provide headers. Entries will override existing judges if same email
							</p>
						</div>
					</form>
				</div>
			</div>
		</Suspense>
	)
}
