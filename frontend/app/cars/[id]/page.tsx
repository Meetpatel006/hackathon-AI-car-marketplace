"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"
import {
  Car,
  Gauge,
  Palette,
  Settings,
  ArrowLeft,
  CheckCircle,
  Calculator,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface CarDetails {
  _id: string
  user: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  condition: string
  description?: string
  images: Array<{
    url: string
    public_id: string
  }>
  engine?: string
  transmission?: string
  color?: string
  createdAt: string
  updatedAt: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
}

interface SellerContact {
  name: string
  email: string
  phoneNumber?: string
  address: object
  message?: string
}

const EMICalculator = ({ carPrice }: { carPrice: number }) => {
  const [loanAmount, setLoanAmount] = useState(carPrice * 0.8) // 80% of car price
  const [interestRate, setInterestRate] = useState(8.5)
  const [tenure, setTenure] = useState(5)
  const [emi, setEmi] = useState(0)

  useEffect(() => {
    calculateEMI()
  }, [loanAmount, interestRate, tenure])

  const calculateEMI = () => {
    const principal = loanAmount
    const rate = interestRate / 12 / 100
    const time = tenure * 12

    if (rate === 0) {
      setEmi(principal / time)
    } else {
      const emiValue = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1)
      setEmi(emiValue)
    }
  }

  const totalAmount = emi * tenure * 12
  const totalInterest = totalAmount - loanAmount

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          EMI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
            <Input
              id="loanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              min="10000"
              max={carPrice}
            />
          </div>
          <div>
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              min="1"
              max="20"
            />
          </div>
          <div>
            <Label htmlFor="tenure">Tenure (Years)</Label>
            <Input
              id="tenure"
              type="number"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              min="1"
              max="10"
            />
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Monthly EMI:</span>
            <span className="font-semibold text-primary">
              ₹{emi.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Amount:</span>
            <span className="font-medium">₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Interest:</span>
            <span className="font-medium">₹{totalInterest.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CarDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [car, setCar] = useState<CarDetails | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showEMICalculator, setShowEMICalculator] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [sellerContact, setSellerContact] = useState<SellerContact | null>(null)
  const [contactLoading, setContactLoading] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchCarDetails()
      checkAuthStatus()
    }
  }, [params.id])

  const fetchCarDetails = async () => {
    try {
      console.log("[v0] Fetching car details for ID:", params.id, "Type:", typeof params.id)
      const response = await fetch("http://localhost:5000/api/cars")
      if (response.ok) {
        const allCars = await response.json()
        console.log("[v0] All cars fetched:", allCars)
        console.log("[v0] Looking for car with ID:", params.id)

        const foundCar = allCars.find((car: CarDetails) => {
          console.log("[v0] Compare:", car._id, "with", params.id, "Types:", typeof car._id, typeof params.id)
          return car._id === params.id || car._id === Number(params.id) || String(car._id) === String(params.id)
        })

        console.log("[v0] Found car:", foundCar)
        if (foundCar) {
          setCar(foundCar)
        } else {
          console.log("[v0] Car not found, redirecting to /cars")
          router.push("/cars")
        }
      } else {
        console.log("[v0] API response not ok, redirecting to /cars")
        router.push("/cars")
      }
    } catch (error) {
      console.error("Failed to fetch car details:", error)
      router.push("/cars")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        credentials: "include",
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.log("Not authenticated")
    }
  }

  const handleContactSeller = async () => {
    if (!user) {
      router.push("/signin")
      return
    }

    setContactLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/cars/${params.id}/contact`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (response.ok) {
        const sellerData = await response.json()
        setSellerContact(sellerData)
        setContactMessage("Seller contact information retrieved successfully!")
      } else {
        setContactMessage("Failed to get seller contact information. Please try again.")
      }
    } catch (error) {
      console.error("Error fetching seller contact:", error)
      setContactMessage("Failed to get seller contact information. Please try again.")
    } finally {
      setContactLoading(false)
      setTimeout(() => setContactMessage(""), 5000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8" />
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-32 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Car not found</h1>
            <p className="text-muted-foreground mb-4">The car you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/cars")}>Back to Cars</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push("/cars")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cars
        </Button>

        {/* Contact Status Messages */}
        {contactMessage && (
          <Alert className="mb-6 border-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{contactMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Car Image */}
          <div className="space-y-4">
            <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
              {car?.images && car.images.length > 0 ? (
                <>
                  <img
                    src={car.images[selectedImageIndex]?.url || "/placeholder.svg"}
                    alt={`${car.make} ${car.model} - Image ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      target.nextElementSibling?.classList.remove("hidden")
                    }}
                  />

                  {/* Navigation Arrows */}
                  {car.images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? car.images.length - 1 : prev - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={() => setSelectedImageIndex((prev) => (prev === car.images.length - 1 ? 0 : prev + 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* Image Counter */}
                  {car.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {selectedImageIndex + 1} / {car.images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {car?.images && car.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`${car.make} ${car.model} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        target.parentElement?.classList.add("bg-muted", "flex", "items-center", "justify-center")
                        const carIcon = document.createElement("div")
                        carIcon.innerHTML =
                          '<svg class="h-8 w-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0m-11 0a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0M17.5 7H6.5L5 11v6a1 1 0 001 1h1a3 3 0 006 0h2a3 3 0 006 0h1a1 1 0 001-1v-6l-1.5-4.5z"/></svg>'
                        target.parentElement?.appendChild(carIcon)
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {car.make} {car.model}
                </h1>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {car.year}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                {car.mileage.toLocaleString()} miles • {car.condition}
              </p>
              <div className="text-3xl font-bold text-primary mb-6">₹{car.price.toLocaleString("en-IN")}</div>
            </div>

            {/* Description */}
            {car.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground whitespace-pre-line">{car.description}</div>
                </CardContent>
              </Card>
            )}

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Engine:</span>
                    <span className="text-sm font-medium">{car.engine || "Not specified"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Transmission:</span>
                    <span className="text-sm font-medium">{car.transmission || "Not specified"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Color:</span>
                    <span className="text-sm font-medium">{car.color || "Not specified"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Mileage:</span>
                    <span className="text-sm font-medium">{car.mileage.toLocaleString()} miles</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EMI Calculator */}
            {showEMICalculator && <EMICalculator carPrice={car.price} />}

            {/* Contact/Purchase Section */}
            <Card>
              <CardHeader>
                <CardTitle>Interested in this car?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => setShowEMICalculator(!showEMICalculator)} variant="outline" className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  {showEMICalculator ? "Hide" : "Show"} EMI Calculator
                </Button>

                {user && (
                  <Button
                    onClick={() => router.push(`/book-test-drive?carId=${car._id}`)}
                    variant="outline"
                    className="w-full"
                  >
                    <Car className="h-4 w-4 mr-2" />
                    Book Test Drive
                  </Button>
                )}

                {user ? (
                  <Button onClick={handleContactSeller} className="w-full" size="lg" disabled={contactLoading}>
                    {contactLoading ? "Getting Contact Info..." : "Contact Seller"}
                  </Button>
                ) : (
                  <Button onClick={() => router.push("/signin")} className="w-full" size="lg">
                    Sign In to Contact Seller
                  </Button>
                )}

                {sellerContact && (
                  <Card className="mt-4 border-primary/20">
                    <CardHeader className="border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        Seller Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Personal Information */}
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label className="text-muted-foreground">Name</Label>
                            <div className="font-medium">{sellerContact.name}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-muted-foreground">Email</Label>
                            <div className="font-medium">{sellerContact.email}</div>
                          </div>
                          {sellerContact.phoneNumber && (
                            <div className="space-y-1">
                              <Label className="text-muted-foreground">Phone</Label>
                              <div className="font-medium">{sellerContact.phoneNumber}</div>
                            </div>
                          )}
                        </div>

                        {/* Address Information */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground">Address</h4>
                          <div className="space-y-2">
                            {sellerContact.address?.street && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Street:</span>{" "}
                                <span className="font-medium">{sellerContact.address.street}</span>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              {sellerContact.address?.city && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">City:</span>{" "}
                                  <span className="font-medium">{sellerContact.address.city}</span>
                                </div>
                              )}
                              {sellerContact.address?.state && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">State:</span>{" "}
                                  <span className="font-medium">{sellerContact.address.state}</span>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {sellerContact.address?.zip && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">ZIP:</span>{" "}
                                  <span className="font-medium">{sellerContact.address.zip}</span>
                                </div>
                              )}
                              {sellerContact.address?.country && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Country:</span>{" "}
                                  <span className="font-medium">{sellerContact.address.country}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Message Section */}
                      {sellerContact.message && (
                        <div className="mt-4 pt-4 border-t">
                          <Label className="text-muted-foreground">Message</Label>
                          <div className="mt-1 text-sm">{sellerContact.message}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
