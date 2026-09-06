import type { Metadata } from "next"

import { SessionGate } from "@/components/auth/session-gate"
import { OrdersView } from "@/components/orders/orders-view"

export const metadata: Metadata = {
  title: "Aufträge",
}

export default function OrdersPage() {
  return (
    <SessionGate expects="user" redirectTo="/login">
      <OrdersView />
    </SessionGate>
  )
}
