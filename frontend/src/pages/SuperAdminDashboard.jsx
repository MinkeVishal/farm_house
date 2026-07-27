import React, { useState, useEffect, useRef } from 'react';
import { userAPI, farmhouseAPI, bookingAPI, paymentAPI } from '../api/axiosInstance';
import './AdminDashboard.css';

// ─── Icon helper ──────────────────────────────────────────────────────────────
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
  delete: 'M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6',
  search: 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  menu: 'M3 12h18M3 6h18M3 18h18',
  close: 'M18 6L6 18M6 6l12 12',
  block: 'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636',
  unblock: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  approve: 'M20 6L9 17l-5-5',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  trending: 'M23 6l-9.5 9.5-5-5L1 18',
  calendar: 'M8 2v4M16 2v4M3 10h18M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  creditcard: 'M1 4h22v16H1zM1 10h22',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, subtitle, iconPath, gradient, trend, prefix = '' }) {
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
          <h2 className="adm-stat-value">{prefix}{count.toLocaleString()}</h2>
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

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="adm-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`adm-toast adm-toast-${t.type}`}>
          <Icon d={t.type === 'success' ? icons.approve : t.type === 'error' ? icons.close : icons.bell} size={16} />
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-header">
          <h3>{title}</h3>
          <button className="adm-modal-close" onClick={onClose}><Icon d={icons.close} size={18} /></button>
        </div>
        <div className="adm-modal-body">{children}</div>
      </div>
    </div>
  );
}

