"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Navbar } from "@/components/navbar"
import { Car, Calendar, User, Plus, Clock, CheckCircle, XCircle } from "lucide-react"

interface UserProfile {
  _id: string
  name: string
  email: string
  role: string
  createdAt?: string
}

interface TestDrive {
  _id: string
  carId: string
  date: string
  time: string
  status: string
  car: {
    make: string
    model: string
    year: number
    images?: Array<{ url: string; public_id: string }>
  }
  createdAt: string
}

interface UserCar {
  _id: string
  make: string
  model: string
  year: number
  price: number
  images?: Array<{ url: string; public_id: string }>
  condition: string
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [testDrives, setTestDrives] = useState<TestDrive[]>([])
  const [userCars, setUserCars] = useState<UserCar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      // Check authentication and get user profile
      const profileResponse = await fetch("http://localhost:5000/api/users/profile", {
        credentials: "include",
      })

      if (!profileResponse.ok) {
        router.push("/signin")
        return
      }

      const userData = await profileResponse.json()
      setUser(userData)

      // Load test drives
      const testDrivesResponse = await fetch("http://localhost:5000/api/testdrives/my", {
        credentials: "include",
      })

      if (testDrivesResponse.ok) {
        const testDrivesData = await testDrivesResponse.json()
        setTestDrives(testDrivesData)
      }

      // Load user's cars (if they have any posted)
      // Note: This might need a different endpoint like /api/cars/my
      // For now, we'll simulate this or handle it gracefully
      try {
        const carsResponse = await fetch("http://localhost:5000/api/cars/my", {
          credentials: "include",
        })
        if (carsResponse.ok) {
          const carsData = await carsResponse.json()
          setUserCars(carsData)
        }
      } catch (error) {
        // Endpoint might not exist, that's okay
        console.log("User cars endpoint not available")
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      router.push("/signin")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "cancelled":
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8" />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="h-32 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h1>
            <p className="text-muted-foreground mb-4">You need to be signed in to view your dashboard.</p>
            <Button onClick={() => router.push("/signin")}>Sign In</Button>
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
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}!</h1>
              <p className="text-muted-foreground">{user.email}</p>
              {user.role === "admin" && (
                <Badge variant="secondary" className="mt-1">
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Test Drives</p>
                  <p className="text-2xl font-bold text-foreground">{testDrives.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cars Listed</p>
                  <p className="text-2xl font-bold text-foreground">{userCars.length}</p>
                </div>
                <Car className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                  <p className="text-2xl font-bold text-foreground capitalize">{user.role}</p>
                </div>
                <User className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="test-drives">Test Drives</TabsTrigger>
            <TabsTrigger value="my-cars">My Cars</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Test Drives */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Test Drives</CardTitle>
                    <CardDescription>Your latest test drive bookings</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("test-drives")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {testDrives.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No test drives booked yet</p>
                    <Link href="/cars">
                      <Button>Browse Cars</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testDrives.slice(0, 3).map((testDrive, index) => (
                      <div
                        key={testDrive._id || `testdrive-${index}`}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                            {testDrive.car.images?.[0]?.url ? (
                              <img
                                src={testDrive.car.images[0].url || "/placeholder.svg"}
                                alt={`${testDrive.car.make} ${testDrive.car.model}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Car className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {testDrive.car.make} {testDrive.car.model} {testDrive.car.year}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(testDrive.date)} at {formatTime(testDrive.time)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(testDrive.status)}>
                          {getStatusIcon(testDrive.status)}
                          <span className="ml-1 capitalize">{testDrive.status}</span>
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks you might want to do</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/cars">
                    <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
                      <Car className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">Browse Cars</p>
                        <p className="text-sm text-muted-foreground">Find your next car</p>
                      </div>
                    </Button>
                  </Link>
                  <Link href="/post-car">
                    <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
                      <Plus className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">Sell a Car</p>
                        <p className="text-sm text-muted-foreground">List your car for sale</p>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test-drives" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Test Drives</CardTitle>
                <CardDescription>Complete history of your test drive bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {testDrives.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No test drives yet</h3>
                    <p className="text-muted-foreground mb-4">Book your first test drive to get started</p>
                    <Link href="/cars">
                      <Button>Browse Cars</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testDrives.map((testDrive, index) => (
                      <div key={testDrive._id || `testdrive-full-${index}`} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                              {testDrive.car.images?.[0]?.url ? (
                                <img
                                  src={testDrive.car.images[0].url || "/placeholder.svg"}
                                  alt={`${testDrive.car.make} ${testDrive.car.model}`}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Car className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {testDrive.car.make} {testDrive.car.model} {testDrive.car.year}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Scheduled for {formatDate(testDrive.date)} at {formatTime(testDrive.time)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Booked on {formatDate(testDrive.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(testDrive.status)}>
                            {getStatusIcon(testDrive.status)}
                            <span className="ml-1 capitalize">{testDrive.status}</span>
                          </Badge>
                        </div>
                        <div className="flex justify-end">
                          <Link href={`/cars/${testDrive.carId}`}>
                            <Button variant="outline" size="sm">
                              View Car Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-cars" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Car Listings</CardTitle>
                    <CardDescription>Cars you've posted for sale</CardDescription>
                  </div>
                  <Link href="/post-car">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Car
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {userCars.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No cars listed yet</h3>
                    <p className="text-muted-foreground mb-4">Start selling by listing your first car</p>
                    <Link href="/post-car">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Car
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userCars.map((car, index) => (
                      <Card key={car._id || `usercar-${index}`} className="overflow-hidden">
                        <div className="h-48 bg-muted relative">
                          {car.images?.[0]?.url ? (
                            <img
                              src={car.images[0].url || "/placeholder.svg"}
                              alt={`${car.make} ${car.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-foreground">
                              {car.make} {car.model}
                            </h3>
                            <Badge variant="secondary">{car.year}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{car.condition}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-primary">{formatPrice(car.price)}</span>
                            <Badge className={getStatusColor(car.status)}>
                              <span className="capitalize">{car.status}</span>
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
