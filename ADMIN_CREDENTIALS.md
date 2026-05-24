# Admin & SuperAdmin Credentials

## Automatically Created on Backend Startup

The following accounts are created automatically when the backend starts:

### SuperAdmin Account
- **Email**: `superadmin@farmhouse.com`
- **Password**: `SuperAdmin@123`
- **Role**: SUPERADMIN (Full system control)

### Admin Account
- **Email**: `admin@farmhouse.com`
- **Password**: `Admin@123`
- **Role**: ADMIN (Manage farmhouses and users)

---

## User Registration (Frontend)

Users can ONLY register with these roles:
- **CUSTOMER**: Regular users who book farmhouses
- **OWNER**: Farm owners who list their properties

**Users cannot register as ADMIN or SUPERADMIN** - these accounts are pre-configured only.

---

## How to Login

1. Go to http://localhost:5174/login
2. Enter email and password from above
3. You'll have access to the Admin Dashboard

---

## Differences

| Role | Access |
|------|--------|
| **SUPERADMIN** | Full system control, manage all admins, users, farmhouses, bookings |
| **ADMIN** | Manage farmhouses, approve listings, manage users, view bookings |
| **OWNER** | List own farmhouses, manage own properties |
| **CUSTOMER** | Book farmhouses, view listings, manage bookings |

