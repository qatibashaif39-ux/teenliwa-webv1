import { query } from "./db.server";
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

export async function insertOrderInDb(order: Order): Promise<void> {
  const sql = `
    INSERT INTO orders (id, tracking, name, phone, address, items_json, total, status, created_at, cancelled_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  `;
  await query(sql, [
    order.id,
    order.tracking,
    order.name,
    order.phone,
    order.address,
    JSON.stringify(order.items),
    order.total,
    order.status,
    order.createdAt,
    order.cancelledAt || null,
  ]);
}

export async function getOrderFromDb(tracking: string): Promise<Order | null> {
  const res = await query('SELECT * FROM orders WHERE UPPER(tracking) = $1', [tracking.trim().toUpperCase()]);
  const row = res.rows[0];
  if (!row) return null;
  return progressStatus(rowToOrder(row));
}

export async function getOrdersFromDb(): Promise<Order[]> {
  const res = await query('SELECT * FROM orders ORDER BY created_at DESC');
  const rows = res.rows as any[];
  return rows.map(rowToOrder).map(progressStatus);
}

export async function cancelOrderInDb(tracking: string): Promise<Order | null> {
  const order = await getOrderFromDb(tracking);
  if (!order) return null;

  if (order.status !== 'pending' && order.status !== 'processing') {
    return order;
  }

  const cancelledAt = Date.now();
  await query("UPDATE orders SET status = 'cancelled', cancelled_at = $1 WHERE UPPER(tracking) = $2", [cancelledAt, tracking.trim().toUpperCase()]);

  return getOrderFromDb(tracking);
}
