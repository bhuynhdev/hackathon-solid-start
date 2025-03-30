import { createAsync, RouteDefinition } from '@solidjs/router'
import { createSignal, For, Show } from 'solid-js'
import { deleteProject, getCategoriesQuery, getProjectsQuery } from '~/features/judging/actions'
import { AddProjectsForm } from '~/features/judging/AddProjectsForm'
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
				id="project-info-drawer"
				type="checkbox"
				class="drawer-toggle"
				hidden
				checked={selectedProjectId() !== null}
				onChange={(e) => !e.currentTarget.checked && setSelectedProjectId(null)}
			/>

			<div class="drawer-content w-full">
				<div class="flex items-end gap-10">
					<div>
						<h2>Projects</h2>
					</div>
					<button type="button" class="btn btn-primary btn-outline w-fit" onclick={() => addProjectsModal.showModal()}>
						<span aria-hidden="true">
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
									<td>{project.submissions.map(({ categoryId }) => categoryNameMap()?.[categoryId]).join(', ')}</td>
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
						<div class="flex justify-between">
							<h3 class="mb-4 text-lg font-bold">Add Judges</h3>
							<button class="cursor-pointer" aria-label="Close" onclick={() => addProjectsModal.close()}>
								<IconTablerX />
							</button>
						</div>
						<AddProjectsForm />
						<form method="dialog" class="modal-action">
							<button class="btn">Close</button>
						</form>
					</div>
				</dialog>
			</div>
			<div role="dialog" class="drawer-side">
				<label for="project-info-drawer" class="drawer-overlay"></label>
				<div class="bg-base-100 min-h-full w-full max-w-[500px] p-6">
					{/* <Show when={project()} fallback={<p>No project selected</p>} keyed> */}
					{/* 	{(p) => <ProjectEditForm project={p} onClose={() => setSelectedProjectId(null)} />} */}
					{/* </Show> */}
				</div>
			</div>
		</div>
	)
}
