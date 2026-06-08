import { getDb } from "./db.server";
import type { Order, OrderStatus } from "./orders";

const HOUR = 1000 * 60 * 60;
export const REFUND_DELAY = HOUR * 24;

function refundStage(order: { cancelledAt?: number }): "cancelled" | "refunding" | "refunded" | null {
  if (!order.cancelledAt) return null;
  return Date.now() - order.cancelledAt >= REFUND_DELAY ? "refunded" : "refunding";
}

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

function rowToOrder(row: any): Order {
  return {
    id: row.id,
    tracking: row.tracking,
    name: row.name,
    phone: row.phone,
    address: row.address,
    items: JSON.parse(row.items_json),
    total: Number(row.total),
    status: row.status as OrderStatus,
    createdAt: Number(row.created_at),
    cancelledAt: row.cancelled_at ? Number(row.cancelled_at) : undefined,
  };
}

export function insertOrderInDb(order: Order): void {
  const db = getDb();
  const prep = db.prepare(`
    INSERT INTO orders (id, tracking, name, phone, address, items_json, total, status, created_at, cancelled_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  prep.run(
    order.id,
    order.tracking,
    order.name,
    order.phone,
    order.address,
    JSON.stringify(order.items),
    order.total,
    order.status,
    order.createdAt,
    order.cancelledAt || null
  );
}

export function getOrderFromDb(tracking: string): Order | null {
  const db = getDb();
  const prep = db.prepare("SELECT * FROM orders WHERE UPPER(tracking) = ?");
  const row = prep.get(tracking.trim().toUpperCase());
  if (!row) return null;
  return progressStatus(rowToOrder(row));
}

export function getOrdersFromDb(): Order[] {
  const db = getDb();
  const prep = db.prepare("SELECT * FROM orders ORDER BY created_at DESC");
  const rows = prep.all() as any[];
  return rows.map(rowToOrder).map(progressStatus);
}

export function cancelOrderInDb(tracking: string): Order | null {
  const db = getDb();
  const order = getOrderFromDb(tracking);
  if (!order) return null;
  
  if (order.status !== "pending" && order.status !== "processing") {
    return order;
  }
  
  const cancelledAt = Date.now();
  db.prepare("UPDATE orders SET status = 'cancelled', cancelled_at = ? WHERE UPPER(tracking) = ?").run(
    cancelledAt,
    tracking.trim().toUpperCase()
  );
  
  return getOrderFromDb(tracking);
}
