import { createAsync } from '@solidjs/router'
import IconTablerInfoCircle from '~icons/tabler/info-circle'
import { createProjectAndSubmissions, importProjectsFromDevpost, listCategories } from './actions'
import { Suspense } from 'solid-js'

export function AddProjectsForm() {
	const categories = createAsync(() => listCategories())
	let importCsvFormRef!: HTMLFormElement
	return (
		<Suspense>
			<div class="tabs tabs-lift">
				<input type="radio" name="add_judges_form_tab" class="tab" aria-label="Manual entry" checked />
				<div class="tab-content border-base-300 bg-base-100 p-5">
					<form method="post" action={createProjectAndSubmissions} class="space-y-4" autocomplete="off">
						<div class="grid grid-cols-[7rem_1fr] items-center">
							<span class="text-sm">Project Name</span>
							<input class="input" name="name" placeholder="Cookie Clicker" required aria-label="Project name" />
						</div>
						<div class="grid grid-cols-[7rem_1fr] items-center">
							<span class="text-sm">Location</span>
							<input class="input" name="location" placeholder="25" type="text" required />
						</div>
						<div class="grid grid-cols-[7rem_1fr] items-center">
							<span class="text-sm">Location 2</span>
							<input class="input" name="location2" type="text" />
						</div>
						<div class="grid grid-cols-[7rem_1fr] items-center">
							<span class="text-sm">Categories</span>
							<select class="select h-auto" name="categoryIds" aria-label="Categories" multiple size={categories()?.length}>
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
					<form method="post" class="space-y-3" action={importProjectsFromDevpost} enctype="multipart/form-data" ref={importCsvFormRef}>
						<p>Upload projects CSV from DevPost</p>
						<input type="file" name="csvFile" class="file-input" aria-label="Upload Projects CSV file from DevPost" />
						<div class="space-x-3 text-right">
							<button type="submit" class="btn btn-neutral btn-outline" onclick={() => importCsvFormRef.reset()}>
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
