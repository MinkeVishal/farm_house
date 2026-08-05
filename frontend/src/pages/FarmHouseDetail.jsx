import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { farmhouseAPI } from "../api/axiosInstance";
import "./FarmHouseDetail.css";

const getLocationType = (location = "") => {
  const loc = location.toLowerCase();
  if (loc.includes("goa")) return "coastal";
  if (loc.includes("himachal") || loc.includes("kashmir")) return "mountain";
  if (loc.includes("uttarakhand") || loc.includes("river")) return "riverside";
  if (loc.includes("rajasthan") || loc.includes("jaipur") || loc.includes("jodhpur")) return "heritage";
  if (loc.includes("punjab") || loc.includes("farm")) return "plains";
  return "default";
};

const TIMELINE_DATA = {
  coastal: {
    morning: { title: "Morning Bliss 🌅", icon: "🌅", desc: "Wake up to the soft sound of waves. Enjoy fresh coconut water on the sun-loungers in the garden.", gradient: "linear-gradient(135deg, #FFF9E6, #FFF0D4)" },
    afternoon: { title: "Pool & Sun 🏊", icon: "🏊", desc: "Dive into the cool private pool or take a short 2km stroll to the pristine beach for sunbathing.", gradient: "linear-gradient(135deg, #E6F7FF, #BAE7FF)" },
    evening: { title: "Sunset Cocktails 🍹", icon: "🍹", desc: "Relax on the outdoor terrace as the sky turns orange, enjoying local seafood prepared by your private chef.", gradient: "linear-gradient(135deg, #FFE7BA, #FFD591)" },
    night: { title: "Hammock & Stargazing ✨", icon: "✨", desc: "Lie on the hammock under swaying palms, listening to the gentle evening breeze and starry sky.", gradient: "linear-gradient(135deg, #001529, #002766)", dark: true }
  },
  mountain: {
    morning: { title: "Alpine Sunrise 🏔️", icon: "🏔️", desc: "Breathe in crisp, fresh mountain air. Watch the golden sunrise over snow-capped Himalayan peaks with hot tea.", gradient: "linear-gradient(135deg, #FFFBE6, #FFE58F)" },
    afternoon: { title: "Forest Trekking 🥾", icon: "🥾", desc: "Embark on a guided nature walk through surrounding pine forests, exploring nearby hidden streams.", gradient: "linear-gradient(135deg, #F6FFED, #D9F7BE)" },
    evening: { title: "Cozy Hearth 🔥", icon: "🔥", desc: "Gather inside around the roaring fireplace. Savor hot local dishes and share stories with family.", gradient: "linear-gradient(135deg, #FFF2E8, #FFD8BF)" },
    night: { title: "Starlit Bonfire ✨", icon: "✨", desc: "Head out to the bonfire pit for a cozy night under a brilliant canopy of stars, roasting marshmallows.", gradient: "linear-gradient(135deg, #090b10, #141b2d)", dark: true }
  },
  riverside: {
    morning: { title: "River Mist Yoga 🧘", icon: "🧘", desc: "Perform morning yoga on the green lawn as the river mist clears. Wake up to the gentle flow of water.", gradient: "linear-gradient(135deg, #E6FFFB, #B5F5EC)" },
    afternoon: { title: "Kayaking Adventure 🛶", icon: "🛶", desc: "Go kayaking or river rafting just steps away from your villa, followed by a picnic on the riverbanks.", gradient: "linear-gradient(135deg, #E6F7FF, #91D5FF)" },
    evening: { title: "Fresh Catch BBQ 🍢", icon: "🍢", desc: "Enjoy a fresh barbecue session on the river deck with marinated treats cooked over hot charcoal.", gradient: "linear-gradient(135deg, #FFF2E8, #FFA940)" },
    night: { title: "Guitar & Bonfire 🔥", icon: "🔥", desc: "Sit by the riverside bonfire under the stars, enjoying acoustic music and the soothing sound of the river.", gradient: "linear-gradient(135deg, #081220, #030852)", dark: true }
  },
  heritage: {
    morning: { title: "Royal Courtyard 🏰", icon: "🏰", desc: "Wake up to peacock calls. Sip traditional masala chai in the hand-painted frescoed royal courtyard.", gradient: "linear-gradient(135deg, #FFFBE6, #FFE58F)" },
    afternoon: { title: "Camel Safari 🐫", icon: "🐫", desc: "Embark on an exciting camel ride at sunset through the nearby golden sand dunes or heritage village tour.", gradient: "linear-gradient(135deg, #FFE7BA, #FFC069)" },
    evening: { title: "Cultural Folk Show 💃", icon: "💃", desc: "Watch traditional Rajasthani folk performances and fire dances right in the courtyard of your haveli.", gradient: "linear-gradient(135deg, #FFF0F6, #FFADD2)" },
    night: { title: "Royal Dinner 👑", icon: "👑", desc: "Relish a candlelit dinner featuring traditional Rajasthani delicacies served under a canopy of stars.", gradient: "linear-gradient(135deg, #1f0b08, #3a150f)", dark: true }
  },
  plains: {
    morning: { title: "Tractor Ride & Farm Tour 🚜", icon: "🚜", desc: "Take an authentic tractor ride through green mustard fields. Breathe in the earthy fragrance of the village.", gradient: "linear-gradient(135deg, #FCFFE6, #EAFF8F)" },
    afternoon: { title: "Lassi & Organic Lunch 🥛", icon: "🥛", desc: "Gulp down tall glasses of fresh buttermilk (lassi) and savor a farm-to-table lunch made from organic crops.", gradient: "linear-gradient(135deg, #F9F0FF, #E8D0FF)" },
    evening: { title: "Sports & Kite Flying 🪁", icon: "🪁", desc: "Play cricket or volleyball on the massive party lawns, or fly colorful kites in the evening breeze.", gradient: "linear-gradient(135deg, #E6F7FF, #BAE7FF)" },
    night: { title: "Tandoor & Folk Tales 🔥", icon: "🔥", desc: "Indulge in piping-hot tandoori snacks straight from the clay oven around a warm open-air bonfire.", gradient: "linear-gradient(135deg, #2d1e08, #543b12)", dark: true }
  },
  default: {
    morning: { title: "Peaceful Morning 🍃", icon: "🍃", desc: "Wake up to chirping birds, stretch on the green grass, and enjoy a quiet breakfast outdoors.", gradient: "linear-gradient(135deg, #F9F0FF, #EFDBFF)" },
    afternoon: { title: "Leisure & Games 🎮", icon: "🎮", desc: "Play indoor board games, swim in the private pool, or read a book in the shaded garden corners.", gradient: "linear-gradient(135deg, #E6F7FF, #BAE7FF)" },
    evening: { title: "Lawn BBQ Party 🍗", icon: "🍗", desc: "Fire up the BBQ grill on the open lawn. Enjoy music and grilled delicacies with your group.", gradient: "linear-gradient(135deg, #FFE7BA, #FFD591)" },
    night: { title: "Starlight Bonfire 🌌", icon: "🌌", desc: "Relax around the bonfire pit, listen to good music, and gaze at the stars away from city lights.", gradient: "linear-gradient(135deg, #101420, #1b2030)", dark: true }
  }
};

