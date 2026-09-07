import { login, register } from "@/lib/api/auth"
import type { LoginPayload, RegistrationPayload } from "@/lib/api/auth"
import { getProfile } from "@/lib/api/profiles"
import { writeSession } from "@/lib/auth/session"
import type { Session } from "@/lib/auth/session"

/**
 * Signing in takes two requests: /login/ hands out the token but not the
 * profile type, and every screen from the header down branches on it. The
 * token is passed explicitly because the session it would be read from is
 * only written once the type is known.
 */
export async function signIn(payload: LoginPayload): Promise<Session> {
  const auth = await login(payload)
  const profile = await getProfile(auth.user_id, auth.token)
  const session: Session = {
    token: auth.token,
    userId: auth.user_id,
    username: auth.username,
    email: auth.email,
    type: profile.type,
  }
  writeSession(session)
  return session
}

/** Registration already knows the type, so one request is enough here. */
export async function signUp(payload: RegistrationPayload): Promise<Session> {
  const auth = await register(payload)
  const session: Session = {
    token: auth.token,
    userId: auth.user_id,
    username: auth.username,
    email: auth.email,
    type: payload.type,
  }
  writeSession(session)
  return session
}

/**
 * The demo accounts created by `manage.py create_guest_users`. They exist so
 * the two sides of the marketplace can be tried without signing up first.
 */
export const GUEST_ACCOUNTS = [
  {
    label: "Als Kundin testen",
    username: "mila",
    password: "demo1234",
  },
  {
    label: "Als Anbieter testen",
    username: "jonas",
    password: "demo1234",
  },
] as const
