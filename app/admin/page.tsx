"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarCheck } from "lucide-react"
import toast from "react-hot-toast"
import { 
  Users, 
  Calendar, 
  Settings, 
  Bell, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  User,
  RefreshCw,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart
} from "lucide-react"

// Chart components
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

// Define proper types
interface AppointmentType {
  id: string
  patientName?: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  department: string
  doctor?: string
  date?: string
  time?: string
  status: string
  createdAt: string
  updatedAt: string
}

interface UserType {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  createdAt: string
  updatedAt: string
}

interface CurrentUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<AppointmentType[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState<CurrentUser | null>(null)
  const router = useRouter()

  // Check user authentication
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.replace("/")
      return
    }
    
    try {
      const parsedUser = JSON.parse(storedUser) as CurrentUser
      if (parsedUser.role !== "ADMIN" && parsedUser.role !== "SUPER_ADMIN") {
        router.replace("/")
        return
      }
      
      setUser(parsedUser)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.replace("/")
      return
    }
    
    setInitialLoading(false)
  }, [router])

  // Fetch data with real-time updates
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setRefreshing(true)
      try {
        const [appointmentsRes, usersRes] = await Promise.all([
          fetch('/api/admin/appointments'),
          fetch('/api/admin/users')
        ])
        
        const appointmentsData = await appointmentsRes.json()
        const usersData = await usersRes.json()
        
        if (appointmentsData.success) {
          setAppointments(appointmentsData.appointments || [])
        }

        if (usersData.success) {
          setUsers(usersData.users || [])
        }
        
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    fetchData()
    // Real-time updates every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'CANCELLED':
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'PENDING':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  // Calculate comprehensive stats
  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => 
      a.status === 'PENDING' || a.status === 'pending'
    ).length,
    approvedAppointments: appointments.filter(a => 
      a.status === 'CONFIRMED' || a.status === 'confirmed' || a.status === 'APPROVED'
    ).length,
    rejectedAppointments: appointments.filter(a => 
      a.status === 'CANCELLED' || a.status === 'cancelled' || a.status === 'REJECTED'
    ).length,
    totalUsers: users.length,
    todayAppointments: appointments.filter(apt => {
      const today = new Date().toISOString().split('T')[0]
      return apt.createdAt && new Date(apt.createdAt).toISOString().split('T')[0] === today
    }).length
  }

  // Prepare chart data
  const departmentData = appointments.reduce((acc: any[], apt) => {
    const existing = acc.find(item => item.department === apt.department)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({ department: apt.department, count: 1 })
    }
    return acc
  }, []).slice(0, 6)

  const statusData = [
    { name: 'Pending', value: stats.pendingAppointments, color: '#fbbf24' },
    { name: 'Approved', value: stats.approvedAppointments, color: '#10b981' },
    { name: 'Rejected', value: stats.rejectedAppointments, color: '#ef4444' },
  ]

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split('T')[0]
    const count = appointments.filter(apt => 
      apt.createdAt && new Date(apt.createdAt).toISOString().split('T')[0] === dateStr
    ).length
    
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      appointments: count,
      date: dateStr
    }
  })

  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const month = date.toISOString().slice(0, 7) // YYYY-MM format
    
    const count = appointments.filter(apt => 
      apt.createdAt && apt.createdAt.slice(0, 7) === month
    ).length
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      appointments: count,
      users: users.filter(user => 
        user.createdAt && user.createdAt.slice(0, 7) === month
      ).length
    }
  })

  // Show initial loading
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AIIMS Jammu Admin</h1>
                <p className="text-gray-600">Welcome back, {user.firstName} {user.lastName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => window.location.reload()}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="border-blue-200 hover:bg-blue-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Link href="/appointments">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  Manage Appointments
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("user")
                  window.location.href = "/"
                }}
              >
                Logout
              </Button>
              <div className="relative">
                <Bell className="w-6 h-6 text-blue-600" />
                {stats.pendingAppointments > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.pendingAppointments}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Settings },
              { id: 'users', label: 'Users', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50/30'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approvedAppointments}</p>
                    <p className="text-xs text-gray-500 mt-1">Confirmed</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejectedAppointments}</p>
                    <p className="text-xs text-gray-500 mt-1">Cancelled</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">Registered</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weekly Appointments Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Weekly Appointments</h3>
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="appointments" 
                      stroke="#3b82f6" 
                      fill="#dbeafe" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Status Distribution */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
                  <PieChart className="w-5 h-5 text-blue-600" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Department Breakdown */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Department Breakdown</h3>
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="department" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Trend */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">6-Month Trend</h3>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="appointments" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Appointments"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="New Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Appointments - Real-time Updates */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    Real-time updates
                  </div>
                </div>
              </div>
              <div className="p-6">
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No appointments found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.slice(0, 10).map(appointment => {
                      const patientName = appointment.patientName || `${appointment.firstName || ''} ${appointment.lastName || ''}`.trim()
                      return (
                        <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{patientName}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>{appointment.department}</span>
                                <span>•</span>
                                <span>{new Date(appointment.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{appointment.email}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-2">{appointment.status}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Registered Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Registered</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Appointments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(userData => {
                    const displayId = userData.id.length > 8 ? userData.id.slice(-8) : userData.id
                    
                    return (
                      <tr key={userData.id} className="hover:bg-blue-50/50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{userData.firstName} {userData.lastName}</p>
                              <p className="text-sm text-gray-600">#{displayId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-700">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              {userData.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              {userData.phone || 'Not provided'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            userData.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            userData.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {userData.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {new Date(userData.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {appointments.filter(apt => apt.email === userData.email).length} appointments
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
