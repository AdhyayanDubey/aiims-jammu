"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Heart, Activity, Users, Calendar, Phone, Mail, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Image from "next/image"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "USER"
  })

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  })

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        // Immediately redirect based on role
        if (parsedUser.role === "SUPER_ADMIN") {
          router.push("/super-admin")
        } else if (parsedUser.role === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/user")
        }
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
      }
    }
  }, [router])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (signUpData.password !== signUpData.confirmPassword) {
        toast.error("Passwords do not match")
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          ...signUpData
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Account created successfully! Please sign in.")
        // Reset form
        setSignUpData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          role: "USER"
        })
        // Switch to signin tab automatically
        setTimeout(() => {
          const signinTrigger = document.querySelector('[value="signin"]') as HTMLElement
          if (signinTrigger) signinTrigger.click()
        }, 1000)
      } else {
        toast.error(data.error || "Sign up failed")
      }
    } catch (error) {
      console.error("Sign up error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signin",
          ...signInData
        })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
        toast.success(`Welcome back, ${data.user.firstName}!`)
        
        // Role-based redirect immediately
        if (data.user.role === "SUPER_ADMIN") {
          router.push("/super-admin")
        } else if (data.user.role === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/user")
        }
      } else {
        toast.error(data.error || "Sign in failed")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    toast.success("Logged out successfully")
  }

  // Main sign in/up form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                <Image
                  src="/images/aiims-logo.png"
                  alt="AIIMS Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AIIMS Jammu</h1>
                <p className="text-sm text-gray-600">All India Institute of Medical Sciences</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-700">24/7 Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Trusted Healthcare</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Easy Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Side - Hospital Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/IMG-20240719-WA0007.jpg"
              alt="AIIMS Jammu Hospital"
              width={600}
              height={400}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
              <div className="p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Modern Healthcare Facility</h3>
                <p className="text-gray-200">State-of-the-art medical equipment and experienced professionals</p>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Your Health, <span className="text-blue-600">Our Priority</span>
              </h2>
              <p className="text-lg text-gray-600">
                Connect with healthcare professionals and manage your appointments seamlessly
              </p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/70 backdrop-blur-sm">
                <TabsTrigger value="signin" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-800">Welcome Back</CardTitle>
                    <CardDescription className="text-gray-600">
                      Sign in to access your healthcare dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignIn} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-gray-700 font-medium">Email Address</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signInData.email}
                          onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-gray-700 font-medium">Password</Label>
                        <div className="relative">
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={signInData.password}
                            onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                          </Button>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg" 
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-800">Create Account</CardTitle>
                    <CardDescription className="text-gray-600">
                      Join our healthcare community today
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="First Name"
                            value={signUpData.firstName}
                            onChange={(e) => setSignUpData({...signUpData, firstName: e.target.value})}
                            className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Last Name"
                            value={signUpData.lastName}
                            onChange={(e) => setSignUpData({...signUpData, lastName: e.target.value})}
                            className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                          className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 9876543210"
                          value={signUpData.phone}
                          onChange={(e) => setSignUpData({...signUpData, phone: e.target.value})}
                          className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-gray-700 font-medium">I am a</Label>
                        <select
                          id="role"
                          value={signUpData.role}
                          onChange={(e) => setSignUpData({...signUpData, role: e.target.value})}
                          className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={signUpData.password}
                            onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                            className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                          className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg" 
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative w-12 h-12">
                  <Image
                    src="/images/aiims-logo.png"
                    alt="AIIMS Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AIIMS Jammu</h3>
                  <p className="text-sm text-gray-400">Excellence in Healthcare</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                All India Institute of Medical Sciences, Jammu is committed to providing 
                world-class healthcare services with compassion and excellence.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Departments</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Emergency</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Patient Care</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Book Appointment</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Patient Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Medical Records</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Insurance</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Jammu, J&K, India</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">+91-191-XXX-XXXX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">info@aiimsjammu.edu.in</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AIIMS Jammu. All rights reserved. | Developed with ❤️ for better healthcare</p>
          </div>
        </div>
      </footer>
    </div>
  )
}