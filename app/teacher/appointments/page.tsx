"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, CheckCircle, XCircle, User, MessageCircle, Search } from "lucide-react"
import TeacherLayout from "@/components/teacher-layout"

interface Appointment {
  id: string
  studentId: string
  studentName: string
  date: string
  time: string
  status: string
  subject: string
  message?: string
  createdAt: any
}

export default function TeacherAppointmentsPage() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        fetchAppointments(user.uid)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [searchTerm, statusFilter, appointments])

  const fetchAppointments = async (userId: string) => {
    try {
      const appointmentsQuery = query(collection(db, "appointments"), where("teacherId", "==", userId))
      const appointmentsSnapshot = await getDocs(appointmentsQuery)
      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[]

      // Sort by date and time
      appointmentsData.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`)
        const dateB = new Date(`${b.date} ${b.time}`)
        return dateB.getTime() - dateA.getTime()
      })

      setAppointments(appointmentsData)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (searchTerm) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter)
    }

    setFilteredAppointments(filtered)
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: status,
      })
      setSuccess(`Appointment ${status} successfully!`)
      if (user) fetchAppointments(user.uid)
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

  const isUpcoming = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date} ${time}`)
    return appointmentDateTime > new Date()
  }

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  }

  if (loading) {
    return (
      <TeacherLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading your appointments...</p>
          </div>
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2 animate-fade-in-up">Appointment Management</h1>
          <p className="text-green-100 animate-fade-in-up animation-delay-200">
            Manage your teaching sessions and student appointments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total", count: stats.total, color: "from-blue-500 to-blue-600", icon: Calendar },
            { label: "Pending", count: stats.pending, color: "from-yellow-500 to-yellow-600", icon: Clock },
            { label: "Confirmed", count: stats.confirmed, color: "from-green-500 to-green-600", icon: CheckCircle },
            { label: "Completed", count: stats.completed, color: "from-purple-500 to-purple-600", icon: User },
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
                  <stat.icon className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-400">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by student name or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "pending", label: "Pending" },
                  { key: "confirmed", label: "Confirmed" },
                  { key: "completed", label: "Completed" },
                  { key: "cancelled", label: "Cancelled" },
                ].map((tab) => (
                  <Button
                    key={tab.key}
                    variant={statusFilter === tab.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(tab.key)}
                    className={`transition-all duration-200 ${
                      statusFilter === tab.key
                        ? "bg-green-600 text-white transform scale-105"
                        : "hover:bg-green-50 hover:text-green-600"
                    }`}
                  >
                    {tab.label}
                  </Button>
                ))}
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
                <p className="text-gray-500">
                  {statusFilter === "all"
                    ? "No students have booked appointments yet."
                    : `No ${statusFilter} appointments found.`}
                </p>
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
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{appointment.studentName.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-green-600 transition-colors duration-200">
                          {appointment.studentName}
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
                            Decline
                          </Button>
                        </div>
                      )}

                      {appointment.status === "confirmed" && isUpcoming(appointment.date, appointment.time) && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                            className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                          >
                            Mark Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                            className="text-red-600 border-red-200 hover:bg-red-50 transition-all duration-200"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}

                      {appointment.status === "confirmed" && isUpcoming(appointment.date, appointment.time) && (
                        <Badge className="bg-green-100 text-green-800 animate-pulse">Upcoming</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </TeacherLayout>
  )
}
