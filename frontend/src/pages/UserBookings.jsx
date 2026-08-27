import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { bookingAPI } from '../api/axiosInstance';
import './UserBookings.css';

const statusLabels = { ALL: 'All stays', PENDING: 'Pending', CONFIRMED: 'Confirmed', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };

const formatDate = (date) => date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set';
const formatCurrency = (amount) => `₹${(Number(amount) || 0).toLocaleString('en-IN')}`;
const normalizeBookingType = (timeSlot) => timeSlot === 'AM' ? 'DAY' : timeSlot === 'PM' ? 'NIGHT' : timeSlot;
const timeSlotDetails = (timeSlot) => ({
  DAY: 'Only Day (06:00 AM - 06:00 PM)',
  NIGHT: 'Only Night (06:00 PM - 06:00 AM)',
  FULL_DAY: 'Full Day & Night (06:00 AM - 06:00 AM)',
}[normalizeBookingType(timeSlot)] || 'Booking type');
const bookingTimeDetails = (timeSlot) => normalizeBookingType(timeSlot) === 'NIGHT'
  ? { checkIn: '06:00 PM', checkOut: '06:00 AM (next day)' }
  : normalizeBookingType(timeSlot) === 'FULL_DAY'
    ? { checkIn: '06:00 AM', checkOut: '06:00 AM (next day)' }
  : { checkIn: '06:00 AM', checkOut: '06:00 PM' };
const statusClass = (status) => `ub-status ub-status-${(status || 'pending').toLowerCase()}`;
const cancellationDeadline = (booking) => {
  if (!booking?.startDate) return null;
  const shiftStart = normalizeBookingType(booking.timeSlot) === 'NIGHT' ? '18:00:00' : '06:00:00';
  return new Date(`${booking.startDate}T${shiftStart}`).getTime() - (6 * 60 * 60 * 1000);
};
const canCancelBooking = (booking) =>
  ['PENDING', 'CONFIRMED'].includes(booking?.status) &&
  Date.now() < cancellationDeadline(booking);

