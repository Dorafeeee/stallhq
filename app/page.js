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
            <p className="lp-sub">StallHQ is the simplest way to sell, track profit, and grow your business — all in one place. Already on a spreadsheet? Import it in two clicks. Free while we grow.</p>
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
            <h3>Know your profit</h3>
            <p>Add cost prices and we'll show you what you actually make — not just what comes in. Top profitable products, real margins, no math required.</p>
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
            tag="Profit tracking"
            title="See what you actually make"
            body="Add cost prices to your products and StallHQ shows your real profit on every sale — not just revenue. Top profitable products, live margins, supplier tracking. The numbers your accountant will actually thank you for."
            visual={<FeatureProfit />}
            reverse={false}
          />

          <FeatureRow
            tag="Invoices"
            title="Send invoices that get paid"
            body="Create invoices for offline sales. Customer gets a payment link with your bank details. Stock auto-deducts when paid. The whole offline-to-online loop in one click."
            visual={<FeatureInvoice />}
            reverse={true}
          />

          <FeatureRow
            tag="Reviews"
            title="Build trust with every order"
            body="Customers rate your business after each completed order. Aggregate stars show on your storefront — social proof that converts new visitors into buyers."
            visual={<FeatureReviews />}
            reverse={false}
          />

          <FeatureRow
            tag="Insights"
            title="Know your numbers"
            body="Revenue, profit, margin %, top products, outstanding payments — all in one dashboard. Action-needed counts for orders waiting on you. Stock alerts when items run low. So you always know exactly how your business is doing."
            visual={<FeatureMetrics />}
            reverse={true}
          />

          <FeatureRow
            tag="Spreadsheet import"
            title="Already on Excel? Bring it over."
            body="Upload your existing CSV from Excel or Google Sheets. We auto-match your columns to the right fields — even if they're named oddly. Preview before importing. Works for products, customers, and past sales."
            visual={<FeatureImport />}
            reverse={false}
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
          <span>© 2026 StallHQ</span>
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
  { q: "I already use Excel or Google Sheets. Can I bring my data over?", a: "Yes. Upload your CSV during signup or anytime from Settings. StallHQ auto-matches your columns to the right fields — even if they're named oddly. Works for products, customers, and past sales. Preview everything before it's saved." },
  { q: "How does profit tracking work?", a: "Add a cost price (what you paid) to your products and StallHQ shows your real profit on every sale. Your dashboard shows total profit, margin %, and your top profitable products. The cost is locked in when an order is made — so updating prices later doesn't change your historical numbers." },
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
  return <div className="lp-demo-store" style={{padding:0,background:'transparent',border:'none',boxShadow:'none'}}>
    <img src="/storefront-demo.png" alt="StallHQ customer storefront preview" style={{width:'100%',height:'auto',borderRadius:'12px',display:'block'}} />
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
  // Bold, friendly illustrations of bakery products
  const stroke = "#5C3A1F";
  const fill = "#B14B2C";
  const common = { width: 96, height: 96, viewBox: "0 0 96 96", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  
  const icons = {
    bread: <svg {...common}>
      <ellipse cx="48" cy="54" rx="34" ry="24" fill="#E8C794"/>
      <path d="M18 48c0-10 10-18 24-18h12c14 0 24 8 24 18" stroke={stroke} strokeWidth="3.5" fill="none"/>
      <line x1="30" y1="42" x2="30" y2="54" stroke={stroke} strokeWidth="3" opacity="0.35"/>
      <line x1="42" y1="40" x2="42" y2="54" stroke={stroke} strokeWidth="3" opacity="0.35"/>
      <line x1="54" y1="40" x2="54" y2="54" stroke={stroke} strokeWidth="3" opacity="0.35"/>
      <line x1="66" y1="42" x2="66" y2="54" stroke={stroke} strokeWidth="3" opacity="0.35"/>
    </svg>,
    
    cookie: <svg {...common}>
      <circle cx="48" cy="48" r="28" fill="#F2DCC4"/>
      <circle cx="48" cy="48" r="28" stroke="#D9A881" strokeWidth="3"/>
      <circle cx="38" cy="42" r="3.5" fill={fill}/>
      <circle cx="54" cy="43" r="3.5" fill={fill}/>
      <circle cx="44" cy="54" r="3.5" fill={fill}/>
      <circle cx="56" cy="55" r="3.5" fill={fill}/>
      <circle cx="38" cy="56" r="3" fill="#8C3920"/>
      <circle cx="60" cy="46" r="2.5" fill="#8C3920"/>
    </svg>,
    
    box: <svg {...common}>
      <rect x="24" y="33" width="48" height="34" rx="2.5" fill="#E8C794" stroke={stroke} strokeWidth="3"/>
      <path d="M24 33l6-10h36l6 10" fill="#D9A881" stroke={stroke} strokeWidth="3" strokeLinejoin="round"/>
      <line x1="48" y1="33" x2="48" y2="67" stroke={stroke} strokeWidth="2.5" opacity="0.3"/>
      <circle cx="48" cy="50" r="3" fill={fill}/>
    </svg>,
    
    brownie: <svg {...common}>
      <rect x="24" y="36" width="48" height="28" rx="3.5" fill="#8C5A3F"/>
      <rect x="24" y="36" width="48" height="28" rx="3.5" stroke={stroke} strokeWidth="3"/>
      <path d="M34 46l6 6M45 43l7 9M60 46l6 6" stroke="#FAEAE2" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      <circle cx="40" cy="56" r="2" fill="#FAEAE2" opacity="0.5"/>
      <circle cx="56" cy="57" r="2" fill="#FAEAE2" opacity="0.5"/>
    </svg>
  };
  
  return <div className="lp-demo-prod-icon">{icons[kind]}</div>;
}

