"use client"

import { useQuery } from "@tanstack/react-query"

import { getBaseInfo } from "@/lib/api/base-info"
import { queryKeys } from "@/lib/api/query-keys"

export function useBaseInfo() {
  return useQuery({
    queryKey: queryKeys.baseInfo,
    queryFn: getBaseInfo,
  })
}
