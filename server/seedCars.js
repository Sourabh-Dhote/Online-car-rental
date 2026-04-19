const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config();

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

const Car = mongoose.model('Car', carSchema);

const sampleCars = [
  {
    name: "Maruti Suzuki Swift",
    model: "2023 VXI",
    image: "/swift.png",
    pricePerHour: 500,
    description: "The perfect city car. Highly fuel-efficient, easy to park, and comfortable for daily commutes and short trips.",
    quantity: 4,
    available: 4,
    category: "Hatchback",
    transmission: "Manual",
    seats: 5,
    features: ["AC", "Bluetooth", "Power Steering", "Great Mileage"]
  },
  {
    name: "Tata Nexon",
    model: "2024 Creative",
    image: "/nexon.png",
    pricePerHour: 700,
    description: "India's safest compact SUV with a 5-star safety rating. Offers high ground clearance, bold design, and a premium cabin.",
    quantity: 3,
    available: 3,
    category: "Compact SUV",
    transmission: "Automatic",
    seats: 5,
    features: ["5-Star Safety", "Sunroof", "Touchscreen", "Rear AC Vents"]
  },
  {
    name: "Hyundai Creta",
    model: "2024 SX(O)",
    image: "/creta.png",
    pricePerHour: 900,
    description: "The ultimate premium SUV experience. Packed with luxury features, a panoramic sunroof, and incredibly smooth driving dynamics.",
    quantity: 2,
    available: 2,
    category: "SUV",
    transmission: "Automatic",
    seats: 5,
    features: ["Panoramic Sunroof", "Ventilated Seats", "Bose Audio", "Auto AC"]
  },
  {
    name: "Maruti Suzuki Ertiga",
    model: "2023 ZXI+",
    image: "/ertiga.png",
    pricePerHour: 1000,
    description: "The perfect family mover. A spacious 7-seater MPV offering unmatched comfort for large families on long trips.",
    quantity: 2,
    available: 2,
    category: "MPV",
    transmission: "Manual",
    seats: 7,
    features: ["7-Seater", "Roof AC Vents", "Spacious Boot", "SmartPlay Infotainment"]
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Clear existing cars to avoid duplicates if run multiple times
    await Car.deleteMany({});
    
    // Insert sample cars
    await Car.insertMany(sampleCars);
    console.log(`Successfully added ${sampleCars.length} cars!`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
