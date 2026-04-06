import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Calendar, DollarSign, Car, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    monthlyRevenue: [],
    carUtilization: [],
    bookingTrends: [],
    topCars: [],
    userGrowth: [],
    categoryDistribution: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState({ bookings: 0, cars: 0, users: 0 });

  useEffect(() => {
    generateAnalytics();
  }, []);

  const generateAnalytics = () => {
    try {
      setIsLoading(true);
      
      // Get data from localStorage
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      const cars = JSON.parse(localStorage.getItem("adminCars") || "[]");
      const users = JSON.parse(localStorage.getItem("adminUsers") || "[]");
      
      // Update data status for debugging
      setDataStatus({ 
        bookings: bookings.length, 
        cars: cars.length, 
        users: users.length 
      });
      
      console.log('Analytics Data Debug:', { bookings, cars, users });

      // Monthly Revenue - Last 12 months
      const monthlyRevenue = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        
        const monthBookings = bookings.filter(booking => {
          if (!booking.bookingDate) return false;
          const bookingDate = new Date(booking.bookingDate);
          return bookingDate.getMonth() === date.getMonth() && 
                 bookingDate.getFullYear() === date.getFullYear();
        });
        
        const revenue = monthBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
        monthlyRevenue.push({ month, revenue, bookings: monthBookings.length });
      }

      // Car Utilization
      const carUtilization = cars.map(car => {
        const carBookings = bookings.filter(b => 
          b.carId === car.id && (b.status === "confirmed" || b.status === "active")
        );
        
        const totalQuantity = car.quantity || 1;
        const availableQuantity = car.available || 0;
        const utilizationRate = totalQuantity > 0 ? 
          ((totalQuantity - availableQuantity) / totalQuantity) * 100 : 0;
        
        return {
          name: car.name || `Car ${car.id}`,
          utilization: Math.round(Math.max(0, Math.min(100, utilizationRate))),
          bookings: carBookings.length,
          revenue: carBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
        };
      });

      // Top Cars by Revenue
      const topCars = carUtilization
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Booking Trends - Last 30 days
      const bookingTrends = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dayBookings = bookings.filter(booking => {
          if (!booking.bookingDate) return false;
          const bookingDate = new Date(booking.bookingDate);
          return bookingDate.toDateString() === date.toDateString();
        });
        
        bookingTrends.push({
          date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          bookings: dayBookings.length
        });
      }

      // User Growth - Last 12 months
      const userGrowth = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        
        const monthUsers = users.filter(user => {
          if (!user.joinDate && !user.createdAt) return false;
          const joinDate = new Date(user.joinDate || user.createdAt);
          return joinDate.getMonth() === date.getMonth() && 
                 joinDate.getFullYear() === date.getFullYear();
        });
        
        userGrowth.push({ month, users: monthUsers.length });
      }

      // Category Distribution
      const categoryDistribution = cars.reduce((acc, car) => {
        const category = car.category || car.type || 'Other';
        const existing = acc.find(item => item.name === category);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: category, value: 1 });
        }
        return acc;
      }, []);

      setAnalytics({
        monthlyRevenue,
        carUtilization,
        bookingTrends,
        topCars,
        userGrowth,
        categoryDistribution
      });
    } catch (error) {
      console.error('Error generating analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const currentMonth = analytics.monthlyRevenue[analytics.monthlyRevenue.length - 1];
  const lastMonth = analytics.monthlyRevenue[analytics.monthlyRevenue.length - 2];
  const revenueGrowth = lastMonth ? ((currentMonth?.revenue - lastMonth.revenue) / lastMonth.revenue * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Data: {dataStatus.bookings} bookings, {dataStatus.cars} cars, {dataStatus.users} users
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Show message if no data */}
      {dataStatus.bookings === 0 && dataStatus.cars === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p>Add some cars and bookings to see analytics data.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{currentMonth?.revenue || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(revenueGrowth).toFixed(1)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.carUtilization.length > 0 
                ? Math.round(analytics.carUtilization.reduce((sum, car) => sum + car.utilization, 0) / analytics.carUtilization.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Fleet utilization rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonth?.bookings || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.topCars[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              ₹{analytics.topCars[0]?.revenue || 0} revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Car Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Car Utilization Rates</CardTitle>
            <CardDescription>Utilization percentage by car</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.carUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                <Bar dataKey="utilization" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Booking Trends</CardTitle>
            <CardDescription>Bookings over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#FFBB28" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Category Distribution</CardTitle>
            <CardDescription>Distribution of car categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Cars */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Cars</CardTitle>
          <CardDescription>Cars ranked by revenue generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topCars.map((car, index) => (
              <div key={car.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <p className="font-semibold">{car.name}</p>
                    <p className="text-sm text-gray-600">{car.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">₹{car.revenue}</p>
                  <p className="text-sm text-gray-600">{car.utilization}% utilized</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
