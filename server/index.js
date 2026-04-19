const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

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

// Serve static files from frontend
const frontendPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
} else {
  console.log('⚠️ Frontend dist not found. Run "npm run build" in frontend');
}

// ✅ MongoDB connection (SAFE)
const MONGODB_URI = process.env.MONGO_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ===================== SCHEMAS =====================

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  phone: String,
  status: { type: String, default: 'active' },
  joinDate: { type: Date, default: Date.now }
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

// ===================== MODELS =====================

const User = mongoose.model('User', userSchema);
const Car = mongoose.model('Car', carSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// ===================== AUTH =====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hash,
      role
    });

    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        name,
        email,
        role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid password' });

    if (user.status !== 'active') {
      return res.status(400).json({ message: 'Account not active' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// ===================== CARS =====================

app.get('/api/cars', async (req, res) => {
  try {
    res.json(await Car.find());
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cars' });
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching car' });
  }
});

app.post('/api/cars', async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.status(201).json(car);
  } catch (err) {
    res.status(500).json({ message: 'Error adding car' });
  }
});

app.put('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: 'Error updating car' });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting car' });
  }
});

// ===================== BOOKINGS =====================

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('carId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('carId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Error updating booking' });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting booking' });
  }
});

// ===================== USERS =====================

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// ===================== ADMIN INIT =====================

const initializeAdmin = async () => {
  try {
    const exists = await User.findOne({ role: 'admin' });

    if (!exists) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

      const admin = new User({
        name: 'Admin',
        email: 'admin@rentcar.com',
        password: hash,
        role: 'admin',
        status: 'active'
      });

      await admin.save();
      console.log('✅ Admin created');
    }
  } catch (err) {
    console.error(err);
  }
};

// ===================== FRONTEND ROUTES =====================

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API not found' });
  }

  const indexPath = path.join(__dirname, '../frontend/dist/index.html');

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      message: 'Frontend not built. Run npm run build'
    });
  }
});

// ===================== SERVER =====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  initializeAdmin();
});