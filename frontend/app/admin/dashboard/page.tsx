"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Navbar } from "@/components/navbar"
import { Users, Car, Shield, TrendingUp, Eye, CheckCircle, XCircle, Clock } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
}

interface Analytics {
  totalUsers: number
  totalCarListings: number
  totalTestDrives?: number
  recentSignups?: number
  activeListings?: number
  pendingListings?: number
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  status?: string
}

interface AdminCar {
  id: string
  make: string
  model: string
  year: number
  price: number
  condition: string
  status: string
  owner: {
    name: string
    email: string
  }
  createdAt: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [cars, setCars] = useState<AdminCar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      // Check authentication and admin role
      const profileResponse = await fetch("http://localhost:5000/api/auth/profile", {
        credentials: "include",
      })

      if (!profileResponse.ok) {
        router.push("/signin")
        return
      }

      const userData = await profileResponse.json()

      if (userData.role !== "admin") {
        router.push("/dashboard")
        return
      }

      setUser(userData)
      await loadAdminData()
    } catch (error) {
      console.error("Failed to check admin access:", error)
      router.push("/signin")
    } finally {
      setIsLoading(false)
    }
  }

  const loadAdminData = async () => {
    try {
      // Load analytics
      const analyticsResponse = await fetch("http://localhost:5000/api/admin/analytics", {
        credentials: "include",
      })
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }

      // Load users
      const usersResponse = await fetch("http://localhost:5000/api/admin/users", {
        credentials: "include",
      })
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      // Load cars
      const carsResponse = await fetch("http://localhost:5000/api/admin/cars", {
        credentials: "include",
      })
      if (carsResponse.ok) {
        const carsData = await carsResponse.json()
        setCars(carsData)
      }
    } catch (error) {
      console.error("Failed to load admin data:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "inactive":
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8" />
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="h-32 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage users, car listings, and monitor platform analytics</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{analytics?.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Cars</p>
                  <p className="text-2xl font-bold text-foreground">{analytics?.totalCarListings || 0}</p>
                </div>
                <Car className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                  <p className="text-2xl font-bold text-foreground">
                    {
                      cars.filter(
                        (car) => car.status.toLowerCase() === "approved" || car.status.toLowerCase() === "active",
                      ).length
                    }
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold text-foreground">
                    {cars.filter((car) => car.status.toLowerCase() === "pending").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="cars">Car Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-xs">
                            {user.role}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Car Listings</CardTitle>
                  <CardDescription>Latest car submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cars.slice(0, 5).map((car) => (
                      <div key={car.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                            <Car className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {car.make} {car.model} {car.year}
                            </p>
                            <p className="text-xs text-muted-foreground">by {car.owner.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(car.status)}>
                            {getStatusIcon(car.status)}
                            <span className="ml-1 capitalize">{car.status}</span>
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(car.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>All registered users on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
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

          <TabsContent value="cars" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Car Listings Management</CardTitle>
                <CardDescription>All car listings including pending approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Listed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cars.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                              <Car className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {car.make} {car.model}
                              </p>
                              <p className="text-sm text-muted-foreground">{car.year}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{car.owner.name}</p>
                            <p className="text-sm text-muted-foreground">{car.owner.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${car.price}/day</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{car.condition}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(car.status)}>
                            {getStatusIcon(car.status)}
                            <span className="ml-1 capitalize">{car.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(car.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {car.status.toLowerCase() === "pending" && (
                              <>
                                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
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
  )
}
