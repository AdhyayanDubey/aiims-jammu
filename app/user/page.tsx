"use client"

// Import necessary libraries and components
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Phone,
  Users,
  Heart,
  Shield,
  Award,
  CalendarIcon as CalendarLucide,
  Stethoscope,
  Building2,
  Truck,
  UserCheck,
  Star,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Activity,
  Zap,
  Globe,
  Bell,
} from "lucide-react"
import Image from "next/image";
import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// CountUp component (simple implementation)
function CountUp({ end, duration, isCounting }: { end: number; duration: number; isCounting: boolean }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!isCounting) return
    
    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = (currentTime - startTime) / (duration * 1000)
      
      if (progress < 1) {
        setCount(Math.floor(end * progress))
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end, duration, isCounting])
  
  return <span>{count}</span>
}

// Sample data for charts
const patientData = [
  { month: "Jan", patients: 1200, satisfaction: 95 },
  { month: "Feb", patients: 1350, satisfaction: 96 },
  { month: "Mar", patients: 1500, satisfaction: 94 },
  { month: "Apr", patients: 1650, satisfaction: 97 },
  { month: "May", patients: 1800, satisfaction: 98 },
  { month: "Jun", patients: 1950, satisfaction: 96 },
]

const departmentData = [
  { name: "Cardiology", value: 25, color: "#3B82F6" },
  { name: "Neurology", value: 20, color: "#10B981" },
  { name: "Orthopedics", value: 18, color: "#8B5CF6" },
  { name: "Pediatrics", value: 15, color: "#F59E0B" },
  { name: "Others", value: 22, color: "#EF4444" },
]

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ role: string; email: string; name?: string } | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Check for saved theme preference or default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Check for user authentication
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setUser(parsed)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-16 w-full mb-8 bg-white/10 border border-white/20" />
          <Skeleton className="h-96 w-full mb-8 bg-white/10 border border-white/20" />
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full bg-white/10 border border-white/20" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 transition-colors duration-300">
      <Toaster />
      {/* Enhanced Header with Glass Effect */}
      <header className="w-full px-6 py-3 flex items-center justify-between bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20 z-50">
  {/* Logo and Title */}
  <div className="flex items-center space-x-3">
    <Image
      src="/images/aiims-logo.png"
      alt="AIIMS Jammu Logo"
      width={44}
      height={44}
      className="rounded-full border border-white/30 shadow-lg"
    />
    <div className="flex flex-col leading-tight">
      <span className="text-lg font-bold text-white drop-shadow-lg">AIIMS Jammu</span>
      <span className="text-xs text-white/80 font-medium drop-shadow-md">All India Institute of Medical Sciences</span>
    </div>
  </div>

  {/* Navigation */}
  <nav className="flex space-x-6 ml-10">
    {["Home", "Services", "Doctors", "Departments", "Contact"].map((item) => (
      <a
        key={item}
        href={`#${item.toLowerCase()}`}
        className="text-base text-white/90 hover:text-blue-300 font-medium transition-colors drop-shadow-md"
      >
        {item}
      </a>
    ))}
  </nav>

  {/* Action Buttons */}
  <div className="flex items-center space-x-3">
    <Link href="/book-appointment">
      <button className="px-4 py-2 text-sm bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors shadow-lg backdrop-blur-sm border border-white/30">
        Book Appointment
      </button>
    </Link>
    <Link href="/my-appointments">
      <button className="px-4 py-2 text-sm bg-blue-600/80 hover:bg-blue-700/80 text-white rounded-lg font-semibold transition-colors shadow-lg backdrop-blur-sm">
        My Appointments
      </button>
    </Link>
    <button
      className="px-4 py-2 text-sm bg-red-600/80 hover:bg-red-700/80 text-white rounded-lg font-semibold border border-red-500/50 transition-colors shadow-lg backdrop-blur-sm"
      onClick={() => {
        localStorage.removeItem("user");
        window.location.href = "/"; // Redirect to main page (signin/register)
      }}
    >
      Logout
    </button>
  </div>
</header>

{/* Emergency Banner (keep only this one) */}
<motion.div
  initial={{ y: -40, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ type: "spring", stiffness: 120, damping: 12 }}
  className="w-full py-1 px-4 bg-red-600/90 backdrop-blur-sm flex items-center justify-center text-[13px] font-semibold text-white shadow-lg border-b border-red-500/50 relative z-10"
