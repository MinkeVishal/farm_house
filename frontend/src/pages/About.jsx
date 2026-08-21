import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./About.css";

/* ── TEAM DATA ──────────────────────────────── */
const TEAM = [
  { name: "Rahul Sharma", role: "Founder & CEO", emoji: "👨‍💼", quote: "Every farmhouse tells a story. We help you live it.", hobby: "Mountain hiking 🏔️", experience: "12 years in hospitality" },
  { name: "Priya Patel",  role: "Operations Head", emoji: "👩‍💻", quote: "Seamless stays start with seamless operations.", hobby: "Yoga & cooking 🧘", experience: "8 years in travel tech" },
  { name: "Amit Verma",   role: "Guest Relations", emoji: "🤝", quote: "Every guest deserves to feel like royalty.", hobby: "Travelling India 🇮🇳", experience: "6 years in customer care" },
  { name: "Sneha Nair",   role: "Design Lead", emoji: "🎨", quote: "Beautiful spaces deserve beautiful experiences.", hobby: "Photography 📷", experience: "7 years in UX/UI" },
];

/* ── TIMELINE / JOURNEY ─────────────────────── */
const JOURNEY = [
  { year: "2019", icon: "🌱", title: "The Idea", desc: "Started with a dream to make farmhouse getaways accessible to every Indian family." },
  { year: "2020", icon: "🏡", title: "First 10 Properties", desc: "Launched with 10 handpicked farmhouses across Goa, Himachal and Rajasthan." },
  { year: "2021", icon: "🚀", title: "Rapid Growth", desc: "Expanded to 100+ properties. 5,000 happy bookings. Won Startup India Award." },
  { year: "2022", icon: "🌍", title: "Pan-India", desc: "Reached 18 states. Introduced premium add-ons — private chef, adventure tours, DJ." },
  { year: "2023", icon: "⭐", title: "4.9★ Rating", desc: "12,500+ guests. Rated #1 farmhouse booking platform in India by TravelTech Summit." },
  { year: "2024", icon: "🏆", title: "Award-Winning", desc: "Best Experiential Travel Platform award. Launched AI-based farmhouse recommender." },
];

/* ── VALUES ─────────────────────────────────── */
const VALUES = [
  { icon: "🔒", title: "Trust & Safety",    desc: "Every property is physically inspected. 100% verified listings." },
  { icon: "🌿", title: "Eco-Conscious",     desc: "We promote sustainable stays with eco-certified properties." },
  { icon: "💛", title: "Guest First",       desc: "Your experience comes before everything. Always." },
  { icon: "🤝", title: "Owner Empowerment", desc: "We help property owners grow their income, their way." },
  { icon: "⚡", title: "Speed & Simplicity", desc: "Book in under 60 seconds. Instant confirmation. Zero paperwork." },
  { icon: "🌈", title: "Inclusivity",       desc: "Farmhouses for every budget — from cozy cottages to royal palaces." },
];

/* ── STATS ──────────────────────────────────── */
const STATS_TARGET = [
  { label: "Luxury Estates",   value: 500,   suffix: "+",  icon: "🏡" },
  { label: "Happy Guests",     value: 20000, suffix: "+",  icon: "😊", format: "k" },
  { label: "Cities Covered",   value: 100,   suffix: "+",  icon: "🗺️" },
  { label: "Avg Rating",       value: 4.9,   suffix: "★",  icon: "⭐", decimal: true },
];

/* ── FAQ ────────────────────────────────────── */
const FAQS = [
  { q: "How are farmhouses verified?",           a: "Each property is visited by our inspection team. We check safety, hygiene, amenities, and photo accuracy before listing." },
  { q: "Can I cancel my booking?",               a: "Yes! Free cancellation up to 48 hours before check-in. Within 48 hours, 1-night charge applies. We also offer free rescheduling." },
  { q: "Do you support owner listings?",         a: "Absolutely. Owners can register, submit their property, and our team verifies & onboards it within 72 hours." },
  { q: "Are add-ons like Chef & DJ available?",  a: "Yes, at select premium properties. You can choose from Private Chef, Bonfire, DJ Sound, Adventure Tour, Spa, and more during booking." },
  { q: "What makes FarmHouse Booking different?", a: "We combine luxury travel with an authentic, curated Indian farmhouse experience — something no hotel chain can match." },
];

