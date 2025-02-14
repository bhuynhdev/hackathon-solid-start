import { defineConfig } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'
import '@total-typescript/ts-reset/filter-boolean'
import assert from 'assert'
import { build } from 'esbuild'
import { solidPlugin as esbuildSolidPlugin } from 'esbuild-plugin-solid'
import fs from 'fs'
import path from 'path'
import { renderToString } from 'solid-js/web'
import Icons from 'unplugin-icons/vite'
import { type Plugin } from 'vinxi'
/**
 * Extract the module name from a path
 * i.e. './email_templates/TextEmail.tsx' -> 'TestEmail'
 **/
export function convertPathToModuleName(filePath: string) {
	return path.basename(filePath, path.extname(filePath))
}

/**
 * Compile the email_templates using esbuild, then use SolidJS to render the compiled components to HTML strings
 * And write the result to json
 */
async function buildEmailTemplates() {
	assert(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production')

	fs.rmSync('./src/email_templates/_build', { recursive: true, force: true })

	const buildResult = await build({
		entryPoints: ['./src/email_templates/*.tsx'],
		bundle: true,
		target: 'ESNext',
		platform: 'node',
		format: 'esm',
		metafile: true,
		entryNames: '[dir]/[name]-[hash]', // Hash helps bust the dynamic import cache
		outdir: './src/email_templates/_build/',
		plugins: [esbuildSolidPlugin({ solid: { hydratable: false, generate: 'ssr' } })],
		// Required configuration for proper development/production handling
		define: {
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		},
		conditions: ['solid', process.env.NODE_ENV]
	}).catch((err) => {
		console.log(err)
		process.exit(1)
	})

	const renderResult = await Promise.all(
		Object.entries(buildResult.metafile.outputs).map(async ([compiledPath, { entryPoint }]) => {
			if (!entryPoint) return
			const component = (await import(path.resolve('./', compiledPath))).default
			if (typeof component !== 'function') return
			const html = renderToString(() => component())
			const rawSource = fs.readFileSync(path.resolve('./', entryPoint), 'utf-8')
			return [convertPathToModuleName(entryPoint), { html, jsx: rawSource }] as const
		})
	)

	// Convert to lookup map where `moduleName` is key
	const renderMap = Object.fromEntries(renderResult.filter(Boolean))
	fs.writeFileSync(path.resolve('./src/email_templates/emails.json'), JSON.stringify(renderMap, null, 2), 'utf-8')
}

function emailTemplatesPlugin(): Plugin {
	return {
		name: 'email-templates-plugin',
		async buildStart() {
			await buildEmailTemplates()
		},
		configureServer(server) {
			server.watcher.on('change', (filePath) => {
				// Regex to match direct TSX children files of /src/email_templates folder
				if (filePath.match(/^.*\/src\/email_templates\/[^/]+\.tsx$/)) {
					buildEmailTemplates()
				}
			})
			server.watcher.on('unlink', (filePath) => {
				// Regex to match direct TSX children files of /src/email_templates folder
				if (filePath.match(/^.*\/src\/email_templates\/[^/]+\.tsx$/)) {
					buildEmailTemplates()
				}
			})
		}
	}
}

export default defineConfig({
	vite: {
		plugins: [tailwindcss(), emailTemplatesPlugin(), Icons({ compiler: 'solid' })],
		resolve: {
			alias: {
				'@emailtemplates': path.resolve('./src/email_templates/')
			}
		}
	},
	server: {
		esbuild: { options: { target: 'esnext' } },
		prerender: {
			routes: ['/admin/emails/TestEmail', '/admin/emails/TestEmail2', '/admin/emails/TestEmail3', '/admin/emails/TestEmail4']
		}
	}
})
