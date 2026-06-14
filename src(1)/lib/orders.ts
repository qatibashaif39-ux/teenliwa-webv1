import { createServerFn } from "@tanstack/react-start";
import type { CartItem } from "@/context/CartContext";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export interface Order {
  id: string;
  tracking: string;
  name: string;
  phone: string;
  address: string;
  items: { id: string; name: string; price: number; qty: number }[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  cancelledAt?: number;
}

const HOUR = 1000 * 60 * 60;
export const REFUND_DELAY = HOUR * 24;

export const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "تم استلام الطلب" },
  { key: "processing", label: "قيد التجهيز" },
  { key: "shipped", label: "تم الشحن" },
  { key: "delivered", label: "تم التوصيل" },
];

export const REFUND_STEPS: { key: "cancelled" | "refunding" | "refunded"; label: string }[] = [
  { key: "cancelled", label: "تم إلغاء الطلب" },
  { key: "refunding", label: "جاري استرداد المبلغ" },
  { key: "refunded", label: "تم استرداد المبلغ" },
];

export function statusIndex(status: OrderStatus) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function canCancel(status: OrderStatus) {
  return status === "pending" || status === "processing";
}

export function isCancelled(status: OrderStatus) {
  return status === "cancelled" || status === "refunded";
}

export type RefundStage = "cancelled" | "refunding" | "refunded";

export function refundStage(order: Order): RefundStage | null {
  if (!order.cancelledAt) return null;
  return Date.now() - order.cancelledAt >= REFUND_DELAY ? "refunded" : "refunding";
}

export interface TimelineStep {
  label: string;
  at: number | null;
  reached: boolean;
}

export function getTimeline(order: Order): TimelineStep[] {
  if (order.cancelledAt) {
    const stage = refundStage(order);
    const refundedAt = order.cancelledAt + REFUND_DELAY;
    return [
      { label: "تم استلام الطلب", at: order.createdAt, reached: true },
      { label: "تم إلغاء الطلب", at: order.cancelledAt, reached: true },
      { label: "جاري استرداد المبلغ", at: order.cancelledAt, reached: true },
      {
        label: "تم استرداد المبلغ",
        at: refundedAt,
        reached: stage === "refunded",
      },
    ];
  }
  const offsets = [0, HOUR, HOUR * 12, HOUR * 48];
  const reachedIdx = statusIndex(order.status);
  return STATUS_STEPS.map((step, idx) => ({
    label: step.label,
    at: order.createdAt + offsets[idx],
    reached: idx <= reachedIdx,
  }));
}

function generateTracking() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString().slice(-4);
  return `TL-${stamp}${rand}`;
}

// Server functions wrapper

const createOrderFn = createServerFn({ method: "POST" })
  .inputValidator((d: Order) => d)
  .handler(async ({ data }) => {
    const { insertOrderInDb } = await import("./orders.server");
  await insertOrderInDb(data);
  return data;
  });

export async function createOrder(input: {
  name: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
}): Promise<Order> {
  const order: Order = {
    id: crypto.randomUUID(),
    tracking: generateTracking(),
    name: input.name,
    phone: input.phone,
    address: input.address,
    items: input.items.map((i) => ({
      id: i.product.id,
      name: i.product.name,
      price: i.product.price,
      qty: i.qty,
    })),
    total: input.total,
    status: "pending",
    createdAt: Date.now(),
  };
  return createOrderFn({ data: order });
}

const findOrderFn = createServerFn({ method: "POST" })
  .inputValidator((tracking: string) => tracking)
  .handler(async ({ data: tracking }) => {
  const { getOrderFromDb } = await import("./orders.server");
  return await getOrderFromDb(tracking);
  });

export async function findOrder(tracking: string): Promise<Order | null> {
  return findOrderFn({ data: tracking });
}

const getAllOrdersFn = createServerFn({ method: "GET" })
  .handler(async () => {
  const { getOrdersFromDb } = await import("./orders.server");
  return await getOrdersFromDb();
  });

export async function getAllOrders(): Promise<Order[]> {
  return getAllOrdersFn();
}

const cancelOrderFn = createServerFn({ method: "POST" })
  .inputValidator((tracking: string) => tracking)
  .handler(async ({ data: tracking }) => {
  const { cancelOrderInDb } = await import("./orders.server");
  return await cancelOrderInDb(tracking);
  });

export async function cancelOrder(tracking: string): Promise<Order | null> {
  return cancelOrderFn({ data: tracking });
}