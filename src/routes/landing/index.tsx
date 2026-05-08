import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./landing.css";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7"/>
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.3l-6.2 3.7 1.6-7L2 9.2l7.2-.6L12 2l2.8 6.6 7.2.6-5.4 4.8 1.6 7z"/>
  </svg>
);

export default function LandingPage() {
  // Let the landing page scroll; the app shell sets overflow:hidden on body
  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="lp">
      {/* ── NAV ── */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <a href="/" className="lp-brand">
            <div className="lp-brand-mark">S</div>
            <span>Shiftcraft</span>
          </a>
          <nav className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#metrics">Customers</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="lp-nav-cta">
            <Link to="/login" className="lp-btn lp-btn-ghost">Sign in</Link>
            <Link to="/signup" className="lp-btn lp-btn-primary">Start free trial</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-container lp-hero-inner">
          <div className="lp-pill">
            <span className="lp-pill-tag">New</span>
            <span>AI Autofill — schedule a 50-person café in 90 seconds</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </div>

          <h1 className="lp-display-xl">
            The calm behind <em className="lp-italic">every shift.</em>
          </h1>
          <p className="lp-lead">
            Shiftcraft is the all-in-one staff platform for restaurant managers — schedule with intent,
            track hours, approve time off, and run payroll. Built for the operational demands of a real kitchen.
          </p>

          <div className="lp-hero-cta">
            <Link to="/signup" className="lp-btn lp-btn-primary lp-btn-lg">
              Start 14-day trial
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>
            <a href="#features" className="lp-btn lp-btn-secondary lp-btn-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              See how it works
            </a>
          </div>

          <div className="lp-hero-trust">
            <span><CheckIcon/>No credit card required</span>
            <span><CheckIcon/>Set up in 10 minutes</span>
            <span><CheckIcon/>SOC 2 · GDPR</span>
          </div>

          {/* Product mock */}
          <div className="lp-product-frame">
            <div className="lp-product-card">
              <div className="lp-product-chrome">
                <div className="lp-dot" style={{background:"#ff5f56"}}/>
                <div className="lp-dot" style={{background:"#ffbd2e"}}/>
                <div className="lp-dot" style={{background:"#27c93f"}}/>
                <div className="lp-product-tabs">
                  <span>Dashboard</span>
                  <span className="active">Schedule · Apr 20–26</span>
                  <span>Staff</span>
                </div>
              </div>
              <div className="lp-product-body">
                <div className="lp-mock-toolbar">
                  <span className="lp-mono" style={{fontSize:13,fontWeight:600}}>Apr 20 – 26, 2026</span>
                  <span className="lp-mock-pill">Week view</span>
                  <span className="lp-mock-pill">All roles</span>
                  <div className="lp-mock-stats">
                    <div><span className="lp-label">Labor</span><span>$12,847</span></div>
                    <div><span className="lp-label">Hours</span><span>526</span></div>
                    <div><span className="lp-label">Open</span><span style={{color:"var(--lp-warning)"}}>3</span></div>
                  </div>
                  <span className="lp-btn lp-btn-primary" style={{padding:"6px 12px",fontSize:12}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/></svg>
                    AI Autofill
                  </span>
                </div>
                <div className="lp-mock-grid">
                  <div className="lp-head"/>
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><div key={d} className="lp-head">{d}</div>)}
                  {/* Row 1 */}
                  <div className="lp-mock-staff">
                    <div className="lp-mock-avatar" style={{background:"oklch(0.82 0.06 155)",color:"oklch(0.28 0.08 155)"}}>AO</div>
                    <div><div className="lp-mock-staff-name">Amelia O.</div><div className="lp-mock-staff-role">Lead</div></div>
                  </div>
                  {[0,1,2,3,4].map(i=><div key={i} className="lp-mock-cell"><div className="lp-mock-shift" style={{background:"oklch(0.88 0.07 155)",color:"oklch(0.28 0.08 155)"}}><div className="lp-time">6a–2p</div><div className="lp-dur">8h</div></div></div>)}
                  <div className="lp-mock-cell"/><div className="lp-mock-cell"/>
                  {/* Row 2 */}
                  <div className="lp-mock-staff">
                    <div className="lp-mock-avatar" style={{background:"oklch(0.82 0.06 30)",color:"oklch(0.28 0.08 30)"}}>JN</div>
                    <div><div className="lp-mock-staff-name">Jude N.</div><div className="lp-mock-staff-role">Barista</div></div>
                  </div>
                  <div className="lp-mock-cell"><div className="lp-mock-shift" style={{background:"oklch(0.88 0.07 30)",color:"oklch(0.28 0.08 30)"}}><div className="lp-time">7a–3p</div><div className="lp-dur">8h</div></div></div>
                  <div className="lp-mock-cell"><div className="lp-mock-shift" style={{background:"oklch(0.88 0.07 30)",color:"oklch(0.28 0.08 30)"}}><div className="lp-time">7a–3p</div><div className="lp-dur">8h</div></div></div>
                  <div className="lp-mock-cell"/>
                  <div className="lp-mock-cell"><div className="lp-mock-shift" style={{background:"oklch(0.88 0.07 30)",color:"oklch(0.28 0.08 30)"}}><div className="lp-time">11a–7p</div><div className="lp-dur">8h</div></div></div>
                  <div className="lp-mock-cell"><div className="lp-mock-shift" style={{background:"oklch(0.92 0.04 30)",color:"oklch(0.28 0.08 30)"}}><div className="lp-time">11a–7p</div><div className="lp-dur">8h</div></div></div>
                  <div className="lp-mock-cell"/><div className="lp-mock-cell"/>
                  {/* Row 3 */}
                  <div className="lp-mock-staff">
                    <div className="lp-mock-avatar" style={{background:"oklch(0.82 0.06 280)",color:"oklch(0.28 0.08 280)"}}>HR</div>
                    <div><div className="lp-mock-staff-name">Helena R.</div><div className="lp-mock-staff-role">Baker</div></div>
                  </div>
                  {[0,1,2,3,4,5].map(i=><div key={i} className="lp-mock-cell"><div className="lp-mock-shift" style={{background:"oklch(0.88 0.07 280)",color:"oklch(0.28 0.08 280)"}}><div className="lp-time">4a–12p</div><div className="lp-dur">8h</div></div></div>)}
                  <div className="lp-mock-cell"/>
                  {/* Row 4 */}
                  <div className="lp-mock-staff">
                    <div className="lp-mock-avatar" style={{background:"oklch(0.82 0.06 210)",color:"oklch(0.28 0.08 210)"}}>ML</div>
                    <div><div className="lp-mock-staff-name">Marcus L.</div><div className="lp-mock-staff-role">Cashier</div></div>
                  </div>
                  <div className="lp-mock-cell"/><div className="lp-mock-cell"/>
                  <div className="lp-mock-cell"><div className="lp-mock-shift" style={{background:"oklch(0.88 0.07 210)",color:"oklch(0.28 0.08 210)"}}><div className="lp-time">12p–8p</div><div className="lp-dur">8h</div></div></div>
                  <div className="lp-mock-cell"/>
                  {[0,1,2].map(i=><div key={i} className="lp-mock-cell"><div className="lp-mock-shift" style={{background:"oklch(0.88 0.07 210)",color:"oklch(0.28 0.08 210)"}}><div className="lp-time">12p–8p</div><div className="lp-dur">8h</div></div></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <div className="lp-container">
        <div className="lp-logos">
          <div className="lp-logos-inner">
            <div className="lp-eyebrow">Trusted by 1,240+ cafés, restaurants, and food halls</div>
            <div className="lp-logos-row">
              <div className="lp-logo">◑ Meridian</div>
              <div className="lp-logo">⏣ Lumen Roasters</div>
              <div className="lp-logo">◐ Saint &amp; Sons</div>
              <div className="lp-logo">▲ Toast House</div>
              <div className="lp-logo">⬡ Halcyon Foods</div>
              <div className="lp-logo">✦ Northbound</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">What's inside</span>
            <h2 className="lp-display-lg" style={{marginTop:14}}>
              Everything a manager needs.<br/><em className="lp-italic">Nothing they don't.</em>
            </h2>
            <p className="lp-lead">From the Friday-night rush to next month's payroll — Shiftcraft replaces five tools with one calm interface.</p>
          </div>

          <div className="lp-bento">
            {/* AI card */}
            <div className="lp-bento-card lp-col-4 lp-dark">
              <span className="lp-eyebrow">Shiftcraft AI</span>
              <h3 style={{fontSize:30,maxWidth:"14ch",marginTop:16}}>Autofill open shifts in seconds, not hours.</h3>
              <p style={{maxWidth:"46ch"}}>Our scheduler learns staff availability, role coverage, hour caps, and historical preference — then suggests the best person for every open slot, with a confidence score you can trust.</p>
              <div className="lp-bento-visual" style={{background:"#0d2018",padding:18}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:24,height:24,borderRadius:7,background:"linear-gradient(145deg,#00875a,#006b47)",display:"grid",placeItems:"center",color:"white"}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/></svg>
                  </div>
                  <span className="lp-label" style={{color:"rgba(255,255,255,0.7)",fontSize:10}}>3 suggestions ready</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {[
                    {init:"TV",hue:30,name:"Theo Vance → Sat 2p–8p",sub:"Available · Role match · Under cap",score:"96%"},
                    {init:"ML",hue:210,name:"Marcus Lin → Mon 2p–8p",sub:"Requested more hours",score:"91%"},
                  ].map(s=>(
                    <div key={s.init} style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:26,height:26,borderRadius:8,background:`oklch(0.78 0.08 ${s.hue})`,color:`oklch(0.28 0.08 ${s.hue})`,display:"grid",placeItems:"center",fontFamily:"var(--lp-display)",fontWeight:600,fontSize:10}}>{s.init}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:600}}>{s.name}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.55)",fontFamily:"var(--lp-label)"}}>{s.sub}</div>
                      </div>
                      <div className="lp-mono" style={{fontSize:11,color:"var(--lp-fixed-dim)",fontWeight:600}}>{s.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drag & drop */}
            <div className="lp-bento-card lp-col-2">
              <div className="lp-icon-tag">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
              </div>
              <h3>Drag &amp; drop scheduling</h3>
              <p>Move shifts like physical objects on a marble countertop. Changes sync instantly to staff phones.</p>
            </div>

            {/* Labor cost */}
            <div className="lp-bento-card lp-col-3">
              <span className="lp-eyebrow">Live labor cost</span>
              <h3 style={{marginTop:16}}>Watch your weekly spend update in real time.</h3>
              <p>Forecast vs. actual side by side. Catch overtime before it happens — not at the end of the pay period.</p>
              <div className="lp-bento-visual">
                <div className="lp-mini-bars">
                  {[{h:40},{h:36},{h:42},{h:44},{h:60},{h:74},{h:50}].map((b,i)=>(
                    <div key={i} className="lp-col">
                      <div className="lp-bar-wrap"><div className="lp-b1" style={{height:`${b.h}%`}}/></div>
                      <div className="lp-lbl">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Time off */}
            <div className="lp-bento-card lp-col-3">
              <div className="lp-icon-tag">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13l2.5-7A2 2 0 017.4 4.5h9.2a2 2 0 011.9 1.5L21 13v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z"/><path d="M3 13h5l1 2h6l1-2h5"/></svg>
              </div>
              <h3>Time off &amp; availability</h3>
              <p>Staff request time off in the app. Conflicts surface inline. Approve or deny without leaving your schedule.</p>
              <div className="lp-bento-visual" style={{background:"var(--lp-surface-low)",padding:14}}>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <div style={{background:"white",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",gap:10}}>
                    <div className="lp-mock-avatar" style={{background:"oklch(0.82 0.06 30)",color:"oklch(0.28 0.08 30)",width:24,height:24,fontSize:10}}>JN</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600}}>Jude N. · Sick day</div>
                      <div style={{fontSize:10,color:"var(--lp-on-muted)"}}>Apr 22 · 1 day</div>
                    </div>
                    <div style={{display:"flex",gap:4}}>
                      <span className="lp-btn lp-btn-secondary" style={{padding:"4px 10px",fontSize:11}}>Deny</span>
                      <span className="lp-btn lp-btn-primary" style={{padding:"4px 10px",fontSize:11}}>Approve</span>
                    </div>
                  </div>
                  <div style={{background:"white",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,opacity:0.8}}>
                    <div className="lp-mock-avatar" style={{background:"oklch(0.82 0.06 280)",color:"oklch(0.28 0.08 280)",width:24,height:24,fontSize:10}}>PR</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600}}>Priya R. · Vacation</div>
                      <div style={{fontSize:10,color:"var(--lp-on-muted)"}}>May 5 – 9</div>
                    </div>
                    <span style={{fontFamily:"var(--lp-label)",fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em",color:"var(--lp-on-faint)"}}>Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-location */}
            <div className="lp-bento-card lp-col-2">
              <div className="lp-icon-tag">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-7 8-13a8 8 0 10-16 0c0 6 8 13 8 13z"/><circle cx="12" cy="9" r="3"/></svg>
              </div>
              <h3>Multi-location ready</h3>
              <p>One workspace for every café. Switch between locations or roll up reporting across your whole brand.</p>
            </div>

            {/* Integrations */}
            <div className="lp-bento-card lp-col-2">
              <div className="lp-icon-tag">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
              </div>
              <h3>POS &amp; payroll synced</h3>
              <p>Square, Toast, Gusto, ADP. Hours flow to payroll. Sales flow to forecasting. No spreadsheets in the middle.</p>
            </div>

            {/* Compliance */}
            <div className="lp-bento-card lp-col-2">
              <div className="lp-icon-tag">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
              </div>
              <h3>Compliance, baked in</h3>
              <p>California meal breaks. NY Fair Workweek. Minor work limits. Clopen prevention. Guardrails so you never have to remember.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section id="metrics" className="lp-section" style={{paddingTop:0}}>
        <div className="lp-container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">By the numbers</span>
            <h2 className="lp-display-md" style={{marginTop:14}}>Cafés that switched to Shiftcraft.</h2>
          </div>
          <div className="lp-metrics">
            {[
              {num:"6.4",unit:"h",desc:"Hours saved per manager, per week"},
              {num:"11",unit:"%",desc:"Average reduction in labor spend"},
              {num:"94",unit:"%",desc:"Forecast accuracy on weekend rushes"},
              {num:"1,240",unit:"+",desc:"Cafés running schedules on Shiftcraft"},
            ].map(m=>(
              <div key={m.num} className="lp-metric">
                <div className="lp-num">{m.num}<span className="lp-unit">{m.unit}</span></div>
                <div className="lp-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-testimonials">
        <div className="lp-container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">From the floor</span>
            <h2 className="lp-display-md" style={{marginTop:14}}>
              Loved by managers <em className="lp-italic">who hate spreadsheets.</em>
            </h2>
          </div>
          <div className="lp-t-grid">
            {[
              {init:"EK",hue:30,quote:'"Our Friday-night schedule used to be a four-hour spreadsheet ritual. With Shiftcraft, it\'s fifteen minutes. The AI gets the right people on the right days the first try."',name:"Elena Kovač",role:"GM, Meridian Coffee · 3 locations"},
              {init:"DA",hue:280,quote:'"The labor cost dashboard caught $1,800 of overtime in our first month. It paid for itself by week two and replaced three other tools we were juggling."',name:"Daniel Aoki",role:"Owner, Lumen Roasters"},
              {init:"MR",hue:210,quote:'"My baristas actually use the app — they swap shifts themselves and submit time off without texting me at 11 PM. Game changer for my sanity."',name:"Maria Reyes",role:"Manager, Saint & Sons"},
            ].map(t=>(
              <div key={t.init} className="lp-t-card">
                <div className="lp-t-stars">{[1,2,3,4,5].map(i=><StarIcon key={i}/>)}</div>
                <p className="lp-quote">{t.quote}</p>
                <div className="lp-t-meta">
                  <div className="lp-mock-avatar" style={{width:42,height:42,borderRadius:"50%",background:`oklch(0.82 0.06 ${t.hue})`,color:`oklch(0.28 0.08 ${t.hue})`,fontSize:14}}>{t.init}</div>
                  <div>
                    <div className="lp-name">{t.name}</div>
                    <div className="lp-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">Pricing</span>
            <h2 className="lp-display-md" style={{marginTop:14}}>
              One price per location.<br/><em className="lp-italic">No per-seat surprises.</em>
            </h2>
            <p className="lp-lead">Every plan includes unlimited staff, mobile apps, and 24/7 support.</p>
          </div>
          <div className="lp-pricing-grid">
            <div className="lp-price-card">
              <div className="lp-plan-name">Starter</div>
              <div className="lp-price-row"><span className="lp-price-num">$49</span><span className="lp-price-suffix">/ location / month</span></div>
              <div className="lp-price-desc">For single-location cafés finding their rhythm.</div>
              <ul className="lp-price-feat">
                {["Schedule builder & mobile app","Time off & shift swaps","Up to 25 staff","Email support"].map(f=>(
                  <li key={f}><CheckIcon/>{f}</li>
                ))}
              </ul>
              <Link to="/signup" className="lp-btn lp-btn-secondary lp-btn-lg" style={{justifyContent:"center"}}>Start free trial</Link>
            </div>
            <div className="lp-price-card lp-featured">
              <div className="lp-price-tag">Most popular</div>
              <div className="lp-plan-name">Professional</div>
              <div className="lp-price-row"><span className="lp-price-num">$89</span><span className="lp-price-suffix">/ location / month</span></div>
              <div className="lp-price-desc">For growing brands with 2–10 locations.</div>
              <ul className="lp-price-feat">
                {["Everything in Starter","AI Autofill & forecasting","POS & payroll integrations","Multi-location reporting","Priority chat support"].map(f=>(
                  <li key={f}><CheckIcon/>{f}</li>
                ))}
              </ul>
              <Link to="/signup" className="lp-btn lp-btn-primary lp-btn-lg" style={{justifyContent:"center"}}>Start free trial</Link>
            </div>
            <div className="lp-price-card">
              <div className="lp-plan-name">Enterprise</div>
              <div className="lp-price-row"><span className="lp-price-num">Custom</span></div>
              <div className="lp-price-desc">For brands at 10+ locations or franchise systems.</div>
              <ul className="lp-price-feat">
                {["Everything in Professional","SSO & SCIM provisioning","Custom integrations & API","Dedicated success manager"].map(f=>(
                  <li key={f}><CheckIcon/>{f}</li>
                ))}
              </ul>
              <a href="mailto:sales@shiftcraft.io" className="lp-btn lp-btn-secondary lp-btn-lg" style={{justifyContent:"center"}}>Contact sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="lp-section" style={{paddingTop:0}}>
        <div className="lp-container">
          <div className="lp-cta-band">
            <span className="lp-eyebrow" style={{color:"rgba(255,255,255,0.55)",display:"block",marginBottom:12}}>Ready when you are</span>
            <h2 className="lp-display-lg">
              Run your next shift<br/><em style={{fontStyle:"italic",fontWeight:500,color:"var(--lp-fixed-dim)"}}>with composure.</em>
            </h2>
            <p className="lp-lead">Set up your café in ten minutes. First two weeks are on us.</p>
            <div className="lp-cta-flex">
              <Link to="/signup" className="lp-btn lp-btn-primary lp-btn-lg">Start free trial</Link>
              <a href="#features" className="lp-btn lp-btn-lg" style={{background:"rgba(255,255,255,0.1)",color:"white"}}>See how it works</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-foot-grid">
            <div>
              <a href="/" className="lp-brand" style={{marginBottom:16}}>
                <div className="lp-brand-mark">S</div>
                <span>Shiftcraft</span>
              </a>
              <p style={{color:"var(--lp-on-muted)",fontSize:14,maxWidth:"36ch",marginTop:16}}>The all-in-one staff platform for restaurant managers — composed for the operational demands of a real kitchen.</p>
            </div>
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#">Changelog</a></li>
                <li><a href="#">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Customers</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div>
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Docs</a></li>
                <li><a href="#">Help center</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Status</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">DPA</a></li>
              </ul>
            </div>
          </div>
          <div className="lp-foot-bot">
            <span>© 2026 Shiftcraft, Inc. — All rights reserved.</span>
            <span>Made for the floor.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