// ─── SuperAdminDashboard ──────────────────────────────────────────────────────
function SuperAdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalBookings: 0, totalPayments: 0, totalFarmhouses: 0, totalRevenue: 0, pendingApprovals: 0 });
  const [users, setUsers] = useState([]);
  const [farmhouses, setFarmhouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null });
  const toastRef = useRef(0);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const addToast = (message, type = 'success') => {
    const id = ++toastRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, bookingsRes, paymentsRes, farmRes] = await Promise.allSettled([
        userAPI.getAllUsers(),
        bookingAPI.getAllBookings(),
        paymentAPI.getAllPayments(),
        farmhouseAPI.getAllFarmHousesAdmin(0, 200),
      ]);

      const usersList = usersRes.value?.data?.users || [];
      const bookingsList = bookingsRes.value?.data?.bookings || [];
      const paymentsList = paymentsRes.value?.data?.payments || [];
      const farmList = farmRes.value?.data?.farmhouses || [];
      const totalRevenue = paymentsList.reduce((sum, p) => sum + (p.amount || 0), 0);

      setUsers(usersList);
      setBookings(bookingsList);
      setPayments(paymentsList);
      setFarmhouses(farmList);
      setStats({
        totalUsers: usersList.length,
        totalBookings: bookingsList.length,
        totalPayments: paymentsList.length,
        totalFarmhouses: farmList.length,
        totalRevenue,
        pendingApprovals: farmList.filter(f => !f.isApproved).length,
      });
    } catch (err) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBlockUser = async (userId, isBlocked) => {
    addToast('Block/Unblock feature — connect to backend API', 'info');
  };

  const handleDeleteFarmhouse = (id) => {
    setConfirmDialog({
      open: true,
      message: 'Delete this farm house permanently? This cannot be undone.',
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

  const handleApproveFarmhouse = async (id) => {
    try {
      await farmhouseAPI.approveFarmHouse(id);
      addToast('Farm house approved!');
      fetchData();
    } catch {
      addToast('Approval failed', 'error');
    }
  };

  // ── Filtering ──
  const filteredUsers = users.filter(u =>
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' ||
     (filterStatus === 'active' && !u.isBlocked) ||
     (filterStatus === 'blocked' && u.isBlocked) ||
     u.role?.toLowerCase() === filterStatus)
  );

  const filteredFarmhouses = farmhouses.filter(f =>
    (f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     f.location?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || (filterStatus === 'approved' && f.isApproved) || (filterStatus === 'pending' && !f.isApproved))
  );

  const filteredBookings = bookings.filter(b =>
    (b.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (b.farmHouseName || b.farmhouseName || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || b.status?.toLowerCase() === filterStatus)
  );

  const filteredPayments = payments.filter(p =>
    String(p.bookingId).includes(searchTerm) &&
    (filterStatus === 'all' || p.paymentStatus?.toLowerCase() === filterStatus)
  );

  const navItems = [
    { key: 'overview',   label: 'Overview',     icon: icons.shield },
    { key: 'users',      label: 'All Users',     icon: icons.users,    count: stats.totalUsers },
    { key: 'farmhouses', label: 'Farm Houses',   icon: icons.farmhouse, count: stats.totalFarmhouses },
    { key: 'bookings',   label: 'Bookings',      icon: icons.bookings, count: stats.totalBookings },
    { key: 'payments',   label: 'Payments',      icon: icons.payments,  count: stats.totalPayments },
    { key: 'approvals',  label: 'Pending',        icon: icons.approve,  count: stats.pendingApprovals, badge: true },
  ];

  if (loading) {
    return (
      <div className="adm-splash">
        <div className="adm-spinner" />
        <p>Loading Super Admin Dashboard...</p>
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
            <span className="adm-logo-icon">🔐</span>
            {sidebarOpen && <span className="adm-logo-text">SuperAdmin Panel</span>}
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
            <div className="adm-user-avatar" style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
              {currentUser.name?.[0]?.toUpperCase() || 'S'}
            </div>
            {sidebarOpen && (
              <div className="adm-user-details">
                <span className="adm-user-name">{currentUser.name || 'Super Admin'}</span>
                <span className="adm-user-role" style={{ color: '#fb923c' }}>SUPERADMIN</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="adm-main">
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
            <button className="adm-icon-btn" onClick={fetchData}><Icon d={icons.refresh} size={18} /></button>
            <button className="adm-icon-btn">
              <Icon d={icons.bell} size={18} />
              {stats.pendingApprovals > 0 && <span className="adm-notif-dot">{stats.pendingApprovals}</span>}
            </button>
          </div>
        </header>

        <div className="adm-content">

          {/* ═══ OVERVIEW ═══ */}
          {activeTab === 'overview' && (
            <div className="adm-overview">
              <div className="adm-stats-grid">
                <StatCard title="Total Users" value={stats.totalUsers} subtitle="Registered accounts"
                  iconPath={icons.users} gradient="linear-gradient(135deg,#667eea,#764ba2)" trend={12} />
                <StatCard title="Farm Houses" value={stats.totalFarmhouses} subtitle="Listed properties"
                  iconPath={icons.farmhouse} gradient="linear-gradient(135deg,#f093fb,#f5576c)" trend={8} />
                <StatCard title="Total Bookings" value={stats.totalBookings} subtitle="All time"
                  iconPath={icons.bookings} gradient="linear-gradient(135deg,#4facfe,#00f2fe)" trend={5} />
                <StatCard title="Total Revenue" value={stats.totalRevenue} subtitle="From all payments"
                  iconPath={icons.payments} gradient="linear-gradient(135deg,#43e97b,#38f9d7)" prefix="₹" trend={15} />
              </div>

              <div className="adm-overview-bottom">
                {/* Recent Users */}
                <div className="adm-widget">
                  <div className="adm-widget-header">
                    <h3>👥 Recent Users</h3>
                    <button className="adm-link-btn" onClick={() => setActiveTab('users')}>View All →</button>
                  </div>
                  <div className="adm-widget-body">
                    {users.slice(0, 5).map(u => (
                      <div className="adm-list-row" key={u.id}>
                        <div className="adm-list-avatar">{u.name?.[0]?.toUpperCase() || 'U'}</div>
                        <div className="adm-list-info">
                          <span className="adm-list-name">{u.name}</span>
                          <span className="adm-list-sub">{u.email}</span>
                        </div>
                        <span className={`adm-role-badge adm-role-${u.role?.toLowerCase()}`}>{u.role}</span>
                        <span className={`adm-badge ${u.isBlocked ? 'adm-status-cancelled' : 'adm-status-confirmed'}`}>
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    ))}
                    {users.length === 0 && <p className="adm-empty">No users yet</p>}
                  </div>
                </div>

                {/* Recent Payments */}
                <div className="adm-widget">
                  <div className="adm-widget-header">
                    <h3>💳 Recent Payments</h3>
                    <button className="adm-link-btn" onClick={() => setActiveTab('payments')}>View All →</button>
                  </div>
                  <div className="adm-widget-body">
                    {payments.slice(0, 5).map(p => (
                      <div className="adm-list-row" key={p.id}>
                        <div className="adm-list-avatar" style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)' }}>₹</div>
                        <div className="adm-list-info">
                          <span className="adm-list-name">Booking #{p.bookingId}</span>
                          <span className="adm-list-sub">{p.paymentMethod || 'Online'}</span>
                        </div>
                        <span className={`adm-badge adm-status-${(p.paymentStatus || '').toLowerCase()}`}>
                          {p.paymentStatus}
                        </span>
                        <span className="adm-list-price">₹{p.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                    {payments.length === 0 && <p className="adm-empty">No payments yet</p>}
                  </div>
                </div>
              </div>

              {/* System Summary */}
              <div className="adm-widget" style={{ animationDelay: '0.2s' }}>
                <div className="adm-widget-header"><h3>📊 System Summary</h3></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0' }}>
                  {[
                    { label: 'Owners', count: users.filter(u => u.role === 'OWNER').length, color: '#fbbf24' },
                    { label: 'Customers', count: users.filter(u => u.role === 'CUSTOMER').length, color: '#818cf8' },
                    { label: 'Admins', count: users.filter(u => u.role === 'ADMIN').length, color: '#f87171' },
                    { label: 'Blocked', count: users.filter(u => u.isBlocked).length, color: '#ef4444' },
                    { label: 'Approved FH', count: farmhouses.filter(f => f.isApproved).length, color: '#34d399' },
                    { label: 'Pending FH', count: farmhouses.filter(f => !f.isApproved).length, color: '#fbbf24' },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '18px', textAlign: 'center', borderRight: '1px solid var(--adm-border)' }}>
                      <p style={{ fontSize: '1.6rem', fontWeight: 800, color: item.color, margin: '0 0 4px' }}>{item.count}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ USERS ═══ */}
          {activeTab === 'users' && (
            <div className="adm-section">
              <div className="adm-toolbar">
                <div className="adm-search-wrap">
                  <Icon d={icons.search} size={16} />
                  <input className="adm-search" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="adm-filter-wrap">
                  <Icon d={icons.filter} size={16} />
                  <select className="adm-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="customer">Customers</option>
                    <option value="owner">Owners</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <span className="adm-count-tag">{filteredUsers.length} users</span>
              </div>

              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td><span className="adm-id-badge">#{user.id}</span></td>
                        <td>
                          <div className="adm-user-cell">
                            <div className="adm-avatar">{user.name?.[0]?.toUpperCase() || '?'}</div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--adm-text-muted)' }}>{user.email}</td>
                        <td style={{ color: 'var(--adm-text-muted)' }}>{user.phone || '—'}</td>
                        <td><span className={`adm-role-badge adm-role-${user.role?.toLowerCase()}`}>{user.role}</span></td>
                        <td>
                          <span className={`adm-badge ${user.isBlocked ? 'adm-status-cancelled' : 'adm-status-confirmed'}`}>
                            {user.isBlocked ? '🚫 Blocked' : '✅ Active'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`adm-btn-sm ${user.isBlocked ? 'adm-btn-approve' : 'adm-btn-danger'}`}
                            onClick={() => handleBlockUser(user.id, user.isBlocked)}
                          >
                            <Icon d={user.isBlocked ? icons.approve : icons.block} size={13} />
                            {user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <div className="adm-table-empty">No users found</div>}
              </div>
            </div>
          )}

          {/* ═══ FARMHOUSES ═══ */}
          {activeTab === 'farmhouses' && (
            <div className="adm-section">
              <div className="adm-toolbar">
                <div className="adm-search-wrap">
                  <Icon d={icons.search} size={16} />
                  <input className="adm-search" placeholder="Search farm houses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
              </div>

              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Farm House</th><th>Location</th><th>Owner</th><th>Price/Night</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFarmhouses.map(fh => (
                      <tr key={fh.id}>
                        <td><span className="adm-id-badge">#{fh.id}</span></td>
                        <td>
                          <div className="adm-fh-cell">
                            <div className="adm-fh-thumb">🏡</div>
                            <span style={{ fontWeight: 600 }}>{fh.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--adm-text-muted)' }}>📍 {fh.location}</td>
                        <td style={{ color: 'var(--adm-text-muted)' }}>👤 {fh.ownerName || 'N/A'}</td>
                        <td><strong>₹{fh.pricePerDay?.toLocaleString()}</strong></td>
                        <td>
                          <span className={`adm-badge ${fh.isApproved ? 'adm-status-confirmed' : 'adm-status-pending'}`}>
                            {fh.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="adm-action-btns">
                            {!fh.isApproved && (
                              <button className="adm-btn-sm adm-btn-approve" onClick={() => handleApproveFarmhouse(fh.id)}>
                                <Icon d={icons.approve} size={13} /> Approve
                              </button>
                            )}
                            <button className="adm-btn-sm adm-btn-danger" onClick={() => handleDeleteFarmhouse(fh.id)}>
                              <Icon d={icons.delete} size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredFarmhouses.length === 0 && <div className="adm-table-empty">No farm houses found</div>}
              </div>
            </div>
          )}

          {/* ═══ BOOKINGS ═══ */}
          {activeTab === 'bookings' && (
            <div className="adm-section">
              <div className="adm-toolbar">
                <div className="adm-search-wrap">
                  <Icon d={icons.search} size={16} />
                  <input className="adm-search" placeholder="Search bookings..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
                      <th>ID</th><th>Guest</th><th>Farm House</th><th>Check-in</th><th>Check-out</th><th>Total</th><th>Status</th>
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
                            <Icon d={icons.calendar} size={13} />
                            {b.startDate}
                          </div>
                        </td>
                        <td>
                          <div className="adm-date-cell">
                            <Icon d={icons.calendar} size={13} />
                            {b.endDate}
                          </div>
                        </td>
                        <td><strong>₹{b.totalPrice?.toLocaleString()}</strong></td>
                        <td>
                          <span className={`adm-badge adm-status-${(b.status || '').toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredBookings.length === 0 && <div className="adm-table-empty">No bookings found</div>}
              </div>
            </div>
          )}

          {/* ═══ PAYMENTS ═══ */}
          {activeTab === 'payments' && (
            <div className="adm-section">
              <div className="adm-toolbar">
                <div className="adm-search-wrap">
                  <Icon d={icons.search} size={16} />
                  <input className="adm-search" placeholder="Search by booking ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="adm-filter-wrap">
                  <Icon d={icons.filter} size={16} />
                  <select className="adm-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <span className="adm-count-tag">{filteredPayments.length} payments</span>
                <div className="adm-count-tag" style={{ background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.2)', color: '#34d399' }}>
                  Total: ₹{filteredPayments.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}
                </div>
              </div>

              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th><th>Booking ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(p => (
                      <tr key={p.id}>
                        <td><span className="adm-id-badge">#{p.id}</span></td>
                        <td><span className="adm-id-badge">#{p.bookingId}</span></td>
                        <td>
                          <strong style={{ color: '#34d399' }}>₹{p.amount?.toLocaleString()}</strong>
                        </td>
                        <td style={{ color: 'var(--adm-text-muted)' }}>{p.paymentMethod || 'Online'}</td>
                        <td>
                          <span className={`adm-badge adm-status-${(p.paymentStatus || '').toLowerCase()}`}>
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td style={{ color: 'var(--adm-text-muted)', fontSize: '0.82rem' }}>
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredPayments.length === 0 && <div className="adm-table-empty">No payments found</div>}
              </div>
            </div>
          )}

          {/* ═══ APPROVALS ═══ */}
          {activeTab === 'approvals' && (
            <div className="adm-section">
              <div className="adm-section-banner">
                <Icon d={icons.approve} size={22} color="#43e97b" />
                <div>
                  <h3>Pending Farmhouse Approvals</h3>
                  <p>{farmhouses.filter(f => !f.isApproved).length} properties awaiting review</p>
                </div>
              </div>

              {farmhouses.filter(f => !f.isApproved).length === 0 ? (
                <div className="adm-all-clear">
                  <div className="adm-all-clear-icon">✅</div>
                  <h3>All caught up!</h3>
                  <p>No pending approvals.</p>
                </div>
              ) : (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Farm House</th><th>Location</th><th>Owner</th><th>Price/Night</th><th>Guests</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmhouses.filter(f => !f.isApproved).map(fh => (
                        <tr key={fh.id}>
                          <td>
                            <div className="adm-fh-cell">
                              <div className="adm-fh-thumb">🏡</div>
                              <span style={{ fontWeight: 600 }}>{fh.name}</span>
                            </div>
                          </td>
                          <td>📍 {fh.location}</td>
                          <td>👤 {fh.ownerName || 'N/A'}</td>
                          <td><strong>₹{fh.pricePerDay?.toLocaleString()}</strong></td>
                          <td>{fh.maxGuests || '—'} guests</td>
                          <td>
                            <div className="adm-action-btns">
                              <button className="adm-btn-sm adm-btn-approve" onClick={() => handleApproveFarmhouse(fh.id)}>
                                <Icon d={icons.approve} size={13} /> Approve
                              </button>
                              <button className="adm-btn-sm adm-btn-danger" onClick={() => handleDeleteFarmhouse(fh.id)}>
                                <Icon d={icons.delete} size={13} /> Reject
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

      {/* ── Confirm Dialog ── */}
      <Modal open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, message: '', onConfirm: null })} title="⚠️ Confirm Action">
        <div className="adm-confirm">
          <p>{confirmDialog.message}</p>
          <div className="adm-confirm-btns">
            <button className="adm-btn adm-btn-ghost" onClick={() => setConfirmDialog({ open: false, message: '', onConfirm: null })}>Cancel</button>
            <button className="adm-btn adm-btn-danger" onClick={confirmDialog.onConfirm}>Yes, Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SuperAdminDashboard;
