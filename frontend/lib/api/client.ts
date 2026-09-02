import { z } from "zod"

import { clearSession, getAuthToken } from "@/lib/auth/session"

const DEFAULT_API_PORT = process.env.NEXT_PUBLIC_API_PORT || "8000"
const FALLBACK_API_BASE_URL = `http://127.0.0.1:${DEFAULT_API_PORT}/api`

/**
 * NEXT_PUBLIC_API_BASE_URL wins when it is configured. Without it the API is
 * assumed to run on NEXT_PUBLIC_API_PORT (8000 in development) of the same
 * host the page was loaded from, so opening the app through the LAN address
 * or a server address does not send the browser to its own loopback
 * interface. Both values are inlined at build time.
 */
export function apiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL
  if (configured) {
    return configured.replace(/\/+$/, "")
  }
  if (typeof window === "undefined") {
    return FALLBACK_API_BASE_URL
  }
  return `${window.location.protocol}//${window.location.hostname}:${DEFAULT_API_PORT}/api`
}

type FieldErrors = Record<string, string[]>

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrors

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function toFieldErrors(payload: unknown): FieldErrors {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return {}
  }
  const result: FieldErrors = {}
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      result[key] = [value]
    } else if (Array.isArray(value)) {
      result[key] = value.map((entry) =>
        typeof entry === "string" ? entry : JSON.stringify(entry)
      )
    }
  }
  return result
}

/** Turns a DRF error body into a single sentence that can go into a toast. */
function toMessage(status: number, fieldErrors: FieldErrors): string {
  const detail = fieldErrors.detail?.[0]
  if (detail) {
    return detail
  }
  const first = Object.entries(fieldErrors)[0]
  if (first) {
    const [field, messages] = first
    return field === "non_field_errors" ? messages[0] : `${field}: ${messages[0]}`
  }
  if (status === 401) {
    return "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an."
  }
  if (status === 403) {
    return "Für diese Aktion fehlt dir die Berechtigung."
  }
  return `Die Anfrage ist mit Status ${status} fehlgeschlagen.`
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  /** JSON body. Mutually exclusive with formData. */
  body?: unknown
  /** Multipart body, used for the two file uploads the API accepts. */
  formData?: FormData
  /** Endpoints reachable without a token (login, registration, offer list). */
  anonymous?: boolean
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }
  const text = await response.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export async function request<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  options: RequestOptions = {}
): Promise<z.output<S>> {
  const { method = "GET", body, formData, anonymous = false } = options
  const headers: Record<string, string> = {}

  // FormData sets its own Content-Type including the multipart boundary, so
  // it must not be given one here.
  if (body !== undefined) {
    headers["Content-Type"] = "application/json"
  }
  if (!anonymous) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Token ${token}`
    }
  }

  let response: Response
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      method,
      headers,
      body: formData ?? (body === undefined ? undefined : JSON.stringify(body)),
    })
  } catch {
    throw new ApiError(
      0,
      `Die Coderr-API unter ${apiBaseUrl()} ist nicht erreichbar. Läuft das Backend?`
    )
  }

  const payload = await readBody(response)

  if (!response.ok) {
    if (response.status === 401) {
      clearSession()
    }
    const fieldErrors = toFieldErrors(payload)
    throw new ApiError(response.status, toMessage(response.status, fieldErrors), fieldErrors)
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    throw new ApiError(
      response.status,
      "Die API hat eine Antwort in einem unerwarteten Format geliefert."
    )
  }
  return parsed.data
}

/** DELETE endpoints answer with 204 and no body. */
export const emptyResponseSchema = z.unknown().transform((): void => undefined)

/** Drops empty values so `?search=&page=1` never reaches the API. */
export function toQueryString(
  params: Record<string, string | number | undefined | null>
): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value))
    }
  }
  const query = search.toString()
  return query ? `?${query}` : ""
}
