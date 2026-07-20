import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { farmhouseAPI } from '../api/axiosInstance';
import ExperienceChatbot from '../components/ExperienceChatbot';
import BudgetCalculator from '../components/BudgetCalculator';

const ROTATING_WORDS = ['Sanctuary', 'Pool Paradise', 'Rustic Cabin', 'Mountain Villa', 'Heritage Palace'];


const VIBE_CARDS = [
  {
    emoji: '🧘',
    title: 'Zen Retreat',
    desc: 'Quiet riverside stays with yoga lawns & organic meals',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    filter: 'quiet',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop',
  },
  {
    emoji: '🎉',
    title: 'Pool Party',
    desc: 'Private infinity pools, DJ setups & party lawns',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    filter: 'pool',
    img: 'https://images.unsplash.com/photo-1572331165267-854da2b021b1?w=600&auto=format&fit=crop',
  },
  {
    emoji: '⛰️',
    title: 'Adventure Woods',
    desc: 'Mountain cabins with trekking trails & bonfires',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    filter: 'adventure',
    img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&auto=format&fit=crop',
  },
  {
    emoji: '🏰',
    title: 'Heritage Palace',
    desc: 'Royal Rajasthani havelis with cultural experiences',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    filter: 'heritage',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop',
  },
];

const TESTIMONIALS = [
  {
    id: 1, name: 'Rohan Sharma', role: 'Family Vacationer', rating: 5, avatar: '👨‍👩‍👧',
    comment: 'The Mountain Villa was an absolute dream. We had the entire estate to ourselves — private pool, bonfire under the stars, and the most incredible sunrise views.',
  },
  {
    id: 2, name: 'Priya Patel', role: 'Birthday Event Host', rating: 5, avatar: '🎂',
    comment: 'Hosted my 30th birthday at the Modern Farm Estate. The DJ setup, catering service, and massive lawns made it the best party of my life!',
  },
  {
    id: 3, name: 'Vikram & Ananya', role: 'Honeymoon Couple', rating: 5, avatar: '💑',
    comment: 'Our honeymoon at the Heritage Palace in Rajasthan was magical. The royal architecture, candlelight dinners, and personal butler made it unforgettable.',
  },
  {
    id: 4, name: 'Deepak Khanna', role: 'Corporate Retreat Lead', rating: 4, avatar: '💼',
    comment: 'Booked for our team offsite of 15 people. Excellent Wi-Fi, conference space, and the riverside location kept everyone energized and inspired.',
  },
];

const FAQS = [
  { q: 'How do I confirm my farmhouse booking?', a: 'Select your dates and click Book Now. A 50% deposit confirms your reservation instantly. You\'ll receive caretaker contact details and a digital receipt via email.' },
  { q: 'Are pets allowed at the farmhouses?', a: 'Yes! Most estates feature massive open lawns and are completely pet-friendly. Just mention your furry companion during booking so we can arrange special amenities.' },
  { q: 'Can we host large parties or DJ events?', a: 'Absolutely. Our premium estates like the Modern Farm Estate come with pre-installed sound systems. You can also add our DJ & Sound package from the Budget Planner below.' },
  { q: 'What is the cancellation & refund policy?', a: 'Full refund for cancellations made 48+ hours before check-in. Within 48 hours, a 1-night charge applies. We also offer free date rescheduling within 30 days.' },
  { q: 'Do you provide catering and private chef services?', a: 'Yes! Our Private Chef & Catering add-on includes breakfast, lunch, dinner, and evening snacks prepared with fresh local ingredients. Customizable menus available.' },
];

