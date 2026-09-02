import { request } from "@/lib/api/client"
import { baseInfoSchema } from "@/lib/api/types"
import type { BaseInfo } from "@/lib/api/types"

/** Platform wide counters for the landing page, reachable without a token. */
export function getBaseInfo(): Promise<BaseInfo> {
  return request("/base-info/", baseInfoSchema, { anonymous: true })
}
