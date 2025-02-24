import emails from '@emailtemplates/emails.json'
import { For, Match, Switch } from 'solid-js'

const emailRecipientTypes = ['all', 'minors', 'specific'] as const
export type EmailRecipientType = (typeof emailRecipientTypes)[number]

type SendEmailFormProps = {
	chosenTemplate?: string
	chosenRecipientType?: EmailRecipientType
	disableChoosingTemplate?: boolean
}

export default function SendEmailForm(props: SendEmailFormProps) {
	return (
		<form>
			<header>
				<h2 class="m-0">Send email</h2>
			</header>
			<div class="flex flex-col gap-4 p-4">
				<label class="flex flex-col gap-2">
					<span>Template</span>
					{/* If a template has been chosen, then disabled the template select field */}
					<select class="select" disabled={props.disableChoosingTemplate}>
						<option disabled selected={!props.chosenTemplate}>
							Choose a template to send
						</option>
						<For each={Object.keys(emails)}>
							{(emailTemplateName) => (
								<option value={emailTemplateName} selected={props.chosenTemplate === emailTemplateName}>
									{emailTemplateName}
								</option>
							)}
						</For>
					</select>
				</label>
				<fieldset class="flex flex-col gap-2">
					<legend class="contents">Choose recipients</legend>
					<For each={emailRecipientTypes}>
						{(recipientType) => (
							<Switch>
								<Match when={recipientType === 'all'}>
									<label class="flex items-center gap-2">
										<input
											type="radio"
											class="radio radio-xs"
											name="recipientChoice"
											value={recipientType}
											checked={!props.chosenRecipientType || recipientType === props.chosenRecipientType}
										/>
										<span>All participants</span>
									</label>
								</Match>
								<Match when={recipientType === 'minors'}>
									<label class="flex items-center gap-2">
										<input
											type="radio"
											class="radio radio-xs"
											name="recipientChoice"
											value={recipientType}
											checked={recipientType === props.chosenRecipientType}
										/>
										<span>Minors-only</span>
									</label>
								</Match>
								<Match when={recipientType === 'specific'}>
									<label class="peer flex items-center gap-2">
										<input
											type="radio"
											class="radio radio-xs"
											name="recipientChoice"
											value={recipientType}
											checked={recipientType === props.chosenRecipientType}
										/>
										<span>Specific emails</span>
									</label>
									<div class="hidden peer-has-checked:block">
										<label class="input ml-4">
											<span class="label">Emails</span>
											<input name="specificEmails" type="text" placeholder="Enter comma-separated values" />
										</label>
									</div>
								</Match>
							</Switch>
						)}
					</For>
				</fieldset>
				<button class="btn btn-primary w-fit" type="submit">
					Send emails
				</button>
			</div>
		</form>
	)
}
