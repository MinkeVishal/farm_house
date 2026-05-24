import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../api/axiosInstance';

function UserBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserBookings();
  }, [user.id]);

  const fetchUserBookings = async () => {
    try {
      const response = await bookingAPI.getUserBookings(user.id);
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await bookingAPI.cancelBooking(bookingId);
        if (response.data.success) {
          alert('Booking cancelled successfully');
          fetchUserBookings();
        }
      } catch (err) {
        alert('Failed to cancel booking');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-bookings-container">
      <h1>My Bookings</h1>

      {error && <div className="error-message">{error}</div>}

      {bookings.length > 0 ? (
        <div className="bookings-table">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Farm House</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.farmHouseName}</td>
                  <td>{booking.startDate}</td>
                  <td>{booking.endDate}</td>
                  <td>{booking.numberOfGuests}</td>
                  <td>₹{booking.totalPrice}</td>
                  <td>
                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {booking.status === 'PENDING' && (
                      <button 
                        onClick={() => handleCancelBooking(booking.id)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-bookings">
          <p>You don't have any bookings yet.</p>
          <a href="/farmhouses" className="btn btn-primary">Browse Farm Houses</a>
        </div>
      )}
    </div>
  );
}

export default UserBookings;
