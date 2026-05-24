import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

// Headers helper
const getHeaders = (userId = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (userId) {
    headers['user-id'] = userId;
  }
  return headers;
};

// Auth API
export const authAPI = {
  register: (userData) =>
    axios.post(`${API_BASE_URL}/auth/register`, userData),
  login: (email, password) =>
    axios.post(`${API_BASE_URL}/auth/login`, { email, password }),
  verifyEmail: (userId) =>
    axios.post(`${API_BASE_URL}/auth/verify/${userId}`),
};

// User API
export const userAPI = {
  getAllUsers: () => axios.get(`${API_BASE_URL}/users`),
  getUserById: (id) => axios.get(`${API_BASE_URL}/users/${id}`),
  getUserByEmail: (email) => axios.get(`${API_BASE_URL}/users/email/${email}`),
  getUsersByRole: (role) => axios.get(`${API_BASE_URL}/users/role/${role}`),
  updateUser: (id, userData) => axios.put(`${API_BASE_URL}/users/${id}`, userData),
  deleteUser: (id) => axios.delete(`${API_BASE_URL}/users/${id}`),
  getTotalUsersCount: () => axios.get(`${API_BASE_URL}/users/count/total`),
};

// FarmHouse API
export const farmhouseAPI = {
  addFarmHouse: (data, ownerId) =>
    axios.post(`${API_BASE_URL}/farmhouses`, data, {
      headers: { ...getHeaders(), 'owner-id': ownerId },
    }),
  getAllFarmHouses: (page = 0, size = 10) =>
    axios.get(`${API_BASE_URL}/farmhouses?page=${page}&size=${size}`),
  getFarmHouseById: (id) => axios.get(`${API_BASE_URL}/farmhouses/${id}`),
  getFarmHousesByOwner: (ownerId) =>
    axios.get(`${API_BASE_URL}/farmhouses/owner/${ownerId}`),
  searchByLocation: (query, page = 0, size = 10) =>
    axios.get(
      `${API_BASE_URL}/farmhouses/search/location?query=${query}&page=${page}&size=${size}`
    ),
  searchByPrice: (minPrice, maxPrice, page = 0, size = 10) =>
    axios.get(
      `${API_BASE_URL}/farmhouses/search/price?minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&size=${size}`
    ),
  updateFarmHouse: (id, data) =>
    axios.put(`${API_BASE_URL}/farmhouses/${id}`, data),
  approveFarmHouse: (id) =>
    axios.put(`${API_BASE_URL}/farmhouses/${id}/approve`),
  deleteFarmHouse: (id) => axios.delete(`${API_BASE_URL}/farmhouses/${id}`),
};

// Booking API
export const bookingAPI = {
  createBooking: (data, userId) =>
    axios.post(`${API_BASE_URL}/bookings`, data, {
      headers: getHeaders(userId),
    }),
  getBookingById: (id) => axios.get(`${API_BASE_URL}/bookings/${id}`),
  getAllBookings: () => axios.get(`${API_BASE_URL}/bookings`),
  getUserBookings: (userId) =>
    axios.get(`${API_BASE_URL}/bookings/user/${userId}`),
  getFarmHouseBookings: (farmHouseId) =>
    axios.get(`${API_BASE_URL}/bookings/farmhouse/${farmHouseId}`),
  confirmBooking: (id) =>
    axios.put(`${API_BASE_URL}/bookings/${id}/confirm`),
  cancelBooking: (id) =>
    axios.put(`${API_BASE_URL}/bookings/${id}/cancel`),
  checkAvailability: (farmHouseId, startDate, endDate) =>
    axios.get(
      `${API_BASE_URL}/bookings/check/availability?farmHouseId=${farmHouseId}&startDate=${startDate}&endDate=${endDate}`
    ),
  deleteBooking: (id) => axios.delete(`${API_BASE_URL}/bookings/${id}`),
};

// Payment API
export const paymentAPI = {
  createPayment: (data) =>
    axios.post(`${API_BASE_URL}/payments`, data),
  processPayment: (id) =>
    axios.post(`${API_BASE_URL}/payments/${id}/process`),
  getPaymentById: (id) => axios.get(`${API_BASE_URL}/payments/${id}`),
  getPaymentByBooking: (bookingId) =>
    axios.get(`${API_BASE_URL}/payments/booking/${bookingId}`),
  getAllPayments: () => axios.get(`${API_BASE_URL}/payments`),
  getPaymentsByStatus: (status) =>
    axios.get(`${API_BASE_URL}/payments/status/${status}`),
  refundPayment: (id) =>
    axios.post(`${API_BASE_URL}/payments/${id}/refund`),
};
