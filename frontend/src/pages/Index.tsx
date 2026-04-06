import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Star } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });
  const navigate = useNavigate();

  const featuredCars = [
    {
      id: 1,
      name: "Toyota Camry",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400",
      pricePerHour: 2500,
      seats: 5,
      transmission: "Automatic",
      rating: 4.8
    },
    {
      id: 2,
      name: "BMW X5",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
      pricePerHour: 4500,
      seats: 7,
      transmission: "Automatic",
      rating: 4.9
    },
    {
      id: 3,
      name: "Mercedes C-Class",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400",
      pricePerHour: 3500,
      seats: 5,
      transmission: "Automatic",
      rating: 4.7
    }
  ];

  const handleBrowseCars = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/Logo.jpg" alt="Logo" className="h-12 w-12 rounded" />
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/cars" className="text-gray-700 hover:text-blue-600">Browse Cars</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
            </nav>
            <div className="flex space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Rent the Perfect Car for Your Journey
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose from our wide selection of premium vehicles. Affordable rates, reliable service, and flexible booking options.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="px-8 py-3" onClick={handleBrowseCars}>
              Browse Cars
            </Button>
            <Link to="/register">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose RentCar?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <img src="/Logo.jpg" alt="Premium Fleet" className="h-8 w-8 rounded" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Fleet</h3>
              <p className="text-gray-600">Well-maintained vehicles from top brands</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Service</h3>
              <p className="text-gray-600">Round-the-clock customer support</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <img src="/Logo.jpg" alt="Best Rates" className="h-8 w-8 rounded" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Rates</h3>
              <p className="text-gray-600">Competitive pricing with no hidden fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Vehicles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={car.image} 
                    alt={car.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {car.name}
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{car.rating}</span>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    <span className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {car.seats} seats
                      </span>
                      <span>{car.transmission}</span>
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">₹{car.pricePerHour}</span>
                      <span className="text-gray-600">/hour</span>
                    </div>
                    <Link to="/login">
                      <Button>Book Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-bold">RentCar</span>
              </div>
              <p className="text-gray-400">Your trusted car rental partner</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Car Rental</li>
                <li>Long-term Lease</li>
                <li>Driver Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">support@rentcar.com</p>
              <p className="text-gray-400">1-800-RENTCAR</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
