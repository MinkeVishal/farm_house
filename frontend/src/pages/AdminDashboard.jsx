import React, { useState, useEffect, useRef } from 'react';
import { userAPI, farmhouseAPI, bookingAPI, paymentAPI, discountAPI } from '../api/axiosInstance';
import './AdminDashboard.css';

// ─── Icon Components ──────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm9 2l2 2 4-4',
  farmhouse: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  bookings: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  payments: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  approve: 'M20 6L9 17l-5-5',
  delete: 'M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6',
  add: 'M12 5v14M5 12h14',
  search: 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  menu: 'M3 12h18M3 6h18M3 18h18',
  close: 'M18 6L6 18M6 6l12 12',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  block: 'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  trending: 'M23 6l-9.5 9.5-5-5L1 18',
  calendar: 'M8 2v4M16 2v4M3 10h18M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  check: 'M20 6L9 17l-5-5',
  tag: 'M20.59 13.41 11 23l-9.59-9.59a2 2 0 0 1 0-2.82L10.59 1.4a2 2 0 0 1 1.41-.59H20a2 2 0 0 1 2 2V11a2 2 0 0 1-.59 1.41zM16 6h.01',
  info: 'M12 8h.01M12 11v5M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
};

// ─── Stat Card Component ───────────────────────────────────────────────────────
function StatCard({ title, value, subtitle, iconPath, gradient, trend }) {
  const [count, setCount] = useState(0);
  const num = parseInt(value) || 0;

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(num / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [num]);

  return (
    <div className="adm-stat-card" style={{ background: gradient }}>
      <div className="adm-stat-top">
        <div>
          <p className="adm-stat-title">{title}</p>
          <h2 className="adm-stat-value">{count.toLocaleString()}</h2>
          {subtitle && <p className="adm-stat-subtitle">{subtitle}</p>}
        </div>
        <div className="adm-stat-icon-wrap">
          <Icon d={iconPath} size={26} color="#fff" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="adm-stat-trend">
          <Icon d={icons.trending} size={14} color={trend >= 0 ? '#4ade80' : '#f87171'} />
          <span style={{ color: trend >= 0 ? '#4ade80' : '#f87171' }}>
            {trend >= 0 ? '+' : ''}{trend}% this month
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Mini Bar Chart ────────────────────────────────────────────────────────────
function MiniBarChart({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div className="adm-bar-chart">
      {data.map((v, i) => (
        <div key={i} className="adm-bar-wrap">
          <div
            className="adm-bar"
            style={{ height: `${(v / max) * 100}%`, background: color }}
            title={v}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Modal Component ───────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-header">
          <h3>{title}</h3>
          <button className="adm-modal-close" onClick={onClose}>
            <Icon d={icons.close} size={18} />
          </button>
        </div>
        <div className="adm-modal-body">{children}</div>
      </div>
    </div>
  );
}

// ─── Toast Notification ────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="adm-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`adm-toast adm-toast-${t.type}`}>
          <Icon d={t.type === 'success' ? icons.check : t.type === 'error' ? icons.close : icons.info} size={16} />
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Main AdminDashboard Component ────────────────────────────────────────────
function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalBookings: 0, totalPayments: 0, pendingApprovals: 0 });
  const [farmhouses, setFarmhouses] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountForm, setDiscountForm] = useState({
    title: '', description: '', farmhouseType: 'ALL', farmhouseId: '', discountPercent: '',
    specialOffer: '', validFrom: '', validTo: '', isActive: true,
  });
  const [formData, setFormData] = useState({ name: '', location: '', description: '', pricePerDay: '', maxGuests: '', amenities: '', imageUrl: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null });
  const toastRef = useRef(0);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchDiscounts = async () => {
    setDiscountLoading(true);
    try {
      const response = await discountAPI.getAllDiscounts(currentUser.id);
      setDiscounts(response.data.discounts || []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load discounts', 'error');
    } finally {
      setDiscountLoading(false);
    }
  };

  const openDiscountModal = (discount = null) => {
    setEditingDiscount(discount);
    setDiscountForm(discount ? {
      title: discount.title || '', description: discount.description || '',
      farmhouseType: discount.farmhouseType || 'ALL', farmhouseId: discount.farmhouseId ? String(discount.farmhouseId) : '', discountPercent: discount.discountPercent || '',
      specialOffer: discount.specialOffer || '', validFrom: discount.validFrom || '',
      validTo: discount.validTo || '', isActive: discount.isActive !== false,
    } : {
      title: '', description: '', farmhouseType: 'ALL', farmhouseId: '', discountPercent: '',
      specialOffer: '', validFrom: '', validTo: '', isActive: true,
    });
    setShowDiscountModal(true);
  };

  const saveDiscount = async (e) => {
    e.preventDefault();
    const reqId = currentUser?.id || localStorage.getItem('userId');
    if (!reqId) {
      addToast('User session expired. Please log in again.', 'error');
      return;
    }
    try {
      const payload = {
        title: discountForm.title,
        description: discountForm.description,
        farmhouseType: discountForm.farmhouseType || 'ALL',
        farmhouseId: discountForm.farmhouseId ? parseInt(discountForm.farmhouseId, 10) : null,
        discountPercent: parseFloat(discountForm.discountPercent),
        specialOffer: discountForm.specialOffer,
        validFrom: discountForm.validFrom ? discountForm.validFrom : null,
        validTo: discountForm.validTo ? discountForm.validTo : null,
        isActive: discountForm.isActive !== false,
      };
      if (editingDiscount) await discountAPI.updateDiscount(editingDiscount.id, payload, reqId);
      else await discountAPI.createDiscount(payload, reqId);
      addToast(editingDiscount ? 'Discount updated successfully' : 'Discount created successfully', 'success');
      setShowDiscountModal(false);
      fetchDiscounts();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to save discount', 'error');
    }
  };

  const removeDiscount = async (id) => {
    if (!window.confirm('Delete this discount?')) return;
    try {
      await discountAPI.deleteDiscount(id, currentUser.id);
      addToast('Discount deleted');
      fetchDiscounts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete discount', 'error');
    }
  };

  // ── Toast helpers ──
  const addToast = (message, type = 'success') => {
    const id = ++toastRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Fetch data ──
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, bookingsRes, paymentsRes, farmRes] = await Promise.allSettled([
        userAPI.getAllUsers(),
        bookingAPI.getAllBookings(),
        paymentAPI.getAllPayments(),
        farmhouseAPI.getAllFarmHousesAdmin(0, 100),
      ]);

      const usersList = usersRes.value?.data?.users || [];
      const bookingsList = bookingsRes.value?.data?.bookings || [];
      const paymentsList = paymentsRes.value?.data?.payments || [];
      const farmList = farmRes.value?.data?.farmhouses || [];

      setUsers(usersList);
      setBookings(bookingsList);
      setFarmhouses(farmList);
      setStats({
        totalUsers: usersList.length,
        totalBookings: bookingsList.length,
        totalPayments: paymentsList.length,
        pendingApprovals: farmList.filter(f => !f.isApproved).length,
      });
    } catch (err) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (activeTab === 'discounts') fetchDiscounts(); }, [activeTab]);

  // ── Add Farmhouse ──
  const handleAddFarmhouse = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.pricePerDay) {
      addToast('Please fill all required fields', 'error'); return;
    }
    setFormLoading(true);
    try {
      const data = {
        ...formData,
        pricePerDay: parseFloat(formData.pricePerDay),
        maxGuests: parseInt(formData.maxGuests) || 1,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
      };
      const adminId = currentUser.id;
      if (!adminId) throw new Error('Admin ID missing');
      await farmhouseAPI.addFarmHouse(data, adminId);
      addToast('Farm house added successfully!');
      setShowAddModal(false);
      setFormData({ name: '', location: '', description: '', pricePerDay: '', maxGuests: '', amenities: '', imageUrl: '' });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add farm house', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Approve Farmhouse ──
  const handleApprove = async (id) => {
    try {
      await farmhouseAPI.approveFarmHouse(id);
      addToast('Farm house approved!');
      fetchData();
    } catch {
      addToast('Failed to approve farm house', 'error');
    }
  };

  const handleBookingStatus = async (booking, action) => {
    try {
      if (action === 'confirm') await bookingAPI.confirmBooking(booking.id);
      else await bookingAPI.cancelBooking(booking.id);
      addToast(`Booking #${booking.id} ${action === 'confirm' ? 'confirmed' : 'cancelled'}`);
      fetchData();
      setShowBookingModal(false);
    } catch (err) {
      addToast(err.response?.data?.message || `Failed to ${action} booking`, 'error');
    }
  };

  // ── Delete Farmhouse ──
  const handleDelete = (id) => {
    setConfirmDialog({
      open: true,
      message: 'Are you sure you want to delete this farm house? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await farmhouseAPI.deleteFarmHouse(id, currentUser.id || 1);
          addToast('Farm house deleted');
          fetchData();
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to delete', 'error');
        }
        setConfirmDialog({ open: false, message: '', onConfirm: null });
      },
    });
  };

  const unapprovedFarmhouses = farmhouses.filter(f => !f.isApproved);

  // ── Filtered data ──
  const filteredUsers = users.filter(u =>
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || (filterStatus === 'active' && !u.isBlocked) || (filterStatus === 'blocked' && u.isBlocked))
  );

  const filteredFarmhouses = farmhouses.filter(f =>
    (f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     f.location?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || (filterStatus === 'approved' && f.isApproved) || (filterStatus === 'pending' && !f.isApproved))
  );

  const filteredBookings = bookings.filter(b =>
    (b.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     b.farmHouseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     String(b.id).includes(searchTerm) ||
     b.startDate?.includes(searchTerm) ||
     b.endDate?.includes(searchTerm)) &&
    (filterStatus === 'all' || b.status?.toLowerCase() === filterStatus)
  );

  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    revenue: bookings.filter(b => b.status !== 'CANCELLED').reduce((sum, b) => sum + (b.totalPrice || 0), 0),
  };

  // ── Sidebar nav items ──
  const navItems = [
    { key: 'overview', label: 'Overview', icon: icons.dashboard },
    { key: 'users', label: 'Users', icon: icons.users, count: stats.totalUsers },
    { key: 'farmhouses', label: 'Farm Houses', icon: icons.farmhouse, count: farmhouses.length },
    { key: 'bookings', label: 'Bookings', icon: icons.bookings, count: stats.totalBookings },
    { key: 'approvals', label: 'Pending', icon: icons.approve, count: stats.pendingApprovals, badge: true },
    { key: 'discounts', label: 'Discounts', icon: icons.tag, count: discounts.length },
  ];

  if (loading) {
    return (
      <div className="adm-splash">
        <div className="adm-spinner" />
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="adm-root">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="adm-sidebar-header">
          <div className="adm-sidebar-logo">
            <span className="adm-logo-icon">🏡</span>
            {sidebarOpen && <span className="adm-logo-text">FarmHouse Admin</span>}
          </div>
          <button className="adm-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Icon d={sidebarOpen ? icons.close : icons.menu} size={18} />
          </button>
        </div>

        <nav className="adm-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`adm-nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.key); setSearchTerm(''); setFilterStatus('all'); }}
            >
              <div className="adm-nav-icon"><Icon d={item.icon} size={20} /></div>
              {sidebarOpen && (
                <>
                  <span className="adm-nav-label">{item.label}</span>
                  {item.count !== undefined && (
                    <span className={`adm-nav-count ${item.badge && item.count > 0 ? 'badge' : ''}`}>
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-user-info">
            <div className="adm-user-avatar">{currentUser.name?.[0]?.toUpperCase() || 'A'}</div>
            {sidebarOpen && (
              <div className="adm-user-details">
                <span className="adm-user-name">{currentUser.name || 'Admin'}</span>
                <span className="adm-user-role">ADMIN</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="adm-main">
        {/* Header */}
        <header className="adm-header">
          <div className="adm-header-left">
            <h1 className="adm-page-title">
              {navItems.find(n => n.key === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="adm-page-subtitle">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="adm-header-right">
            <button className="adm-icon-btn" onClick={fetchData} title="Refresh">
              <Icon d={icons.refresh} size={18} />
            </button>
            <button className="adm-icon-btn" title="Notifications">
              <Icon d={icons.bell} size={18} />
              {stats.pendingApprovals > 0 && <span className="adm-notif-dot">{stats.pendingApprovals}</span>}
            </button>
          </div>
        </header>

        <div className="adm-content">

          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && (
            <div className="adm-overview">
              <div className="adm-stats-grid">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  subtitle="Registered accounts"
                  iconPath={icons.users}
                  gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  trend={12}
                />
                <StatCard
                  title="Total Bookings"
                  value={stats.totalBookings}
                  subtitle="All time bookings"
                  iconPath={icons.bookings}
                  gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                  trend={8}
                />
                <StatCard
                  title="Total Payments"
                  value={stats.totalPayments}
                  subtitle="Processed transactions"
                  iconPath={icons.payments}
                  gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                  trend={5}
                />
                <StatCard
                  title="Pending Approvals"
                  value={stats.pendingApprovals}
                  subtitle="Awaiting review"
                  iconPath={icons.approve}
                  gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                />
              </div>

              <div className="adm-overview-bottom">
                {/* Recent Bookings */}
                <div className="adm-widget">
                  <div className="adm-widget-header">
                    <h3>Recent Bookings</h3>
                    <button className="adm-link-btn" onClick={() => setActiveTab('bookings')}>View All →</button>
                  </div>
                  <div className="adm-widget-body">
                    {bookings.slice(0, 5).map(b => (
                      <div className="adm-list-row" key={b.id}>
                        <div className="adm-list-avatar">{b.userName?.[0] || 'U'}</div>
                        <div className="adm-list-info">
                          <span className="adm-list-name">{b.userName || 'Unknown'}</span>
                          <span className="adm-list-sub">{b.farmHouseName || b.farmhouseName || '—'}</span>
                        </div>
                        <span className={`adm-badge adm-status-${(b.status || '').toLowerCase()}`}>
                          {b.status}
                        </span>
                        <span className="adm-list-price">₹{b.totalPrice}</span>
                      </div>
                    ))}
                    {bookings.length === 0 && <p className="adm-empty">No bookings yet</p>}
                  </div>
                </div>

                {/* Pending Approvals */}
                <div className="adm-widget">
                  <div className="adm-widget-header">
                    <h3>Pending Approvals</h3>
                    <button className="adm-link-btn" onClick={() => setActiveTab('approvals')}>View All →</button>
                  </div>
                  <div className="adm-widget-body">
                    {unapprovedFarmhouses.slice(0, 5).map(fh => (
                      <div className="adm-list-row" key={fh.id}>
                        <div className="adm-list-avatar" style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)' }}>🏡</div>
                        <div className="adm-list-info">
                          <span className="adm-list-name">{fh.name}</span>
                          <span className="adm-list-sub">{fh.location}</span>
                        </div>
                        <span className="adm-badge adm-status-pending">Pending</span>
                        <button className="adm-btn-sm adm-btn-approve" onClick={() => handleApprove(fh.id)}>Approve</button>
                      </div>
                    ))}
                    {unapprovedFarmhouses.length === 0 && <p className="adm-empty">✅ All caught up!</p>}
                  </div>
                </div>
              </div>

              {/* Activity Chart */}
              <div className="adm-chart-widget">
                <div className="adm-widget-header">
                  <h3>📊 Monthly Activity Overview</h3>
                </div>
                <div className="adm-chart-content">
                  <div className="adm-chart-group">
                    <p className="adm-chart-label">Users</p>
                    <MiniBarChart data={[4,7,12,8,15,22,18,25,30,28,35,stats.totalUsers]} color="linear-gradient(180deg,#764ba2,#667eea)" />
                  </div>
                  <div className="adm-chart-group">
                    <p className="adm-chart-label">Bookings</p>
                    <MiniBarChart data={[2,5,8,6,12,18,14,20,25,22,28,stats.totalBookings]} color="linear-gradient(180deg,#f5576c,#f093fb)" />
                  </div>
                  <div className="adm-chart-group">
                    <p className="adm-chart-label">Farm Houses</p>
                    <MiniBarChart data={[1,2,3,5,8,10,12,14,15,16,18,farmhouses.length]} color="linear-gradient(180deg,#00f2fe,#4facfe)" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ USERS TAB ═══ */}
          {activeTab === 'users' && (
            <div className="adm-section">
              <div className="adm-toolbar">
                <div className="adm-search-wrap">
                  <Icon d={icons.search} size={16} />
                  <input
                    className="adm-search"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="adm-filter-wrap">
                  <Icon d={icons.filter} size={16} />
                  <select className="adm-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <span className="adm-count-tag">{filteredUsers.length} users</span>
              </div>

              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="adm-user-cell">
                            <div className="adm-avatar">{user.name?.[0]?.toUpperCase() || '?'}</div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone || '—'}</td>
                        <td><span className={`adm-role-badge adm-role-${user.role?.toLowerCase()}`}>{user.role}</span></td>
                        <td>
                          <span className={`adm-badge ${user.isBlocked ? 'adm-status-cancelled' : 'adm-status-confirmed'}`}>
                            {user.isBlocked ? '🚫 Blocked' : '✅ Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <div className="adm-table-empty">No users found</div>}
              </div>
            </div>
          )}

          {/* ═══ FARMHOUSES TAB ═══ */}
          {activeTab === 'farmhouses' && (
            <div className="adm-section">
              <div className="adm-toolbar">
                <div className="adm-search-wrap">
                  <Icon d={icons.search} size={16} />
                  <input
                    className="adm-search"
                    placeholder="Search farm houses..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="adm-filter-wrap">
                  <Icon d={icons.filter} size={16} />
                  <select className="adm-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <span className="adm-count-tag">{filteredFarmhouses.length} properties</span>
                <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)}>
                  <Icon d={icons.add} size={16} /> Add Farm House
                </button>
              </div>

              <div className="adm-cards-grid">
                {filteredFarmhouses.map(fh => (
                  <div key={fh.id} className="adm-fh-card">
                    <div className="adm-fh-img-wrap">
                      {fh.imageUrl
                        ? <img src={fh.imageUrl} alt={fh.name} className="adm-fh-img" onError={e => { e.target.style.display='none'; }} />
                        : <div className="adm-fh-img-placeholder">🏡</div>
                      }
                      <span className={`adm-fh-status-badge ${fh.isApproved ? 'approved' : 'pending'}`}>
                        {fh.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div className="adm-fh-body">
                      <h4 className="adm-fh-name">{fh.name}</h4>
                      <p className="adm-fh-loc">📍 {fh.location}</p>
                      <p className="adm-fh-owner">👤 {fh.ownerName || 'N/A'}</p>
                      <p className="adm-fh-price">₹{fh.pricePerDay?.toLocaleString()}<span>/night</span></p>
                    </div>
                    <div className="adm-fh-actions">
                      <button className="adm-btn-sm adm-btn-view" onClick={() => { setSelectedItem(fh); setShowDetailModal(true); }}>
                        <Icon d={icons.eye} size={14} /> View
                      </button>
                      {!fh.isApproved && (
                        <button className="adm-btn-sm adm-btn-approve" onClick={() => handleApprove(fh.id)}>
                          <Icon d={icons.approve} size={14} /> Approve
                        </button>
                      )}
                      <button className="adm-btn-sm adm-btn-danger" onClick={() => handleDelete(fh.id)}>
                        <Icon d={icons.delete} size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredFarmhouses.length === 0 && <div className="adm-table-empty">No farm houses found</div>}
            </div>
          )}

          {/* ═══ BOOKINGS TAB ═══ */}
          {activeTab === 'bookings' && (
            <div className="adm-section">
              <div className="adm-booking-summary">
                <div className="adm-booking-kpi"><span className="adm-kpi-label">All bookings</span><strong>{bookingStats.total}</strong><small>Across every guest</small></div>
                <div className="adm-booking-kpi"><span className="adm-kpi-label">Needs attention</span><strong className="adm-kpi-warning">{bookingStats.pending}</strong><small>Pending confirmation</small></div>
                <div className="adm-booking-kpi"><span className="adm-kpi-label">Confirmed stays</span><strong className="adm-kpi-success">{bookingStats.confirmed}</strong><small>Upcoming and active</small></div>
                <div className="adm-booking-kpi"><span className="adm-kpi-label">Booked revenue</span><strong>₹{bookingStats.revenue.toLocaleString('en-IN')}</strong><small>Excludes cancelled stays</small></div>
              </div>
              <div className="adm-toolbar">
                <div className="adm-search-wrap">
                  <Icon d={icons.search} size={16} />
                  <input
                    className="adm-search"
                    placeholder="Search guest, property, date or ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="adm-filter-wrap">
                  <Icon d={icons.filter} size={16} />
                  <select className="adm-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <span className="adm-count-tag">{filteredBookings.length} bookings</span>
              </div>

              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Guest</th>
                      <th>Farm House</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => (
                      <tr key={b.id}>
                        <td><span className="adm-id-badge">#{b.id}</span></td>
                        <td>
                          <div className="adm-user-cell">
                            <div className="adm-avatar" style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)' }}>
                              {b.userName?.[0] || 'U'}
                            </div>
                            <span>{b.userName || 'N/A'}</span>
                          </div>
                        </td>
                        <td>{b.farmHouseName || b.farmhouseName || '—'}</td>
                        <td>
                          <div className="adm-date-cell">
                            <Icon d={icons.calendar} size={14} />
                            {b.startDate}
                          </div>
                        </td>
                        <td>
                          <div className="adm-date-cell">
                            <Icon d={icons.calendar} size={14} />
                            {b.endDate}
                          </div>
                        </td>
                        <td><strong>₹{b.totalPrice?.toLocaleString()}</strong></td>
                        <td>
                          <span className={`adm-badge adm-status-${(b.status || '').toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <div className="adm-action-btns">
                            <button className="adm-btn-sm adm-btn-view" title="View booking details" onClick={() => { setSelectedBooking(b); setShowBookingModal(true); }}>
                              <Icon d={icons.eye} size={14} /> View
                            </button>
                            {b.status === 'PENDING' && (
                              <button className="adm-btn-sm adm-btn-approve" onClick={() => handleBookingStatus(b, 'confirm')}>
                                <Icon d={icons.approve} size={14} /> Confirm
                              </button>
                            )}
                            {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                              <button className="adm-btn-sm adm-btn-danger" onClick={() => handleBookingStatus(b, 'cancel')}>
                                <Icon d={icons.close} size={14} /> Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredBookings.length === 0 && <div className="adm-table-empty">No bookings found</div>}
              </div>
            </div>
          )}

          {/* ═══ DISCOUNTS TAB ═══ */}
          {activeTab === 'discounts' && (
            <div className="adm-section">
              <div className="adm-toolbar">
                <div>
                  <h3 className="adm-section-heading">Discounts &amp; Special Offers</h3>
                  <p className="adm-section-copy">Manage offers created by every owner.</p>
                </div>
                <button className="adm-btn adm-btn-primary" onClick={() => openDiscountModal()}>
                  <Icon d={icons.add} size={16} /> Add Discount
                </button>
              </div>
              {discountLoading ? (
                <div className="adm-table-empty">Loading discounts…</div>
              ) : discounts.length === 0 ? (
                <div className="adm-table-empty">No discounts have been created yet.</div>
              ) : (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead><tr><th>Offer</th><th>Type</th><th>Discount</th><th>Validity</th><th>Created by</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {discounts.map(discount => (
                        <tr key={discount.id}>
                          <td><strong>{discount.title}</strong><br /><small>{discount.specialOffer || discount.description || '—'}</small></td>
                          <td>{(discount.farmhouseType || 'ALL').replaceAll('_', ' ')}</td>
                          <td><strong>{discount.discountPercent}% OFF</strong></td>
                          <td>{discount.validFrom || 'Any time'}<br />{discount.validTo ? `to ${discount.validTo}` : ''}</td>
                          <td>{discount.createdByName || 'Admin'}</td>
                          <td><span className={`adm-badge ${discount.isActive ? 'adm-status-confirmed' : 'adm-status-cancelled'}`}>{discount.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td><div className="adm-action-btns">
                            <button className="adm-btn-sm adm-btn-view" onClick={() => openDiscountModal(discount)}>Edit</button>
                            <button className="adm-btn-sm adm-btn-danger" onClick={() => removeDiscount(discount.id)}>Delete</button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══ APPROVALS TAB ═══ */}
          {activeTab === 'approvals' && (
            <div className="adm-section">
              <div className="adm-section-banner">
                <Icon d={icons.approve} size={22} color="#43e97b" />
                <div>
                  <h3>Pending Farmhouse Approvals</h3>
                  <p>{unapprovedFarmhouses.length} properties awaiting your review</p>
                </div>
              </div>

              {unapprovedFarmhouses.length === 0 ? (
                <div className="adm-all-clear">
                  <div className="adm-all-clear-icon">✅</div>
                  <h3>All caught up!</h3>
                  <p>There are no pending approvals at this time.</p>
                </div>
              ) : (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Farm House</th>
                        <th>Location</th>
                        <th>Owner</th>
                        <th>Price/Night</th>
                        <th>Max Guests</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unapprovedFarmhouses.map(fh => (
                        <tr key={fh.id}>
                          <td>
                            <div className="adm-fh-cell">
                              <div className="adm-fh-thumb">🏡</div>
                              <span>{fh.name}</span>
                            </div>
                          </td>
                          <td>📍 {fh.location}</td>
                          <td>👤 {fh.ownerName || 'N/A'}</td>
                          <td><strong>₹{fh.pricePerDay?.toLocaleString()}</strong></td>
                          <td>{fh.maxGuests || '—'} guests</td>
                          <td>
                            <div className="adm-action-btns">
                              <button className="adm-btn-sm adm-btn-view" onClick={() => { setSelectedItem(fh); setShowDetailModal(true); }}>
                                <Icon d={icons.eye} size={14} /> Preview
                              </button>
                              <button className="adm-btn-sm adm-btn-approve" onClick={() => handleApprove(fh.id)}>
                                <Icon d={icons.approve} size={14} /> Approve
                              </button>
                              <button className="adm-btn-sm adm-btn-danger" onClick={() => handleDelete(fh.id)}>
                                <Icon d={icons.delete} size={14} /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Add Farm House Modal ── */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="➕ Add New Farm House">
        <form onSubmit={handleAddFarmhouse} className="adm-form">
          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>Farm House Name <span className="req">*</span></label>
              <input required placeholder="Enter name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="adm-form-group">
              <label>Location <span className="req">*</span></label>
              <input required placeholder="City, State" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>
          <div className="adm-form-group">
            <label>Description</label>
            <textarea rows={3} placeholder="Describe the property..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>Price Per Day (₹) <span className="req">*</span></label>
              <input required type="number" step="100" min="0" placeholder="e.g. 5000" value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: e.target.value})} />
            </div>
            <div className="adm-form-group">
              <label>Max Guests</label>
              <input type="number" min="1" placeholder="e.g. 10" value={formData.maxGuests} onChange={e => setFormData({...formData, maxGuests: e.target.value})} />
            </div>
          </div>
          <div className="adm-form-group">
            <label>Image URL</label>
            <input type="url" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
          </div>
          <div className="adm-form-group">
            <label>Amenities <span className="adm-hint">(comma separated)</span></label>
            <input placeholder="WiFi, Pool, Kitchen, BBQ..." value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} />
          </div>
          <div className="adm-form-footer">
            <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="adm-btn adm-btn-primary" disabled={formLoading}>
              {formLoading ? 'Adding...' : '✅ Add Farm House'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="🏡 Farm House Details">
        {selectedItem && (
          <div className="adm-detail-view">
            {selectedItem.imageUrl && (
              <img src={selectedItem.imageUrl} alt={selectedItem.name} className="adm-detail-img" onError={e => { e.target.style.display='none'; }} />
            )}
            <div className="adm-detail-grid">
              <div><label>Name</label><p>{selectedItem.name}</p></div>
              <div><label>Location</label><p>📍 {selectedItem.location}</p></div>
              <div><label>Owner</label><p>👤 {selectedItem.ownerName || 'N/A'}</p></div>
              <div><label>Price/Night</label><p>₹{selectedItem.pricePerDay?.toLocaleString()}</p></div>
              <div><label>Max Guests</label><p>{selectedItem.maxGuests || '—'}</p></div>
              <div><label>Status</label><p><span className={`adm-badge ${selectedItem.isApproved ? 'adm-status-confirmed' : 'adm-status-pending'}`}>{selectedItem.isApproved ? 'Approved' : 'Pending'}</span></p></div>
              {selectedItem.description && <div className="adm-detail-full"><label>Description</label><p>{selectedItem.description}</p></div>}
              {selectedItem.amenities?.length > 0 && (
                <div className="adm-detail-full">
                  <label>Amenities</label>
                  <div className="adm-amenities-list">
                    {(Array.isArray(selectedItem.amenities) ? selectedItem.amenities : selectedItem.amenities.split(',')).map((a, i) => (
                      <span key={i} className="adm-amenity-tag">{a.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="adm-form-footer">
              {!selectedItem.isApproved && (
                <button className="adm-btn adm-btn-primary" onClick={() => { handleApprove(selectedItem.id); setShowDetailModal(false); }}>
                  <Icon d={icons.approve} size={16} /> Approve
                </button>
              )}
              <button className="adm-btn adm-btn-danger" onClick={() => { handleDelete(selectedItem.id); setShowDetailModal(false); }}>
                <Icon d={icons.delete} size={16} /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showBookingModal} onClose={() => setShowBookingModal(false)} title={`Booking #${selectedBooking?.id || ''}`}>
        {selectedBooking && (
          <div className="adm-detail-view adm-booking-detail">
            <div className="adm-booking-detail-heading">
              <div className="adm-avatar" style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)' }}>{selectedBooking.userName?.[0] || 'U'}</div>
              <div><h3>{selectedBooking.userName || 'Unknown guest'}</h3><p>{selectedBooking.farmHouseName || selectedBooking.farmhouseName || 'Unknown farmhouse'}</p></div>
              <span className={`adm-badge adm-status-${(selectedBooking.status || '').toLowerCase()}`}>{selectedBooking.status}</span>
            </div>
            <div className="adm-detail-grid">
              <div><label>Check-in</label><p>{selectedBooking.startDate}</p></div>
              <div><label>Check-out</label><p>{selectedBooking.endDate}</p></div>
              <div><label>Guests</label><p>{selectedBooking.numberOfGuests || '—'}</p></div>
              <div><label>Total amount</label><p>₹{selectedBooking.totalPrice?.toLocaleString('en-IN')}</p></div>
              {selectedBooking.specialRequirements && <div className="adm-detail-full"><label>Special requirements</label><p>{selectedBooking.specialRequirements}</p></div>}
            </div>
            {selectedBooking.status === 'PENDING' && <button className="adm-btn adm-btn-primary" onClick={() => handleBookingStatus(selectedBooking, 'confirm')}><Icon d={icons.approve} size={16} /> Confirm booking</button>}
            {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'COMPLETED' && <button className="adm-btn adm-btn-danger adm-booking-cancel" onClick={() => handleBookingStatus(selectedBooking, 'cancel')}><Icon d={icons.close} size={16} /> Cancel booking</button>}
          </div>
        )}
      </Modal>

      <Modal open={showDiscountModal} onClose={() => setShowDiscountModal(false)} title={editingDiscount ? 'Edit Discount' : 'Create Discount'}>
        <form onSubmit={saveDiscount} className="adm-form">
          <div className="adm-form-row">
            <div className="adm-form-group"><label>Title <span className="req">*</span></label><input required value={discountForm.title} onChange={e => setDiscountForm({ ...discountForm, title: e.target.value })} /></div>
            <div className="adm-form-group"><label>Target Farmhouse</label><select value={discountForm.farmhouseId} onChange={e => setDiscountForm({ ...discountForm, farmhouseId: e.target.value })}><option value="">All Farmhouses (Category Level)</option>{farmhouses.map(fh => (<option key={fh.id} value={fh.id}>🏡 {fh.name}</option>))}</select></div>
            <div className="adm-form-group"><label>Farmhouse Type</label><select value={discountForm.farmhouseType} onChange={e => setDiscountForm({ ...discountForm, farmhouseType: e.target.value })}><option value="ALL">All Farmhouses</option><option value="ZEN_RETREAT">Zen Retreat</option><option value="POOL_PARTY">Pool Party</option><option value="ADVENTURE_WOODS">Adventure Woods</option><option value="HERITAGE_PALACE">Heritage Palace</option></select></div>
          </div>
          <div className="adm-form-row">
            <div className="adm-form-group"><label>Discount % <span className="req">*</span> (Set 0 for No Discount)</label><input required type="number" min="0" max="99.99" step="0.1" value={discountForm.discountPercent} onChange={e => setDiscountForm({ ...discountForm, discountPercent: e.target.value })} /></div>
            <div className="adm-form-group"><label>Status</label><select value={String(discountForm.isActive)} onChange={e => setDiscountForm({ ...discountForm, isActive: e.target.value === 'true' })}><option value="true">Active</option><option value="false">Inactive</option></select></div>
          </div>
          <div className="adm-form-row">
            <div className="adm-form-group"><label>Valid from</label><input type="date" value={discountForm.validFrom} onChange={e => setDiscountForm({ ...discountForm, validFrom: e.target.value })} /></div>
            <div className="adm-form-group"><label>Valid to</label><input type="date" value={discountForm.validTo} onChange={e => setDiscountForm({ ...discountForm, validTo: e.target.value })} /></div>
          </div>
          <div className="adm-form-group"><label>Special offer</label><input value={discountForm.specialOffer} placeholder="e.g. Free bonfire night + breakfast" onChange={e => setDiscountForm({ ...discountForm, specialOffer: e.target.value })} /></div>
          <div className="adm-form-group"><label>Description</label><textarea rows={3} value={discountForm.description} onChange={e => setDiscountForm({ ...discountForm, description: e.target.value })} /></div>
          <div className="adm-form-footer"><button type="button" className="adm-btn adm-btn-ghost" onClick={() => setShowDiscountModal(false)}>Cancel</button><button type="submit" className="adm-btn adm-btn-primary">{editingDiscount ? 'Save Changes' : 'Create Discount'}</button></div>
        </form>
      </Modal>

      {/* ── Confirm Dialog ── */}
      <Modal open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, message: '', onConfirm: null })} title="⚠️ Confirm Action">
        <div className="adm-confirm">
          <p>{confirmDialog.message}</p>
          <div className="adm-confirm-btns">
            <button className="adm-btn adm-btn-ghost" onClick={() => setConfirmDialog({ open: false, message: '', onConfirm: null })}>
              Cancel
            </button>
            <button className="adm-btn adm-btn-danger" onClick={confirmDialog.onConfirm}>
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
