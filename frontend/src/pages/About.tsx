import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, Users, Star, Award } from "lucide-react";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Car Rental</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted partner in car rental services since 2010. We provide premium vehicles and exceptional service to make your journey memorable.
        </p>
      </div>

      {/* Mission Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Our Mission</CardTitle>
          <CardDescription>
            To provide reliable, affordable, and convenient car rental services while ensuring customer satisfaction and safety.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <img src="/Logo.jpg" alt="Premium Fleet" className="w-12 h-12 rounded mb-4" />
            <CardTitle>Premium Fleet</CardTitle>
            <CardDescription>
              Choose from our extensive collection of well-maintained vehicles, from economy to luxury.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="w-12 h-12 text-green-600 mb-4" />
            <CardTitle>Safe & Secure</CardTitle>
            <CardDescription>
              All our vehicles are regularly serviced and insured for your peace of mind.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Clock className="w-12 h-12 text-orange-600 mb-4" />
            <CardTitle>24/7 Support</CardTitle>
            <CardDescription>
              Our customer service team is available round the clock to assist you.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Users className="w-12 h-12 text-purple-600 mb-4" />
            <CardTitle>Professional Drivers</CardTitle>
            <CardDescription>
              Experienced and licensed drivers available for your convenience.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Star className="w-12 h-12 text-yellow-600 mb-4" />
            <CardTitle>Best Rates</CardTitle>
            <CardDescription>
              Competitive pricing with no hidden charges and flexible rental periods.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Award className="w-12 h-12 text-red-600 mb-4" />
            <CardTitle>Quality Service</CardTitle>
            <CardDescription>
              Award-winning service recognized by industry experts and satisfied customers.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-12">
        <div className="p-4">
          <h3 className="text-3xl font-bold text-blue-600">10+</h3>
          <p className="text-gray-600">Years Experience</p>
        </div>
        <div className="p-4">
          <h3 className="text-3xl font-bold text-blue-600">50+</h3>
          <p className="text-gray-600">Vehicle Models</p>
        </div>
        <div className="p-4">
          <h3 className="text-3xl font-bold text-blue-600">10k+</h3>
          <p className="text-gray-600">Happy Customers</p>
        </div>
        <div className="p-4">
          <h3 className="text-3xl font-bold text-blue-600">24/7</h3>
          <p className="text-gray-600">Customer Support</p>
        </div>
      </div>
    </div>
  );
};

export default About; 