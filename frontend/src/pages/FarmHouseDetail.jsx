import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { farmhouseAPI } from "../api/axiosInstance";
import "./FarmHouseDetail.css";

function FarmHouseDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const defaultImage = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85";

  const [farmhouse, setFarmhouse] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFarmhouseDetails();
  }, [id]);

  const parseImageGallery = (data) => {
    if (!data) return [defaultImage];

    if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
      return data.imageUrls;
    }

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
        const parsed = typeof data.images === "string" ? JSON.parse(data.images) : data.images;
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch {
        // ignore
      }
    }

    return [defaultImage];
  };

  const fetchFarmhouseDetails = async () => {
    try {
      const response = await farmhouseAPI.getFarmHouseById(id);

      if (response.data.success) {
        const farmhouseData = response.data.farmhouse;
        const gallery = parseImageGallery(farmhouseData);
        setFarmhouse(farmhouseData);
        setGalleryImages(gallery);
        setSelectedImage(gallery[0] || defaultImage);
      }
    } catch (err) {
      setError("Unable to load farmhouse details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="loader">
        <h2>Loading...</h2>
      </div>
    );

  if (error || !farmhouse)
    return (
      <div className="error">
        <h2>{error || "Farmhouse not found"}</h2>
      </div>
    );

  let amenities = [];

  try {
    amenities = JSON.parse(farmhouse.amenities || "[]");
  } catch {
    amenities = [];
  }

  return (
    <div className="detail-page">

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="hero">

        <img src={selectedImage || defaultImage} alt={farmhouse.name} />

        <div className="overlay">
          <h1>{farmhouse.name}</h1>
          <p>📍 {farmhouse.location}</p>
        </div>

      </div>

      {galleryImages.length > 1 && (
        <div className="gallery-thumbnails">
          {galleryImages.map((image, index) => (
            <button
              type="button"
              key={`${image}-${index}`}
              className={selectedImage === image ? "thumbnail active" : "thumbnail"}
              onClick={() => setSelectedImage(image)}
            >
              <img src={image} alt={`Thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>
      )}

      <div className="detail-grid">

        <div className="left-card">

          <div className="info-box">
            <h2>About this Farmhouse</h2>

            <p>{farmhouse.description}</p>

            <div className="features">

              <div>🛏 {farmhouse.bedrooms} Bedrooms</div>

              <div>🚿 {farmhouse.bathrooms} Bathrooms</div>

              <div>👨‍👩‍👧 {farmhouse.maxGuests} Guests</div>

            </div>

          </div>

          <div className="info-box">

            <h2>Amenities</h2>

            <div className="amenities">

              {amenities.length > 0 ? (
                amenities.map((item, index) => (
                  <span key={index}>✓ {item}</span>
                ))
              ) : (
                <p>No amenities available.</p>
              )}

            </div>

          </div>

          <div className="info-box">

            <h2>Host</h2>

            <p>{farmhouse.ownerName}</p>

          </div>

        </div>

        <div className="booking-card">

          <h2>₹{farmhouse.pricePerDay}</h2>

          <p>Per Night</p>

          <div className="status">

            {farmhouse.available ? (
              <span className="available">
                ✔ Available
              </span>
            ) : (
              <span className="not-available">
                ❌ Not Available
              </span>
            )}

          </div>

          {user?.role === "OWNER" ? (
            <Link to="/create-estate" className="book-btn">
              Create Estate
            </Link>
          ) : user ? (
            <Link
              to={`/booking/${farmhouse.id}`}
              className="book-btn"
            >
              Book Now
            </Link>
          ) : (
            <Link
              to="/login"
              className="book-btn"
            >
              Login to Book
            </Link>
          )}

        </div>

      </div>

    </div>
  );
}

export default FarmHouseDetail;