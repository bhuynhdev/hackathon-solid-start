import { createAsync, query } from '@solidjs/router'
import { renderEmail } from '~/components/email/render'
import { TestEmail } from '~/emails/TestEmail'

const getEmailHtml = query(async () => {
  'use server'
  return renderEmail(<TestEmail />)
}, 'test-email')

export default function EmailsPage() {
  const emailHtml = createAsync(() => getEmailHtml())
  return (
    <div class="flex h-full gap-4">
      <p>Homie</p>
      <iframe srcdoc={emailHtml()} class="h-full w-full" />
    </div>
  )
}
