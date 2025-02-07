import { createAsync, query } from '@solidjs/router'
import { renderToString } from 'solid-js/web'
import { TestEmail } from '~/emails/TestEmail'

const getEmailHtml = query(async () => {
	'use server'
	return renderToString(() => <TestEmail />)
}, 'test-email')

export default function EmailsPage() {
	const emailHtml = createAsync(() => getEmailHtml())
	return (
		<div class="flex h-full gap-4">
			<p>Homie</p>
			<div role="tablist" class="tabs tabs-lifted">
				<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Tab 1" checked />
				<div role="tabpanel" class="tab-content rounded-box border-base-300 bg-base-100 p-6">
					Tab content 1
				</div>

				<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Tab 2" />
				<div role="tabpanel" class="tab-content rounded-box border-base-300 bg-base-100 p-6">
					Tab content 2
				</div>

				<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Tab 3" />
				<div role="tabpanel" class="tab-content rounded-box border-base-300 bg-base-100 p-6">
					Tab content 3
				</div>
			</div>
		</div>
	)
}
