# 🚀 Quick Start Guide - Farm House Booking System

## Step-by-Step Setup (5 minutes)

### 1. Backend Setup

```bash
# Navigate to project directory
cd demo

# Update MySQL credentials if needed
# Edit: src/main/resources/application.properties

# Create MySQL database
mysql -u root -p
CREATE DATABASE IF NOT EXISTS program;
EXIT;

# Build and run
mvn clean install
mvn spring-boot:run
```

**Backend is ready at:** http://localhost:8080

---

### 2. Frontend Setup

```bash
# Navigate to React app
cd demo/my-react-app

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend is ready at:** http://localhost:5173

---

## First Time Usage

### 1. Register as Admin
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "admin123",
    "phone": "9999999999",
    "role": "ADMIN"
  }'
```

### 2. Register as Farm Owner
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Owner Name",
    "email": "owner@test.com",
    "password": "owner123",
    "phone": "8888888888",
    "role": "OWNER"
  }'
```

### 3. Register as Customer
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Name",
    "email": "customer@test.com",
    "password": "customer123",
    "phone": "7777777777",
    "role": "CUSTOMER"
  }'
```

### 4. Login with any user
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "customer123"
  }'
```

---

## UI Navigation

### As Customer:
1. Go to http://localhost:5173
2. Click "Explore Farm Houses"
3. Search and browse farmhouses
4. Click "View Details" → "Book Now"
5. Select dates, guests, and payment method
6. Complete booking

### As Owner:
1. Go to http://localhost:5173/owner-dashboard
2. Click "Add New Farm House"
3. Fill details and submit
4. Wait for admin approval
5. View bookings for your farmhouses

### As Admin:
1. Go to http://localhost:5173/admin
2. Approve pending farmhouses
3. View all users, bookings, payments
4. Manage platform

---

## Sample Data Creation

### Add a FarmHouse:
```bash
curl -X POST http://localhost:8080/api/farmhouses \
  -H "Content-Type: application/json" \
  -H "owner-id: 2" \
  -d '{
    "name": "Mountain Paradise",
    "location": "Himachal Pradesh",
    "description": "Beautiful farmhouse with mountain views",
    "pricePerDay": 3500,
    "maxGuests": 8,
    "bedrooms": 3,
    "bathrooms": 2,
    "amenities": "[\"WiFi\", \"Pool\", \"Garden\", \"Bonfire\"]",
    "imageUrl": "https://via.placeholder.com/300"
  }'
```

### Create a Booking:
```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -H "user-id: 3" \
  -d '{
    "farmHouseId": 1,
    "startDate": "2024-05-10",
    "endDate": "2024-05-15",
    "numberOfGuests": 4,
    "specialRequirements": "Need early check-in"
  }'
```

---

## Features to Test

✅ **User Registration & Login**
- Register with different roles (Admin, Owner, Customer)
- Login successfully
- User data persisted in localStorage

✅ **Farm House Management**
- Owner adds farmhouse
- Admin approves/rejects
- Customer views approved farmhouses
- Search by location and price

✅ **Booking System**
- Customer selects dates
- System prevents double booking
- Price calculated automatically
- Booking status tracked (PENDING → CONFIRMED)

✅ **Payment System**
- Create payment after booking
- Process payment
- Check payment status
- Refund functionality

✅ **Admin Dashboard**
- View all users
- Approve pending farmhouses
- View all bookings and payments
- Statistics dashboard

✅ **Owner Dashboard**
- Dashboard with stats
- Add/edit farmhouses
- View bookings for their properties
- Track revenue

✅ **Customer Features**
- Browse all farmhouses
- View bookings history
- Cancel bookings
- Filter by price range

---

## Troubleshooting

### Issue: Backend won't start
**Solution:**
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Check port 8080 is free
lsof -i :8080

# Check database exists
mysql -u root -p -e "USE program; SHOW TABLES;"
```

### Issue: Frontend won't load
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port 5173 is free
lsof -i :5173
```

### Issue: API calls fail (CORS error)
**Solution:**
- CORS is already enabled in controllers
- Check backend console for errors
- Verify API URL in axiosInstance.js

### Issue: Login/Registration not working
**Solution:**
- Check database is running
- Verify credentials in browser console
- Check backend logs for SQL errors

---

## Database Commands

```bash
# Connect to MySQL
mysql -u root -p program

# View all tables
SHOW TABLES;

# Check users
SELECT * FROM users;

# Check farmhouses
SELECT * FROM farmhouses;

# Check bookings
SELECT * FROM bookings;

# Check payments
SELECT * FROM payments;

# Clear all data (for testing)
DELETE FROM users;
DELETE FROM farmhouses;
DELETE FROM bookings;
DELETE FROM payments;
```

---

## Next Steps

1. ✅ Test all functionality locally
2. ✅ Generate sample data
3. ✅ Verify all API endpoints
4. ✅ Test admin approval workflow
5. 🔄 Integrate real payment gateway
6. 🔄 Add email notifications
7. 🔄 Deploy to production server

---

## Production Checklist

- [ ] Update database credentials
- [ ] Enable HTTPS
- [ ] Configure JWT secret key
- [ ] Set up email service
- [ ] Integrate payment gateway
- [ ] Set up CI/CD pipeline
- [ ] Add backup strategy
- [ ] Configure logging
- [ ] Performance testing
- [ ] Security audit

---

**Happy Testing! 🎉**

For detailed API documentation, see: [PROJECT_SETUP.md](PROJECT_SETUP.md)