>
  <span className="flex items-center">
    {/* Animated Emergency Icon */}
    <span className="relative flex items-center mr-1">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M3 13h2l.4 2M7 13h10l1.4-4H6.6M17 13v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6m5-6V4a2 2 0 1 1 4 0v3"></path>
      </svg>
      {/* Pulsing effect */}
      <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-red-500 opacity-50 animate-ping z-0"></span>
    </span>
    <span className="z-10">
      24/7 Emergency Services Available
      <span className="mx-2 text-yellow-300 font-bold">|</span>
      {/* Clickable phone number with hover effect */}
      <a
        href="tel:01913510629"
        className="text-yellow-300 font-bold transition-colors duration-200 hover:text-yellow-100 underline underline-offset-2"
      >
        Call: 0191-351-0629
      </a>
    </span>
  </span>
</motion.div>

      {/* Enhanced Hero Section with Parallax */}
      <section
        id="home"
        className="relative bg-white/5 backdrop-blur-sm py-20 overflow-hidden border-b border-white/10"
      >
        <motion.div className="absolute inset-0 opacity-20" style={{ y: y1 }}>
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Badge className="mb-6 bg-white/20 backdrop-blur-sm text-white px-4 py-2 border border-white/30 shadow-lg">
                  <Award className="w-4 h-4 mr-2" />
                  Premier Healthcare Institution
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Welcome to our platform{" "}
                <motion.span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400"
                  animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                >
                  AIIMS Jammu
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl text-white/90 mb-8 leading-relaxed drop-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Providing world-class medical care, advanced treatments, and compassionate service to the people of
                Jammu & Kashmir and beyond. Your health is our priority.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {user?.role === "user" && (
  <Link href="/book-appointment">
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
      >
        <CalendarLucide className="w-5 h-5 mr-2" />
        Book Appointment
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  </Link>
)}
              </motion.div>

              {/* Animated Statistics */}
              <motion.div
                className="grid grid-cols-3 gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                {[
                  { value: 500, label: "Beds", suffix: "+", color: "text-blue-600 dark:text-blue-400" },
                  { value: 200, label: "Doctors", suffix: "+", color: "text-green-600 dark:text-green-400" },
                  { value: 24, label: "Emergency", suffix: "/7", color: "text-purple-600 dark:text-purple-400" },
                ].map((stat, index) => (
                  <motion.div key={index} className="text-center" whileHover={{ scale: 1.1 }}>
                    <div className={`text-3xl font-bold ${stat.color}`}>
                      <CountUp isCounting end={stat.value} duration={2} />
                      {stat.suffix}
                    </div>
                    <div className="text-sm text-white/80 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ y: y2 }}
            >
              <div className="relative">
                {/* Background blur effect - lowest z-index */}
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl blur-2xl opacity-20"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                  style={{ zIndex: 1 }}
                />

                {/* Main image - middle z-index */}
                <Image
                  src="/images/IMG-20240719-WA0007.jpg"
                  alt="AIIMS Jammu Hospital"
                  width={700}
                  height={600}
                  className="rounded-2xl shadow-2xl relative"
                  style={{ zIndex: 10, position: "relative" }}
                />

                {/* Floating Cards - highest z-index */}
                <motion.div
                  className="absolute -bottom-8 -left-8 bg-white/20 backdrop-blur-lg border border-white/30 p-6 rounded-xl shadow-2xl"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  whileHover={{ scale: 1.05 }}
                  style={{ zIndex: 20 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white drop-shadow-md">Trusted Care</div>
                      <div className="text-sm text-white/90 drop-shadow-md">Since 2024</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -top-8 -right-8 bg-white/20 backdrop-blur-lg border border-white/30 p-4 rounded-xl shadow-2xl"
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  whileHover={{ scale: 1.05 }}
                  style={{ zIndex: 20 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-white drop-shadow-md">4.9/5 Rating</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Statistics Section with Charts */}
      <section className="py-20 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Our Impact</Badge>
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Healthcare Excellence in Numbers</h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                    Patient Growth & Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={patientData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="month" stroke={isDarkMode ? "#d1d5db" : "#6b7280"} />
                      <YAxis stroke={isDarkMode ? "#d1d5db" : "#6b7280"} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                          borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                          color: isDarkMode ? "#f9fafb" : "#111827",
                        }}
                      />
                      <Line type="monotone" dataKey="patients" stroke="#3B82F6" strokeWidth={3} />
                      <Line type="monotone" dataKey="satisfaction" stroke="#10B981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Activity className="w-5 h-5 mr-2 text-green-400" />
                    Department Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                          borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                          color: isDarkMode ? "#f9fafb" : "#111827",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rest of the sections remain the same... */}
      {/* I'll keep the rest of the content as it was to maintain the existing functionality */}

      {/* Enhanced Services Section with Tabs */}
      <section id="services" className="py-20 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Our Services</Badge>
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Comprehensive Medical Services</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
              State-of-the-art facilities and expert medical professionals providing world-class healthcare services
            </p>
          </motion.div>

          <Tabs defaultValue="emergency" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12">
              <TabsTrigger value="emergency" className="flex items-center space-x-2">
                <Truck className="w-4 h-4" />
                <span>Emergency</span>
              </TabsTrigger>
              <TabsTrigger value="specialty" className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Specialty</span>
              </TabsTrigger>
              <TabsTrigger value="diagnostic" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Diagnostic</span>
              </TabsTrigger>
              <TabsTrigger value="wellness" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Wellness</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="emergency">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: Truck,
                    title: "24/7 Emergency",
                    desc: "Round-the-clock emergency medical services",
                    color: "red",
                  },
                  {
                    icon: Heart,
                    title: "Cardiac Emergency",
                    desc: "Specialized cardiac emergency care",
                    color: "blue",
                  },
                  { icon: Activity, title: "Trauma Care", desc: "Advanced trauma and critical care", color: "green" },
                ].map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card className="h-full hover:shadow-2xl transition-all duration-300 border-l-4 border-l-red-400 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                      <CardHeader>
                        <div
                          className={`w-12 h-12 bg-${service.color}-100 dark:bg-${service.color}-900 rounded-full flex items-center justify-center mb-4`}
                        >
                          <service.icon
                            className={`w-6 h-6 text-${service.color}-600 dark:text-${service.color}-400`}
                          />
                        </div>
                        <CardTitle className="text-xl text-white">{service.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/80 mb-4">{service.desc}</p>
                        <Button variant="link" className="p-0 text-red-600 dark:text-red-400">
                          Learn More <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="specialty">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Heart, title: "Cardiology", desc: "Advanced cardiac care", patients: "2000+" },
                  {
                    icon: Stethoscope,
                    title: "General Medicine",
                    desc: "Comprehensive primary care",
                    patients: "5000+",
                  },
                  { icon: Building2, title: "Surgery", desc: "Minimally invasive procedures", patients: "1500+" },
                  { icon: UserCheck, title: "Pediatrics", desc: "Specialized child healthcare", patients: "3000+" },
                ].map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="text-center hover:shadow-2xl transition-all duration-300 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                      <CardHeader>
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                          <service.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-lg text-white">{service.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/80 mb-4">{service.desc}</p>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {service.patients}
                        </div>
                        <p className="text-sm text-white/80">Patients Treated</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="diagnostic">
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">Advanced Diagnostics</CardTitle>
                      <CardDescription className="text-white/80">
                        State-of-the-art diagnostic equipment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { name: "MRI Scanning", progress: 95 },
                          { name: "CT Scanning", progress: 90 },
                          { name: "Ultrasound", progress: 98 },
                          { name: "X-Ray", progress: 100 },
                        ].map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium dark:text-white">{item.name}</span>
                              <span className="text-sm text-white/80">{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">Laboratory Services</CardTitle>
                      <CardDescription className="text-white/80">Comprehensive lab testing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          "Blood Tests",
                          "Urine Analysis",
                          "Pathology",
                          "Microbiology",
                          "Biochemistry",
                          "Hematology",
                        ].map((test, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center space-x-2 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                            whileHover={{ scale: 1.05 }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium dark:text-white">{test}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="wellness">
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <Card className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">Wellness Programs</CardTitle>
                      <CardDescription className="text-white/80">
                        Preventive healthcare and wellness initiatives
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { title: "Health Checkups", desc: "Comprehensive health screening" },
                          { title: "Vaccination", desc: "Immunization programs" },
                          { title: "Health Education", desc: "Community health awareness" },
                          { title: "Nutrition Counseling", desc: "Dietary guidance" },
                        ].map((program, index) => (
                          <motion.div
                            key={index}
                            className="text-left p-4 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                          >
                            <h4 className="font-semibold text-white mb-2">{program.title}</h4>
                            <p className="text-white/80 text-sm">{program.desc}</p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* News & Announcements Section */}
      <section className="py-20 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              <Bell className="w-4 h-4 mr-2" />
              Latest Updates
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">News & Announcements</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Stay updated with the latest news, medical breakthroughs, and important announcements from AIIMS Jammu
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "New Cardiac Surgery Wing Inaugurated",
                date: "December 15, 2024",
                category: "Infrastructure",
                excerpt:
                  "AIIMS Jammu inaugurates state-of-the-art cardiac surgery wing with advanced robotic surgery capabilities and modern ICU facilities.",
                image: "/placeholder.svg?height=200&width=400",
                urgent: false,
              },
              {
                title: "Free Health Camp in Rural Areas",
                date: "December 10, 2024",
                category: "Community Service",
                excerpt:
                  "Medical team conducts comprehensive health screening camps in remote villages of J&K, providing free consultations and medicines.",
                image: "/placeholder.svg?height=200&width=400",
                urgent: true,
              },
              {
                title: "Research Excellence Award",
                date: "December 5, 2024",
                category: "Achievement",
                excerpt:
                  "AIIMS Jammu receives national recognition for outstanding contributions to medical research in high-altitude medicine.",
                image: "/placeholder.svg?height=200&width=400",
                urgent: false,
              },
            ].map((news, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                  <div className="relative">
                    <Image
                      src={news.image || "/placeholder.svg"}
                      alt={news.title}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {news.urgent && <Badge className="absolute top-3 right-3 bg-red-500 text-white">Urgent</Badge>}
                    <Badge className="absolute top-3 left-3 bg-blue-500 text-white">{news.category}</Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/80">{news.date}</span>
                    </div>
                    <CardTitle className="text-lg text-white">{news.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 mb-4">{news.excerpt}</p>
                    <Button variant="link" className="p-0 text-blue-600 dark:text-blue-400">
                      Read More <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" size="lg" className="dark:border-gray-600 dark:text-white">
              View All News
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Doctors Section with Carousel */}
      <section id="doctors" className="py-20 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
              Our Team
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Meet Our Expert Doctors</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Experienced medical professionals dedicated to providing exceptional healthcare
            </p>
          </motion.div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {[
                {
                  name: "Dr. Rajesh Kumar",
                  specialty: "Chief Cardiologist",
                  experience: "20+ Years",
                  education: "MBBS, MD, DM Cardiology",
                  achievements: "500+ Surgeries",
                  rating: 4.9,
                },
                {
                  name: "Dr. Priya Sharma",
                  specialty: "Head of Neurology",
                  experience: "15+ Years",
                  education: "MBBS, MD, DM Neurology",
                  achievements: "Research Excellence Award",
                  rating: 4.8,
                },
                {
                  name: "Dr. Amit Singh",
                  specialty: "Senior Surgeon",
                  experience: "18+ Years",
                  education: "MBBS, MS General Surgery",
                  achievements: "1000+ Operations",
                  rating: 4.9,
                },
                {
                  name: "Dr. Sunita Devi",
                  specialty: "Pediatric Specialist",
                  experience: "12+ Years",
                  education: "MBBS, MD Pediatrics",
                  achievements: "Child Care Excellence",
                  rating: 4.7,
                },
              ].map((doctor, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                      <CardHeader className="text-center">
                        <div className="relative mx-auto mb-4">
                          <Image
                            src="/placeholder.svg?height=120&width=120"
                            alt={doctor.name}
                            width={120}
                            height={120}
                            className="rounded-full mx-auto"
                          />
                          <motion.div
                            className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                          >
                            <CheckCircle className="w-5 h-5 text-white" />
                          </motion.div>
                        </div>
                        <CardTitle className="text-xl text-white">{doctor.name}</CardTitle>
                        <CardDescription className="text-blue-600 dark:text-blue-400 font-medium">
                          {doctor.specialty}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? "fill-yellow-400 text-yellow-400" : "text-white/40"}`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-white/70">({doctor.rating})</span>
                        </div>
                        <div className="space-y-2 mb-6">
                          <p className="text-sm text-white/80">
                            <strong>Experience:</strong> {doctor.experience}
                          </p>
                          <p className="text-sm text-white/80">
                            <strong>Education:</strong> {doctor.education}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{doctor.achievements}</p>
                        </div>
                        <Link href="/book-appointment">
                          <Button variant="outline" size="sm" className="w-full dark:border-gray-700 dark:text-white">
                            <CalendarLucide className="w-4 h-4 mr-2" />
                            Book Appointment
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-green-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-white/20 text-white">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Excellence That Sets Us Apart</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Discover what makes AIIMS Jammu the preferred choice for healthcare
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: "Excellence in Care",
                desc: "Nationally recognized for quality healthcare and patient satisfaction",
                color: "from-yellow-400 to-orange-500",
              },
              {
                icon: Users,
                title: "Expert Team",
                desc: "Highly qualified doctors and medical professionals with years of experience",
                color: "from-green-400 to-blue-500",
              },
              {
                icon: Zap,
                title: "Advanced Technology",
                desc: "State-of-the-art medical equipment and cutting-edge treatment facilities",
                color: "from-purple-400 to-pink-500",
              },
              {
                icon: Globe,
                title: "24/7 Service",
                desc: "Round-the-clock emergency and critical care services for all patients",
                color: "from-blue-400 to-green-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-2xl transition-all duration-300`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-blue-100 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section id="contact" className="py-20 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Get In Touch</Badge>
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Contact Us</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Ready to experience world-class healthcare? Get in touch with us today
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Phone className="w-5 h-5 mr-2 text-blue-400" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    {
                      icon: Phone,
                      title: "Address",
                      content: "Sector 22, Bhagwati Nagar, Jammu, J&K 180017",
                      color: "text-blue-600 dark:text-blue-400",
                    },
                    {
                      icon: Phone,
                      title: "Phone",
                      content: "+91-191-258-4000",
                      color: "text-green-600 dark:text-green-400",
                    },
                    {
                      icon: Phone,
                      title: "OPD Hours",
                      content: "Mon-Sat: 8:00 AM - 2:00 PM",
                      color: "text-purple-600 dark:text-purple-400",
                    },
                    {
                      icon: Truck,
                      title: "Emergency",
                      content: "24/7 Available",
                      color: "text-red-600 dark:text-red-400",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div
                        className={`w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-white/30`}
                      >
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-white/80">{item.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <CalendarLucide className="w-5 h-5 mr-2 text-blue-400" />
                    Quick Appointment Booking
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    Fill out the form below and we&apos;ll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CalendarLucide className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Book Your Appointment Online
                    </h3>
                    <p className="text-white/80 mb-6">
                      Use our dedicated appointment booking page for a better experience
                    </p>
                    <Link href="/book-appointment">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                      >
                        <CalendarLucide className="w-5 h-5 mr-2" />
                        Go to Appointment Booking
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <Image
                    src="/images/aiims-logo.png"
                    alt="AIIMS Jammu Logo"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AIIMS Jammu</h3>
                  <p className="text-sm text-white/80">Excellence in Healthcare</p>
                </div>
              </div>
              <p className="text-white/80 leading-relaxed mb-6">
                Providing world-class medical care and education in the beautiful region of Jammu & Kashmir.
              </p>
              <div className="flex space-x-4">
                {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                  <motion.div
                    key={social}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <Globe className="w-5 h-5" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {[
              {
                title: "Quick Links",
                links: ["About Us", "Departments", "Doctors", "Services", "Careers"],
              },
              {
                title: "Patient Care",
                links: ["Book Appointment", "Patient Portal", "Health Records", "Insurance", "Billing"],
              },
              {
                title: "Resources",
                links: ["Health Tips", "Medical News", "Research", "Publications", "Contact"],
              },
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index + 1) * 0.1 }}
              >
                <h4 className="text-lg font-semibold mb-6">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href="#"
                        className="text-white/80 hover:text-white transition-colors flex items-center group"
                      >
                        <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <Separator className="bg-gray-800 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.p
              className="text-white/80 text-sm mb-4 md:mb-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              © 2024 All India Institute of Medical Sciences, Jammu. All rights reserved.
            </motion.p>
            <motion.div
              className="flex space-x-6 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Accessibility
              </Link>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}

