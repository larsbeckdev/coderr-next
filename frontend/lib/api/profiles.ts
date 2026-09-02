import { z } from "zod"

import { request } from "@/lib/api/client"
import {
  businessProfileSchema,
  customerProfileSchema,
  profileSchema,
} from "@/lib/api/types"
import type { BusinessProfile, CustomerProfile, Profile } from "@/lib/api/types"

export type ProfileUpdatePayload = {
  first_name?: string
  last_name?: string
  email?: string
  location?: string
  tel?: string
  description?: string
  working_hours?: string
}

export function getProfile(userId: number): Promise<Profile> {
  return request(`/profile/${userId}/`, profileSchema)
}

export function updateProfile(
  userId: number,
  payload: ProfileUpdatePayload
): Promise<Profile> {
  return request(`/profile/${userId}/`, profileSchema, {
    method: "PATCH",
    body: payload,
  })
}

/**
 * The picture goes in its own multipart PATCH. Mixing a file with the plain
 * fields would force the whole form through multipart, where empty strings
 * and booleans stop round-tripping cleanly.
 */
export function updateProfilePicture(
  userId: number,
  file: File
): Promise<Profile> {
  const formData = new FormData()
  formData.append("file", file)
  return request(`/profile/${userId}/`, profileSchema, {
    method: "PATCH",
    formData,
  })
}

export function listBusinessProfiles(): Promise<BusinessProfile[]> {
  return request("/profiles/business/", z.array(businessProfileSchema))
}

export function listCustomerProfiles(): Promise<CustomerProfile[]> {
  return request("/profiles/customer/", z.array(customerProfileSchema))
}
