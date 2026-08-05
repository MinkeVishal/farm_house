import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { bookingAPI, farmhouseAPI, paymentAPI } from '../api/axiosInstance';
import './BookingPage.css';

// Demo fallback farmhouses
const DEMO_FARMHOUSES = {
  1: { id: 1, name: 'Luxury Mountain Villa', location: 'Himachal Pradesh', pricePerDay: 5000, maxGuests: 6, bedrooms: 3, bathrooms: 4, available: true, imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop' },
  2: { id: 2, name: 'Cozy Countryside Cottage', location: 'Goa', pricePerDay: 3500, maxGuests: 4, bedrooms: 2, bathrooms: 3, available: true, imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop' },
  3: { id: 3, name: 'Modern Farm Estate', location: 'Punjab', pricePerDay: 6000, maxGuests: 10, bedrooms: 5, bathrooms: 6, available: true, imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop' },
  4: { id: 4, name: 'Riverside Farmhouse', location: 'Uttarakhand', pricePerDay: 4500, maxGuests: 8, bedrooms: 4, bathrooms: 5, available: true, imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&auto=format&fit=crop' },
  5: { id: 5, name: 'Heritage Farm Resort', location: 'Rajasthan', pricePerDay: 4000, maxGuests: 6, bedrooms: 3, bathrooms: 4, available: true, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop' },
};

const ADDON_LIST = [
  { key: 'chef',      icon: '👨‍🍳', label: 'Private Chef',       desc: 'Personalised meals all day',  price: 1800, perUnit: 'per guest/night' },
  { key: 'bonfire',   icon: '🪵', label: 'Bonfire Setup',        desc: 'Firewood & pit arrangement',  price: 1500, perUnit: 'flat' },
  { key: 'dj',        icon: '🎵', label: 'DJ Sound System',      desc: 'Pro audio + lights',          price: 4000, perUnit: 'flat' },
  { key: 'adventure', icon: '🛶', label: 'Adventure Tour',       desc: 'Guided trekking / kayaking',  price: 2500, perUnit: 'flat' },
  { key: 'decor',     icon: '🌸', label: 'Floral Decoration',    desc: 'Elegant garden arrangement',  price: 2000, perUnit: 'flat' },
  { key: 'spa',       icon: '💆', label: 'Spa & Wellness',       desc: '2-hour couple spa session',   price: 3500, perUnit: 'flat' },
];

const PAYMENT_METHODS = [
  { key: 'CARD',        icon: '💳', label: 'Credit / Debit Card',   desc: 'Visa, Mastercard, RuPay' },
  { key: 'UPI',         icon: '📱', label: 'UPI',                   desc: 'GPay, PhonePe, Paytm' },
  { key: 'NET_BANKING', icon: '🏦', label: 'Net Banking',           desc: 'All major banks supported' },
  { key: 'WALLET',      icon: '👝', label: 'Wallet',                desc: 'Paytm, Amazon Pay' },
];

const STEPS = ['📅 Dates & Guests', '✨ Add-ons', '💳 Payment'];

function BookingPage({ user }) {
  const { farmhouseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [farmhouse, setFarmhouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingDone, setBookingDone] = useState(false);

  // Prefill from FarmHouseDetail calculator (if user clicked Book Now there)
  const prefilled = location.state || {};

  const [startDate, setStartDate] = useState(prefilled.prefilledStartDate || '');
  const [endDate, setEndDate]     = useState(prefilled.prefilledEndDate   || '');
  const [guests, setGuests]       = useState(prefilled.prefilledGuests    || 1);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [addons, setAddons] = useState(
    prefilled.prefilledAddons || { chef: false, bonfire: false, dj: false, adventure: false, decor: false, spa: false }
  );
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  useEffect(() => {
    fetchFarmhouseDetails();
  }, [farmhouseId]);

  const fetchFarmhouseDetails = async () => {
    try {
      const response = await farmhouseAPI.getFarmHouseById(farmhouseId);
      if (response.data.success) {
        setFarmhouse(response.data.farmhouse);
      } else {
        setFarmhouse(DEMO_FARMHOUSES[parseInt(farmhouseId)] || DEMO_FARMHOUSES[1]);
      }
    } catch {
      setFarmhouse(DEMO_FARMHOUSES[parseInt(farmhouseId)] || DEMO_FARMHOUSES[1]);
    } finally {
      setLoading(false);
    }
  };

  // ── Calculations ──────────────────────────────
  const nights = (() => {
    if (!startDate || !endDate) return 0;
    const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000);
    return diff > 0 ? diff : 0;
  })();

  const baseCost   = (farmhouse?.pricePerDay || 0) * nights;
  const chefCost   = addons.chef ? 1800 * guests * Math.max(nights, 1) : 0;
  const flatCost   =
    (addons.bonfire   ? 1500 : 0) +
    (addons.dj        ? 4000 : 0) +
    (addons.adventure ? 2500 : 0) +
    (addons.decor     ? 2000 : 0) +
    (addons.spa       ? 3500 : 0);
  const subtotal   = baseCost + chefCost + flatCost;
  const gst        = Math.round(subtotal * 0.18);
  const serviceFee = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst + serviceFee;

  // ── Step Validation ───────────────────────────
  const step0Valid = startDate && endDate && nights > 0 && guests >= 1;

  const handleNext = () => {
    if (currentStep === 0 && !step0Valid) {
      setError('Please select valid check-in and check-out dates.');
      return;
    }
    setError('');
    setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(s => s - 1);
  };

  const toggleAddon = (key) => setAddons(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Submit ────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    setBookingLoading(true);
    try {
      const availability = await bookingAPI.checkAvailability(farmhouseId, startDate, endDate);
      if (!availability.data.available) {
        setError('This farmhouse is not available for the selected dates. Please try different dates.');
        setBookingLoading(false);
        return;
      }

      const addonsText = Object.entries(addons)
        .filter(([, v]) => v)
        .map(([k]) => ADDON_LIST.find(a => a.key === k)?.label)
        .filter(Boolean)
        .join(', ');

      const bookingReq = {
        farmHouseId: parseInt(farmhouseId),
        startDate,
        endDate,
        numberOfGuests: parseInt(guests),
        specialRequirements: [specialRequirements, addonsText ? `Add-ons: ${addonsText}` : ''].filter(Boolean).join(' | '),
      };

      const bookingRes = await bookingAPI.createBooking(bookingReq, user.id);
      if (bookingRes.data.success) {
        const bookingId = bookingRes.data.booking.id;
        const paymentRes = await paymentAPI.createPayment({ bookingId, paymentMethod });
        if (paymentRes.data.success) {
          await paymentAPI.processPayment(paymentRes.data.payment.id);
          setBookingDone(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────
  const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const today = new Date().toISOString().split('T')[0];

  // ── Loading ───────────────────────────────────
  if (loading) {
    return (
      <div className="bk-loader">
        <div className="bk-spinner" />
        <p>Loading farmhouse details…</p>
      </div>
    );
  }

  if (!farmhouse) {
    return (
      <div className="bk-error-screen">
        <span>🏚️</span>
        <h2>Farmhouse not found</h2>
        <button onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  // ── Success Screen ────────────────────────────
  if (bookingDone) {
    return (
      <div className="bk-success-screen">
        <div className="bk-success-card">
          <div className="bk-success-icon">🎉</div>
          <h2>Booking Confirmed!</h2>
          <p>Your stay at <strong>{farmhouse.name}</strong> is all set.<br />Check your email for confirmation details.</p>
          <div className="bk-success-details">
            <div className="bk-succ-row"><span>📅 Check-in</span><strong>{fmt(startDate)}</strong></div>
            <div className="bk-succ-row"><span>📅 Check-out</span><strong>{fmt(endDate)}</strong></div>
            <div className="bk-succ-row"><span>🌙 Nights</span><strong>{nights}</strong></div>
            <div className="bk-succ-row"><span>👥 Guests</span><strong>{guests}</strong></div>
            <div className="bk-succ-divider"/>
            <div className="bk-succ-row bk-succ-total"><span>💰 Total Paid</span><strong>₹{grandTotal.toLocaleString()}</strong></div>
          </div>
          <div className="bk-success-btns">
            <button className="bk-btn-primary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
            <button className="bk-btn-outline" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ─────────────────────────────────
  return (
    <div className="bk-page">

      {/* Hero */}
      <div className="bk-hero" style={{ backgroundImage: `url(${farmhouse.imageUrl || ''})` }}>
        <div className="bk-hero-overlay" />
        <div className="bk-hero-content">
          <button className="bk-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <h1>Book Your Stay</h1>
          <p className="bk-hero-name">{farmhouse.name}</p>
          <p className="bk-hero-loc">📍 {farmhouse.location}</p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bk-steps-bar">
        {STEPS.map((label, i) => (
          <div key={i} className={`bk-step ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`}>
            <div className="bk-step-circle">
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className="bk-step-label">{label}</span>
            {i < STEPS.length - 1 && <div className={`bk-step-line ${i < currentStep ? 'done' : ''}`} />}
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="bk-layout">

        {/* ── LEFT: Form ── */}
        <div className="bk-form-col">

          {error && (
            <div className="bk-error-banner">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* STEP 0 — Dates & Guests */}
          {currentStep === 0 && (
            <div className="bk-panel">
              <div className="bk-panel-header">
                <span className="bk-panel-icon">📅</span>
                <div>
                  <h2>When are you going?</h2>
                  <p>Pick your check-in and check-out dates</p>
                </div>
              </div>

              <div className="bk-date-row">
                <div className="bk-field">
                  <label>Check-in Date</label>
                  <div className="bk-date-input-wrap">
                    <span className="bk-field-icon">🛬</span>
                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value >= endDate) setEndDate(''); }}
                    />
                  </div>
                </div>
                <div className="bk-field">
                  <label>Check-out Date</label>
                  <div className="bk-date-input-wrap">
                    <span className="bk-field-icon">🛫</span>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || today}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {nights > 0 && (
                <div className="bk-nights-chip">
                  🌙 <strong>{nights} night{nights > 1 ? 's' : ''}</strong> — {fmt(startDate)} to {fmt(endDate)}
                </div>
              )}

              {/* Guest Stepper */}
              <div className="bk-field bk-guest-field">
                <label>Number of Guests <span className="bk-label-sub">(Max {farmhouse.maxGuests})</span></label>
                <div className="bk-guest-stepper">
                  <button
                    type="button"
                    className="bk-step-btn"
                    onClick={() => setGuests(g => Math.max(1, g - 1))}
                    disabled={guests <= 1}
                  >−</button>
                  <div className="bk-guest-display">
                    <span className="bk-guest-num">{guests}</span>
                    <span className="bk-guest-lbl">Guest{guests > 1 ? 's' : ''}</span>
                  </div>
                  <button
                    type="button"
                    className="bk-step-btn"
                    onClick={() => setGuests(g => Math.min(farmhouse.maxGuests, g + 1))}
                    disabled={guests >= farmhouse.maxGuests}
                  >+</button>
                </div>
                {/* Guest visual dots */}
                <div className="bk-guest-dots">
                  {Array.from({ length: farmhouse.maxGuests }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`bk-guest-dot ${i < guests ? 'filled' : ''}`}
                      onClick={() => setGuests(i + 1)}
                      title={`${i + 1} guest${i > 0 ? 's' : ''}`}
                    >
                      {i < guests ? '👤' : '○'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Requirements */}
              <div className="bk-field">
                <label>Special Requests <span className="bk-label-sub">(Optional)</span></label>
                <textarea
                  value={specialRequirements}
                  onChange={e => setSpecialRequirements(e.target.value)}
                  placeholder="Early check-in, dietary preferences, baby cot, anniversary decoration…"
                  rows={3}
                />
              </div>

              <button className="bk-btn-next" onClick={handleNext} disabled={!step0Valid}>
                Continue to Add-ons →
              </button>
            </div>
          )}

          {/* STEP 1 — Add-ons */}
          {currentStep === 1 && (
            <div className="bk-panel">
              <div className="bk-panel-header">
                <span className="bk-panel-icon">✨</span>
                <div>
                  <h2>Enhance Your Stay</h2>
                  <p>Select premium add-ons to make your visit unforgettable</p>
                </div>
              </div>

              <div className="bk-addons-grid">
                {ADDON_LIST.map(addon => (
                  <div
                    key={addon.key}
                    className={`bk-addon-card ${addons[addon.key] ? 'selected' : ''}`}
                    onClick={() => toggleAddon(addon.key)}
                  >
                    <div className="bk-addon-check">{addons[addon.key] ? '✓' : ''}</div>
                    <div className="bk-addon-icon">{addon.icon}</div>
                    <div className="bk-addon-info">
                      <strong>{addon.label}</strong>
                      <span>{addon.desc}</span>
                    </div>
                    <div className="bk-addon-price">
                      ₹{addon.price.toLocaleString()}
                      <small>{addon.perUnit}</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bk-btn-row">
                <button className="bk-btn-back" onClick={handleBack}>← Back</button>
                <button className="bk-btn-next" onClick={handleNext}>Continue to Payment →</button>
              </div>
            </div>
          )}

          {/* STEP 2 — Payment */}
          {currentStep === 2 && (
            <div className="bk-panel">
              <div className="bk-panel-header">
                <span className="bk-panel-icon">💳</span>
                <div>
                  <h2>Select Payment Method</h2>
                  <p>Your payment is secured with 256-bit SSL encryption 🔒</p>
                </div>
              </div>

              <div className="bk-payment-grid">
                {PAYMENT_METHODS.map(pm => (
                  <div
                    key={pm.key}
                    className={`bk-payment-card ${paymentMethod === pm.key ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(pm.key)}
                  >
                    <div className="bk-pm-icon">{pm.icon}</div>
                    <div className="bk-pm-info">
                      <strong>{pm.label}</strong>
                      <span>{pm.desc}</span>
                    </div>
                    <div className="bk-pm-radio">{paymentMethod === pm.key ? '●' : '○'}</div>
                  </div>
                ))}
              </div>

              <div className="bk-security-strip">
                <span>🔒 Encrypted</span>
                <span>🛡️ PCI Compliant</span>
                <span>↩️ Easy Refunds</span>
                <span>✅ Instant Confirm</span>
              </div>

              <div className="bk-btn-row">
                <button className="bk-btn-back" onClick={handleBack}>← Back</button>
                <button
                  className="bk-btn-pay"
                  onClick={handleSubmit}
                  disabled={bookingLoading}
                >
                  {bookingLoading
                    ? <span className="bk-loading-dots"><span /><span /><span /></span>
                    : `🎉 Pay ₹${grandTotal.toLocaleString()} & Confirm Booking`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Live Receipt ── */}
        <div className="bk-receipt-col">
          <div className="bk-receipt">
            {/* Property Info */}
            <div className="bk-receipt-property">
              <img
                src={farmhouse.imageUrl || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400'}
                alt={farmhouse.name}
              />
              <div className="bk-receipt-prop-info">
                <strong>{farmhouse.name}</strong>
                <span>📍 {farmhouse.location}</span>
                <span>₹{farmhouse.pricePerDay?.toLocaleString()} / night</span>
              </div>
            </div>

            <div className="bk-receipt-divider" />

            {/* Date Summary */}
            <div className="bk-receipt-section">
              <div className="bk-rcpt-row">
                <span>🛬 Check-in</span>
                <strong>{fmt(startDate)}</strong>
              </div>
              <div className="bk-rcpt-row">
                <span>🛫 Check-out</span>
                <strong>{fmt(endDate)}</strong>
              </div>
              <div className="bk-rcpt-row">
                <span>🌙 Nights</span>
                <strong>{nights || '—'}</strong>
              </div>
              <div className="bk-rcpt-row">
                <span>👥 Guests</span>
                <strong>{guests}</strong>
              </div>
            </div>

            <div className="bk-receipt-divider" />

            {/* Price Breakdown */}
            <div className="bk-receipt-section">
              <div className="bk-rcpt-row">
                <span>Base Cost{nights > 0 ? ` (${nights}n)` : ''}</span>
                <strong>₹{baseCost.toLocaleString()}</strong>
              </div>
              {chefCost > 0 && (
                <div className="bk-rcpt-row">
                  <span>👨‍🍳 Chef</span>
                  <strong>₹{chefCost.toLocaleString()}</strong>
                </div>
              )}
              {flatCost > 0 && (
                <div className="bk-rcpt-row">
                  <span>✨ Add-ons</span>
                  <strong>₹{flatCost.toLocaleString()}</strong>
                </div>
              )}
              {/* Active addons list */}
              {Object.entries(addons).filter(([,v]) => v).map(([k]) => {
                const a = ADDON_LIST.find(x => x.key === k);
                return a ? (
                  <div key={k} className="bk-rcpt-addon">
                    <span>{a.icon} {a.label}</span>
                  </div>
                ) : null;
              })}
              <div className="bk-rcpt-row">
                <span>GST (18%)</span>
                <strong>₹{gst.toLocaleString()}</strong>
              </div>
              <div className="bk-rcpt-row">
                <span>Service Fee (5%)</span>
                <strong>₹{serviceFee.toLocaleString()}</strong>
              </div>
            </div>

            <div className="bk-receipt-divider dotted" />

            {/* Grand Total */}
            <div className="bk-rcpt-total">
              <span>Total Amount</span>
              <strong>₹{grandTotal.toLocaleString()}</strong>
            </div>

            {/* Per person */}
            {grandTotal > 0 && nights > 0 && (
              <p className="bk-rcpt-per-person">
                ≈ ₹{Math.round(grandTotal / guests).toLocaleString()} per person
              </p>
            )}

            {/* Trust badges */}
            <div className="bk-trust-badges">
              <span>🔒 SSL Secure</span>
              <span>↩️ Free Cancel</span>
              <span>⚡ Instant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
