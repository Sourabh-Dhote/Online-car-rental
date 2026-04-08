const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
const frontendPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
} else {
  console.log('⚠️ Frontend dist not found. Run "npm run build"');
}

// ✅ SAFE MongoDB connection (NO LOGGING)
const MONGODB_URI = process.env.MONGO_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  status: { type: String, default: 'active' }
});

const carSchema = new mongoose.Schema({
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
});

const bookingSchema = new mongoose.Schema({
  userId: String,
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  startDate: String,
  endDate: String,
  startTime: String,
  endTime: String,
  totalAmount: Number,
  needDriver: Boolean,
  driverContact: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Car = mongoose.model('Car', carSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Auth
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid password' });

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = new User({ ...req.body, password: hash });
    await user.save();
    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Cars
app.get('/api/cars', async (req, res) => {
  try {
    res.json(await Car.find());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cars' });
  }
});

// Bookings (example)
app.post('/api/bookings', async (req, res) => {
  try {
    const car = await Car.findById(req.body.carId);
    if (!car || car.available <= 0) {
      return res.status(400).json({ message: 'Car not available' });
    }

    const booking = new Booking(req.body);
    await booking.save();

    car.available -= 1;
    await car.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

// ❌ REMOVED admin credentials exposure

// Admin init
const initializeAdmin = async () => {
  const exists = await User.findOne({ role: 'admin' });
  if (!exists) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await new User({
      name: 'Admin',
      email: 'admin@rentcar.com',
      password: hash,
      role: 'admin'
    }).save();
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  initializeAdmin();
});