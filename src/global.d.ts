/// <reference types="@solidjs/start/env" />
import type { Request as CfRequest, D1Database, ExecutionContext, KVNamespace, R2Bucket } from '@cloudflare/workers-types'
import { type DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from './db/schema'
import { User } from './db/types'

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

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
      NODE_ENV: 'development' | 'production';
      PORT?: string;
      PWD: string;
    }
  }
  namespace App {
    interface RequestEventLocals {
      db: DrizzleD1Database<typeof schema>
      user: User
    }
  }
}
