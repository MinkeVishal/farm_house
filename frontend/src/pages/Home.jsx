import React from 'react';
import { Link } from 'react-router-dom';

function Home({ user }) {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>🌾 Welcome to FarmHouse Booking System</h1>
        <p>Book your perfect farmhouse getaway</p>
        
        <div className="hero-buttons">
          {user ? (
            <>
              <Link to="/farmhouses" className="btn btn-primary">
                Explore Farm Houses
              </Link>
              <Link to="/my-bookings" className="btn btn-secondary">
                My Bookings
              </Link>
            </>
          ) : (
            <>
              <Link to="/farmhouses" className="btn btn-primary">
                Explore Farm Houses
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Login to Book
              </Link>
            </>
          )}
        </div>
      </div>

      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🏡 Wide Selection</h3>
            <p>Choose from hundreds of beautiful farmhouses across different locations</p>
          </div>
          <div className="feature-card">
            <h3>💰 Best Prices</h3>
            <p>Competitive rates with transparent pricing, no hidden charges</p>
          </div>
          <div className="feature-card">
            <h3>🔒 Secure Booking</h3>
            <p>Safe and secure online payment with multiple payment options</p>
          </div>
          <div className="feature-card">
            <h3>⭐ Great Reviews</h3>
            <p>Read authentic reviews from customers who have booked before</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Browse</h3>
            <p>Explore our collection of farmhouses</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Select</h3>
            <p>Choose dates and your preferred farmhouse</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Book</h3>
            <p>Make a secure payment</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Enjoy</h3>
            <p>Have an amazing experience at the farmhouse</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Explore?</h2>
        <Link to="/farmhouses" className="btn btn-large">
          Start Browsing Now
        </Link>
      </section>
    </div>
  );
}

export default Home;
