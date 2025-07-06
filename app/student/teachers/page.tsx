"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, addDoc, doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Search, Calendar, MessageCircle, Star, BookOpen, Send, Award } from "lucide-react"
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
  bio?: string
}

export default function StudentTeachersPage() {
  const [user, setUser] = useState(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
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
        setUser(user)
        fetchTeachers()
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    filterTeachers()
  }, [searchTerm, subjectFilter, teachers])

  const fetchTeachers = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching teachers:", error)
    }
  }

  const filterTeachers = () => {
    let filtered = teachers

    if (searchTerm) {
      filtered = filtered.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.qualification.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (subjectFilter !== "all") {
      filtered = filtered.filter((teacher) => teacher.subject.toLowerCase().includes(subjectFilter.toLowerCase()))
    }

    setFilteredTeachers(filtered)
  }

  const bookAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeacher || !user) return

    setError("")
    setSuccess("")

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      const userData = userDoc.data()

      await addDoc(collection(db, "appointments"), {
        studentId: user.uid,
        teacherId: selectedTeacher.id,
        studentName: userData?.name || "Student",
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
    } catch (error) {
      setError("Error booking appointment")
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setSuccess("")

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      const userData = userDoc.data()

      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        receiverId: messageForm.teacherId,
        senderName: userData?.name || "Student",
        message: messageForm.message,
        timestamp: new Date(),
        read: false,
      })

      setSuccess("Message sent successfully!")
      setMessageForm({ teacherId: "", message: "" })
      setShowMessage(false)
    } catch (error) {
      setError("Error sending message")
    }
  }

  const subjects = [...new Set(teachers.map((t) => t.subject))]

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Finding amazing teachers for you...</p>
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

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2 animate-fade-in-up">Find Your Perfect Teacher</h1>
          <p className="text-indigo-100 animate-fade-in-up animation-delay-200">
            Browse through our qualified teachers and book your learning sessions
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-300">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search teachers by name, subject, or qualification..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.length === 0 ? (
            <div className="col-span-full text-center py-12 animate-fade-in-up">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Teachers Found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredTeachers.map((teacher, index) => (
              <Card
                key={teacher.id}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-2xl">{teacher.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-bold text-xl mb-1 group-hover:text-indigo-600 transition-colors duration-200">
                      {teacher.name}
                    </h3>
                    <Badge className="mb-2 bg-indigo-100 text-indigo-800">{teacher.subject}</Badge>
                    {teacher.onLeave && (
                      <Badge variant="secondary" className="ml-2">
                        On Leave
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="h-4 w-4 mr-2 text-indigo-500" />
                      {teacher.qualification}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                      {teacher.experience} years experience
                    </div>
                    {teacher.bio && <p className="text-sm text-gray-600 line-clamp-3">{teacher.bio}</p>}
                  </div>

                  <div className="flex space-x-2">
                    <Dialog open={showBooking} onOpenChange={setShowBooking}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                          disabled={teacher.onLeave}
                          onClick={() => setSelectedTeacher(teacher)}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Book Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Book Appointment</DialogTitle>
                          <DialogDescription>
                            Schedule a learning session with {selectedTeacher?.name}
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
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Send Request
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showMessage} onOpenChange={setShowMessage}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 bg-transparent"
                          onClick={() =>
                            setMessageForm({
                              ...messageForm,
                              teacherId: teacher.id,
                            })
                          }
                        >
                          <MessageCircle className="h-4 w-4" />
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
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  )
}
