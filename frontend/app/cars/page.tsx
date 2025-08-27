"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Car, Search, SlidersHorizontal } from "lucide-react"

interface CarListing {
  _id: string
  make: string
  model: string
  year: number
  price: number
  images?: { url: string; public_id: string }[]
  mileage: number
  condition: string
  details?: {
    engine: string
    transmission: string
    color: string
  }
}

export default function CarsPage() {
  const [cars, setCars] = useState<CarListing[]>([])
  const [filteredCars, setFilteredCars] = useState<CarListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    make: "",
    minYear: "",
    maxYear: "",
    minPrice: "",
    maxPrice: "",
    condition: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchCars()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [cars, searchQuery, filters])

  const fetchCars = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/cars")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Fetched cars data:", data)
        console.log("[v0] First car ID:", data[0]?._id, "Type:", typeof data[0]?._id)
        setCars(data)
      }
    } catch (error) {
      console.error("Failed to fetch cars:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = cars

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (car) =>
          car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          car.model.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Make filter
    if (filters.make) {
      filtered = filtered.filter((car) => car.make.toLowerCase() === filters.make.toLowerCase())
    }

    // Year filters
    if (filters.minYear) {
      filtered = filtered.filter((car) => car.year >= Number.parseInt(filters.minYear))
    }
    if (filters.maxYear) {
      filtered = filtered.filter((car) => car.year <= Number.parseInt(filters.maxYear))
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter((car) => car.price >= Number.parseInt(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((car) => car.price <= Number.parseInt(filters.maxPrice))
    }

    // Condition filter
    if (filters.condition) {
      filtered = filtered.filter((car) => car.condition.toLowerCase() === filters.condition.toLowerCase())
    }

    setFilteredCars(filtered)
  }

  const resetFilters = () => {
    setFilters({
      make: "",
      minYear: "",
      maxYear: "",
      minPrice: "",
      maxPrice: "",
      condition: "",
    })
    setSearchQuery("")
  }

  const uniqueMakes = [...new Set(cars.map((car) => car.make))].sort()
  const uniqueConditions = [...new Set(cars.map((car) => car.condition))].sort()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Cars for Sale</h1>
          <p className="text-muted-foreground">
            Find your perfect car from our extensive collection of vehicles for sale
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by make or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <p className="text-sm text-muted-foreground">
              {filteredCars.length} of {cars.length} cars
            </p>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Make</label>
                  <Select value={filters.make} onValueChange={(value) => setFilters({ ...filters, make: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any make" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any make</SelectItem>
                      {uniqueMakes.map((make) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Min Year</label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={filters.minYear}
                    onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Max Year</label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={filters.maxYear}
                    onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Min Price (₹)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Max Price (₹)</label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Condition</label>
                  <Select
                    value={filters.condition}
                    onValueChange={(value) => setFilters({ ...filters, condition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any condition</SelectItem>
                      {uniqueConditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Cars Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-4" />
                  <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No cars found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button onClick={resetFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCars.map((car, index) => (
              <Link
                key={car._id || `car-${index}`}
                href={`/cars/${car._id}`}
                onClick={() => {
                  console.log("[v0] Clicking car with ID:", car._id, "Full car object:", car)
                }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full">
                  <div className="h-48 bg-muted relative">
                    {car.images && car.images.length > 0 ? (
                      <img
                        src={car.images[0].url || "/placeholder.svg"}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          e.currentTarget.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center ${car.images && car.images.length > 0 ? "hidden" : ""}`}
                    >
                      <Car className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <Badge className="absolute top-2 right-2">{car.condition}</Badge>
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground">
                        {car.make} {car.model}
                      </h3>
                      <Badge variant="secondary">{car.year}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {car.mileage.toLocaleString()} km • {car.condition}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xl font-bold text-primary">₹{car.price.toLocaleString("en-IN")}</span>
                      <Button size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
