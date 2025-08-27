"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Car, Search, Shield, Clock, Star, Plus } from "lucide-react"

interface CarListing {
  _id: string // Updated from id to _id to match backend schema
  make: string
  model: string
  year: number
  price: number
  images?: { url: string; public_id: string }[] // Updated to use images array from backend schema
  mileage: number
  condition: string
}

export default function HomePage() {
  const [featuredCars, setFeaturedCars] = useState<CarListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchFeaturedCars()
  }, [])

  const fetchFeaturedCars = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/cars?limit=6")
      if (response.ok) {
        const data = await response.json()
        setFeaturedCars(data)
      }
    } catch (error) {
      console.error("Failed to fetch featured cars:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-card to-background py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Find Your Perfect
            <span className="text-primary"> Dream Car</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Discover thousands of quality vehicles for sale from trusted sellers. Buy with confidence and drive away
            today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cars">
              <Button size="lg" className="text-lg px-8">
                <Search className="mr-2 h-5 w-5" />
                Browse Cars
              </Button>
            </Link>
            <Link href="/post-car">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Plus className="mr-2 h-5 w-5" />
                Sell Your Car
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose carsGO?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Trusted & Secure</h3>
              <p className="text-muted-foreground">
                All vehicles are verified and sellers are background-checked for your safety and peace of mind.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Quick Purchase</h3>
              <p className="text-muted-foreground">
                Find and buy your perfect car quickly with our streamlined purchasing process.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Best Prices</h3>
              <p className="text-muted-foreground">
                Competitive prices with transparent deals. Get the best value for your money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Cars</h2>
            <p className="text-muted-foreground">Discover our most popular vehicles for sale</p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={`loading-${i}`} className="overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-4" />
                    <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car, index) => (
                <Link key={car._id || `car-${index}`} href={`/cars/${car._id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="h-48 bg-muted relative">
                      {car.images && car.images.length > 0 ? (
                        <img
                          src={car.images[0].url || "/placeholder.svg"}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            target.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full flex items-center justify-center ${car.images && car.images.length > 0 ? "hidden" : ""}`}
                      >
                        <Car className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground">
                          {car.make} {car.model}
                        </h3>
                        <Badge variant="secondary">{car.year}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {car.mileage.toLocaleString()} miles • {car.condition}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">₹{car.price.toLocaleString("en-IN")}</span>
                        <Button size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/cars">
              <Button variant="outline" size="lg">
                View All Cars
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Find Your Next Car?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of satisfied customers who trust carsGO for buying and selling cars.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Sign Up Today
              </Button>
            </Link>
            <Link href="/post-car">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Plus className="mr-2 h-5 w-5" />
                Sell Your Car
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
