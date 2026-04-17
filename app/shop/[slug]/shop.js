"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { CSS } from "../../../lib/styles";
import { I, OjaLogo } from "../../../lib/icons";
import { fmt, genToken } from "../../../lib/utils";

export default function Shop({ slug }) {
  const [vendor, setVendor] = useState(null);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: vend } = await supabase.from("profiles").select("*").eq("slug", slug).maybeSingle();
      if (!vend) { setLoading(false); return; }
      setVendor(vend);
      const { data: its } = await supabase.from("items").select("*").eq("user_id", vend.id);
      setItems(its || []);
      const { data: st } = await supabase.rpc("get_vendor_stats", { vendor_user_id: vend.id });
      if (st && st[0]) setStats(st[0]);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <><style>{CSS}</style><div className="loading-screen"><div className="spinner" /></div></>;
  if (!vendor) return <><style>{CSS}</style><div className="loading-screen"><div style={{ textAlign: "center", color: "var(--t2)" }}><OjaLogo w={60} color="var(--t3)" /><div style={{ marginTop: 20, fontSize: 15 }}>Shop not found</div></div></div></>;

  if (confirmed) return <><style>{CSS}</style><OrderConfirmed order={confirmed} vendor={vendor} /></>;

  const biz = vendor.business_type;
  const hasProducts = items.some(i => i.type === "Product");
  const hasServices = items.some(i => i.type === "Service");
  const tabs = [hasProducts && hasServices && "All", hasProducts && "Products", hasServices && "Services"].filter(Boolean);
  const displayTab = tab === "All" ? "All" : tab;
  const filtered = items.filter(i => displayTab === "All" || i.type === displayTab.replace(/s$/, ""));

  const cartTotal = cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    else setCart([...cart, { id: item.id, name: item.name, price: item.price, image: item.image, type: item.type, qty: 1 }]);
  };
  const updateQty = (id, delta) => { setCart(cart.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0)); };

  return <>
    <style>{CSS}</style>
    <div className="shop-wrap">
      <div className="shop-header">
        <div className="shop-header-in">
          <div className="shop-bn">{vendor.business_name}</div>
          {stats && Number(stats.review_count) > 0 && <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4, marginBottom: 8, color: "var(--am)", fontWeight: 600, fontSize: 14 }}>
            {I.star}
            <span>{Number(stats.avg_rating).toFixed(1)}</span>
            <span style={{ color: "var(--t2)", fontWeight: 500 }}>· {stats.review_count} review{Number(stats.review_count) !== 1 ? "s" : ""}</span>
          </div>}
          {vendor.about && <div className="shop-about">{vendor.about}</div>}
          {!vendor.accepts_orders && <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--rl)", color: "var(--r)", borderRadius: 8, fontSize: 13, fontWeight: 600, display: "inline-block" }}>Currently not accepting orders</div>}
        </div>
      </div>
      <div className="shop-content">
        {tabs.length > 1 && <div className="shop-tabs">{tabs.map(t => <button key={t} className={`shop-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}</div>}
        {filtered.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: "var(--t3)" }}>No items in this category</div> :
          <div className="shop-grid">{filtered.map(item => <div key={item.id} className="shop-card" onClick={() => vendor.accepts_orders && addToCart(item)}>
            {item.image ? <img className="shop-img" src={item.image} alt={item.name} /> : <div className="shop-img">{I.cam}</div>}
            <div className="shop-body">
              <div className="shop-type">{item.type}</div>
              <div className="shop-name">{item.name}</div>
              {item.description && <div className="shop-desc">{item.description}</div>}
              <div className="shop-price">{item.price ? fmt(item.price) : "Price on request"}</div>
            </div>
          </div>)}</div>
        }
      </div>
      {cart.length > 0 && <div className="cart-bar"><div className="cart-bar-in">
        <div className="cart-info">{cartCount} item{cartCount !== 1 ? "s" : ""}<b>{cartTotal > 0 ? fmt(cartTotal) : "Price TBD"}</b></div>
        <button className="cart-btn" onClick={() => setCheckoutOpen(true)}>{I.cart} Checkout {I.arr}</button>
      </div></div>}
      {checkoutOpen && <Checkout vendor={vendor} cart={cart} updateQty={updateQty} onClose={() => setCheckoutOpen(false)} onPlaced={(order) => { setConfirmed(order); setCart([]); setCheckoutOpen(false); }} />}
    </div>
  </>;
}

function Checkout({ vendor, cart, updateQty, onClose, onPlaced }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const hasProducts = cart.some(c => c.type === "Product");
  const cartTotal = cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  const hasAllPrices = cart.every(c => c.price);

  const place = async () => {
    if (!name.trim() || !phone.trim()) { setErr("Name and phone are required"); return; }
    if (hasProducts && !address.trim()) { setErr("Delivery address is required for products"); return; }
    setBusy(true); setErr("");
    const token = genToken();
    const itemsSummary = cart.map(c => `${c.qty}x ${c.name}`).join(", ");
    const { data, error } = await supabase.from("orders").insert({
      user_id: vendor.id,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      delivery_address: hasProducts ? address.trim() : null,
      date: new Date().toISOString().slice(0, 10),
      item_name: itemsSummary.slice(0, 200),
      total: hasAllPrices ? cartTotal : 0,
      status: "Pending",
      notes: notes.trim() || null,
      cart: cart,
      source: "storefront",
      flow_status: "awaiting_pricing",
      public_token: token,
    }).select().single();
    setBusy(false);
    if (error) { setErr(error.message); return; }
    // Log the order placement as activity for the vendor
    supabase.from("activity_log").insert({ user_id: vendor.id, action: "storefront_order_received" });
    onPlaced(data);
  };

  return <div className="mo" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="ml"><div className="mh"><div className="mt">Checkout</div><button className="mc" onClick={onClose}>{I.close}</button></div>
      <div className="mb">
        <div className="cart-list">
          {cart.map(item => <div className="cart-item" key={item.id}>
            {item.image ? <img className="cart-item-img" src={item.image} alt="" /> : <div className="cart-item-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t3)" }}>{I.cam}</div>}
            <div className="cart-item-info"><div className="cart-item-name">{item.name}</div><div className="cart-item-price">{item.price ? `${fmt(item.price)} each` : "Price TBD"}</div></div>
            <div className="qty-ctrl"><button className="qty-btn" onClick={() => updateQty(item.id, -1)}>-</button><div className="qty-val">{item.qty}</div><button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button></div>
          </div>)}
        </div>
        <div style={{ padding: "10px 0", borderTop: "1px solid var(--bl)", marginBottom: 16, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600 }}>
          <span>{hasAllPrices ? "Estimated total" : "Final total"}</span>
          <span>{hasAllPrices ? fmt(cartTotal) : <span style={{ color: "var(--t3)" }}>Vendor will set price</span>}</span>
        </div>
        {err && <div className="auth-err">{err}</div>}
        <div className="fg"><label className="fl">Your name</label><input className="fi" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" /></div>
        <div className="fg"><label className="fl">Phone number</label><input className="fi" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" /></div>
        {hasProducts && <div className="fg"><label className="fl">Delivery address</label><textarea className="ft" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, city, landmarks..." /></div>}
        <div className="fg"><label className="fl">Additional notes (optional)</label><textarea className="ft" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Size, color, preferences, date needed..." /></div>
      </div>
      <div className="mf"><button className="btn btn-s" onClick={onClose}>Cancel</button><button className="btn btn-p" disabled={busy} onClick={place}>{busy ? "Placing..." : "Place Order"}</button></div>
    </div>
  </div>;
}

function OrderConfirmed({ order, vendor }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/order/${order.public_token}` : "";
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return <div className="order-wrap"><div className="order-card">
    <div className="order-head" style={{ textAlign: "center", padding: "32px 24px 24px" }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--g)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 28 }}>{I.check}</div>
      <div className="order-biz">Order Placed!</div>
      <div style={{ color: "var(--t2)", fontSize: 13, marginTop: 4 }}>{vendor.business_name} has been notified</div>
    </div>
    <div className="order-body">
      <div style={{ background: "var(--aml)", padding: 14, borderRadius: 10, marginBottom: 20, fontSize: 13, lineHeight: 1.5 }}>
        <b style={{ color: "var(--am)", display: "block", marginBottom: 4 }}>What happens next?</b>
        The vendor will confirm your order and set the final price (including delivery if applicable). You'll see the update on your order page.
      </div>
      <div className="sect-title">Your order status link</div>
      <div className="share-link" style={{ marginTop: 8 }}><code>{url}</code></div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="btn btn-s btn-sm" onClick={copy}>{copied ? I.check : I.copy} {copied ? "Copied!" : "Copy link"}</button>
        <a className="btn btn-p btn-sm" href={`/order/${order.public_token}`}>Open order page {I.arr}</a>
      </div>
      <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 10, lineHeight: 1.5 }}>Save this link to check your order status and make payment when the vendor confirms.</div>
    </div>
  </div></div>;
}
