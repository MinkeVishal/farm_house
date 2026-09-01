import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { discountAPI } from '../api/axiosInstance';
import './DiscountsSection.css';

// Metadata for each farmhouse type
const TYPE_META = {
  ZEN_RETREAT: {
    emoji: '🧘',
    label: 'Zen Retreat',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    textColor: '#ffffff',
  },
  POOL_PARTY: {
    emoji: '🎉',
    label: 'Pool Party',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
    textColor: '#ffffff',
  },
  ADVENTURE_WOODS: {
    emoji: '⛰️',
    label: 'Adventure Woods',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    textColor: '#ffffff',
  },
  HERITAGE_PALACE: {
    emoji: '🏰',
    label: 'Heritage Palace',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    textColor: '#ffffff',
  },
  ALL: {
    emoji: '🏡',
    label: 'All Farmhouses',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    textColor: '#ffffff',
  },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function calculateCountdown(validTo) {
  if (!validTo) return null;
  const target = new Date(validTo + 'T23:59:59');
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) return 'Ending today!';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h ${minutes}m remaining`;
}

export default function DiscountsSection() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check logged in user for Owner/Admin management shortcut
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    }

    const loadDiscounts = async () => {
      try {
        const res = await discountAPI.getActiveDiscounts();
        if (res.data.success) {
          setDiscounts(res.data.discounts || []);
        }
      } catch (err) {
        console.warn('Could not load discounts:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDiscounts();
  }, []);

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading || discounts.length === 0) return null;

  // Filter discounts by selected date if specified
  const filteredDiscounts = discounts.filter((d) => {
    if (!selectedDate) return true;
    const targetDate = new Date(selectedDate);
    const validFrom = d.validFrom ? new Date(d.validFrom) : null;
    const validTo = d.validTo ? new Date(d.validTo + 'T23:59:59') : null;

    if (validFrom && targetDate < validFrom) return false;
    if (validTo && targetDate > validTo) return false;
    return true;
  });

  const isOwnerOrAdmin = user && (user.role === 'OWNER' || user.role === 'ADMIN' || user.role === 'SUPERADMIN');

  return (
    <section className="discounts-section">
      {/* Decorative blobs */}
      <div className="ds-blob ds-blob-1" />
      <div className="ds-blob ds-blob-2" />

      {/* Header Intro */}
      <div className="section-intro">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="section-chip ds-chip">🔥 LIMITED TIME OFFERS</span>
          {isOwnerOrAdmin && (
            <button
              className="ds-owner-manage-btn"
              onClick={() => navigate(user.role === 'OWNER' ? '/owner-dashboard' : '/admin-dashboard')}
            >
              ⚙️ Manage Discounts ({user.role})
            </button>
          )}
        </div>
        <h2>Special Farmhouse Deals &amp; Discounts</h2>
        <p>Explore exclusive date-specific offers on our finest farmhouses. Filter by your check-in date below!</p>
      </div>

      {/* Interactive Date Filter Bar */}
      <div className="ds-filter-container">
        <div className="ds-filter-box">
          <span className="ds-filter-icon">📅</span>
          <label htmlFor="ds-date-input" className="ds-filter-label">Filter Deals for Check-in Date:</label>
          <input
            id="ds-date-input"
            type="date"
            className="ds-date-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {selectedDate && (
            <button className="ds-clear-date-btn" onClick={() => setSelectedDate('')}>
              ✕ Clear Filter
            </button>
          )}
        </div>
        {selectedDate && (
          <div className="ds-filter-status">
            Showing {filteredDiscounts.length} deal{filteredDiscounts.length === 1 ? '' : 's'} available on{' '}
            <strong>{formatDate(selectedDate)}</strong>
          </div>
        )}
      </div>

      {/* Deals Grid */}
      {filteredDiscounts.length === 0 ? (
        <div className="ds-no-deals">
          <span>🔍</span>
          <p>No special discounts active for {formatDate(selectedDate)}. Check other dates or view all deals!</p>
          <button className="ds-cta-btn" onClick={() => setSelectedDate('')}>Show All Deals</button>
        </div>
      ) : (
        <div className="ds-grid">
          {filteredDiscounts.map((d) => {
            const meta = TYPE_META[d.farmhouseType] || TYPE_META.ALL;
            const countdownText = calculateCountdown(d.validTo);
            const promoCode = `FARM${d.discountPercent}${d.id}`;

            return (
              <div
                key={d.id}
                className="ds-card"
                style={{ background: meta.gradient }}
              >
                {/* Discount Badge */}
                <div className="ds-badge">
                  <span className="ds-badge-percent">{d.discountPercent}%</span>
                  <span className="ds-badge-off">OFF</span>
                </div>

                {/* Specific Farmhouse or Category Header */}
                <div className="ds-card-header">
                  <span className="ds-type-emoji">{meta.emoji}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="ds-type-label">{meta.label}</span>
                    {d.farmhouseName && (
                      <span className="ds-farmhouse-tag">🏡 {d.farmhouseName}</span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="ds-card-body">
                  <h3 className="ds-title">{d.title}</h3>
                  {d.description && <p className="ds-desc">{d.description}</p>}

                  {/* Special Offer Box */}
                  {d.specialOffer && (
                    <div className="ds-offer-box">
                      <span className="ds-offer-icon">🎁</span>
                      <span className="ds-offer-text">{d.specialOffer}</span>
                    </div>
                  )}

                  {/* Validity Date Range */}
                  {(d.validFrom || d.validTo) && (
                    <div className="ds-validity">
                      <span className="ds-clock">🗓️</span>
                      <span>
                        {d.validFrom && d.validTo
                          ? `${formatDate(d.validFrom)} – ${formatDate(d.validTo)}`
                          : d.validFrom
                          ? `Valid from ${formatDate(d.validFrom)}`
                          : `Valid until ${formatDate(d.validTo)}`}
                      </span>
                    </div>
                  )}

                  {/* Urgency Live Countdown Badge */}
                  {countdownText && (
                    <div className="ds-countdown-badge">
                      <span>⚡</span> {countdownText}
                    </div>
                  )}

                  {/* Interactive Claim Voucher Button */}
                  <button
                    className={`ds-voucher-btn ${copiedId === d.id ? 'copied' : ''}`}
                    onClick={() => handleCopyCode(d.id, promoCode)}
                  >
                    {copiedId === d.id ? `✅ Promo Code "${promoCode}" Copied!` : `🎟️ Claim Voucher (${promoCode})`}
                  </button>
                </div>

                {/* Direct Booking CTA */}
                <div className="ds-card-footer">
                  <Link
                    to={d.farmhouseId ? `/booking/${d.farmhouseId}` : '/farmhouses'}
                    className="ds-cta-btn"
                  >
                    {d.farmhouseName ? `Book ${d.farmhouseName} →` : 'Browse & Book Deal →'}
                  </Link>

                  <div className="ds-creator-tag">
                    Offered by {d.createdByName} {d.createdByRole ? `(${d.createdByRole})` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="ds-footer-note">
        <p>💡 Select your date and claim promo vouchers to get auto-discounts at checkout.</p>
      </div>
    </section>
  );
}