function PillarShop() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="28" height="28"><path d="M3 9l1-5h16l1 5"/><path d="M5 9v11a1 1 0 001 1h12a1 1 0 001-1V9"/><path d="M9 21V12h6v9"/></svg>; }
function PillarStock() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="28" height="28"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>; }
function PillarPaid() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="28" height="28"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>; }

// Compact illustrated mockups for each feature row
function FeatureStorefront() {
  // Bold illustrated storefront - large friendly visuals
  return <div className="lp-feat-mock" style={{background:'linear-gradient(135deg, #FAEAE2 0%, #F9E5D9 100%)',padding:'40px 32px',borderRadius:'16px'}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'20px'}}>
      {/* Product 1 - Bread */}
      <div style={{background:'#fff',borderRadius:'12px',padding:'20px',boxShadow:'0 4px 16px rgba(177,75,44,.12)',textAlign:'center'}}>
        <div style={{width:'100%',height:'120px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'16px'}}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <ellipse cx="40" cy="45" rx="28" ry="20" fill="#E8C794"/>
            <path d="M15 40c0-8 8-15 20-15h10c12 0 20 7 20 15" stroke="#B14B2C" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <line x1="25" y1="35" x2="25" y2="45" stroke="#B14B2C" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
            <line x1="35" y1="33" x2="35" y2="45" stroke="#B14B2C" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
            <line x1="45" y1="33" x2="45" y2="45" stroke="#B14B2C" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
            <line x1="55" y1="35" x2="55" y2="45" stroke="#B14B2C" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
          </svg>
        </div>
        <div style={{height:'8px',background:'#F2EFE8',borderRadius:'4px',width:'75%',margin:'0 auto 8px'}}/>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'16px',fontWeight:'700',color:'#B14B2C'}}>₦4,500</div>
      </div>
      
      {/* Product 2 - Cookie */}
      <div style={{background:'#fff',borderRadius:'12px',padding:'20px',boxShadow:'0 4px 16px rgba(177,75,44,.12)',textAlign:'center'}}>
        <div style={{width:'100%',height:'120px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'16px'}}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="24" fill="#F2DCC4"/>
            <circle cx="40" cy="40" r="24" stroke="#D9A881" strokeWidth="2.5"/>
            <circle cx="32" cy="35" r="3" fill="#B14B2C"/>
            <circle cx="46" cy="36" r="3" fill="#B14B2C"/>
            <circle cx="38" cy="45" r="3" fill="#B14B2C"/>
            <circle cx="48" cy="46" r="3" fill="#B14B2C"/>
            <circle cx="33" cy="48" r="2.5" fill="#8C3920"/>
          </svg>
        </div>
        <div style={{height:'8px',background:'#F2EFE8',borderRadius:'4px',width:'70%',margin:'0 auto 8px'}}/>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'16px',fontWeight:'700',color:'#B14B2C'}}>₦2,200</div>
      </div>
      
      {/* Product 3 - Box with stock warning */}
      <div style={{background:'#fff',borderRadius:'12px',padding:'20px',boxShadow:'0 4px 16px rgba(177,75,44,.12)',textAlign:'center',position:'relative'}}>
        <div style={{position:'absolute',top:'12px',left:'12px',background:'#B14B2C',color:'#fff',fontSize:'11px',fontWeight:'700',padding:'5px 10px',borderRadius:'12px',fontFamily:'IBM Plex Mono,monospace',letterSpacing:'.3px'}}>3 left</div>
        <div style={{width:'100%',height:'120px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'16px'}}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="20" y="28" width="40" height="28" rx="2" fill="#E8C794" stroke="#B14B2C" strokeWidth="2.5"/>
            <path d="M20 28l5-8h30l5 8" fill="#D9A881" stroke="#B14B2C" strokeWidth="2.5" strokeLinejoin="round"/>
            <line x1="40" y1="28" x2="40" y2="56" stroke="#B14B2C" strokeWidth="2" opacity="0.3"/>
            <circle cx="40" cy="42" r="2.5" fill="#B14B2C"/>
          </svg>
        </div>
        <div style={{height:'8px',background:'#F2EFE8',borderRadius:'4px',width:'80%',margin:'0 auto 8px'}}/>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'16px',fontWeight:'700',color:'#B14B2C'}}>₦8,900</div>
      </div>
      
      {/* Product 4 - Brownie */}
      <div style={{background:'#fff',borderRadius:'12px',padding:'20px',boxShadow:'0 4px 16px rgba(177,75,44,.12)',textAlign:'center'}}>
        <div style={{width:'100%',height:'120px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'16px'}}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="20" y="30" width="40" height="24" rx="3" fill="#8C5A3F"/>
            <rect x="20" y="30" width="40" height="24" rx="3" stroke="#5C3A1F" strokeWidth="2.5"/>
            <path d="M28 38l5 5M38 36l6 7M50 38l5 5" stroke="#FAEAE2" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
            <circle cx="33" cy="47" r="1.5" fill="#FAEAE2" opacity="0.5"/>
            <circle cx="47" cy="48" r="1.5" fill="#FAEAE2" opacity="0.5"/>
          </svg>
        </div>
        <div style={{height:'8px',background:'#F2EFE8',borderRadius:'4px',width:'65%',margin:'0 auto 8px'}}/>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'16px',fontWeight:'700',color:'#B14B2C'}}>₦1,500</div>
      </div>
    </div>
  </div>;
}

