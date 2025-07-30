import type { APIEvent } from "@solidjs/start/server";
import { GitHub, generateState } from "arctic";
import { setCookie } from "vinxi/http";
import { redirect } from "@solidjs/router"

export async function GET(event: APIEvent) {
  const state = generateState();
  const github = new GitHub(process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET, null);
	const githubOauthURL = github.createAuthorizationURL(state, []);

	setCookie("github_oauth_state", state, {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

  return redirect(githubOauthURL.toString(), 302)
}
