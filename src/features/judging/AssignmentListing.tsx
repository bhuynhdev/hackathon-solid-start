import { For } from 'solid-js'
import { AssignmentDto } from '~/db/types'

type AssignmentListingProps = {
	assignments: AssignmentDto[]
}

/**
 * Given list of judge groups, display them in a grid of cards, with buttons to create new groups, and move judges
 **/
export function AssignmentListing(props: AssignmentListingProps) {
  const assignmentsByJudgeGroup = () => props.assignments.reduce((map, curr) => {
    if (!map.has(curr.judgeGroupId)) map.set(curr.judgeGroupId, { judgeGroup: curr.judgeGroup, assignments: []} )
    map.get(curr.judgeGroupId)?.assignments.push(curr)
    return map
  }, new Map<number, {judgeGroup: AssignmentDto['judgeGroup'], assignments: AssignmentDto[] }>())

	return (
		<div class="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-6">
			<For each={Array.from(assignmentsByJudgeGroup().values()).toSorted((a, b) => a.judgeGroup.name.localeCompare(b.judgeGroup.name))}>
				{(judgeGroupWithAssignments) => (
					<div class="relative h-fit rounded-xl border border-gray-400 p-4 shadow">
						<p class="ml-2 text-lg font-bold">Group {judgeGroupWithAssignments.judgeGroup.name}</p>
						<p class="ml-2 text-sm font-italic">{judgeGroupWithAssignments.judgeGroup.category.name} ({judgeGroupWithAssignments.assignments.length})</p>
						<div class="mt-2 flex flex-col">
							<For each={judgeGroupWithAssignments.assignments}>
								{(assignment) => (
									<div class="group/judge flex items-center justify-between px-2 py-1 hover:bg-slate-100">
										<p>{assignment.submission.project.name}</p>
									</div>
								)}
							</For>
						</div>
					</div>
				)}
			</For>
		</div>
	)
}
