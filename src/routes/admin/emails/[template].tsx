import emails from '@emailtemplates/emails.json'
import { useParams } from '@solidjs/router'
import { Show } from 'solid-js/web'

export default function EmailsPage() {
	const params = useParams()
	const emailData = () => emails[params.template as keyof typeof emails]
	return (
		<>
			<h2>{params.template}</h2>
			<div class="tabs tabs-lift h-[calc(100%-60px)]" role="tablist">
				<input type="radio" name="view" class="tab [--tab-bg:var(--color-base-200)]" aria-label="Desktop" role="tab" checked />
				<div class="tab-content bg-base-200 border-base-300 p-6" role="tabpanel">
					<Show when={emailData()} fallback={<p>Loading...</p>}>
						{(data) => <iframe srcdoc={data().html} class="h-full w-full rounded-md shadow-sm" />}
					</Show>
				</div>

				<input type="radio" name="view" class="tab [--tab-bg:var(--color-base-200)]" aria-label="Mobile" role="tab" />
				<div class="tab-content border-base-300 bg-base-200 p-6" role="tabpanel">
					<Show when={emailData()} fallback={<p>Loading...</p>}>
						{(data) => (
							<iframe srcdoc={data().html} class="mx-auto mt-2 h-full w-full rounded-md shadow-sm" style={{ height: '932px', width: '430px' }} />
						)}
					</Show>
				</div>

				<input type="radio" name="view" class="tab checked:text-neutral-content [--tab-bg:var(--color-neutral)]" aria-label="JSX" role="tab" />
				<div class="tab-content bg-neutral text-neutral-content border-base-300 p-6" role="tabpanel">
					<Show when={emailData()} fallback={<pre>Loading...</pre>}>
						<pre class="[tab-size:2]">{emailData().jsx}</pre>
					</Show>
				</div>
			</div>
		</>
	)
}
