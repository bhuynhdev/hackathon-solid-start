import { query, redirect } from "@solidjs/router";
import { removeSessionCookie } from "./authUtil";
import { getRequestEvent } from "solid-js/web";

export const getAuthenticatedUser = query(async () => {
  'use server'
  const event = getRequestEvent()
  if (!event?.locals.user) {
    removeSessionCookie()
    throw redirect("/admin?unauthorized", 403)
  }
  return event.locals.user


}, 'get-authenticated-user')
