"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { CSS } from "../lib/styles";
import { I, OjaLogo, OjaLogoSm } from "../lib/icons";
import { uid, fmt, fmtDate, today, STATUSES, PAY_METHODS, FLOW_LABELS, compressImg, slugify, normalizePhone, genToken } from "../lib/utils";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) { setProfile(null); setLoading(false); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      setProfile(data);
      setLoading(false);
      if (data) await supabase.from("activity_log").insert({ user_id: session.user.id, action: "login" });
    })();
  }, [session]);

  if (loading) return <><style>{CSS}</style><div className="loading-screen"><div className="spinner" /></div></>;
  if (!session) return <><style>{CSS}</style><AuthScreen /></>;
  if (!profile || !profile.business_name || profile.business_name === "My Business") return <><style>{CSS}</style><Onboarding session={session} onComplete={setProfile} /></>;
  return <><style>{CSS}</style><Dashboard session={session} profile={profile} onProfile={setProfile} /></>;
}

export function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(""); setMsg(""); setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error; setMsg("Check your email to confirm, then sign in."); setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) { setError(err.message || "Something went wrong"); } finally { setBusy(false); }
  };

  return <div className="auth-wrap"><div className="auth-card">
    <div className="auth-logo"><OjaLogo w={68} color="var(--g)" /></div>
    <div className="auth-title">{mode === "signup" ? "Create your account" : "Welcome back"}</div>
    <div className="auth-sub">{mode === "signup" ? "Start managing your business in under 2 minutes" : "Sign in to your dashboard"}</div>
    {error && <div className="auth-err">{error}</div>}
    {msg && <div className="auth-ok">{msg}</div>}
    <form onSubmit={submit}>
      <div className="auth-fg"><label className="auth-fl">Email</label><input className="auth-fi" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="auth-fg"><label className="auth-fl">Password</label><input className="auth-fi" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} /></div>
      <button className="auth-btn auth-btn-p" type="submit" disabled={busy}>{busy ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"} {!busy && I.arr}</button>
    </form>
    <div className="auth-sw">
      {mode === "login" ? <>New here? <button onClick={() => { setMode("signup"); setError(""); setMsg(""); }}>Create an account</button></> : <>Have an account? <button onClick={() => { setMode("login"); setError(""); setMsg(""); }}>Sign in</button></>}
    </div>
  </div></div>;
}

export function Onboarding({ session, onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(""); const [type, setType] = useState(""); const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    setBusy(true);
    const slug = slugify(name) + "-" + session.user.id.slice(0, 6);
    const { data } = await supabase.from("profiles").upsert({
      id: session.user.id, business_name: name.trim(), business_type: type, business_phone: phone.trim(),
      business_email: session.user.email, slug, accepts_orders: true,
    }).select().single();
    setBusy(false);
    if (data) { await supabase.from("activity_log").insert({ user_id: session.user.id, action: "onboarded" }); onComplete(data); }
  };

  const Dots = ({ n }) => <div style={{display:"flex",gap:6,justifyContent:"center",margin:"22px 0"}}>{[1,2,3].map(i => <div key={i} style={{width: i===n?24:8, height:8, borderRadius: i===n?4:50, background: i===n?"var(--g)":"var(--b)"}}/>)}</div>;

  if (step === 1) return <div className="onboard"><div className="ob-card">
    <OjaLogo w={80} color="var(--g)" /><Dots n={1} />
    <h2>Business name?</h2><p>This appears on your storefront and invoices.</p>
    <input className="auth-fi" style={{textAlign:"center",marginBottom:16}} placeholder="e.g. Chioma's Glam Studio" value={name} onChange={e => setName(e.target.value)} autoFocus />
    <button className="obb obb-p" disabled={!name.trim()} onClick={() => setStep(2)}>Continue {I.arr}</button>
  </div></div>;

  if (step === 2) return <div className="onboard"><div className="ob-card">
    <OjaLogo w={80} color="var(--g)" /><Dots n={2} />
    <h2>What do you do?</h2><p>We'll customize your dashboard.</p>
    <div className="tg">
      {[["products","Products","Physical goods",I.box],["services","Services","Bookings & gigs",I.tool],["both","Both","Products & services",I.both]].map(([v,l,d,ic]) =>
        <div key={v} className={`tc ${type === v ? "sel" : ""}`} onClick={() => setType(v)}><div className="tci">{ic}</div><div className="tcl">{l}</div><div className="tcd">{d}</div></div>
      )}
    </div>
    <button className="obb obb-p" disabled={!type} onClick={() => setStep(3)}>Continue {I.arr}</button>
    <button className="obb obb-s" onClick={() => setStep(1)}>Back</button>
  </div></div>;

  return <div className="onboard"><div className="ob-card">
    <OjaLogo w={80} color="var(--g)" /><Dots n={3} />
    <h2>Almost done</h2><p>Your phone number (optional).</p>
    <input className="auth-fi" style={{textAlign:"center",marginBottom:16}} placeholder="08012345678" value={phone} onChange={e => setPhone(e.target.value)} />
    <button className="obb obb-p" disabled={busy} onClick={finish}>{busy ? "Setting up..." : "Launch Dashboard"} {!busy && I.arr}</button>
    <button className="obb obb-s" onClick={() => setStep(2)}>Back</button>
  </div></div>;
}

