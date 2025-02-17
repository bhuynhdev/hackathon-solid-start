import type { Request as CfRequest, D1Database, ExecutionContext, KVNamespace, R2Bucket } from '@cloudflare/workers-types'

/**
 * Reference: https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#parameters
 */
interface CfPagesEnv {
	ASSETS: { fetch: (request: CfRequest) => Promise<Response> }
	CF_PAGES: '1'
	CF_PAGES_BRANCH: string
	CF_PAGES_COMMIT_SHA: string
	CF_PAGES_URL: string

	// Environment variables
	SECRET: string

	// Bindings
	DB: D1Database
}

declare module 'vinxi/http' {
	interface H3EventContext {
		cf: CfRequest['cf']
		cloudflare: {
			request: CfRequest
			env: CfPagesEnv
			context: ExecutionContext
		}
	}
}
