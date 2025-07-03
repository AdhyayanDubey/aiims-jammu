"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  ArrowUp,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"

interface Appointment {
  id: string
  firstName?: string
  lastName?: string
  first_name?: string
  last_name?: string
  patientName?: string
  email: string
  phone: string
  department: string
  doctor?: string
  date?: string
  time?: string
  preferredDate?: string
  preferred_date?: string
  preferredTime?: string
  preferred_time?: string
  status: string
  notes?: string
  symptoms?: string
  priority?: string
  createdAt?: string
  created_at?: string
  forwardedToSuperAdmin?: boolean
  forwarded_to_super_admin?: boolean
  superAdminStatus?: string
  super_admin_status?: string
  superAdminFeedback?: string
  super_admin_feedback?: string
  feedback?: string
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showFeedbackModal, setShowFeedbackModal] = useState<{
    show: boolean, 
    appointmentId: string | null, 
    action: string
  }>({
    show: false,
    appointmentId: null,
    action: ''
  });
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setLoading(false);
      router.replace("/");
      return;
    }
    setUser(JSON.parse(stored));
    setLoading(false);
  }, [router]);

  const fetchAppointments = () => {
    setRefreshing(true)
    fetch("/api/appointments")
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data.appointments || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching appointments:', error);
        setLoading(false);
      })
      .finally(() => setRefreshing(false))
  }

  useEffect(() => {
    fetchAppointments()
    const interval = setInterval(fetchAppointments, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleForwardToSuperAdmin = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/appointments/${id}/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forward" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Appointment forwarded to Super Admin");
        fetchAppointments();
      } else {
        toast.error(data.error || "Failed to forward appointment");
      }
    } catch (err) {
      toast.error("Failed to forward appointment");
    }
    setActionLoading(null);
  }

  const showFeedbackForm = (appointmentId: string, action: 'approve' | 'reject') => {
    setShowFeedbackModal({show: true, appointmentId, action});
  };

  const submitAdminActionWithFeedback = async () => {
    if (!showFeedbackModal.appointmentId) return;
    
    setActionLoading(showFeedbackModal.appointmentId);
    
    try {
      const response = await fetch(`/api/appointments/${showFeedbackModal.appointmentId}/admin-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: showFeedbackModal.action,
          feedback: feedback || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Appointment ${showFeedbackModal.action}d successfully!`);
        setShowFeedbackModal({show: false, appointmentId: null, action: ''});
        setFeedback('');
        fetchAppointments();
      } else {
        const errorData = await response.json();
        toast.error('Failed to update appointment: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while processing the request');
    }
    
    setActionLoading(null);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = appointment.patientName || `${appointment.firstName || ''} ${appointment.lastName || ''}`.trim()
    const matchesSearch = searchTerm === "" || 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "ALL" || appointment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading appointments...</p>
      </div>
    </div>
  );
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.header
        className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-3">
              <Image
                src="/images/aiims-logo.png"
                alt="AIIMS Jammu Logo"
                width={44}
                height={44}
                className="rounded-full border border-blue-200"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold text-blue-800">AIIMS Jammu</span>
                <span className="text-xs text-gray-600 font-medium">Appointments Management</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchAppointments}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="border-blue-200 hover:bg-blue-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
                Back to Admin
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              Appointment Management
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">All Appointments</h2>
            <p className="text-lg text-gray-600">
              Manage and review all appointments from patients
            </p>
          </motion.div>

          {/* Search and Filter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80 bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-11 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                <strong>{filteredAppointments.length}</strong> appointments
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <Card className="overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-xl text-gray-900 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                Appointments Overview
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No appointments found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Patient</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Contact</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Department</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Schedule</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Priority</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Super Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAppointments.map((appointment: any) => {
                        const patientName = appointment.patientName || `${appointment.firstName || ''} ${appointment.lastName || ''}`.trim()
                        const appointmentDate = appointment.date || appointment.preferredDate
                        const appointmentTime = appointment.time || appointment.preferredTime
                        const symptoms = appointment.symptoms || appointment.message
                        const superAdminStatus = appointment.superAdminStatus || "PENDING"
                        const superAdminFeedback = appointment.superAdminFeedback || appointment.notes
                        const isForwarded = appointment.forwardedToSuperAdmin || false

                        return (
                          <tr key={appointment.id} className="hover:bg-blue-50/50 transition-colors">
                            {/* ID */}
                            <td className="px-4 py-4">
                              <div className="font-medium text-gray-900">#{appointment.id}</div>
                            </td>

                            {/* Patient */}
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{patientName}</div>
                                  <div className="text-xs text-gray-500">Patient</div>
                                </div>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="w-3 h-3 mr-1" />
                                  <span className="truncate max-w-[150px]" title={appointment.email}>
                                    {appointment.email}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {appointment.phone}
                                </div>
                              </div>
                            </td>

                            {/* Department */}
                            <td className="px-4 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{appointment.department}</div>
                                <div className="text-sm text-gray-600">{appointment.doctor || 'To be assigned'}</div>
                              </div>
                            </td>

                            {/* Schedule */}
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-700">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {appointmentDate ? new Date(appointmentDate).toLocaleDateString() : "-"}
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {appointmentTime || "-"}
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                appointment.status === "CONFIRMED" || appointment.status === "confirmed"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : appointment.status === "CANCELLED" || appointment.status === "cancelled"
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : appointment.status === "PENDING" || appointment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}>
                                {appointment.status?.toUpperCase()}
                              </span>
                            </td>

                            {/* Priority */}
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                appointment.priority === "HIGH" ? "bg-red-100 text-red-800 border border-red-200" :
                                appointment.priority === "URGENT" ? "bg-red-200 text-red-900 border border-red-300" :
                                appointment.priority === "LOW" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                                "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}>
                                {appointment.priority || "NORMAL"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-2 min-w-[160px]">
                                {["APPROVED", "REJECTED"].includes(superAdminStatus) ? (
                                  <span className="text-xs text-gray-500 italic text-center py-2">
                                    No further actions
                                  </span>
                                ) : !isForwarded && (appointment.status === "pending" || appointment.status === "PENDING") ? (
                                  <>
                                    {/* Approve Button */}
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs h-8 w-full flex items-center justify-center transition-all duration-200 shadow-md"
                                      disabled={actionLoading === appointment.id}
                                      onClick={() => showFeedbackForm(appointment.id, 'approve')}
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      {actionLoading === appointment.id ? "Processing..." : "Approve"}
                                    </Button>
                                    
                                    {/* Reject Button */}
                                    <Button
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs h-8 w-full flex items-center justify-center transition-all duration-200 shadow-md"
                                      disabled={actionLoading === appointment.id}
                                      onClick={() => showFeedbackForm(appointment.id, 'reject')}
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      {actionLoading === appointment.id ? "Processing..." : "Reject"}
                                    </Button>
                                    
                                    {/* Forward to Super Admin Button */}
                                    <Button
                                      size="sm"
                                      className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs h-8 w-full flex items-center justify-center transition-all duration-200 shadow-md"
                                      disabled={actionLoading === appointment.id}
                                      onClick={() => handleForwardToSuperAdmin(appointment.id)}
                                    >
                                      <ArrowUp className="w-3 h-3 mr-1" />
                                      Forward to Super Admin
                                    </Button>
                                  </>
                                ) : superAdminStatus === "COMMENTED" && (appointment.status === "pending" || appointment.status === "PENDING") ? (
                                  <>
                                    {/* Approve Button */}
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs h-8 w-full flex items-center justify-center transition-all duration-200 shadow-md"
                                      disabled={actionLoading === appointment.id}
                                      onClick={() => showFeedbackForm(appointment.id, 'approve')}
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      {actionLoading === appointment.id ? "Processing..." : "Approve"}
                                    </Button>
                                    
                                    {/* Reject Button */}
                                    <Button
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs h-8 w-full flex items-center justify-center transition-all duration-200 shadow-md"
                                      disabled={actionLoading === appointment.id}
                                      onClick={() => showFeedbackForm(appointment.id, 'reject')}
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      {actionLoading === appointment.id ? "Processing..." : "Reject"}
                                    </Button>
                                  </>
                                ) : (
                                  <span className={`px-2 py-1 rounded text-xs text-center ${
                                    appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                    appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    isForwarded ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {appointment.status === 'CONFIRMED' ? 'Approved' :
                                     appointment.status === 'CANCELLED' ? 'Rejected' :
                                     isForwarded ? 'Forwarded' : 'Processed'}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Super Admin Status */}
                            <td className="px-4 py-4">
                              <div className="space-y-2">
                                {superAdminStatus === "PENDING" && isForwarded && (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                    Awaiting Super Admin
                                  </span>
                                )}
                                {superAdminStatus === "APPROVED" && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    Super Admin Approved
                                  </span>
                                )}
                                {superAdminStatus === "REJECTED" && (
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                    Super Admin Rejected
                                  </span>
                                )}
                                {superAdminStatus === "COMMENTED" && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    Commented - Action Needed
                                  </span>
                                )}
                                {/* Only show super admin feedback, not regular admin notes */}
                                {superAdminFeedback && isForwarded && (
                                  <div className="text-xs text-gray-700 mt-1 p-2 bg-gray-50 rounded max-w-[200px]">
                                    <strong>Super Admin Comment:</strong><br/>
                                    <span className="text-gray-600">{superAdminFeedback}</span>
                                  </div>
                                )}
                                {!isForwarded && (
                                  <span className="text-xs text-gray-400 italic">-</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feedback Modal */}
      {showFeedbackModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                {showFeedbackModal.action === 'approve' ? '✅ Approve' : '❌ Reject'} Appointment
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {showFeedbackModal.action === 'approve' 
                  ? 'Add an optional message for the patient:' 
                  : 'Please provide a reason for rejection:'}
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={showFeedbackModal.action === 'approve' 
                  ? 'e.g., Please arrive 15 minutes early. Bring your medical records.' 
                  : 'e.g., Requested time slot not available. Please choose another time.'}
                className="w-full p-4 border border-gray-300 rounded-xl resize-none h-28 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFeedbackModal({show: false, appointmentId: null, action: ''});
                    setFeedback('');
                  }}
                  disabled={actionLoading !== null}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitAdminActionWithFeedback}
                  disabled={actionLoading !== null}
                  className={`text-white font-medium ${
                    showFeedbackModal.action === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } ${actionLoading !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {actionLoading !== null ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {showFeedbackModal.action === 'approve' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                      {showFeedbackModal.action === 'approve' ? 'Approve' : 'Reject'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}