function FeatureStock() {
  // Illustrated stock levels with visual progress
  return <div className="lp-feat-mock" style={{background:'linear-gradient(135deg, #ECF2FE 0%, #F1ECFE 100%)',padding:'28px'}}>
    <div style={{display:'flex',flexDirection:'column',gap:'18px'}}>
      {/* High stock item */}
      <div style={{background:'#fff',borderRadius:'10px',padding:'14px',boxShadow:'0 2px 8px rgba(29,91,214,.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
          <span style={{fontSize:'13px',fontWeight:'600',color:'#141413'}}>Banana bread</span>
          <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'14px',fontWeight:'700',color:'#0F6E56'}}>28</span>
        </div>
        <div style={{height:'8px',background:'#EFEBE0',borderRadius:'4px',overflow:'hidden'}}>
          <div style={{height:'100%',width:'85%',background:'linear-gradient(90deg, #0F6E56, #4CAF93)',borderRadius:'4px'}}/>
        </div>
      </div>
      
      {/* Medium stock item */}
      <div style={{background:'#fff',borderRadius:'10px',padding:'14px',boxShadow:'0 2px 8px rgba(29,91,214,.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
          <span style={{fontSize:'13px',fontWeight:'600',color:'#141413'}}>Coconut cookies</span>
          <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'14px',fontWeight:'700',color:'#1D5BD6'}}>12</span>
        </div>
        <div style={{height:'8px',background:'#EFEBE0',borderRadius:'4px',overflow:'hidden'}}>
          <div style={{height:'100%',width:'45%',background:'linear-gradient(90deg, #1D5BD6, #5B8EF5)',borderRadius:'4px'}}/>
        </div>
      </div>
      
      {/* Low stock item with warning */}
      <div style={{background:'#FAEAE2',borderRadius:'10px',padding:'14px',border:'1.5px solid #B14B2C'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
          <span style={{fontSize:'13px',fontWeight:'600',color:'#141413'}}>Mixed pastry box</span>
          <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'14px',fontWeight:'700',color:'#B14B2C'}}>3</span>
        </div>
        <div style={{height:'8px',background:'#fff',borderRadius:'4px',overflow:'hidden'}}>
          <div style={{height:'100%',width:'12%',background:'linear-gradient(90deg, #B14B2C, #E27A52)',borderRadius:'4px'}}/>
        </div>
        <div style={{marginTop:'10px',fontSize:'11px',fontWeight:'600',color:'#B14B2C',fontFamily:'IBM Plex Mono,monospace'}}>⚠ Only 3 left</div>
      </div>
    </div>
  </div>;
}