export function Dashboard({ session, profile, onProfile }) {
  const [page, setPage] = useState("dashboard");
  const [items, setItems] = useState([]); const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]); const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [modal, setModal] = useState(null); const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState(""); const [loaded, setLoaded] = useState(false);
  const [bugOpen, setBugOpen] = useState(false);

  useEffect(() => { loadAll(); const t = setInterval(loadOrders, 15000); return () => clearInterval(t); }, []);

  async function loadAll() {
    const uid2 = session.user.id;
    const [i, c, o, p, inv] = await Promise.all([
      supabase.from("items").select("*").eq("user_id", uid2).order("created_at", { ascending: false }),
      supabase.from("customers").select("*").eq("user_id", uid2).order("created_at", { ascending: false }),
      supabase.from("orders").select("*").eq("user_id", uid2).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").eq("user_id", uid2),
      supabase.from("invoices").select("*").eq("user_id", uid2).order("created_at", { ascending: false }),
    ]);
    setItems(i.data || []); setCustomers(c.data || []); setOrders(o.data || []); setPayments(p.data || []); setInvoices(inv.data || []);
    setLoaded(true);
  }
  async function loadOrders() {
    const { data } = await supabase.from("orders").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    if (data) setOrders(data);
    const { data: pd } = await supabase.from("payments").select("*").eq("user_id", session.user.id);
    if (pd) setPayments(pd);
  }

  const logout = async () => { await supabase.auth.signOut(); };
  const biz = profile.business_type || "both";
  const showP = biz === "products" || biz === "both";
  const showS = biz === "services" || biz === "both";
  const catL = biz === "products" ? "Products" : biz === "services" ? "Services" : "Products & Services";
  const ordL = biz === "services" ? "Bookings" : biz === "products" ? "Orders" : "Orders & Bookings";

  const urgentCount = orders.filter(o => o.flow_status === "awaiting_pricing" || o.flow_status === "payment_claimed").length;
  const pending = orders.filter(o => o.status === "Pending" || o.status === "In Progress").length;

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: I.dashboard },
    { id: "orders", label: ordL, icon: I.orders, badge: urgentCount || pending || null, urgent: urgentCount > 0 },
    { id: "catalog", label: catL, icon: I.catalog },
    { id: "customers", label: "Customers", icon: I.customers },
    { id: "invoices", label: "Invoices", icon: I.invoice },
    { id: "storefront", label: "Storefront", icon: I.store },
    { id: "settings", label: "Settings", icon: I.settings },
  ];

  const payFor = (orderId) => payments.filter(p => p.order_id === orderId);
  const paidAmount = (orderId) => payFor(orderId).reduce((s, p) => s + Number(p.amount), 0);

  const cx = { session, profile, onProfile, items, setItems, customers, setCustomers, orders, setOrders, payments, setPayments, invoices, setInvoices, modal, setModal, search, setSearch, showP, showS, biz, catL, ordL, payFor, paidAmount, reload: loadAll, goTo: setPage };

  if (!loaded) return <div className="loading-screen"><div className="spinner" /></div>;

  return <div className="app">
    <div className="mh-bar"><OjaLogoSm /><button className="mh-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>{I.menu}</button></div>
    <div className={`sb-ov ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sb-brand"><OjaLogoSm /></div>
      <nav>{NAV.map(n => <button key={n.id} className={`ni ${page === n.id ? "act" : ""}`} onClick={() => { setPage(n.id); setSidebarOpen(false); setSearch(""); }}>{n.icon}{n.label}{n.badge && <span className={`nb ${n.urgent ? "nb-urgent" : ""}`}>{n.badge}</span>}</button>)}</nav>
      <div className="sf"><div className="sft">{profile.business_name}</div><button className="sf-logout" onClick={() => setBugOpen(true)} style={{ marginBottom: 4 }}>{I.flag} Report a problem</button><button className="sf-logout" onClick={logout}>{I.logout} Sign out</button></div>
    </aside>
    <main className="main">
      {page === "dashboard" && <DashPage {...cx} />}
      {page === "catalog" && <CatPage {...cx} />}
      {page === "customers" && <CustPage {...cx} />}
      {page === "orders" && <OrdPage {...cx} />}
      {page === "invoices" && <InvPage {...cx} />}
      {page === "storefront" && <StorePage {...cx} />}
      {page === "settings" && <SettPage {...cx} />}
    </main>
    {bugOpen && <BugReportModal session={session} profile={profile} role="vendor" onClose={() => setBugOpen(false)} />}
  </div>;
}

function Modal({ title, children, onClose, wide }) { return <div className="mo" onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="ml" style={wide ? { maxWidth: 680 } : {}}><div className="mh"><div className="mt">{title}</div><button className="mc" onClick={onClose}>{I.close}</button></div>{children}</div></div>; }
function ImgUp({ value, onChange }) { const ref = useRef(); return <div className="img-up" onClick={() => ref.current?.click()}><input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={async e => { const f = e.target.files[0]; if (f) onChange(await compressImg(f)); }} />{value ? <><img src={value} alt="" /><button className="rm" onClick={e => { e.stopPropagation(); onChange(""); }}>&times;</button></> : <div className="pht">{I.cam}<span>Add Photo</span></div>}</div>; }

// ══════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════
function DashPage({ profile, orders, customers, items, invoices, paidAmount, goTo, catL, ordL }) {
  const active = orders.filter(o => o.status === "Pending" || o.status === "In Progress");
  const totalPaid = orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + paidAmount(o.id), 0);
  const totalOwed = orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + Math.max(0, Number(o.total || 0) - paidAmount(o.id)), 0);
  const urgent = orders.filter(o => o.flow_status === "awaiting_pricing" || o.flow_status === "payment_claimed");
  const l7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const k = d.toISOString().slice(0, 10); return { label: d.toLocaleDateString("en-NG", { weekday: "short" }), rev: orders.filter(o => o.date === k && o.status !== "Cancelled").reduce((s, o) => s + paidAmount(o.id), 0), k }; });
  const mx = Math.max(...l7.map(d => d.rev), 1);
  const recent = [...orders].slice(0, 5);

  return <div>
    <div className="ph"><div><div className="pt">Dashboard</div><div className="ps">{profile.business_name}</div></div></div>
    {urgent.length > 0 && <div className="card" style={{ marginBottom: 20, background: "var(--aml)", border: "1px solid #eed9a0", cursor: "pointer" }} onClick={() => goTo("orders")}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div><div style={{ fontWeight: 700, fontSize: 13, color: "var(--am)", marginBottom: 2 }}>{urgent.length} action{urgent.length !== 1 ? "s" : ""} needed</div><div style={{ fontSize: 12, color: "var(--t2)" }}>You have orders awaiting your response</div></div>
        <button className="btn btn-p btn-sm">Review orders</button>
      </div>
    </div>}
    <div className="cg">
      <div className="card sc"><div className="si" style={{ background: "var(--gl)", color: "var(--g)" }}>{"\u20A6"}</div><div className="sl">Received</div><div className="sv">{fmt(totalPaid)}</div></div>
      <div className="card sc"><div className="si" style={{ background: "var(--aml)", color: "var(--am)" }}>!</div><div className="sl">Outstanding</div><div className="sv">{fmt(totalOwed)}</div></div>
      <div className="card sc"><div className="si" style={{ background: "var(--bll)", color: "var(--bl2)" }}>#</div><div className="sl">Active</div><div className="sv">{active.length}</div></div>
      <div className="card sc"><div className="si" style={{ background: "var(--pl)", color: "var(--p)" }}>{I.customers}</div><div className="sl">Customers</div><div className="sv">{customers.length}</div></div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
      <div className="card" style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 14 }}>Revenue (7 days)</div><div className="bar-chart">{l7.map(d => <div className="bar-col" key={d.k}><div className="bar" style={{ height: `${(d.rev / mx) * 100}%`, background: d.rev > 0 ? "var(--g)" : "var(--b)" }} /><div className="bar-label">{d.label}</div></div>)}</div></div>
      <div className="card" style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 14 }}>Snapshot</div>{[[catL, items.length], ["Completed", orders.filter(o => o.status === "Completed").length], ["Invoices", invoices.length]].map(([l, v]) => <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0" }}><span style={{ color: "var(--t2)" }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span></div>)}</div>
    </div>
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><div style={{ fontWeight: 600, fontSize: 12.5 }}>Recent {ordL}</div>{orders.length > 5 && <button className="btn btn-g btn-sm" onClick={() => goTo("orders")}>View all</button>}</div>
      {recent.length === 0 ? <div className="empty"><p>No {ordL.toLowerCase()} yet.</p></div> : <div className="tw"><table><thead><tr><th>Customer</th><th>Item</th><th>Total</th><th>Status</th></tr></thead><tbody>{recent.map(o => <tr key={o.id}><td style={{ fontWeight: 500 }}>{o.customer_name || "Walk-in"}</td><td>{o.item_name}</td><td>{fmt(o.total)}</td><td><span className={`badge ${flowBadge(o)}`}>{flowLabel(o)}</span></td></tr>)}</tbody></table></div>}
    </div>
  </div>;
}

function flowLabel(o) {
  if (o.source === "storefront" && o.flow_status && o.flow_status !== "completed" && o.flow_status !== "cancelled") return FLOW_LABELS[o.flow_status] || o.status;
  return o.status;
}
function flowBadge(o) {
  if (o.source === "storefront") {
    if (o.flow_status === "awaiting_pricing") return "bg-r";
    if (o.flow_status === "payment_claimed") return "bg-r";
    if (o.flow_status === "awaiting_payment") return "bg-a";
    if (o.flow_status === "confirmed" || o.flow_status === "shipped") return "bg-b";
    if (o.flow_status === "completed") return "bg-g";
    if (o.flow_status === "cancelled") return "bg-gr";
  }
  return o.status === "Completed" ? "bg-g" : o.status === "Cancelled" ? "bg-r" : o.status === "In Progress" ? "bg-b" : "bg-a";
}

// ══════════════════════════════════════════════════════════════
// CATALOG
// ══════════════════════════════════════════════════════════════
function CatPage({ session, items, setItems, modal, setModal, search, setSearch, biz, catL, showP }) {
  const [tab, setTab] = useState("All");
  const dt = biz === "products" ? "Product" : biz === "services" ? "Service" : "Product";
  const filtered = items.filter(i => tab === "All" || i.type === tab).filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const save = async (item) => {
    if (item.id) { const { data } = await supabase.from("items").update({ type: item.type, name: item.name, price: item.price, description: item.description, stock: item.stock, image: item.image }).eq("id", item.id).select().single(); if (data) setItems(items.map(i => i.id === data.id ? data : i)); }
    else { const { data } = await supabase.from("items").insert({ user_id: session.user.id, type: item.type, name: item.name, price: item.price, description: item.description, stock: item.stock, image: item.image }).select().single(); if (data) setItems([data, ...items]); }
    setModal(null);
  };
  const del = async (id) => { await supabase.from("items").delete().eq("id", id); setItems(items.filter(i => i.id !== id)); };
  return <div>
    <div className="ph"><div><div className="pt">{catL}</div><div className="ps">{items.length} item{items.length !== 1 ? "s" : ""}</div></div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button className="btn btn-s" onClick={() => setModal({ t: "bulk", d: null })}>Bulk upload</button><button className="btn btn-p" onClick={() => setModal({ t: "item", d: { type: dt, name: "", price: "", description: "", stock: "", image: "" } })}>{I.plus} Add</button></div></div>
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
      {biz === "both" && <div className="tabs" style={{ marginBottom: 0, borderBottom: "none" }}>{["All", "Product", "Service"].map(t => <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t === "All" ? "All" : t + "s"}</button>)}</div>}
      <div className="sb-w" style={{ marginLeft: "auto" }}><span className="ic">{I.search}</span><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
    </div>
    {filtered.length === 0 ? <div className="card"><div className="empty"><p>No items yet.</p></div></div> : <>
      <div className="card" style={{ padding: 0 }}><div className="tw"><table><thead><tr><th style={{ width: 48 }}></th><th>Name</th>{biz === "both" && <th>Type</th>}<th>Price</th>{showP && <th>Stock</th>}<th style={{ width: 70 }}></th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td>{item.image ? <img className="ith" src={item.image} alt="" /> : <div className="ith" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t3)" }}>{I.cam}</div>}</td><td style={{ fontWeight: 500 }}>{item.name}{item.description && <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 1 }}>{item.description.slice(0, 45)}</div>}</td>{biz === "both" && <td><span className={`badge ${item.type === "Product" ? "bg-b" : "bg-p"}`}>{item.type}</span></td>}<td>{item.price ? fmt(item.price) : <span style={{ color: "var(--t3)" }}>Varies</span>}</td>{showP && <td>{item.type === "Product" ? (item.stock ?? "\u2014") : "\u2014"}</td>}<td><div className="ar"><button className="ab" onClick={() => setModal({ t: "item", d: { ...item } })}>{I.edit}</button><button className="ab dng" onClick={() => del(item.id)}>{I.trash}</button></div></td></tr>)}</tbody></table></div></div>
      <div className="mcards">{filtered.map(item => <div key={item.id} className="mcard">
        <div className="mcard-top">
          <div className="mcard-tl">
            {item.image ? <img className="mcard-thumb" src={item.image} alt="" /> : <div className="mcard-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t3)" }}>{I.cam}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mcard-name">{item.name}</div>
              {item.description && <div className="mcard-sub">{item.description.slice(0, 60)}</div>}
            </div>
          </div>
          {biz === "both" && <span className={`badge ${item.type === "Product" ? "bg-b" : "bg-p"}`}>{item.type}</span>}
        </div>
        <div className="mcard-stats">
          <div className="mcard-stat"><span className="k">Price</span><span className="v">{item.price ? fmt(item.price) : "Varies"}</span></div>
          {showP && item.type === "Product" && <div className="mcard-stat"><span className="k">Stock</span><span className="v">{item.stock ?? "\u2014"}</span></div>}
        </div>
        <div className="mcard-actions">
          <button className="btn btn-s btn-sm" onClick={(e) => { e.stopPropagation(); setModal({ t: "item", d: { ...item } }); }}>{I.edit} Edit</button>
          <button className="btn btn-d btn-sm" onClick={(e) => { e.stopPropagation(); if (confirm("Delete this item?")) del(item.id); }}>{I.trash} Delete</button>
        </div>
      </div>)}</div>
    </>}
    {modal?.t === "item" && <Modal title={modal.d.id ? "Edit Item" : "Add Item"} onClose={() => setModal(null)}><ItemForm d={modal.d} save={save} cancel={() => setModal(null)} biz={biz} /></Modal>}
    {modal?.t === "bulk" && <Modal title="Bulk Upload Items" onClose={() => setModal(null)} wide><BulkUpload session={session} biz={biz} items={items} setItems={setItems} close={() => setModal(null)} /></Modal>}
  </div>;
}
function ItemForm({ d, save, cancel, biz }) {
  const [f, sf] = useState(d); const set = (k, v) => sf(p => ({ ...p, [k]: v })); const [busy, setBusy] = useState(false);
  return <div><div className="mb"><div className="fg"><label className="fl">Photo</label><ImgUp value={f.image} onChange={v => set("image", v)} /></div><div className="fr">{biz === "both" && <div className="fg"><label className="fl">Type</label><select className="fs" value={f.type} onChange={e => set("type", e.target.value)}><option>Product</option><option>Service</option></select></div>}<div className="fg"><label className="fl">Price (NGN)</label><input className="fi" type="number" placeholder="Empty = varies" value={f.price || ""} onChange={e => set("price", e.target.value)} /></div></div><div className="fg"><label className="fl">Name</label><input className="fi" placeholder={f.type === "Service" ? "e.g. Bridal Makeup" : "e.g. Ankara Fabric"} value={f.name} onChange={e => set("name", e.target.value)} /></div>{f.type === "Product" && <div className="fg"><label className="fl">Stock</label><input className="fi" type="number" placeholder="Optional" value={f.stock || ""} onChange={e => set("stock", e.target.value)} /></div>}<div className="fg"><label className="fl">Description</label><textarea className="ft" placeholder="Brief description..." value={f.description || ""} onChange={e => set("description", e.target.value)} /></div></div><div className="mf"><button className="btn btn-s" onClick={cancel}>Cancel</button><button className="btn btn-p" disabled={!f.name.trim() || busy} onClick={async () => { setBusy(true); await save({ ...f, price: f.price ? Number(f.price) : null, stock: f.stock ? Number(f.stock) : null }); setBusy(false); }}>{busy ? "Saving..." : "Save"}</button></div></div>;
}

// ══════════════════════════════════════════════════════════════
// BULK UPLOAD (CSV)
// ══════════════════════════════════════════════════════════════
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(l => l.trim());
  return lines.map(line => {
    const cells = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === ",") { cells.push(cur); cur = ""; }
        else cur += c;
      }
    }
    cells.push(cur);
    return cells.map(c => c.trim());
  });
}

function BulkUpload({ session, biz, items, setItems, close }) {
  const [rows, setRows] = useState(null); // [{name, type, price, stock, description, _error}]
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // {inserted, failed}
  const fileRef = useRef();

  const downloadTemplate = () => {
    const defaultType = biz === "services" ? "Service" : "Product";
    const csv = [
      "name,type,price,stock,description",
      biz === "services" ? "Bridal Makeup,Service,80000,,Includes trial session" : "Banana Bread,Product,10000,15,Fresh baked daily",
      biz === "services" ? "Party Makeup,Service,35000,,Onsite or studio" : "Coconut Cookies,Product,5000,30,Pack of 12",
      biz === "both" ? "Studio Booking,Service,15000,,Per hour" : `Sample Item,${defaultType},12000,,Short description here`,
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "stallhq-items-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const text = await f.text();
    const parsed = parseCSV(text);
    if (parsed.length < 2) { alert("CSV is empty or has no data rows."); return; }

    const headers = parsed[0].map(h => h.toLowerCase());
    const idx = {
      name: headers.indexOf("name"),
      type: headers.indexOf("type"),
      price: headers.indexOf("price"),
      stock: headers.indexOf("stock"),
      description: headers.indexOf("description"),
    };
    if (idx.name === -1) { alert("CSV must include a 'name' column. Please download the template."); return; }

    const defaultType = biz === "services" ? "Service" : "Product";
    const validated = parsed.slice(1).map((row, i) => {
      const name = (row[idx.name] || "").trim();
      const typeRaw = idx.type !== -1 ? (row[idx.type] || "").trim() : "";
      const priceRaw = idx.price !== -1 ? (row[idx.price] || "").trim() : "";
      const stockRaw = idx.stock !== -1 ? (row[idx.stock] || "").trim() : "";
      const description = idx.description !== -1 ? (row[idx.description] || "").trim() : "";

      let _error = "";
      if (!name) _error = "Name is required";

      let type = typeRaw;
      if (type && !["Product", "Service"].includes(type)) {
        // case-insensitive match
        const t = type.toLowerCase();
        if (t === "product" || t === "products") type = "Product";
        else if (t === "service" || t === "services") type = "Service";
        else { _error = _error || `Type must be Product or Service (got "${typeRaw}")`; }
      }
      if (!type) type = defaultType;
      if (biz === "products" && type !== "Product") _error = _error || "Your business is products-only; type must be Product";
      if (biz === "services" && type !== "Service") _error = _error || "Your business is services-only; type must be Service";

      let price = null;
      if (priceRaw) {
        const p = Number(priceRaw.replace(/[,\s\u20A6]/g, ""));
        if (isNaN(p) || p < 0) _error = _error || `Price must be a number (got "${priceRaw}")`;
        else price = p;
      }

      let stock = null;
      if (stockRaw) {
        const s = Number(stockRaw);
        if (isNaN(s) || s < 0 || !Number.isInteger(s)) _error = _error || `Stock must be a whole number (got "${stockRaw}")`;
        else stock = s;
      }

      return { rowNum: i + 2, name, type, price, stock, description, _error };
    });

    setRows(validated);
    setResult(null);
  };

  const validCount = rows ? rows.filter(r => !r._error).length : 0;
  const errorCount = rows ? rows.filter(r => r._error).length : 0;

  const importAll = async () => {
    setBusy(true);
    const good = rows.filter(r => !r._error);
    const payload = good.map(r => ({
      user_id: session.user.id,
      name: r.name, type: r.type, price: r.price, stock: r.stock,
      description: r.description || null, image: null,
    }));
    let inserted = 0, failed = 0;
    if (payload.length > 0) {
      const { data, error } = await supabase.from("items").insert(payload).select();
      if (error) { failed = payload.length; }
      else { inserted = data.length; setItems([...data, ...items]); }
    }
    setBusy(false);
    setResult({ inserted, failed, skipped: errorCount });
  };

  if (result) {
    return <div>
      <div className="mb">
        <div style={{ padding: 20, background: "var(--gl)", borderRadius: 10, textAlign: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--fm)", fontWeight: 700, fontSize: 20, color: "var(--g)", marginBottom: 4 }}>{result.inserted}</div>
          <div style={{ fontSize: 12, color: "var(--t2)" }}>item{result.inserted !== 1 ? "s" : ""} imported successfully</div>
        </div>
        {result.skipped > 0 && <div style={{ padding: 12, background: "var(--aml)", color: "var(--am)", borderRadius: 8, fontSize: 12.5, marginBottom: 10 }}>
          {result.skipped} row{result.skipped !== 1 ? "s were" : " was"} skipped due to errors. Fix them in your CSV and upload again to add them.
        </div>}
        {result.failed > 0 && <div style={{ padding: 12, background: "var(--rl)", color: "var(--r)", borderRadius: 8, fontSize: 12.5 }}>
          {result.failed} row{result.failed !== 1 ? "s" : ""} failed to save. Try again or contact support.
        </div>}
      </div>
      <div className="mf"><button className="btn btn-p" onClick={close}>Done</button></div>
    </div>;
  }

  if (!rows) {
    return <div>
      <div className="mb">
        <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 16 }}>
          Upload a CSV file to add multiple items at once. Each row becomes one item. You can add images later by editing individual items.
        </div>
        <div style={{ padding: 14, background: "var(--bg)", borderRadius: 10, fontSize: 12.5, marginBottom: 16, fontFamily: "var(--fm)", lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Required column:</div>
          <div>\u2022 <b>name</b> \u2014 item name</div>
          <div style={{ fontWeight: 700, marginTop: 10, marginBottom: 6 }}>Optional columns:</div>
          <div>\u2022 <b>type</b> \u2014 Product or Service (defaults to {biz === "services" ? "Service" : "Product"})</div>
          <div>\u2022 <b>price</b> \u2014 number in NGN (empty = "varies")</div>
          <div>\u2022 <b>stock</b> \u2014 whole number (Products only; empty = untracked)</div>
          <div>\u2022 <b>description</b> \u2014 free text</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-s" onClick={downloadTemplate}>Download template</button>
          <button className="btn btn-p" onClick={() => fileRef.current?.click()}>Choose CSV file</button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={onFile} />
        </div>
      </div>
      <div className="mf"><button className="btn btn-s" onClick={close}>Cancel</button></div>
    </div>;
  }

  return <div>
    <div className="mb">
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ padding: "8px 14px", background: "var(--gl)", color: "var(--g)", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{validCount} valid</div>
        {errorCount > 0 && <div style={{ padding: "8px 14px", background: "var(--rl)", color: "var(--r)", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{errorCount} with errors</div>}
      </div>
      <div style={{ maxHeight: "50vh", overflowY: "auto", border: "1px solid var(--b)", borderRadius: 8 }}>
        <table style={{ width: "100%", fontSize: 12 }}>
          <thead style={{ position: "sticky", top: 0, background: "var(--sh)" }}>
            <tr><th style={{ padding: "8px 10px", textAlign: "left", width: 40 }}>#</th><th style={{ padding: "8px 10px", textAlign: "left" }}>Name</th><th style={{ padding: "8px 10px", textAlign: "left" }}>Type</th><th style={{ padding: "8px 10px", textAlign: "left" }}>Price</th><th style={{ padding: "8px 10px", textAlign: "left" }}>Stock</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => <tr key={i} style={{ background: r._error ? "var(--rl)" : "transparent" }}>
              <td style={{ padding: "7px 10px", color: "var(--t3)", fontFamily: "var(--fm)", fontSize: 11 }}>{r.rowNum}</td>
              <td style={{ padding: "7px 10px", fontWeight: 500 }}>{r.name || <span style={{ color: "var(--r)" }}>(missing)</span>}{r._error && <div style={{ fontSize: 10.5, color: "var(--r)", marginTop: 2 }}>\u26a0 {r._error}</div>}</td>
              <td style={{ padding: "7px 10px" }}>{r.type}</td>
              <td style={{ padding: "7px 10px" }}>{r.price !== null ? fmt(r.price) : "\u2014"}</td>
              <td style={{ padding: "7px 10px" }}>{r.stock !== null ? r.stock : "\u2014"}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
    <div className="mf">
      <button className="btn btn-s" onClick={() => setRows(null)}>Back</button>
      <button className="btn btn-p" disabled={busy || validCount === 0} onClick={importAll}>{busy ? "Importing..." : `Import ${validCount} item${validCount !== 1 ? "s" : ""}`}</button>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
// CUSTOMERS
// ══════════════════════════════════════════════════════════════
function CustPage({ session, customers, setCustomers, orders, payFor, modal, setModal, search, setSearch }) {
  const fil = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || "").includes(search));
  const save = async (c) => {
    if (c.id) { const { data } = await supabase.from("customers").update({ name: c.name, phone: c.phone, email: c.email, address: c.address, notes: c.notes }).eq("id", c.id).select().single(); if (data) setCustomers(customers.map(x => x.id === data.id ? data : x)); }
    else { const { data } = await supabase.from("customers").insert({ user_id: session.user.id, name: c.name, phone: c.phone, email: c.email, address: c.address, notes: c.notes }).select().single(); if (data) setCustomers([data, ...customers]); }
    setModal(null);
  };
  const del = async (id) => { await supabase.from("customers").delete().eq("id", id); setCustomers(customers.filter(c => c.id !== id)); };
  const spent = (id) => orders.filter(o => o.customer_id === id && o.status !== "Cancelled").reduce((s, o) => s + payFor(o.id).reduce((ps, p) => ps + Number(p.amount), 0), 0);

  // Find storefront orders whose customer hasn't been added yet
  const orphanOrders = orders.filter(o => o.source === "storefront" && !o.customer_id && o.customer_phone);
  const uniqueOrphans = Array.from(new Map(orphanOrders.map(o => [normalizePhone(o.customer_phone), o])).values());

  const importAll = async () => {
    for (const o of uniqueOrphans) {
      const existing = customers.find(c => c.phone && normalizePhone(c.phone) === normalizePhone(o.customer_phone));
      let custId = existing?.id;
      if (!existing) {
        const { data } = await supabase.from("customers").insert({
          user_id: session.user.id,
          name: o.customer_name || "Storefront Customer",
          phone: o.customer_phone,
          address: o.delivery_address || null,
        }).select().single();
        if (data) { setCustomers(prev => [data, ...prev]); custId = data.id; }
      }
      if (custId) await supabase.from("orders").update({ customer_id: custId }).eq("id", o.id);
    }
    // refresh local orders state to reflect new customer_id links (reload from parent would be ideal; user can refresh)
    window.location.reload();
  };

  return <div>
    <div className="ph"><div><div className="pt">Customers</div><div className="ps">{customers.length}</div></div><button className="btn btn-p" onClick={() => setModal({ t: "c", d: { name: "", phone: "", email: "", address: "", notes: "" } })}>{I.plus} Add</button></div>
    {uniqueOrphans.length > 0 && <div className="card" style={{ marginBottom: 18, background: "var(--aml)", border: "1px solid #eed9a0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{uniqueOrphans.length} storefront customer{uniqueOrphans.length !== 1 ? "s" : ""} not yet saved</div><div style={{ fontSize: 12, color: "var(--t2)" }}>Import customers from past storefront orders</div></div>
        <button className="btn btn-p btn-sm" onClick={importAll}>Import all</button>
      </div>
    </div>}
    <div style={{ marginBottom: 18 }}><div className="sb-w"><span className="ic">{I.search}</span><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
    {fil.length === 0 ? <div className="card"><div className="empty"><p>No customers yet.</p></div></div> : <>
      <div className="card" style={{ padding: 0 }}><div className="tw"><table><thead><tr><th>Name</th><th>Phone</th><th>Orders</th><th>Spent</th><th style={{ width: 90 }}></th></tr></thead><tbody>{fil.map(c => <tr key={c.id}><td style={{ fontWeight: 500 }}>{c.name}</td><td>{c.phone || "\u2014"}</td><td>{orders.filter(o => o.customer_id === c.id).length}</td><td>{fmt(spent(c.id))}</td><td><div className="ar">{c.phone && <a className="ab" href={`https://wa.me/234${c.phone.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer">{I.wa}</a>}<button className="ab" onClick={() => setModal({ t: "c", d: { ...c } })}>{I.edit}</button><button className="ab dng" onClick={() => del(c.id)}>{I.trash}</button></div></td></tr>)}</tbody></table></div></div>
      <div className="mcards">{fil.map(c => <div key={c.id} className="mcard">
        <div className="mcard-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mcard-name">{c.name}</div>
            {c.phone && <div className="mcard-sub">{c.phone}</div>}
          </div>
        </div>
        <div className="mcard-stats">
          <div className="mcard-stat"><span className="k">Orders</span><span className="v">{orders.filter(o => o.customer_id === c.id).length}</span></div>
          <div className="mcard-stat"><span className="k">Spent</span><span className="v pos">{fmt(spent(c.id))}</span></div>
        </div>
        <div className="mcard-actions">
          {c.phone && <a className="btn btn-s btn-sm" href={`https://wa.me/234${c.phone.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>{I.wa} WhatsApp</a>}
          <button className="btn btn-s btn-sm" onClick={() => setModal({ t: "c", d: { ...c } })}>{I.edit} Edit</button>
          <button className="btn btn-d btn-sm" onClick={() => { if (confirm("Delete this customer?")) del(c.id); }}>{I.trash}</button>
        </div>
      </div>)}</div>
    </>}
    {modal?.t === "c" && <Modal title={modal.d.id ? "Edit Customer" : "Add Customer"} onClose={() => setModal(null)}><CForm d={modal.d} save={save} cancel={() => setModal(null)} /></Modal>}
  </div>;
}
function CForm({ d, save, cancel }) {
  const [f, sf] = useState(d); const set = (k, v) => sf(p => ({ ...p, [k]: v })); const [busy, setBusy] = useState(false);
  return <div><div className="mb"><div className="fg"><label className="fl">Name</label><input className="fi" value={f.name} onChange={e => set("name", e.target.value)} /></div><div className="fr"><div className="fg"><label className="fl">Phone</label><input className="fi" placeholder="08012345678" value={f.phone || ""} onChange={e => set("phone", e.target.value)} /></div><div className="fg"><label className="fl">Email</label><input className="fi" placeholder="Optional" value={f.email || ""} onChange={e => set("email", e.target.value)} /></div></div><div className="fg"><label className="fl">Address</label><input className="fi" value={f.address || ""} onChange={e => set("address", e.target.value)} /></div><div className="fg"><label className="fl">Notes</label><textarea className="ft" placeholder="Preferences, measurements..." value={f.notes || ""} onChange={e => set("notes", e.target.value)} /></div></div><div className="mf"><button className="btn btn-s" onClick={cancel}>Cancel</button><button className="btn btn-p" disabled={!f.name.trim() || busy} onClick={async () => { setBusy(true); await save(f); setBusy(false); }}>{busy ? "Saving..." : "Save"}</button></div></div>;
}

// ══════════════════════════════════════════════════════════════
// ORDERS (with storefront flow)
// ══════════════════════════════════════════════════════════════
function OrdPage({ session, orders, setOrders, customers, setCustomers, items, payments, setPayments, payFor, paidAmount, modal, setModal, search, setSearch, ordL, profile, reload }) {
  const [tab, setTab] = useState("Action Needed");

  const actionNeeded = (o) => o.flow_status === "awaiting_pricing" || o.flow_status === "payment_claimed";
  const fromStorefront = (o) => o.source === "storefront";

  const fil = orders.filter(o => {
    if (tab === "Action Needed") return actionNeeded(o);
    if (tab === "All") return true;
    if (tab === "Storefront") return fromStorefront(o);
    return o.status === tab;
  }).filter(o => (o.customer_name || "").toLowerCase().includes(search.toLowerCase()) || (o.item_name || "").toLowerCase().includes(search.toLowerCase()));

  const saveOrder = async (o, newPayments) => {
    let saved;
    const isNew = !o.id;
    const payload = { date: o.date, customer_id: o.customer_id || null, customer_name: o.customer_name, item_id: o.item_id || null, item_name: o.item_name, total: Number(o.total) || 0, status: o.status, notes: o.notes, flow_status: o.flow_status || "active" };
    if (o.id) { const { data } = await supabase.from("orders").update(payload).eq("id", o.id).select().single(); saved = data; if (saved) setOrders(orders.map(x => x.id === saved.id ? saved : x)); }
    else { const { data } = await supabase.from("orders").insert({ user_id: session.user.id, ...payload }).select().single(); saved = data; if (saved) setOrders([saved, ...orders]); }
    if (saved) {
      if (isNew) supabase.from("activity_log").insert({ user_id: session.user.id, action: "order_created" });
      if (newPayments) {
        await supabase.from("payments").delete().eq("order_id", saved.id);
        if (newPayments.length > 0) { const rows = newPayments.map(p => ({ order_id: saved.id, user_id: session.user.id, amount: Number(p.amount), method: p.method, date: p.date, note: p.note || null })); const { data: np } = await supabase.from("payments").insert(rows).select(); setPayments([...payments.filter(p => p.order_id !== saved.id), ...(np || [])]); if (np && np.length > 0) supabase.from("activity_log").insert({ user_id: session.user.id, action: "payment_recorded" }); }
        else setPayments(payments.filter(p => p.order_id !== saved.id));
      }
    }
    setModal(null);
  };
  const del = async (id) => { await supabase.from("orders").delete().eq("id", id); setOrders(orders.filter(o => o.id !== id)); setPayments(payments.filter(p => p.order_id !== id)); };

  const actionNeededCount = orders.filter(actionNeeded).length;
  const storefrontCount = orders.filter(fromStorefront).length;

  return <div>
    <div className="ph"><div><div className="pt">{ordL}</div><div className="ps">{orders.length} total {storefrontCount > 0 && `\u2022 ${storefrontCount} from storefront`}</div></div><button className="btn btn-p" onClick={() => setModal({ t: "o", d: { date: today(), customer_id: "", customer_name: "", item_id: "", item_name: "", total: "", status: "Pending", notes: "", _payments: [], flow_status: "active", source: "manual" } })}>{I.plus} New</button></div>
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
      <div className="tabs" style={{ marginBottom: 0, borderBottom: "none" }}>
        {[actionNeededCount > 0 && "Action Needed", "All", storefrontCount > 0 && "Storefront", ...STATUSES].filter(Boolean).map(t => <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}{t === "Action Needed" && actionNeededCount > 0 && ` (${actionNeededCount})`}</button>)}
      </div>
      <div className="sb-w" style={{ marginLeft: "auto" }}><span className="ic">{I.search}</span><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
    </div>
    {fil.length === 0 ? <div className="card"><div className="empty"><p>{tab === "Action Needed" ? "No orders need your action \ud83c\udf89" : "No orders found."}</p></div></div> : <>
      <div className="card" style={{ padding: 0 }}><div className="tw"><table><thead><tr><th>Date</th><th>Customer</th><th>Item</th><th>Total</th><th>Paid</th><th>Status</th><th style={{ width: 70 }}></th></tr></thead><tbody>{fil.map(o => { const pd = paidAmount(o.id); const bl = Math.max(0, Number(o.total || 0) - pd); return <tr key={o.id}><td style={{ fontSize: 11, color: "var(--t2)" }}>{fmtDate(o.date)}{o.source === "storefront" && <div style={{ fontSize: 9, color: "var(--g)", marginTop: 1 }}>{I.store} storefront</div>}</td><td style={{ fontWeight: 500 }}>{o.customer_name || "Walk-in"}{o.customer_phone && <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 1 }}>{o.customer_phone}</div>}</td><td>{o.item_name}</td><td>{o.total ? fmt(o.total) : <span style={{ color: "var(--t3)" }}>\u2014</span>}</td><td style={{ color: "var(--g)", fontWeight: 600 }}>{pd > 0 ? fmt(pd) : <span style={{ color: "var(--t3)", fontWeight: 400 }}>\u2014</span>}</td><td><span className={`badge ${flowBadge(o)}`}>{flowLabel(o)}</span></td><td><div className="ar"><button className="ab" onClick={() => setModal({ t: o.source === "storefront" ? "sf" : "o", d: { ...o, _payments: payFor(o.id) } })}>{I.edit}</button><button className="ab dng" onClick={() => del(o.id)}>{I.trash}</button></div></td></tr>; })}</tbody></table></div></div>
      <div className="mcards">{fil.map(o => { const pd = paidAmount(o.id); return <div key={o.id} className="mcard" onClick={() => setModal({ t: o.source === "storefront" ? "sf" : "o", d: { ...o, _payments: payFor(o.id) } })}>
        <div className="mcard-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mcard-name">{o.customer_name || "Walk-in"}</div>
            {o.customer_phone && <div className="mcard-sub">{o.customer_phone}</div>}
          </div>
          <span className={`badge ${flowBadge(o)}`}>{flowLabel(o)}</span>
        </div>
        <div className="mcard-meta">{fmtDate(o.date)}{o.source === "storefront" && " \u2022 Storefront"}</div>
        <div style={{ fontSize: 13, marginTop: 6, color: "var(--t2)" }}>{o.item_name}</div>
        <div className="mcard-stats">
          <div className="mcard-stat"><span className="k">Total</span><span className="v">{o.total ? fmt(o.total) : "\u2014"}</span></div>
          <div className="mcard-stat"><span className="k">Paid</span><span className="v pos">{pd > 0 ? fmt(pd) : "\u2014"}</span></div>
        </div>
      </div>; })}</div>
    </>}
    {modal?.t === "o" && <Modal title={modal.d.id ? "Edit" : "New"} onClose={() => setModal(null)}><OForm d={modal.d} customers={customers} items={items} save={saveOrder} cancel={() => setModal(null)} /></Modal>}
    {modal?.t === "sf" && <Modal title="Storefront Order" onClose={() => setModal(null)} wide><SFForm d={modal.d} profile={profile} setOrders={setOrders} orders={orders} setPayments={setPayments} payments={payments} customers={customers} setCustomers={setCustomers} session={session} reload={reload} close={() => setModal(null)} /></Modal>}
  </div>;
}

function OForm({ d, customers, items, save, cancel }) {
  const [f, sf] = useState({ ...d, _payments: d._payments || [] }); const set = (k, v) => sf(p => ({ ...p, [k]: v }));
  const [np, snp] = useState({ amount: "", method: "Bank Transfer", date: today(), note: "" }); const [busy, setBusy] = useState(false);
  const addP = () => { if (!np.amount || Number(np.amount) <= 0) return; set("_payments", [...f._payments, { ...np, amount: Number(np.amount), id: uid() }]); snp({ amount: "", method: "Bank Transfer", date: today(), note: "" }); };
  const tp = f._payments.reduce((s, p) => s + Number(p.amount), 0); const bl = Math.max(0, (Number(f.total) || 0) - tp);
  return <div><div className="mb">
    <div className="fr"><div className="fg"><label className="fl">Date</label><input className="fi" type="date" value={f.date} onChange={e => set("date", e.target.value)} /></div><div className="fg"><label className="fl">Customer</label><select className="fs" value={f.customer_id || ""} onChange={e => { const c = customers.find(x => x.id === e.target.value); set("customer_id", e.target.value || null); set("customer_name", c ? c.name : ""); }}><option value="">Walk-in</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div>
    <div className="fg"><label className="fl">Item</label>{items.length > 0 && <select className="fs" value={f.item_id || ""} onChange={e => { const it = items.find(x => x.id === e.target.value); set("item_id", e.target.value || null); set("item_name", it ? it.name : ""); if (it?.price) set("total", it.price); }}><option value="">Select</option>{items.map(i => <option key={i.id} value={i.id}>{i.name}{i.price ? ` \u2014 ${fmt(i.price)}` : ""}</option>)}</select>}<input className="fi" style={{ marginTop: 8 }} placeholder="Or type name" value={f.item_name || ""} onChange={e => set("item_name", e.target.value)} /></div>
    <div className="fr"><div className="fg"><label className="fl">Total (NGN)</label><input className="fi" type="number" value={f.total || ""} onChange={e => set("total", e.target.value)} /></div><div className="fg"><label className="fl">Status</label><select className="fs" value={f.status} onChange={e => set("status", e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div></div>
    <div style={{ marginTop: 8, padding: 14, background: "var(--bg)", borderRadius: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 10.5, marginBottom: 8, display: "flex", justifyContent: "space-between", textTransform: "uppercase", letterSpacing: ".5px" }}><span>Payments</span><span><span style={{ color: "var(--g)" }}>{fmt(tp)}</span>{bl > 0 && <span style={{ color: "var(--r)", marginLeft: 6 }}>{fmt(bl)} due</span>}</span></div>
      {f._payments.length > 0 && <div className="pl">{f._payments.map(p => <div className="pe" key={p.id}><span style={{ color: "var(--t2)" }}>{fmtDate(p.date)}</span><span className="badge bg-gr">{p.method}</span>{p.note && <span style={{ color: "var(--t3)" }}>{p.note}</span>}<span className="amt">{fmt(p.amount)}</span><button className="ab dng" style={{ marginLeft: 2 }} onClick={() => set("_payments", f._payments.filter(x => x.id !== p.id))}>{I.close}</button></div>)}</div>}
      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}><input className="fi" type="number" placeholder="Amount" value={np.amount} onChange={e => snp(p => ({ ...p, amount: e.target.value }))} /><select className="fs" value={np.method} onChange={e => snp(p => ({ ...p, method: e.target.value }))}>{PAY_METHODS.map(m => <option key={m}>{m}</option>)}</select></div>
      <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 6, alignItems: "end" }}><input className="fi" type="date" value={np.date} onChange={e => snp(p => ({ ...p, date: e.target.value }))} /><input className="fi" placeholder="Note" value={np.note} onChange={e => snp(p => ({ ...p, note: e.target.value }))} /><button className="btn btn-p btn-sm" onClick={addP}>Record</button></div>
    </div>
    <div className="fg" style={{ marginTop: 10 }}><label className="fl">Notes</label><textarea className="ft" placeholder="Special instructions..." value={f.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
  </div><div className="mf"><button className="btn btn-s" onClick={cancel}>Cancel</button><button className="btn btn-p" disabled={!f.item_name?.trim() || busy} onClick={async () => { setBusy(true); await save(f, f._payments); setBusy(false); }}>{busy ? "Saving..." : "Save"}</button></div></div>;
}

// Storefront order form - the flow-aware one
function SFForm({ d, profile, setOrders, orders, setPayments, payments, customers, setCustomers, session, reload, close }) {
  const [busy, setBusy] = useState(false);
  const cartForDefault = d.cart || [];
  const cartSubtotal = cartForDefault.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  const suggested = d.total || (cartSubtotal + (d.delivery_fee || 0));
  const [total, setTotal] = useState(suggested || "");
  const [note, setNote] = useState("");
  const paid = (d._payments || []).reduce((s, p) => s + Number(p.amount), 0);

  // Find or create customer from the order's info
  const upsertCustomer = async () => {
    if (!d.customer_phone) return null;
    // If order already linked to a customer, return that id
    if (d.customer_id) return d.customer_id;
    // Check if a customer with this phone already exists for this vendor
    const existing = customers.find(c => c.phone && normalizePhone(c.phone) === normalizePhone(d.customer_phone));
    if (existing) return existing.id;
    // Create new
    const { data: newCust } = await supabase.from("customers").insert({
      user_id: session.user.id,
      name: d.customer_name || "Storefront Customer",
      phone: d.customer_phone,
      address: d.delivery_address || null,
      notes: d.notes ? `From storefront order: ${d.notes}` : null,
    }).select().single();
    if (newCust) setCustomers([newCust, ...customers]);
    return newCust?.id || null;
  };

  const updateFlow = async (newStatus, extra = {}) => {
    setBusy(true);
    const payload = { flow_status: newStatus, ...extra };
    if (newStatus === "awaiting_payment" && total) payload.total = Number(total);
    if (newStatus === "confirmed") payload.payment_confirmed_at = new Date().toISOString();
    // Create or link customer when sending the invoice (first vendor action on the order)
    if (newStatus === "awaiting_payment") {
      const custId = await upsertCustomer();
      if (custId) payload.customer_id = custId;
    }
    // Stock management: deduct on confirmation (once), restore on cancellation if previously deducted
    const orderCart = d.cart || [];
    if (newStatus === "confirmed" && !d.stock_deducted) {
      for (const ci of orderCart) {
        if (ci.id && ci.qty) {
          await supabase.rpc("decrement_stock", { p_item_id: ci.id, p_qty: ci.qty });
        }
      }
      payload.stock_deducted = true;
    }
    if (newStatus === "cancelled" && d.stock_deducted) {
      for (const ci of orderCart) {
        if (ci.id && ci.qty) {
          await supabase.rpc("restore_stock", { p_item_id: ci.id, p_qty: ci.qty });
        }
      }
      payload.stock_deducted = false;
    }
    const { data } = await supabase.from("orders").update(payload).eq("id", d.id).select().single();
    if (data) {
      setOrders(orders.map(o => o.id === data.id ? data : o));
      supabase.from("activity_log").insert({ user_id: session.user.id, action: `storefront_${newStatus}` });
      if (newStatus === "confirmed") {
        const { data: pay } = await supabase.from("payments").insert({ order_id: d.id, user_id: session.user.id, amount: Number(data.total), method: "Bank Transfer", date: today(), note: "Storefront order - confirmed by vendor" }).select().single();
        if (pay) setPayments([...payments, pay]);
      }
    }
    // Refresh items list if stock was changed
    if ((newStatus === "confirmed" && !d.stock_deducted) || (newStatus === "cancelled" && d.stock_deducted)) {
      if (reload) reload();
    }
    setBusy(false); close();
  };

  const cart = d.cart || [];
  const cartTotal = cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0);

  return <div><div className="mb">
    <div style={{ padding: "10px 14px", background: "var(--gl)", borderRadius: 8, marginBottom: 14, fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 2 }}>Current Status: {FLOW_LABELS[d.flow_status] || d.flow_status}</div>
      <div style={{ color: "var(--t2)" }}>Order placed {fmtDate(d.created_at || d.date)}</div>
    </div>

    <div className="fg"><label className="fl">Customer</label><div style={{ fontSize: 13, fontWeight: 600 }}>{d.customer_name}</div><div style={{ fontSize: 12, color: "var(--t2)" }}>{d.customer_phone}</div></div>
    {d.delivery_address && <div className="fg"><label className="fl">Delivery Address</label><div style={{ fontSize: 13 }}>{d.delivery_address}</div></div>}
    {d.delivery_zone_name && <div className="fg"><label className="fl">Delivery Zone</label>
      <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span>{d.delivery_zone_name}</span>
        {d.delivery_fee > 0 ? <span className="badge bg-g">{fmt(d.delivery_fee)}</span> : d.delivery_zone_name.startsWith("Other") ? <span className="badge bg-a">Fee to be set</span> : null}
      </div>
    </div>}

    <div className="fg"><label className="fl">Items Ordered</label>
      <div className="pl">{cart.map((it, i) => <div className="pe" key={i}><span style={{ fontWeight: 500 }}>{it.name}</span><span style={{ color: "var(--t2)" }}>\u00d7 {it.qty}</span><span className="amt">{it.price ? fmt(it.price * it.qty) : "TBD"}</span></div>)}</div>
    </div>
    {d.notes && <div className="fg"><label className="fl">Customer Note</label><div style={{ fontSize: 13, padding: 10, background: "var(--bg)", borderRadius: 6 }}>{d.notes}</div></div>}

    {d.flow_status === "awaiting_pricing" && <div style={{ padding: 14, background: "var(--aml)", borderRadius: 10, marginTop: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Set the final price</div>
      <div style={{ fontSize: 11.5, color: "var(--t2)", marginBottom: 10 }}>
        {d.delivery_fee > 0 ? `Suggested: ${fmt(cartTotal + (d.delivery_fee || 0))} (items ${fmt(cartTotal)} + delivery ${fmt(d.delivery_fee)}). Adjust if needed.` : "Include delivery fees, any size/variant adjustments, or discounts. Customer will see this amount on their order page."}
      </div>
      <input className="fi" type="number" placeholder={`Suggested: ${fmt(cartTotal + (d.delivery_fee || 0))}`} value={total} onChange={e => setTotal(e.target.value)} />
    </div>}

    {d.flow_status === "payment_claimed" && <div style={{ padding: 14, background: "var(--aml)", borderRadius: 10, marginTop: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Customer says they've paid</div>
      <div style={{ fontSize: 11.5, color: "var(--t2)" }}>Check your bank account for a transfer of <b>{fmt(d.total)}</b>. Claimed at {d.payment_claimed_at ? new Date(d.payment_claimed_at).toLocaleString("en-NG") : "recently"}.</div>
    </div>}

  </div><div className="mf" style={{ flexWrap: "wrap" }}>
    <button className="btn btn-s" onClick={close}>Close</button>
    {d.flow_status === "awaiting_pricing" && <>
      <button className="btn btn-d" disabled={busy} onClick={() => { if (confirm("Decline this order? The customer will see it as cancelled.")) updateFlow("cancelled", { status: "Cancelled" }); }}>Decline</button>
      <button className="btn btn-p" disabled={busy || !total || Number(total) <= 0} onClick={() => updateFlow("awaiting_payment")}>{busy ? "Saving..." : "Send Invoice"}</button>
    </>}
    {d.flow_status === "awaiting_payment" && <>
      <button className="btn btn-d" disabled={busy} onClick={() => { if (confirm("Cancel this order? Customer will be notified via their order link.")) updateFlow("cancelled", { status: "Cancelled" }); }}>Cancel order</button>
    </>}
    {d.flow_status === "payment_claimed" && <>
      <button className="btn btn-d" disabled={busy} onClick={() => { if (confirm("Cancel this order? Customer will be notified.")) updateFlow("cancelled", { status: "Cancelled" }); }}>Cancel order</button>
      <button className="btn btn-s" disabled={busy} onClick={() => updateFlow("awaiting_payment")}>Not Yet (revert)</button>
      <button className="btn btn-p" disabled={busy} onClick={() => updateFlow("confirmed", { status: "In Progress" })}>{busy ? "Saving..." : "Confirm Payment Received"}</button>
    </>}
    {d.flow_status === "confirmed" && <>
      <button className="btn btn-d" disabled={busy} onClick={() => { if (confirm("Cancel this order? Stock will be restored and customer notified.")) updateFlow("cancelled", { status: "Cancelled" }); }}>Cancel order</button>
      <button className="btn btn-p" disabled={busy} onClick={() => updateFlow("shipped")}>{busy ? "..." : "Mark as Shipped"}</button>
    </>}
    {d.flow_status === "shipped" && <button className="btn btn-p" disabled={busy} onClick={() => updateFlow("completed", { status: "Completed" })}>{busy ? "..." : "Mark Completed"}</button>}
  </div></div>;
}

// ══════════════════════════════════════════════════════════════
// INVOICES
// ══════════════════════════════════════════════════════════════
function InvPage({ session, profile, invoices, setInvoices, orders, setOrders, customers, setCustomers, items, setItems, payments, setPayments, payFor, modal, setModal, reload }) {
  const [vw, setVw] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);

  const mkI = o => { const pd = payFor(o.id).reduce((s, p) => s + Number(p.amount), 0); const c = customers.find(x => x.id === o.customer_id); return { invoice_no: `INV-${String(invoices.length + 1).padStart(3, "0")}`, date: today(), due_date: null, customer_name: o.customer_name || "Walk-in", customer_phone: c?.phone || o.customer_phone || "", customer_email: c?.email || "", items: o.cart?.length ? o.cart.map(c => ({ description: c.name, qty: c.qty, price: c.price || 0, item_id: c.id || null })) : [{ description: o.item_name, qty: 1, price: o.total, item_id: null }], amount_paid: pd, notes: "", order_id: o.id, already_paid: pd > 0 }; };

  // Auto-link or create a customer from invoice contact info
  async function upsertCustomer(name, phone, email) {
    if (!phone) return null;
    const existing = customers.find(c => c.phone && normalizePhone(c.phone) === normalizePhone(phone));
    if (existing) return existing.id;
    const { data } = await supabase.from("customers").insert({
      user_id: session.user.id,
      name: name || "Customer",
      phone: phone || null,
      email: email || null,
    }).select().single();
    if (data) setCustomers(prev => [data, ...prev]);
    return data?.id || null;
  }

  // Save flow for new invoices: create the invoice, then create the matching order with stock deduction
  const save = async (inv) => {
    const isNew = !inv.id;
    const sub = (inv.items || []).reduce((s, i) => s + i.qty * i.price, 0);

    if (inv.id) {
      // Editing existing invoice - just update the invoice fields, don't touch the order
      const { data } = await supabase.from("invoices").update({
        invoice_no: inv.invoice_no, date: inv.date, due_date: inv.due_date,
        customer_name: inv.customer_name, customer_phone: inv.customer_phone, customer_email: inv.customer_email,
        items: inv.items, amount_paid: Number(inv.amount_paid || 0), notes: inv.notes,
      }).eq("id", inv.id).select().single();
      if (data) setInvoices(invoices.map(x => x.id === data.id ? data : x));
      setModal(null);
      return;
    }

    // New invoice flow: create invoice, link to or create order
    const customerId = await upsertCustomer(inv.customer_name, inv.customer_phone, inv.customer_email);
    const alreadyPaid = inv.already_paid;
    const cart = (inv.items || []).map(li => ({
      id: li.item_id || null,
      name: li.description,
      qty: li.qty,
      price: li.price,
      type: li.item_id ? (items.find(x => x.id === li.item_id)?.type || "Product") : "Custom",
      image: li.item_id ? (items.find(x => x.id === li.item_id)?.image || null) : null,
    }));
    const itemsSummary = cart.map(c => `${c.qty}x ${c.name}`).join(", ").slice(0, 200);
    const token = genToken();

    // Create the order
    const orderPayload = {
      user_id: session.user.id,
      customer_id: customerId,
      customer_name: inv.customer_name,
      customer_phone: inv.customer_phone,
      date: inv.date,
      item_name: itemsSummary,
      total: sub,
      cart,
      source: "manual_invoice",
      flow_status: alreadyPaid ? "completed" : "awaiting_payment",
      status: alreadyPaid ? "Completed" : "Pending",
      public_token: token,
      payment_confirmed_at: alreadyPaid ? new Date().toISOString() : null,
      stock_deducted: alreadyPaid,
    };
    const { data: orderData } = await supabase.from("orders").insert(orderPayload).select().single();
    if (!orderData) { alert("Could not create order. Please try again."); return; }
    setOrders(prev => [orderData, ...prev]);

    // Create the invoice with link to order
    const { data: invData } = await supabase.from("invoices").insert({
      user_id: session.user.id,
      invoice_no: inv.invoice_no, date: inv.date, due_date: inv.due_date,
      customer_name: inv.customer_name, customer_phone: inv.customer_phone, customer_email: inv.customer_email,
      items: inv.items, amount_paid: alreadyPaid ? sub : 0, notes: inv.notes,
      order_id: orderData.id,
    }).select().single();
    if (invData) {
      setInvoices(prev => [invData, ...prev]);
      // Also link the order back to the invoice
      await supabase.from("orders").update({ invoice_id: invData.id }).eq("id", orderData.id);
    }

    if (alreadyPaid) {
      // Record payment
      const { data: pay } = await supabase.from("payments").insert({
        order_id: orderData.id, user_id: session.user.id, amount: sub,
        method: "Bank Transfer", date: today(), note: "Invoice marked as already paid",
      }).select().single();
      if (pay) setPayments(prev => [...prev, pay]);

      // Deduct stock for catalog items
      for (const ci of cart) {
        if (ci.id && ci.qty) {
          await supabase.rpc("decrement_stock", { p_item_id: ci.id, p_qty: ci.qty });
        }
      }
      // Refresh items so vendor sees updated stock
      if (reload) reload();
    }
    supabase.from("activity_log").insert({ user_id: session.user.id, action: alreadyPaid ? "invoice_recorded_paid" : "invoice_sent" });
    setModal(null);
  };

  const del = async (id) => {
    if (!confirm("Delete this invoice? The linked order will also be deleted.")) return;
    const inv = invoices.find(x => x.id === id);
    // If linked order still exists, also delete it
    if (inv?.order_id) {
      await supabase.from("orders").delete().eq("id", inv.order_id);
      setOrders(orders.filter(o => o.id !== inv.order_id));
    }
    await supabase.from("invoices").delete().eq("id", id);
    setInvoices(invoices.filter(i => i.id !== id));
  };

  const shareLink = (inv) => {
    const linkedOrder = orders.find(o => o.id === inv.order_id);
    if (!linkedOrder?.public_token) {
      alert("This invoice does not have a customer link. Only invoices created with this update have shareable links.");
      return null;
    }
    return `${window.location.origin}/order/${linkedOrder.public_token}`;
  };
  const copyShareLink = (inv) => {
    const url = shareLink(inv);
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedToken(inv.id);
    setTimeout(() => setCopiedToken(null), 1500);
  };
  const whatsappShareLink = (inv) => {
    const url = shareLink(inv);
    if (!url) return;
    const sub = (inv.items || []).reduce((s, i) => s + i.qty * i.price, 0);
    const bl = sub - (inv.amount_paid || 0);
    const linkedOrder = orders.find(o => o.id === inv.order_id);
    const text = bl > 0 && linkedOrder?.flow_status === "awaiting_payment"
      ? `Hi ${inv.customer_name}, here is your invoice from ${profile.business_name}.\n\nTotal: ${fmt(sub)}\nView and pay: ${url}`
      : `Hi ${inv.customer_name}, here is your receipt from ${profile.business_name}.\n\nView: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const un = orders.filter(o => o.status !== "Cancelled" && !invoices.find(i => i.order_id === o.id) && o.source !== "manual_invoice");

  if (vw) {
    const inv = invoices.find(i => i.id === vw); if (!inv) { setVw(null); return null; }
    const sub = (inv.items || []).reduce((s, i) => s + i.qty * i.price, 0); const bl = sub - (inv.amount_paid || 0);
    const hb = profile.bank_name && profile.account_number;
    const linkedOrder = orders.find(o => o.id === inv.order_id);
    const customerUrl = linkedOrder?.public_token ? `${typeof window !== "undefined" ? window.location.origin : ""}/order/${linkedOrder.public_token}` : null;
    return <div>
      <div className="ph" style={{ flexWrap: "wrap" }}>
        <button className="btn btn-s" onClick={() => setVw(null)}>Back</button>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {customerUrl && <button className="btn btn-s" onClick={() => copyShareLink(inv)}>{copiedToken === inv.id ? I.check : I.copy} {copiedToken === inv.id ? "Copied!" : "Copy customer link"}</button>}
          {customerUrl && <button className="btn btn-s" onClick={() => whatsappShareLink(inv)}>{I.wa} WhatsApp customer</button>}
        </div>
      </div>
      <div className="inv-preview">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}><div><OjaLogo w={64} color="var(--g)" /><div style={{ fontSize: 12.5, color: "var(--t2)", marginTop: 6 }}>{profile.business_name}</div></div><div style={{ textAlign: "right", fontSize: 12.5, color: "var(--t2)" }}><div style={{ fontWeight: 700, fontSize: 15, fontFamily: "var(--fm)", color: "var(--t)" }}>{inv.invoice_no}</div><div>Date: {fmtDate(inv.date)}</div>{inv.due_date && <div>Due: {fmtDate(inv.due_date)}</div>}</div></div>
        <div className="inv-parties"><div><div className="inv-label">From</div><div style={{ fontWeight: 600 }}>{profile.business_name}</div>{profile.business_phone && <div>{profile.business_phone}</div>}</div><div><div className="inv-label">Bill To</div><div style={{ fontWeight: 600 }}>{inv.customer_name}</div>{inv.customer_phone && <div>{inv.customer_phone}</div>}</div></div>
        <table className="inv-table"><thead><tr><th>Description</th><th style={{ textAlign: "right" }}>Qty</th><th style={{ textAlign: "right" }}>Price</th><th style={{ textAlign: "right" }}>Total</th></tr></thead><tbody>{(inv.items || []).map((it, i) => <tr key={i}><td>{it.description}</td><td style={{ textAlign: "right" }}>{it.qty}</td><td style={{ textAlign: "right" }}>{fmt(it.price)}</td><td style={{ textAlign: "right" }}>{fmt(it.qty * it.price)}</td></tr>)}</tbody></table>
        <div style={{ display: "flex", justifyContent: "flex-end" }}><div className="inv-total"><div className="inv-tl"><span>Subtotal</span><span>{fmt(sub)}</span></div><div className="inv-tl"><span>Paid</span><span style={{ color: "var(--g)" }}>-{fmt(inv.amount_paid)}</span></div><div className="inv-tl grand"><span>Balance</span><span>{fmt(bl)}</span></div></div></div>
        {hb && bl > 0 && <div className="bk-box"><div className="bk-title">Payment Details</div><div className="bk-row"><span className="lbl">Bank</span><span className="val">{profile.bank_name}</span></div><div className="bk-row"><span className="lbl">Account</span><span className="val">{profile.account_number}</span></div><div className="bk-row"><span className="lbl">Name</span><span className="val">{profile.account_name}</span></div></div>}
        {customerUrl && <div style={{ marginTop: 18, padding: 12, background: "var(--bg)", borderRadius: 8, fontSize: 11.5, fontFamily: "var(--fm)", overflowX: "auto" }}>
          <div style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: .5, color: "var(--t3)", marginBottom: 4 }}>Customer link</div>
          <div style={{ whiteSpace: "nowrap" }}>{customerUrl}</div>
        </div>}
      </div>
    </div>;
  }
  return <div>
    <div className="ph"><div><div className="pt">Invoices</div><div className="ps">{invoices.length}</div></div><button className="btn btn-p" onClick={() => setModal({ t: "i", d: { invoice_no: `INV-${String(invoices.length + 1).padStart(3, "0")}`, date: today(), due_date: null, customer_name: "", customer_phone: "", customer_email: "", items: [{ description: "", qty: 1, price: 0, item_id: null }], amount_paid: 0, notes: "", already_paid: true } })}>{I.plus} New</button></div>
    {un.length > 0 && <div className="card" style={{ marginBottom: 18, background: "var(--aml)", border: "1px solid #eed9a0" }}><div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6 }}>Quick Invoice from existing orders</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{un.slice(0, 5).map(o => <button key={o.id} className="btn btn-s btn-sm" onClick={() => setModal({ t: "i", d: mkI(o) })}>{o.customer_name || "Walk-in"} \u2014 {o.item_name}</button>)}</div></div>}
    {invoices.length === 0 ? <div className="card"><div className="empty"><p>No invoices yet.</p></div></div> : <>
      <div className="card" style={{ padding: 0 }}><div className="tw"><table><thead><tr><th>No.</th><th>Date</th><th>Customer</th><th>Total</th><th>Balance</th><th style={{ width: 130 }}></th></tr></thead><tbody>{invoices.map(inv => { const sub = (inv.items || []).reduce((s, i) => s + i.qty * i.price, 0); const bl = sub - (inv.amount_paid || 0); const linked = orders.find(o => o.id === inv.order_id); return <tr key={inv.id}><td style={{ fontWeight: 600, fontFamily: "var(--fm)", fontSize: 11 }}>{inv.invoice_no}</td><td>{fmtDate(inv.date)}</td><td>{inv.customer_name}</td><td>{fmt(sub)}</td><td><span className={`badge ${bl <= 0 ? "bg-g" : "bg-r"}`}>{bl <= 0 ? "Paid" : fmt(bl)}</span></td><td><div className="ar"><button className="ab" onClick={() => setVw(inv.id)}>{I.search}</button>{linked?.public_token && <button className="ab" title="Copy customer link" onClick={() => copyShareLink(inv)}>{copiedToken === inv.id ? I.check : I.link}</button>}<button className="ab" onClick={() => setModal({ t: "i", d: { ...inv } })}>{I.edit}</button><button className="ab dng" onClick={() => del(inv.id)}>{I.trash}</button></div></td></tr>; })}</tbody></table></div></div>
      <div className="mcards">{invoices.map(inv => { const sub = (inv.items || []).reduce((s, i) => s + i.qty * i.price, 0); const bl = sub - (inv.amount_paid || 0); const linked = orders.find(o => o.id === inv.order_id); return <div key={inv.id} className="mcard">
        <div className="mcard-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mcard-name">{inv.customer_name}</div>
            <div className="mcard-sub" style={{ fontFamily: "var(--fm)" }}>{inv.invoice_no} \u00b7 {fmtDate(inv.date)}</div>
          </div>
          <span className={`badge ${bl <= 0 ? "bg-g" : "bg-r"}`}>{bl <= 0 ? "Paid" : fmt(bl)}</span>
        </div>
        <div className="mcard-stats">
          <div className="mcard-stat"><span className="k">Total</span><span className="v">{fmt(sub)}</span></div>
          <div className="mcard-stat"><span className="k">Paid</span><span className="v pos">{fmt(inv.amount_paid || 0)}</span></div>
        </div>
        <div className="mcard-actions">
          <button className="btn btn-s btn-sm" onClick={() => setVw(inv.id)}>{I.search} View</button>
          {linked?.public_token && <button className="btn btn-s btn-sm" onClick={() => copyShareLink(inv)}>{copiedToken === inv.id ? <>{I.check} Copied</> : <>{I.link} Share link</>}</button>}
          <button className="btn btn-s btn-sm" onClick={() => setModal({ t: "i", d: { ...inv } })}>{I.edit} Edit</button>
          <button className="btn btn-d btn-sm" onClick={() => del(inv.id)}>{I.trash}</button>
        </div>
      </div>; })}</div>
    </>}
    {modal?.t === "i" && <Modal title={modal.d.id ? "Edit Invoice" : "New Invoice"} onClose={() => setModal(null)} wide><IForm d={modal.d} items={items} save={save} cancel={() => setModal(null)} /></Modal>}
  </div>;
}
function IForm({ d, items, save, cancel }) {
  const [f, sf] = useState(d); const set = (k, v) => sf(p => ({ ...p, [k]: v })); const [busy, setBusy] = useState(false);
  const isNew = !f.id;

  const uI = (i, k, v) => {
    const newItems = [...f.items];
    newItems[i] = { ...newItems[i], [k]: k === "description" ? v : Number(v) || 0 };
    set("items", newItems);
  };

  const pickCatalogItem = (i, itemId) => {
    const newItems = [...f.items];
    if (!itemId) {
      newItems[i] = { description: "", qty: 1, price: 0, item_id: null };
    } else {
      const cat = items.find(x => x.id === itemId);
      if (cat) {
        newItems[i] = {
          description: cat.name,
          qty: newItems[i]?.qty || 1,
          price: cat.price || 0,
          item_id: cat.id,
        };
      }
    }
    set("items", newItems);
  };

  const sub = (f.items || []).reduce((s, i) => s + i.qty * i.price, 0);

  return <div><div className="mb">
    <div className="fr">
      <div className="fg"><label className="fl">Invoice No</label><input className="fi" value={f.invoice_no} onChange={e => set("invoice_no", e.target.value)} /></div>
      <div className="fg"><label className="fl">Date</label><input className="fi" type="date" value={f.date} onChange={e => set("date", e.target.value)} /></div>
    </div>
    <div className="fg"><label className="fl">Customer name</label><input className="fi" value={f.customer_name} onChange={e => set("customer_name", e.target.value)} /></div>
    <div className="fr">
      <div className="fg"><label className="fl">Phone {isNew && <span style={{ color: "var(--r)" }}>*</span>}</label><input className="fi" placeholder="08012345678" value={f.customer_phone || ""} onChange={e => set("customer_phone", e.target.value)} /></div>
      <div className="fg"><label className="fl">Email</label><input className="fi" value={f.customer_email || ""} onChange={e => set("customer_email", e.target.value)} /></div>
    </div>

    <div style={{ fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", letterSpacing: .5, color: "var(--t2)", marginBottom: 8, marginTop: 6 }}>Line Items</div>
    {(f.items || []).map((it, i) => <div key={i} style={{ marginBottom: 10, padding: 10, background: "var(--bg)", borderRadius: 8 }}>
      {items && items.length > 0 && <div className="fg" style={{ marginBottom: 8 }}>
        <select className="fs" value={it.item_id || ""} onChange={e => pickCatalogItem(i, e.target.value || null)}>
          <option value="">— Custom item (no catalog link, no stock tracking) —</option>
          {items.map(cat => <option key={cat.id} value={cat.id}>{cat.name} {cat.type === "Product" && cat.stock !== null ? `(${cat.stock} in stock)` : ""}</option>)}
        </select>
      </div>}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 6, alignItems: "end" }}>
        <input className="fi" placeholder="Description" value={it.description} onChange={e => uI(i, "description", e.target.value)} disabled={!!it.item_id} />
        <input className="fi" type="number" placeholder="Qty" value={it.qty} onChange={e => uI(i, "qty", e.target.value)} />
        <input className="fi" type="number" placeholder="Price" value={it.price} onChange={e => uI(i, "price", e.target.value)} />
        {f.items.length > 1 && <button className="ab dng" onClick={() => set("items", f.items.filter((_, x) => x !== i))}>{I.close}</button>}
      </div>
    </div>)}
    <button className="btn btn-g btn-sm" onClick={() => set("items", [...(f.items || []), { description: "", qty: 1, price: 0, item_id: null }])}>{I.plus} Add line</button>

    <div style={{ marginTop: 14, padding: 12, background: "var(--bg)", borderRadius: 8, display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
      <span>Subtotal</span><span>{fmt(sub)}</span>
    </div>

    {isNew && <div className="fg" style={{ marginTop: 14, padding: 12, background: "var(--gl)", borderRadius: 8 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <input type="checkbox" checked={f.already_paid !== false} onChange={e => set("already_paid", e.target.checked)} />
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>Already paid</div>
          <div style={{ fontSize: 11.5, color: "var(--t2)", marginTop: 2 }}>{f.already_paid !== false
            ? "Payment received \u2014 stock will be deducted now and order marked complete."
            : "Customer will see a payment request on their order link. Stock deducts when you confirm payment."}</div>
        </div>
      </label>
    </div>}

    {!isNew && <div className="fg" style={{ marginTop: 14 }}><label className="fl">Amount Paid</label><input className="fi" type="number" value={f.amount_paid || 0} onChange={e => set("amount_paid", e.target.value)} /></div>}

    <div className="fg" style={{ marginTop: 10 }}><label className="fl">Notes</label><textarea className="ft" placeholder="Payment instructions, terms..." value={f.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
  </div>
  <div className="mf">
    <button className="btn btn-s" onClick={cancel}>Cancel</button>
    <button className="btn btn-p" disabled={busy || !f.customer_name?.trim() || (isNew && !f.customer_phone?.trim()) || !f.items?.length || sub <= 0} onClick={async () => { setBusy(true); await save(f); setBusy(false); }}>{busy ? "Saving..." : isNew ? "Create Invoice" : "Save"}</button>
  </div></div>;
}

// ══════════════════════════════════════════════════════════════
// STOREFRONT (management page)
// ══════════════════════════════════════════════════════════════
function StorePage({ session, profile, onProfile, items }) {
  const [f, sf] = useState({ about: profile.about || "", accepts_orders: profile.accepts_orders !== false, slug: profile.slug || "" });
  const set = (k, v) => sf(p => ({ ...p, [k]: v })); const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false); const [copied, setCopied] = useState(false);
  const [reviews, setReviews] = useState([]);
  const url = typeof window !== "undefined" ? `${window.location.origin}/shop/${profile.slug}` : `/shop/${profile.slug}`;

  useEffect(() => { loadReviews(); }, []);
  async function loadReviews() {
    const { data } = await supabase.from("reviews").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setReviews(data || []);
  }

  const save = async () => {
    setBusy(true);
    const { data } = await supabase.from("profiles").update({ about: f.about, accepts_orders: f.accepts_orders }).eq("id", session.user.id).select().single();
    setBusy(false);
    if (data) { onProfile(data); setOk(true); setTimeout(() => setOk(false), 2000); }
  };
  const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const share = () => { window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my store: ${url}`)}`, "_blank"); };
  const toggleReport = async (id, current) => {
    const { data } = await supabase.from("reviews").update({ is_reported: !current }).eq("id", id).select().single();
    if (data) setReviews(reviews.map(r => r.id === id ? data : r));
  };

  const activeReviews = reviews.filter(r => !r.is_reported);
  const avgRating = activeReviews.length > 0 ? (activeReviews.reduce((s, r) => s + r.rating, 0) / activeReviews.length).toFixed(1) : null;

  return <div>
    <div className="ph"><div><div className="pt">Storefront</div><div className="ps">Your public shop page</div></div></div>
    <div style={{ display: "grid", gap: 16, maxWidth: 620 }}>
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Your shareable link</div>
        <div className="share-link"><code>{url}</code></div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-s btn-sm" onClick={copy}>{copied ? I.check : I.copy} {copied ? "Copied!" : "Copy link"}</button>
          <button className="btn btn-s btn-sm" onClick={share}>{I.wa} Share via WhatsApp</button>
          <a className="btn btn-s btn-sm" href={url} target="_blank" rel="noopener noreferrer">{I.link} Preview</a>
        </div>
      </div>
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Store settings</div>
        <div className="fg"><label className="fl">About your business</label><textarea className="ft" placeholder="A short description customers will see on your shop page" value={f.about} onChange={e => set("about", e.target.value)} /></div>
        <div className="fg"><label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}><input type="checkbox" checked={f.accepts_orders} onChange={e => set("accepts_orders", e.target.checked)} /><span style={{ fontSize: 13 }}>Accepting orders</span></label><div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>When unchecked, customers will see a "currently closed" message.</div></div>
        <button className="btn btn-p" disabled={busy} onClick={save}>{busy ? "Saving..." : ok ? "Saved!" : "Save"}</button>
      </div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Customer Reviews</div>
          {avgRating && <div style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--am)", fontWeight: 700, fontSize: 13 }}>{I.star} {avgRating} <span style={{ color: "var(--t3)", fontWeight: 500, fontSize: 12 }}>({activeReviews.length})</span></div>}
        </div>
        {reviews.length === 0 ? <div style={{ fontSize: 12.5, color: "var(--t3)", lineHeight: 1.6 }}>No reviews yet. Once you complete orders, customers can leave ratings and feedback here. Only aggregate ratings are shown publicly \u2014 individual comments are private to you.</div> :
          <div>{reviews.map(r => <div key={r.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--bl)", opacity: r.is_reported ? 0.5 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", gap: 2, color: "var(--am)" }}>{[1, 2, 3, 4, 5].map(n => <span key={n} style={{ color: n <= r.rating ? "var(--am)" : "var(--b)" }}>{I.star}</span>)}</div>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{r.reviewer_name || "Anonymous"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10.5, color: "var(--t3)" }}>{fmtDate(r.created_at)}</span>
                <button className="btn btn-g btn-sm" onClick={() => toggleReport(r.id, r.is_reported)} style={{ padding: "3px 8px", fontSize: 10.5 }}>
                  {r.is_reported ? "Unreport" : <>{I.flag} Report</>}
                </button>
              </div>
            </div>
            {r.comment && <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.5, marginTop: 4 }}>{r.comment}</div>}
            {r.is_reported && <div style={{ fontSize: 10.5, color: "var(--r)", marginTop: 4, fontWeight: 600 }}>Reported \u2014 hidden from public average</div>}
          </div>)}</div>
        }
      </div>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════
