"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Car, MapPin, User, ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface CarDetails {
  _id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  condition: string
  images: { url: string; public_id: string }[]
  details?: {
    engine?: string
    transmission?: string
    color?: string
  }
  user: {
    name: string
    email: string
    phoneNumber?: string
  }
}

interface BookingForm {
  date: string
  timeSlot: string
  message: string
  contactNumber: string
}

export default function BookTestDrivePage() {
  const [cars, setCars] = useState<CarDetails[]>([])
  const [selectedCar, setSelectedCar] = useState<CarDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    date: "",
    timeSlot: "",
    message: "",
    contactNumber: "",
  })
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchCars()
  }, [])

  useEffect(() => {
    const carId = searchParams.get("carId")
    if (carId && cars.length > 0) {
      const car = cars.find((c) => c._id === carId)
      if (car) {
        setSelectedCar(car)
      }
    }
  }, [cars, searchParams])

  const fetchCars = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/cars")
      if (response.ok) {
        const data = await response.json()
        setCars(data)
      }
    } catch (error) {
      console.error("Failed to fetch cars:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleCarSelect = (car: CarDetails) => {
    setSelectedCar(car)
    setBookingForm({
      date: "",
      timeSlot: "",
      message: "",
      contactNumber: "",
    })
  }

  const handleInputChange = (field: keyof BookingForm, value: string) => {
    setBookingForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCar) return

    setSubmitting(true)
    try {
      const bookingData = {
        car: selectedCar._id,
        date: bookingForm.date,
        timeSlot: bookingForm.timeSlot,
        message: bookingForm.message,
        contactNumber: bookingForm.contactNumber,
      }

      const response = await fetch("http://localhost:5000/api/testdrives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Add this to include cookies in the request
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        alert("Test drive booked successfully!")
        router.push("/dashboard")
      } else {
        alert("Failed to book test drive. Please try again.")
      }
    } catch (error) {
      console.error("Booking error:", error)
      alert("Failed to book test drive. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading available cars...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-balance">Book a Test Drive</h1>
            <p className="text-muted-foreground mt-2">
              {selectedCar ? "Complete your booking details" : "Select a car to book your test drive"}
            </p>
          </div>
        </div>

        {!selectedCar ? (
          // Car Selection View
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <Card
                key={car._id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
              >
                <div className="aspect-video bg-muted relative">
                  {car.images?.[0]?.url ? (
                    <img
                      src={car.images[0].url || "/placeholder.svg"}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2">{car.condition}</Badge>
                </div>
                <CardContent className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">
                      {car.make} {car.model}
                    </h3>
                    <span className="text-sm text-muted-foreground">{car.year}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-2">{formatPrice(car.price)}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>{car.mileage.toLocaleString()} km</span>
                    {car.details?.engine && <span>{car.details.engine}</span>}
                  </div>
                  <Button onClick={() => handleCarSelect(car)} className="w-full mt-auto">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Test Drive
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Booking Form View
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Selected Car Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Selected Car
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg mb-4 relative">
                    {selectedCar.images?.[0]?.url ? (
                      <img
                        src={selectedCar.images[0].url || "/placeholder.svg"}
                        alt={`${selectedCar.make} ${selectedCar.model}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center rounded-lg">
                        <Car className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2">{selectedCar.condition}</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedCar.make} {selectedCar.model} {selectedCar.year}
                  </h3>
                  <p className="text-2xl font-bold text-primary mb-4">{formatPrice(selectedCar.price)}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCar.mileage.toLocaleString()} km driven</span>
                    </div>
                    {selectedCar.details?.engine && (
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCar.details.engine}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Seller: {selectedCar.user.name}</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedCar(null)} className="w-full mt-4">
                    Choose Different Car
                  </Button>
                </CardContent>
              </Card>

              {/* Booking Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="date">Preferred Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="timeSlot">Preferred Time</Label>
                      <Select
                        value={bookingForm.timeSlot}
                        onValueChange={(value) => handleInputChange("timeSlot", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {slot}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <Input
                        id="contactNumber"
                        type="tel"
                        placeholder="Your phone number"
                        value={bookingForm.contactNumber}
                        onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Additional Message (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Any specific requirements or questions..."
                        value={bookingForm.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Booking...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4 mr-2" />
                          Confirm Test Drive Booking
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
