import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { farmhouseAPI } from '../api/axiosInstance';
import './FarmHouseList.css';

const PAGE_SIZE = 6;

// Demo farmhouses shown when backend is offline
const DEMO_FARMHOUSES = [
  { id: 1, name: 'Luxury Mountain Villa', location: 'Himachal Pradesh', description: 'Perched high in the Himalayan foothills, this stunning villa offers panoramic snow-capped mountain views, a roaring indoor fireplace, and crisp alpine air. Perfect for families seeking a peaceful retreat.', pricePerDay: 5000, maxGuests: 6, bedrooms: 3, bathrooms: 4, available: true, imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&auto=format&fit=crop' },
  { id: 2, name: 'Cozy Countryside Cottage', location: 'Goa', description: 'A charming whitewashed cottage nestled among swaying coconut palms and lush tropical gardens. Just 2 km from the beach, this retreat is ideal for couples seeking a quiet romantic escape.', pricePerDay: 3500, maxGuests: 4, bedrooms: 2, bathrooms: 3, available: true, imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop' },
  { id: 3, name: 'Modern Farm Estate', location: 'Punjab', description: 'A sprawling contemporary farmhouse with a massive private pool, professional DJ sound system, and party lawns that can host up to 150 guests. The ultimate venue for large celebrations.', pricePerDay: 6000, maxGuests: 10, bedrooms: 5, bathrooms: 6, available: true, imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop' },
  { id: 4, name: 'Riverside Farmhouse', location: 'Uttarakhand', description: 'Wake up to the gentle sound of the Ganges flowing just beyond your window. Offers kayaking, river rafting day trips, forest treks, and starlit bonfires — a true nature lovers paradise.', pricePerDay: 4500, maxGuests: 8, bedrooms: 4, bathrooms: 5, available: true, imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&auto=format&fit=crop' },
  { id: 5, name: 'Heritage Farm Resort', location: 'Rajasthan', description: 'Step back in time at this magnificent royal haveli converted into a luxury farmhouse resort. Features hand-painted frescoes, mirror-mosaic courtyards, camel rides at sunset, and folk performances.', pricePerDay: 4000, maxGuests: 6, bedrooms: 3, bathrooms: 4, available: true, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop' },
  { id: 6, name: 'Forest Treehouse Retreat', location: 'Karnataka', description: 'A magical treehouse-style farmhouse nestled inside a dense forest canopy. Complete with zip-line, hammock corners, stargazing decks, and fresh forest trail walks every morning.', pricePerDay: 3800, maxGuests: 5, bedrooms: 2, bathrooms: 2, available: true, imageUrl: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600&auto=format&fit=crop' },
  { id: 7, name: 'Beach Cove Villa', location: 'Kerala', description: 'An oceanfront villa with direct beach access, private infinity pool overlooking the Arabian Sea, traditional Kerala hammam, and a chef specializing in fresh seafood cuisine.', pricePerDay: 7000, maxGuests: 8, bedrooms: 4, bathrooms: 5, available: true, imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop' },
  { id: 8, name: 'Vineyard Estate', location: 'Nashik', description: 'A stunning vineyard estate surrounded by rows of grapevines. Includes a private cellar, wine-tasting sessions, horse rides through vineyards, and award-winning farm-to-table dining.', pricePerDay: 5500, maxGuests: 7, bedrooms: 4, bathrooms: 4, available: true, imageUrl: 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=600&auto=format&fit=crop' },
  { id: 9, name: 'Desert Dunes Camp', location: 'Jaisalmer', description: 'A golden desert camp experience with luxury tents, camel safaris, jeep dune rides, fire dance shows, traditional folk music under a sky full of stars in the heart of the Thar desert.', pricePerDay: 4200, maxGuests: 6, bedrooms: 3, bathrooms: 3, available: true, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop' },
  { id: 10, name: 'Coffee Plantation Bungalow', location: 'Coorg', description: 'Nestled within a vast coffee and cardamom plantation in the Coorg highlands. Wake up to the aroma of fresh coffee, go plantation walks, and enjoy misty mountain views from your verandah.', pricePerDay: 4600, maxGuests: 6, bedrooms: 3, bathrooms: 3, available: true, imageUrl: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&auto=format&fit=crop' },
  { id: 11, name: 'Backwaters Houseboat Villa', location: 'Alleppey', description: 'A floating luxury villa on the serene Kerala backwaters. Glide through narrow canals, watch village life from the deck, enjoy fresh toddy and seafood prepared by your personal on-board chef.', pricePerDay: 6500, maxGuests: 8, bedrooms: 4, bathrooms: 3, available: true, imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop' },
  { id: 12, name: 'Himalayan Snow Chalet', location: 'Manali', description: 'A luxury wooden chalet perched at 7,500ft altitude surrounded by pine forests and snow-capped peaks. Includes a hot tub, private bonfire, snowmobile rentals, and ski slope access nearby.', pricePerDay: 8000, maxGuests: 6, bedrooms: 3, bathrooms: 4, available: true, imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop' },
];

function FarmHouseList({ user }) {
  const [allFarmhouses, setAllFarmhouses] = useState([]);
  const [displayList, setDisplayList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchLocation, setSearchLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);

  // Client-side pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const gridRef = useRef(null);

  // Fetch all farmhouses once, then paginate client-side
  useEffect(() => {
    fetchFarmhouses();
  }, []);

  const fetchFarmhouses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await farmhouseAPI.getAllFarmHouses(0, 100);
      if (response.data.success && response.data.farmhouses?.length > 0) {
        setAllFarmhouses(response.data.farmhouses);
        paginate(response.data.farmhouses, 0);
      } else {
        // Use demo data when backend returns empty
        setAllFarmhouses(DEMO_FARMHOUSES);
        paginate(DEMO_FARMHOUSES, 0);
      }
    } catch (err) {
      // Backend offline — use demo data
      setAllFarmhouses(DEMO_FARMHOUSES);
      paginate(DEMO_FARMHOUSES, 0);
    } finally {
      setLoading(false);
    }
  };

  const paginate = (list, page) => {
    const total = Math.ceil(list.length / PAGE_SIZE);
    setTotalPages(total);
    setCurrentPage(page);
    const start = page * PAGE_SIZE;
    setDisplayList(list.slice(start, start + PAGE_SIZE));
  };

  const handlePageChange = (newPage) => {
    paginate(allFarmhouses, newPage);
    // Smooth scroll to top of grid
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearchByLocation = (e) => {
    e.preventDefault();
    const query = searchLocation.trim().toLowerCase();
    if (!query) {
      setIsFiltered(false);
      paginate(allFarmhouses, 0);
      return;
    }
    const filtered = allFarmhouses.filter(fh =>
      fh.location?.toLowerCase().includes(query) ||
      fh.name?.toLowerCase().includes(query)
    );
    setIsFiltered(true);
    paginate(filtered.length > 0 ? filtered : [], 0);
  };

  const handleSearchByPrice = (e) => {
    e.preventDefault();
    if (!minPrice && !maxPrice) return;
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;
    const filtered = allFarmhouses.filter(fh =>
      fh.pricePerDay >= min && fh.pricePerDay <= max
    );
    setIsFiltered(true);
    paginate(filtered.length > 0 ? filtered : [], 0);
  };

  const handleClearFilters = () => {
    setSearchLocation('');
    setMinPrice('');
    setMaxPrice('');
    setIsFiltered(false);
    paginate(allFarmhouses, 0);
  };

  const getImageUrl = (fh) => {
    if (fh.imageUrls && Array.isArray(fh.imageUrls) && fh.imageUrls.length > 0) return fh.imageUrls[0];
    if (fh.imageUrl) return fh.imageUrl;
    return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop';
  };

  if (loading) {
    return (
      <div className="fhl-loader">
        <div className="fhl-spinner" />
        <p>Discovering beautiful estates…</p>
      </div>
    );
  }

  return (
    <div className="fhl-page">
      {/* ── HERO BANNER ── */}
      <div className="fhl-hero">
        <div className="fhl-hero-blob b1" />
        <div className="fhl-hero-blob b2" />
        <div className="fhl-hero-content">
          <span className="fhl-hero-chip">🏡 ALL ESTATES</span>
          <h1>Find Your Perfect<br />Farmhouse Escape</h1>
          <p>Hand-picked luxury properties across India — private pools, bonfires, and breathtaking views await</p>
        </div>
      </div>

      {/* ── SEARCH / FILTER BAR ── */}
      <div className="fhl-filter-bar">
        <form onSubmit={handleSearchByLocation} className="fhl-search-form">
          <div className="fhl-input-wrap">
            <span className="fhl-input-icon">📍</span>
            <input
              type="text"
              placeholder="Search by location or name…"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>
          <button type="submit" className="fhl-btn-search">Search</button>
        </form>

        <form onSubmit={handleSearchByPrice} className="fhl-price-form">
          <div className="fhl-input-wrap">
            <span className="fhl-input-icon">₹</span>
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="fhl-input-wrap">
            <span className="fhl-input-icon">₹</span>
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <button type="submit" className="fhl-btn-search">Filter</button>
        </form>

        <div className="fhl-filter-actions">
          {isFiltered && (
            <button onClick={handleClearFilters} className="fhl-btn-clear">✕ Clear Filters</button>
          )}
          {user?.role === 'OWNER' && (
            <Link to="/create-estate" className="fhl-btn-add">+ Add Estate</Link>
          )}
        </div>
      </div>

      {/* ── RESULTS COUNT ── */}
      {!loading && (
        <div className="fhl-results-info" ref={gridRef}>
          <span>
            Showing <strong>{displayList.length}</strong> of <strong>{allFarmhouses.length}</strong> estates
            {isFiltered && ' (filtered)'}
          </span>
          <span className="fhl-page-badge">Page {currentPage + 1} of {totalPages || 1}</span>
        </div>
      )}

      {error && <div className="fhl-error">{error}</div>}

      {/* ── FARMHOUSE GRID ── */}
      {displayList.length > 0 ? (
        <div className="fhl-grid">
          {displayList.map((fh, idx) => (
            <div
              key={fh.id}
              className="fhl-card"
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <div className="fhl-card-img-wrap">
                <img src={getImageUrl(fh)} alt={fh.name} className="fhl-card-img" />
                <div className="fhl-price-badge">
                  ₹{fh.pricePerDay?.toLocaleString()}
                  <small>/night</small>
                </div>
                <div className="fhl-loc-badge">📍 {fh.location}</div>
                {fh.available === false && (
                  <div className="fhl-unavail-badge">❌ Unavailable</div>
                )}
              </div>

              <div className="fhl-card-body">
                <h3 className="fhl-card-title">{fh.name}</h3>
                <p className="fhl-card-desc">{fh.description?.substring(0, 110)}…</p>

                <div className="fhl-card-meta">
                  <span>🛏️ {fh.bedrooms || 3} Beds</span>
                  <span>🚿 {fh.bathrooms || 2} Baths</span>
                  <span>👥 {fh.maxGuests || 4} Guests</span>
                </div>

                <div className="fhl-card-footer">
                  <Link to={`/farmhouses/${fh.id}`} className="fhl-view-btn">
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="fhl-empty">
          <span>🏚️</span>
          <h3>No estates matched your search</h3>
          <p>Try a different location, name or price range.</p>
          <button onClick={handleClearFilters} className="fhl-btn-search">Reset Filters</button>
        </div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="fhl-pagination">
          <button
            className="fhl-pag-btn fhl-pag-prev"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            ← Previous
          </button>

          <div className="fhl-pag-numbers">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`fhl-pag-num ${currentPage === i ? 'active' : ''}`}
                onClick={() => handlePageChange(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            className="fhl-pag-btn fhl-pag-next"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default FarmHouseList;
