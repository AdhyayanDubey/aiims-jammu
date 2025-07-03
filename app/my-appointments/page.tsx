"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Search,
  Filter,
  Calendar as CalendarIcon,
  BookOpen 
} from "lucide-react"

interface Appointment {
  id: string
  patientName: string
  email: string
  phone: string
  department: string
  doctor: string
  date: string
  time: string
  symptoms?: string
  status: string
  priority: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setUser(parsed)
      fetchAppointments(parsed.email)
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchAppointments(parsed.email, false)
      }, 30000)
      
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchAppointments = async (email: string, showLoading = true) => {
    if (showLoading) setLoading(true)
    setRefreshing(true)
    
    try {
      const response = await fetch(`/api/user/appointments?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (data.success) {
        setAppointments(Array.isArray(data.appointments) ? data.appointments : [])
      } else {
        toast.error("Failed to fetch appointments")
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast.error("Error loading appointments")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    if (user?.email) {
      fetchAppointments(user.email)
      toast.success("Appointments refreshed!")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'RESCHEDULED':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'PENDING':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-blue-400" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === "" || 
      appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "ALL" || appointment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Sort by creation date (newest first)
  const sortedAppointments = filteredAppointments.sort((a: Appointment, b: Appointment) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-8 text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Required</h1>
          <p className="text-slate-300 mb-6">Please signin to view your appointments</p>
          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 hover:border-blue-400 transition-all duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Signin
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Appointments</h1>
                <p className="text-slate-300 mt-1">
                  Welcome back, <span className="font-semibold text-blue-400">{user.firstName} {user.lastName}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600 hover:text-white hover:border-slate-500 transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Link href="/book-appointment">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 hover:border-blue-400 transition-all duration-200">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book New
                </Button>
              </Link>
              <Link href="/user">
                <Button variant="outline" size="sm" className="border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600 hover:text-white hover:border-slate-500 transition-all duration-200">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-slate-300 font-medium">Loading your appointments...</p>
            </div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                <Calendar className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Appointments Yet</h3>
              <p className="text-slate-300 mb-8">You haven't booked any appointments. Ready to schedule your first visit?</p>
              <Link href="/book-appointment">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 border border-blue-500 hover:border-blue-400 transition-all duration-200">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Your First Appointment
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11 pr-4 py-3 border border-slate-600 bg-slate-700/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-11 pr-10 py-3 border border-slate-600 bg-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="CANCELLED">Rejected</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="RESCHEDULED">Rescheduled</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-slate-300 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/30">
                  <strong>{sortedAppointments.length}</strong> of <strong>{appointments.length}</strong> appointments
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-slate-700/50 to-blue-800/50 border-b border-slate-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                        Appointment Details
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                        Contact Information
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                        Department & Doctor
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                        Schedule
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {sortedAppointments.map((appointment, index) => (
                      <tr key={appointment.id} className="hover:bg-slate-700/30 transition-all duration-200">
                        {/* Appointment Details */}
                        <td className="px-6 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">
                                #{appointment.id.slice(-8)}
                              </div>
                              <div className="text-sm font-medium text-slate-300">
                                {appointment.patientName}
                              </div>
                              <div className="text-xs text-slate-400 mt-1">
                                ID: {appointment.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Information */}
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-slate-300">
                              <Mail className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                              <span className="truncate max-w-[200px]" title={appointment.email}>
                                {appointment.email}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-slate-300">
                              <Phone className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                              {appointment.phone}
                            </div>
                          </div>
                        </td>

                        {/* Department & Doctor */}
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm font-medium text-white">
                              <MapPin className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                              {appointment.department}
                            </div>
                            <div className="text-sm text-slate-300 ml-6">
                              Dr. {appointment.doctor}
                            </div>
                          </div>
                        </td>

                        {/* Schedule */}
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-slate-300">
                              <Calendar className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                              {appointment.date ? new Date(appointment.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'Not scheduled'}
                            </div>
                            <div className="flex items-center text-sm font-medium text-white">
                              <Clock className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                              {appointment.time || 'Not scheduled'}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-6">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-2">{appointment.status === 'CANCELLED' ? 'REJECTED' : appointment.status}</span>
                          </div>
                        </td>

                        {/* Message */}
                        <td className="px-6 py-6">
                          <div className="max-w-xs">
                            {/* Show admin feedback for all appointments that have notes */}
                            {appointment.notes ? (
                              <div className={`text-sm rounded-lg p-3 border mb-2 ${
                                appointment.status === 'CANCELLED' 
                                  ? 'text-red-300 bg-red-900/30 border-red-700/50'
                                  : appointment.status === 'CONFIRMED'
                                  ? 'text-green-300 bg-green-900/30 border-green-700/50'
                                  : 'text-blue-300 bg-blue-900/30 border-blue-700/50'
                              }`}>
                                <div className={`font-semibold text-xs mb-1 flex items-center ${
                                  appointment.status === 'CANCELLED' 
                                    ? 'text-red-400'
                                    : appointment.status === 'CONFIRMED'
                                    ? 'text-green-400'
                                    : 'text-blue-400'
                                }`}>
                                  {appointment.status === 'CANCELLED' ? (
                                    <>
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Rejection Reason:
                                    </>
                                  ) : appointment.status === 'CONFIRMED' ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Admin Message:
                                    </>
                                  ) : (
                                    'Admin Feedback:'
                                  )}
                                </div>
                                <p className="line-clamp-3" title={appointment.notes}>
                                  {appointment.notes}
                                </p>
                              </div>
                            ) : null}
                            
                            {/* Show patient's original message */}
                            {appointment.symptoms ? (
                              <div className="text-sm text-slate-300 bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                                <div className="font-semibold text-slate-400 text-xs mb-1">Your Message:</div>
                                <p className="line-clamp-3" title={appointment.symptoms}>
                                  {appointment.symptoms}
                                </p>
                              </div>
                            ) : !appointment.notes ? (
                              <span className="text-sm text-slate-500 italic">No message</span>
                            ) : null}
                            
                            <div className="flex items-center text-xs text-slate-400 mt-2">
                              <FileText className="w-3 h-3 mr-1" />
                              {new Date(appointment.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}