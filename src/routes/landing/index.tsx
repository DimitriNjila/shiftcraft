import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./landing.css";

/*
 * Carbon copy of design/Landing.html. Class names, structure, copy, and
 * inline styles match the design source. All landing markup renders inside
 * <div className="lp"> so the scoped landing.css doesn't leak globally.
 */

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12l5 5L20 7" />
  </svg>
);

const ArrowRightIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function LandingPage() {
  // Body has overflow:hidden in the app shell; the landing page needs to scroll.
  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // IntersectionObserver-driven reveal-on-scroll (mirrors Landing.html script).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sel =
      ".section-head,.bento-card,.how-step,.metric,.t-card,.price-card,.faq-list details,.cta-band,.defn-inner,.logos-inner,.product-frame";
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    document.querySelectorAll(`.lp ${sel.split(",").join(", .lp ")}`).forEach((el) => {
      el.classList.add("rev");
      io.observe(el);
    });
    document
      .querySelectorAll(
        ".lp .bento,.lp .how-grid,.lp .metrics,.lp .t-grid,.lp .pricing-grid,.lp .faq-list",
      )
      .forEach((g) => {
        Array.prototype.forEach.call(g.children, (c, i) => {
          (c as HTMLElement).style.transitionDelay = `${i * 60}ms`;
        });
      });
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp">
      {/* ============ HERO ============ */}
      <div className="heroX-wrap" id="top">
        <section className="heroX">
          <div className="heroX-in">
            <nav className="navX">
              <div className="navX-links">
                <a href="#features">Product</a>
                <a href="#metrics">Customers</a>
                <a href="#pricing">Pricing</a>
              </div>
              <Link to="/" className="navX-brand">
                Mise en place
              </Link>
              <div className="navX-cta">
                <Link to="/login" className="navX-signin">
                  Sign in
                </Link>
                <Link to="/signup" className="btnX-ink">
                  Start free trial
                </Link>
              </div>
            </nav>

            <div className="heroX-main">
              <div>
                <span className="heroX-badge">
                  <span className="ast">✳</span> Restaurant scheduling, composed
                </span>
                <h1>
                  Full crews,
                  <br />
                  <span className="dim">calm shifts.</span>
                </h1>
                <p className="heroX-sub">
                  Photograph the whiteboard schedule you already keep and turn
                  it into a working roster your team opens on a link — no app to
                  install, nothing to learn.
                </p>
                <div className="heroX-ctas">
                  <Link to="/signup" className="btnX-cta">
                    Start free trial
                    <ArrowRightIcon />
                  </Link>
                  <a href="#features" className="btnX-ghostl">
                    How it works
                  </a>
                </div>
                <p className="heroX-fine">
                  14-day free trial. No card required. Most cafés are set up in an
                  afternoon.
                </p>
              </div>
              <HeroMock />
            </div>
          </div>
        </section>
      </div>

      {/* ============ LOGOS ============ */}
      <div className="container">
        <div className="logos">
          <div className="logos-inner">
            <div className="eyebrow">
              Trusted by 1,240+ cafés, restaurants, and food halls
            </div>
            <div className="logos-row">
              <div className="logo">◑ Meridian</div>
              <div className="logo">⏣ Lumen Roasters</div>
              <div className="logo">◐ Saint &amp; Sons</div>
              <div className="logo">▲ Toast House</div>
              <div className="logo">⬡ Halcyon Foods</div>
              <div className="logo">✦ Northbound</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ PRODUCT PEEK ============ */}
      <section style={{ padding: "72px 0 0" }}>
        <div className="container">
          <div className="section-head" style={{ marginBottom: 8 }}>
            <span className="eyebrow">A look at the pass</span>
            <h2 className="display-md">Your whole week, one calm surface.</h2>
            <p className="lead">
              The old way is a spreadsheet, three group chats, and a whiteboard
              that is out of date by Tuesday. This is the new way.
            </p>
          </div>
          <ProductMock />
        </div>
      </section>

      {/* ============ DEFINITION ============ */}
      <section className="defn">
        <div className="container">
          <div className="defn-inner">
            <div className="defn-term">
              mise en place{" "}
              <span className="defn-pos">/ miz ɑ̃ plas / French</span>
            </div>
            <p className="defn-body">
              “Everything in its place.” The kitchen discipline of preparing every
              station before service begins, so the rush never gets ahead of you.
            </p>
            <div className="defn-note">✳ That's what we do to your schedule</div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES BENTO ============ */}
      <section id="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What's inside</span>
            <h2 className="display-lg">
              Everything a manager needs.
              <br />
              <em className="italic-accent">Nothing they don't.</em>
            </h2>
            <p className="lead">
              From the Friday-night rush to Sunday close, Mise en place replaces
              the spreadsheet, the group chat, and the corkboard.
            </p>
          </div>
          <Bento />
          <FeatX />
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="how">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2 className="display-md">Three steps to a calm week.</h2>
          </div>
          <div className="how-grid">
            <div className="how-step">
              <div className="how-num">01</div>
              <h3>Bring your shifts</h3>
              <p>
                Import shift templates from a spreadsheet, or snap a photo of the
                whiteboard and watch them appear.
              </p>
            </div>
            <div className="how-step">
              <div className="how-num">02</div>
              <h3>Review the week</h3>
              <p>
                Mise en place drafts the schedule from your templates and explains
                it: thin coverage, hour caps, what changed. Accept the suggestions
                or tweak by hand.
              </p>
            </div>
            <div className="how-step">
              <div className="how-num">03</div>
              <h3>Hand it over</h3>
              <p>
                Publish once. Everyone gets a link with their week, nothing to
                install, and a PDF goes up in the break room.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ METRICS ============ */}
      <section id="metrics" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">By the numbers</span>
            <h2 className="display-md">Cafés that switched to Mise en place.</h2>
          </div>
          <div className="metrics">
            <MetricCell num="6.4" unit="h" desc="Hours saved per manager, per week" />
            <MetricCell num="92" unit="%" desc="Of weeks start from a saved template" />
            <MetricCell num="90" unit="s" desc="From finished schedule to a link in every pocket" />
            <MetricCell num="1,240" unit="+" desc="Cafés running their weeks on Mise en place" />
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="testimonials">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">From the floor</span>
            <h2 className="display-md">
              Loved by managers{" "}
              <em className="italic-accent">who hate spreadsheets.</em>
            </h2>
          </div>
          <div className="t-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.init} className="t-card">
                <p className="quote">{t.quote}</p>
                <div className="t-meta">
                  <div
                    className="mock-avatar"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: `oklch(0.82 0.06 ${t.hue})`,
                      color: `oklch(0.28 0.08 ${t.hue})`,
                      fontSize: 14,
                    }}
                  >
                    {t.init}
                  </div>
                  <div>
                    <div className="name">{t.name}</div>
                    <div className="role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Pricing</span>
            <h2 className="display-md">
              One flat price.
              <br />
              <em className="italic-accent">No per-seat surprises.</em>
            </h2>
            <p className="lead">
              Every plan includes the schedule builder, share links, and real
              human support.
            </p>
          </div>
          <div className="pricing-grid">
            <PriceCard
              name="Starter"
              price="$49"
              suffix="/ month"
              desc="For cafés finding their rhythm."
              features={[
                "Schedule builder & shift templates",
                "Excel & photo import",
                "Up to 25 staff",
                "Email support",
              ]}
              cta={
                <Link to="/signup" className="btn btn-secondary btn-lg">
                  Start free trial
                </Link>
              }
            />
            <PriceCard
              featured
              name="Professional"
              price="$89"
              suffix="/ month"
              desc="For busy floors that live by the schedule."
              features={[
                "Everything in Starter",
                "AI schedule review & suggestions",
                "Branded PDF export",
                "Unlimited staff",
                "Priority chat support",
              ]}
              cta={
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Start free trial
                </Link>
              }
            />
            <PriceCard
              name="Enterprise"
              price="Custom"
              desc="For groups with custom needs."
              features={[
                "Everything in Professional",
                "SSO & SCIM provisioning",
                "Custom integrations & API",
                "Dedicated success manager",
              ]}
              cta={
                <a
                  href="mailto:sales@miseenplace.app"
                  className="btn btn-secondary btn-lg"
                >
                  Contact sales
                </a>
              }
            />
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="faq">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2 className="display-md">Questions, answered.</h2>
          </div>
          <div className="faq-list">
            {FAQ.map((f, i) => (
              <details key={i}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <span
              className="eyebrow"
              style={{ display: "block", marginBottom: 12 }}
            >
              ✳ Ready when you are
            </span>
            <h2 className="display-lg">
              Run your next shift
              <br />
              <em className="italic-accent">with composure.</em>
            </h2>
            <p className="lead">
              Set up your café in ten minutes. First two weeks are on us.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start free trial
              </Link>
              <a href="#features" className="btn btn-secondary btn-lg">
                See how it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer>
        <div className="container">
          <div className="foot-grid">
            <div>
              <a
                href="#"
                className="navX-brand foot-brand"
                style={{ color: "#f2efe9" }}
              >
                Mise en place
              </a>
              <p
                style={{
                  color: "rgba(242,239,233,0.6)",
                  fontSize: 14,
                  maxWidth: "34ch",
                  marginTop: 14,
                }}
              >
                The all-in-one staff platform for restaurant managers, composed
                for the operational demands of a real kitchen.
              </p>
            </div>
            <FooterCol
              heading="Product"
              links={[
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "Changelog", href: "#" },
                { label: "Templates", href: "#" },
              ]}
            />
            <FooterCol
              heading="Company"
              links={[
                { label: "About", href: "#" },
                { label: "Customers", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Press", href: "#" },
              ]}
            />
            <FooterCol
              heading="Resources"
              links={[
                { label: "Docs", href: "#" },
                { label: "Help center", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Status", href: "#" },
              ]}
            />
            <FooterCol
              heading="Legal"
              links={[
                { label: "Terms", href: "#" },
                { label: "Privacy", href: "#" },
                { label: "Security", href: "#" },
                { label: "DPA", href: "#" },
              ]}
            />
          </div>
          <div className="foot-word" aria-hidden="true">
            Mise en place
          </div>
          <div className="foot-bot">
            <span>© 2026 Mise en Place, Inc. All rights reserved.</span>
            <span>Made for the floor.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Product mock ─── */

function ProductMock() {
  return (
    <div className="product-frame" style={{ marginTop: 36 }}>
      <div className="product-card">
        <div className="product-chrome">
          <span className="chrome-brand">✳ Mise en place</span>
          <div className="product-tabs">
            <span>Dashboard</span>
            <span className="active">Schedule · Apr 20–26</span>
            <span>Staff</span>
          </div>
          <span className="chrome-note">Demo · Meridian Coffee, Week 17</span>
        </div>
        <div className="product-body">
          <div className="mock-toolbar">
            <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>
              Apr 20 – 26, 2026
            </span>
            <span className="mock-pill">Week view</span>
            <span className="mock-pill">All roles</span>
            <div className="mock-stats">
              <div>
                <span className="label">Labor</span>
                <span>$12,847</span>
              </div>
              <div>
                <span className="label">Hours</span>
                <span>526</span>
              </div>
              <div>
                <span className="label">Open</span>
                <span style={{ color: "var(--warning)" }}>3</span>
              </div>
            </div>
            <span
              className="btn btn-primary"
              style={{ padding: "6px 12px", fontSize: 12 }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Generate schedule
            </span>
          </div>

          <div className="mock-grid">
            <div className="head" />
            <div className="head">Mon</div>
            <div className="head">Tue</div>
            <div className="head">Wed</div>
            <div className="head">Thu</div>
            <div className="head">Fri</div>
            <div className="head">Sat</div>
            <div className="head">Sun</div>

            <MockStaff init="AO" name="Amelia O." role="Lead" hue={155} />
            <MockShift hue={155} time="6a–2p" dur="8h" />
            <MockShift hue={155} time="6a–2p" dur="8h" />
            <MockShift hue={155} time="6a–2p" dur="8h" />
            <MockShift hue={155} time="6a–2p" dur="8h" />
            <MockShift hue={155} time="6a–2p" dur="8h" />
            <MockCell />
            <MockCell />

            <MockStaff init="JN" name="Jude N." role="Barista" hue={30} />
            <MockShift hue={30} time="7a–3p" dur="8h" />
            <MockShift hue={30} time="7a–3p" dur="8h" />
            <MockCell />
            <MockShift hue={30} time="11a–7p" dur="8h" />
            <MockShift hue={30} time="11a–7p" dur="8h" pending />
            <MockCell />
            <MockCell />

            <MockStaff init="HR" name="Helena R." role="Baker" hue={280} />
            <MockShift hue={280} time="4a–12p" dur="8h" />
            <MockShift hue={280} time="4a–12p" dur="8h" />
            <MockShift hue={280} time="4a–12p" dur="8h" />
            <MockShift hue={280} time="4a–12p" dur="8h" />
            <MockShift hue={280} time="4a–12p" dur="8h" />
            <MockShift hue={280} time="4a–12p" dur="8h" />
            <MockCell />

            <MockStaff init="ML" name="Marcus L." role="Cashier" hue={210} />
            <MockCell />
            <MockCell />
            <MockShift hue={210} time="12p–8p" dur="8h" />
            <MockCell />
            <MockShift hue={210} time="12p–8p" dur="8h" />
            <MockShift hue={210} time="12p–8p" dur="8h" />
            <MockShift hue={210} time="12p–8p" dur="8h" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MockCell() {
  return <div className="mock-cell" />;
}

function MockShift({
  hue,
  time,
  dur,
  pending,
}: {
  hue: number;
  time: string;
  dur: string;
  pending?: boolean;
}) {
  return (
    <div className="mock-cell">
      <div
        className="mock-shift"
        style={{
          background: pending
            ? `oklch(0.92 0.04 ${hue})`
            : `oklch(0.88 0.07 ${hue})`,
          color: `oklch(0.28 0.08 ${hue})`,
        }}
      >
        <div className="time">{time}</div>
        <div className="dur">{dur}</div>
      </div>
    </div>
  );
}

function MockStaff({
  init,
  name,
  role,
  hue,
}: {
  init: string;
  name: string;
  role: string;
  hue: number;
}) {
  return (
    <div className="mock-staff">
      <div
        className="mock-avatar"
        style={{
          background: `oklch(0.82 0.06 ${hue})`,
          color: `oklch(0.28 0.08 ${hue})`,
        }}
      >
        {init}
      </div>
      <div>
        <div className="mock-staff-name">{name}</div>
        <div className="mock-staff-role">{role}</div>
      </div>
    </div>
  );
}

/* ─── Bento ─── */

function Bento() {
  return (
    <div className="bento">
      {/* Big AI card — spans the full 6-column row */}
      <div className="bento-card col-6 dark" style={{ minHeight: 330 }}>
        <div className="ai-split">
          <div>
            <span className="eyebrow">Mise AI</span>
            <h3 style={{ fontSize: 32, maxWidth: "16ch", marginTop: 16 }}>
              Every generated schedule, explained.
            </h3>
            <p style={{ maxWidth: "42ch" }}>
              Mise en place drafts your week from your templates, then walks you
              through it: where coverage is thin, who is near their hour cap,
              what changed since last week. Every suggestion is yours to accept
              or ignore.
            </p>
          </div>
          <div
            className="bento-visual"
            style={{
              background: "#0d2018",
              padding: 18,
              borderRadius: 14,
              margin: 0,
              alignSelf: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  background:
                    "linear-gradient(145deg, var(--primary-2), var(--primary))",
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
                </svg>
              </div>
              <span
                className="label"
                style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}
              >
                Week 17 review · 2 suggestions
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <AiRow
                init="TV"
                hue={30}
                title="Sat 2p–8p is one barista short"
                sub="Suggest Theo Vance · available, under cap"
                score="96%"
              />
              <AiRow
                init="ML"
                hue={210}
                title="Helena is at 38 of 40 hours"
                sub="Suggest moving Thu bake to Marcus"
                score="91%"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Labor cost */}
      <div className="bento-card col-3">
        <span className="eyebrow">Built-in labor math</span>
        <h3 style={{ marginTop: 16 }}>Totals update as you place shifts.</h3>
        <p>
          Hours and cost per day, right in the builder. Catch a heavy Saturday
          before you publish, not after payroll.
        </p>
        <div className="bento-visual">
          <div className="mini-bars">
            {[
              { h1: 40, h2: 14 },
              { h1: 36, h2: 18 },
              { h1: 42, h2: 12 },
              { h1: 44, h2: 24 },
              { h1: 60, h2: 16 },
              { h1: 74, h2: 8 },
              { h1: 50, h2: 10 },
            ].map((b, i) => (
              <div key={i} className="col">
                <div className="bar-wrap">
                  <div className="b2" style={{ height: `${b.h2}%` }} />
                  <div className="b1" style={{ height: `${b.h1}%` }} />
                </div>
                <div className="lbl">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Templates & import */}
      <div className="bento-card col-3">
        <span className="eyebrow">Shift templates</span>
        <h3 style={{ marginTop: 16 }}>Bring your old schedule with you.</h3>
        <p>
          Build your week from reusable templates, or import them straight from a
          spreadsheet or a photo of the whiteboard.
        </p>
        <div
          className="bento-visual"
          style={{ background: "var(--surface-low)", padding: 14 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <TemplatePreviewRow
              name="Opening bar"
              time="6a–2p"
              badge="Lead"
              hue={155}
            />
            <TemplatePreviewRow
              name="Weekend brunch bar"
              time="7a–3p"
              badge="Barista ×3"
              hue={30}
            />
            <div
              style={{
                background: "white",
                borderRadius: 8,
                padding: "9px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "inset 0 0 0 1.5px oklch(0.75 0.1 155)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="9" cy="9" r="2" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>
                whiteboard_apr.jpg
              </span>
              <span
                style={{
                  fontFamily: "var(--label)",
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--primary)",
                }}
              >
                9 templates found
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ─── FeatX — illustrated feature grid (4 cards below the bento) ─── */

function FeatX() {
  return (
    <div className="featX">
      <FeatXCard
        title="Drag & drop scheduling"
        body="Move shifts like physical objects on a marble countertop. Changes sync instantly to staff phones."
        illo={
          <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M30 22v80M64 22v80M98 22v80M132 22v80M166 22v80" stroke="rgba(20,26,22,0.14)" strokeWidth="1" />
            <rect x="34" y="30" width="26" height="22" rx="6" fill="oklch(0.9 0.05 155)" stroke="none" />
            <rect x="34" y="58" width="26" height="30" rx="6" fill="oklch(0.9 0.05 155)" stroke="none" />
            <rect x="102" y="40" width="26" height="26" rx="6" strokeDasharray="4 4" stroke="rgba(20,26,22,0.35)" />
            <g transform="rotate(-4 128 46)">
              <rect x="112" y="32" width="30" height="28" rx="7" fill="#fff" />
              <path d="M118 41h18M118 47h12" strokeWidth="2" />
            </g>
            <path d="M144 66l4 12 3.5-4.5 5.5 2z" fill="currentColor" stroke="none" />
          </svg>
        }
      />
      <FeatXCard
        title="Share as a link"
        body="Your team opens the week in the browser, the full schedule or just their shifts. Nothing to install, no login."
        illo={
          <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="58" y="18" width="52" height="86" rx="10" fill="#fff" />
            <path d="M76 26h16" strokeWidth="2" />
            <rect x="66" y="38" width="36" height="12" rx="4" fill="oklch(0.9 0.05 155)" stroke="none" />
            <rect x="66" y="54" width="36" height="12" rx="4" fill="oklch(0.92 0.03 100)" stroke="none" />
            <rect x="66" y="70" width="36" height="12" rx="4" fill="oklch(0.92 0.03 100)" stroke="none" />
            <rect x="96" y="44" width="66" height="20" rx="10" fill="#0d2018" stroke="none" />
            <path d="M106 54h4a4 4 0 004-4M118 54h-4a4 4 0 01-4 4" stroke="#fff" strokeWidth="1.6" />
            <path d="M128 54h26" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
            <path d="M168 40c6 4 6 24 0 28M176 34c10 7 10 33 0 40" stroke="rgba(20,26,22,0.3)" />
          </svg>
        }
      />
      <FeatXCard
        title="Break-room-ready PDF"
        body="One click prints a clean, branded weekly grid for the corkboard. Old school, on purpose."
        illo={
          <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="48" y="36" width="104" height="30" rx="8" fill="oklch(0.9 0.05 155)" stroke="none" />
            <rect x="48" y="36" width="104" height="30" rx="8" />
            <circle cx="140" cy="51" r="3" fill="currentColor" stroke="none" />
            <path d="M66 36v-8h68v8" />
            <rect x="70" y="56" width="60" height="46" rx="4" fill="#fff" />
            <path d="M78 68h44M78 76h44M78 84h30" stroke="rgba(20,26,22,0.35)" strokeWidth="1.5" />
            <path d="M78 92h20" strokeWidth="2" />
          </svg>
        }
      />
      <FeatXCard
        title="Your whole crew, one roster"
        body="Roles, wages, and availability in one place. The source every schedule pulls from."
        illo={
          <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="52" y="24" width="96" height="72" rx="10" fill="#fff" />
            <circle cx="72" cy="44" r="8" fill="oklch(0.9 0.05 155)" stroke="none" />
            <circle cx="72" cy="44" r="8" />
            <path d="M88 40h34M88 48h22" stroke="rgba(20,26,22,0.35)" strokeWidth="1.5" />
            <circle cx="72" cy="72" r="8" fill="oklch(0.92 0.06 30)" stroke="none" />
            <circle cx="72" cy="72" r="8" />
            <path d="M88 68h34M88 76h22" stroke="rgba(20,26,22,0.35)" strokeWidth="1.5" />
            <rect x="122" y="64" width="36" height="16" rx="8" fill="#0d2018" stroke="none" />
            <path d="M130 72h20" stroke="#fff" strokeWidth="1.6" />
          </svg>
        }
      />
    </div>
  );
}

function FeatXCard({
  title,
  body,
  illo,
}: {
  title: string;
  body: string;
  illo: React.ReactNode;
}) {
  return (
    <div className="featX-card">
      <div className="featX-illo">{illo}</div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

/* ─── HeroMock — editorial "day card" that replaces the pixel image ─── */

function HeroMock() {
  return (
    <div className="hero-mock" aria-hidden="true">
      <div className="hero-card">
        <div className="card-head">
          <span className="card-brand">
            <span className="ast">✳</span> Mise en place
          </span>
          <span className="card-day">Wed · Apr 22</span>
        </div>
        <h3>Today's pass</h3>
        <div className="card-shifts">
          <HeroShift
            time="06:00"
            name="Amelia O."
            role="Opening bar"
            tag="Lead"
            hue={155}
          />
          <HeroShift
            time="07:00"
            name="Jude N."
            role="Weekend bar"
            tag="Barista"
            hue={30}
          />
          <HeroShift
            time="04:00"
            name="Helena R."
            role="Morning bake"
            tag="Baker"
            hue={280}
          />
          <HeroShift
            time="12:00"
            name="Marcus L."
            role="Register"
            tag="Cashier"
            hue={210}
          />
        </div>
        <div className="card-foot">
          <span className="foot-covered">Fully covered · 24h</span>
          <span className="foot-shared">shared 12m ago</span>
        </div>
      </div>
      <div className="hero-note">
        <div className="note-dot">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
          </svg>
        </div>
        <div className="note-body">
          <div className="note-title">Sat 2p–8p is one barista short</div>
          <div className="note-sub">Mise AI · 96% confidence</div>
        </div>
      </div>
    </div>
  );
}

function HeroShift({
  time,
  name,
  role,
  tag,
  hue,
}: {
  time: string;
  name: string;
  role: string;
  tag: string;
  hue: number;
}) {
  return (
    <div className="hero-shift">
      <span className="time">{time}</span>
      <div className="who">
        <span className="name">{name}</span>
        <span className="role">{role}</span>
      </div>
      <span
        className="role-tag"
        style={{
          background: `oklch(0.9 0.05 ${hue})`,
          color: `oklch(0.3 0.08 ${hue})`,
        }}
      >
        {tag}
      </span>
    </div>
  );
}

function AiRow({
  init,
  hue,
  title,
  sub,
  score,
}: {
  init: string;
  hue: number;
  title: string;
  sub: string;
  score: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: `oklch(0.78 0.08 ${hue})`,
          color: `oklch(0.28 0.08 ${hue})`,
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--display)",
          fontWeight: 600,
          fontSize: 10,
        }}
      >
        {init}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div>
        <div
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "var(--label)",
          }}
        >
          {sub}
        </div>
      </div>
      <div
        className="mono"
        style={{ fontSize: 11, color: "var(--fixed-dim)", fontWeight: 600 }}
      >
        {score}
      </div>
    </div>
  );
}

function TemplatePreviewRow({
  name,
  time,
  badge,
  hue,
}: {
  name: string;
  time: string;
  badge: string;
  hue: number;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 8,
        padding: "9px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{name}</span>
      <span
        className="mono"
        style={{ fontSize: 11, color: "var(--on-muted)" }}
      >
        {time}
      </span>
      <span
        style={{
          fontFamily: "var(--label)",
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          background: `oklch(0.9 0.05 ${hue})`,
          color: `oklch(0.3 0.08 ${hue})`,
          borderRadius: 999,
          padding: "2px 8px",
        }}
      >
        {badge}
      </span>
    </div>
  );
}

/* ─── Metric ─── */

function MetricCell({
  num,
  unit,
  desc,
}: {
  num: string;
  unit: string;
  desc: string;
}) {
  return (
    <div className="metric">
      <div className="num">
        {num}
        <span className="unit">{unit}</span>
      </div>
      <div className="desc">{desc}</div>
    </div>
  );
}

/* ─── Testimonials data ─── */

const TESTIMONIALS = [
  {
    init: "EK",
    hue: 30,
    quote:
      "\"Our Friday-night schedule used to be a four-hour spreadsheet ritual. With Mise en place, it's fifteen minutes, and the review tells me exactly where I'm short before I publish.\"",
    name: "Elena Kovač",
    role: "GM, Meridian Coffee",
  },
  {
    init: "DA",
    hue: 280,
    quote:
      '"We photographed the old whiteboard and Mise en place turned it into shift templates in about a minute. Setup took an afternoon, not a month."',
    name: "Daniel Aoki",
    role: "Owner, Lumen Roasters",
  },
  {
    init: "MR",
    hue: 210,
    quote:
      '"My baristas actually check the schedule, because their week is just a link on their phone. Nobody texts me at 11 PM anymore. Game changer for my sanity."',
    name: "Maria Reyes",
    role: "Manager, Saint & Sons",
  },
];

/* ─── Pricing card ─── */

function PriceCard({
  featured,
  name,
  price,
  suffix,
  desc,
  features,
  cta,
}: {
  featured?: boolean;
  name: string;
  price: string;
  suffix?: string;
  desc: string;
  features: string[];
  cta: React.ReactNode;
}) {
  return (
    <div className={`price-card${featured ? " featured" : ""}`}>
      {featured && <div className="price-tag">Most popular</div>}
      <div className="name">{name}</div>
      <div className="price-row">
        <span className="price-num">{price}</span>
        {suffix && <span className="price-suffix">{suffix}</span>}
      </div>
      <div className="price-desc">{desc}</div>
      <ul className="price-feat">
        {features.map((f) => (
          <li key={f}>
            <CheckIcon />
            {f}
          </li>
        ))}
      </ul>
      {cta}
    </div>
  );
}

/* ─── FAQ data ─── */

const FAQ = [
  {
    q: "Do my employees need to install anything?",
    a: "No. Schedules are shared as a link that opens in any browser, showing the full week or just their shifts. No app, no account, no login.",
  },
  {
    q: "How does the photo import actually work?",
    a: "Take a photo of your current schedule: whiteboard, printout, even handwriting. We read the grid, recognize times and roles, and turn it into reusable shift templates you can review before saving.",
  },
  {
    q: "What does the AI review do?",
    a: "After drafting a week from your templates, it walks you through the result: where coverage runs thin, who is close to their hour cap, and what changed since last week. Each comes with a concrete suggestion you can accept or ignore. It never publishes anything on its own.",
  },
  {
    q: "Can I still print the schedule?",
    a: "Yes. One click produces a clean, branded weekly grid made for the break-room corkboard.",
  },
  {
    q: "How long does setup take?",
    a: "Most cafés are running their first generated week within an afternoon: import your templates, check the review, publish. The free trial covers your first two weeks.",
  },
];

/* ─── Footer column ─── */

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h4>{heading}</h4>
      <ul>
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
