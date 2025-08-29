"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Car, Upload, X, CheckCircle, AlertCircle } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
}

interface CarFormData {
  make: string
  model: string
  year: string
  price: string
  mileage: string
  condition: string
  description: string
  engine: string
  transmission: string
  color: string
}

export default function PostCarPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: "", content: "" })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState<CarFormData>({
    make: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    condition: "",
    description: "",
    engine: "",
    transmission: "",
    color: "",
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        credentials: "include",
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push("/signin")
      }
    } catch (error) {
      router.push("/signin")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CarFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: "", content: "" })

    try {
      const submitData = new FormData()

      // Add basic car information
      submitData.append("make", formData.make)
      submitData.append("model", formData.model)
      submitData.append("year", formData.year)
      submitData.append("price", formData.price)
      submitData.append("mileage", formData.mileage)
      submitData.append("condition", formData.condition)
      submitData.append("description", formData.description)
      submitData.append("engine", formData.engine)
      submitData.append("transmission", formData.transmission)
      submitData.append("color", formData.color)

      // Add images
      selectedFiles.forEach((file, index) => {
        submitData.append(`images`, file)
      })

      const response = await fetch("http://localhost:5000/api/cars", {
        method: "POST",
        credentials: "include",
        body: submitData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", content: "Car listing created successfully!" })
        // Reset form
        setFormData({
          make: "",
          model: "",
          year: "",
          price: "",
          mileage: "",
          condition: "",
          description: "",
          engine: "",
          transmission: "",
          color: "",
        })
        setSelectedFiles([])
        // Redirect after success
        setTimeout(() => {
          router.push("/cars")
        }, 2000)
      } else {
        setMessage({ type: "error", content: data.message || "Failed to create car listing" })
      }
    } catch (error) {
      setMessage({ type: "error", content: "Network error. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8" />
            <div className="space-y-4">
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h1>
            <p className="text-muted-foreground mb-4">You need to be signed in to post a car listing.</p>
            <Button onClick={() => router.push("/signin")}>Sign In</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Sell Your Car</h1>
          <p className="text-muted-foreground">Create a listing to sell your car to potential buyers</p>
        </div>

        {message.content && (
          <Alert className={`mb-6 ${message.type === "success" ? "border-green-500" : "border-red-500"}`}>
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details about your car</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    placeholder="e.g., Toyota, Honda, BMW"
                    value={formData.make}
                    onChange={(e) => handleInputChange("make", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    placeholder="e.g., Camry, Civic, X5"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Selling Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="25000"
                    min="1"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mileage">Mileage *</Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="50000"
                    min="0"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Certified Pre-Owned">Certified Pre-Owned</SelectItem>
                    <SelectItem value="Excellent">Excellent - new</SelectItem>
                    <SelectItem value="Good">Good - new</SelectItem>
                    <SelectItem value="Fair">Fair - old</SelectItem>
                    <SelectItem value="Poor">Poor - old</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your car's features, history, and any additional details..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
              <CardDescription>Provide technical specifications of your car</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="engine">Engine *</Label>
                  <Input
                    id="engine"
                    placeholder="e.g., 2.0L 4-cylinder"
                    value={formData.engine}
                    onChange={(e) => handleInputChange("engine", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="transmission">Transmission *</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(value) => handleInputChange("transmission", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                      <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Color *</Label>
                  <Input
                    id="color"
                    placeholder="e.g., Black, White, Silver"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Upload photos of your car (multiple files supported)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="images">Car Images</Label>
                <div className="mt-2">
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Selected Files:</h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push("/cars")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? "Creating Listing..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
