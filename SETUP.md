
# Car Rental Admin Panel Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB installation)
- Git

## Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Update the MongoDB connection string in `server/index.js` if needed:
```javascript
const MONGODB_URI = 'mongodb+srv://username:paswoard@cluster0.oclfqi3.mongodb.net/carRental?retryWrites=true&w=majority';
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## Frontend Setup

1. In the root directory, install frontend dependencies:
```bash
npm install
```

2. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Admin Credentials

The system will automatically create a default admin user:
- Email: `admin@rentcar.com`
- Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Cars (Admin only)
- `GET /api/cars` - Get all cars
- `POST /api/cars` - Add new car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

### Bookings
- `GET /api/bookings` - Get bookings (all for admin, user's own for regular users)
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user

## Features Implemented

✅ **Car Management**
- Add, edit, delete cars
- Track inventory (total quantity vs available)
- Image uploads via URL
- Category and feature management

✅ **Booking Management**
- View all bookings with filters
- Update booking status (pending → confirmed → completed)
- Cancel bookings (restores car availability)
- Real-time availability tracking

✅ **User Management**
- View all registered users
- Suspend/activate users
- View user booking history

✅ **Authentication**
- JWT-based authentication
- Role-based access (admin/user)
- Protected routes

✅ **Dashboard Analytics**
- Key metrics display
- Real-time stats updates

## Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/user),
  phone: String,
  joinDate: Date,
  status: String (active/suspended)
}
```

### Car Schema
```javascript
{
  name: String,
  model: String,
  image: String,
  pricePerHour: Number,
  description: String,
  quantity: Number,
  available: Number,
  category: String,
  transmission: String,
  seats: Number,
  features: [String]
}
```

### Booking Schema
```javascript
{
  userId: ObjectId (ref: User),
  carId: ObjectId (ref: Car),
  startDate: String,
  endDate: String,
  startTime: String,
  endTime: String,
  totalAmount: Number,
  needDriver: Boolean,
  status: String (pending/confirmed/completed/cancelled),
  bookingDate: Date
}
```

## Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Role-based access control
- Protected admin routes
- CORS configuration

## Next Steps

1. Implement email notifications using services like SendGrid or Nodemailer
2. Add file upload for car images instead of URLs
3. Implement advanced analytics and reporting
4. Add payment integration (Stripe/PayPal)
5. Implement real-time notifications using WebSockets
6. Add backup and data export functionality
