import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { farmhouseAPI } from '../api/axiosInstance';
import './FarmHouseList.css';

const PAGE_SIZE = 6;

// Farmhouse Type Configurations
export const TYPE_CONFIG = {
  POOL_PARTY: {
    emoji: '🎉',
    label: 'Pool Party',
    color: '#ec4899',
    keywords: ['pool', 'party', 'dj', 'lawn', 'celebrat', 'club', 'cocktail', 'beach', 'villa'],
  },
  ZEN_RETREAT: {
    emoji: '🧘',
    label: 'Zen Retreat',
    color: '#10b981',
    keywords: ['zen', 'riverside', 'cottage', 'quiet', 'peace', 'mountain', 'nature', 'himalayan', 'yoga', 'sanctuary'],
  },
  ADVENTURE_WOODS: {
    emoji: '⛰️',
    label: 'Adventure Woods',
    color: '#059669',
    keywords: ['adventure', 'forest', 'woods', 'treehouse', 'camp', 'trek', 'kayak', 'bonfire', 'safari', 'chalet', 'dune'],
  },
  HERITAGE_PALACE: {
    emoji: '🏰',
    label: 'Heritage Palace',
    color: '#ea580c',
    keywords: ['heritage', 'palace', 'haveli', 'resort', 'royal', 'estate', 'vineyard', 'bungalow', 'plantation', 'houseboat'],
  },
};

