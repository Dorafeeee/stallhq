export const uid = () => Math.random().toString(36).slice(2, 9);
export const fmt = (n) => "\u20A6" + Number(n || 0).toLocaleString();
export const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
export const today = () => new Date().toISOString().slice(0, 10);

export const STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"];
export const PAY_METHODS = ["Bank Transfer", "Cash", "POS", "USSD", "Other"];

export const FLOW_LABELS = {
  awaiting_pricing: "Awaiting Your Pricing",
  awaiting_payment: "Awaiting Payment",
  payment_claimed: "Payment Claimed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function compressImg(file, mx = 400) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        const k = Math.min(mx / img.width, mx / img.height, 1);
        c.width = img.width * k;
        c.height = img.height * k;
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target.result;
    };
    r.readAsDataURL(file);
  });
}

export function genToken() {
  return (Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10));
}

export function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Normalize Nigerian phone numbers for matching: remove spaces, dashes, +, country code
export function normalizePhone(p) {
  if (!p) return "";
  let n = String(p).replace(/[\s\-+()]/g, "");
  // Convert +234... or 234... to 0...
  if (n.startsWith("234")) n = "0" + n.slice(3);
  return n;
}

// Calculate profit for a single order using cost snapshot or live item cost as fallback
export function orderProfit(order, items) {
  if (!order || order.status === "Cancelled") return 0;
  const total = Number(order.total || 0);
  if (!total) return 0;
  const qty = Number(order.quantity) || 1;
  // Prefer the snapshot cost stored at sale time
  let unitCost = order.cost_at_sale != null ? Number(order.cost_at_sale) : null;
  // Fallback: look up the item's current cost (only useful for orders saved before cost tracking)
  if (unitCost == null && order.item_id && items) {
    const item = items.find(i => i.id === order.item_id);
    if (item?.cost_price) unitCost = Number(item.cost_price);
  }
  if (!unitCost) return 0;
  return total - (unitCost * qty);
}

// Calculate profit aggregated across many orders
export function totalProfit(orders, items) {
  return orders.reduce((sum, o) => sum + orderProfit(o, items), 0);
}
