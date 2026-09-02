"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getProfile,
  listBusinessProfiles,
  listCustomerProfiles,
  updateProfile,
  updateProfilePicture,
} from "@/lib/api/profiles"
import type { ProfileUpdatePayload } from "@/lib/api/profiles"
import { queryKeys } from "@/lib/api/query-keys"
import { useSession } from "@/lib/auth/use-session"

export function useProfile(userId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.profile(userId ?? 0),
    queryFn: () => getProfile(userId as number),
    enabled: typeof userId === "number" && Number.isFinite(userId),
  })
}

/** The profile of whoever is signed in, or nothing when nobody is. */
export function useOwnProfile() {
  return useProfile(useSession()?.userId)
}

export function useBusinessProfiles() {
  return useQuery({
    queryKey: queryKeys.businessProfiles,
    queryFn: listBusinessProfiles,
  })
}

export function useCustomerProfiles() {
  return useQuery({
    queryKey: queryKeys.customerProfiles,
    queryFn: listCustomerProfiles,
  })
}

export function useUpdateProfile(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => updateProfile(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) })
    },
  })
}

export function useUpdateProfilePicture(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => updateProfilePicture(userId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) })
    },
  })
}
