import emails from '@emailtemplates/emails.json'
import { For, Match, Switch } from 'solid-js'
import { attendanceStatuses } from '~/db/schema'
import { sendEmail } from './actions'
import { useSubmission } from '@solidjs/router'

const emailRecipientTypes = ['all', 'minors', 'bystatus', 'specific'] as const
export type EmailRecipientType = (typeof emailRecipientTypes)[number]

type SendEmailFormProps = {
	chosenTemplate?: string
	chosenRecipientType?: EmailRecipientType
	disableChoosingTemplate?: boolean
}

export default function SendEmailForm(props: SendEmailFormProps) {
	const sendEmailSubmission = useSubmission(sendEmail)
	return (
		<form action={sendEmail} method="post">
			<header>
				<h2 class="m-0">Send email</h2>
			</header>
			<div class="flex flex-col gap-4 p-4">
				<label class="flex flex-col gap-2">
					<span>Template</span>
					{/* If a template has been chosen, then disabled the template select field */}
					<select required name="template" class="select" disabled={props.disableChoosingTemplate}>
						<option value="" disabled selected={!props.chosenTemplate}>
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
				<fieldset class="space-y-2">
					<legend>Choose recipients</legend>
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
								<Match when={recipientType === 'bystatus'}>
									<div class="flex gap-3">
										<label class="peer flex items-center gap-2">
											<input
												type="radio"
												class="radio radio-xs"
												name="recipientChoice"
												value={recipientType}
												checked={recipientType === props.chosenRecipientType}
											/>
											<span>Participants with status</span>
										</label>
										<label class="hidden peer-has-checked:block">
											<select class="select select-sm w-56" name="bystatusoption">
												<option value="" disabled selected>
													Choose a status
												</option>
												<For each={attendanceStatuses}>{(status) => <option value={status}>{status}</option>}</For>
											</select>
										</label>
										{/* Fake select to give appearance of form field only */}
										<select disabled class="select select-sm w-56 peer-has-checked:hidden">
											<option disabled selected>
												Choose a status
											</option>
										</select>
									</div>
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
