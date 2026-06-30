import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* Hero Section */}
      <section className="about-hero">
        <div className="overlay">
          <h1>About FarmHouse Booking</h1>
          <p>
            Experience luxury, comfort, and unforgettable memories with the
            finest farmhouses across India.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="about-section container">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900"
            alt="Farmhouse"
          />
        </div>

        <div className="about-content">
          <h2>Who We Are</h2>
          <p>
            FarmHouse Booking is a premium online platform that helps customers
            discover and book beautiful farmhouses for vacations, family
            gatherings, birthdays, weddings, corporate events, and weekend
            getaways.
          </p>

          <p>
            We partner with verified farmhouse owners to ensure every property
            provides high-quality facilities, clean environments, and memorable
            experiences.
          </p>

          <button className="about-btn">Explore Farmhouses</button>
        </div>
      </section>

      {/* Mission */}
      <section className="mission-section">
        <div className="container">
          <h2>Our Mission</h2>
          <p>
            Our mission is to make farmhouse booking simple, secure, and
            affordable while providing customers with premium experiences and
            unforgettable memories.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features-section container">
        <h2>Why Choose Us?</h2>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="icon">🏡</div>
            <h3>Verified Properties</h3>
            <p>
              Every farmhouse is carefully verified for safety, cleanliness,
              and quality.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">💳</div>
            <h3>Secure Payments</h3>
            <p>
              Enjoy safe and secure online booking with trusted payment methods.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">⭐</div>
            <h3>Top Rated</h3>
            <p>
              Thousands of happy customers trust us for memorable vacations.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">📞</div>
            <h3>24/7 Support</h3>
            <p>
              Our support team is always available to assist you before and
              after booking.
            </p>
          </div>

        </div>
      </section>

      {/* Statistics */}
      <section className="stats-section">

        <div className="stat-box">
          <h2>500+</h2>
          <p>Luxury Farmhouses</p>
        </div>

        <div className="stat-box">
          <h2>20K+</h2>
          <p>Happy Customers</p>
        </div>

        <div className="stat-box">
          <h2>100+</h2>
          <p>Cities Covered</p>
        </div>

        <div className="stat-box">
          <h2>4.9★</h2>
          <p>Customer Rating</p>
        </div>

      </section>

      {/* Team */}
      <section className="team-section container">

        <h2>Meet Our Team</h2>

        <div className="team-grid">

          <div className="team-card">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt=""
            />
            <h3>Rahul Sharma</h3>
            <p>Founder & CEO</p>
          </div>

          <div className="team-card">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt=""
            />
            <h3>Priya Patel</h3>
            <p>Operations Manager</p>
          </div>

          <div className="team-card">
            <img
              src="https://randomuser.me/api/portraits/men/65.jpg"
              alt=""
            />
            <h3>Amit Verma</h3>
            <p>Customer Support</p>
          </div>

        </div>

      </section>

      {/* Call To Action */}
      <section className="cta-section">

        <h2>Ready to Plan Your Next Getaway?</h2>

        <p>
          Discover luxury farmhouses with beautiful locations, swimming pools,
          gardens, and unforgettable experiences.
        </p>

        <button className="cta-btn">
          Book Your Farmhouse
        </button>

      </section>

    </div>
  );
}

export default About;