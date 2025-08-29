"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/navbar";
import { Users, Car, TrendingUp, Eye, Clock, Check, X } from "lucide-react";

// Interfaces based on provided backend schemas
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Analytics {
  totalUsers: number;
  totalCarListings: number;
  totalTestDrives?: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AdminCar {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  condition: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface AdminTestDrive {
  id: string;
  user: {
    name: string;
    email: string;
  };
  car: {
    make: string;
    model: string;
  };
  date: string;
  timeSlot: string;
  contactNumber: string;
  message: string;
  status: 'booked' | 'confirmed' | 'completed' | 'canceled';
  createdAt: string;
}

// Helper functions for common logic
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "booked":
      return "bg-yellow-100 text-yellow-600";
    case "confirmed":
      return "bg-blue-100 text-blue-600";
    case "completed":
      return "bg-green-100 text-green-600";
    case "canceled":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "booked":
      return <Clock className="h-4 w-4" />;
    case "confirmed":
      return <Check className="h-4 w-4" />;
    case "completed":
      return <Check className="h-4 w-4" />;
    case "canceled":
      return <X className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [testDrives, setTestDrives] = useState<AdminTestDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("listings");

  useEffect(() => {
    let isMounted = true;
    const fetchAdminData = async () => {
      try {
        const fetchOptions = {
          credentials: 'include' as RequestCredentials,
        };

        const [profileRes, analyticsRes, carsRes, usersRes, testDrivesRes] = await Promise.all([
          fetch("http://localhost:5000/api/users/profile", fetchOptions),
          fetch("http://localhost:5000/api/admin/analytics", fetchOptions),
          fetch("http://localhost:5000/api/admin/cars", fetchOptions),
          fetch("http://localhost:5000/api/admin/users", fetchOptions),
          fetch("http://localhost:5000/api/admin/testdrives", fetchOptions),
        ]);

        if (profileRes.status === 401) {
          if (isMounted) router.push("/signin");
          return;
        }

        const [profileData, analyticsData, carsData, usersData, testDrivesData] = await Promise.all([
          profileRes.json(),
          analyticsRes.json(),
          carsRes.json(),
          usersRes.json(),
          testDrivesRes.json(),
        ]);

        if (isMounted) {
          setUserProfile(profileData);
          setAnalytics(analyticsData);
          setCars(carsData);
          setUsers(usersData);
          setTestDrives(testDrivesData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to fetch data.");
          setLoading(false);
        }
      }
    };

    fetchAdminData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100">
      <Navbar />
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {userProfile.name}. Here's an overview of the platform.</p>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalUsers ?? 0}</div>
              <p className="text-xs text-gray-500">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <Car className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalCarListings ?? 0}</div>
              <p className="text-xs text-gray-500">+8% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Test Drives Booked</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalTestDrives ?? 0}</div>
              <p className="text-xs text-gray-500">+5 test drives this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Listings and Users */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">Car Listings</TabsTrigger>
            <TabsTrigger value="testdrives">Test Drives</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Car Listings</CardTitle>
                <CardDescription>
                  Manage all cars listed on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Listed On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cars.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell>
                          <div className="font-medium">
                            {car.make} {car.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {car.year} | ${car.price.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{car.user.name}</div>
                          <div className="text-sm text-gray-500">{car.user.email}</div>
                        </TableCell>
                        <TableCell className="capitalize">{car.condition}</TableCell>
                        <TableCell>{formatDate(car.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Drives Tab */}
          <TabsContent value="testdrives">
            <Card>
              <CardHeader>
                <CardTitle>Test Drives</CardTitle>
                <CardDescription>
                  Manage test drive requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testDrives.map((td) => (
                      <TableRow key={td.id}>
                        <TableCell>
                          <div className="font-medium">{td.car.make} {td.car.model}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{td.user.name}</div>
                          <div className="text-sm text-gray-500">{td.user.email}</div>
                        </TableCell>
                        <TableCell>{formatDate(td.date)}</TableCell>
                        <TableCell>{td.timeSlot}</TableCell>
                        <TableCell>{td.contactNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(td.status)}>
                            {getStatusIcon(td.status)}
                            <span className="ml-1 capitalize">{td.status}</span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all user accounts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">{user.role}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}