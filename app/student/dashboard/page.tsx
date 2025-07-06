"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, addDoc, doc, getDoc, orderBy } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Calendar, MessageCircle, User, Clock, BookOpen, Send, Star, Users } from "lucide-react"
import StudentLayout from "@/components/student-layout"

interface Teacher {
  id: string
  name: string
  email: string
  subject: string
  experience: string
  qualification: string
  onLeave: boolean
  availability: any[]
}

interface Appointment {
  id: string
  teacherId: string
  teacherName: string
  date: string
  time: string
  status: string
  subject: string
  message?: string
  createdAt: any
}

export default function StudentDashboard() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [appointmentForm, setAppointmentForm] = useState({
    date: "",
    time: "",
    message: "",
  })
  const [messageForm, setMessageForm] = useState({
    teacherId: "",
    message: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showBooking, setShowBooking] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            if (data.role !== "student" || !data.approved) {
              return
            }
            setUserData(data)
          }
          setUser(user)
          await fetchData(user.uid)
        } catch (error) {
          console.error("Error fetching user data:", error)
          setError("Failed to load user data")
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const fetchData = async (userId: string) => {
    try {
      // Fetch approved teachers
      const teachersQuery = query(
        collection(db, "users"),
        where("role", "==", "teacher"),
        where("approved", "==", true),
      )
      const teachersSnapshot = await getDocs(teachersQuery)
      const teachersData = teachersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Teacher[]
      setTeachers(teachersData)

      // Fetch user's appointments
      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("studentId", "==", userId),
        orderBy("createdAt", "desc"),
      )
      const appointmentsSnapshot = await getDocs(appointmentsQuery)
      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[]
      setAppointments(appointmentsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load dashboard data")
    }
  }

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const bookAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeacher || !user || !userData) return

    setError("")
    setSuccess("")

    try {
      await addDoc(collection(db, "appointments"), {
        studentId: user.uid,
        teacherId: selectedTeacher.id,
        studentName: userData.name,
        teacherName: selectedTeacher.name,
        date: appointmentForm.date,
        time: appointmentForm.time,
        subject: selectedTeacher.subject,
        message: appointmentForm.message,
        status: "pending",
        createdAt: new Date(),
      })

      setSuccess("Appointment request sent successfully!")
      setAppointmentForm({ date: "", time: "", message: "" })
      setShowBooking(false)
      if (user) await fetchData(user.uid)
    } catch (error) {
      console.error("Error booking appointment:", error)
      setError("Failed to book appointment. Please try again.")
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userData) return

    setError("")
    setSuccess("")

    try {
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        receiverId: messageForm.teacherId,
        senderName: userData.name,
        message: messageForm.message,
        timestamp: new Date(),
        read: false,
      })

      setSuccess("Message sent successfully!")
      setMessageForm({ teacherId: "", message: "" })
      setShowMessage(false)
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message. Please try again.")
    }
  }

  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter((a) => a.status === "pending").length,
    confirmedAppointments: appointments.filter((a) => a.status === "confirmed").length,
    availableTeachers: teachers.filter((t) => !t.onLeave).length,
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading your dashboard...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
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

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 animate-fade-in-up">Welcome back, {userData?.name}!</h1>
              <p className="text-indigo-100 animate-fade-in-up animation-delay-200">
                Ready to continue your learning journey? Find teachers and book your next session.
              </p>
            </div>
            <div className="hidden md:block">
              <BookOpen className="h-16 w-16 text-indigo-200 animate-float" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-400">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed Sessions</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.confirmedAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Teachers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.availableTeachers}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Find Teachers Section */}
        <Card className="animate-fade-in-up animation-delay-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Find Teachers
            </CardTitle>
            <CardDescription>Search for qualified teachers by name or subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search teachers by name or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus-ring"
                />
              </div>

              {/* Teachers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeachers.slice(0, 6).map((teacher) => (
                  <Card key={teacher.id} className="hover:shadow-lg transition-all duration-300 card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">{teacher.name.charAt(0)}</span>
                        </div>
                        {teacher.onLeave ? (
                          <Badge variant="secondary">On Leave</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Available</Badge>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <h3 className="font-semibold text-lg">{teacher.name}</h3>
                        <p className="text-indigo-600 font-medium">{teacher.subject}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {teacher.experience} years • {teacher.qualification}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Dialog
                          open={showBooking && selectedTeacher?.id === teacher.id}
                          onOpenChange={(open) => {
                            setShowBooking(open)
                            if (open) setSelectedTeacher(teacher)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                              disabled={teacher.onLeave}
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              Book
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Book Appointment</DialogTitle>
                              <DialogDescription>
                                Schedule a session with {teacher.name} for {teacher.subject}
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={bookAppointment} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="date">Preferred Date</Label>
                                <Input
                                  id="date"
                                  type="date"
                                  value={appointmentForm.date}
                                  onChange={(e) =>
                                    setAppointmentForm({
                                      ...appointmentForm,
                                      date: e.target.value,
                                    })
                                  }
                                  min={new Date().toISOString().split("T")[0]}
                                  className="focus-ring"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="time">Preferred Time</Label>
                                <Input
                                  id="time"
                                  type="time"
                                  value={appointmentForm.time}
                                  onChange={(e) =>
                                    setAppointmentForm({
                                      ...appointmentForm,
                                      time: e.target.value,
                                    })
                                  }
                                  className="focus-ring"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="message">Message (Optional)</Label>
                                <Textarea
                                  id="message"
                                  placeholder="Any specific topics or questions you'd like to discuss..."
                                  value={appointmentForm.message}
                                  onChange={(e) =>
                                    setAppointmentForm({
                                      ...appointmentForm,
                                      message: e.target.value,
                                    })
                                  }
                                  className="focus-ring"
                                  rows={3}
                                />
                              </div>
                              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                                Send Request
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={showMessage && messageForm.teacherId === teacher.id}
                          onOpenChange={(open) => {
                            setShowMessage(open)
                            if (open) setMessageForm({ ...messageForm, teacherId: teacher.id })
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Send Message</DialogTitle>
                              <DialogDescription>Send a message to {teacher.name}</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={sendMessage} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="messageText">Message</Label>
                                <Textarea
                                  id="messageText"
                                  placeholder="Type your message here..."
                                  value={messageForm.message}
                                  onChange={(e) =>
                                    setMessageForm({
                                      ...messageForm,
                                      message: e.target.value,
                                    })
                                  }
                                  className="focus-ring"
                                  rows={4}
                                  required
                                />
                              </div>
                              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                                <Send className="h-4 w-4 mr-2" />
                                Send Message
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTeachers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or check back later.</p>
                </div>
              )}

              {filteredTeachers.length > 6 && (
                <div className="text-center">
                  <Button variant="outline" className="mt-4 bg-transparent">
                    View All Teachers ({filteredTeachers.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card className="animate-fade-in-up animation-delay-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              My Appointments
            </CardTitle>
            <CardDescription>Track your scheduled and past appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                  <p className="text-gray-600">Book your first session with a teacher to get started!</p>
                </div>
              ) : (
                appointments.slice(0, 5).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{appointment.teacherName.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{appointment.teacherName}</h3>
                        <p className="text-sm text-gray-600">{appointment.subject}</p>
                        <p className="text-sm text-gray-600">
                          {appointment.date} at {appointment.time}
                        </p>
                        {appointment.message && (
                          <p className="text-xs text-gray-500 mt-1 italic">"{appointment.message}"</p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        appointment.status === "confirmed"
                          ? "default"
                          : appointment.status === "pending"
                            ? "secondary"
                            : appointment.status === "cancelled"
                              ? "destructive"
                              : "outline"
                      }
                      className="capitalize"
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                ))
              )}

              {appointments.length > 5 && (
                <div className="text-center pt-4 border-t">
                  <Button variant="outline">View All Appointments ({appointments.length})</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  )
}
