"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Clock, User, Phone, Mail, Building2, MessageSquare, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const appointmentSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Please select a department"),
  preferredDate: z.date({
    required_error: "Please select a date",
  }),
  preferredTime: z.string().min(1, "Please select a time"),
  message: z.string().optional(),
})

type AppointmentForm = z.infer<typeof appointmentSchema>

interface Department {
  id: number
  name: string
  description: string
  head_doctor: string
  available_days: string
  available_hours: string
}

const timeSlots = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
]

export default function BookAppointmentPage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
  })

  const watchedDepartment = watch("department")

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (watchedDepartment) {
      const dept = departments.find((d) => d.name.toLowerCase() === watchedDepartment)
      setSelectedDepartment(dept || null)
    }
  }, [watchedDepartment, departments])

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      const data = await response.json()
      if (data.success) {
        setDepartments(data.departments)
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast.error("Failed to load departments")
    }
  }

  const onSubmit = async (data: AppointmentForm) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Updated field mapping
          patientName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          department: data.department,
          doctor: selectedDepartment?.head_doctor || 'To be assigned',
          date: format(data.preferredDate, "yyyy-MM-dd"),
          time: data.preferredTime,
          symptoms: data.message || '',
          userId: null, // Will be set by backend if user is logged in
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to book appointment')
      }

      const result = await response.json()
      
      if (result.success) {
        setSuccess(true)
        toast.success('Appointment booked successfully!')
        reset()
        setSelectedDate(undefined)
        setSelectedDepartment(null)
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/my-appointments')
        }, 3000)
      } else {
        throw new Error(result.message || 'Failed to book appointment')
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      toast.error(error.message || 'Failed to book appointment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const uniqueDepartments = Array.from(
    new Map(departments.map(dep => [dep.name, dep])).values()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/user">
                <Button variant="outline" className="border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600 hover:text-white hover:border-slate-500 transition-all duration-200">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Book Appointment</h1>
                <p className="text-slate-300">Schedule your visit with our medical experts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border border-blue-500/30">Online Booking</Badge>
            <h2 className="text-4xl font-bold text-white mb-6">Schedule Your Appointment</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Book your appointment with our expert doctors. Fill in your details and we'll confirm your appointment
              within 24 hours.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Appointment Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <CalendarIcon className="w-5 h-5 mr-2 text-blue-400" />
                    Appointment Details
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Please fill in all required fields to book your appointment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-400" />
                        Personal Information
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-white">
                            First Name *
                          </Label>
                          <Input
                            id="firstName"
                            {...register("firstName")}
                            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 ${errors.firstName ? "border-red-500" : ""}`}
                            placeholder="Enter your first name"
                          />
                          {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-white">
                            Last Name *
                          </Label>
                          <Input
                            id="lastName"
                            {...register("lastName")}
                            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 ${errors.lastName ? "border-red-500" : ""}`}
                            placeholder="Enter your last name"
                          />
                          {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email" className="text-white flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 ${errors.email ? "border-red-500" : ""}`}
                            placeholder="your.email@example.com"
                          />
                          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-white flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Phone Number *
                          </Label>
                          <Input
                            id="phone"
                            {...register("phone")}
                            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 ${errors.phone ? "border-red-500" : ""}`}
                            placeholder="+91 XXXXX XXXXX"
                          />
                          {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Appointment Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-green-400" />
                        Appointment Information
                      </h3>

                      <div>
                        <Label className="text-white">Department *</Label>
                        <Select onValueChange={(value) => setValue("department", value)}>
                          <SelectTrigger className={`bg-slate-700/50 border-slate-600 text-white ${errors.department ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="Select Department" className="text-slate-400" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {uniqueDepartments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.name} className="text-white hover:bg-slate-700">
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.department && <p className="text-red-400 text-sm mt-1">{errors.department.message}</p>}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Preferred Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600",
                                  !selectedDate && "text-slate-400",
                                  errors.preferredDate && "border-red-500",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                  setSelectedDate(date)
                                  setValue("preferredDate", date!)
                                }}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="text-white"
                              />
                            </PopoverContent>
                          </Popover>
                          {errors.preferredDate && (
                            <p className="text-red-400 text-sm mt-1">{errors.preferredDate.message}</p>
                          )}
                        </div>

                        <div>
                          <Label className="text-white flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Preferred Time *
                          </Label>
                          <Select onValueChange={(value) => setValue("preferredTime", value)}>
                            <SelectTrigger className={`bg-slate-700/50 border-slate-600 text-white ${errors.preferredTime ? "border-red-500" : ""}`}>
                              <SelectValue placeholder="Select Time" className="text-slate-400" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time} className="text-white hover:bg-slate-700">
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.preferredTime && (
                            <p className="text-red-400 text-sm mt-1">{errors.preferredTime.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
                        Additional Information
                      </h3>

                      <div>
                        <Label htmlFor="message" className="text-white">
                          Message (Optional)
                        </Label>
                        <Textarea
                          id="message"
                          {...register("message")}
                          placeholder="Please describe your symptoms or any specific concerns..."
                          rows={4}
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        {isSubmitting ? "Booking Appointment..." : "Book Appointment"}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar Information */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Department Information */}
              {selectedDepartment && (
                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Department Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white">{selectedDepartment.name}</h4>
                      <p className="text-sm text-slate-300">{selectedDepartment.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Head Doctor:</p>
                      <p className="text-sm text-slate-300">{selectedDepartment.head_doctor}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Available Days:</p>
                      <p className="text-sm text-slate-300">{selectedDepartment.available_days}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Available Hours:</p>
                      <p className="text-sm text-slate-300">{selectedDepartment.available_hours}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">Phone</p>
                      <p className="text-sm text-slate-300">0191 351 0629</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-medium text-white">Email</p>
                      <p className="text-sm text-slate-300">ithelpdesk@aiimsjammu.edu.in</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-medium text-white">Address</p>
                      <p className="text-sm text-slate-300">
                        H27P+P8, Vijaypur, Bari Kamlia, Jammu and Kashmir 180001
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Important Notes */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Important Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <p className="text-sm text-slate-300">
                      Please arrive 15 minutes before your appointment time
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <p className="text-sm text-slate-300">
                      Bring your ID proof and previous medical records
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <p className="text-sm text-slate-300">
                      Appointment confirmation will be sent via SMS/Email
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <p className="text-sm text-slate-300">
                      For emergencies, please call our 24/7 helpline
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg">
          Appointment booked! You will be contacted shortly.
        </div>
      )}
    </div>
  )
}
