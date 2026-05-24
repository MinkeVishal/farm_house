import React, { useState, useEffect } from 'react';
import { userAPI, farmhouseAPI, bookingAPI, paymentAPI } from '../api/axiosInstance';

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalPayments: 0,
    totalFarmhouses: 0,
  });
  const [users, setUsers] = useState([]);
  const [farmhouses, setFarmhouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const fetchSuperAdminData = async () => {
    try {
      // Fetch all data
      const usersResponse = await userAPI.getAllUsers();
      const bookingsResponse = await bookingAPI.getAllBookings();
      const paymentsResponse = await paymentAPI.getAllPayments();
      const farmhousesResponse = await farmhouseAPI.getAllFarmHouses(0, 100);

      setStats({
        totalUsers: usersResponse.data.users?.length || 0,
        totalBookings: bookingsResponse.data.bookings?.length || 0,
        totalPayments: paymentsResponse.data.payments?.length || 0,
        totalFarmhouses: farmhousesResponse.data.farmhouses?.length || 0,
      });

      setUsers(usersResponse.data.users || []);
      setBookings(bookingsResponse.data.bookings || []);
      setPayments(paymentsResponse.data.payments || []);
      setFarmhouses(farmhousesResponse.data.farmhouses || []);
    } catch (err) {
      console.error('Error fetching super admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      // Implement block user functionality
      alert('Block user functionality - to be implemented');
    } catch (err) {
      alert('Failed to block user');
    }
  };

  const handleDeleteFarmhouse = async (farmhouseId) => {
    if (window.confirm('Are you sure you want to delete this farm house?')) {
      try {
        await farmhouseAPI.deleteFarmHouse(farmhouseId);
        alert('Farm house deleted!');
        fetchSuperAdminData();
      } catch (err) {
        alert('Failed to delete farm house');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <h1>🔐 Super Admin Dashboard</h1>

      {activeTab === 'overview' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Total Farm Houses</h3>
              <p className="stat-number">{stats.totalFarmhouses}</p>
            </div>
            <div className="stat-card">
              <h3>Total Bookings</h3>
              <p className="stat-number">{stats.totalBookings}</p>
            </div>
            <div className="stat-card">
              <h3>Total Payments</h3>
              <p className="stat-number">₹{stats.totalPayments}</p>
            </div>
          </div>
        </>
      )}

      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          Users
        </button>
        <button 
          onClick={() => setActiveTab('farmhouses')}
          className={`tab-btn ${activeTab === 'farmhouses' ? 'active' : ''}`}
        >
          Farm Houses
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
        >
          Bookings
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
        >
          Payments
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="section">
          <h2>All Users Management</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td><span className="badge">{user.role}</span></td>
                  <td>
                    <span className={`badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleBlockUser(user.id)}
                      className={user.isBlocked ? 'unblock-btn' : 'block-btn'}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'farmhouses' && (
        <div className="section">
          <h2>All Farm Houses</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Owner</th>
                <th>Price/Night</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {farmhouses.map((fh) => (
                <tr key={fh.id}>
                  <td>#{fh.id}</td>
                  <td>{fh.name}</td>
                  <td>{fh.location}</td>
                  <td>{fh.ownerName || 'N/A'}</td>
                  <td>₹{fh.pricePerDay}</td>
                  <td>
                    <span className={`badge ${fh.isApproved ? 'approved' : 'pending'}`}>
                      {fh.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDeleteFarmhouse(fh.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="section">
          <h2>All Bookings</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Farm House</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Total Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.userName || 'N/A'}</td>
                  <td>{booking.farmhouseName || 'N/A'}</td>
                  <td>{booking.startDate}</td>
                  <td>{booking.endDate}</td>
                  <td>₹{booking.totalPrice}</td>
                  <td><span className={`badge ${booking.status}`}>{booking.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="section">
          <h2>All Payments</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Booking ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>#{payment.bookingId}</td>
                  <td>₹{payment.amount}</td>
                  <td>{payment.paymentMethod || 'N/A'}</td>
                  <td><span className={`badge ${payment.paymentStatus}`}>{payment.paymentStatus}</span></td>
                  <td>{payment.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;
