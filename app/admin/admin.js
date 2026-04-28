"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ADMIN_CSS } from "../../lib/admin-styles";
import { fmt, fmtDate } from "../../lib/utils";
import { I } from "../../lib/icons";

function relTime(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return fmtDate(iso);
}

export default function Admin() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); if (!s) { setProfile(null); setLoading(false); } });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      setProfile(data);
      setLoading(false);
    })();
  }, [session]);

  if (loading) return <><style>{ADMIN_CSS}</style><div className="admin-root"><div className="a-loading"><div className="a-spinner" /></div></div></>;

  if (!session || !profile) return <><style>{ADMIN_CSS}</style><div className="admin-root"><AdminLogin /></div></>;
  if (!profile.is_admin) return <><style>{ADMIN_CSS}</style><div className="admin-root"><NotAuthorized email={session.user.email} /></div></>;

  return <><style>{ADMIN_CSS}</style><div className="admin-root"><AdminShell session={session} profile={profile} /></div></>;
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
    setBusy(false);
  };
  return <div className="admin-login"><div className="al-card">
    <div className="al-title">StallHQ Admin</div>
    <div className="al-h">Sign in</div>
    {err && <div className="al-msg">{err}</div>}
    <form onSubmit={submit}>
      <div style={{ marginBottom: 12 }}><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width: "100%", padding: "12px 14px", background: "var(--a-bg)", border: "1px solid var(--a-b)", borderRadius: 10, color: "var(--a-t)", fontSize: 14, fontFamily: "var(--afb)" }} /></div>
      <div style={{ marginBottom: 16 }}><input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ width: "100%", padding: "12px 14px", background: "var(--a-bg)", border: "1px solid var(--a-b)", borderRadius: 10, color: "var(--a-t)", fontSize: 14, fontFamily: "var(--afb)" }} /></div>
      <button type="submit" disabled={busy} style={{ width: "100%", padding: 12, background: "var(--a-g)", color: "#000", border: "none", borderRadius: 10, fontWeight: 700, fontFamily: "var(--afb)", cursor: "pointer", opacity: busy ? 0.5 : 1 }}>{busy ? "..." : "Sign in"}</button>
    </form>
  </div></div>;
}

function NotAuthorized({ email }) {
  return <div className="admin-login"><div className="al-card">
    <div className="al-title">StallHQ Admin</div>
    <div className="al-h">Access Denied</div>
    <div className="al-msg">The account <b>{email}</b> does not have admin permissions.</div>
    <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 16, padding: "10px 20px", background: "var(--a-sh)", color: "var(--a-t)", border: "1px solid var(--a-b)", borderRadius: 8, cursor: "pointer", fontFamily: "var(--afb)", fontSize: 13 }}>Sign out</button>
  </div></div>;
}

