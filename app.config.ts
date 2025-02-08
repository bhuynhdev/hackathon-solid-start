import { defineConfig } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	vite: {
		plugins: [tailwindcss()]
	},
	server: {
		prerender: {
			routes: ['/admin/emails']
		},
		esbuild: { options: { target: 'esnext' } }
	}
})