export function getFarmHouseType(fh) {
  if (fh.type && TYPE_CONFIG[fh.type]) return fh.type;
  if (fh.farmhouseType && TYPE_CONFIG[fh.farmhouseType]) return fh.farmhouseType;

  const text = `${fh.name || ''} ${fh.description || ''} ${fh.amenities || ''} ${fh.location || ''}`.toLowerCase();

  for (const [tKey, config] of Object.entries(TYPE_CONFIG)) {
    for (const kw of config.keywords) {
      if (text.includes(kw)) {
        return tKey;
      }
    }
  }

  const idNum = Number(fh.id) || 1;
  const keys = ['POOL_PARTY', 'ZEN_RETREAT', 'ADVENTURE_WOODS', 'HERITAGE_PALACE'];
  return keys[idNum % keys.length];
}

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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get('type') || 'ALL';

  const [allFarmhouses, setAllFarmhouses] = useState([]);
  const [displayList, setDisplayList] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
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

  const paginate = useCallback((list, page) => {
    const total = Math.ceil(list.length / PAGE_SIZE);
    setTotalPages(total);
    setCurrentPage(page);
    setFilteredCount(list.length);
    const start = page * PAGE_SIZE;
    setDisplayList(list.slice(start, start + PAGE_SIZE));
  }, []);

  const applyFilters = useCallback((type, loc, minP, maxP, list = allFarmhouses) => {
    let result = list;

    // 1. Filter by Farmhouse Type
    if (type && type !== 'ALL') {
      result = result.filter((fh) => getFarmHouseType(fh) === type);
    }

    // 2. Filter by Location / Name
    if (loc && loc.trim()) {
      const q = loc.trim().toLowerCase();
      result = result.filter(
        (fh) => fh.location?.toLowerCase().includes(q) || fh.name?.toLowerCase().includes(q)
      );
    }

    // 3. Filter by Price Range
    if (minP || maxP) {
      const min = parseFloat(minP) || 0;
      const max = parseFloat(maxP) || Infinity;
      result = result.filter((fh) => fh.pricePerDay >= min && fh.pricePerDay <= max);
    }

    const hasFilter = type !== 'ALL' || !!loc.trim() || !!minP || !!maxP;
    setIsFiltered(hasFilter);
    paginate(result, 0);
  }, [allFarmhouses, paginate]);

  // Fetch all farmhouses once, then apply query param filter
  useEffect(() => {
    fetchFarmhouses();
  }, []);

  const fetchFarmhouses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await farmhouseAPI.getAllFarmHouses(0, 100);
      let data = DEMO_FARMHOUSES;
      if (response.data.success && response.data.farmhouses?.length > 0) {
        data = response.data.farmhouses;
      }
      setAllFarmhouses(data);
      applyFilters(activeType, searchLocation, minPrice, maxPrice, data);
    } catch (err) {
      setAllFarmhouses(DEMO_FARMHOUSES);
      applyFilters(activeType, searchLocation, minPrice, maxPrice, DEMO_FARMHOUSES);
    } finally {
      setLoading(false);
    }
  };

  // Re-run filter when URL type parameter changes
  useEffect(() => {
    if (allFarmhouses.length > 0) {
      applyFilters(activeType, searchLocation, minPrice, maxPrice, allFarmhouses);
    }
  }, [activeType, allFarmhouses, applyFilters]);

  const handleTypeSelect = (typeKey) => {
    if (typeKey === 'ALL') {
      searchParams.delete('type');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ type: typeKey });
    }
  };

  const handlePageChange = (newPage) => {
    let result = allFarmhouses;
    if (activeType && activeType !== 'ALL') {
      result = result.filter((fh) => getFarmHouseType(fh) === activeType);
    }
    if (searchLocation.trim()) {
      const q = searchLocation.trim().toLowerCase();
      result = result.filter(
        (fh) => fh.location?.toLowerCase().includes(q) || fh.name?.toLowerCase().includes(q)
      );
    }
    if (minPrice || maxPrice) {
      const min = parseFloat(minPrice) || 0;
      const max = parseFloat(maxPrice) || Infinity;
      result = result.filter((fh) => fh.pricePerDay >= min && fh.pricePerDay <= max);
    }
    paginate(result, newPage);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearchByLocation = (e) => {
    e.preventDefault();
    applyFilters(activeType, searchLocation, minPrice, maxPrice, allFarmhouses);
  };

  const handleSearchByPrice = (e) => {
    e.preventDefault();
    applyFilters(activeType, searchLocation, minPrice, maxPrice, allFarmhouses);
  };

  const handleClearFilters = () => {
    setSearchLocation('');
    setMinPrice('');
    setMaxPrice('');
    searchParams.delete('type');
    setSearchParams(searchParams);
    setIsFiltered(false);
    paginate(allFarmhouses, 0);
  };

  const getImageUrl = (fh) => {
    if (fh.imageUrl) return fh.imageUrl;
    if (fh.imageUrls && Array.isArray(fh.imageUrls) && fh.imageUrls.length > 0) return fh.imageUrls[0];
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
          <span className="fhl-hero-chip">
            {activeType !== 'ALL' && TYPE_CONFIG[activeType]
              ? `${TYPE_CONFIG[activeType].emoji} ${TYPE_CONFIG[activeType].label.toUpperCase()} ESTATES`
              : '🏡 ALL ESTATES'}
          </span>
          <h1>
            {activeType !== 'ALL' && TYPE_CONFIG[activeType] ? (
              <>
                {TYPE_CONFIG[activeType].emoji} {TYPE_CONFIG[activeType].label}
                <br />
                Farmhouse Collection
              </>
            ) : (
              <>
                Find Your Perfect<br />Farmhouse Escape
              </>
            )}
          </h1>
          <p>
            {activeType !== 'ALL' && TYPE_CONFIG[activeType]
              ? `Showing curated ${TYPE_CONFIG[activeType].label} farmhouses. Book now with exclusive category discount!`
              : 'Hand-picked luxury properties across India — private pools, bonfires, and breathtaking views await'}
          </p>
        </div>
      </div>

      {/* ── CATEGORY TYPE TABS ── */}
      <div className="fhl-category-tabs-wrap">
        <div className="fhl-category-tabs">
          <button
            type="button"
            className={`fhl-cat-tab ${activeType === 'ALL' ? 'active' : ''}`}
            onClick={() => handleTypeSelect('ALL')}
          >
            <span className="fhl-cat-icon">🌟</span>
            <span>All Types ({allFarmhouses.length})</span>
          </button>
          {Object.entries(TYPE_CONFIG).map(([tKey, config]) => {
            const count = allFarmhouses.filter((fh) => getFarmHouseType(fh) === tKey).length;
            return (
              <button
                key={tKey}
                type="button"
                className={`fhl-cat-tab ${activeType === tKey ? 'active' : ''}`}
                onClick={() => handleTypeSelect(tKey)}
              >
                <span className="fhl-cat-icon">{config.emoji}</span>
                <span>{config.label} ({count})</span>
              </button>
            );
          })}
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
            <button type="button" onClick={handleClearFilters} className="fhl-btn-clear">✕ Clear Filters</button>
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
            Showing <strong>{displayList.length}</strong> of <strong>{filteredCount}</strong>{' '}
            {activeType !== 'ALL' && TYPE_CONFIG[activeType] ? `${TYPE_CONFIG[activeType].label} ` : ''}estates
            {isFiltered && ' (filtered)'}
          </span>
          <span className="fhl-page-badge">Page {currentPage + 1} of {totalPages || 1}</span>
        </div>
      )}

      {error && <div className="fhl-error">{error}</div>}

      {/* ── FARMHOUSE GRID ── */}
      {displayList.length > 0 ? (
        <div className="fhl-grid">
          {displayList.map((fh, idx) => {
            const fhType = getFarmHouseType(fh);
            const typeConfig = TYPE_CONFIG[fhType] || TYPE_CONFIG.POOL_PARTY;

            return (
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
                  <div className="fhl-type-pill-badge">
                    {typeConfig.emoji} {typeConfig.label}
                  </div>
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
            );
          })}
        </div>
      ) : (
        <div className="fhl-empty">
          <span>🏚️</span>
          <h3>No {activeType !== 'ALL' && TYPE_CONFIG[activeType] ? TYPE_CONFIG[activeType].label : ''} estates matched your search</h3>
          <p>Try switching categories or clearing search filters.</p>
          <button type="button" onClick={handleClearFilters} className="fhl-btn-search">View All Estates</button>
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