function FeatureInvoice() {
  // Illustrated invoice document
  return <div className="lp-feat-mock" style={{background:'linear-gradient(135deg, #FEF7E6 0%, #FCF3D9 100%)',padding:'28px',position:'relative'}}>
    {/* Paper illustration */}
    <div style={{background:'#fff',borderRadius:'10px',padding:'18px',boxShadow:'0 4px 16px rgba(169,112,8,.12)',position:'relative'}}>
      {/* Header with logo placeholder and invoice number */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',paddingBottom:'12px',borderBottom:'1.5px dashed #EFEBE0'}}>
        <div style={{width:'32px',height:'32px',borderRadius:'6px',background:'linear-gradient(135deg, #B14B2C, #E27A52)'}}/>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'11px',fontWeight:'700',color:'#9A968B'}}>INV-024</div>
      </div>
      
      {/* Line items */}
      <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'12px'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'#5F5C53'}}>
          <span>Bridal makeup × 1</span>
          <span style={{fontFamily:'IBM Plex Mono,monospace',fontWeight:'600'}}>₦80,000</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'#5F5C53'}}>
          <span>Travel fee</span>
          <span style={{fontFamily:'IBM Plex Mono,monospace',fontWeight:'600'}}>₦5,000</span>
        </div>
      </div>
      
      {/* Total */}
      <div style={{paddingTop:'12px',borderTop:'2px solid #141413',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:'14px',fontWeight:'700',color:'#141413'}}>Total</span>
        <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'16px',fontWeight:'700',color:'#B14B2C'}}>₦85,000</span>
      </div>
      
      {/* Status badge */}
      <div style={{position:'absolute',top:'-8px',right:'18px',background:'#FEF7E6',border:'1.5px solid #A97008',borderRadius:'16px',padding:'4px 12px',fontSize:'10px',fontWeight:'700',color:'#A97008',textTransform:'uppercase',letterSpacing:'.5px'}}>
        Awaiting payment
      </div>
    </div>
  </div>;
}

