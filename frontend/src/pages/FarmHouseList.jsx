import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { farmhouseAPI } from '../api/axiosInstance';

function FarmHouseList() {
  const [farmhouses, setFarmhouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchFarmhouses();
  }, [page]);

  const fetchFarmhouses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await farmhouseAPI.getAllFarmHouses(page, 10);
      if (response.data.success) {
        setFarmhouses(response.data.farmhouses);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      setError('Failed to fetch farmhouses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByLocation = async (e) => {
    e.preventDefault();
    if (!searchLocation) return;
    
    setLoading(true);
    try {
      const response = await farmhouseAPI.searchByLocation(searchLocation, 0, 10);
      if (response.data.success) {
        setFarmhouses(response.data.farmhouses);
        setTotalPages(response.data.totalPages);
        setPage(0);
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByPrice = async (e) => {
    e.preventDefault();
    if (!minPrice || !maxPrice) return;
    
    setLoading(true);
    try {
      const response = await farmhouseAPI.searchByPrice(minPrice, maxPrice, 0, 10);
      if (response.data.success) {
        setFarmhouses(response.data.farmhouses);
        setTotalPages(response.data.totalPages);
        setPage(0);
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="farmhouse-list-container">
      <h1>Farm Houses</h1>

      <div className="search-section">
        <form onSubmit={handleSearchByLocation} className="search-form">
          <input
            type="text"
            placeholder="Search by location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
          <button type="submit" className="search-btn">Search Location</button>
        </form>

        <form onSubmit={handleSearchByPrice} className="price-filter">
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          <button type="submit" className="search-btn">Filter by Price</button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="farmhouses-grid">
        {farmhouses.length > 0 ? (
          farmhouses.map((fh) => (
            <div key={fh.id} className="farmhouse-card">
              <img 
                src={fh.imageUrl || 'https://via.placeholder.com/300'} 
                alt={fh.name}
                className="farmhouse-image"
              />
              <div className="farmhouse-info">
                <h3>{fh.name}</h3>
                <p className="location">📍 {fh.location}</p>
                <p className="description">{fh.description?.substring(0, 100)}...</p>
                <div className="details">
                  <span>🛏️ {fh.bedrooms} Beds</span>
                  <span>🚿 {fh.bathrooms} Baths</span>
                  <span>👥 {fh.maxGuests} Guests</span>
                </div>
                <p className="price">₹{fh.pricePerDay}/night</p>
                <div className="card-actions">
                  <Link to={`/farmhouses/${fh.id}`} className="btn btn-small btn-outline">
                    View Details
                  </Link>
                  <Link to={`/booking/${fh.id}`} className="btn btn-small btn-primary">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No farmhouses found</p>
        )}
      </div>

      <div className="pagination">
        <button 
          onClick={() => setPage(page - 1)} 
          disabled={page === 0}
          className="page-btn"
        >
          Previous
        </button>
        <span>Page {page + 1} of {totalPages}</span>
        <button 
          onClick={() => setPage(page + 1)} 
          disabled={page >= totalPages - 1}
          className="page-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default FarmHouseList;