const WEATHER_DATA = {
  coastal: { temp: "29°C", condition: "Sunny & Tropical ☀️", wind: "14 km/h", humidity: "78%" },
  mountain: { temp: "12°C", condition: "Crisp & Chilly ❄️", wind: "18 km/h", humidity: "45%" },
  riverside: { temp: "22°C", condition: "Mist & Cool Breeze 🍃", wind: "10 km/h", humidity: "62%" },
  heritage: { temp: "34°C", condition: "Warm & Dry ☀️", wind: "12 km/h", humidity: "28%" },
  plains: { temp: "26°C", condition: "Lush & Clear Sky ☀️", wind: "8 km/h", humidity: "50%" },
  default: { temp: "24°C", condition: "Pleasant & Clear 🌤️", wind: "11 km/h", humidity: "55%" }
};

const PACKING_DATA = {
  coastal: [
    { id: 1, text: "Swimwear / Beachwear 🩱", checked: false },
    { id: 2, text: "High SPF Sunscreen & Sunglasses 🕶️", checked: false },
    { id: 3, text: "Light cotton clothing 👕", checked: false },
    { id: 4, text: "Flip-flops & Beach towel 🩴", checked: false },
    { id: 5, text: "Insect repellent spray 🦟", checked: false }
  ],
  mountain: [
    { id: 1, text: "Heavy jacket & Sweaters 🧥", checked: false },
    { id: 2, text: "Sturdy hiking boots 🥾", checked: false },
    { id: 3, text: "Warm socks & Beanie 🧦", checked: false },
    { id: 4, text: "Lip balm & Moisturizer 🧴", checked: false },
    { id: 5, text: "Thermos flask for hot water 🧉", checked: false }
  ],
  riverside: [
    { id: 1, text: "Waterproof shoes / Sandals 👟", checked: false },
    { id: 2, text: "Quick-dry shorts & shirts 🎽", checked: false },
    { id: 3, text: "Windcheater / Light jacket 🧥", checked: false },
    { id: 4, text: "Waterproof dry bag for phone 🎒", checked: false },
    { id: 5, text: "Personal speakers for campfire 🎵", checked: false }
  ],
  heritage: [
    { id: 1, text: "Breathable linen shirts 👕", checked: false },
    { id: 2, text: "Sun hat / Umbrella 👒", checked: false },
    { id: 3, text: "Polarized sunglasses 🕶️", checked: false },
    { id: 4, text: "Camera for cultural snaps 📷", checked: false },
    { id: 5, text: "Rehydration salts / Electrolytes 🥤", checked: false }
  ],
  plains: [
    { id: 1, text: "Comfortable sports shoes 👟", checked: false },
    { id: 2, text: "Casual outfits for outdoors 👖", checked: false },
    { id: 3, text: "Caps / Sun visors 🧢", checked: false },
    { id: 4, text: "Binoculars for bird watching 🔭", checked: false },
    { id: 5, text: "Hand sanitizer & Wet wipes 🧻", checked: false }
  ],
  default: [
    { id: 1, text: "Comfortable clothing 👕", checked: false },
    { id: 2, text: "Casual walking shoes 👟", checked: false },
    { id: 3, text: "Personal toiletries 🧴", checked: false },
    { id: 4, text: "Phone charger & Powerbank 🔋", checked: false },
    { id: 5, text: "First-aid essentials 🩹", checked: false }
  ]
};

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

  const [activeTimeOfDay, setActiveTimeOfDay] = useState("morning");
  const [checklist, setChecklist] = useState([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [addons, setAddons] = useState({
    chef: false,
    bonfire: false,
    dj: false,
    adventure: false,
  });

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
      let fhData = null;
      if (response.data.success) {
        fhData = response.data.farmhouse;
        const gallery = parseImageGallery(fhData);
        setFarmhouse(fhData);
        setGalleryImages(gallery);
        setSelectedImage(gallery[0] || defaultImage);
      } else {
        // fallback to demo data
        const demo = DEMO_FARMHOUSES.find((f) => f.id === parseInt(id)) || DEMO_FARMHOUSES[0];
        fhData = demo;
        setFarmhouse(demo);
        setGalleryImages([demo.imageUrl]);
        setSelectedImage(demo.imageUrl);
      }
      if (fhData) {
        const type = getLocationType(fhData.location);
        setChecklist((PACKING_DATA[type] || PACKING_DATA.default).map(item => ({ ...item })));
      }
    } catch (err) {
      // backend offline — show demo farmhouse
      const demo = DEMO_FARMHOUSES.find((f) => f.id === parseInt(id)) || DEMO_FARMHOUSES[0];
      setFarmhouse(demo);
      setGalleryImages([demo.imageUrl]);
      setSelectedImage(demo.imageUrl);
      const type = getLocationType(demo.location);
      setChecklist((PACKING_DATA[type] || PACKING_DATA.default).map(item => ({ ...item })));
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
      : null; // handled via onClick for non-logged-in users

  const bookingLabel =
    user?.role === "OWNER"
      ? "Create Estate"
      : user
      ? "Book Now →"
      : "Login to Book →";

  const handleBookClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate("/login", { 
        state: { 
          redirectTo: `/booking/${farmhouse.id}`,
          prefilledStartDate: checkIn,
          prefilledEndDate: checkOut,
          prefilledGuests: guestsCount,
          prefilledAddons: addons
        } 
      });
    }
  };

  const calculateBookingDetails = () => {
    let nights = 0;
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
    nights = nights > 0 ? nights : 0;

    const baseCost = (farmhouse?.pricePerDay || 0) * nights;
    
    let chefCost = 0;
    if (addons.chef && nights > 0) {
      chefCost = 1800 * guestsCount * nights;
    }
    
    const flatCost = 
      (addons.bonfire ? 1500 : 0) +
      (addons.dj ? 4000 : 0) +
      (addons.adventure ? 2500 : 0);

    const subtotal = baseCost + chefCost + flatCost;
    const gst = Math.round(subtotal * 0.18);
    const serviceFee = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + gst + serviceFee;

    return { nights, baseCost, chefCost, flatCost, subtotal, gst, serviceFee, grandTotal };
  };

  const { nights, baseCost, chefCost, flatCost, subtotal, gst, serviceFee, grandTotal } = calculateBookingDetails();

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
            {["about", "experience", "amenities", "host"].map((tab) => (
              <button
                key={tab}
                className={`fd-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "about"
                  ? "📖 About"
                  : tab === "experience"
                  ? "✨ Live Experience"
                  : tab === "amenities"
                  ? "🌿 Amenities"
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

          {/* Tab: Live Experience */}
          {activeTab === "experience" && (
            <div className="fd-panel fd-exp-panel">
              {/* Weather Simulator */}
              <div className="fd-weather-widget">
                <h3>🌦️ Simulated Climate Forecast</h3>
                <div className="fd-weather-card">
                  <div className="fd-weather-metric">
                    <span className="fd-weather-lbl">Current Temp</span>
                    <span className="fd-weather-val">{WEATHER_DATA[getLocationType(farmhouse.location)]?.temp || "24°C"}</span>
                  </div>
                  <div className="fd-weather-metric">
                    <span className="fd-weather-lbl">Conditions</span>
                    <span className="fd-weather-val">{WEATHER_DATA[getLocationType(farmhouse.location)]?.condition || "Pleasant 🌤️"}</span>
                  </div>
                  <div className="fd-weather-metric">
                    <span className="fd-weather-lbl">Wind Speed</span>
                    <span className="fd-weather-val">{WEATHER_DATA[getLocationType(farmhouse.location)]?.wind || "11 km/h"}</span>
                  </div>
                  <div className="fd-weather-metric">
                    <span className="fd-weather-lbl">Humidity</span>
                    <span className="fd-weather-val">{WEATHER_DATA[getLocationType(farmhouse.location)]?.humidity || "55%"}</span>
                  </div>
                </div>
              </div>

              {/* Day in the Life Timeline */}
              <div className="fd-timeline-section">
                <h3>🌅 "A Day at the Estate" Experience</h3>
                <p className="fd-timeline-subtitle">Click a time block below to see what a perfect day feels like here</p>
                
                <div className="fd-timeline-tabs">
                  {["morning", "afternoon", "evening", "night"].map((time) => (
                    <button
                      key={time}
                      className={`fd-time-btn ${activeTimeOfDay === time ? "active" : ""}`}
                      onClick={() => setActiveTimeOfDay(time)}
                    >
                      {time === "morning" ? "🌅 Morning" : time === "afternoon" ? "🚣 Afternoon" : time === "evening" ? "🍲 Evening" : "✨ Night"}
                    </button>
                  ))}
                </div>

                {(() => {
                  const type = getLocationType(farmhouse.location);
                  const data = TIMELINE_DATA[type]?.[activeTimeOfDay] || TIMELINE_DATA.default[activeTimeOfDay];
                  return (
                    <div 
                      className={`fd-timeline-card ${data.dark ? "dark" : ""}`}
                      style={{ background: data.gradient }}
                    >
                      <div className="fd-timeline-icon">{data.icon}</div>
                      <div className="fd-timeline-content">
                        <h4>{data.title}</h4>
                        <p>{data.desc}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Smart Packing Checklist */}
              <div className="fd-packing-section">
                <h3>🎒 Smart Packing Assistant</h3>
                <p className="fd-packing-subtitle">We've customized a list of essentials based on this farmhouse's environment. Check them off as you pack!</p>
                
                {/* Progress bar */}
                {checklist.length > 0 && (
                  <div className="fd-progress-container">
                    <div className="fd-progress-bar-wrap">
                      <div 
                        className="fd-progress-bar" 
                        style={{ width: `${(checklist.filter(c => c.checked).length / checklist.length) * 100}%` }}
                      />
                    </div>
                    <span className="fd-progress-lbl">
                      {checklist.filter(c => c.checked).length} of {checklist.length} packed
                    </span>
                  </div>
                )}

                <div className="fd-checklist">
                  {checklist.map((item) => (
                    <label key={item.id} className={`fd-check-item ${item.checked ? "checked" : ""}`}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {
                          setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, checked: !c.checked } : c));
                        }}
                      />
                      <span className="fd-check-text">{item.text}</span>
                    </label>
                  ))}
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

            {/* Interactive Inputs */}
            <div className="fd-calculator-inputs">
              <div className="fd-calc-row">
                <div className="fd-input-group">
                  <label>Check In</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="fd-input-group">
                  <label>Check Out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              
              <div className="fd-input-group">
                <label>Guests (Max {farmhouse.maxGuests})</label>
                <input
                  type="number"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Math.min(Math.max(parseInt(e.target.value) || 1, 1), farmhouse.maxGuests))}
                  min="1"
                  max={farmhouse.maxGuests}
                />
              </div>

              {/* Addons Checklist */}
              <div className="fd-addons-group">
                <span className="fd-addons-title">✨ Customize Stay (Add-ons)</span>
                <div className="fd-addons-list">
                  <label className="fd-addon-toggle">
                    <input
                      type="checkbox"
                      checked={addons.chef}
                      onChange={() => setAddons(p => ({ ...p, chef: !p.chef }))}
                    />
                    <span className="fd-addon-lbl">👨‍🍳 Chef & Catering (+₹1,800/g/n)</span>
                  </label>
                  <label className="fd-addon-toggle">
                    <input
                      type="checkbox"
                      checked={addons.bonfire}
                      onChange={() => setAddons(p => ({ ...p, bonfire: !p.bonfire }))}
                    />
                    <span className="fd-addon-lbl">🪵 Bonfire Setup (₹1,500)</span>
                  </label>
                  <label className="fd-addon-toggle">
                    <input
                      type="checkbox"
                      checked={addons.dj}
                      onChange={() => setAddons(p => ({ ...p, dj: !p.dj }))}
                    />
                    <span className="fd-addon-lbl">🎵 DJ Sound System (₹4,000)</span>
                  </label>
                  <label className="fd-addon-toggle">
                    <input
                      type="checkbox"
                      checked={addons.adventure}
                      onChange={() => setAddons(p => ({ ...p, adventure: !p.adventure }))}
                    />
                    <span className="fd-addon-lbl">🛶 Adventure Tour (₹2,500)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="fd-divider" />

            {/* Bill Breakdown */}
            {nights > 0 && (
              <div className="fd-bill-breakdown">
                <div className="fd-bill-row">
                  <span>Base Cost ({nights} nights)</span>
                  <span>₹{baseCost.toLocaleString()}</span>
                </div>
                {addons.chef && (
                  <div className="fd-bill-row">
                    <span>Chef Services</span>
                    <span>₹{chefCost.toLocaleString()}</span>
                  </div>
                )}
                {flatCost > 0 && (
                  <div className="fd-bill-row">
                    <span>Selected Add-ons</span>
                    <span>₹{flatCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="fd-bill-row">
                  <span>GST (18%)</span>
                  <span>₹{gst.toLocaleString()}</span>
                </div>
                <div className="fd-bill-row">
                  <span>Service Fee (5%)</span>
                  <span>₹{serviceFee.toLocaleString()}</span>
                </div>
                <div className="fd-divider-dotted" />
              </div>
            )}

            <div className="fd-price-row fd-grand-total-row">
              <span className="fd-price">
                ₹{nights > 0 ? grandTotal?.toLocaleString() : farmhouse.pricePerDay?.toLocaleString()}
              </span>
              <span className="fd-per-night">{nights > 0 ? "total" : "/ night"}</span>
            </div>

            <Link
              to={bookingLink || "/login"}
              state={{
                prefilledStartDate: checkIn,
                prefilledEndDate: checkOut,
                prefilledGuests: guestsCount,
                prefilledAddons: addons
              }}
              className="fd-book-btn"
              onClick={handleBookClick}
            >
              {bookingLabel}
            </Link>

            {!user && (
              <p className="fd-login-hint">
                <Link
                  to="/login"
                  state={{ 
                    redirectTo: `/booking/${farmhouse.id}`,
                    prefilledStartDate: checkIn,
                    prefilledEndDate: checkOut,
                    prefilledGuests: guestsCount,
                    prefilledAddons: addons
                  }}
                >
                  Log in
                </Link>{" "}
                or{" "}
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
            ₹{nights > 0 ? grandTotal?.toLocaleString() : farmhouse.pricePerDay?.toLocaleString()}
          </span>
          <span className="fd-sticky-per"> {nights > 0 ? " total" : " / night"}</span>
        </div>
        <Link
          to={bookingLink || "/login"}
          state={{
            prefilledStartDate: checkIn,
            prefilledEndDate: checkOut,
            prefilledGuests: guestsCount,
            prefilledAddons: addons
          }}
          className="fd-sticky-btn"
          onClick={handleBookClick}
        >
          {bookingLabel}
        </Link>
      </div>
    </div>
  );
}

export default FarmHouseDetail;