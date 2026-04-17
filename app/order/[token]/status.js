"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { CSS } from "../../../lib/styles";
import { I, OjaLogo } from "../../../lib/icons";
import { fmt, fmtDate, FLOW_LABELS } from "../../../lib/utils";

const STEPS = [
  { key: "awaiting_pricing", label: "Order Received" },
  { key: "awaiting_payment", label: "Price Set" },
  { key: "payment_claimed", label: "You Paid" },
  { key: "confirmed", label: "Payment Confirmed" },
  { key: "fulfilled", label: "Fulfilled" },
  { key: "completed", label: "Completed" },
];

function stepIndex(status) {
  const i = STEPS.findIndex(s => s.key === status);
  return i === -1 ? 0 : i;
}

export default function OrderStatus({ token }) {
  const [order, setOrder] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [token]);

  async function load() {
    const { data: ord } = await supabase.from("orders").select("*").eq("public_token", token).maybeSingle();
    if (!ord) { setLoading(false); return; }
    setOrder(ord);
    const { data: v } = await supabase.from("profiles").select("*").eq("id", ord.user_id).maybeSingle();
    setVendor(v);
    setLoading(false);
  }

  const claimPayment = async () => {
    setBusy(true);
    const { data } = await supabase.from("orders").update({ flow_status: "payment_claimed", payment_claimed_at: new Date().toISOString() }).eq("public_token", token).select().single();
    setBusy(false);
    if (data) setOrder(data);
  };

  const copy = (text, id) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1500); };

  if (loading) return <><style>{CSS}</style><div className="loading-screen"><div className="spinner" /></div></>;
  if (!order || !vendor) return <><style>{CSS}</style><div className="loading-screen"><div style={{ textAlign: "center", color: "var(--t2)" }}><OjaLogo w={60} color="var(--t3)" /><div style={{ marginTop: 20, fontSize: 15 }}>Order not found</div></div></div></>;

  const currentStep = stepIndex(order.flow_status);
  const cancelled = order.flow_status === "cancelled";
  const cart = order.cart || [];
  const cartSubtotal = cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  const showBank = order.flow_status === "awaiting_payment" && vendor.bank_name && vendor.account_number;

  return <>
    <style>{CSS}</style>
    <div className="order-wrap"><div className="order-card">
      <div className="order-head">
        <div className="order-biz">{vendor.business_name}</div>
        <div className="order-num">Order #{(order.public_token || "").slice(0, 8).toUpperCase()}</div>
      </div>

      <div className="order-body">
        {cancelled ? (
          <div className="status-big" style={{ background: "var(--rl)" }}>
            <div className="sl" style={{ color: "var(--r)" }}>Status</div>
            <div className="sv" style={{ color: "var(--r)" }}>Order Cancelled</div>
          </div>
        ) : (
          <>
            <div className="stepper">{STEPS.map((s, i) => <div key={s.key} className={`step ${i < currentStep ? "done" : i === currentStep ? "current" : ""}`} />)}</div>
            <div className="status-big">
              <div className="sl">Current Status</div>
              <div className="sv">{FLOW_LABELS[order.flow_status]}</div>
            </div>

            {order.flow_status === "awaiting_pricing" && <div style={{ padding: 14, background: "var(--aml)", borderRadius: 10, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>The vendor is reviewing your order and will set the final price. This page will update automatically.</div>}
            {order.flow_status === "awaiting_payment" && <div style={{ padding: 14, background: "var(--gl)", borderRadius: 10, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>Please transfer <b>{fmt(order.total)}</b> to the account below, then click "I've Paid" to notify the vendor.</div>}
            {order.flow_status === "payment_claimed" && <div style={{ padding: 14, background: "var(--aml)", borderRadius: 10, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>Waiting for the vendor to confirm your payment. This usually takes a few minutes to a few hours.</div>}
            {order.flow_status === "confirmed" && <div style={{ padding: 14, background: "var(--gl)", borderRadius: 10, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>Your payment has been confirmed! The vendor is now preparing your order.</div>}
            {order.flow_status === "fulfilled" && <div style={{ padding: 14, background: "var(--gl)", borderRadius: 10, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>Your order has been fulfilled.</div>}
            {order.flow_status === "completed" && <div style={{ padding: 14, background: "var(--gl)", borderRadius: 10, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>Thank you! Your order is complete.</div>}
          </>
        )}

        <div className="sect">
          <div className="sect-title">Order Details</div>
          {cart.map((item, i) => <div className="sect-line" key={i}><span className="k">{item.qty} \u00d7 {item.name}</span><span className="v">{item.price ? fmt(item.price * item.qty) : "TBD"}</span></div>)}
        </div>

        {order.total > 0 && <div className="sect">
          <div className="sect-title">Total</div>
          <div className="sect-line"><span className="k">Subtotal</span><span className="v">{fmt(cartSubtotal)}</span></div>
          {order.total !== cartSubtotal && <div className="sect-line"><span className="k">Adjustments / Delivery</span><span className="v">{fmt(order.total - cartSubtotal)}</span></div>}
          <div className="sect-line" style={{ fontSize: 15, fontWeight: 700, borderTop: "2px solid var(--t)", marginTop: 6, paddingTop: 10 }}><span className="k" style={{ color: "var(--t)" }}>Total Due</span><span className="v">{fmt(order.total)}</span></div>
        </div>}

        <div className="sect">
          <div className="sect-title">Delivery / Contact</div>
          <div className="sect-line"><span className="k">Name</span><span className="v">{order.customer_name}</span></div>
          <div className="sect-line"><span className="k">Phone</span><span className="v">{order.customer_phone}</span></div>
          {order.delivery_address && <div className="sect-line"><span className="k">Address</span><span className="v" style={{ maxWidth: "60%", textAlign: "right" }}>{order.delivery_address}</span></div>}
        </div>

        {showBank && <div className="bank-box-lg">
          <div className="bank-title">Pay To</div>
          <div className="bank-row"><span className="lbl">Bank</span><span className="val">{vendor.bank_name}</span></div>
          <div className="bank-row"><span className="lbl">Account</span><span className="val">{vendor.account_number} <button className="copy-btn" onClick={() => copy(vendor.account_number, "num")}>{copied === "num" ? I.check : I.copy}</button></span></div>
          <div className="bank-row"><span className="lbl">Name</span><span className="val">{vendor.account_name}</span></div>
          <div className="bank-row" style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.08)" }}><span className="lbl">Amount</span><span className="val" style={{ color: "var(--g)", fontSize: 15 }}>{fmt(order.total)}</span></div>
        </div>}
      </div>

      {order.flow_status === "awaiting_payment" && <div className="action-btn-wrap">
        <button className="big-btn" disabled={busy} onClick={claimPayment}>{busy ? "Notifying vendor..." : "I've Paid \u2014 Notify Vendor"}</button>
        <div style={{ fontSize: 11, color: "var(--t3)", textAlign: "center", marginTop: 8 }}>Only click after you've completed the bank transfer.</div>
      </div>}

      {vendor.business_phone && <div style={{ padding: "16px 24px", borderTop: "1px solid var(--bl)", textAlign: "center", fontSize: 12, color: "var(--t2)" }}>
        Need help? <a href={`https://wa.me/234${vendor.business_phone.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--g)", fontWeight: 600 }}>Contact {vendor.business_name} on WhatsApp</a>
      </div>}
    </div></div>
  </>;
}
