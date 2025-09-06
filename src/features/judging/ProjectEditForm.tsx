import { createAsync } from '@solidjs/router'
import { For, Match, Show, Suspense, Switch } from 'solid-js'
import { ProjectWithSubmission } from '~/db/types'
import IconTablerX from '~icons/tabler/x'
import { listCategories, toggleProjectDisqualification, updateProjectInfo } from './actions'

interface ProjectEditFormProps {
	project: ProjectWithSubmission
	onClose: () => void
}

export function ProjectEditForm(props: ProjectEditFormProps) {
	const categories = createAsync(() => listCategories())
	const submittedCategories = () => props.project.submissions.map((s) => s.categoryId)
	return (
		<Suspense>
			<section>
				<header class="flex w-full justify-between">
					<h3 class="text-lg font-bold">Edit Project</h3>
					<button aria-label="Close" type="button" onclick={props.onClose} class="cursor-pointer">
						<IconTablerX width="32" height="32" />
					</button>
				</header>
				<form method="post" class="border-base-300 mt-4 rounded-md border" action={updateProjectInfo}>
					<header class="bg-gray-200 px-4 py-3">
						<h3 class="font-semibold">Project Info</h3>
					</header>
					<div class="p-4">
						<input type="hidden" name="projectId" value={props.project.id} />
						<div class="fieldset">
							<span class="fieldset-legend text-sm">DevPost URL</span>
							<Show when={props.project.url} fallback=<p>No Submisison URL</p>>
								{(url) => (
									<a class="link link-primary text-sm" href={url()} target="_blank">
										{url().replace(/^https?:\/\//, '')}
									</a>
								)}
							</Show>
						</div>

						<label class="fieldset">
							<span class="fieldset-legend text-sm">Name</span>
							<input type="text" class="input w-full" name="name" value={props.project.name} required />
						</label>
						<label class="fieldset">
							<span class="fieldset-legend text-sm">Location</span>
							<input type="text" class="input w-full" name="location" value={props.project.location} required />
						</label>
						<label class="fieldset">
							<span class="fieldset-legend text-sm">Categories</span>
							<select name="categoryIds" class="select h-auto w-full" multiple required size={categories()?.length}>
								<For each={categories()}>
									{(category) => (
										<option value={category.id} selected={submittedCategories().includes(category.id)}>
											{category.name}
										</option>
									)}
								</For>
							</select>
						</label>
						<button type="submit" class="btn btn-primary mt-2 ml-auto block text-white">
							Save Changes
						</button>
					</div>
				</form>

				<form method="post" class="border-base-300 mt-4 rounded-md border" action={toggleProjectDisqualification}>
					<header class="bg-gray-200 px-4 py-3">
						<h3 class="font-semibold">Disqualification</h3>
					</header>
					<div class="p-4">
						<p class="text-sm font-semibold">
							Status:{' '}
							<Switch>
								<Match when={props.project.status === 'disqualified'}>
									<span class="badge bg-red-400">{props.project.status}</span>
								</Match>
								<Match when={props.project.status !== 'disqualified'}>
									<span class="badge badge-neutral badge-soft">{props.project.status}</span>
								</Match>
							</Switch>
						</p>
						<input type="hidden" name="projectId" value={props.project.id} />
						<Switch>
							<Match when={props.project.status === 'disqualified'}>
								<label class="fieldset">
									<span class="fieldset-legend text-sm">Disqualification reason</span>
									<input type="text" class="input w-full" name="disqualifyReason" value={props.project.disqualifyReason ?? ''} required />
								</label>
								<div class="mt-2 flex justify-end gap-3">
									<button type="submit" name="update-disqualify-reason-only" value="true" class="btn btn-primary btn-outline">
										Update disqualifcation reason
									</button>
									<button type="submit" class="btn btn-primary text-white">
										Re-qualify
									</button>
								</div>
							</Match>
							<Match when={props.project.status !== 'disqualified'}>
								<label class="fieldset">
									<span class="fieldset-legend text-sm">Disqualification reason</span>
									<input type="text" class="input w-full" name="disqualifyReason" value={props.project.disqualifyReason ?? ''} required />
								</label>
								<button type="submit" class="btn btn-error mt-2 ml-auto block text-white">
									Disqualify
								</button>
							</Match>
						</Switch>
					</div>
				</form>
			</section>
		</Suspense>
	)
}
