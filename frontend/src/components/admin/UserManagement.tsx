import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Search, Mail, Phone, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usersAPI } from "@/services/api";

const UserManagement = ({ onStatsUpdate }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response);
    } catch (error) {
      toast({
        title: "Error loading users",
        description: error.message || "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === "active" ? "suspended" : "active";
      
      await usersAPI.update(userId, { status: newStatus });
      
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      );
      
      setUsers(updatedUsers);
      onStatsUpdate();
      
      toast({
        title: "User status updated",
        description: `${user.name} has been ${newStatus === "active" ? "activated" : "suspended"}.`,
      });
    } catch (error) {
      toast({
        title: "Error updating user",
        description: error.message || "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const sendNotificationToUser = (userId, message) => {
    const user = users.find(u => u.id === userId);
    toast({
      title: "Notification sent",
      description: `Message sent to ${user.name}: ${message}`,
    });
  };

  const getUserBookings = (userId) => {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    return bookings.filter(booking => booking.userId === userId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Badge variant="outline">{filteredUsers.length} users</Badge>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const userBookings = getUserBookings(user.id);
          return (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <Badge variant={user.status === "active" ? "default" : "destructive"}>
                    {user.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {user.phone}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined: {new Date(user.joinDate).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {userBookings.length} total bookings
                  </div>
                  
                  <Badge variant="secondary">
                    {user.role}
                  </Badge>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    size="sm" 
                    variant={user.status === "active" ? "destructive" : "default"}
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.status === "active" ? "Suspend" : "Activate"}
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{user.name} - User Details</DialogTitle>
                        <DialogDescription>
                          Complete user information and booking history
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Personal Information</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            <p><strong>Status:</strong> {user.status}</p>
                            <p><strong>Join Date:</strong> {new Date(user.joinDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Booking History</h4>
                          <div className="space-y-2">
                            {userBookings.length > 0 ? (
                              userBookings.map((booking, index) => (
                                <div key={booking.id} className="p-2 bg-gray-50 rounded text-sm">
                                  <p><strong>Booking #{booking.id}</strong></p>
                                  <p>Car: {booking.carName}</p>
                                  <p>Date: {booking.startDate}</p>
                                  <p>Amount: ${booking.totalAmount}</p>
                                  <Badge variant="outline" className="mt-1">
                                    {booking.status}
                                  </Badge>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500">No bookings yet</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => sendNotificationToUser(user.id, "Welcome to RentCar!")}
                          >
                            Send Welcome Message
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => sendNotificationToUser(user.id, "Special discount available!")}
                          >
                            Send Promotion
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredUsers.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">No users match your search criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
