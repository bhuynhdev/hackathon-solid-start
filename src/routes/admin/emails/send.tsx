import { useSearchParams } from '@solidjs/router'
import SendEmailForm from '~/components/SendEmailForm'

export default function EmailSenderPage() {
	const [searchParams, _] = useSearchParams()
	return (
		<div class="mx-auto lg:w-4/5">
			<h2 class="mt-12">Mail Campaigns</h2>
			<SendEmailForm chosenTemplate={String(searchParams.template ?? '')} />
		</div>
	)
}
