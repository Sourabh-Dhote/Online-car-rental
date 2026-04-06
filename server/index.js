const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
const frontendPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
} else {
  console.log('⚠️  Frontend dist directory not found. Please run "npm run build" in the frontend directory.');
  console.log('📁 Expected path:', frontendPath);
}

// MongoDB connection here you should change the URI to your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://nallapanenimahidhar2004:LpmwoYdr4euwYEyX@cluster0.oclfqi3.mongodb.net/carRental?retryWrites=true&w=majority';
// keep your MongoDB URI secure and do not expose it in public repositories

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: String,
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
});

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: String, required: true },
  image: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  available: { type: Number, required: true },
  category: { type: String, required: true },
  transmission: { type: String, required: true },
  seats: { type: Number, required: true },
  features: [String]
});

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  needDriver: { type: Boolean, default: false },
  driverContact: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Car = mongoose.model('Car', carSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    if (user.status !== 'active') {
      return res.status(400).json({ message: 'Your account is not active. Please contact support.' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();
    
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Car routes
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/cars', async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Booking routes
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('carId');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { userId, carId, startDate, endDate, startTime, endTime, totalAmount, needDriver, driverContact } = req.body;

    // Validate car availability
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    if (car.available <= 0) {
      return res.status(400).json({ message: 'Car is not available for booking' });
    }

    // Create booking
    const booking = new Booking({
      userId,
      carId,
      startDate,
      endDate,
      startTime,
      endTime,
      totalAmount,
      needDriver,
      driverContact,
      status: 'pending'
    });

    await booking.save();

    // Update car availability
    car.available -= 1;
    await car.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('carId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // If booking is cancelled, update car availability
    if (status === 'cancelled') {
      const car = await Car.findById(booking.carId);
      if (car) {
        car.available += 1;
        await car.save();
      }
    }

    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
});

// User management routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin management routes
app.post('/api/admin/activate', async (req, res) => {
  try {
    const admin = await User.findOne({ email: 'admin@rentcar.com' });
    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found' });
    }
    
    admin.status = 'active';
    await admin.save();
    
    res.json({
      message: 'Admin account activated successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Specific route for admin page
app.get('/admin', (req, res) => {
  const indexPath = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      message: 'Admin Dashboard Not Available',
      error: 'Frontend application is not built',
      solution: 'To access the admin dashboard:',
      steps: [
        '1. Open terminal in the frontend directory',
        '2. Run: npm run build',
        '3. Restart the server',
        '4. Try accessing /admin again'
      ],
      adminCredentials: {
        email: 'admin@rentcar.com',
        password: 'admin123'
      }
    });
  }
});

// Catch-all route to serve the frontend application
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  // Check if frontend is built
  const indexPath = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(indexPath)) {
    // For all other routes, serve the React app
    res.sendFile(indexPath);
  } else {
    // Frontend not built - provide helpful error message
    res.status(404).json({
      message: 'Frontend not built',
      error: 'The frontend application has not been built yet.',
      solution: 'Please run "npm run build" in the frontend directory, then restart the server.',
      routes: {
        api: '/api/*',
        admin: '/admin (requires frontend build)',
        dashboard: '/dashboard (requires frontend build)'
      }
    });
  }
});

// Initialize with default admin user
const initializeAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        name: 'Admin',
        email: 'admin@rentcar.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active'  // Ensure admin is active by default
      });
      await admin.save();
      console.log('Default admin user created: admin@rentcar.com / admin123');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeAdmin();
});
