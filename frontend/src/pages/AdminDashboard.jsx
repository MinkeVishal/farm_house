import React, { useState, useEffect } from 'react';
import { userAPI, farmhouseAPI, bookingAPI, paymentAPI } from '../api/axiosInstance';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalPayments: 0,
  });
  const [farmhouses, setFarmhouses] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    pricePerDay: '',
    maxGuests: '',
    amenities: '',
    imageUrl: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch statistics
      const usersResponse = await userAPI.getAllUsers();
      const bookingsResponse = await bookingAPI.getAllBookings();
      const paymentsResponse = await paymentAPI.getAllPayments();
      
      setStats({
        totalUsers: usersResponse.data.users.length,
        totalBookings: bookingsResponse.data.bookings.length,
        totalPayments: paymentsResponse.data.payments.length,
      });

      setUsers(usersResponse.data.users);
      setBookings(bookingsResponse.data.bookings);

      // Fetch farmhouses pending approval
      const allFarmhousesResponse = await farmhouseAPI.getAllFarmHouses(0, 100);
      setFarmhouses(allFarmhousesResponse.data.farmhouses);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddFarmhouse = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!formData.name || !formData.location || !formData.pricePerDay) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    try {
      const farmhouseData = {
        ...formData,
        pricePerDay: parseFloat(formData.pricePerDay),
        maxGuests: parseInt(formData.maxGuests) || 1,
        amenities: formData.amenities.split(',').map((a) => a.trim()),
      };

      // Using admin ID as owner ID (default to 1 for now)
      const adminId = localStorage.getItem('userId') || 1;
      await farmhouseAPI.addFarmHouse(farmhouseData, adminId);

      setSubmitSuccess('Farm house added successfully!');
      setFormData({
        name: '',
        location: '',
        description: '',
        pricePerDay: '',
        maxGuests: '',
        amenities: '',
        imageUrl: '',
      });
      setShowAddForm(false);

      // Refresh data
      setTimeout(() => {
        fetchAdminData();
        setSubmitSuccess('');
      }, 2000);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to add farm house');
    }
  };

  const handleApproveFarmhouse = async (farmhouseId) => {
    try {
      const response = await farmhouseAPI.approveFarmHouse(farmhouseId);
      if (response.data.success) {
        alert('Farm house approved!');
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to approve farm house');
    }
  };

  const handleDeleteFarmhouse = async (farmhouseId) => {
    if (window.confirm('Are you sure you want to delete this farm house?')) {
      try {
        await farmhouseAPI.deleteFarmHouse(farmhouseId);
        alert('Farm house deleted!');
        fetchAdminData();
      } catch (err) {
        alert('Failed to delete farm house');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const unapprovedFarmhouses = farmhouses.filter((fh) => !fh.isApproved);

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>

      {activeTab === 'overview' && (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Total Bookings</h3>
              <p className="stat-number">{stats.totalBookings}</p>
            </div>
            <div className="stat-card">
              <h3>Total Payments</h3>
              <p className="stat-number">{stats.totalPayments}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Approvals</h3>
              <p className="stat-number">{unapprovedFarmhouses.length}</p>
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
      </div>

      {activeTab === 'users' && (
        <div className="section">
          <h2>All Users</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'farmhouses' && (
        <div className="section">
          <h2>Farm Houses Management</h2>
          
          {/* Add Farm House Form */}
          <div className="add-farmhouse-form-container" style={{ marginBottom: '30px', marginTop: '20px' }}>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
              style={{ marginBottom: '20px' }}
            >
              {showAddForm ? 'Cancel' : '+ Add New Farm House'}
            </button>

            {showAddForm && (
              <form onSubmit={handleAddFarmhouse} className="add-farmhouse-form" style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}>
                {submitSuccess && <div className="success-message" style={{ color: 'green', marginBottom: '15px' }}>{submitSuccess}</div>}
                {submitError && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{submitError}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Farm House Name *"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location *"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginBottom: '15px',
                    fontFamily: 'Arial, sans-serif'
                  }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <input
                    type="number"
                    name="pricePerDay"
                    placeholder="Price Per Day (₹) *"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    required
                    step="100"
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="number"
                    name="maxGuests"
                    placeholder="Max Guests"
                    value={formData.maxGuests}
                    onChange={handleInputChange}
                    min="1"
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <input
                  type="text"
                  name="imageUrl"
                  placeholder="Image URL"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginBottom: '15px'
                  }}
                />

                <textarea
                  name="amenities"
                  placeholder="Amenities (comma separated: WiFi, Pool, Kitchen, etc.)"
                  value={formData.amenities}
                  onChange={handleInputChange}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginBottom: '15px',
                    fontFamily: 'Arial, sans-serif'
                  }}
                />

                <button type="submit" className="btn btn-primary">
                  Add Farm House
                </button>
              </form>
            )}
          </div>

          <h3>Pending Approvals ({unapprovedFarmhouses.length})</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Owner</th>
                <th>Price/Night</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {unapprovedFarmhouses.map((fh) => (
                <tr key={fh.id}>
                  <td>{fh.name}</td>
                  <td>{fh.location}</td>
                  <td>{fh.ownerName}</td>
                  <td>₹{fh.pricePerDay}</td>
                  <td>
                    <span className="badge pending">Pending</span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleApproveFarmhouse(fh.id)}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleDeleteFarmhouse(fh.id)}
                      className="delete-btn"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>All Farm Houses</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Owner</th>
                <th>Price/Night</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {farmhouses.map((fh) => (
                <tr key={fh.id}>
                  <td>{fh.name}</td>
                  <td>{fh.location}</td>
                  <td>{fh.ownerName}</td>
                  <td>₹{fh.pricePerDay}</td>
                  <td>
                    <span className={`badge ${fh.isApproved ? 'approved' : 'pending'}`}>
                      {fh.isApproved ? 'Approved' : 'Pending'}
                    </span>
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
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Farm House</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>{b.userName}</td>
                  <td>{b.farmHouseName}</td>
                  <td>{b.startDate}</td>
                  <td>{b.endDate}</td>
                  <td>₹{b.totalPrice}</td>
                  <td>
                    <span className={`status-badge status-${b.status.toLowerCase()}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
