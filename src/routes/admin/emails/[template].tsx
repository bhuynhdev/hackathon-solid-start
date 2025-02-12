import { createAsync, useParams } from '@solidjs/router'
import { Show } from 'solid-js/web'
import { gatherEmailData } from '~/utils'

const getEmail = async (templateName: string) => {
	'use server'
	console.log('RECEIVED', templateName)
	const emailData = await gatherEmailData()
	return emailData[templateName]
}

export default function EmailsPage() {
	const params = useParams()
	const emailData = createAsync(() => getEmail(params.template))
	return (
		<>
			<h2>Email {params.template}</h2>
			<div class="tabs tabs-border h-full" role="tablist">
				<input type="radio" name="view" class="tab" aria-label="Desktop" role="tab" checked />
				<div class="tab-content bg-base-200 border-base-300 h-full p-6" role="tabpanel">
					<Show when={emailData()} fallback={<p>Loading...</p>}>
						{(info) => <iframe srcdoc={info().html} class="h-full w-full" />}
					</Show>
				</div>

				<input type="radio" name="view" class="tab" aria-label="Mobile" role="tab" />
				<div class="tab-content border-base-300 bg-base-200 p-6" role="tabpanel">
					<Show when={emailData()} fallback={<p>Loading...</p>}>
						{(data) => <iframe srcdoc={data().html} class="mx-auto mt-2 h-full w-full shadow-lg" style={{ height: '932px', width: '430px' }} />}
					</Show>
				</div>

				<input type="radio" name="view" class="tab checked:text-neutral-content [--tab-bg:var(--color-neutral)]" aria-label="JSX" role="tab" />
				<div class="tab-content bg-neutral text-neutral-content border-base-300 p-6" role="tabpanel">
					<pre class="[tab-size:2]">{emailData()?.jsx as string}</pre>
				</div>
			</div>
		</>
	)
}
