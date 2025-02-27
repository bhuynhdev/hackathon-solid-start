import { action } from '@solidjs/router'
import { Component } from 'solid-js'
import { renderToString, NoHydration } from 'solid-js/web'

export const sendEmail = action(async (formData: FormData) => {
	'use server'
	const { template, recipientChoice } = Object.fromEntries(formData)
	if (!template || !recipientChoice) {
		throw new Error('Invalid Form submission')
	}
	const allEmailTemplates = import.meta.glob<Component>([`/src/email_templates/*.tsx`], { import: 'default' })
	const emailTemplateEntryPoint = `/src/email_templates/${template}.tsx`
	const EmailTemplateComponent = await allEmailTemplates[emailTemplateEntryPoint]()
	const html = renderToString(() => (
		<NoHydration>
			<EmailTemplateComponent />
		</NoHydration>
	))
	console.log('HTML', html)
	return html
}, 'send-email')
