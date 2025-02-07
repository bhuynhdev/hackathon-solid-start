import { createAsync, query } from '@solidjs/router'
import { renderToString } from 'solid-js/web'
import { TestEmail } from '~/emails/TestEmail'

const getEmailHtml = query(async () => {
	'use server'
	return renderToString(() => <TestEmail />)
}, 'test-email')

export default function EmailsPage() {
	return (
		<div class="tabs tabs-lift">
			<input type="radio" name="my_tabs_3" class="tab" aria-label="Tab 1" checked />
			<div class="tab-content bg-base-100 border-base-300 p-6">Tab content 1</div>

			<input type="radio" name="my_tabs_3" class="tab" aria-label="Tab 2" />
			<div class="tab-content bg-base-100 border-base-300 p-6">Tab content 2</div>

			<input type="radio" name="my_tabs_3" class="tab" aria-label="Tab 3" />
			<div class="tab-content bg-base-100 border-base-300 p-6">Tab content 3</div>
		</div>
	)
}
