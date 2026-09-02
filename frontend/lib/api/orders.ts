import { z } from "zod"

import { emptyResponseSchema, request } from "@/lib/api/client"
import {
  completedOrderCountSchema,
  orderCountSchema,
  orderSchema,
} from "@/lib/api/types"
import type { Order, OrderStatus } from "@/lib/api/types"

/** Returns every order the signed-in user takes part in, either side. */
export function listOrders(): Promise<Order[]> {
  return request("/orders/", z.array(orderSchema))
}

export function createOrder(offerDetailId: number): Promise<Order> {
  return request("/orders/", orderSchema, {
    method: "POST",
    body: { offer_detail_id: offerDetailId },
  })
}

/** Only the business user of the order may move it, and only the status. */
export function updateOrderStatus(
  orderId: number,
  status: OrderStatus
): Promise<Order> {
  return request(`/orders/${orderId}/`, orderSchema, {
    method: "PATCH",
    body: { status },
  })
}

export function deleteOrder(orderId: number): Promise<void> {
  return request(`/orders/${orderId}/`, emptyResponseSchema, {
    method: "DELETE",
  })
}

export async function getOrderCounts(businessUserId: number): Promise<{
  inProgress: number
  completed: number
}> {
  const [open, done] = await Promise.all([
    request(`/order-count/${businessUserId}/`, orderCountSchema),
    request(
      `/completed-order-count/${businessUserId}/`,
      completedOrderCountSchema
    ),
  ])
  return { inProgress: open.order_count, completed: done.completed_order_count }
}
