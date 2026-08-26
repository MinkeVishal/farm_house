import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { farmhouseAPI, bookingAPI } from '../api/axiosInstance';
import './OwnerDashboard.css';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 18, stroke = 'currentColor', fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const ICONS = {
  overview:   'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  farmhouse:  'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  bookings:   'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  revenue:    'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  profile:    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  add:        'M12 5v14M5 12h14',
  edit:       'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  delete:     'M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6',
  pin:        'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7v.01',
  bed:        'M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 16h20',
  guests:     'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm9 2l2 2 4-4',
  calendar:   'M8 2v4M16 2v4M3 10h18M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  search:     'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0',
  check:      'M20 6L9 17l-5-5',
  close:      'M18 6L6 18M6 6l12 12',
  menu:       'M3 12h18M3 6h18M3 18h18',
  chevron:    'M9 18l6-6-6-6',
  bell:       'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  refresh:    'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  star:       'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  cancel:     'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  bath:       'M9 6l.01 0M9 11l.01 0M13 6l.01 0M13 11l.01 0M5 21h14M5 3h14M19 21V3M5 21V3',
  tag:        'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  chart:      'M18 20V10M12 20V4M6 20v-6',
};

// ─── Toast System ─────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, addToast };
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  const icons = { success: '✅', error: '❌', info: '💡' };
  return (
    <div className="od-toast">
      {toasts.map(t => (
        <div key={t.id} className={`od-toast-item ${t.type}`}>
          <span className="od-toast-icon">{icons[t.type]}</span>
          <span className="od-toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function formatGalleryUrls(value) {
  if (!value) return '';
  if (Array.isArray(value)) return value.join('\n');
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join('\n') : String(parsed);
  } catch {
    return value;
  }
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeGalleryValue(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || '[]');
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Keep compatibility with older line-separated values.
  }
  return String(value || '').split('\n').map(url => url.trim()).filter(Boolean);
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="od-confirm">
      <div className="od-confirm-box">
        <div className="od-confirm-icon">⚠️</div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="od-confirm-actions">
          <button className="od-btn od-btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="od-btn od-btn-danger" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedNum({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = parseFloat(value) || 0;
    const duration = 800;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(current);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  const formatted = Number.isInteger(parseFloat(value))
    ? Math.round(display).toLocaleString()
    : display.toFixed(2);
  return <>{prefix}{formatted}{suffix}</>;
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
function FarmHouseFormModal({ initial, onClose, onSubmit, isEdit = false }) {
  const [form, setForm] = useState({
    name: '', location: '', description: '',
    pricePerDay: '', maxGuests: '', bedrooms: '',
    bathrooms: '', imageUrl: '',
    imageUrls: '',
    amenities: '["WiFi","Pool","Garden","Parking"]',
    ...initial,
    imageUrls: formatGalleryUrls(initial?.imageUrls),
  });
  const [galleryUrls, setGalleryUrls] = useState(() => {
    const urls = formatGalleryUrls(initial?.imageUrls).split('\n').filter(Boolean);
    return urls.length ? urls : [''];
  });
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const uploadedImages = await Promise.all(galleryFiles.map(readImageFile));
    await onSubmit({
      ...form,
      imageUrls: JSON.stringify([
        ...galleryUrls.map(url => url.trim()).filter(Boolean),
        ...uploadedImages,
      ]),
      pricePerDay: parseFloat(form.pricePerDay),
      maxGuests: parseInt(form.maxGuests, 10),
      bedrooms: parseInt(form.bedrooms, 10),
      bathrooms: parseInt(form.bathrooms, 10),
    });
    setLoading(false);
  };

  return (
    <div className="od-form-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="od-form-modal">
        <div className="od-form-header">
          <h2>
            <Ico d={isEdit ? ICONS.edit : ICONS.add} size={20} stroke="#7c6ef7" />
            {isEdit ? 'Edit Farm House' : 'Add New Farm House'}
          </h2>
          <button className="od-form-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="od-form-body">
            <div className="od-form-grid">
              <div className="od-form-group">
                <label className="od-form-label">Property Name *</label>
                <input name="name" value={form.name} onChange={handle} required
                  placeholder="Green Valley Estate" className="od-form-input" />
              </div>
              <div className="od-form-group">
                <label className="od-form-label">Location *</label>
                <input name="location" value={form.location} onChange={handle} required
                  placeholder="Pune, Maharashtra" className="od-form-input" />
              </div>
              <div className="od-form-group">
                <label className="od-form-label">Price per Day (₹) *</label>
                <input name="pricePerDay" type="number" value={form.pricePerDay} onChange={handle}
                  required min="0" placeholder="5000" className="od-form-input" />
              </div>
              <div className="od-form-group">
                <label className="od-form-label">Max Guests *</label>
                <input name="maxGuests" type="number" value={form.maxGuests} onChange={handle}
                  required min="1" placeholder="10" className="od-form-input" />
              </div>
              <div className="od-form-group">
                <label className="od-form-label">Bedrooms *</label>
                <input name="bedrooms" type="number" value={form.bedrooms} onChange={handle}
                  required min="0" placeholder="4" className="od-form-input" />
              </div>
              <div className="od-form-group">
                <label className="od-form-label">Bathrooms *</label>
                <input name="bathrooms" type="number" value={form.bathrooms} onChange={handle}
                  required min="0" placeholder="3" className="od-form-input" />
              </div>
              <div className="od-form-group od-form-full">
                <label className="od-form-label">Description</label>
                <textarea name="description" value={form.description} onChange={handle}
                  placeholder="Describe your beautiful property..." rows="3"
                  className="od-form-textarea" />
              </div>
              <div className="od-form-group od-form-full">
                <label className="od-form-label">Image URL</label>
                <input name="imageUrl" type="url" value={form.imageUrl} onChange={handle}
                  placeholder="https://..." className="od-form-input" />
              </div>
              <div className="od-form-group od-form-full">
                <label className="od-form-label">Gallery Photos</label>
                <div>
                  {galleryUrls.map((url, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="url"
                        value={url}
                        onChange={e => setGalleryUrls(p => p.map((item, i) => i === index ? e.target.value : item))}
                        placeholder={`Photo ${index + 1} URL (https://...)`}
                        className="od-form-input"
                      />
                      {galleryUrls.length > 1 && (
                        <button
                          type="button"
                          className="od-btn od-btn-secondary"
                          onClick={() => setGalleryUrls(p => p.filter((_, i) => i !== index))}
                          aria-label={`Remove photo ${index + 1}`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="od-btn od-btn-secondary"
                    onClick={() => setGalleryUrls(p => [...p, ''])}
                  >
                    + Add another photo
                  </button>
                  <label className="od-btn od-btn-secondary" style={{ display: 'inline-flex', marginLeft: '0.5rem', cursor: 'pointer' }}>
                    Choose photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={e => setGalleryFiles(p => [...p, ...Array.from(e.target.files || [])])}
                    />
                  </label>
                  {galleryFiles.length > 0 && (
                    <div style={{ marginTop: '0.55rem', color: 'var(--od-muted)', fontSize: '0.75rem' }}>
                      {galleryFiles.map(file => file.name).join(', ')}
                    </div>
                  )}
                </div>
                <small style={{ color: 'var(--od-muted)', fontSize: '0.72rem', marginTop: '0.3rem' }}>
                  Add multiple photo URLs. Visitors can browse them on the property details page.
                </small>
              </div>
              <div className="od-form-group od-form-full">
                <label className="od-form-label">Amenities (JSON Array)</label>
                <input name="amenities" value={form.amenities} onChange={handle}
                  placeholder='["WiFi","Pool","Garden"]' className="od-form-input" />
                <small style={{ color: 'var(--od-muted)', fontSize: '0.72rem', marginTop: '0.3rem' }}>
                  Enter as JSON array e.g. ["WiFi","Pool","Garden","BBQ"]
                </small>
              </div>
            </div>
          </div>
          <div className="od-form-footer">
            <button type="button" className="od-btn od-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="od-btn od-btn-primary" disabled={loading}>
              {loading ? '⏳ Saving...' : isEdit ? '✔ Update Property' : '✚ Add Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, prefix = '', suffix = '', sub, trend, trendUp }) {
  return (
    <div className="od-stat-card">
      <div className="od-stat-icon">
        <Ico d={icon} size={24} stroke="currentColor" />
      </div>
      <p className="od-stat-label">{label}</p>
      <div className="od-stat-value">
        <AnimatedNum value={value} prefix={prefix} suffix={suffix} />
      </div>
      {sub && <p className="od-stat-sub">{sub}</p>}
      {trend !== undefined && (
        <span className={`od-stat-trend ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
      )}
    </div>
  );
}

// ─── Badge Helper ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = (status || '').toUpperCase();
  if (s === 'CONFIRMED' || s === 'APPROVED') return <span className="od-badge od-badge-success">{status}</span>;
  if (s === 'PENDING')  return <span className="od-badge od-badge-warning">{status}</span>;
  if (s === 'CANCELLED' || s === 'REJECTED') return <span className="od-badge od-badge-danger">{status}</span>;
  return <span className="od-badge od-badge-muted">{status}</span>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function OwnerDashboard({ user }) {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [farmhouses, setFarmhouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFH, setEditingFH] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [bookingFilter, setBookingFilter] = useState('ALL');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingTab, setBookingTab] = useState('all');

  const { toasts, addToast } = useToast();

  // ── Fetch Data ──
  const fetchOwnerData = useCallback(async () => {
    try {
      setLoading(true);
      const fhRes = await farmhouseAPI.getFarmHousesByOwner(user.id);
      const fhList = fhRes.data.success ? fhRes.data.farmhouses : [];
      setFarmhouses(fhList);

      if (fhList.length) {
        const bkRes = await Promise.all(
          fhList.map(fh => bookingAPI.getFarmHouseBookings(fh.id).catch(() => null))
        );
        let all = [];
        bkRes.forEach(r => { if (r?.data?.success) all = [...all, ...r.data.bookings]; });
        setBookings(all);
      }
    } catch (err) {
      addToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchOwnerData(); }, [fetchOwnerData]);

  useEffect(() => {
    const farmhouseId = location.state?.openGalleryFor;
    if (!farmhouseId || !farmhouses.length) return;
    const farmhouse = farmhouses.find(fh => fh.id === farmhouseId);
    if (farmhouse) {
      setActiveSection('farmhouses');
      setEditingFH(farmhouse);
      routerNavigate(location.pathname, { replace: true, state: {} });
    }
  }, [farmhouses, location.pathname, location.state, routerNavigate]);

  // ── Add Farm House ──
  const handleAddFH = async (formData) => {
    try {
      const payload = {
        ...formData,
        imageUrls: JSON.stringify(normalizeGalleryValue(formData.imageUrls)),
      };
      const res = await farmhouseAPI.addFarmHouse(payload, user.id);
      if (res.data.success) {
        addToast('Farm house added! Waiting for approval.', 'success');
        setShowAddForm(false);
        fetchOwnerData();
      }
    } catch { addToast('Failed to add farm house', 'error'); }
  };

  // ── Update Farm House ──
  const handleUpdateFH = async (formData) => {
    try {
      const payload = {
        ...formData,
        imageUrls: JSON.stringify(normalizeGalleryValue(formData.imageUrls)),
      };
      const res = await farmhouseAPI.updateFarmHouse(editingFH.id, payload, user.id);
      if (res.data.success) {
        addToast('Farm house updated!', 'success');
        setEditingFH(null);
        fetchOwnerData();
      }
    } catch (e) { addToast(e.response?.data?.message || 'Update failed', 'error'); }
  };

  // ── Delete Farm House ──
  const handleDeleteFH = async (id) => {
    try {
      await farmhouseAPI.deleteFarmHouse(id, user.id);
      addToast('Farm house deleted', 'success');
      setConfirmDelete(null);
      fetchOwnerData();
    } catch (e) { addToast(e.response?.data?.message || 'Delete failed', 'error'); }
  };

  // ── Cancel Booking ──
  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingAPI.cancelBooking(bookingId);
      addToast('Booking cancelled', 'success');
      fetchOwnerData();
    } catch { addToast('Failed to cancel booking', 'error'); }
  };

  // ─ Derived Stats ─
  const approved = farmhouses.filter(f => f.isApproved);
  const pending  = farmhouses.filter(f => !f.isApproved);
  const totalRevenue = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
  const confirmedBk  = bookings.filter(b => b.status === 'CONFIRMED');
  const pendingBk    = bookings.filter(b => b.status === 'PENDING');

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    const matchFilter = bookingFilter === 'ALL' || b.status?.toUpperCase() === bookingFilter;
    const matchSearch = !bookingSearch ||
      b.farmHouseName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.userName?.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Navigation items
  const navItems = [
    { id: 'overview',   label: 'Overview',       icon: ICONS.overview,   badge: null },
    { id: 'farmhouses', label: 'My Properties',  icon: ICONS.farmhouse,  badge: farmhouses.length || null },
    { id: 'bookings',   label: 'Bookings',        icon: ICONS.bookings,   badge: pendingBk.length || null, badgeType: 'warning' },
    { id: 'revenue',    label: 'Revenue',         icon: ICONS.revenue,    badge: null },
    { id: 'profile',    label: 'My Profile',      icon: ICONS.profile,    badge: null },
  ];

  const navigate = (section) => {
    setActiveSection(section);
    setMobileOpen(false);
  };

  if (loading) return (
    <div className="od-loading">
      <div className="od-loading-inner">
        <div className="od-spinner" />
        <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.9rem' }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="od-root">
      {/* Mobile overlay */}
      <div className={`od-mobile-overlay ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* ── SIDEBAR ── */}
      <aside className={`od-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="od-sidebar-header">
          <div className="od-sidebar-logo">🌾</div>
          <div className="od-sidebar-title">
            <h2>FarmEstate</h2>
            <span>Owner Portal</span>
          </div>
          <button className="od-sidebar-toggle" onClick={() => setSidebarCollapsed(p => !p)}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
            <Ico d={sidebarCollapsed ? ICONS.chevron : 'M15 18l-6-6 6-6'} size={14} />
          </button>
        </div>

        <nav className="od-sidebar-nav">
          <div className="od-nav-section">
            <div className="od-nav-section-label">Navigation</div>
            {navItems.map(item => (
              <div key={item.id}
                className={`od-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
                title={item.label}>
                <div className="od-nav-icon">
                  <Ico d={item.icon} size={18} />
                </div>
                <span className="od-nav-label">{item.label}</span>
                {item.badge && (
                  <span className={`od-nav-badge ${item.badgeType || ''}`}>{item.badge}</span>
                )}
              </div>
            ))}
          </div>

          <div className="od-nav-section" style={{ marginTop: '0.5rem' }}>
            <div className="od-nav-section-label">Quick Actions</div>
            <div className="od-nav-item" onClick={() => { setShowAddForm(true); navigate('farmhouses'); }}>
              <div className="od-nav-icon"><Ico d={ICONS.add} size={18} /></div>
              <span className="od-nav-label">Add Property</span>
            </div>
            <div className="od-nav-item" onClick={() => { fetchOwnerData(); addToast('Data refreshed!', 'info'); }}>
              <div className="od-nav-icon"><Ico d={ICONS.refresh} size={18} /></div>
              <span className="od-nav-label">Refresh Data</span>
            </div>
          </div>
        </nav>

        <div className="od-sidebar-footer">
          <div className="od-user-card">
            <div className="od-user-avatar">{(user.name || 'O')[0].toUpperCase()}</div>
            <div className="od-user-info">
              <strong>{user.name}</strong>
              <span>Owner</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={`od-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Bar */}
        <header className="od-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="od-hamburger" onClick={() => setMobileOpen(p => !p)}>
              <Ico d={ICONS.menu} size={18} />
            </button>
            <div className="od-topbar-left">
              <h1>{navItems.find(n => n.id === activeSection)?.label || 'Dashboard'}</h1>
              <p>Welcome back, {user.name} 👋</p>
            </div>
          </div>
          <div className="od-topbar-right">
            <button className="od-topbar-btn" onClick={fetchOwnerData} title="Refresh">
              <Ico d={ICONS.refresh} size={17} />
            </button>
            <button className="od-topbar-btn" title="Notifications">
              <Ico d={ICONS.bell} size={17} />
              {pendingBk.length > 0 && <span className="od-notif-dot" />}
            </button>
            <button className="od-btn od-btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              onClick={() => { setShowAddForm(true); navigate('farmhouses'); }}>
              <Ico d={ICONS.add} size={15} /> Add Property
            </button>
          </div>
        </header>

        <div className="od-content">
          {/* ══════════ OVERVIEW ══════════ */}
          {activeSection === 'overview' && (
            <div>
              {/* Stats */}
              <div className="od-stats-grid">
                <StatCard icon={ICONS.farmhouse} label="Total Properties" value={farmhouses.length}
                  sub={`${approved.length} approved · ${pending.length} pending`} />
                <StatCard icon={ICONS.bookings}  label="Total Bookings"   value={bookings.length}
                  sub={`${confirmedBk.length} confirmed`} />
                <StatCard icon={ICONS.revenue}   label="Total Revenue"    value={totalRevenue}
                  prefix="₹" sub="Lifetime earnings" />
                <StatCard icon={ICONS.guests}    label="Pending Bookings" value={pendingBk.length}
                  sub="Need attention" />
              </div>

              {/* Two-col overview */}
              <div className="od-overview-grid">
                {/* Recent Bookings */}
                <div className="od-card">
                  <div className="od-card-header">
                    <div className="od-card-title">
                      <Ico d={ICONS.bookings} size={18} stroke="#7c6ef7" /> Recent Bookings
                    </div>
                    <button className="od-btn od-btn-secondary od-btn-sm"
                      onClick={() => navigate('bookings')}>View All</button>
                  </div>
                  <div className="od-table-wrap">
                    <table className="od-table">
                      <thead>
                        <tr>
                          <th>Guest</th>
                          <th>Property</th>
                          <th>Dates</th>
                          <th>Status</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).length === 0 ? (
                          <tr><td colSpan={5}>
                            <div className="od-empty" style={{ padding: '1.5rem' }}>
                              <span className="od-empty-icon" style={{ fontSize: '2rem' }}>📋</span>
                              <p>No bookings yet</p>
                            </div>
                          </td></tr>
                        ) : bookings.slice(0, 5).map(b => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 600 }}>{b.userName || '—'}</td>
                            <td style={{ color: 'var(--od-muted)', fontSize: '0.8rem' }}>{b.farmHouseName || '—'}</td>
                            <td style={{ color: 'var(--od-muted)', fontSize: '0.78rem' }}>
                              {b.startDate} → {b.endDate}
                            </td>
                            <td><StatusBadge status={b.status} /></td>
                            <td style={{ fontWeight: 700, color: '#22c55e' }}>₹{b.totalPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Properties Summary */}
                <div className="od-card">
                  <div className="od-card-header">
                    <div className="od-card-title">
                      <Ico d={ICONS.farmhouse} size={18} stroke="#7c6ef7" /> Your Properties
                    </div>
                    <button className="od-btn od-btn-success od-btn-sm"
                      onClick={() => { setShowAddForm(true); navigate('farmhouses'); }}>
                      + Add New
                    </button>
                  </div>
                  <div className="od-card-body">
                    {farmhouses.length === 0 ? (
                      <div className="od-empty">
                        <span className="od-empty-icon">🏡</span>
                        <h3>No properties yet</h3>
                        <p>Add your first farm house to start receiving bookings</p>
                        <button className="od-btn od-btn-primary" style={{ marginTop: '1rem' }}
                          onClick={() => { setShowAddForm(true); navigate('farmhouses'); }}>
                          <Ico d={ICONS.add} size={15} /> Add Property
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {farmhouses.slice(0, 5).map(fh => (
                          <div key={fh.id} style={{
                            display: 'flex', alignItems: 'center', gap: '0.9rem',
                            padding: '0.75rem', background: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px', border: '1px solid var(--od-border)',
                          }}>
                            <div style={{
                              width: 48, height: 48, borderRadius: 10, overflow: 'hidden',
                              background: 'linear-gradient(135deg,#1a1d3d,#302b63)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.4rem', flexShrink: 0,
                            }}>
                              {fh.imageUrl ? <img src={fh.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏡'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'white', marginBottom: '0.2rem',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fh.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--od-muted)' }}>
                                📍 {fh.location} · ₹{fh.pricePerDay}/day
                              </div>
                            </div>
                            <StatusBadge status={fh.isApproved ? 'APPROVED' : 'PENDING'} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ FARM HOUSES ══════════ */}
          {activeSection === 'farmhouses' && (
            <div>
              <div className="od-section-header">
                <div className="od-section-title">
                  <span>🏡</span> My Properties ({farmhouses.length})
                </div>
                <button className="od-btn od-btn-primary" onClick={() => setShowAddForm(true)}>
                  <Ico d={ICONS.add} size={16} /> Add New Property
                </button>
              </div>

              {/* Tabs: Approved / Pending */}
              <div className="od-tabs">
                <button className={`od-tab ${bookingTab === 'all' ? 'active' : ''}`}
                  onClick={() => setBookingTab('all')}>All ({farmhouses.length})</button>
                <button className={`od-tab ${bookingTab === 'approved' ? 'active' : ''}`}
                  onClick={() => setBookingTab('approved')}>✅ Approved ({approved.length})</button>
                <button className={`od-tab ${bookingTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setBookingTab('pending')}>⏳ Pending ({pending.length})</button>
              </div>

              {/* Grid */}
              {(() => {
                const filtered = bookingTab === 'approved' ? approved
                  : bookingTab === 'pending' ? pending
                  : farmhouses;
                return filtered.length === 0 ? (
                  <div className="od-empty">
                    <span className="od-empty-icon">🏡</span>
                    <h3>No properties here</h3>
                    <p>Add your first farm house to start accepting guests</p>
                    <button className="od-btn od-btn-primary" style={{ marginTop: '1rem' }}
                      onClick={() => setShowAddForm(true)}>
                      <Ico d={ICONS.add} size={15} /> Add Property
                    </button>
                  </div>
                ) : (
                  <div className="od-fh-grid">
                    {filtered.map(fh => {
                      let amenities = [];
                      try { amenities = JSON.parse(fh.amenities || '[]'); } catch {}
                      const fhBookings = bookings.filter(b => b.farmHouseId === fh.id || b.farmHouseName === fh.name);
                      return (
                        <div key={fh.id} className="od-fh-card">
                          <div className="od-fh-img">
                            {fh.imageUrl
                              ? <img src={fh.imageUrl} alt={fh.name} onError={e => { e.target.style.display = 'none'; }} />
                              : '🌄'}
                          </div>
                          <div className="od-fh-status-chip">
                            <StatusBadge status={fh.isApproved ? 'APPROVED' : 'PENDING'} />
                          </div>
                          <div className="od-fh-body">
                            <div className="od-fh-name">{fh.name}</div>
                            <div className="od-fh-location">
                              <Ico d={ICONS.pin} size={13} stroke="var(--od-muted)" /> {fh.location}
                            </div>
                            <div className="od-fh-meta">
                              <span className="od-fh-meta-item">🛏 {fh.bedrooms} Beds</span>
                              <span className="od-fh-meta-item">🚿 {fh.bathrooms} Baths</span>
                              <span className="od-fh-meta-item">👥 {fh.maxGuests} Guests</span>
                              <span className="od-fh-meta-item">📋 {fhBookings.length} Bookings</span>
                            </div>
                            {amenities.length > 0 && (
                              <div className="od-amenity-tags">
                                {amenities.slice(0, 4).map(a => (
                                  <span key={a} className="od-amenity-tag">{a}</span>
                                ))}
                                {amenities.length > 4 && (
                                  <span className="od-amenity-tag">+{amenities.length - 4}</span>
                                )}
                              </div>
                            )}
                            <div className="od-fh-price">
                              ₹{fh.pricePerDay?.toLocaleString()} <span>/ night</span>
                            </div>
                            <div className="od-fh-footer">
                              <button className="od-btn od-btn-secondary od-btn-sm"
                                onClick={() => setEditingFH(fh)}>
                                <Ico d={ICONS.farmhouse} size={13} /> Manage Gallery
                              </button>
                              <button className="od-btn od-btn-secondary od-btn-sm"
                                onClick={() => setEditingFH(fh)}>
                                <Ico d={ICONS.edit} size={13} /> Edit
                              </button>
                              <button className="od-btn od-btn-danger od-btn-sm"
                                onClick={() => setConfirmDelete(fh)}>
                                <Ico d={ICONS.delete} size={13} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ══════════ BOOKINGS ══════════ */}
          {activeSection === 'bookings' && (
            <div>
              <div className="od-section-header">
                <div className="od-section-title">
                  <span>📋</span> All Bookings ({bookings.length})
                </div>
              </div>

              {/* Filters */}
              <div className="od-booking-filters" style={{ marginBottom: '1.25rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    className="od-search-input"
                    placeholder="🔍  Search guest or property..."
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                  />
                </div>
                {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(f => (
                  <button key={f}
                    className={`od-filter-btn ${bookingFilter === f ? 'active' : ''}`}
                    onClick={() => setBookingFilter(f)}>
                    {f === 'ALL' ? '🗂 All' : f === 'PENDING' ? '⏳ Pending' : f === 'CONFIRMED' ? '✅ Confirmed' : '❌ Cancelled'}
                    <span style={{ marginLeft: 4, opacity: 0.7, fontSize: '0.7rem' }}>
                      ({f === 'ALL' ? bookings.length : bookings.filter(b => b.status === f).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Booking Table */}
              <div className="od-card">
                <div className="od-table-wrap">
                  <table className="od-table">
                    <thead>
                      <tr>
                        <th>#ID</th>
                        <th>Guest</th>
                        <th>Property</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Guests</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={9}>
                            <div className="od-empty" style={{ padding: '2rem' }}>
                              <span className="od-empty-icon" style={{ fontSize: '2.5rem' }}>📭</span>
                              <h3>No bookings found</h3>
                              <p>Try adjusting your filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredBookings.map((b, idx) => (
                        <tr key={b.id}>
                          <td style={{ color: 'var(--od-muted)', fontSize: '0.78rem' }}>#{b.id}</td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>{b.userName || '—'}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.82rem', color: 'var(--od-muted)' }}>{b.farmHouseName || '—'}</div>
                          </td>
                          <td style={{ fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Ico d={ICONS.calendar} size={13} stroke="var(--od-muted)" />
                              {b.startDate}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Ico d={ICONS.calendar} size={13} stroke="var(--od-muted)" />
                              {b.endDate}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>{b.numberOfGuests || '—'}</td>
                          <td style={{ fontWeight: 700, color: '#22c55e' }}>₹{b.totalPrice?.toLocaleString()}</td>
                          <td><StatusBadge status={b.status} /></td>
                          <td>
                            <div className="od-table-actions">
                              {b.status === 'PENDING' && (
                                <button className="od-btn od-btn-danger od-btn-sm"
                                  onClick={() => handleCancelBooking(b.id)}
                                  title="Cancel Booking">
                                  <Ico d={ICONS.close} size={13} /> Cancel
                                </button>
                              )}
                              {b.status !== 'PENDING' && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--od-muted)' }}>—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ REVENUE ══════════ */}
          {activeSection === 'revenue' && (
            <div>
              <div className="od-section-title" style={{ marginBottom: '1.5rem' }}>
                <span>💰</span> Revenue Overview
              </div>

              {/* Summary */}
              <div className="od-revenue-summary">
                <div className="od-rev-item">
                  <div className="od-rev-item-label">Total Revenue</div>
                  <div className="od-rev-item-value" style={{ color: '#22c55e' }}>
                    ₹<AnimatedNum value={totalRevenue} />
                  </div>
                </div>
                <div className="od-rev-item">
                  <div className="od-rev-item-label">Avg per Booking</div>
                  <div className="od-rev-item-value" style={{ color: '#a78bfa' }}>
                    ₹<AnimatedNum value={bookings.length ? (totalRevenue / bookings.length).toFixed(0) : 0} />
                  </div>
                </div>
                <div className="od-rev-item">
                  <div className="od-rev-item-label">Confirmed Rev.</div>
                  <div className="od-rev-item-value" style={{ color: '#fbbf24' }}>
                    ₹<AnimatedNum value={confirmedBk.reduce((s, b) => s + (b.totalPrice || 0), 0)} />
                  </div>
                </div>
                <div className="od-rev-item">
                  <div className="od-rev-item-label">Bookings Count</div>
                  <div className="od-rev-item-value">
                    <AnimatedNum value={bookings.length} />
                  </div>
                </div>
              </div>

              {/* Revenue by property */}
              <div className="od-card">
                <div className="od-card-header">
                  <div className="od-card-title">
                    <Ico d={ICONS.chart} size={18} stroke="#7c6ef7" /> Revenue by Property
                  </div>
                </div>
                <div className="od-card-body">
                  {farmhouses.length === 0 ? (
                    <div className="od-empty">
                      <span className="od-empty-icon">📊</span>
                      <h3>No data available</h3>
                      <p>Add properties and get bookings to see revenue breakdown</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {farmhouses.map(fh => {
                        const fhBks = bookings.filter(b => b.farmHouseName === fh.name);
                        const fhRev = fhBks.reduce((s, b) => s + (b.totalPrice || 0), 0);
                        const maxRev = Math.max(1, ...farmhouses.map(f => {
                          const fb = bookings.filter(b => b.farmHouseName === f.name);
                          return fb.reduce((s, b) => s + (b.totalPrice || 0), 0);
                        }));
                        const pct = Math.round((fhRev / maxRev) * 100);
                        return (
                          <div key={fh.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{fh.name}</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#22c55e' }}>
                                ₹{fhRev.toLocaleString()} ({fhBks.length} bookings)
                              </span>
                            </div>
                            <div style={{
                              height: 8, background: 'rgba(255,255,255,0.06)',
                              borderRadius: 8, overflow: 'hidden',
                            }}>
                              <div style={{
                                height: '100%', width: `${pct}%`,
                                background: 'linear-gradient(90deg,#7c6ef7,#a78bfa)',
                                borderRadius: 8,
                                transition: 'width 1s ease',
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Booking breakdown table */}
              <div className="od-card" style={{ marginTop: '1.25rem' }}>
                <div className="od-card-header">
                  <div className="od-card-title">
                    <Ico d={ICONS.bookings} size={18} stroke="#7c6ef7" /> All Transactions
                  </div>
                </div>
                <div className="od-table-wrap">
                  <table className="od-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Property</th>
                        <th>Guest</th>
                        <th>Duration</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--od-muted)' }}>
                          No transactions yet
                        </td></tr>
                      ) : bookings.map(b => {
                        const days = b.startDate && b.endDate
                          ? Math.max(0, Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / 86400000))
                          : '—';
                        return (
                          <tr key={b.id}>
                            <td style={{ color: 'var(--od-muted)', fontSize: '0.78rem' }}>#{b.id}</td>
                            <td style={{ fontWeight: 600 }}>{b.farmHouseName}</td>
                            <td style={{ color: 'var(--od-muted)' }}>{b.userName}</td>
                            <td style={{ color: 'var(--od-muted)', fontSize: '0.8rem' }}>{days} nights</td>
                            <td style={{ fontWeight: 700, color: '#22c55e' }}>₹{b.totalPrice?.toLocaleString()}</td>
                            <td><StatusBadge status={b.status} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ PROFILE ══════════ */}
          {activeSection === 'profile' && (
            <div>
              <div className="od-section-title" style={{ marginBottom: '1.5rem' }}>
                <span>👤</span> My Profile
              </div>
              <div className="od-profile-section">
                {/* Profile Card */}
                <div className="od-profile-card">
                  <div className="od-profile-avatar">
                    {(user.name || 'O')[0].toUpperCase()}
                  </div>
                  <div className="od-profile-name">{user.name}</div>
                  <div className="od-profile-role">Property Owner</div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--od-muted)', marginBottom: '0.5rem' }}>
                    📧 {user.email}
                  </p>
                  <div className="od-profile-stats">
                    <div className="od-ps-item">
                      <div className="od-ps-value">{farmhouses.length}</div>
                      <div className="od-ps-label">Props</div>
                    </div>
                    <div className="od-ps-item">
                      <div className="od-ps-value">{bookings.length}</div>
                      <div className="od-ps-label">Bookings</div>
                    </div>
                    <div className="od-ps-item">
                      <div className="od-ps-value">{approved.length}</div>
                      <div className="od-ps-label">Live</div>
                    </div>
                  </div>
                </div>

                {/* Info Panel */}
                <div>
                  <div className="od-card" style={{ marginBottom: '1.25rem' }}>
                    <div className="od-card-header">
                      <div className="od-card-title">Account Information</div>
                    </div>
                    <div className="od-card-body">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {[
                          { label: 'Full Name', value: user.name },
                          { label: 'Email', value: user.email },
                          { label: 'User ID', value: `#${user.id}` },
                          { label: 'Role', value: user.role },
                          { label: 'Total Properties', value: farmhouses.length },
                          { label: 'Approved Properties', value: approved.length },
                          { label: 'Total Bookings', value: bookings.length },
                          { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}` },
                        ].map(item => (
                          <div key={item.label} style={{
                            padding: '0.9rem', background: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px', border: '1px solid var(--od-border)',
                          }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                              letterSpacing: '0.5px', color: 'var(--od-muted)', marginBottom: '0.35rem' }}>
                              {item.label}
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="od-card">
                    <div className="od-card-header">
                      <div className="od-card-title">💡 Quick Tips</div>
                    </div>
                    <div className="od-card-body">
                      {[
                        { icon: '🏡', tip: 'Add high-quality images to attract more guests.' },
                        { icon: '💰', tip: 'Competitive pricing leads to higher booking rates.' },
                        { icon: '✅', tip: 'New properties need admin approval before going live.' },
                        { icon: '📋', tip: 'Respond to booking inquiries quickly for better ratings.' },
                      ].map((t, i) => (
                        <div key={i} style={{
                          display: 'flex', gap: '0.75rem', padding: '0.75rem',
                          borderRadius: '10px', marginBottom: '0.5rem',
                          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--od-border)',
                        }}>
                          <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                          <span style={{ fontSize: '0.83rem', color: 'var(--od-muted)', lineHeight: 1.5 }}>{t.tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── MODALS ── */}
      {showAddForm && (
        <FarmHouseFormModal
          initial={{}}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddFH}
          isEdit={false}
        />
      )}

      {editingFH && (
        <FarmHouseFormModal
          initial={editingFH}
          onClose={() => setEditingFH(null)}
          onSubmit={handleUpdateFH}
          isEdit={true}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Property"
          message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
          onConfirm={() => handleDeleteFH(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default OwnerDashboard;
