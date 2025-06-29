import { createAsync, RouteDefinition } from '@solidjs/router'
import { Show } from 'solid-js'
import { assignSubmissionsToJudgeGroups, listAssignments } from '~/features/judging/actions'
import { AssignmentListing } from '~/features/judging/AssignmentListing'
import IconTablerStack2 from '~icons/tabler/stack-2'

export const route = {
	preload: () => listAssignments()
} satisfies RouteDefinition

export default function JudgesPage() {
	const assignments = createAsync(() => listAssignments())

	return (
		<>
			<div class="flex items-end gap-10">
				<div>
					<h2>Assignments</h2>
				</div>
				<div class="flex gap-4">
					<form action={assignSubmissionsToJudgeGroups} method="post">
						<button type="submit" class="btn btn-primary btn-outline w-fit">
							<span aria-hidden>
								<IconTablerStack2 />
							</span>
              Assign projects to groups
						</button>
					</form>
					{/* <form action={clearJudgeGroups} method="post" hidden={!judgeGroups()?.length}> */}
					{/* 	<button type="submit" class="btn btn-error btn-outline w-fit"> */}
					{/* 		<span aria-hidden> */}
					{/* 			<IconTablerTrashX /> */}
					{/* 		</span> */}
					{/* 		Delete all judge group */}
					{/* 	</button> */}
					{/* </form> */}
				</div>
			</div>
			<Show when={assignments()?.length}>
				<div>
					<h3 class="my-4 font-semibold">Assignments ({assignments()?.length})</h3>
						<AssignmentListing assignments={assignments()!} />
				</div>
			</Show>
		</>
	)
}
