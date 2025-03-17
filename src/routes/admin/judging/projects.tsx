import { createAsync, RouteDefinition } from '@solidjs/router'
import { createSignal, For, Show } from 'solid-js'
import { deleteProject, getCategoriesQuery, getProjectsQuery } from '~/features/judging/actions'
import IconTablerPlus from '~icons/tabler/plus'
import IconTablerX from '~icons/tabler/x'

export const route = {
	preload: () => {
		getProjectsQuery()
		getCategoriesQuery()
	}
} satisfies RouteDefinition

export default function ProjectsPage() {
	const projects = createAsync(() => getProjectsQuery())
	const categories = createAsync(() => getCategoriesQuery())
	// Map each category ID to its name
	const categoryNameMap = () => categories()?.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.name }), {} as Record<number, string>)
	const [selectedProjectId, setSelectedProjectId] = createSignal<number | null>(null)
	const project = () => projects()?.find((p) => p.id == selectedProjectId())

	let addProjectsModal!: HTMLDialogElement
	return (
		<div class="drawer drawer-end m-auto flex flex-col items-center justify-center gap-6">
			<input
				id="participant-info-drawer"
				type="checkbox"
				class="drawer-toggle"
				aria-hidden
				checked={selectedProjectId() !== null}
				onChange={(e) => !e.currentTarget.checked && setSelectedProjectId(null)}
			/>

			<div class="drawer-content w-full">
				<div class="flex items-end gap-10">
					<div>
						<h2>Projects</h2>
					</div>
					<button type="button" class="btn btn-primary btn-outline w-fit" onclick={() => addProjectsModal.showModal()}>
						<span aria-hidden>
							<IconTablerPlus />
						</span>
						Add projects
					</button>
				</div>
				<table class="mt-6 table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Categories</th>
							<th class="sr-only">Edit</th>
							<th class="sr-only">Disqualify</th>
						</tr>
					</thead>
					<tbody>
						<For each={projects()}>
							{(project) => (
								<tr>
									<td>{project.name}</td>
									<td>{project.submissions.map(({ categoryId }) => categoryNameMap()?.[categoryId])}</td>
									<td>
										<button type="button" class="btn btn-primary h-8 text-white" onclick={() => setSelectedProjectId(project.id)}>
											Edit
										</button>
									</td>
									<td class="pl-0">
										<form action={deleteProject} method="post">
											<input type="hidden" name="projectId" value={project.id} />
											<button type="submit" class="btn btn-error btn-soft h-8" aria-label="Delete">
												<span class="hidden md:inline">Delete </span>
												<span>
													<IconTablerX />
												</span>
											</button>
										</form>
									</td>
								</tr>
							)}
						</For>
					</tbody>
				</table>
				<dialog id="add-projects-modal" class="modal" ref={addProjectsModal}>
					<div class="modal-box h-[600px] max-w-md lg:max-w-lg">
						{/* 		<Show when={categories()}>{(categories) => <AddProjectsForm categories={categories()} />}</Show> */}
					</div>
				</dialog>
			</div>
			<div role="dialog" class="drawer-side">
				<label for="participant-info-drawer" class="drawer-overlay"></label>
				<div class="bg-base-100 min-h-full w-full max-w-[500px] p-6">
					<Show when={project()} fallback={<p>No project selected</p>} keyed>
						{(c) => (
							// <CategoryEditForm
							//   category={{ id: c.id, name: c.name }}
							//   onClose={() => setSelectedProjectId(null)}
							// />
							<pre>Project form here</pre> // Update form component
						)}
					</Show>
				</div>
			</div>
		</div>
	)
}
