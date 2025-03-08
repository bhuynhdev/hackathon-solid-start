import { createAsync, RouteDefinition } from '@solidjs/router'
import { For, Switch, Match } from 'solid-js'
import { getCategoriesQuery } from '~/features/judging/actions'
import IconTablerPlus from '~icons/tabler/plus'

export const route = {
	preload: () => getCategoriesQuery()
} satisfies RouteDefinition

export default function CategoriesPage() {
	const categories = createAsync(() => getCategoriesQuery())
	return (
		<>
			<div class="flex items-end gap-10">
				<div>
					<h2>Categories</h2>
					<p>Name should appear exactly as in DevPost</p>
				</div>
				<button type="button" class="btn btn-primary btn-outline w-fit">
					<span aria-hidden>
						<IconTablerPlus />
					</span>
					Add categories
				</button>
			</div>
			<table class="mt-12 table">
				<thead>
					<tr>
						<th>Id</th>
						<th>Name</th>
						<th>Type</th>
						<th class="sr-only">Edit</th>
					</tr>
				</thead>
				<tbody>
					<For each={categories()}>
						{(category) => (
							<tr>
								<th>{category.id}</th>
								<td>{category.name}</td>
								<td>
									<Switch>
										<Match when={category.type === 'inhouse'}>
											<span class="badge bg-amber-300">In-house</span>
										</Match>
										<Match when={category.type === 'sponsor'}>
											<span class="badge bg-rose-400">Sponsor</span>
										</Match>
										<Match when={category.type === 'general'}>
											<span class="badge bg-gray-200">General</span>
										</Match>
									</Switch>
								</td>
								<td>
									<button class="btn btn-primary h-8 text-white">Edit</button>
								</td>
							</tr>
						)}
					</For>
				</tbody>
			</table>
		</>
	)
}
