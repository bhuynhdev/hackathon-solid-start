import { createAsync, RouteDefinition } from '@solidjs/router';
import { For, Switch, Match, createSignal, Show } from 'solid-js';
import { deleteJudge, getCategoriesQuery, getJudgesQuery } from '~/features/judging/actions';
import { AddJudgesForm } from '~/features/judging/AddJudgeForm';
import IconTablerPlus from '~icons/tabler/plus';
import IconTablerTrash from '~icons/tabler/trash';

export const route = {
  preload: () => getJudgesQuery(),
} satisfies RouteDefinition;

export default function JudgesPage() {
  const judges = createAsync(() => getJudgesQuery());
  const categories = createAsync(() => getCategoriesQuery());
  const [selectedJudgeId, setSelectedJudgeId] = createSignal<number | null>(null);
  const judge = () => judges()?.find((p) => p.id == selectedJudgeId());

  let addCategoriesModal!: HTMLDialogElement;
  return (
    <div class="drawer drawer-end m-auto flex flex-col items-center justify-center gap-6">
      <input
        id="participant-info-drawer"
        type="checkbox"
        class="drawer-toggle"
        aria-hidden
        checked={selectedJudgeId() !== null}
        onChange={(e) => !e.currentTarget.checked && setSelectedJudgeId(null)}
      />

      <div class="drawer-content w-full">
        <div class="flex items-end gap-10">
          <div>
            <h2>Judges</h2>
          </div>
          <button
            type="button"
            class="btn btn-primary btn-outline w-fit"
            onclick={() => addCategoriesModal.showModal()}
          >
            <span aria-hidden>
              <IconTablerPlus />
            </span>
            Add judges
          </button>
        </div>
        <table class="mt-6 table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Category ID</th>
              <th class="sr-only">Edit</th>
              <th class="sr-only">Delete</th>
            </tr>
          </thead>
          <tbody>
            <For each={judges()}>
              {(judge) => (
                <tr>
                  <td>{judge.name}</td>
                  <td>{judge.email}</td>
                  <td>{categories()?.find(c => c.id === judge.categoryId)?.name}</td>
                  <td>
                    <button
                      type="button"
                      class="btn btn-primary h-8 text-white"
                      onclick={() => setSelectedJudgeId(judge.id)}
                    >
                      Edit
                    </button>
                  </td>
                  <td class="pl-0">
                    <form action={deleteJudge} method="post">
                      <input type="hidden" name="judgeId" value={judge.id} />
                      <button type="submit" class="btn btn-error btn-soft h-8" aria-label="Delete">
                        <span class="hidden md:inline">Delete </span>
                        <span>
                          <IconTablerTrash />
                        </span>
                      </button>
                    </form>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <dialog
          id="add-judges-modal"
          class="modal"
          ref={addCategoriesModal}
        >
          <div class="modal-box h-[600px] max-w-md lg:max-w-lg">
            <Show when={categories()}>{categories => <AddJudgesForm categories={categories()} />}</Show>
          </div>
        </dialog>
      </div>
      <div role="dialog" class="drawer-side">
        <label for="participant-info-drawer" class="drawer-overlay"></label>
        <div class="bg-base-100 min-h-full w-full max-w-[500px] p-6">
          <Show when={judge()} fallback={<p>No judge selected</p>} keyed>
            {(c) => (
              // <CategoryEditForm
              //   category={{ id: c.id, name: c.name }}
              //   onClose={() => setSelectedJudgeId(null)}
              // />
              <pre>Judge form here</pre>
            )}
          </Show>
        </div>
      </div>
    </div>
  );
}