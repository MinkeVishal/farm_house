import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { farmhouseAPI } from "../api/axiosInstance";
import "./FarmHouseDetail.css";

function FarmHouseDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const defaultImage =
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop";

  const [farmhouse, setFarmhouse] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    fetchFarmhouseDetails();
  }, [id]);

  const parseImageGallery = (data) => {
    if (!data) return [defaultImage];
    if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0)
      return data.imageUrls;
    if (typeof data.imageUrls === "string") {
      try {
        const parsed = JSON.parse(data.imageUrls);
        if (Array.isArray(parsed) && parsed.length) return parsed;
        if (typeof parsed === "string") return [parsed];
      } catch {
        return [data.imageUrls];
      }
    }
    if (data.imageUrl) return [data.imageUrl];
    if (data.images) {
      try {
        const parsed =
          typeof data.images === "string"
            ? JSON.parse(data.images)
            : data.images;
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch {
        // ignore
      }
    }
    return [defaultImage];
  };

  // Demo data shown when backend is offline
  const DEMO_FARMHOUSES = [
    { id: 1, name: 'Luxury Mountain Villa', location: 'Himachal Pradesh', description: 'Perched high in the Himalayan foothills, this stunning villa offers panoramic snow-capped mountain views, a roaring indoor fireplace, and crisp alpine air. Perfect for families seeking a peaceful mountain retreat with modern comforts.', pricePerDay: 5000, maxGuests: 6, bedrooms: 3, bathrooms: 4, available: true, ownerName: 'Rajesh Sharma', amenities: JSON.stringify(['Private Pool','Mountain View','Bonfire Pit','Free WiFi','Private Chef','Parking']), imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop' },
    { id: 2, name: 'Cozy Countryside Cottage', location: 'Goa', description: 'A charming whitewashed cottage nestled among swaying coconut palms and lush tropical gardens. Just 2 km from the beach, this intimate retreat is ideal for couples seeking a quiet romantic escape with authentic Goan hospitality.', pricePerDay: 3500, maxGuests: 4, bedrooms: 2, bathrooms: 3, available: true, ownerName: 'Priya Naik', amenities: JSON.stringify(['Garden','BBQ Grill','Hammock','AC','Beach Access','Breakfast Included']), imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format&fit=crop' },
    { id: 3, name: 'Modern Farm Estate', location: 'Punjab', description: 'A sprawling contemporary farmhouse estate with a massive private pool, professional DJ sound system, and party lawns that can host up to 150 guests. The ultimate venue for large celebrations, corporate events, or group getaways.', pricePerDay: 6000, maxGuests: 10, bedrooms: 5, bathrooms: 6, available: true, ownerName: 'Gurpreet Singh', amenities: JSON.stringify(['Infinity Pool','DJ Setup','Party Lawn','Catering','Bonfire','Sports Court','Parking for 20']), imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop' },
    { id: 4, name: 'Riverside Farmhouse', location: 'Uttarakhand', description: 'Wake up to the gentle sound of the Ganges flowing just beyond your window. This serene riverside farmhouse offers kayaking, river rafting day trips, forest treks, and starlit bonfires — a true nature lovers paradise.', pricePerDay: 4500, maxGuests: 8, bedrooms: 4, bathrooms: 5, available: true, ownerName: 'Ankit Rawat', amenities: JSON.stringify(['River View','Kayaking','Trekking','Yoga Lawn','Bonfire','Organic Meals','WiFi']), imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&auto=format&fit=crop' },
    { id: 5, name: 'Heritage Farm Resort', location: 'Rajasthan', description: 'Step back in time at this magnificent royal haveli converted into a luxury farmhouse resort. Featuring hand-painted frescoes, mirror-mosaic courtyards, camel rides at sunset, and traditional Rajasthani folk performances every evening.', pricePerDay: 4000, maxGuests: 6, bedrooms: 3, bathrooms: 4, available: true, ownerName: 'Vikram Singh Rathore', amenities: JSON.stringify(['Royal Courtyard','Camel Rides','Cultural Shows','Private Pool','Catering','Heritage Tour','AC']), imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop' },
  ];

  const fetchFarmhouseDetails = async () => {
    try {
      const response = await farmhouseAPI.getFarmHouseById(id);
      if (response.data.success) {
        const farmhouseData = response.data.farmhouse;
        const gallery = parseImageGallery(farmhouseData);
        setFarmhouse(farmhouseData);
        setGalleryImages(gallery);
        setSelectedImage(gallery[0] || defaultImage);
      } else {
        // fallback to demo data
        const demo = DEMO_FARMHOUSES.find((f) => f.id === parseInt(id)) || DEMO_FARMHOUSES[0];
        setFarmhouse(demo);
        setGalleryImages([demo.imageUrl]);
        setSelectedImage(demo.imageUrl);
      }
    } catch (err) {
      // backend offline — show demo farmhouse
      const demo = DEMO_FARMHOUSES.find((f) => f.id === parseInt(id)) || DEMO_FARMHOUSES[0];
      setFarmhouse(demo);
      setGalleryImages([demo.imageUrl]);
      setSelectedImage(demo.imageUrl);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="fd-loader">
        <div className="fd-spinner"></div>
        <p>Loading details...</p>
      </div>
    );

  if (error || !farmhouse)
    return (
      <div className="fd-error">
        <span>😔</span>
        <h2>{error || "Farmhouse not found"}</h2>
        <button onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );

  let amenities = [];
  try {
    amenities = JSON.parse(farmhouse.amenities || "[]");
  } catch {
    amenities = [];
  }

  const bookingLink =
    user?.role === "OWNER"
      ? "/create-estate"
      : user
      ? `/booking/${farmhouse.id}`
      : "/login";

  const bookingLabel =
    user?.role === "OWNER"
      ? "Create Estate"
      : user
      ? "Book Now →"
      : "Login to Book →";

  return (
    <div className="fd-page">
      {/* ── BACK BUTTON ── */}
      <button className="fd-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* ── HERO GALLERY ── */}
      <div className="fd-hero">
        <img src={selectedImage || defaultImage} alt={farmhouse.name} />
        <div className="fd-hero-overlay">
          <div className="fd-hero-badge">
            {farmhouse.available ? (
              <span className="fd-avail">✔ Available</span>
            ) : (
              <span className="fd-unavail">❌ Not Available</span>
            )}
          </div>
          <h1>{farmhouse.name}</h1>
          <p className="fd-location">📍 {farmhouse.location}</p>
        </div>
      </div>

      {/* ── THUMBNAIL STRIP ── */}
      {galleryImages.length > 1 && (
        <div className="fd-thumbs">
          {galleryImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              className={`fd-thumb ${selectedImage === img ? "active" : ""}`}
              onClick={() => setSelectedImage(img)}
            >
              <img src={img} alt={`View ${i + 1}`} />
            </button>
          ))}
        </div>
      )}

      {/* ── QUICK STATS RIBBON ── */}
      <div className="fd-stats-ribbon">
        <div className="fd-stat">
          <span className="fd-stat-icon">🛏️</span>
          <span className="fd-stat-num">{farmhouse.bedrooms || "—"}</span>
          <span className="fd-stat-lbl">Bedrooms</span>
        </div>
        <div className="fd-stat-divider" />
        <div className="fd-stat">
          <span className="fd-stat-icon">🚿</span>
          <span className="fd-stat-num">{farmhouse.bathrooms || "—"}</span>
          <span className="fd-stat-lbl">Bathrooms</span>
        </div>
        <div className="fd-stat-divider" />
        <div className="fd-stat">
          <span className="fd-stat-icon">👥</span>
          <span className="fd-stat-num">{farmhouse.maxGuests || "—"}</span>
          <span className="fd-stat-lbl">Max Guests</span>
        </div>
        <div className="fd-stat-divider" />
        <div className="fd-stat">
          <span className="fd-stat-icon">₹</span>
          <span className="fd-stat-num">
            {farmhouse.pricePerDay?.toLocaleString()}
          </span>
          <span className="fd-stat-lbl">Per Night</span>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="fd-main">
        {/* LEFT: detail panels */}
        <div className="fd-detail-col">
          {/* Tabs */}
          <div className="fd-tabs">
            {["about", "amenities", "host"].map((tab) => (
              <button
                key={tab}
                className={`fd-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "about"
                  ? "📖 About"
                  : tab === "amenities"
                  ? "✨ Amenities"
                  : "🏠 Host"}
              </button>
            ))}
          </div>

          {/* Tab: About */}
          {activeTab === "about" && (
            <div className="fd-panel">
              <h2>About this Farmhouse</h2>
              <p className="fd-description">{farmhouse.description}</p>

              <div className="fd-feature-grid">
                <div className="fd-feature-card">
                  <span>🛏️</span>
                  <strong>{farmhouse.bedrooms}</strong>
                  <small>Bedrooms</small>
                </div>
                <div className="fd-feature-card">
                  <span>🚿</span>
                  <strong>{farmhouse.bathrooms}</strong>
                  <small>Bathrooms</small>
                </div>
                <div className="fd-feature-card">
                  <span>👥</span>
                  <strong>{farmhouse.maxGuests}</strong>
                  <small>Max Guests</small>
                </div>
                <div className="fd-feature-card">
                  <span>📍</span>
                  <strong style={{ fontSize: "0.85rem" }}>
                    {farmhouse.location}
                  </strong>
                  <small>Location</small>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Amenities */}
          {activeTab === "amenities" && (
            <div className="fd-panel">
              <h2>What this place offers</h2>
              {amenities.length > 0 ? (
                <div className="fd-amenities-grid">
                  {amenities.map((item, i) => (
                    <div key={i} className="fd-amenity-chip">
                      <span className="fd-check">✓</span> {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="fd-empty">No amenities listed.</p>
              )}
            </div>
          )}

          {/* Tab: Host */}
          {activeTab === "host" && (
            <div className="fd-panel">
              <h2>Meet your Host</h2>
              <div className="fd-host-card">
                <div className="fd-host-avatar">
                  {farmhouse.ownerName
                    ? farmhouse.ownerName.charAt(0).toUpperCase()
                    : "H"}
                </div>
                <div className="fd-host-info">
                  <strong>{farmhouse.ownerName || "Your Host"}</strong>
                  <span>Property Owner</span>
                  <p>
                    Dedicated host ensuring your stay is comfortable and
                    memorable. Reach out for any special requirements.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: sticky booking card */}
        <div className="fd-booking-col">
          <div className="fd-booking-card">
            <div className="fd-price-row">
              <span className="fd-price">
                ₹{farmhouse.pricePerDay?.toLocaleString()}
              </span>
              <span className="fd-per-night">/ night</span>
            </div>

            <div className="fd-avail-row">
              {farmhouse.available ? (
                <span className="fd-avail">✔ Available for booking</span>
              ) : (
                <span className="fd-unavail">❌ Currently Unavailable</span>
              )}
            </div>

            <div className="fd-summary-list">
              <div className="fd-summary-row">
                <span>🛏 Bedrooms</span>
                <strong>{farmhouse.bedrooms}</strong>
              </div>
              <div className="fd-summary-row">
                <span>🚿 Bathrooms</span>
                <strong>{farmhouse.bathrooms}</strong>
              </div>
              <div className="fd-summary-row">
                <span>👥 Max Guests</span>
                <strong>{farmhouse.maxGuests}</strong>
              </div>
              <div className="fd-summary-row">
                <span>📍 Location</span>
                <strong>{farmhouse.location}</strong>
              </div>
            </div>

            <div className="fd-divider" />

            <Link to={bookingLink} className="fd-book-btn">
              {bookingLabel}
            </Link>

            {!user && (
              <p className="fd-login-hint">
                <Link to="/login">Log in</Link> or{" "}
                <Link to="/register">create an account</Link> to book
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── FLOATING BOOK NOW BAR (mobile) ── */}
      <div className="fd-sticky-bar">
        <div className="fd-sticky-info">
          <span className="fd-sticky-price">
            ₹{farmhouse.pricePerDay?.toLocaleString()}
          </span>
          <span className="fd-sticky-per"> / night</span>
        </div>
        <Link to={bookingLink} className="fd-sticky-btn">
          {bookingLabel}
        </Link>
      </div>
    </div>
  );
}

export default FarmHouseDetail;