function SettPage({ session, profile, onProfile }) {
  const [f, sf] = useState({ business_name: profile.business_name, business_phone: profile.business_phone || "", business_email: profile.business_email || "", bank_name: profile.bank_name || "", account_number: profile.account_number || "", account_name: profile.account_name || "", business_type: profile.business_type });
  const set = (k, v) => sf(p => ({ ...p, [k]: v })); const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false);
  const [zones, setZones] = useState([]);
  const [newZone, setNewZone] = useState({ name: "", price: "" });
  const [zonesBusy, setZonesBusy] = useState(false);

  const showZones = f.business_type === "products" || f.business_type === "both";

  useEffect(() => { loadZones(); }, []);
  async function loadZones() {
    const { data } = await supabase.from("delivery_zones").select("*").eq("user_id", session.user.id).order("sort_order", { ascending: true });
    setZones(data || []);
  }

  const save = async () => { setBusy(true); const { data } = await supabase.from("profiles").update(f).eq("id", session.user.id).select().single(); setBusy(false); if (data) { onProfile(data); setOk(true); setTimeout(() => setOk(false), 2000); } };

  const addZone = async () => {
    if (!newZone.name.trim() || !newZone.price || Number(newZone.price) < 0) return;
    setZonesBusy(true);
    const maxOrder = zones.length > 0 ? Math.max(...zones.map(z => z.sort_order || 0)) : 0;
    const { data } = await supabase.from("delivery_zones").insert({
      user_id: session.user.id,
      name: newZone.name.trim(),
      price: Number(newZone.price),
      sort_order: maxOrder + 1,
    }).select().single();
    if (data) setZones([...zones, data]);
    setNewZone({ name: "", price: "" });
    setZonesBusy(false);
  };
  const updateZone = async (id, changes) => {
    const { data } = await supabase.from("delivery_zones").update(changes).eq("id", id).select().single();
    if (data) setZones(zones.map(z => z.id === id ? data : z));
  };
  const deleteZone = async (id) => {
    if (!confirm("Delete this delivery zone?")) return;
    await supabase.from("delivery_zones").delete().eq("id", id);
    setZones(zones.filter(z => z.id !== id));
  };

  return <div>
    <div className="ph"><div><div className="pt">Settings</div><div className="ps">{session.user.email}</div></div></div>
    <div style={{ display: "grid", gap: 16, maxWidth: 560 }}>
      <div className="card"><div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Business</div><div className="fg"><label className="fl">Name</label><input className="fi" value={f.business_name} onChange={e => set("business_name", e.target.value)} /></div><div className="fr"><div className="fg"><label className="fl">Phone</label><input className="fi" value={f.business_phone} onChange={e => set("business_phone", e.target.value)} /></div><div className="fg"><label className="fl">Email</label><input className="fi" value={f.business_email} onChange={e => set("business_email", e.target.value)} /></div></div><div className="fg"><label className="fl">Type</label><select className="fs" value={f.business_type} onChange={e => set("business_type", e.target.value)}><option value="products">Products only</option><option value="services">Services only</option><option value="both">Products & Services</option></select></div></div>
      <div className="card"><div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Bank Account</div><div style={{ fontSize: 11.5, color: "var(--t3)", marginBottom: 14 }}>Shown on invoices and customer order pages</div><div className="fg"><label className="fl">Bank</label><input className="fi" placeholder="e.g. GTBank, OPay, Kuda" value={f.bank_name} onChange={e => set("bank_name", e.target.value)} /></div><div className="fr"><div className="fg"><label className="fl">Account No.</label><input className="fi" value={f.account_number} onChange={e => set("account_number", e.target.value)} /></div><div className="fg"><label className="fl">Account Name</label><input className="fi" value={f.account_name} onChange={e => set("account_name", e.target.value)} /></div></div></div>
      <button className="btn btn-p" onClick={save} disabled={busy} style={{ justifySelf: "start" }}>{busy ? "Saving..." : ok ? "Saved!" : "Save"}</button>

      {showZones && <div className="card">
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Delivery Zones</div>
        <div style={{ fontSize: 11.5, color: "var(--t3)", marginBottom: 16, lineHeight: 1.5 }}>
          Set delivery fees by location. Customers pick a zone at checkout; the fee gets added automatically. If you don't add zones, customers just enter their address and you set the fee manually. An "Other" option is always shown so customers in areas you haven't listed can still order.
        </div>

        {zones.length > 0 && <div style={{ marginBottom: 16 }}>
          {zones.map(z => <ZoneRow key={z.id} zone={z} onSave={(c) => updateZone(z.id, c)} onDelete={() => deleteZone(z.id)} />)}
        </div>}

        <div style={{ padding: 14, background: "var(--bg)", borderRadius: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 10.5, color: "var(--t2)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Add a zone</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 8, alignItems: "end" }}>
            <input className="fi" placeholder="Zone name (e.g. Lekki, Ikeja)" value={newZone.name} onChange={e => setNewZone({ ...newZone, name: e.target.value })} />
            <input className="fi" type="number" placeholder="Price (NGN)" value={newZone.price} onChange={e => setNewZone({ ...newZone, price: e.target.value })} />
            <button className="btn btn-p btn-sm" disabled={zonesBusy || !newZone.name.trim() || !newZone.price} onClick={addZone}>{I.plus} Add</button>
          </div>
        </div>
      </div>}
    </div>
  </div>;
}

function ZoneRow({ zone, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(zone.name);
  const [price, setPrice] = useState(zone.price);
  const save = () => {
    if (!name.trim() || !price || Number(price) < 0) return;
    onSave({ name: name.trim(), price: Number(price) });
    setEditing(false);
  };
  if (editing) {
    return <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto auto", gap: 8, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--bl)" }}>
      <input className="fi" value={name} onChange={e => setName(e.target.value)} />
      <input className="fi" type="number" value={price} onChange={e => setPrice(e.target.value)} />
      <button className="btn btn-s btn-sm" onClick={() => { setName(zone.name); setPrice(zone.price); setEditing(false); }}>Cancel</button>
      <button className="btn btn-p btn-sm" onClick={save}>Save</button>
    </div>;
  }
  return <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--bl)" }}>
    <div style={{ flex: 1, fontWeight: 500, fontSize: 13.5 }}>{zone.name}</div>
    <div style={{ fontFamily: "var(--fm)", fontWeight: 600, fontSize: 13 }}>{fmt(zone.price)}</div>
    <button className="ab" onClick={() => setEditing(true)}>{I.edit}</button>
    <button className="ab dng" onClick={onDelete}>{I.trash}</button>
  </div>;
}

