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
  deliveryZone?: string;
  deliveryFee?: number;
  subtotal?: number;
}

const STORAGE_KEY = "teenliwa-orders";
const HOUR = 1000 * 60 * 60;
// How long the simulated refund takes to complete after cancellation.
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

// Cancellation is only allowed before the order ships.
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

// Builds the ordered list of steps with the timestamp each one happened (or will).
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

function load(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function save(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function generateTracking() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString().slice(-4);
  return `TL-${stamp}${rand}`;
}

// Simulate progression so the demo status feels alive.
function progressStatus(order: Order): Order {
  if (order.cancelledAt) {
    const stage = refundStage(order);
    return { ...order, status: stage === "refunded" ? "refunded" : "cancelled" };
  }
  const elapsed = Date.now() - order.createdAt;
  let status: OrderStatus = "pending";
  if (elapsed > HOUR * 48) status = "delivered";
  else if (elapsed > HOUR * 12) status = "shipped";
  else if (elapsed > HOUR) status = "processing";
  return { ...order, status };
}

export function createOrder(input: {
  name: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  deliveryZone?: string;
  deliveryFee?: number;
  subtotal?: number;
}): Order {
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
    deliveryZone: input.deliveryZone,
    deliveryFee: input.deliveryFee,
    subtotal: input.subtotal,
  };
  const orders = load();
  orders.push(order);
  save(orders);
  return order;
}

export function findOrder(tracking: string): Order | null {
  const normalized = tracking.trim().toUpperCase();
  const order = load().find((o) => o.tracking.toUpperCase() === normalized);
  return order ? progressStatus(order) : null;
}

export function getAllOrders(): Order[] {
  return load()
    .map(progressStatus)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function cancelOrder(tracking: string): Order | null {
  const normalized = tracking.trim().toUpperCase();
  const orders = load();
  const idx = orders.findIndex((o) => o.tracking.toUpperCase() === normalized);
  if (idx === -1) return null;
  const current = progressStatus(orders[idx]);
  if (!canCancel(current.status)) return current;
  orders[idx] = { ...orders[idx], status: "cancelled", cancelledAt: Date.now() };
  save(orders);
  return progressStatus(orders[idx]);
}