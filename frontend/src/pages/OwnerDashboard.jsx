import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { farmhouseAPI, bookingAPI } from '../api/axiosInstance';

function OwnerDashboard({ user }) {
  const [farmhouses, setFarmhouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    pricePerDay: '',
    maxGuests: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '["WiFi", "Pool", "Garden"]',
    imageUrl: '',
  });

  useEffect(() => {
    fetchOwnerData();
  }, [user.id]);

  const fetchOwnerData = async () => {
    try {
      const fhResponse = await farmhouseAPI.getFarmHousesByOwner(user.id);
      if (fhResponse.data.success) {
        setFarmhouses(fhResponse.data.farmhouses);
      }

      const bookResponse = await Promise.all(
        fhResponse.data.farmhouses.map((fh) =>
          bookingAPI.getFarmHouseBookings(fh.id)
        )
      );
      let allBookings = [];
      bookResponse.forEach((resp) => {
        if (resp.data.success) {
          allBookings = [...allBookings, ...resp.data.bookings];
        }
      });
      setBookings(allBookings);
    } catch (err) {
      console.error('Error fetching owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddFarmhouse = async (e) => {
    e.preventDefault();
    try {
      const response = await farmhouseAPI.addFarmHouse(
        {
          ...formData,
          pricePerDay: parseFloat(formData.pricePerDay),
          maxGuests: parseInt(formData.maxGuests),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
        },
        user.id
      );

      if (response.data.success) {
        alert('Farm house added successfully!');
        setFormData({
          name: '',
          location: '',
          description: '',
          pricePerDay: '',
          maxGuests: '',
          bedrooms: '',
          bathrooms: '',
          amenities: '["WiFi", "Pool", "Garden"]',
          imageUrl: '',
        });
        setShowAddForm(false);
        fetchOwnerData();
      }
    } catch (err) {
      alert('Failed to add farm house');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="owner-dashboard-container">
      <h1>Owner Dashboard</h1>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total FarmHouses</h3>
          <p className="stat-number">{farmhouses.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-number">{bookings.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">
            ₹{bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="section">
        <h2>Your Farm Houses</h2>
        <div className="owner-section-actions">
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
            {showAddForm ? 'Cancel' : '+ Add New Farm House'}
          </button>
          <Link to="/create-estate" className="btn btn-secondary">
            Create Estate Page
          </Link>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddFarmhouse} className="add-farmhouse-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Price per Day:</label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Max Guests:</label>
              <input
                type="number"
                name="maxGuests"
                value={formData.maxGuests}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Bedrooms:</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Bathrooms:</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Image URL:</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleFormChange}
              />
            </div>
            <button type="submit" className="submit-btn">Add Farm House</button>
          </form>
        )}

        <div className="farmhouses-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Price/Night</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {farmhouses.map((fh) => (
                <tr key={fh.id}>
                  <td>{fh.name}</td>
                  <td>{fh.location}</td>
                  <td>₹{fh.pricePerDay}</td>
                  <td>
                    <span className={`badge ${fh.isApproved ? 'approved' : 'pending'}`}>
                      {fh.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button className="edit-btn">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2>Recent Bookings</h2>
        <div className="bookings-table">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Farm House</th>
                <th>Guest</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 10).map((b) => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>{b.farmHouseName}</td>
                  <td>{b.userName}</td>
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
      </div>
    </div>
  );
}

export default OwnerDashboard;
