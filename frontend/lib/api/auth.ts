import { request } from "@/lib/api/client"
import { authResponseSchema } from "@/lib/api/types"
import type { AuthResponse, ProfileType } from "@/lib/api/types"

export type LoginPayload = {
  username: string
  password: string
}

export type RegistrationPayload = {
  username: string
  email: string
  password: string
  repeated_password: string
  type: ProfileType
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return request("/login/", authResponseSchema, {
    method: "POST",
    body: payload,
    anonymous: true,
  })
}

export function register(payload: RegistrationPayload): Promise<AuthResponse> {
  return request("/registration/", authResponseSchema, {
    method: "POST",
    body: payload,
    anonymous: true,
  })
}