function AdminShell({ session, profile }) {
  const [page, setPage] = useState("overview");
  const [data, setData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { loadAll(); const t = setInterval(loadAll, 30000); return () => clearInterval(t); }, []);

  async function loadAll() {
    const [profs, items, custs, ords, pays, acts, revs, bugs] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("items").select("id, user_id, type"),
      supabase.from("customers").select("id, user_id"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*"),
      supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("bug_reports").select("*").order("created_at", { ascending: false }),
    ]);
    setData({
      profiles: profs.data || [], items: items.data || [], customers: custs.data || [],
      orders: ords.data || [], payments: pays.data || [], activity: acts.data || [],
      reviews: revs.data || [],
      bug_reports: bugs.data || [],
    });
  }

  const logout = async () => { await supabase.auth.signOut(); };

  const NAV = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "orders", label: "Orders" },
    { id: "reviews", label: "Reviews" },
    { id: "support", label: "Support" },
    { id: "activity", label: "Activity" },
  ];

  if (!data) return <div className="a-loading"><div className="a-spinner" /></div>;

  return <div className="admin-shell">
    <div className="a-mobheader"><div className="bn">StallHQ Admin</div><button className="a-mobbtn" onClick={() => setSidebarOpen(!sidebarOpen)}>{I.menu}</button></div>
    <div className={`a-ov ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
    <aside className={`admin-side ${sidebarOpen ? "open" : ""}`}>
      <div className="admin-brand"><span>StallHQ Admin</span><span className="adot"></span></div>
      <nav className="admin-nav">{NAV.map(n => <button key={n.id} className={`ani ${page === n.id ? "act" : ""}`} onClick={() => { setPage(n.id); setSidebarOpen(false); }}>{n.label}</button>)}</nav>
      <div className="admin-footer">
        <div className="aft">{profile.business_email || session.user.email}</div>
        <button className="af-btn" onClick={logout}>{I.logout} Sign out</button>
        <a href="/" className="af-btn" style={{ textDecoration: "none", marginTop: 4 }}>{I.arr} Back to StallHQ</a>
      </div>
    </aside>
    <main className="admin-main">
      {page === "overview" && <Overview data={data} />}
      {page === "users" && <Users data={data} />}
      {page === "orders" && <Orders data={data} />}
      {page === "reviews" && <Reviews data={data} />}
      {page === "support" && <Support data={data} reload={loadAll} />}
      {page === "activity" && <Activity data={data} />}
    </main>
  </div>;
}

// ══════════════════════════════════════════════════════════════
// OVERVIEW
// ══════════════════════════════════════════════════════════════
function Overview({ data }) {
  const { profiles, items, customers, orders, payments } = data;
  const nonAdmin = profiles.filter(p => !p.is_admin);
  const now = Date.now();
  const weekAgo = now - 7 * 86400000;
  const twoWeeksAgo = now - 14 * 86400000;

  const signupsThisWeek = nonAdmin.filter(p => new Date(p.created_at).getTime() > weekAgo).length;
  const signupsLastWeek = nonAdmin.filter(p => { const t = new Date(p.created_at).getTime(); return t > twoWeeksAgo && t <= weekAgo; }).length;
  const signupDelta = signupsThisWeek - signupsLastWeek;

  const ordersThisWeek = orders.filter(o => new Date(o.created_at).getTime() > weekAgo).length;
  const ordersLastWeek = orders.filter(o => { const t = new Date(o.created_at).getTime(); return t > twoWeeksAgo && t <= weekAgo; }).length;
  const orderDelta = ordersThisWeek - ordersLastWeek;

  const gmv = orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + Number(o.total || 0), 0);
  const collected = payments.reduce((s, p) => s + Number(p.amount), 0);
  const storefrontOrders = orders.filter(o => o.source === "storefront").length;
  const storefrontPct = orders.length > 0 ? Math.round((storefrontOrders / orders.length) * 100) : 0;

  // 30-day activity chart
  const days30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i)); d.setHours(0, 0, 0, 0);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const signups = nonAdmin.filter(p => { const t = new Date(p.created_at); return t >= d && t < next; }).length;
    const ords = orders.filter(o => { const t = new Date(o.created_at); return t >= d && t < next; }).length;
    return { day: d, signups, orders: ords, label: d.getDate() };
  });
  const maxActivity = Math.max(...days30.map(d => d.signups + d.orders), 1);

  // Top vendors by revenue
  const vendorStats = nonAdmin.map(p => {
    const ords = orders.filter(o => o.user_id === p.id && o.status !== "Cancelled");
    const rev = payments.filter(pay => pay.user_id === p.id).reduce((s, pay) => s + Number(pay.amount), 0);
    return { id: p.id, name: p.business_name, orderCount: ords.length, revenue: rev };
  });
  const topByRevenue = [...vendorStats].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topByOrders = [...vendorStats].sort((a, b) => b.orderCount - a.orderCount).slice(0, 5);

  return <div>
    <div className="admin-ph"><div className="adm-t">Overview</div><div className="adm-s">{nonAdmin.length} vendors · {new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</div></div>

    <div className="kpi-grid">
      <div className="kpi"><div className="kpi-l">Total Vendors</div><div className="kpi-v">{nonAdmin.length}</div><div className={`kpi-d ${signupDelta >= 0 ? "up" : "down"}`}>{signupDelta >= 0 ? "▲" : "▼"} {Math.abs(signupDelta)} this week vs last</div></div>
      <div className="kpi"><div className="kpi-l">Total Orders</div><div className="kpi-v">{orders.length.toLocaleString()}</div><div className={`kpi-d ${orderDelta >= 0 ? "up" : "down"}`}>{orderDelta >= 0 ? "▲" : "▼"} {Math.abs(orderDelta)} this week vs last</div></div>
      <div className="kpi"><div className="kpi-l">Platform GMV</div><div className="kpi-v">{fmt(gmv)}</div><div className="kpi-d">gross merchandise value</div></div>
      <div className="kpi"><div className="kpi-l">Payments Tracked</div><div className="kpi-v">{fmt(collected)}</div><div className="kpi-d">{payments.length} payments logged</div></div>
      <div className="kpi"><div className="kpi-l">Storefront %</div><div className="kpi-v">{storefrontPct}%</div><div className="kpi-d">{storefrontOrders} of {orders.length} orders</div></div>
      <div className="kpi"><div className="kpi-l">Catalog Items</div><div className="kpi-v">{items.length}</div><div className="kpi-d">{items.filter(i => i.type === "Product").length} products · {items.filter(i => i.type === "Service").length} services</div></div>
    </div>

    <div className="a-card" style={{ marginBottom: 20 }}>
      <div className="a-card-h"><div className="a-card-t">Last 30 Days — Signups & Orders</div></div>
      <div className="a-chart">
        {days30.map((d, i) => {
          const h = ((d.signups + d.orders) / maxActivity) * 100;
          return <div className="a-bc" key={i} title={`${d.label}: ${d.signups} signups, ${d.orders} orders`}>
            <div className="a-bar" style={{ height: `${h}%`, background: d.signups > 0 ? "linear-gradient(to top, var(--a-g), var(--a-b2))" : "var(--a-b2)" }} />
            {i % 5 === 0 && <div className="a-bc-l">{d.label}</div>}
          </div>;
        })}
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 11, color: "var(--a-t3)", fontFamily: "var(--afm)" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--a-g)", borderRadius: 2, marginRight: 6, verticalAlign: "middle" }} />signups</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--a-b2)", borderRadius: 2, marginRight: 6, verticalAlign: "middle" }} />orders</span>
      </div>
    </div>

    <div className="a-two">
      <div className="a-card">
        <div className="a-card-h"><div className="a-card-t">Top Vendors by Revenue</div></div>
        {topByRevenue.length === 0 || topByRevenue.every(v => v.revenue === 0) ? <div className="a-empty">No revenue yet</div> :
          topByRevenue.map((v, i) => <div className="a-bullet" key={v.id}>
            <span className="rank">{String(i + 1).padStart(2, "0")}</span>
            <span className="name">{v.name}</span>
            <span className="num">{fmt(v.revenue)}</span>
          </div>)
        }
      </div>
      <div className="a-card">
        <div className="a-card-h"><div className="a-card-t">Top Vendors by Orders</div></div>
        {topByOrders.length === 0 || topByOrders.every(v => v.orderCount === 0) ? <div className="a-empty">No orders yet</div> :
          topByOrders.map((v, i) => <div className="a-bullet" key={v.id}>
            <span className="rank">{String(i + 1).padStart(2, "0")}</span>
            <span className="name">{v.name}</span>
            <span className="num">{v.orderCount}</span>
          </div>)
        }
      </div>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════════
function Users({ data }) {
  const { profiles, items, customers, orders, payments, activity } = data;
  const nonAdmin = profiles.filter(p => !p.is_admin);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState(null);

  const withStats = nonAdmin.map(p => {
    const userItems = items.filter(i => i.user_id === p.id);
    const userCusts = customers.filter(c => c.user_id === p.id);
    const userOrders = orders.filter(o => o.user_id === p.id);
    const userPayments = payments.filter(pay => pay.user_id === p.id);
    const lastAct = activity.find(a => a.user_id === p.id);
    return {
      ...p,
      itemCount: userItems.length,
      customerCount: userCusts.length,
      orderCount: userOrders.length,
      revenue: userPayments.reduce((s, pay) => s + Number(pay.amount), 0),
      lastActive: lastAct?.created_at,
    };
  });

  const filtered = withStats
    .filter(p => (p.business_name || "").toLowerCase().includes(search.toLowerCase()) || (p.business_email || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sort === "revenue") return b.revenue - a.revenue;
      if (sort === "orders") return b.orderCount - a.orderCount;
      if (sort === "active") return new Date(b.lastActive || 0) - new Date(a.lastActive || 0);
      return 0;
    });

  if (selected) {
    const user = withStats.find(p => p.id === selected);
    if (!user) { setSelected(null); return null; }
    const userOrders = orders.filter(o => o.user_id === user.id).slice(0, 20);
    const userActivity = activity.filter(a => a.user_id === user.id).slice(0, 30);
    return <div>
      <div style={{ marginBottom: 24 }}><button onClick={() => setSelected(null)} style={{ background: "none", border: "1px solid var(--a-b)", color: "var(--a-t2)", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "var(--afb)", fontSize: 12 }}>← Back to users</button></div>
      <div className="admin-ph"><div className="adm-t">{user.business_name}</div><div className="adm-s">{user.business_email} · joined {fmtDate(user.created_at)}</div></div>
      <div className="kpi-grid">
        <div className="kpi"><div className="kpi-l">Revenue</div><div className="kpi-v">{fmt(user.revenue)}</div></div>
        <div className="kpi"><div className="kpi-l">Orders</div><div className="kpi-v">{user.orderCount}</div></div>
        <div className="kpi"><div className="kpi-l">Customers</div><div className="kpi-v">{user.customerCount}</div></div>
        <div className="kpi"><div className="kpi-l">Items</div><div className="kpi-v">{user.itemCount}</div></div>
      </div>
      <div className="a-two">
        <div className="a-card"><div className="a-card-h"><div className="a-card-t">Profile</div></div>
          <div style={{ display: "grid", gap: 10, fontSize: 12.5 }}>
            <DetailRow k="Business" v={user.business_name} />
            <DetailRow k="Email" v={user.business_email || "—"} />
            <DetailRow k="Phone" v={user.business_phone || "—"} />
            <DetailRow k="Type" v={user.business_type || "—"} />
            <DetailRow k="Storefront" v={user.slug ? <a href={`/shop/${user.slug}`} target="_blank" rel="noopener" style={{ color: "var(--a-g)" }}>/shop/{user.slug}</a> : "—"} />
            <DetailRow k="Bank" v={user.bank_name || "—"} />
            <DetailRow k="Account" v={user.account_number ? `${user.account_number} (${user.account_name || "—"})` : "—"} />
            <DetailRow k="Accepts orders" v={user.accepts_orders ? "Yes" : "No"} />
            <DetailRow k="Joined" v={fmtDate(user.created_at)} />
            <DetailRow k="Last active" v={user.lastActive ? relTime(user.lastActive) : "Unknown"} />
          </div>
        </div>
        <div className="a-card"><div className="a-card-h"><div className="a-card-t">Recent Activity</div></div>
          {userActivity.length === 0 ? <div className="a-empty">No activity logged</div> :
            <div className="a-feed">{userActivity.map(a => <div className="a-fe" key={a.id}><div className="dot" /><div className="text">{a.action}</div><div className="when">{relTime(a.created_at)}</div></div>)}</div>
          }
        </div>
      </div>
      <div className="a-card" style={{ marginTop: 20 }}>
        <div className="a-card-h"><div className="a-card-t">Recent Orders ({userOrders.length} shown)</div></div>
        {userOrders.length === 0 ? <div className="a-empty">No orders yet</div> : <>
          <div className="a-tw"><table className="a-table"><thead><tr><th>Date</th><th>Customer</th><th>Item</th><th>Total</th><th>Source</th><th>Status</th></tr></thead>
            <tbody>{userOrders.map(o => <tr key={o.id}><td className="mono">{fmtDate(o.date)}</td><td>{o.customer_name || "Walk-in"}</td><td>{o.item_name}</td><td className="mono">{fmt(o.total)}</td><td><span className={`a-badge ${o.source === "storefront" ? "a-bg-p" : "a-bg-gr"}`}>{o.source || "manual"}</span></td><td><span className={`a-badge ${statusBadge(o)}`}>{o.status}</span></td></tr>)}</tbody>
          </table></div>
          <div className="a-mcards">{userOrders.map(o => <div key={o.id} className="a-mcard">
            <div className="a-mcard-top">
              <div className="a-mcard-name">{o.customer_name || "Walk-in"}</div>
              <span className={`a-badge ${statusBadge(o)}`}>{o.status}</span>
            </div>
            <div className="a-mcard-meta">{fmtDate(o.date)}</div>
            <div style={{ fontSize: 12.5, marginTop: 4 }}>{o.item_name}</div>
            <div className="a-mcard-stats">
              <div className="a-mcard-stat"><span className="k">Total</span><span className="v">{fmt(o.total)}</span></div>
              <div className="a-mcard-stat"><span className="k">Source</span><span className="v"><span className={`a-badge ${o.source === "storefront" ? "a-bg-p" : "a-bg-gr"}`}>{o.source || "manual"}</span></span></div>
            </div>
          </div>)}</div>
        </>}
      </div>
    </div>;
  }

  return <div>
    <div className="admin-ph"><div className="adm-t">Users</div><div className="adm-s">{nonAdmin.length} vendors</div></div>
    <div className="a-filterrow">
      <div className="a-search"><span className="ic">{I.search}</span><input placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="a-tabs">
        {[["newest", "Newest"], ["revenue", "Revenue"], ["orders", "Orders"], ["active", "Last active"]].map(([v, l]) => <button key={v} className={`a-tab ${sort === v ? "act" : ""}`} onClick={() => setSort(v)}>{l}</button>)}
      </div>
    </div>
    <div className="a-card" style={{ padding: 0 }}><div className="a-tw">
      <table className="a-table"><thead><tr><th>Business</th><th>Email</th><th>Type</th><th>Items</th><th>Orders</th><th>Revenue</th><th>Joined</th><th>Last active</th></tr></thead>
        <tbody>{filtered.map(p => <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setSelected(p.id)}>
          <td style={{ fontWeight: 500 }}>{p.business_name}</td>
          <td className="mono">{p.business_email || "—"}</td>
          <td><span className={`a-badge ${p.business_type === "products" ? "a-bg-b" : p.business_type === "services" ? "a-bg-p" : "a-bg-gr"}`}>{p.business_type || "—"}</span></td>
          <td className="mono">{p.itemCount}</td>
          <td className="mono">{p.orderCount}</td>
          <td className="mono" style={{ color: "var(--a-g)" }}>{fmt(p.revenue)}</td>
          <td className="mono">{fmtDate(p.created_at)}</td>
          <td className="mono">{p.lastActive ? relTime(p.lastActive) : "—"}</td>
        </tr>)}</tbody>
      </table>
    </div></div>
    <div className="a-mcards">{filtered.map(p => <div key={p.id} className="a-mcard" onClick={() => setSelected(p.id)}>
      <div className="a-mcard-top">
        <div className="a-mcard-name">{p.business_name}</div>
        <span className={`a-badge ${p.business_type === "products" ? "a-bg-b" : p.business_type === "services" ? "a-bg-p" : "a-bg-gr"}`}>{p.business_type || "—"}</span>
      </div>
      <div className="a-mcard-meta">{p.business_email || "—"}</div>
      <div className="a-mcard-stats">
        <div className="a-mcard-stat"><span className="k">Revenue</span><span className="v pos">{fmt(p.revenue)}</span></div>
        <div className="a-mcard-stat"><span className="k">Orders</span><span className="v">{p.orderCount}</span></div>
        <div className="a-mcard-stat"><span className="k">Items</span><span className="v">{p.itemCount}</span></div>
        <div className="a-mcard-stat"><span className="k">Joined</span><span className="v">{fmtDate(p.created_at)}</span></div>
        <div className="a-mcard-stat"><span className="k">Active</span><span className="v">{p.lastActive ? relTime(p.lastActive) : "—"}</span></div>
      </div>
    </div>)}</div>
    {filtered.length === 0 && <div className="a-empty" style={{ marginTop: 20 }}>No users match your search.</div>}
  </div>;
}

function DetailRow({ k, v }) {
  return <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--a-bl)" }}>
    <span style={{ color: "var(--a-t3)", fontFamily: "var(--afm)", fontSize: 11 }}>{k}</span>
    <span style={{ fontWeight: 500, textAlign: "right", maxWidth: "65%", wordBreak: "break-word" }}>{v}</span>
  </div>;
}

function statusBadge(o) {
  if (o.status === "Completed") return "a-bg-g";
  if (o.status === "Cancelled") return "a-bg-r";
  if (o.status === "In Progress") return "a-bg-b";
  return "a-bg-a";
}

// ══════════════════════════════════════════════════════════════
// ORDERS (all orders across platform)
// ══════════════════════════════════════════════════════════════
function Orders({ data }) {
  const { orders, profiles, payments } = data;
  const vendorMap = Object.fromEntries(profiles.map(p => [p.id, p.business_name]));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = orders
    .filter(o => statusFilter === "All" || (statusFilter === "Storefront" ? o.source === "storefront" : o.status === statusFilter))
    .filter(o => {
      const s = search.toLowerCase();
      if (!s) return true;
      return (o.customer_name || "").toLowerCase().includes(s) || (o.item_name || "").toLowerCase().includes(s) || (vendorMap[o.user_id] || "").toLowerCase().includes(s);
    });

  const paidFor = (oid) => payments.filter(p => p.order_id === oid).reduce((s, p) => s + Number(p.amount), 0);

  return <div>
    <div className="admin-ph"><div className="adm-t">All Orders</div><div className="adm-s">{orders.length} total across all vendors</div></div>
    <div className="a-filterrow">
      <div className="a-search"><span className="ic">{I.search}</span><input placeholder="Search customer, item, vendor..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="a-tabs">
        {["All", "Storefront", "Pending", "In Progress", "Completed", "Cancelled"].map(t => <button key={t} className={`a-tab ${statusFilter === t ? "act" : ""}`} onClick={() => setStatusFilter(t)}>{t}</button>)}
      </div>
    </div>
    <div className="a-card" style={{ padding: 0 }}><div className="a-tw">
      <table className="a-table"><thead><tr><th>Date</th><th>Vendor</th><th>Customer</th><th>Item</th><th>Total</th><th>Paid</th><th>Source</th><th>Status</th></tr></thead>
        <tbody>{filtered.slice(0, 200).map(o => <tr key={o.id}>
          <td className="mono">{fmtDate(o.date)}</td>
          <td style={{ fontWeight: 500 }}>{vendorMap[o.user_id] || "—"}</td>
          <td>{o.customer_name || "Walk-in"}{o.customer_phone && <div style={{ fontSize: 10.5, color: "var(--a-t3)", marginTop: 1 }} className="mono">{o.customer_phone}</div>}</td>
          <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.item_name}</td>
          <td className="mono">{fmt(o.total)}</td>
          <td className="mono" style={{ color: "var(--a-g)" }}>{fmt(paidFor(o.id))}</td>
          <td><span className={`a-badge ${o.source === "storefront" ? "a-bg-p" : "a-bg-gr"}`}>{o.source || "manual"}</span></td>
          <td><span className={`a-badge ${statusBadge(o)}`}>{o.status}</span></td>
        </tr>)}</tbody>
      </table>
    </div></div>
    <div className="a-mcards">{filtered.slice(0, 200).map(o => <div key={o.id} className="a-mcard">
      <div className="a-mcard-top">
        <div className="a-mcard-name">{o.customer_name || "Walk-in"}</div>
        <span className={`a-badge ${statusBadge(o)}`}>{o.status}</span>
      </div>
      <div className="a-mcard-meta">{vendorMap[o.user_id] || "—"} · {fmtDate(o.date)}</div>
      <div style={{ fontSize: 12.5, marginTop: 4 }}>{o.item_name}</div>
      <div className="a-mcard-stats">
        <div className="a-mcard-stat"><span className="k">Total</span><span className="v">{fmt(o.total)}</span></div>
        <div className="a-mcard-stat"><span className="k">Paid</span><span className="v pos">{fmt(paidFor(o.id))}</span></div>
        <div className="a-mcard-stat"><span className="k">Source</span><span className="v"><span className={`a-badge ${o.source === "storefront" ? "a-bg-p" : "a-bg-gr"}`}>{o.source || "manual"}</span></span></div>
      </div>
    </div>)}</div>
    {filtered.length === 0 && <div className="a-empty" style={{ marginTop: 20 }}>No orders match.</div>}
    {filtered.length > 200 && <div style={{ padding: "16px 0", color: "var(--a-t3)", fontSize: 11, fontFamily: "var(--afm)", textAlign: "center" }}>Showing first 200 of {filtered.length}</div>}
  </div>;
}

// ══════════════════════════════════════════════════════════════
// REVIEWS (platform-wide)
// ══════════════════════════════════════════════════════════════
function Reviews({ data }) {
  const { reviews, profiles } = data;
  const vendorMap = Object.fromEntries(profiles.map(p => [p.id, p.business_name || p.business_email]));
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = reviews
    .filter(r => {
      if (filter === "reported") return r.is_reported;
      if (filter === "clean") return !r.is_reported;
      if (filter === "5") return r.rating === 5;
      if (filter === "low") return r.rating <= 2;
      return true;
    })
    .filter(r => {
      const s = search.toLowerCase();
      if (!s) return true;
      return (vendorMap[r.user_id] || "").toLowerCase().includes(s) || (r.comment || "").toLowerCase().includes(s) || (r.reviewer_name || "").toLowerCase().includes(s);
    });

  const totalReported = reviews.filter(r => r.is_reported).length;
  const avgRating = reviews.length > 0 ? (reviews.filter(r => !r.is_reported).reduce((s, r) => s + r.rating, 0) / Math.max(1, reviews.filter(r => !r.is_reported).length)).toFixed(2) : "—";

  return <div>
    <div className="admin-ph"><div className="adm-t">Reviews</div><div className="adm-s">{reviews.length} total · avg {avgRating} · {totalReported} reported</div></div>

    <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
      <div className="kpi"><div className="kpi-l">Total Reviews</div><div className="kpi-v">{reviews.length}</div></div>
      <div className="kpi"><div className="kpi-l">Platform Avg</div><div className="kpi-v">{avgRating}</div><div className="kpi-d">excluding reported</div></div>
      <div className="kpi"><div className="kpi-l">5-Star</div><div className="kpi-v">{reviews.filter(r => r.rating === 5).length}</div></div>
      <div className="kpi"><div className="kpi-l">Low (≤2)</div><div className="kpi-v">{reviews.filter(r => r.rating <= 2).length}</div></div>
      <div className="kpi"><div className="kpi-l">Reported</div><div className="kpi-v" style={{ color: totalReported > 0 ? "var(--a-r)" : "inherit" }}>{totalReported}</div></div>
    </div>

    <div className="a-filterrow">
      <div className="a-search"><span className="ic">{I.search}</span><input placeholder="Search vendor, reviewer, comment..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="a-tabs">
        {[["all", "All"], ["clean", "Not Reported"], ["reported", "Reported"], ["5", "5-star"], ["low", "Low (≤2)"]].map(([v, l]) => <button key={v} className={`a-tab ${filter === v ? "act" : ""}`} onClick={() => setFilter(v)}>{l}</button>)}
      </div>
    </div>

    {filtered.length === 0 ? <div className="a-empty">No reviews match.</div> :
      <div className="a-card" style={{ padding: 18 }}>
        {filtered.map(r => <div key={r.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--a-bl)", opacity: r.is_reported ? 0.6 : 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 1, color: "var(--a-am)" }}>{[1, 2, 3, 4, 5].map(n => <span key={n} style={{ color: n <= r.rating ? "var(--a-am)" : "var(--a-b)" }}>{I.star}</span>)}</div>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{vendorMap[r.user_id] || "Unknown vendor"}</span>
              <span style={{ color: "var(--a-t3)", fontSize: 11.5, fontFamily: "var(--afm)" }}>{r.reviewer_name || "Anonymous"}</span>
              {r.is_reported && <span className="a-badge a-bg-r">Reported</span>}
            </div>
            <span style={{ fontSize: 10.5, color: "var(--a-t3)", fontFamily: "var(--afm)" }}>{fmtDate(r.created_at)}</span>
          </div>
          {r.comment && <div style={{ fontSize: 12.5, color: "var(--a-t2)", lineHeight: 1.6, marginTop: 6 }}>{r.comment}</div>}
        </div>)}
      </div>
    }
  </div>;
}

// ══════════════════════════════════════════════════════════════
// SUPPORT (bug reports)
// ══════════════════════════════════════════════════════════════
function Support({ data, reload }) {
  const { bug_reports = [], profiles } = data;
  const profMap = Object.fromEntries(profiles.map(p => [p.id, p.business_name || p.business_email]));
  const [filter, setFilter] = useState("open");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = bug_reports
    .filter(b => filter === "all" ? true : b.status === filter)
    .filter(b => priorityFilter === "all" ? true : b.priority === priorityFilter)
    .filter(b => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (b.description || "").toLowerCase().includes(s)
        || (b.reporter_name || "").toLowerCase().includes(s)
        || (b.reporter_email || "").toLowerCase().includes(s)
        || (profMap[b.reporter_user_id] || "").toLowerCase().includes(s);
    });

  const counts = {
    open: bug_reports.filter(b => b.status === "open").length,
    in_progress: bug_reports.filter(b => b.status === "in_progress").length,
    resolved: bug_reports.filter(b => b.status === "resolved").length,
    critical: bug_reports.filter(b => b.priority === "critical" && b.status !== "closed" && b.status !== "resolved").length,
    weekResolved: bug_reports.filter(b => b.status === "resolved" && b.resolved_at && (Date.now() - new Date(b.resolved_at).getTime()) < 7 * 86400000).length,
  };

  const updateReport = async (id, changes) => {
    setBusy(true);
    if (changes.status === "resolved" || changes.status === "closed") {
      changes.resolved_at = new Date().toISOString();
    }
    const { data: updated } = await supabase.from("bug_reports").update(changes).eq("id", id).select().single();
    if (updated && reload) reload();
    if (updated) setSelected(updated);
    setBusy(false);
  };

  return <div>
    <div className="admin-ph"><div className="adm-t">Support</div><div className="adm-s">{bug_reports.length} reports</div></div>

    <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
      <div className="kpi"><div className="kpi-l">Open</div><div className="kpi-v" style={{ color: counts.open > 0 ? "var(--a-am)" : "inherit" }}>{counts.open}</div></div>
      <div className="kpi"><div className="kpi-l">In Progress</div><div className="kpi-v">{counts.in_progress}</div></div>
      <div className="kpi"><div className="kpi-l">Critical Open</div><div className="kpi-v" style={{ color: counts.critical > 0 ? "var(--a-r)" : "inherit" }}>{counts.critical}</div></div>
      <div className="kpi"><div className="kpi-l">Resolved (7d)</div><div className="kpi-v" style={{ color: "var(--a-g)" }}>{counts.weekResolved}</div></div>
    </div>

    <div className="a-filterrow">
      <div className="a-search"><span className="ic">{I.search}</span><input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="a-tabs">
        {[["all", "All"], ["open", "Open"], ["in_progress", "In Progress"], ["resolved", "Resolved"], ["closed", "Closed"]].map(([v, l]) => <button key={v} className={`a-tab ${filter === v ? "act" : ""}`} onClick={() => setFilter(v)}>{l}</button>)}
      </div>
      <select className="fs" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ background: "var(--a-s)", color: "var(--a-t)", border: "1px solid var(--a-b)", padding: "8px 10px", borderRadius: 6, fontSize: 12 }}>
        <option value="all">All priorities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="normal">Normal</option>
        <option value="low">Low</option>
      </select>
    </div>

    {filtered.length === 0 ? <div className="a-empty">No reports match.</div> :
      <div className="a-card" style={{ padding: 0 }}>
        {filtered.map(b => <div key={b.id} onClick={() => setSelected(b)} style={{ padding: "14px 18px", borderBottom: "1px solid var(--a-bl)", cursor: "pointer", transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className={`a-badge ${b.status === "open" ? "a-bg-a" : b.status === "in_progress" ? "a-bg-b" : b.status === "resolved" ? "a-bg-g" : "a-bg-gr"}`}>{b.status.replace("_", " ")}</span>
              <span className={`a-badge ${b.priority === "critical" ? "a-bg-r" : b.priority === "high" ? "a-bg-a" : b.priority === "normal" ? "a-bg-gr" : "a-bg-gr"}`}>{b.priority}</span>
              <span className="a-badge a-bg-p">{b.reporter_role}</span>
            </div>
            <span style={{ fontSize: 10.5, color: "var(--a-t3)", fontFamily: "var(--afm)" }}>{fmtDate(b.created_at)}</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--a-t)", marginBottom: 4 }}>{b.description.slice(0, 200)}{b.description.length > 200 ? "..." : ""}</div>
          <div style={{ fontSize: 11, color: "var(--a-t3)", fontFamily: "var(--afm)" }}>
            {b.reporter_name || profMap[b.reporter_user_id] || "Anonymous"}
            {b.reporter_email && ` · ${b.reporter_email}`}
          </div>
        </div>)}
      </div>
    }

    {selected && <div className="mo" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
      <div className="ml" style={{ background: "var(--a-s)", maxWidth: 640 }}>
        <div className="mh" style={{ borderBottom: "1px solid var(--a-bl)" }}><div className="mt" style={{ color: "var(--a-t)" }}>Report Details</div><button className="mc" onClick={() => setSelected(null)} style={{ color: "var(--a-t)" }}>{I.close}</button></div>
        <div className="mb" style={{ background: "var(--a-s)", color: "var(--a-t)" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <span className={`a-badge ${selected.status === "open" ? "a-bg-a" : selected.status === "in_progress" ? "a-bg-b" : selected.status === "resolved" ? "a-bg-g" : "a-bg-gr"}`}>{selected.status.replace("_", " ")}</span>
            <span className={`a-badge ${selected.priority === "critical" ? "a-bg-r" : selected.priority === "high" ? "a-bg-a" : "a-bg-gr"}`}>{selected.priority}</span>
            <span className="a-badge a-bg-p">{selected.reporter_role}</span>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10.5, color: "var(--a-t3)", textTransform: "uppercase", letterSpacing: .5, fontWeight: 700, marginBottom: 6, fontFamily: "var(--afm)" }}>Description</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, padding: 12, background: "var(--a-bg)", borderRadius: 8, whiteSpace: "pre-wrap" }}>{selected.description}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10.5, color: "var(--a-t3)", textTransform: "uppercase", letterSpacing: .5, fontWeight: 700, marginBottom: 4, fontFamily: "var(--afm)" }}>Reporter</div>
              <div style={{ fontSize: 12.5 }}>{selected.reporter_name || profMap[selected.reporter_user_id] || "Anonymous"}</div>
              {selected.reporter_email && <div style={{ fontSize: 11.5, color: "var(--a-t2)", fontFamily: "var(--afm)", wordBreak: "break-all" }}>{selected.reporter_email}</div>}
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: "var(--a-t3)", textTransform: "uppercase", letterSpacing: .5, fontWeight: 700, marginBottom: 4, fontFamily: "var(--afm)" }}>Submitted</div>
              <div style={{ fontSize: 12.5, fontFamily: "var(--afm)" }}>{fmtDate(selected.created_at)}</div>
            </div>
          </div>

          {selected.page_url && <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10.5, color: "var(--a-t3)", textTransform: "uppercase", letterSpacing: .5, fontWeight: 700, marginBottom: 4, fontFamily: "var(--afm)" }}>Page URL</div>
            <div style={{ fontSize: 11.5, fontFamily: "var(--afm)", wordBreak: "break-all", padding: 8, background: "var(--a-bg)", borderRadius: 6 }}>{selected.page_url}</div>
          </div>}

          {selected.user_agent && <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10.5, color: "var(--a-t3)", textTransform: "uppercase", letterSpacing: .5, fontWeight: 700, marginBottom: 4, fontFamily: "var(--afm)" }}>Browser</div>
            <div style={{ fontSize: 10.5, fontFamily: "var(--afm)", wordBreak: "break-all", color: "var(--a-t2)" }}>{selected.user_agent}</div>
          </div>}

          <div style={{ borderTop: "1px solid var(--a-bl)", paddingTop: 14, marginTop: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10.5, color: "var(--a-t3)", textTransform: "uppercase", letterSpacing: .5, fontWeight: 700, marginBottom: 4, fontFamily: "var(--afm)" }}>Status</div>
                <select value={selected.status} onChange={e => updateReport(selected.id, { status: e.target.value })} disabled={busy} style={{ width: "100%", padding: "9px 12px", background: "var(--a-bg)", color: "var(--a-t)", border: "1px solid var(--a-b)", borderRadius: 6, fontSize: 13, fontFamily: "var(--afb)" }}>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: "var(--a-t3)", textTransform: "uppercase", letterSpacing: .5, fontWeight: 700, marginBottom: 4, fontFamily: "var(--afm)" }}>Priority</div>
                <select value={selected.priority} onChange={e => updateReport(selected.id, { priority: e.target.value })} disabled={busy} style={{ width: "100%", padding: "9px 12px", background: "var(--a-bg)", color: "var(--a-t)", border: "1px solid var(--a-b)", borderRadius: 6, fontSize: 13, fontFamily: "var(--afb)" }}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10.5, color: "var(--a-t3)", textTransform: "uppercase", letterSpacing: .5, fontWeight: 700, marginBottom: 4, fontFamily: "var(--afm)" }}>Admin Notes (private)</div>
              <textarea defaultValue={selected.admin_notes || ""} placeholder="Internal notes — followups, fix details, links..." onBlur={e => { if (e.target.value !== (selected.admin_notes || "")) updateReport(selected.id, { admin_notes: e.target.value }); }} style={{ width: "100%", padding: "9px 12px", background: "var(--a-bg)", color: "var(--a-t)", border: "1px solid var(--a-b)", borderRadius: 6, fontSize: 13, fontFamily: "var(--afb)", minHeight: 80, resize: "vertical" }} />
              <div style={{ fontSize: 10.5, color: "var(--a-t3)", marginTop: 4 }}>Saves when you click outside the box</div>
            </div>
          </div>
        </div>
      </div>
    </div>}
  </div>;
}

// ══════════════════════════════════════════════════════════════
// ACTIVITY FEED
// ══════════════════════════════════════════════════════════════
function Activity({ data }) {
  const { activity, profiles } = data;
  const vendorMap = Object.fromEntries(profiles.map(p => [p.id, p.business_name || p.business_email]));
  const [filter, setFilter] = useState("all");
  const actions = Array.from(new Set(activity.map(a => a.action)));
  const filtered = activity.filter(a => filter === "all" || a.action === filter);

  return <div>
    <div className="admin-ph"><div className="adm-t">Activity Feed</div><div className="adm-s">Recent platform events · updates every 30s</div></div>
    <div className="a-filterrow">
      <div className="a-tabs">
        <button className={`a-tab ${filter === "all" ? "act" : ""}`} onClick={() => setFilter("all")}>All ({activity.length})</button>
        {actions.map(a => <button key={a} className={`a-tab ${filter === a ? "act" : ""}`} onClick={() => setFilter(a)}>{a}</button>)}
      </div>
    </div>
    <div className="a-card">
      {filtered.length === 0 ? <div className="a-empty">No activity yet.</div> :
        <div className="a-feed">{filtered.map(a => <div className="a-fe" key={a.id}>
          <div className="dot" />
          <div className="text"><b>{vendorMap[a.user_id] || "Unknown user"}</b> — {a.action.replace(/_/g, " ")}</div>
          <div className="when">{relTime(a.created_at)}</div>
        </div>)}</div>
      }
    </div>
  </div>;
}
