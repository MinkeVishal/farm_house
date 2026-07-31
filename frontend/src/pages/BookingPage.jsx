import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, farmhouseAPI, paymentAPI } from '../api/axiosInstance';

function BookingPage({ user }) {
  const { farmhouseId } = useParams();
  const navigate = useNavigate();
  const [farmhouse, setFarmhouse] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  useEffect(() => {
    fetchFarmhouseDetails();
  }, [farmhouseId]);

  useEffect(() => {
    calculatePrice();
  }, [startDate, endDate]);

  const fetchFarmhouseDetails = async () => {
    try {
      const response = await farmhouseAPI.getFarmHouseById(farmhouseId);
      if (response.data.success) {
        setFarmhouse(response.data.farmhouse);
      }
    } catch (err) {
      setError('Failed to fetch farmhouse details');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (startDate && endDate && farmhouse) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        setTotalPrice(days * farmhouse.pricePerDay);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBookingLoading(true);

    try {
      // Check availability
      const availabilityResponse = await bookingAPI.checkAvailability(
        farmhouseId,
        startDate,
        endDate
      );

      if (!availabilityResponse.data.available) {
        setError('Farmhouse is not available for these dates');
        setBookingLoading(false);
        return;
      }

      // Create booking
      const bookingResponse = await bookingAPI.createBooking(
        {
          farmHouseId: parseInt(farmhouseId),
          startDate,
          endDate,
          numberOfGuests: parseInt(numberOfGuests),
          specialRequirements,
        },
        user.id
      );

      if (bookingResponse.data.success) {
        const bookingId = bookingResponse.data.booking.id;

        // Create payment
        const paymentResponse = await paymentAPI.createPayment({
          bookingId,
          paymentMethod,
        });

        if (paymentResponse.data.success) {
          // Process payment
          const processResponse = await paymentAPI.processPayment(paymentResponse.data.payment.id);
          
          if (processResponse.data.success) {
            navigate('/my-bookings', {
              replace: true,
              state: {
                bookingSuccess: true,
                bookingMessage: 'Your booking is confirmed successfully!'
              }
            });
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!farmhouse) {
    return <div className="error-message">Farmhouse not found</div>;
  }

  return (
    <div className="booking-container">
      <h1>Book {farmhouse.name}</h1>

      <div className="booking-content">
        <div className="booking-form-section">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Number of Guests:</label>
              <input
                type="number"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
                min="1"
                max={farmhouse.maxGuests}
                required
              />
            </div>

            <div className="form-group">
              <label>Special Requirements:</label>
              <textarea
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="Any special requirements? (Optional)"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Payment Method:</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="CARD">Credit/Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="WALLET">Wallet</option>
              </select>
            </div>

            <button type="submit" disabled={bookingLoading} className="submit-btn">
              {bookingLoading ? 'Processing...' : `Pay ₹${totalPrice.toFixed(2)} & Book`}
            </button>
          </form>
        </div>

        <div className="booking-summary">
          <h2>Booking Summary</h2>
          <div className="summary-item">
            <span>Farmhouse:</span>
            <span>{farmhouse.name}</span>
          </div>
          <div className="summary-item">
            <span>Location:</span>
            <span>{farmhouse.location}</span>
          </div>
          <div className="summary-item">
            <span>Check-in:</span>
            <span>{startDate || 'Not selected'}</span>
          </div>
          <div className="summary-item">
            <span>Check-out:</span>
            <span>{endDate || 'Not selected'}</span>
          </div>
          <div className="summary-item">
            <span>Guests:</span>
            <span>{numberOfGuests}</span>
          </div>
          <div className="summary-item">
            <span>Price per night:</span>
            <span>₹{farmhouse.pricePerDay}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-total">
            <span>Total Amount:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
