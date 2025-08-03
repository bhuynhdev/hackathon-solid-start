import { redirect } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { GitHub, type OAuth2Tokens } from "arctic";
import { and, eq } from "drizzle-orm";
import { getCookie, setCookie } from "vinxi/http";
import { session, user } from "~/db/schema";
import { generateSessionIdSecretAndToken, SESSION_TOKEN_COOKIE_NAME } from "~/features/auth/authUtil";
import { getDb } from "~/utils";

// Based on: https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
type GithubUserResponse = {
  login: string,
  id: number,
  email: string,
  name: string
}

export async function GET(event: APIEvent): Promise<Response> {
  const requestUrl = new URL(event.request.url)
	const code = requestUrl.searchParams.get("code");
	const state = requestUrl.searchParams.get("state");
	const storedState = getCookie("github_oauth_state") ?? null;
	if (code === null || state === null || storedState === null) {
		return new Response(null, {
			status: 400
		});
	}
	if (state !== storedState) {
		return new Response(null, { status: 400 });
	}

	let tokens: OAuth2Tokens;
	try {
    const github = new GitHub(process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET, null);
		tokens = await github.validateAuthorizationCode(code);
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, { status: 400 });
	}
	const githubUserResponse = await fetch("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${tokens.accessToken()}`
		}
	});
	const githubUser = await githubUserResponse.json<GithubUserResponse>();

  const db = getDb()
	const [existingUser] = await db.select().from(user).where(and(eq(user.email, githubUser.email), eq(user.role, "admin")))

	if (existingUser) {
		const { id, secretHash, token } = generateSessionIdSecretAndToken();
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    // Must cast "as Buffer" and can't use Buffer.from() since Miniflare doesn't work with Buffer: https://github.com/cloudflare/workers-sdk/issues/5771
    await db.insert(session).values({ id: id, secretHash: secretHash as Buffer, userId: existingUser.id, createdAt: now, expiresAt: oneWeekFromNow })

    setCookie(SESSION_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      secure: import.meta.env.PROD,
      sameSite: "lax",
      expires: oneWeekFromNow
    })

		return redirect("/admin/participants", 302);
	}

	// TODO:If user not exists yet, then create a new Pending user
	const newUser = await db.insert(user).values({ email: githubUser.email, role: "pending", name: githubUser.name }).onConflictDoNothing()
  return redirect("/admin?denied", 302);
}