// ══════════════════════════════════════════════════════════════
// BUG REPORT MODAL (shared by vendor app, storefront, customer order page)
// ══════════════════════════════════════════════════════════════
export function BugReportModal({ session, profile, role, onClose }) {
  const isLoggedIn = !!session;
  const [description, setDescription] = useState("");
  const [name, setName] = useState(profile?.business_name || "");
  const [email, setEmail] = useState(session?.user?.email || profile?.business_email || "");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!description.trim()) { setErr("Please describe the problem"); return; }
    setBusy(true); setErr("");
    const payload = {
      reporter_user_id: session?.user?.id || null,
      reporter_name: name.trim() || null,
      reporter_email: email.trim() || null,
      reporter_role: role || (isLoggedIn ? "vendor" : "anonymous"),
      page_url: typeof window !== "undefined" ? window.location.href : null,
      description: description.trim(),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    };
    const { error } = await supabase.from("bug_reports").insert(payload);
    setBusy(false);
    if (error) { setErr("Could not submit. Please try again."); return; }
    setDone(true);
  };

  return <div className="mo" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="ml"><div className="mh"><div className="mt">Report a problem</div><button className="mc" onClick={onClose}>{I.close}</button></div>
      {done ? <>
        <div className="mb" style={{ textAlign: "center", padding: "30px 20px" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gl)", color: "var(--g)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>{I.check}</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Thanks for letting us know</div>
          <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.5, maxWidth: 320, margin: "0 auto" }}>Your report has been received. We'll review it and follow up if we need more details.</div>
        </div>
        <div className="mf"><button className="btn btn-p" onClick={onClose}>Close</button></div>
      </> : <>
        <div className="mb">
          <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.5, marginBottom: 14 }}>Tell us what went wrong. The more detail you can give (what you were doing, what you expected, what happened), the easier it'll be for us to help.</div>
          {err && <div className="auth-err">{err}</div>}
          <div className="fg"><label className="fl">What happened?</label><textarea className="ft" placeholder="Describe the problem..." value={description} onChange={e => setDescription(e.target.value)} style={{ minHeight: 120 }} /></div>
          {!isLoggedIn && <>
            <div className="fr">
              <div className="fg"><label className="fl">Your name (optional)</label><input className="fi" value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="fg"><label className="fl">Email (optional)</label><input className="fi" type="email" placeholder="So we can reach you" value={email} onChange={e => setEmail(e.target.value)} /></div>
            </div>
          </>}
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>We'll automatically include the page you're on and your browser info to help us debug.</div>
        </div>
        <div className="mf">
          <button className="btn btn-s" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" disabled={busy || !description.trim()} onClick={submit}>{busy ? "Submitting..." : "Submit report"}</button>
        </div>
      </>}
    </div>
  </div>;
}
