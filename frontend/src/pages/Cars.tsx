import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, Search, Filter, ArrowLeft } from "lucide-react";
import { carsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import CarLoader from "@/components/ui/CarLoader";

const Cars = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const data = await carsAPI.getAll();
        setCars(data);
      } catch (error) {
        toast({
          title: "Error loading cars",
          description: error.message || "Failed to load cars",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const categories = [
    { value: "all", label: "All Cars" },
    { value: "compact", label: "Compact" },
    { value: "sedan", label: "Sedan" },
    { value: "suv", label: "SUV" },
    { value: "luxury", label: "Luxury" },
    { value: "sports", label: "Sports" }
  ];

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || car.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CarLoader className="mb-6" />
          <p className="text-gray-600 text-lg">Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/Logo.jpg" alt="Logo" className="h-12 w-12 rounded" />
          </Link>
        </div>
        {user && (
          <Link to="/dashboard">
            <Button variant="outline">My Bookings</Button>
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search cars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          {categories.slice(1).map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <Card key={car._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={car.image} 
                alt={car.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              {car.available === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Badge variant="destructive">Not Available</Badge>
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {car.name}
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">4.8</span>
                </div>
              </CardTitle>
              <CardDescription>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {car.seats} seats
                  </span>
                  <span>{car.transmission}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {car.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">₹{car.pricePerHour}</p>
                  <p className="text-sm text-gray-600">per hour</p>
                </div>
                {user ? (
                  <Link to={`/book/${car._id}`}>
                    <Button disabled={car.available === 0}>
                      Book Now
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" onClick={() => navigate('/login')}>
                    Login to Book
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredCars.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <div className="text-gray-400 mx-auto mb-4">
                <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No cars found</h3>
              <p className="text-gray-600">No cars match your search criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Cars;
