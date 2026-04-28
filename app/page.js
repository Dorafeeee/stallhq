"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import "./landing.css";
import { StallLogo, StallMark } from "../lib/icons";

export default function Landing() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!mounted) return <div className="lp-root" />;

  return <>
    <div className="lp-root">
      {/* ─────────── Top nav ─────────── */}
      <header className="lp-nav">
        <div className="lp-nav-in">
          <Link href="/" className="lp-brand"><StallLogo w={130} color="var(--lp-t)" /></Link>
          <nav className="lp-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="lp-cta">
            {!sessionChecked ? (
              <span className="lp-cta-placeholder" />
            ) : session ? (
              <Link href="/dashboard" className="lp-btn lp-btn-p">Open dashboard</Link>
            ) : (
              <>
                <Link href="/auth" className="lp-btn lp-btn-g">Sign in</Link>
                <Link href="/auth?mode=signup" className="lp-btn lp-btn-p">Sign up free</Link>
              </>
            )}
          </div>
          <button className="lp-mob" onClick={() => setNavOpen(!navOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
        {navOpen && <div className="lp-nav-mob">
          <a href="#features" onClick={() => setNavOpen(false)}>Features</a>
          <a href="#how" onClick={() => setNavOpen(false)}>How it works</a>
          <a href="#faq" onClick={() => setNavOpen(false)}>FAQ</a>
          {!sessionChecked ? null : session ? (
            <Link href="/dashboard" onClick={() => setNavOpen(false)}>Open dashboard</Link>
          ) : (
            <>
              <Link href="/auth" onClick={() => setNavOpen(false)}>Sign in</Link>
              <Link href="/auth?mode=signup" onClick={() => setNavOpen(false)} className="lp-btn lp-btn-p">Sign up free</Link>
            </>
          )}
        </div>}
      </header>

      {/* ─────────── Hero ─────────── */}
      <section className="lp-hero">
        <div className="lp-hero-in">
          <div className="lp-hero-text">
            <div className="lp-eyebrow">Built for Nigerian entrepreneurs</div>
            <h1 className="lp-h1">Run your business.<br/><span className="lp-accent">Skip the spreadsheet.</span></h1>
            <p className="lp-sub">StallHQ is the simplest way to sell, track inventory, send invoices, and grow your business — all in one place. Free while we grow.</p>
            <div className="lp-hero-ctas">
              <Link href="/auth?mode=signup" className="lp-btn lp-btn-p lp-btn-lg">Sign up free</Link>
              <a href="#demo" className="lp-btn lp-btn-s lp-btn-lg">See it in action →</a>
            </div>
            <div className="lp-trust">No credit card · Set up in under 2 minutes</div>
          </div>
          <div className="lp-hero-visual">
            {/* Placeholder for animated mockup — to be added next */}
            <HeroMockupPlaceholder />
          </div>
        </div>
      </section>

      {/* ─────────── Three pillars ─────────── */}
      <section className="lp-pillars">
        <div className="lp-pillars-in">
          <div className="lp-pillar">
            <div className="lp-pillar-icon"><PillarShop /></div>
            <h3>Sell anywhere</h3>
            <p>Get a free storefront link to share on WhatsApp, Instagram, or anywhere your customers find you. No app downloads required.</p>
          </div>
          <div className="lp-pillar">
            <div className="lp-pillar-icon"><PillarStock /></div>
            <h3>See what's working</h3>
            <p>Revenue, top products, repeat customers — see your business clearly. Make decisions based on real numbers, not guesswork.</p>
          </div>
          <div className="lp-pillar">
            <div className="lp-pillar-icon"><PillarPaid /></div>
            <h3>Get paid faster</h3>
            <p>Bank account on every invoice. Customer-friendly payment status pages. Less back-and-forth, more closed sales.</p>
          </div>
        </div>
      </section>

      {/* ─────────── Feature sections ─────────── */}
      <section id="features" className="lp-features">
        <div className="lp-features-in">
          <div className="lp-section-head">
            <div className="lp-eyebrow">Features</div>
            <h2 className="lp-h2">Everything you need.<br/>Nothing you don't.</h2>
          </div>

          <FeatureRow
            tag="Storefront"
            title="Your shop, online in minutes"
            body="Upload your products, set prices, share the link. Customers browse, add to cart, and check out — no account needed on their end."
            visual={<FeatureStorefront />}
            reverse={false}
          />

          <FeatureRow
            tag="Inventory"
            title="Stock that updates itself"
            body="Available stock automatically reflects pending orders. Customers can't order what isn't in stock. You'll never oversell again."
            visual={<FeatureStock />}
            reverse={true}
          />

          <FeatureRow
            tag="Invoices"
            title="Send invoices that get paid"
            body="Create invoices for offline sales. Customer gets a payment link with your bank details. Stock auto-deducts when paid. The whole offline-to-online loop in one click."
            visual={<FeatureInvoice />}
            reverse={false}
          />

          <FeatureRow
            tag="Reviews"
            title="Build trust with every order"
            body="Customers rate your business after each completed order. Aggregate stars show on your storefront — social proof that converts new visitors into buyers."
            visual={<FeatureReviews />}
            reverse={true}
          />

          <FeatureRow
            tag="Insights"
            title="Know your numbers"
            body="Daily revenue, top products, repeat customers. Action-needed counts for orders waiting on you. Stock alerts when items run low. All in one dashboard so you always know how your business is doing."
            visual={<FeatureMetrics />}
            reverse={false}
          />

          <FeatureRow
            tag="Bulk upload"
            title="Add 50 products in 5 minutes"
            body="Upload a CSV, preview validation errors, import only what's clean. Stop typing products one by one."
            visual={<FeatureBulk />}
            reverse={true}
          />
        </div>
      </section>

      {/* ─────────── How it works ─────────── */}
      <section id="how" className="lp-how">
        <div className="lp-how-in">
          <div className="lp-section-head">
            <div className="lp-eyebrow">How it works</div>
            <h2 className="lp-h2">From signup to first sale.</h2>
          </div>
          <div className="lp-steps">
            <Step n={1} title="Sign up free" body="Create your account in under 2 minutes. No payment required." />
            <Step n={2} title="Add your products" body="Upload one by one or bulk-import via CSV. Set prices, stock, photos." />
            <Step n={3} title="Share your storefront" body="Get a unique link to share on WhatsApp, Instagram, or anywhere." />
            <Step n={4} title="Manage and grow" body="Track orders, send invoices, build reviews, watch your business grow." />
          </div>
        </div>
      </section>

      {/* ─────────── See it in action (demo placeholder) ─────────── */}
      <section id="demo" className="lp-demo">
        <div className="lp-demo-in">
          <div className="lp-section-head">
            <div className="lp-eyebrow">See it in action</div>
            <h2 className="lp-h2">Try it yourself, right here.</h2>
            <p className="lp-section-sub">No signup required. Click around and see how StallHQ feels.</p>
          </div>
          <DemoTabsPlaceholder />
        </div>
      </section>

      {/* ─────────── Pricing ─────────── */}
      <section className="lp-pricing">
        <div className="lp-pricing-in">
          <div className="lp-eyebrow">Pricing</div>
          <h2 className="lp-h2">Free while we grow.</h2>
          <p className="lp-section-sub">Pricing introduced as the product matures. Early users will always have access to fair, honest pricing when that time comes.</p>
          <Link href="/auth?mode=signup" className="lp-btn lp-btn-p lp-btn-lg" style={{ marginTop: 24 }}>Get started free</Link>
        </div>
      </section>

      {/* ─────────── FAQ ─────────── */}
      <section id="faq" className="lp-faq">
        <div className="lp-faq-in">
          <div className="lp-section-head">
            <div className="lp-eyebrow">FAQ</div>
            <h2 className="lp-h2">Common questions.</h2>
          </div>
          <div className="lp-faq-list">
            {FAQS.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className={`lp-faq-item ${isOpen ? "lp-faq-open" : ""}`}>
                  <button className="lp-faq-q" onClick={() => setOpenFaq(isOpen ? -1 : i)} aria-expanded={isOpen}>
                    <span>{f.q}</span>
                    <span className="lp-faq-icon" aria-hidden="true">+</span>
                  </button>
                  {isOpen && <div className="lp-faq-a">{f.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── Final CTA ─────────── */}
      <section className="lp-cta-final">
        <div className="lp-cta-final-in">
          <h2 className="lp-h2">Ready to grow your business?</h2>
          <p className="lp-section-sub">Join the entrepreneurs running their business on StallHQ.</p>
          <Link href="/auth?mode=signup" className="lp-btn lp-btn-p lp-btn-lg">Sign up free →</Link>
        </div>
      </section>

      {/* ─────────── Footer ─────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-in">
          <div className="lp-footer-brand">
            <StallLogo w={120} color="var(--lp-t)" />
            <div className="lp-footer-tag">Run your business. Skip the spreadsheet.</div>
          </div>
          <div className="lp-footer-cols">
            <div>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <a href="#demo">See it in action</a>
              <a href="#faq">FAQ</a>
            </div>
            <div>
              <h4>Get started</h4>
              <Link href="/auth">Sign in</Link>
              <Link href="/auth?mode=signup">Sign up free</Link>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 StallHQ. Made in Lagos.</span>
        </div>
      </footer>
    </div>
  </>;
}

// ─────────────── Sub-components ───────────────

function FeatureRow({ tag, title, body, visual, reverse }) {
  return <div className={`lp-feat ${reverse ? "lp-feat-rev" : ""}`}>
    <div className="lp-feat-text">
      <div className="lp-feat-tag">{tag}</div>
      <h3 className="lp-h3">{title}</h3>
      <p>{body}</p>
    </div>
    <div className="lp-feat-visual">{visual}</div>
  </div>;
}

function Step({ n, title, body }) {
  return <div className="lp-step">
    <div className="lp-step-n">{n}</div>
    <div>
      <h4>{title}</h4>
      <p>{body}</p>
    </div>
  </div>;
}

const FAQS = [
  { q: "Is StallHQ free to use?", a: "Yes. StallHQ is free while we grow. We may introduce paid tiers as the product matures, but early users will always have access to fair, honest pricing." },
  { q: "What kind of businesses can use StallHQ?", a: "Any small business that sells products or services. Bakeries, makeup artists, fashion vendors, electronics resellers, freelancers — if you take orders and want to manage them in one place, StallHQ works for you." },
  { q: "Do customers need to download an app?", a: "No. Customers shop on a regular web link you share with them. No downloads, no signups required on their end." },
  { q: "How do customers pay?", a: "Customers see your bank account details on their order page after you send the invoice. They transfer, click 'I've paid', and you confirm. We don't process payments — your money goes straight to your bank." },
  { q: "Can I track inventory?", a: "Yes. StallHQ deducts stock automatically when orders are confirmed and shows 'only X left' warnings to customers when stock is low. You'll never oversell." },
  { q: "Can I share my storefront on WhatsApp or Instagram?", a: "That's the whole idea. You get a unique link like stallhq.app/shop/your-business that you can share anywhere — WhatsApp status, Instagram bio, business cards, anywhere." },
  { q: "What about delivery?", a: "Set up custom delivery zones with their own prices (Lekki ₦2000, Ikeja ₦2500, etc.). Customers pick their zone at checkout and the fee is added automatically." },
];

// ─────────────── Placeholder visuals ───────────────
// These will be replaced with the animated mockup and 3-tab interactive demo in the next chat.

function HeroMockupPlaceholder() {
  return <div className="lp-mock">
    {/* Browser chrome */}
    <div className="lp-mock-bar">
      <span /><span /><span />
      <div className="lp-mock-url">stallhq.app/dashboard</div>
    </div>

    {/* Dashboard body */}
    <div className="lp-mock-body">
      {/* Sidebar (collapsed visual) */}
      <div className="lp-mock-side">
        <div className="lp-mock-side-logo" />
        <div className="lp-mock-side-item active" />
        <div className="lp-mock-side-item" />
        <div className="lp-mock-side-item" />
        <div className="lp-mock-side-item" />
      </div>

      {/* Main panel */}
      <div className="lp-mock-main">
        <div className="lp-mock-greeting">Good morning, Bola</div>

        {/* Stat cards */}
        <div className="lp-mock-stats">
          <div className="lp-mock-stat">
            <div className="lp-mock-stat-l">Orders today</div>
            <div className="lp-mock-stat-v"><span className="lp-mock-counter">12</span></div>
          </div>
          <div className="lp-mock-stat">
            <div className="lp-mock-stat-l">Revenue</div>
            <div className="lp-mock-stat-v lp-mock-rev">₦240k</div>
          </div>
          <div className="lp-mock-stat">
            <div className="lp-mock-stat-l">Stock alerts</div>
            <div className="lp-mock-stat-v lp-mock-alert">3</div>
          </div>
        </div>

        {/* Animation stage — overlaps as cards animate in */}
        <div className="lp-mock-stage">

          {/* Card 1: New order ping */}
          <div className="lp-mock-card lp-mock-anim-1">
            <div className="lp-mock-ping" />
            <div className="lp-mock-card-body">
              <div className="lp-mock-card-top">
                <span className="lp-mock-card-tag lp-mock-tag-new">New order</span>
                <span className="lp-mock-card-time">just now</span>
              </div>
              <div className="lp-mock-card-title">Bridal makeup × 1</div>
              <div className="lp-mock-card-meta">Funke Adebayo · ₦80,000</div>
            </div>
          </div>

          {/* Card 2: Stock decrementing */}
          <div className="lp-mock-card lp-mock-anim-2">
            <div className="lp-mock-card-body">
              <div className="lp-mock-card-top">
                <span className="lp-mock-card-tag lp-mock-tag-stock">Stock updated</span>
              </div>
              <div className="lp-mock-card-title">Banana bread</div>
              <div className="lp-mock-stock-bar">
                <span className="lp-mock-stock-from">14</span>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5 L13 5 M9 1 L13 5 L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="lp-mock-stock-to">11</span>
                <span className="lp-mock-stock-label">in stock</span>
              </div>
            </div>
          </div>

          {/* Card 3: Invoice creating */}
          <div className="lp-mock-card lp-mock-anim-3">
            <div className="lp-mock-card-body">
              <div className="lp-mock-card-top">
                <span className="lp-mock-card-tag lp-mock-tag-inv">Invoice sent</span>
                <span className="lp-mock-card-time">INV-024</span>
              </div>
              <div className="lp-mock-inv-line lp-mock-inv-l1"><span>Bridal makeup × 1</span><span>₦80,000</span></div>
              <div className="lp-mock-inv-line lp-mock-inv-l2"><span>Travel fee</span><span>₦5,000</span></div>
              <div className="lp-mock-inv-line lp-mock-inv-l3 lp-mock-inv-total"><span>Total</span><span>₦85,000</span></div>
            </div>
          </div>

          {/* Card 4: Review */}
          <div className="lp-mock-card lp-mock-anim-4">
            <div className="lp-mock-card-body">
              <div className="lp-mock-card-top">
                <span className="lp-mock-card-tag lp-mock-tag-rev">New review</span>
                <span className="lp-mock-card-time">Funke A.</span>
              </div>
              <div className="lp-mock-stars">★★★★★</div>
              <div className="lp-mock-card-meta">Beautiful work, on time and very professional!</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>;
}

function DemoTabsPlaceholder() {
  const [tab, setTab] = useState("storefront");
  return <div className="lp-demo-tabs">
    <div className="lp-demo-tab-list">
      <button className={tab === "storefront" ? "active" : ""} onClick={() => setTab("storefront")}>Customer storefront</button>
      <button className={tab === "vendor" ? "active" : ""} onClick={() => setTab("vendor")}>Vendor dashboard</button>
      <button className={tab === "order" ? "active" : ""} onClick={() => setTab("order")}>Order tracking</button>
    </div>
    <div className="lp-demo-stage">
      {tab === "storefront" && <DemoStorefront />}
      {tab === "vendor" && <DemoVendor />}
      {tab === "order" && <DemoOrder />}
    </div>
  </div>;
}

function DemoStorefront() {
  const products = [
    { id: 1, name: "Banana bread", price: 4500, stock: 14, color: "#E8C794", icon: "bread" },
    { id: 2, name: "Coconut cookies", price: 2200, stock: 28, color: "#F2DCC4", icon: "cookie" },
    { id: 3, name: "Mixed pastry box", price: 8900, stock: 3, color: "#D9A881", icon: "box" },
    { id: 4, name: "Chocolate brownie", price: 1500, stock: 22, color: "#8C5A3F", icon: "brownie" },
  ];
  const [cart, setCart] = useState({});
  const total = Object.entries(cart).reduce((sum, [id, qty]) => sum + (products.find(p => p.id === +id).price * qty), 0);
  const itemCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const fmt = n => `₦${n.toLocaleString()}`;

  return <div className="lp-demo-store">
    <div className="lp-demo-store-head">
      <div>
        <div className="lp-demo-store-name">Bola's Bakery</div>
        <div className="lp-demo-store-meta">★ 4.9 · 47 reviews · Lagos</div>
      </div>
      <div className="lp-demo-store-cart">
        {itemCount > 0 && <span className="lp-demo-store-cart-count">{itemCount}</span>}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
      </div>
    </div>

    <div className="lp-demo-store-grid">
      {products.map(p => {
        const qty = cart[p.id] || 0;
        return <div key={p.id} className="lp-demo-prod">
          <div className="lp-demo-prod-img" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}aa)` }}>
            <ProductIcon kind={p.icon} />
            {p.stock <= 5 && <span className="lp-demo-prod-low">Only {p.stock} left</span>}
          </div>
          <div className="lp-demo-prod-name">{p.name}</div>
          <div className="lp-demo-prod-price">{fmt(p.price)}</div>
          {qty === 0 ? (
            <button className="lp-demo-prod-btn" onClick={() => setCart({ ...cart, [p.id]: 1 })}>Add to cart</button>
          ) : (
            <div className="lp-demo-prod-qty">
              <button onClick={() => { const n = qty - 1; if (n <= 0) { const c = { ...cart }; delete c[p.id]; setCart(c); } else setCart({ ...cart, [p.id]: n }); }}>−</button>
              <span>{qty}</span>
              <button disabled={qty >= p.stock} onClick={() => setCart({ ...cart, [p.id]: qty + 1 })}>+</button>
            </div>
          )}
        </div>;
      })}
    </div>

    {itemCount > 0 && <div className="lp-demo-store-bar">
      <div className="lp-demo-store-bar-l">
        <span className="lp-demo-store-bar-count">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
        <span className="lp-demo-store-bar-total">{fmt(total)}</span>
      </div>
      <button className="lp-demo-store-bar-btn">Checkout →</button>
    </div>}
  </div>;
}

function DemoVendor() {
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowNew(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // 7-day revenue (in thousands of ₦)
  const revenueData = [180, 220, 165, 290, 240, 195, showNew ? 325 : 240];
  const maxRev = Math.max(...revenueData);
  const days = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];

  return <div className="lp-demo-vendor">
    {/* Top metrics row */}
    <div className="lp-demo-metrics">
      <div className="lp-demo-metric">
        <div className="lp-demo-metric-l">Revenue this week</div>
        <div className="lp-demo-metric-v">₦{showNew ? "1.62M" : "1.53M"}</div>
        <div className="lp-demo-metric-trend lp-demo-trend-up">↑ {showNew ? "+12%" : "+8%"} vs last week</div>
      </div>
      <div className="lp-demo-metric">
        <div className="lp-demo-metric-l">Orders today</div>
        <div className="lp-demo-metric-v">{showNew ? 13 : 12}</div>
        <div className="lp-demo-metric-trend">3 awaiting your action</div>
      </div>
      <div className="lp-demo-metric">
        <div className="lp-demo-metric-l">Customers</div>
        <div className="lp-demo-metric-v">87</div>
        <div className="lp-demo-metric-trend lp-demo-trend-up">↑ 4 new this week</div>
      </div>
      <div className="lp-demo-metric">
        <div className="lp-demo-metric-l">Stock alerts</div>
        <div className="lp-demo-metric-v lp-demo-metric-warn">3</div>
        <div className="lp-demo-metric-trend">Items running low</div>
      </div>
    </div>

    {/* Bottom row: chart + orders */}
    <div className="lp-demo-vendor-grid">
      <div className="lp-demo-vendor-chart">
        <div className="lp-demo-chart-h">Revenue (last 7 days)</div>
        <div className="lp-demo-chart-bars">
          {revenueData.map((v, i) => (
            <div key={i} className="lp-demo-chart-col">
              <div className="lp-demo-chart-bar" style={{ height: `${(v / maxRev) * 100}%` }} />
              <div className="lp-demo-chart-day">{days[i]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-demo-vendor-main">
        <div className="lp-demo-vendor-head">
          <div className="lp-demo-vendor-title">Recent orders</div>
        </div>

        <div className="lp-demo-orders">
          {showNew && <div className="lp-demo-order lp-demo-order-new">
            <div className="lp-demo-order-l">
              <div className="lp-demo-order-id">#0024 <span className="lp-demo-pingdot" /></div>
              <div className="lp-demo-order-cust">Funke Adebayo · Bridal makeup × 1</div>
            </div>
            <div className="lp-demo-order-r">
              <span className="lp-demo-order-status lp-demo-status-new">New</span>
              <span className="lp-demo-order-amt">₦80,000</span>
            </div>
          </div>}
          <div className="lp-demo-order">
            <div className="lp-demo-order-l">
              <div className="lp-demo-order-id">#0023</div>
              <div className="lp-demo-order-cust">Tomi K. · Pastry box × 2</div>
            </div>
            <div className="lp-demo-order-r">
              <span className="lp-demo-order-status lp-demo-status-pay">Awaiting payment</span>
              <span className="lp-demo-order-amt">₦17,800</span>
            </div>
          </div>
          <div className="lp-demo-order">
            <div className="lp-demo-order-l">
              <div className="lp-demo-order-id">#0022</div>
              <div className="lp-demo-order-cust">Yetunde O. · Coconut cookies × 5</div>
            </div>
            <div className="lp-demo-order-r">
              <span className="lp-demo-order-status lp-demo-status-conf">Confirmed</span>
              <span className="lp-demo-order-amt">₦11,000</span>
            </div>
          </div>
          <div className="lp-demo-order">
            <div className="lp-demo-order-l">
              <div className="lp-demo-order-id">#0021</div>
              <div className="lp-demo-order-cust">Aisha B. · Banana bread × 3</div>
            </div>
            <div className="lp-demo-order-r">
              <span className="lp-demo-order-status lp-demo-status-ship">Shipped</span>
              <span className="lp-demo-order-amt">₦13,500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

function DemoOrder() {
  const [stage, setStage] = useState(0);
  const stages = [
    { id: 0, label: "Awaiting pricing", desc: "We received your order. We'll confirm pricing and stock shortly." },
    { id: 1, label: "Awaiting payment", desc: "Pay ₦17,800 to the account below. Click 'I've paid' when done." },
    { id: 2, label: "Payment confirmed", desc: "Thanks! Your order is confirmed and being prepared." },
    { id: 3, label: "Shipped", desc: "Your order is on the way. Expected delivery: today." },
  ];
  const cur = stages[stage];

  return <div className="lp-demo-order-page">
    <div className="lp-demo-orderp-head">
      <div className="lp-demo-orderp-vendor">Bola's Bakery</div>
      <div className="lp-demo-orderp-num">Order #0023</div>
    </div>

    <div className="lp-demo-orderp-status">
      <div className="lp-demo-orderp-status-label">Current status</div>
      <div className="lp-demo-orderp-status-name">{cur.label}</div>
      <div className="lp-demo-orderp-status-desc">{cur.desc}</div>
    </div>

    {/* Progress timeline */}
    <div className="lp-demo-orderp-timeline">
      {stages.map((s, i) => <div key={s.id} className={`lp-demo-orderp-step ${i <= stage ? "done" : ""} ${i === stage ? "current" : ""}`}>
        <div className="lp-demo-orderp-step-dot" />
        <div className="lp-demo-orderp-step-label">{s.label}</div>
      </div>)}
    </div>

    {/* Order summary */}
    <div className="lp-demo-orderp-summary">
      <div className="lp-demo-orderp-line"><span>Pastry box × 2</span><span>₦15,800</span></div>
      <div className="lp-demo-orderp-line"><span>Delivery (Lekki)</span><span>₦2,000</span></div>
      <div className="lp-demo-orderp-line lp-demo-orderp-total"><span>Total</span><span>₦17,800</span></div>
    </div>

    {/* Stage controls (lets users see the flow) */}
    <div className="lp-demo-orderp-controls">
      <span className="lp-demo-orderp-controls-l">Try the next stage:</span>
      <div className="lp-demo-orderp-controls-btns">
        <button disabled={stage === 0} onClick={() => setStage(Math.max(0, stage - 1))}>← Back</button>
        <button disabled={stage === stages.length - 1} onClick={() => setStage(Math.min(stages.length - 1, stage + 1))}>Next →</button>
      </div>
    </div>
  </div>;
}

// ─────────────── Tiny inline icon visuals for pillars + features ───────────────
function ProductIcon({ kind }) {
  // Stylized illustrations of bakery products. Brown stroke on the gradient background.
  const stroke = "#5C3A1F";
  const common = { width: 64, height: 64, viewBox: "0 0 64 64", fill: "none", stroke, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  const w = (
    kind === "bread" ? <svg {...common}><path d="M12 32c0-7 6-12 14-12h12c8 0 14 5 14 12v4c0 5-4 8-8 8H20c-4 0-8-3-8-8z"/><path d="M22 28c0 4 0 8 2 12M32 26c0 6 0 10 2 14M42 28c0 4 0 8 2 12" opacity=".5"/></svg> :
    kind === "cookie" ? <svg {...common}><circle cx="32" cy="32" r="16"/><circle cx="26" cy="28" r="1.5" fill={stroke}/><circle cx="36" cy="26" r="1.5" fill={stroke}/><circle cx="34" cy="36" r="1.5" fill={stroke}/><circle cx="24" cy="36" r="1.5" fill={stroke}/><circle cx="38" cy="34" r="1.5" fill={stroke}/></svg> :
    kind === "box" ? <svg {...common}><path d="M14 22h36v24H14z"/><path d="M14 22l4-6h28l4 6"/><path d="M32 22v24" opacity=".5"/><circle cx="32" cy="34" r="1.5" fill={stroke}/></svg> :
    kind === "brownie" ? <svg {...common}><rect x="14" y="20" width="36" height="24" rx="2"/><path d="M22 26l4 4M30 24l5 6M40 26l5 5M22 36l5 5M34 36l4 4" opacity=".5"/></svg> :
    null
  );
  return <div className="lp-demo-prod-icon">{w}</div>;
}

function PillarShop() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="28" height="28"><path d="M3 9l1-5h16l1 5"/><path d="M5 9v11a1 1 0 001 1h12a1 1 0 001-1V9"/><path d="M9 21V12h6v9"/></svg>; }
function PillarStock() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="28" height="28"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>; }
function PillarPaid() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="28" height="28"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>; }

// Compact illustrated mockups for each feature row
function FeatureStorefront() {
  return <div className="lp-feat-mock">
    <div className="lp-feat-mock-grid">
      <div className="lp-feat-card"><div className="lp-feat-card-img" /><div className="lp-feat-card-line" /><div className="lp-feat-card-price">₦4,500</div></div>
      <div className="lp-feat-card"><div className="lp-feat-card-img" /><div className="lp-feat-card-line" /><div className="lp-feat-card-price">₦2,200</div></div>
      <div className="lp-feat-card"><div className="lp-feat-card-img" /><div className="lp-feat-card-line" /><div className="lp-feat-card-price">₦8,900</div></div>
      <div className="lp-feat-card"><div className="lp-feat-card-img" /><div className="lp-feat-card-line" /><div className="lp-feat-card-price">₦1,500</div></div>
    </div>
  </div>;
}

function FeatureStock() {
  return <div className="lp-feat-mock">
    <div className="lp-stock-row"><span>Banana bread</span><span className="lp-stock-num">14</span></div>
    <div className="lp-stock-row"><span>Coconut cookies</span><span className="lp-stock-num">28</span></div>
    <div className="lp-stock-row lp-stock-low"><span>Mixed pastry box</span><span className="lp-stock-num">3</span></div>
    <div className="lp-stock-warning">Only 3 left — order soon</div>
  </div>;
}

function FeatureInvoice() {
  return <div className="lp-feat-mock lp-invoice-mock">
    <div className="lp-invoice-head">
      <span className="lp-invoice-num">INV-024</span>
      <span className="lp-invoice-status">Awaiting payment</span>
    </div>
    <div className="lp-invoice-line"><span>Bridal makeup × 1</span><span>₦80,000</span></div>
    <div className="lp-invoice-line"><span>Travel fee</span><span>₦5,000</span></div>
    <div className="lp-invoice-total"><span>Total</span><span>₦85,000</span></div>
  </div>;
}

function FeatureReviews() {
  return <div className="lp-feat-mock">
    <div className="lp-rev-summary">
      <span className="lp-rev-stars">★★★★★</span>
      <span className="lp-rev-num">4.9</span>
      <span className="lp-rev-count">· 47 reviews</span>
    </div>
    <div className="lp-rev-bar"><div className="lp-rev-bar-fill" style={{ width: "92%" }} /></div>
    <div className="lp-rev-bar"><div className="lp-rev-bar-fill" style={{ width: "78%" }} /></div>
    <div className="lp-rev-bar"><div className="lp-rev-bar-fill" style={{ width: "12%" }} /></div>
    <div className="lp-rev-bar"><div className="lp-rev-bar-fill" style={{ width: "4%" }} /></div>
    <div className="lp-rev-bar"><div className="lp-rev-bar-fill" style={{ width: "2%" }} /></div>
  </div>;
}

function FeatureMetrics() {
  // Tiny illustration of stat cards + a sparkline chart
  return <div className="lp-feat-mock">
    <div className="lp-feat-met-grid">
      <div className="lp-feat-met-card">
        <div className="lp-feat-met-l">Revenue this week</div>
        <div className="lp-feat-met-v">₦1.62M</div>
        <div className="lp-feat-met-trend">↑ 12% vs last week</div>
      </div>
      <div className="lp-feat-met-card">
        <div className="lp-feat-met-l">Orders today</div>
        <div className="lp-feat-met-v">13</div>
        <div className="lp-feat-met-trend lp-feat-met-trend-warn">3 awaiting action</div>
      </div>
    </div>
    <div className="lp-feat-met-chart">
      <div className="lp-feat-met-chart-h">Last 7 days</div>
      <div className="lp-feat-met-bars">
        <div style={{ height: "55%" }} /><div style={{ height: "68%" }} /><div style={{ height: "50%" }} /><div style={{ height: "89%" }} /><div style={{ height: "74%" }} /><div style={{ height: "60%" }} /><div style={{ height: "100%" }} />
      </div>
    </div>
  </div>;
}

function FeatureBulk() {
  return <div className="lp-feat-mock">
    <div className="lp-bulk-row lp-bulk-ok"><span>Banana bread</span><span>₦10,000</span><span className="lp-bulk-tag">✓</span></div>
    <div className="lp-bulk-row lp-bulk-ok"><span>Coconut cookies</span><span>₦5,000</span><span className="lp-bulk-tag">✓</span></div>
    <div className="lp-bulk-row lp-bulk-err"><span>Pastry box</span><span>(invalid)</span><span className="lp-bulk-tag lp-bulk-tag-err">!</span></div>
    <div className="lp-bulk-row lp-bulk-ok"><span>Croissants</span><span>₦3,500</span><span className="lp-bulk-tag">✓</span></div>
    <div className="lp-bulk-summary">3 valid · 1 error</div>
  </div>;
}
