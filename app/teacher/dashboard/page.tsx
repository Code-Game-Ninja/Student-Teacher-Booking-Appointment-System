"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, MessageCircle, CheckCircle, XCircle, Settings } from "lucide-react"
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

interface Message {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: any
  read: boolean
}

interface Availability {
  day: string
  startTime: string
  endTime: string
  available: boolean
}

export default function TeacherDashboard() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [availability, setAvailability] = useState<Availability[]>([
    { day: "Monday", startTime: "09:00", endTime: "17:00", available: true },
    { day: "Tuesday", startTime: "09:00", endTime: "17:00", available: true },
    { day: "Wednesday", startTime: "09:00", endTime: "17:00", available: true },
    { day: "Thursday", startTime: "09:00", endTime: "17:00", available: true },
    { day: "Friday", startTime: "09:00", endTime: "17:00", available: true },
    { day: "Saturday", startTime: "09:00", endTime: "17:00", available: false },
    { day: "Sunday", startTime: "09:00", endTime: "17:00", available: false },
  ])
  const [onLeave, setOnLeave] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showAvailability, setShowAvailability] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          if (data.role !== "teacher") {
            return
          }
          setUserData(data)
          setOnLeave(data.onLeave || false)
          if (data.availability) {
            setAvailability(data.availability)
          }
        }
        setUser(user)
        fetchData(user.uid)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const fetchData = async (userId: string) => {
    try {
      // Fetch appointments
      const appointmentsQuery = query(collection(db, "appointments"), where("teacherId", "==", userId))
      const appointmentsSnapshot = await getDocs(appointmentsQuery)
      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[]
      setAppointments(appointmentsData)

      // Fetch messages
      const messagesQuery = query(collection(db, "messages"), where("receiverId", "==", userId))
      const messagesSnapshot = await getDocs(messagesQuery)
      const messagesData = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]
      setMessages(messagesData)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: status,
      })
      setSuccess(`Appointment ${status} successfully!`)
      if (user) fetchData(user.uid)
    } catch (error) {
      setError("Error updating appointment")
    }
  }

  const updateAvailability = async () => {
    if (!user) return

    try {
      await updateDoc(doc(db, "users", user.uid), {
        availability: availability,
      })
      setSuccess("Availability updated successfully!")
      setShowAvailability(false)
    } catch (error) {
      setError("Error updating availability")
    }
  }

  const toggleLeaveStatus = async () => {
    if (!user) return

    try {
      const newStatus = !onLeave
      await updateDoc(doc(db, "users", user.uid), {
        onLeave: newStatus,
      })
      setOnLeave(newStatus)
      setSuccess(`Leave status ${newStatus ? "enabled" : "disabled"} successfully!`)
    } catch (error) {
      setError("Error updating leave status")
    }
  }

  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter((a) => a.status === "pending").length,
    confirmedAppointments: appointments.filter((a) => a.status === "confirmed").length,
    unreadMessages: messages.filter((m) => !m.read).length,
  }

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome, {userData?.name}!</h1>
              <p className="text-green-100">Manage your teaching schedule and connect with students.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-green-100">Leave Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Switch checked={onLeave} onCheckedChange={toggleLeaveStatus} />
                  <span className="text-sm font-medium">{onLeave ? "On Leave" : "Available"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Appointments</p>
                  <p className="text-3xl font-bold">{stats.totalAppointments}</p>
                </div>
                <Calendar className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Pending Requests</p>
                  <p className="text-3xl font-bold">{stats.pendingAppointments}</p>
                </div>
                <Clock className="h-12 w-12 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Confirmed Sessions</p>
                  <p className="text-3xl font-bold">{stats.confirmedAppointments}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Unread Messages</p>
                  <p className="text-3xl font-bold">{stats.unreadMessages}</p>
                </div>
                <MessageCircle className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Availability Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Availability Settings
                </CardTitle>
                <CardDescription>Set your weekly availability for appointments</CardDescription>
              </div>
              <Dialog open={showAvailability} onOpenChange={setShowAvailability}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Update Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Update Your Availability</DialogTitle>
                    <DialogDescription>Set your available days and hours for student appointments</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {availability.map((day, index) => (
                      <div key={day.day} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-20">
                          <Label className="font-medium">{day.day}</Label>
                        </div>
                        <Switch
                          checked={day.available}
                          onCheckedChange={(checked) => {
                            const newAvailability = [...availability]
                            newAvailability[index].available = checked
                            setAvailability(newAvailability)
                          }}
                        />
                        {day.available && (
                          <>
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm">From:</Label>
                              <Input
                                type="time"
                                value={day.startTime}
                                onChange={(e) => {
                                  const newAvailability = [...availability]
                                  newAvailability[index].startTime = e.target.value
                                  setAvailability(newAvailability)
                                }}
                                className="w-32"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm">To:</Label>
                              <Input
                                type="time"
                                value={day.endTime}
                                onChange={(e) => {
                                  const newAvailability = [...availability]
                                  newAvailability[index].endTime = e.target.value
                                  setAvailability(newAvailability)
                                }}
                                className="w-32"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <Button onClick={updateAvailability} className="w-full">
                      Save Availability
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availability.map((day) => (
                <div key={day.day} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{day.day}</span>
                    <Badge variant={day.available ? "default" : "secondary"}>
                      {day.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  {day.available && (
                    <p className="text-sm text-gray-600">
                      {day.startTime} - {day.endTime}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Appointments */}
        {appointments.filter((a) => a.status === "pending").length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Pending Appointment Requests
              </CardTitle>
              <CardDescription>Review and respond to student appointment requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments
                  .filter((a) => a.status === "pending")
                  .map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{appointment.studentName}</h3>
                        <p className="text-sm text-gray-600">{appointment.subject}</p>
                        <p className="text-sm text-gray-600">
                          {appointment.date} at {appointment.time}
                        </p>
                        {appointment.message && (
                          <p className="text-xs text-gray-500 mt-1">Message: {appointment.message}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                          size="sm"
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              All Appointments
            </CardTitle>
            <CardDescription>View your appointment history and upcoming sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No appointments yet. Students will book sessions with you!</p>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{appointment.studentName}</h3>
                      <p className="text-sm text-gray-600">{appointment.subject}</p>
                      <p className="text-sm text-gray-600">
                        {appointment.date} at {appointment.time}
                      </p>
                      {appointment.message && (
                        <p className="text-xs text-gray-500 mt-1">Message: {appointment.message}</p>
                      )}
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
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        {messages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Recent Messages
              </CardTitle>
              <CardDescription>Messages from your students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.slice(0, 5).map((message) => (
                  <div key={message.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{message.senderName}</h3>
                      <div className="flex items-center space-x-2">
                        {!message.read && <Badge variant="secondary">New</Badge>}
                        <span className="text-xs text-gray-500">
                          {message.timestamp?.toDate?.()?.toLocaleDateString() || "Recent"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{message.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TeacherLayout>
  )
}
