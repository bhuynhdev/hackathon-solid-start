import { TbSearch } from 'solid-icons/tb'
import { For } from 'solid-js'

export default function ParticipantPage() {
	const data: any = { participants: [] }
	return (
		<div class="drawer drawer-end m-auto flex w-4/5 flex-col items-center justify-center gap-6">
			<input id="participant-info-drawer" type="checkbox" class="drawer-toggle" />
			<div class="drawer-content w-full">
				<form method="get" class="w-full">
					<label class="input input-bordered flex w-full items-center gap-2">
						<TbSearch size="18" />
						<input id="query" type="text" name="q" placeholder="Search" class="grow" autofocus />
					</label>
				</form>
				<table class="table table-auto">
					<thead>
						<tr class="font-bold">
							<th>Id</th>
							<th>First name</th>
							<th>Last name</th>
							<th>Email</th>
							<th>Checked In?</th>
							<th class="sr-only">Edit</th>
						</tr>
					</thead>
					<tbody>
						<For each={data.participants}>
							{(p) => (
								<tr>
									<td>{p.id}</td>
									<td>{p.firstName}</td>
									<td>{p.lastName}</td>
									<td>{p.email}</td>
									<td>{p.checkedIn ? '✅' : '❌'}</td>
									<td>
										<button class="btn btn-primary h-8 min-h-8 text-white">Edit</button>
									</td>
								</tr>
							)}
						</For>
					</tbody>
				</table>
			</div>
			<div class="drawer-side">
				<label for="participant-info-drawer" class="drawer-overlay"></label>
				<div class="min-h-full w-4/5 bg-base-100 p-6 lg:w-2/5 xl:w-1/5">
					<p>Loading state</p>
				</div>
			</div>
		</div>
	)
}
