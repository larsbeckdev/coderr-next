"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createOrder,
  deleteOrder,
  getOrderCounts,
  listOrders,
  updateOrderStatus,
} from "@/lib/api/orders"
import { queryKeys } from "@/lib/api/query-keys"
import type { OrderStatus } from "@/lib/api/types"

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: listOrders,
  })
}

export function useOrderCounts(businessUserId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.orderCounts(businessUserId ?? 0),
    queryFn: () => getOrderCounts(businessUserId as number),
    enabled: typeof businessUserId === "number",
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (offerDetailId: number) => createOrder(offerDetailId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders })
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => deleteOrder(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders })
    },
  })
}