/* ─────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────── */
function About() {
  /* Count-up animation */
  const [stats, setStats]           = useState(STATS_TARGET.map(() => 0));
  const [statsStarted, setStarted]  = useState(false);
  const statsRef                    = useRef(null);

  /* Journey active step */
  const [activeStep, setActiveStep] = useState(0);

  /* Active team member */
  const [activeTeam, setActiveTeam] = useState(0);

  /* Active FAQ */
  const [activeFaq, setActiveFaq]   = useState(null);

  /* Value hover */
  const [hoveredVal, setHoveredVal] = useState(null);

  /* Fun fact cycling */
  const funFacts = [
    "🌾 India has over 200,000 farmhouses waiting to be discovered",
    "🎉 Our most-booked day? New Year's Eve — every year!",
    "🏊 Private pools are the #1 requested amenity on our platform",
    "🦚 Heritage farmhouses in Rajasthan have real resident peacocks",
    "🌅 Sunrise yoga sessions are offered at 60% of our hill-station properties",
  ];
  const [factIdx, setFactIdx]       = useState(0);
  const [factVisible, setFactVisible] = useState(true);

  /* ── Fun fact rotator ── */
  useEffect(() => {
    const iv = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIdx(i => (i + 1) % funFacts.length);
        setFactVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(iv);
  }, []);

  /* ── Intersection observer for stats count-up ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !statsStarted) setStarted(true); },
      { threshold: 0.4 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsStarted]);

  useEffect(() => {
    if (!statsStarted) return;
    const DURATION = 1400;
    const STEPS    = 40;
    const step     = DURATION / STEPS;
    let s = 0;
    const iv = setInterval(() => {
      s++;
      const ease = 1 - Math.pow(1 - s / STEPS, 3);
      setStats(STATS_TARGET.map(t => {
        const v = t.value * ease;
        return t.decimal ? parseFloat(v.toFixed(1)) : Math.round(v);
      }));
      if (s >= STEPS) clearInterval(iv);
    }, step);
    return () => clearInterval(iv);
  }, [statsStarted]);

  /* ── Auto-advance journey ── */
  useEffect(() => {
    const iv = setInterval(() => setActiveStep(s => (s + 1) % JOURNEY.length), 3000);
    return () => clearInterval(iv);
  }, []);

  const formatStat = (val, t) => {
    if (t.format === "k") return `${(val / 1000).toFixed(1)}k`;
    if (t.decimal) return val.toFixed(1);
    return val.toLocaleString();
  };

  return (
    <div className="ab-page">

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="ab-hero">
        <div className="ab-hero-blob b1" />
        <div className="ab-hero-blob b2" />
        <div className="ab-hero-blob b3" />
        <div className="ab-hero-inner">
          <span className="ab-chip">🌿 OUR STORY</span>
          <h1>
            We Believe Every Journey<br />
            <span className="ab-hero-gradient">Deserves a Perfect Nest</span>
          </h1>
          <p>FarmHouse Booking is India's most trusted luxury farmhouse platform — connecting dreamers to destinations, and guests to unforgettable memories since 2019.</p>
          <div className="ab-hero-cta">
            <Link to="/farmhouses" className="ab-btn-primary">Explore All Estates →</Link>
            <a href="#journey" className="ab-btn-outline">Our Journey ↓</a>
          </div>
        </div>

        {/* Fun fact ticker */}
        <div className="ab-ticker">
          <span className="ab-ticker-badge">💡 Did You Know?</span>
          <span className={`ab-ticker-text ${factVisible ? "visible" : "hidden"}`}>
            {funFacts[factIdx]}
          </span>
        </div>
      </section>

      {/* ══════════════════ ANIMATED STATS ══════════════════ */}
      <section className="ab-stats" ref={statsRef}>
        {STATS_TARGET.map((t, i) => (
          <div className="ab-stat-card" key={i}>
            <div className="ab-stat-icon">{t.icon}</div>
            <div className="ab-stat-num">
              {formatStat(stats[i], t)}{t.suffix}
            </div>
            <div className="ab-stat-label">{t.label}</div>
          </div>
        ))}
      </section>

      {/* ══════════════════ WHO WE ARE ══════════════════ */}
      <section className="ab-who">
        <div className="ab-who-img">
          <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop" alt="Farmhouse" />
          <div className="ab-who-img-badge">
            <span>🏆</span> India's #1<br />Farmhouse Platform
          </div>
        </div>
        <div className="ab-who-content">
          <span className="ab-section-chip">👋 WHO WE ARE</span>
          <h2>More Than Just a Booking Platform</h2>
          <p>We curate <strong>hand-picked, verified farmhouses</strong> across India — from serene riverside cottages in Uttarakhand to royal heritage havelis in Rajasthan and misty mountain villas in Himachal Pradesh.</p>
          <p>Every estate on our platform has been physically inspected by our team for <strong>safety, hygiene, and premium experience quality</strong>. We don't just list properties — we craft memories.</p>
          <div className="ab-who-pillars">
            <div className="ab-pillar">🔍 <span>Verified Properties</span></div>
            <div className="ab-pillar">⚡ <span>Instant Booking</span></div>
            <div className="ab-pillar">🛡️ <span>Secure Payments</span></div>
            <div className="ab-pillar">🌿 <span>Eco-Friendly</span></div>
          </div>
          <Link to="/farmhouses" className="ab-btn-primary">Browse All Estates →</Link>
        </div>
      </section>

      {/* ══════════════════ JOURNEY TIMELINE ══════════════════ */}
      <section className="ab-journey" id="journey">
        <div className="ab-section-header">
          <span className="ab-section-chip">🚀 OUR JOURNEY</span>
          <h2>From Idea to India's #1 Platform</h2>
          <p>A story built on passion, trust, and one farmhouse at a time</p>
        </div>

        <div className="ab-timeline">
          {JOURNEY.map((step, i) => (
            <div
              key={i}
              className={`ab-timeline-step ${activeStep === i ? "active" : ""} ${i < activeStep ? "past" : ""}`}
              onClick={() => setActiveStep(i)}
            >
              <div className="ab-tl-dot">{step.icon}</div>
              <div className="ab-tl-year">{step.year}</div>
              <div className="ab-tl-content">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
          <div className="ab-tl-progress">
            <div className="ab-tl-bar" style={{ width: `${((activeStep + 1) / JOURNEY.length) * 100}%` }} />
          </div>
        </div>
      </section>

      {/* ══════════════════ CORE VALUES ══════════════════ */}
      <section className="ab-values">
        <div className="ab-section-header light">
          <span className="ab-section-chip light">💛 WHAT WE STAND FOR</span>
          <h2>Our Core Values</h2>
          <p>Six principles that guide every decision we make</p>
        </div>

        <div className="ab-values-grid">
          {VALUES.map((v, i) => (
            <div
              key={i}
              className={`ab-value-card ${hoveredVal === i ? "hovered" : ""}`}
              onMouseEnter={() => setHoveredVal(i)}
              onMouseLeave={() => setHoveredVal(null)}
            >
              <div className="ab-val-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
              <div className="ab-val-bar">
                <div className="ab-val-fill" style={{ width: hoveredVal === i ? "100%" : "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ MEET THE TEAM ══════════════════ */}
      <section className="ab-team">
        <div className="ab-section-header">
          <span className="ab-section-chip">🤝 THE PEOPLE BEHIND IT</span>
          <h2>Meet Our Team</h2>
          <p>Click on any team member to know them better</p>
        </div>

        <div className="ab-team-layout">
          {/* Team avatar tabs */}
          <div className="ab-team-tabs">
            {TEAM.map((m, i) => (
              <button
                key={i}
                className={`ab-team-tab ${activeTeam === i ? "active" : ""}`}
                onClick={() => setActiveTeam(i)}
              >
                <span className="ab-team-emoji">{m.emoji}</span>
                <span className="ab-team-tab-name">{m.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Active member card */}
          <div className="ab-team-spotlight" key={activeTeam}>
            <div className="ab-team-avatar">{TEAM[activeTeam].emoji}</div>
            <div className="ab-team-detail">
              <h3>{TEAM[activeTeam].name}</h3>
              <span className="ab-team-role">{TEAM[activeTeam].role}</span>
              <blockquote className="ab-team-quote">
                "{TEAM[activeTeam].quote}"
              </blockquote>
              <div className="ab-team-meta">
                <div className="ab-meta-pill">🎯 {TEAM[activeTeam].experience}</div>
                <div className="ab-meta-pill">❤️ {TEAM[activeTeam].hobby}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ FAQ ══════════════════ */}
      <section className="ab-faq">
        <div className="ab-section-header">
          <span className="ab-section-chip">❓ GOT QUESTIONS?</span>
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="ab-faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={`ab-faq-item ${activeFaq === i ? "open" : ""}`}>
              <button className="ab-faq-q" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                <span>{f.q}</span>
                <span className="ab-faq-arrow">{activeFaq === i ? "−" : "+"}</span>
              </button>
              <div className="ab-faq-a">
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ FINAL CTA ══════════════════ */}
      <section className="ab-cta">
        <div className="ab-cta-blob b1" />
        <div className="ab-cta-blob b2" />
        <div className="ab-cta-inner">
          <span className="ab-chip light">🏡 READY TO ESCAPE?</span>
          <h2>Your Perfect Farmhouse Awaits</h2>
          <p>Join 20,000+ happy guests who found their dream stay with us. Instant booking. Verified properties. Unforgettable experiences.</p>
          <div className="ab-cta-btns">
            <Link to="/farmhouses" className="ab-btn-primary large">Explore All Estates →</Link>
            <Link to="/register"   className="ab-btn-outline large light">Create Free Account</Link>
          </div>
          <div className="ab-cta-badges">
            <span>🔒 SSL Secure</span>
            <span>⚡ Instant Booking</span>
            <span>↩️ Free Cancellation</span>
            <span>📞 24/7 Support</span>
          </div>
        </div>
      </section>

    </div>
  );
}

export default About;