function UserBookings({ user }) {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserBookings();
  }, [user.id]);

  useEffect(() => {
    if (location.state?.bookingSuccess) {
      setSuccessMessage(location.state.bookingMessage || 'Your booking is confirmed successfully!');
    }
  }, [location.state]);

  const fetchUserBookings = async () => {
    if (!user?.id) { setLoading(false); setError('Please sign in to view your bookings.'); return; }
    try {
      setError('');
      const response = await bookingAPI.getUserBookings(user.id);
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const refreshBookings = async () => {
    setRefreshing(true);
    await fetchUserBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await bookingAPI.cancelBooking(bookingId);
        if (response.data.success) {
          setSuccessMessage('Booking cancelled successfully.');
          setSelectedBooking(null);
          fetchUserBookings();
        }
      } catch {
        alert('Failed to cancel booking');
      }
    }
  };

  const visibleBookings = bookings.filter((booking) => {
    const matchesStatus = activeFilter === 'ALL' || booking.status === activeFilter;
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query || booking.farmHouseName?.toLowerCase().includes(query) || String(booking.id).includes(query);
    return matchesStatus && matchesSearch;
  });

  const bookingCount = (status) => bookings.filter((booking) => booking.status === status).length;
  const totalSpent = bookings
    .filter((booking) => booking.status !== 'CANCELLED')
    .reduce((sum, booking) => sum + (Number(booking.totalPrice) || 0), 0);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-bookings-container">
      <div className="ub-hero">
        <div>
          <p className="ub-eyebrow">YOUR GETAWAYS</p>
          <h1>My Bookings</h1>
          <p className="ub-intro">Keep every countryside escape in one calm, convenient place.</p>
        </div>
        <button className="ub-refresh-btn" onClick={refreshBookings} disabled={refreshing}>{refreshing ? 'Refreshing...' : '↻ Refresh'}</button>
      </div>

      {successMessage && (
        <div className="ub-alert ub-success">
          {successMessage}
        </div>
      )}

      {error && <div className="ub-alert ub-error">{error}</div>}

      <div className="ub-stats">
        <div><span>Total stays</span><strong>{bookings.length}</strong><small>All your reservations</small></div>
        <div><span>Upcoming</span><strong>{bookingCount('CONFIRMED') + bookingCount('PENDING')}</strong><small>Ready for your plans</small></div>
        <div><span>Completed</span><strong>{bookingCount('COMPLETED')}</strong><small>Memories made</small></div>
        <div><span>Total booked</span><strong>₹{totalSpent.toLocaleString('en-IN')}</strong><small>Cancelled stays excluded</small></div>
      </div>

      {bookings.length > 0 ? (
        <>
          <div className="ub-controls">
            <div className="ub-tabs">
              {Object.entries(statusLabels).map(([status, label]) => <button key={status} className={activeFilter === status ? 'active' : ''} onClick={() => setActiveFilter(status)}>{label}{status !== 'ALL' && <span>{bookingCount(status)}</span>}</button>)}
            </div>
            <input className="ub-search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search your stays..." aria-label="Search bookings" />
          </div>
          <div className="ub-booking-list">
            {visibleBookings.map((booking) => (
              <article className="ub-booking-card" key={booking.id}>
                <div className="ub-card-accent" />
                <div className="ub-card-main">
                  <div className="ub-card-top"><span className="ub-booking-id">BOOKING #{booking.id}</span><span className={statusClass(booking.status)}>{booking.status}</span></div>
                  <h2>{booking.farmHouseName || 'Farm house stay'}</h2>
                  <div className="ub-stay-dates"><div><small>CHECK-IN</small><strong>{formatDate(booking.startDate)}<em>{bookingTimeDetails(booking.timeSlot).checkIn}</em></strong></div><span className="ub-arrow">→</span><div><small>CHECK-OUT</small><strong>{formatDate(booking.endDate)}<em>{bookingTimeDetails(booking.timeSlot).checkOut}</em></strong></div></div>
                  <div className="ub-booking-slot">🕒 {timeSlotDetails(booking.timeSlot)}</div>
                  <div className="ub-card-meta"><span>◉ {booking.numberOfGuests || 0} guests</span><strong>{formatCurrency(booking.totalPrice)}</strong></div>
                </div>
                <div className="ub-card-actions"><button className="ub-view-btn" onClick={() => setSelectedBooking(booking)}>View details</button>{['PENDING', 'CONFIRMED'].includes(booking.status) && <button className="ub-cancel-btn" disabled={!canCancelBooking(booking)} onClick={() => handleCancelBooking(booking.id)} title="Cancellation is allowed until 6 hours before the shift starts">Cancel stay</button>}</div>
              </article>
            ))}
          </div>
          {visibleBookings.length === 0 && <div className="ub-filter-empty"><strong>No matching stays</strong><span>Try another search or status filter.</span></div>}
        </>
      ) : (
        <div className="no-bookings">
          <p>You don't have any bookings yet.</p>
          <a href="/farmhouses" className="btn btn-primary">Browse Farm Houses</a>
        </div>
      )}

      {selectedBooking && <div className="ub-modal-backdrop" onClick={() => setSelectedBooking(null)}><div className="ub-modal" onClick={(event) => event.stopPropagation()}><button className="ub-modal-close" onClick={() => setSelectedBooking(null)}>×</button><p className="ub-eyebrow">BOOKING #{selectedBooking.id}</p><h2>{selectedBooking.farmHouseName || 'Farm house stay'}</h2><span className={statusClass(selectedBooking.status)}>{selectedBooking.status}</span><div className="ub-modal-grid"><div><small>Check-in</small><strong>{formatDate(selectedBooking.startDate)}</strong></div><div><small>Check-out</small><strong>{formatDate(selectedBooking.endDate)}</strong></div><div><small>Guests</small><strong>{selectedBooking.numberOfGuests || 'Not set'}</strong></div><div><small>Total price</small><strong>{formatCurrency(selectedBooking.totalPrice)}</strong></div></div>{selectedBooking.specialRequirements && <div className="ub-requirements"><small>Special requirements</small><p>{selectedBooking.specialRequirements}</p></div>}{['PENDING', 'CONFIRMED'].includes(selectedBooking.status) && <button className="ub-modal-cancel" disabled={!canCancelBooking(selectedBooking)} onClick={() => handleCancelBooking(selectedBooking.id)}>Cancel this booking</button>}</div></div>}
    </div>
  );
}

export default UserBookings;
