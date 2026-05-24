import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './animations.css';
import './components.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import FarmHouseList from './pages/FarmHouseList';
import FarmHouseDetail from './pages/FarmHouseDetail';
import BookingPage from './pages/BookingPage';
import UserBookings from './pages/UserBookings';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import NotFound from './pages/NotFound';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLoginSuccess={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/farmhouses" element={<FarmHouseList />} />
        <Route path="/farmhouses/:id" element={<FarmHouseDetail user={user} />} />
        <Route path="/booking/:farmhouseId" element={user ? <BookingPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/my-bookings" element={user ? <UserBookings user={user} /> : <Navigate to="/login" />} />
        <Route path="/superadmin" element={user?.role === 'SUPERADMIN' ? <SuperAdminDashboard /> : <Navigate to="/" />} />
        <Route path="/admin" element={user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/owner-dashboard" element={user?.role === 'OWNER' ? <OwnerDashboard user={user} /> : <Navigate to="/" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
