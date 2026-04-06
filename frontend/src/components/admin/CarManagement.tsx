import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { carsAPI, bookingsAPI } from "@/services/api";

const CarManagement = ({ onStatsUpdate }) => {
  const [cars, setCars] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingQuantities, setUpdatingQuantities] = useState(new Set());
  const [pendingUpdates, setPendingUpdates] = useState(new Map());
  const updateTimeouts = useRef(new Map());
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    image: "",
    pricePerHour: "",
    description: "",
    quantity: "",
    category: "",
    transmission: "",
    seats: "",
    features: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setLoading(true);
      const data = await carsAPI.getAll();
      
      // Sync availability with actual bookings
      await syncCarAvailability(data);
      
      const updatedData = await carsAPI.getAll();
      setCars(updatedData);
    } catch (error) {
      toast({
        title: "Error loading cars",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncCarAvailability = async (cars) => {
    try {
      // Get all confirmed/active bookings
      const allBookings = await bookingsAPI.getAll();
      const activeBookings = allBookings.filter(booking => 
        booking.status === 'confirmed' || booking.status === 'pending'
      );
      
      // Update each car's availability based on actual bookings
      for (const car of cars) {
        const carBookings = activeBookings.filter(booking => 
          booking.carId === car._id || 
          (booking.carId && booking.carId._id === car._id)
        );
        
        const bookedCount = carBookings.length;
        const actualAvailable = Math.max(0, car.quantity - bookedCount);
        
        // Only update if there's a discrepancy
        if (car.available !== actualAvailable) {
          await carsAPI.update(car._id, {
            ...car,
            available: actualAvailable
          });
        }
      }
    } catch (error) {
      console.error('Error syncing car availability:', error);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newCar = {
        ...formData,
        pricePerHour: parseFloat(formData.pricePerHour),
        quantity: parseInt(formData.quantity),
        available: parseInt(formData.quantity),
        seats: parseInt(formData.seats),
        features: formData.features.split(',').map(f => f.trim())
      };
      
      const createdCar = await carsAPI.create(newCar);
      
      // Add the new car to the state without reloading
      setCars(prevCars => [...prevCars, createdCar]);
      
      if (onStatsUpdate) {
        onStatsUpdate();
      }
      
      setFormData({
        name: "", model: "", image: "", pricePerHour: "", description: "",
        quantity: "", category: "", transmission: "", seats: "", features: ""
      });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Car added successfully",
        description: `${newCar.name} has been added to the fleet.`,
      });
    } catch (error) {
      toast({
        title: "Error adding car",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCar = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedCarData = {
        ...formData,
        pricePerHour: parseFloat(formData.pricePerHour),
        quantity: parseInt(formData.quantity),
        seats: parseInt(formData.seats),
        features: formData.features.split(',').map(f => f.trim())
      };
      
      const updatedCar = await carsAPI.update(editingCar._id, updatedCarData);
      
      // Update the specific car in state without reloading
      setCars(prevCars => 
        prevCars.map(car => 
          car._id === editingCar._id ? { ...car, ...updatedCar } : car
        )
      );
      
      if (onStatsUpdate) {
        onStatsUpdate();
      }
      
      setIsEditDialogOpen(false);
      setEditingCar(null);
      
      toast({
        title: "Car updated successfully",
        description: `${formData.name} has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error updating car",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (carId) => {
    try {
      setLoading(true);
      await carsAPI.delete(carId);
      
      // Remove the car from state without reloading
      setCars(prevCars => prevCars.filter(car => car._id !== carId));
      
      if (onStatsUpdate) {
        onStatsUpdate();
      }
      
      toast({
        title: "Car deleted",
        description: "The car has been removed from the fleet.",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Error deleting car",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (car) => {
    setEditingCar(car);
    setFormData({
      name: car.name,
      model: car.model,
      image: car.image,
      pricePerHour: car.pricePerHour.toString(),
      description: car.description,
      quantity: car.quantity.toString(),
      category: car.category,
      transmission: car.transmission,
      seats: car.seats.toString(),
      features: car.features.join(', ')
    });
    setIsEditDialogOpen(true);
  };

  const adjustQuantity = async (carId, change) => {
    const car = cars.find(c => c._id === carId);
    const newQuantity = car.quantity + change;
    
    if (newQuantity < 0) {
      toast({
        title: "Invalid quantity",
        description: "Quantity cannot be negative.",
        variant: "destructive"
      });
      return;
    }
    
    // Optimistically update the UI immediately
    setCars(prevCars => 
      prevCars.map(c => {
        if (c._id === carId) {
          const newAvailable = Math.max(0, c.available + change);
          return { ...c, quantity: newQuantity, available: newAvailable };
        }
        return c;
      })
    );
    
    // Clear existing timeout for this car
    if (updateTimeouts.current.has(carId)) {
      clearTimeout(updateTimeouts.current.get(carId));
    }
    
    // Set new timeout to actually update the server after user stops clicking
    const timeoutId = setTimeout(async () => {
      try {
        setUpdatingQuantities(prev => new Set([...prev, carId]));
        
        // Get current state after all UI updates
        const currentCar = cars.find(c => c._id === carId);
        const finalQuantity = currentCar ? currentCar.quantity : newQuantity;
        
        // Calculate current bookings for this car
        const allBookings = await bookingsAPI.getAll();
        const activeBookings = allBookings.filter(booking => 
          (booking.carId === carId || (booking.carId && booking.carId._id === carId)) &&
          (booking.status === 'confirmed' || booking.status === 'pending')
        );
        
        const bookedCount = activeBookings.length;
        
        if (finalQuantity < bookedCount) {
          // Revert to original state
          setCars(prevCars => 
            prevCars.map(c => c._id === carId ? car : c)
          );
          
          toast({
            title: "Cannot reduce quantity",
            description: `This car has ${bookedCount} active bookings. Cannot reduce quantity below ${bookedCount}.`,
            variant: "destructive"
          });
          return;
        }
        
        const correctAvailable = finalQuantity - bookedCount;
        
        // Update the server
        await carsAPI.update(carId, { 
          ...car, 
          quantity: finalQuantity, 
          available: correctAvailable
        });
        
        // Update with correct availability from server calculation
        setCars(prevCars => 
          prevCars.map(c => {
            if (c._id === carId) {
              return { ...c, quantity: finalQuantity, available: correctAvailable };
            }
            return c;
          })
        );
        
        // Only call onStatsUpdate without reloading the entire car list
        if (onStatsUpdate) {
          onStatsUpdate();
        }
        
      } catch (error) {
        // Revert to original state on error
        setCars(prevCars => 
          prevCars.map(c => c._id === carId ? car : c)
        );
        toast({
          title: "Error updating quantity",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setUpdatingQuantities(prev => {
          const newSet = new Set(prev);
          newSet.delete(carId);
          return newSet;
        });
        updateTimeouts.current.delete(carId);
      }
    }, 1000); // Wait 1 second after last click
    
    updateTimeouts.current.set(carId, timeoutId);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-32">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Car Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {
            // Only sync availability, don't reload unless specifically requested
            loadCars();
          }} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sync Availability
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Car
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Car</DialogTitle>
              <DialogDescription>Add a new car to your fleet</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCar} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Car Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model Year</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pricePerHour">Price/Hour (₹)</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Total Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="seats">Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    value={formData.seats}
                    onChange={(e) => setFormData({...formData, seats: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select value={formData.transmission} onValueChange={(value) => setFormData({...formData, transmission: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  placeholder="GPS, Bluetooth, AC"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Adding...' : 'Add Car'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <Card key={car._id}>
            <div className="aspect-video overflow-hidden rounded-t-lg">
              <img 
                src={car.image} 
                alt={car.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {car.name}
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(car)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteCar(car._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{car.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <div className="text-right">
                    <p className="text-lg font-bold">₹{car.pricePerHour}</p>
                    <p className="text-sm text-gray-600">per hour</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Total Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => adjustQuantity(car._id, -1)}
                      disabled={car.quantity <= 0 || updatingQuantities.has(car._id)}
                    >
                      {updatingQuantities.has(car._id) ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                      ) : (
                        "-"
                      )}
                    </Button>
                    <span className="font-semibold min-w-[2ch] text-center">{car.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => adjustQuantity(car._id, 1)}
                      disabled={updatingQuantities.has(car._id)}
                    >
                      {updatingQuantities.has(car._id) ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                      ) : (
                        "+"
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <Badge variant={car.available <= 2 ? "destructive" : "default"}>
                    {car.available <= 2 && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {car.available}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <Badge variant="secondary">{car.category}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog - same structure as add dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Car</DialogTitle>
            <DialogDescription>Update car details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Car Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-model">Model Year</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-pricePerHour">Price/Hour (₹)</Label>
                <Input
                  id="edit-pricePerHour"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-quantity">Total Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-seats">Seats</Label>
                <Input
                  id="edit-seats"
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData({...formData, seats: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating...' : 'Update Car'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarManagement;
