import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { farmhouseAPI } from '../api/axiosInstance';

function FarmHouseDetail({ user }) {
  const { id } = useParams();
  const [farmhouse, setFarmhouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFarmhouseDetails();
  }, [id]);

  const fetchFarmhouseDetails = async () => {
    setLoading(true);
    try {
      const response = await farmhouseAPI.getFarmHouseById(id);
      if (response.data.success) {
        setFarmhouse(response.data.farmhouse);
      }
    } catch (err) {
      setError('Failed to fetch farmhouse details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !farmhouse) {
    return <div className="error-message">{error || 'Farmhouse not found'}</div>;
  }

  return (
    <div className="farmhouse-detail-container">
      <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
      
      <div className="detail-header">
        <img 
          src={farmhouse.imageUrl || 'https://via.placeholder.com/600'} 
          alt={farmhouse.name}
          className="detail-image"
        />
      </div>

      <div className="detail-content">
        <h1>{farmhouse.name}</h1>
        <p className="location">📍 {farmhouse.location}</p>
        
        <div className="basic-info">
          <span className="badge">🛏️ {farmhouse.bedrooms} Bedrooms</span>
          <span className="badge">🚿 {farmhouse.bathrooms} Bathrooms</span>
          <span className="badge">👥 Up to {farmhouse.maxGuests} Guests</span>
        </div>

        <div className="price-section">
          <h2>₹{farmhouse.pricePerDay} per night</h2>
          {user ? (
            <Link to={`/booking/${farmhouse.id}`} className="btn btn-primary btn-large">
              Book Now
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-large">
              Login to Book
            </Link>
          )}
        </div>

        <div className="description-section">
          <h3>Description</h3>
          <p>{farmhouse.description}</p>
        </div>

        <div className="amenities-section">
          <h3>Amenities</h3>
          <div className="amenities-list">
            {farmhouse.amenities ? (
              JSON.parse(farmhouse.amenities || '[]').map((amenity, idx) => (
                <span key={idx} className="amenity-tag">✓ {amenity}</span>
              ))
            ) : (
              <p>No amenities listed</p>
            )}
          </div>
        </div>

        <div className="owner-section">
          <h3>Host</h3>
          <p><strong>{farmhouse.ownerName}</strong></p>
        </div>

        <div className="availability-status">
          {farmhouse.available ? (
            <span className="available">✓ Available for booking</span>
          ) : (
            <span className="not-available">Not available</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default FarmHouseDetail;
