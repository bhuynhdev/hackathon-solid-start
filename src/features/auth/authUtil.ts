import { generateRandomString, type RandomReader } from "@oslojs/crypto/random";
import { sha512_256 } from "@oslojs/crypto/sha2";
import { setCookie } from "vinxi/http";

export function _generateSecureRandomString() {
  const randomReader: RandomReader = {
    read: (bytes) => crypto.getRandomValues(bytes)
  };
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  return generateRandomString(randomReader, alphabet, 21);
}

/**
 * Generate a new session id, secret hash, and token string
*/
export function generateSessionIdSecretAndToken() {
  const sessionId = _generateSecureRandomString()
  const sessionSecret = _generateSecureRandomString()
  const sessionSecretHash = sha512_256(new TextEncoder().encode(sessionSecret))
  return {
    id: sessionId,
    secretHash: sessionSecretHash,
    token: `${sessionId}.${sessionSecret}`
  }
}

export const SESSION_TOKEN_COOKIE_NAME = "session_token"

export function removeSessionCookie() {
  setCookie(SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    secure: import.meta.env.PROD,
    sameSite: "lax",
    expires: new Date(0)
  })
}

