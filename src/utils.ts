import { basename, extname } from 'path'
import { Component } from 'solid-js'
import { renderToString } from 'solid-js/web'

/**
 * Extract the module name from a path
 * i.e. './email_templates/TextEmail.tsx' -> 'TestEmail'
 **/
export function convertPathToModuleName(path: string) {
	return basename(path, extname(path))
}

export async function gatherEmailData() {
	'use server'
	console.log('GATHERING')
	const raws = import.meta.glob<string>(`@emailtemplates/*`, { import: 'default', query: '?raw' })
	const modules = import.meta.glob<Component>(`@emailtemplates/*`, { import: 'default' })
	const jsxSourceData = await Promise.all(
		Object.entries(raws).map(async ([path, importFn]) => {
			const rawJsx = await importFn()
			return { type: 'jsx', data: rawJsx, module: convertPathToModuleName(path) }
		})
	)
	const htmlData = await Promise.all(
		Object.entries(modules).map(async ([p, importFn]) => {
			const Comp = await importFn()
			return { type: 'html', module: convertPathToModuleName(p), data: renderToString(() => Comp({})) }
		})
	)

	const emailData = [...jsxSourceData, ...htmlData].reduce<Record<string, { html: string; jsx: string }>>((acc, info) => {
		acc[info.module] ??= { html: '', jsx: '' }
		if (info.type === 'html') acc[info.module].html = info.data
		if (info.type === 'jsx') acc[info.module].jsx = info.data
		return acc
	}, {})

	return emailData
}