function Home({ user }) {
  const [farmhouses, setFarmhouses] = useState([]);
  const [filteredFarmhouses, setFilteredFarmhouses] = useState([]);
  const [activeVibe, setActiveVibe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [wordFade, setWordFade] = useState(true);

  // Search
  const [searchLoc, setSearchLoc] = useState('');
  const [searchGuests, setSearchGuests] = useState('');
  const [searchPrice, setSearchPrice] = useState('');

  // Stats
  const [stats, setStats] = useState({ houses: 0, guests: 0, rating: 0, cities: 0 });

  // FAQ
  const [activeFaq, setActiveFaq] = useState(null);

  // Testimonials
  const [testimonials, setTestimonials] = useState(TESTIMONIALS);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [newReview, setNewReview] = useState({ name: '', role: '', comment: '', rating: 5 });
  const [reviewMsg, setReviewMsg] = useState('');

  const featuredRef = useRef(null);

  // Word rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setWordFade(false);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setWordFade(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Fetch farmhouses
  useEffect(() => {
    const load = async () => {
      try {
        const res = await farmhouseAPI.getAllFarmHouses(0, 50);
        if (res.data.success && res.data.farmhouses) {
          setFarmhouses(res.data.farmhouses);
          setFilteredFarmhouses(res.data.farmhouses);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Stats count-up
  useEffect(() => {
    const targets = { houses: 50, guests: 12500, rating: 4.9, cities: 18 };
    const duration = 1200;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setStats({
        houses: Math.round(targets.houses * ease),
        guests: Math.round(targets.guests * ease),
        rating: parseFloat((targets.rating * ease).toFixed(1)),
        cities: Math.round(targets.cities * ease),
      });
      if (step >= steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  // Vibe filter
  const handleVibeClick = (vibe) => {
    if (activeVibe === vibe.filter) {
      setActiveVibe(null);
      setFilteredFarmhouses(farmhouses);
      return;
    }
    setActiveVibe(vibe.filter);
    const filtered = farmhouses.filter((fh) => {
      const text = `${fh.name} ${fh.description} ${fh.amenities} ${fh.location}`.toLowerCase();
      if (vibe.filter === 'pool') return text.includes('pool') || text.includes('swim');
      if (vibe.filter === 'quiet') return text.includes('river') || text.includes('peace') || text.includes('garden') || fh.location?.toLowerCase().includes('uttarakhand');
      if (vibe.filter === 'adventure') return text.includes('mountain') || text.includes('trek') || text.includes('hiking') || fh.location?.toLowerCase().includes('himachal');
      if (vibe.filter === 'heritage') return text.includes('heritage') || text.includes('traditional') || text.includes('culture') || fh.location?.toLowerCase().includes('rajasthan');
      return true;
    });
    setFilteredFarmhouses(filtered.length > 0 ? filtered : farmhouses);
    if (featuredRef.current) featuredRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  // Quick search
  const handleQuickSearch = (e) => {
    e.preventDefault();
    let results = [...farmhouses];
    if (searchLoc) results = results.filter((fh) => fh.location?.toLowerCase().includes(searchLoc.toLowerCase()));
    if (searchPrice) results = results.filter((fh) => fh.pricePerDay <= parseFloat(searchPrice));
    if (searchGuests) results = results.filter((fh) => fh.maxGuests >= parseInt(searchGuests));
    setFilteredFarmhouses(results);
    setActiveVibe(null);
    if (featuredRef.current) featuredRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const clearSearch = () => {
    setSearchLoc(''); setSearchGuests(''); setSearchPrice('');
    setFilteredFarmhouses(farmhouses); setActiveVibe(null);
  };

  // Reviews
  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    const added = { id: Date.now(), ...newReview, avatar: '⭐' };
    const updated = [...testimonials, added];
    setTestimonials(updated);
    setActiveReviewIdx(updated.length - 1);
    setNewReview({ name: '', role: '', comment: '', rating: 5 });
    setReviewMsg('Your review has been published!');
    setTimeout(() => setReviewMsg(''), 4000);
  };

  // Fallback data for when backend is offline
  const fallbackFarmhouses = [
    { id: 1, name: 'Luxury Mountain Villa', location: 'Himachal Pradesh', description: 'Stunning mountain retreat with panoramic views, perfect for family vacations and peaceful getaways', pricePerDay: 5000, maxGuests: 6, bedrooms: 3, bathrooms: 4, imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500&auto=format&fit=crop' },
    { id: 2, name: 'Cozy Countryside Cottage', location: 'Goa', description: 'Charming cottage nestled in the lush countryside, ideal for peaceful romantic getaways', pricePerDay: 3500, maxGuests: 4, bedrooms: 2, bathrooms: 3, imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&auto=format&fit=crop' },
    { id: 3, name: 'Modern Farm Estate', location: 'Punjab', description: 'Contemporary farmhouse with modern amenities, private pool, and party lawns for large groups', pricePerDay: 6000, maxGuests: 10, bedrooms: 5, bathrooms: 6, imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&auto=format&fit=crop' },
    { id: 4, name: 'Riverside Farmhouse', location: 'Uttarakhand', description: 'Beautiful farmhouse by the riverside with adventure activities and stunning river valley views', pricePerDay: 4500, maxGuests: 8, bedrooms: 4, bathrooms: 5, imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=500&auto=format&fit=crop' },
    { id: 5, name: 'Heritage Farm Resort', location: 'Rajasthan', description: 'Traditional farmhouse preserving royal Rajasthani architecture and cultural heritage experiences', pricePerDay: 4000, maxGuests: 6, bedrooms: 3, bathrooms: 4, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop' },
  ];

  const displayList = filteredFarmhouses.length > 0 ? filteredFarmhouses : (loading ? [] : fallbackFarmhouses);

  return (
    <div className="home-page">
      {/* ═══════════ HERO ═══════════ */}
      <section className="lux-hero">
        {/* Animated blobs */}
        <div className="hero-blob blob-1"></div>
        <div className="hero-blob blob-2"></div>
        <div className="hero-blob blob-3"></div>

        <div className="lux-hero-content">
          <span className="hero-chip">🌿 CURATED LUXURY FARM STAYS</span>

          <h1>
            Escape to Your Private<br />
            <span className={`rotating-word ${wordFade ? 'visible' : 'hidden'}`}>
              {ROTATING_WORDS[wordIndex]}
            </span>
          </h1>

          <p className="hero-subtitle">
            Hand-picked estates with private pools, bonfires, personal chefs & breathtaking views — across {stats.cities}+ destinations in India.
          </p>

         

          <div className="hero-cta-row">
            <Link to="/farmhouses" className="btn-lux-primary">
              Browse All Estates →
            </Link>
            {!user && (
              <Link to="/register" className="btn-lux-outline">
                Create Free Account
              </Link>
            )}
            {user && (
              <Link to="/my-bookings" className="btn-lux-outline">
                My Bookings
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ STATS RIBBON ═══════════ */}
      <section className="stats-ribbon">
        <div className="ribbon-item">
          <span className="ribbon-num">{stats.houses}+</span>
          <span className="ribbon-label">Premium Estates</span>
        </div>
        <div className="ribbon-divider"></div>
        <div className="ribbon-item">
          <span className="ribbon-num">{(stats.guests / 1000).toFixed(1)}k+</span>
          <span className="ribbon-label">Happy Guests</span>
        </div>
        <div className="ribbon-divider"></div>
        <div className="ribbon-item">
          <span className="ribbon-num">{stats.rating}</span>
          <span className="ribbon-label">★ Avg Rating</span>
        </div>
        <div className="ribbon-divider"></div>
        <div className="ribbon-item">
          <span className="ribbon-num">{stats.cities}+</span>
          <span className="ribbon-label">Cities Covered</span>
        </div>
      </section>

      {/* ═══════════ CHOOSE YOUR VIBE ═══════════ */}
      <section className="vibe-section">
        <div className="section-intro">
          <span className="section-chip">✨ CHOOSE YOUR VIBE</span>
          <h2>What Kind of Escape Do You Crave?</h2>
          <p>Click a vibe to instantly filter estates that match your mood</p>
        </div>

        <div className="vibe-deck">
          {VIBE_CARDS.map((vibe, idx) => (
            <div
              key={idx}
              className={`vibe-card ${activeVibe === vibe.filter ? 'active' : ''}`}
              onClick={() => handleVibeClick(vibe)}
            >
              <div className="vibe-card-img" style={{ backgroundImage: `url(${vibe.img})` }}>
                <div className="vibe-card-overlay" style={{ background: vibe.gradient, opacity: 0.75 }}></div>
                <div className="vibe-card-body">
                  <span className="vibe-emoji">{vibe.emoji}</span>
                  <h3>{vibe.title}</h3>
                  <p>{vibe.desc}</p>
                  <span className="vibe-cta">{activeVibe === vibe.filter ? '✓ Active' : 'Explore →'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURED ESTATES ═══════════ */}
      <section className="estates-section" ref={featuredRef}>
        <div className="section-intro">
          <span className="section-chip">🏡 FEATURED ESTATES</span>
          <h2>Handpicked Luxury Farmhouses</h2>
          <p>Every property is personally verified for quality, hygiene, and premium amenities</p>
        </div>

        {(searchLoc || searchGuests || searchPrice) && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button onClick={clearSearch} className="clear-search-pill">✕ Clear Search Filters</button>
          </div>
        )}

        {loading ? (
          <div className="loading-spinner-box">
            <div className="lux-spinner"></div>
            <p>Discovering beautiful estates...</p>
          </div>
        ) : (
          <div className="estates-grid">
            {displayList.map((fh, idx) => (
              <div key={fh.id} className="estate-card" style={{ animationDelay: `${idx * 0.08}s` }}>
                <div className="estate-img-wrap">
                  <img
                    src={fh.imageUrl || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500'}
                    alt={fh.name}
                  />
                  <div className="estate-price-badge">₹{fh.pricePerDay?.toLocaleString()}<small>/night</small></div>
                  <div className="estate-loc-badge">📍 {fh.location}</div>
                </div>
                <div className="estate-body">
                  <h3>{fh.name}</h3>
                  <p className="estate-desc">{fh.description?.substring(0, 90)}...</p>
                  <div className="estate-meta">
                    <span>🛏️ {fh.bedrooms || 3}</span>
                    <span>🚿 {fh.bathrooms || 3}</span>
                    <span>👥 {fh.maxGuests || 6}</span>
                  </div>
                  <div className="estate-card-actions">
                    <Link to={`/farmhouses/${fh.id}`} className="estate-view-btn estate-book-btn">
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {displayList.length === 0 && !loading && (
          <div className="no-results-box">
            <h3>😔 No estates matched your criteria</h3>
            <p>Try changing your destination, budget, or guest count.</p>
            <button onClick={clearSearch} className="clear-search-pill">Reset All Filters</button>
          </div>
        )}
      </section>

      {/* ═══════════ BUDGET ESTIMATOR ═══════════ */}
      <section className="budget-section">
        <div className="section-intro light">
          <span className="section-chip light">📐 SMART BUDGET PLANNER</span>
          <h2>Estimate Your Stay Cost Instantly</h2>
          <p>Customize nights, guests, and premium add-on packages to see real-time pricing</p>
        </div>
        <div className="budget-wrapper">
          <BudgetCalculator />
        </div>
      </section>

      {/* ═══════════ WHY US ═══════════ */}
      <section className="why-section">
        <div className="section-intro">
          <span className="section-chip">🏆 WHY CHOOSE US</span>
          <h2>The Premium Booking Experience</h2>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon-circle" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>🔒</div>
            <h3>100% Secure Payment</h3>
            <p>SSL-encrypted transactions with instant refunds within 48 hours of cancellation. Your money is always protected.</p>
          </div>
          <div className="why-card">
            <div className="why-icon-circle" style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}>✅</div>
            <h3>Personally Verified</h3>
            <p>Every pool, bonfire pit, garden, and kitchen is physically inspected and certified for hygiene and comfort standards.</p>
          </div>
          <div className="why-card">
            <div className="why-icon-circle" style={{ background: 'linear-gradient(135deg, #f6d365, #fda085)' }}>🧑‍🍳</div>
            <h3>On-Site Caretakers</h3>
            <p>Dedicated staff at every farmhouse for meal preparation, bonfire setups, and any personal requests during your stay.</p>
          </div>
          <div className="why-card">
            <div className="why-icon-circle" style={{ background: 'linear-gradient(135deg, #a8edea, #fed6e3)' }}>⏰</div>
            <h3>Instant Confirmation</h3>
            <p>No waiting. Book now, get confirmed in under 60 seconds. Receive your check-in details and caretaker contact immediately.</p>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="reviews-section">
        <div className="section-intro">
          <span className="section-chip">💬 GUEST STORIES</span>
          <h2>Hear From Our Happy Guests</h2>
        </div>

        <div className="reviews-layout">
          {/* Carousel */}
          <div className="review-showcase">
            <div className="review-quote-card">
              <div className="rq-stars">{'★'.repeat(testimonials[activeReviewIdx].rating)}{'☆'.repeat(5 - testimonials[activeReviewIdx].rating)}</div>
              <p className="rq-text">"{testimonials[activeReviewIdx].comment}"</p>
              <div className="rq-author">
                <span className="rq-avatar">{testimonials[activeReviewIdx].avatar}</span>
                <div>
                  <strong>{testimonials[activeReviewIdx].name}</strong>
                  <span>{testimonials[activeReviewIdx].role}</span>
                </div>
              </div>
            </div>
            {/* Dot navigation */}
            <div className="review-dots">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  className={`dot ${activeReviewIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveReviewIdx(idx)}
                ></button>
              ))}
            </div>
            <div className="review-nav-arrows">
              <button onClick={() => setActiveReviewIdx((activeReviewIdx - 1 + testimonials.length) % testimonials.length)}>← Prev</button>
              <button onClick={() => setActiveReviewIdx((activeReviewIdx + 1) % testimonials.length)}>Next →</button>
            </div>
          </div>

          {/* Add review form */}
          <div className="review-form-card">
            <h3>Share Your Experience</h3>
            <p>Your review helps other travelers find their perfect farmhouse</p>
            {reviewMsg && <div className="review-success-msg">{reviewMsg}</div>}
            <form onSubmit={handleAddReview}>
              <div className="rf-row">
                <input type="text" placeholder="Your Name" value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} required />
                <input type="text" placeholder="Your Role (e.g. Vacationer)" value={newReview.role} onChange={(e) => setNewReview({ ...newReview, role: e.target.value })} />
              </div>
              <textarea placeholder="Describe your experience..." rows="4" value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} required></textarea>
              <div className="rf-footer">
                <div className="rf-rating">
                  <label>Rating:</label>
                  <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <button type="submit" className="rf-submit-btn">Publish Review →</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="faq-section-lux">
        <div className="section-intro">
          <span className="section-chip">❓ FAQ</span>
          <h2>Frequently Asked Questions</h2>
          <p>Quick answers to common booking queries</p>
        </div>
        <div className="faq-list-lux">
          {FAQS.map((faq, idx) => (
            <div key={idx} className={`faq-item-lux ${activeFaq === idx ? 'open' : ''}`}>
              <button className="faq-q-btn" onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}>
                <span>{faq.q}</span>
                <span className="faq-arrow">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              <div className="faq-a-body">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="final-cta">
        <div className="cta-blob blob-1"></div>
        <div className="cta-blob blob-2"></div>
        <div className="final-cta-content">
          <h2>Ready for the Most Memorable Stay of Your Life?</h2>
          <p>Join 12,500+ happy guests who found their perfect farmhouse escape with us.</p>
          <div className="final-cta-btns">
            <Link to="/farmhouses" className="btn-lux-primary large">Explore All Estates →</Link>
            {!user && <Link to="/register" className="btn-lux-outline large light">Sign Up Free</Link>}
          </div>
        </div>
      </section>

      {/* Floating chatbot */}
      <ExperienceChatbot />
    </div>
  );
}

export default Home;
