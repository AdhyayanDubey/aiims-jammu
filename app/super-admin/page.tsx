"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import { 
  Shield, 
  LogOut, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  ArrowUp,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Activity,
  TrendingUp,
  Users,
  AlertCircle
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
  superAdminStatus?: string
  superAdminFeedback?: string
  forwardedToSuperAdmin?: boolean
  createdAt: string
  updatedAt: string
}

export default function SuperAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
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
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setLoading(false);
      router.replace("/");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "SUPER_ADMIN") {
      setLoading(false);
      router.replace("/");
      return;
    }
    setUser(parsed);
    setLoading(false);
  }, [router]);

  const fetchForwardedAppointments = () => {
    setRefreshing(true)
    fetch("/api/appointments/forwarded")
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data.appointments || []);
      })
      .catch((error) => {
        console.error('Error fetching forwarded appointments:', error);
        toast.error('Failed to fetch appointments');
      })
      .finally(() => setRefreshing(false))
  }

  useEffect(() => {
    if (user) {
      fetchForwardedAppointments()
      const interval = setInterval(fetchForwardedAppointments, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const showFeedbackForm = (appointmentId: string, action: 'approve' | 'reject' | 'comment') => {
    setShowFeedbackModal({show: true, appointmentId, action});
  };

  const submitSuperAdminAction = async () => {
    if (!showFeedbackModal.appointmentId) return;
    
    setActionLoading(showFeedbackModal.appointmentId);
    
    try {
      const response = await fetch(`/api/appointments/${showFeedbackModal.appointmentId}/superadmin-action`, {
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
        fetchForwardedAppointments();
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

  const handleSignOut = () => {
    localStorage.removeItem("user")
    router.replace("/")
  }

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = appointment.patientName || ''
    return searchTerm === "" || 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Calculate stats
  const stats = {
    totalForwarded: appointments.length,
    pending: appointments.filter(a => a.superAdminStatus === "PENDING").length,
    approved: appointments.filter(a => a.superAdminStatus === "APPROVED").length,
    rejected: appointments.filter(a => a.superAdminStatus === "REJECTED").length,
    commented: appointments.filter(a => a.superAdminStatus === "COMMENTED").length,
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Super Admin Dashboard...</p>
      </div>
    </div>
  );
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <motion.header
        className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/aiims-logo.png"
                alt="AIIMS Jammu Logo"
                width={44}
                height={44}
                className="rounded-full border border-purple-200"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold text-purple-800">AIIMS Jammu</span>
                <span className="text-xs text-gray-600 font-medium">Super Admin Dashboard</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchForwardedAppointments}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="border-purple-200 hover:bg-purple-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <div className="flex items-center space-x-2 bg-purple-100 rounded-lg px-3 py-1">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">{user.firstName} {user.lastName}</span>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-red-200 hover:bg-red-50 text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
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
            <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4 mr-2" />
              Super Admin Panel
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Forwarded Appointments</h2>
            <p className="text-lg text-gray-600">
              Review and take action on appointments forwarded by administrators
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Forwarded</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalForwarded}</p>
                  <p className="text-xs text-gray-500 mt-1">From admins</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <ArrowUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
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
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                  <p className="text-xs text-gray-500 mt-1">By Super Admin</p>
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
                  <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                  <p className="text-xs text-gray-500 mt-1">By Super Admin</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commented</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.commented}</p>
                  <p className="text-xs text-gray-500 mt-1">Sent back</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-80 bg-white/50 backdrop-blur-sm"
                />
              </div>
              <div className="text-sm text-gray-600 bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                <strong>{filteredAppointments.length}</strong> appointments to review
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <Card className="overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="text-xl text-gray-900 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-purple-600" />
                Forwarded Appointments
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No forwarded appointments</p>
                  <p className="text-gray-500 text-sm">All appointments have been processed</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No appointments match your search</p>
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAppointments.map((appointment) => {
                        const appointmentDate = appointment.date
                        const appointmentTime = appointment.time
                        const symptoms = appointment.symptoms

                        return (
                          <tr key={appointment.id} className="hover:bg-purple-50/50 transition-colors">
                            {/* ID */}
                            <td className="px-4 py-4">
                              <div className="font-medium text-gray-900">#{appointment.id.slice(-8)}</div>
                            </td>

                            {/* Patient */}
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <User className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{appointment.patientName}</div>
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
                                appointment.superAdminStatus === "APPROVED"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : appointment.superAdminStatus === "REJECTED"
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : appointment.superAdminStatus === "COMMENTED"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              }`}>
                                {appointment.superAdminStatus === "PENDING" ? "AWAITING REVIEW" : appointment.superAdminStatus}
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
                                {appointment.superAdminStatus === "PENDING" ? (
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
                                    
                                    {/* Comment Button */}
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-8 w-full flex items-center justify-center transition-all duration-200 shadow-md"
                                      disabled={actionLoading === appointment.id}
                                      onClick={() => showFeedbackForm(appointment.id, 'comment')}
                                    >
                                      <MessageSquare className="w-3 h-3 mr-1" />
                                      Send Comment
                                    </Button>
                                  </>
                                ) : (
                                  <span className={`px-2 py-1 rounded text-xs text-center ${
                                    appointment.superAdminStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    appointment.superAdminStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                    appointment.superAdminStatus === 'COMMENTED' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {appointment.superAdminStatus === 'APPROVED' ? 'Approved' :
                                     appointment.superAdminStatus === 'REJECTED' ? 'Rejected' :
                                     appointment.superAdminStatus === 'COMMENTED' ? 'Commented' :
                                     'Processed'}
                                  </span>
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
                {showFeedbackModal.action === 'approve' ? '✅ Approve Appointment' : 
                 showFeedbackModal.action === 'reject' ? '❌ Reject Appointment' :
                 '💬 Add Comment'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {showFeedbackModal.action === 'approve' 
                  ? 'Add an optional message (appointment will be automatically approved):' 
                  : showFeedbackModal.action === 'reject'
                  ? 'Please provide a reason for rejection:'
                  : 'Add your comment/feedback for the admin:'}
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={showFeedbackModal.action === 'approve' 
                  ? 'e.g., Approved. Please ensure patient arrives 15 minutes early.' 
                  : showFeedbackModal.action === 'reject'
                  ? 'e.g., Patient needs additional documentation before approval.'
                  : 'e.g., Please verify patient insurance details before proceeding.'}
                className="w-full p-4 border border-gray-300 rounded-xl resize-none h-28 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                required={showFeedbackModal.action === 'reject'}
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
                  onClick={submitSuperAdminAction}
                  disabled={actionLoading !== null || (showFeedbackModal.action === 'reject' && !feedback.trim())}
                  className={`text-white font-medium ${
                    showFeedbackModal.action === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : showFeedbackModal.action === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } ${actionLoading !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {actionLoading !== null ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {showFeedbackModal.action === 'approve' ? <CheckCircle className="w-4 h-4 mr-2" /> : 
                       showFeedbackModal.action === 'reject' ? <XCircle className="w-4 h-4 mr-2" /> :
                       <MessageSquare className="w-4 h-4 mr-2" />}
                      {showFeedbackModal.action === 'approve' ? 'Approve' : 
                       showFeedbackModal.action === 'reject' ? 'Reject' : 'Send Comment'}
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
