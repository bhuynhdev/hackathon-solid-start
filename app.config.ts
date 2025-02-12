import { defineConfig } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
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