function FeatureReviews() {
  // Illustrated star rating visualization
  return <div className="lp-feat-mock" style={{background:'linear-gradient(135deg, #F1ECFE 0%, #E8DDF9 100%)',padding:'28px'}}>
    {/* Big star display */}
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'20px'}}>
      <div style={{fontSize:'48px',lineHeight:'1',color:'#B14B2C',letterSpacing:'2px'}}>★★★★★</div>
    </div>
    
    {/* Rating number */}
    <div style={{textAlign:'center',marginBottom:'20px'}}>
      <div style={{fontSize:'32px',fontWeight:'700',fontFamily:'IBM Plex Mono,monospace',color:'#141413',lineHeight:'1'}}>4.9</div>
      <div style={{fontSize:'12px',color:'#9A968B',marginTop:'4px'}}>from 47 reviews</div>
    </div>
    
    {/* Distribution bars */}
    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
      {[
        {stars:5,width:92,count:43},
        {stars:4,width:6,count:3},
        {stars:3,width:2,count:1},
        {stars:2,width:0,count:0},
        {stars:1,width:0,count:0}
      ].map(({stars,width,count})=>(
        <div key={stars} style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'11px',fontFamily:'IBM Plex Mono,monospace',color:'#9A968B',width:'12px'}}>{stars}</span>
          <div style={{flex:'1',height:'6px',background:'#fff',borderRadius:'3px',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${width}%`,background:'linear-gradient(90deg, #B14B2C, #E27A52)',borderRadius:'3px',transition:'width .4s'}}/>
          </div>
          <span style={{fontSize:'10px',fontFamily:'IBM Plex Mono,monospace',color:'#9A968B',width:'20px',textAlign:'right'}}>{count}</span>
        </div>
      ))}
    </div>
  </div>;
}

function FeatureMetrics() {
  // Illustrated metrics dashboard with profit
  return <div className="lp-feat-mock" style={{background:'linear-gradient(135deg, #ECF2FE 0%, #E8F4F8 100%)',padding:'28px'}}>
    {/* Stat cards */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'12px'}}>
      <div style={{background:'#fff',borderRadius:'10px',padding:'14px',boxShadow:'0 2px 8px rgba(29,91,214,.08)'}}>
        <div style={{fontSize:'9px',color:'#9A968B',textTransform:'uppercase',letterSpacing:'.8px',fontWeight:'600',fontFamily:'IBM Plex Mono,monospace',marginBottom:'6px'}}>Revenue</div>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'20px',fontWeight:'700',color:'#141413',lineHeight:'1',marginBottom:'4px'}}>₦1.62M</div>
        <div style={{fontSize:'10px',color:'#0F6E56',fontFamily:'IBM Plex Mono,monospace',fontWeight:'500'}}>↑ 12% vs last week</div>
      </div>
      <div style={{background:'#fff',borderRadius:'10px',padding:'14px',boxShadow:'0 2px 8px rgba(29,91,214,.08)'}}>
        <div style={{fontSize:'9px',color:'#9A968B',textTransform:'uppercase',letterSpacing:'.8px',fontWeight:'600',fontFamily:'IBM Plex Mono,monospace',marginBottom:'6px'}}>Profit</div>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'20px',fontWeight:'700',color:'#0F6E56',lineHeight:'1',marginBottom:'4px'}}>₦487K</div>
        <div style={{fontSize:'10px',color:'#0F6E56',fontFamily:'IBM Plex Mono,monospace',fontWeight:'500'}}>34% margin</div>
      </div>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'16px'}}>
      <div style={{background:'#fff',borderRadius:'10px',padding:'14px',boxShadow:'0 2px 8px rgba(29,91,214,.08)'}}>
        <div style={{fontSize:'9px',color:'#9A968B',textTransform:'uppercase',letterSpacing:'.8px',fontWeight:'600',fontFamily:'IBM Plex Mono,monospace',marginBottom:'6px'}}>Outstanding</div>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'20px',fontWeight:'700',color:'#A97008',lineHeight:'1',marginBottom:'4px'}}>₦115K</div>
        <div style={{fontSize:'10px',color:'#A97008',fontFamily:'IBM Plex Mono,monospace',fontWeight:'500'}}>3 unpaid orders</div>
      </div>
      <div style={{background:'#fff',borderRadius:'10px',padding:'14px',boxShadow:'0 2px 8px rgba(29,91,214,.08)'}}>
        <div style={{fontSize:'9px',color:'#9A968B',textTransform:'uppercase',letterSpacing:'.8px',fontWeight:'600',fontFamily:'IBM Plex Mono,monospace',marginBottom:'6px'}}>Customers</div>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'20px',fontWeight:'700',color:'#141413',lineHeight:'1',marginBottom:'4px'}}>47</div>
        <div style={{fontSize:'10px',color:'#6D30D9',fontFamily:'IBM Plex Mono,monospace',fontWeight:'500'}}>5 new this week</div>
      </div>
    </div>
    
    {/* Chart illustration */}
    <div style={{background:'#fff',borderRadius:'10px',padding:'14px',boxShadow:'0 2px 8px rgba(29,91,214,.08)'}}>
      <div style={{fontSize:'9px',color:'#9A968B',textTransform:'uppercase',letterSpacing:'.8px',fontWeight:'600',fontFamily:'IBM Plex Mono,monospace',marginBottom:'12px'}}>Last 7 days</div>
      <div style={{display:'flex',alignItems:'flex-end',gap:'6px',height:'60px'}}>
        {[55,68,50,89,74,60,100].map((h,i)=>(
          <div key={i} style={{flex:'1',background:i===6?'linear-gradient(180deg, #B14B2C, #E27A52)':'linear-gradient(180deg, #1D5BD6, #5B8EF5)',height:`${h}%`,borderRadius:'4px 4px 0 0',transition:'height .4s'}}/>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:'8px',fontSize:'9px',color:'#9A968B',fontFamily:'IBM Plex Mono,monospace'}}>
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=><span key={i}>{d}</span>)}
      </div>
    </div>
  </div>;
}

function FeatureProfit() {
  // Profit dashboard with cost vs revenue breakdown
  return <div className="lp-feat-mock" style={{background:'linear-gradient(135deg, #FAEAE2 0%, #ECF2FE 100%)',padding:'28px'}}>
    {/* Top stat: Profit */}
    <div style={{background:'#fff',borderRadius:'12px',padding:'18px',boxShadow:'0 2px 12px rgba(177,75,44,.1)',marginBottom:'12px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
        <div>
          <div style={{fontSize:'9px',color:'#9A968B',textTransform:'uppercase',letterSpacing:'.8px',fontWeight:'700',fontFamily:'IBM Plex Mono,monospace',marginBottom:'4px'}}>Profit this month</div>
          <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'26px',fontWeight:'700',color:'#0F6E56',lineHeight:'1'}}>₦487,500</div>
        </div>
        <div style={{background:'#E6F4EE',color:'#0F6E56',padding:'5px 10px',borderRadius:'12px',fontSize:'11px',fontWeight:'700',fontFamily:'IBM Plex Mono,monospace'}}>34% margin</div>
      </div>
      {/* Stacked bar showing cost vs profit */}
      <div style={{display:'flex',height:'10px',borderRadius:'5px',overflow:'hidden',marginBottom:'8px'}}>
        <div style={{flex:'66',background:'#E5DFD2'}}/>
        <div style={{flex:'34',background:'linear-gradient(90deg, #0F6E56, #4CAF93)'}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#65635B',fontFamily:'IBM Plex Mono,monospace'}}>
        <span>Costs ₦955k</span>
        <span style={{color:'#0F6E56',fontWeight:'600'}}>Profit ₦487k</span>
      </div>
    </div>

    {/* Top profitable products */}
    <div style={{background:'#fff',borderRadius:'12px',padding:'14px',boxShadow:'0 2px 12px rgba(177,75,44,.1)'}}>
      <div style={{fontSize:'9px',color:'#9A968B',textTransform:'uppercase',letterSpacing:'.8px',fontWeight:'700',fontFamily:'IBM Plex Mono,monospace',marginBottom:'10px'}}>Top profitable products</div>
      {[
        {rank:1, name:'Bridal Makeup', profit:'₦180,000'},
        {rank:2, name:'Chocolate Cake', profit:'₦92,500'},
        {rank:3, name:'Ankara Bundle', profit:'₦64,000'},
      ].map((p)=>(
        <div key={p.rank} style={{display:'flex',alignItems:'center',gap:'10px',padding:'7px 0',borderBottom:p.rank<3?'1px solid #F2EFE8':'none'}}>
          <div style={{width:'22px',height:'22px',borderRadius:'11px',background:p.rank===1?'#FAEAE2':'#F2EFE8',color:p.rank===1?'#B14B2C':'#65635B',fontSize:'11px',fontWeight:'700',fontFamily:'IBM Plex Mono,monospace',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{p.rank}</div>
          <div style={{flex:'1',fontSize:'12px',color:'#141413',fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
          <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'12px',fontWeight:'700',color:'#0F6E56'}}>{p.profit}</div>
        </div>
      ))}
    </div>
  </div>;
}

function FeatureImport() {
  // Spreadsheet column mapping illustration
  return <div className="lp-feat-mock" style={{background:'linear-gradient(135deg, #F1ECFE 0%, #ECF2FE 100%)',padding:'28px'}}>
    {/* Mapping flow: source columns → target fields */}
    <div style={{background:'#fff',borderRadius:'12px',padding:'16px',boxShadow:'0 2px 12px rgba(109,48,217,.08)',marginBottom:'12px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
        <div style={{width:'24px',height:'24px',background:'#1D7340',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'11px',fontWeight:'700',fontFamily:'IBM Plex Mono,monospace'}}>X</div>
        <div style={{flex:'1',fontSize:'12px',fontWeight:'600',color:'#141413',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>my-products.xlsx</div>
        <div style={{fontSize:'10px',color:'#0F6E56',fontWeight:'600',fontFamily:'IBM Plex Mono,monospace'}}>247 rows</div>
      </div>
      {[
        {source:'Item Name', target:'Product name'},
        {source:'Selling Price (₦)', target:'Price'},
        {source:'Cost', target:'Cost price'},
        {source:'Available Qty', target:'Stock'},
      ].map((m,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 0',borderBottom:i<3?'1px solid #F2EFE8':'none'}}>
          <div style={{flex:'1',fontSize:'11.5px',color:'#65635B',fontFamily:'IBM Plex Mono,monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.source}</div>
          <span style={{color:'#9A968B',fontSize:'12px'}}>→</span>
          <div style={{flex:'1',fontSize:'11.5px',color:'#141413',fontWeight:'600',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.target}</div>
          <span style={{background:'#E6F4EE',color:'#0F6E56',padding:'2px 6px',borderRadius:'8px',fontSize:'9px',fontWeight:'700',fontFamily:'IBM Plex Mono,monospace',flexShrink:0}}>✓</span>
        </div>
      ))}
    </div>

    {/* Result summary */}
    <div style={{background:'#E6F4EE',borderRadius:'10px',padding:'12px',display:'flex',alignItems:'center',gap:'10px'}}>
      <div style={{width:'28px',height:'28px',background:'#0F6E56',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'14px',fontWeight:'700',flexShrink:0}}>✓</div>
      <div>
        <div style={{fontSize:'12px',fontWeight:'700',color:'#141413'}}>Auto-matched 4 columns</div>
        <div style={{fontSize:'10.5px',color:'#65635B',fontFamily:'IBM Plex Mono,monospace'}}>Review and confirm</div>
      </div>
    </div>
  </div>;
}

function FeatureBulk() {
  // Illustrated CSV upload with validation
  return <div className="lp-feat-mock" style={{background:'linear-gradient(135deg, #F1ECFE 0%, #FCF3F9 100%)',padding:'28px'}}>
    {/* CSV rows with validation states */}
    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
      {[
        {name:'Banana bread',price:'₦10,000',valid:true},
        {name:'Coconut cookies',price:'₦5,000',valid:true},
        {name:'Pastry box',price:'(invalid)',valid:false},
        {name:'Croissants',price:'₦3,500',valid:true}
      ].map((row,i)=>(
        <div key={i} style={{background:row.valid?'#fff':'#FEF0EC',borderRadius:'8px',padding:'12px',display:'flex',alignItems:'center',gap:'10px',border:row.valid?'1px solid #EFEBE0':'1.5px solid #B5301A',boxShadow:row.valid?'0 1px 4px rgba(0,0,0,.04)':'none'}}>
          <div style={{width:'24px',height:'24px',borderRadius:'50%',background:row.valid?'linear-gradient(135deg, #0F6E56, #4CAF93)':'linear-gradient(135deg, #B5301A, #D9534F)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',fontWeight:'700',flexShrink:0}}>
            {row.valid?'✓':'!'}
          </div>
          <div style={{flex:'1',fontSize:'13px',color:'#141413',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.name}</div>
          <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:'12px',fontWeight:'600',color:row.valid?'#B14B2C':'#B5301A'}}>{row.price}</div>
        </div>
      ))}
    </div>
    
    {/* Summary footer */}
    <div style={{marginTop:'14px',textAlign:'center',fontSize:'11px',fontFamily:'IBM Plex Mono,monospace',color:'#9A968B',fontWeight:'500'}}>
      <span style={{color:'#0F6E56'}}>3 valid</span> · <span style={{color:'#B5301A'}}>1 error</span>
    </div>
  </div>;
}
