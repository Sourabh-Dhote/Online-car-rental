import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Users, DollarSign, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { carsAPI, bookingsAPI } from "@/services/api";
import CarLoader from "@/components/ui/CarLoader";

const BookCar = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState(null);
  const [car, setCar] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    needDriver: false,
    driverContact: ""
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCar, setIsLoadingCar] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));

    const fetchCar = async () => {
      try {
        setIsLoadingCar(true);
        const carData = await carsAPI.getById(carId);
        setCar(carData);
      } catch (error) {
        toast({
          title: "Error loading car",
          description: error.message || "Failed to load car details",
          variant: "destructive"
        });
        navigate("/cars");
      } finally {
        setIsLoadingCar(false);
      }
    };

    fetchCar();
  }, [carId, navigate, toast]);

  useEffect(() => {
    calculateTotal();
  }, [bookingData, car]);

  const calculateTotal = () => {
    if (!car || !bookingData.startDate || !bookingData.startTime || !bookingData.endDate || !bookingData.endTime) {
      setTotalAmount(0);
      return;
    }

    const startDateTime = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
    const endDateTime = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
    
    if (endDateTime <= startDateTime) {
      setTotalAmount(0);
      return;
    }

    const diffInMs = endDateTime.getTime() - startDateTime.getTime();
    const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));
    
    let total = diffInHours * car.pricePerHour;
    if (bookingData.needDriver) {
      total += diffInHours * 400; // $400 per hour for driver
    }
    
    setTotalAmount(total);
  };

  const handleInputChange = (field, value) => {
    setBookingData({
      ...bookingData,
      [field]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (totalAmount === 0) {
      toast({
        title: "Invalid booking",
        description: "Please check your dates and times.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (car.available <= 0) {
      toast({
        title: "Car unavailable",
        description: "This car is currently not available for booking.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      const booking = {
        userId: user.id,
        carId: car._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        totalAmount,
        needDriver: bookingData.needDriver,
        driverContact: bookingData.needDriver ? bookingData.driverContact : undefined,
        status: "pending"
      };

      await bookingsAPI.create(booking);

      toast({
        title: "Booking submitted!",
        description: `Your booking for ${car.name} has been submitted successfully.`,
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Booking failed",
        description: error.message || "Failed to create booking",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCar || !car || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CarLoader className="mb-6" />
          <p className="text-gray-600 text-lg">Loading car details...</p>
        </div>
      </div>
    );
  }

  const isUnavailable = car.available <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/cars" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <img src="/Logo.jpg" alt="Logo" className="h-12 w-12 rounded" />
            </Link>
            <Link to="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Availability Warning */}
        {isUnavailable && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">
                This car is currently unavailable for booking.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Car Details */}
          <Card>
            <CardHeader>
              <CardTitle>Book {car.name}</CardTitle>
              <CardDescription>Complete your booking details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video overflow-hidden rounded-lg mb-4">
                <img 
                  src={car.image} 
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">₹{car.pricePerHour}</p>
                    <p className="text-sm text-gray-600">per hour</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span>{car.seats} seats</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>Select your preferred dates and times</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={bookingData.startTime}
                      onChange={(e) => handleInputChange("startTime", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={bookingData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={bookingData.endTime}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needDriver"
                    checked={bookingData.needDriver}
                    onCheckedChange={(checked) => handleInputChange("needDriver", checked)}
                  />
                  <Label htmlFor="needDriver">Need a driver? (+₹400/hour)</Label>
                </div>

                {bookingData.needDriver && (
                  <div>
                    <Label htmlFor="driverContact">Driver Contact Number</Label>
                    <Input
                      id="driverContact"
                      type="tel"
                      value={bookingData.driverContact}
                      onChange={(e) => handleInputChange("driverContact", e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold">₹{totalAmount}</span>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || isUnavailable}>
                    {isLoading ? "Processing..." : "Confirm Booking"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookCar;
