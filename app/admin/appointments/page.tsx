"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Search, User, MessageCircle, CheckCircle, XCircle } from "lucide-react"
import AdminLayout from "@/components/admin-layout"

interface Appointment {
  id: string
  studentId: string
  teacherId: string
  studentName: string
  teacherName: string
  date: string
  time: string
  status: string
  subject: string
  message?: string
  createdAt: any
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [searchTerm, statusFilter, dateFilter, appointments])

  const fetchAppointments = async () => {
    try {
      const appointmentsQuery = query(collection(db, "appointments"))
      const appointmentsSnapshot = await getDocs(appointmentsQuery)
      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[]

      // Sort by creation date
      appointmentsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt)
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })

      setAppointments(appointmentsData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (searchTerm) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter)
    }

    if (dateFilter !== "all") {
      const today = new Date()
      const appointmentDate = new Date()

      if (dateFilter === "today") {
        filtered = filtered.filter((appointment) => {
          const appDate = new Date(appointment.date)
          return appDate.toDateString() === today.toDateString()
        })
      } else if (dateFilter === "upcoming") {
        filtered = filtered.filter((appointment) => {
          const appDate = new Date(`${appointment.date} ${appointment.time}`)
          return appDate > today
        })
      } else if (dateFilter === "past") {
        filtered = filtered.filter((appointment) => {
          const appDate = new Date(`${appointment.date} ${appointment.time}`)
          return appDate < today
        })
      }
    }

    setFilteredAppointments(filtered)
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: status,
      })
      setSuccess(`Appointment ${status} successfully!`)
      fetchAppointments()
    } catch (error) {
      setError("Error updating appointment")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "cancelled":
        return <XCircle className="h-3 w-3" />
      case "completed":
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading appointments...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in-up">
        {error && (
          <Alert className="border-red-200 bg-red-50 animate-slide-down">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 animate-slide-down">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2 animate-fade-in-up">Appointment Management</h1>
          <p className="text-purple-100 animate-fade-in-up animation-delay-200">
            Monitor and manage all appointments across the platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: "Total", count: stats.total, color: "from-blue-500 to-blue-600", icon: Calendar },
            { label: "Pending", count: stats.pending, color: "from-yellow-500 to-yellow-600", icon: Clock },
            { label: "Confirmed", count: stats.confirmed, color: "from-green-500 to-green-600", icon: CheckCircle },
            { label: "Completed", count: stats.completed, color: "from-purple-500 to-purple-600", icon: User },
            { label: "Cancelled", count: stats.cancelled, color: "from-red-500 to-red-600", icon: XCircle },
          ].map((stat, index) => (
            <Card
              key={stat.label}
              className={`bg-gradient-to-r ${stat.color} text-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.count}</p>
                  </div>
                  <stat.icon className="h-6 w-6 opacity-80" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-300">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by student, teacher, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="text-center py-12 animate-fade-in-up">
              <CardContent>
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Found</h3>
                <p className="text-gray-500">No appointments match your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment, index) => (
              <Card
                key={appointment.id}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-purple-600 transition-colors duration-200">
                          {appointment.studentName} → {appointment.teacherName}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.subject}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                        {appointment.message && (
                          <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                            <MessageCircle className="h-3 w-3 inline mr-1" />
                            {appointment.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>

                      {appointment.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                            className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                            className="text-red-600 border-red-200 hover:bg-red-50 transition-all duration-200"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}

                      {appointment.status === "confirmed" && (
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                          className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
