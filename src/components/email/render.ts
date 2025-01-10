import { JSX } from 'solid-js'
import { renderToString } from 'solid-js/web'

export function renderEmail(element: JSX.Element) {
  'use server'
  return renderToString(() => element)
}
