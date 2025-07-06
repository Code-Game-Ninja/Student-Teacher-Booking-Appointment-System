"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, Clock, Search, Reply } from "lucide-react"
import TeacherLayout from "@/components/teacher-layout"

interface Message {
  id: string
  senderId: string
  receiverId: string
  senderName: string
  message: string
  timestamp: any
  read: boolean
}

interface Student {
  id: string
  name: string
}

export default function TeacherMessagesPage() {
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        fetchMessages(user.uid)
        fetchStudents()
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const fetchMessages = async (userId: string) => {
    try {
      const messagesQuery = query(collection(db, "messages"), where("senderId", "==", userId))
      const messagesSnapshot = await getDocs(messagesQuery)
      const messagesData = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]

      // Also fetch received messages
      const receivedQuery = query(collection(db, "messages"), where("receiverId", "==", userId))
      const receivedSnapshot = await getDocs(receivedQuery)
      const receivedData = receivedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]

      const allMessages = [...messagesData, ...receivedData]
      allMessages.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp)
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp)
        return bTime.getTime() - aTime.getTime()
      })

      setMessages(allMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const fetchStudents = async () => {
    try {
      const studentsQuery = query(
        collection(db, "users"),
        where("role", "==", "student"),
        where("approved", "==", true),
      )
      const studentsSnapshot = await getDocs(studentsQuery)
      const studentsData = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      })) as Student[]
      setStudents(studentsData)
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedStudent || !newMessage.trim()) return

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      const userData = userDoc.data()

      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        receiverId: selectedStudent,
        senderName: userData?.name || "Teacher",
        message: newMessage.trim(),
        timestamp: new Date(),
        read: false,
      })

      setNewMessage("")
      fetchMessages(user.uid)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, "messages", messageId), {
        read: true,
      })
      fetchMessages(user!.uid)
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  // Group messages by student
  const groupedMessages = messages.reduce(
    (acc, message) => {
      const studentId = message.senderId === user?.uid ? message.receiverId : message.senderId
      if (!acc[studentId]) {
        acc[studentId] = []
      }
      acc[studentId].push(message)
      return acc
    },
    {} as Record<string, Message[]>,
  )

  const filteredMessages = Object.entries(groupedMessages).filter(([studentId, msgs]) => {
    const student = students.find((s) => s.id === studentId)
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <TeacherLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading messages...</p>
          </div>
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2 animate-fade-in-up">Messages</h1>
          <p className="text-green-100 animate-fade-in-up animation-delay-200">
            Communicate with your students and provide guidance
          </p>
        </div>

        {/* New Message Form */}
        <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="mr-2 h-5 w-5" />
              Send New Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={sendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  required
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="animate-fade-in-up animation-delay-400">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Message History */}
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <Card className="text-center py-12 animate-fade-in-up">
              <CardContent>
                <MessageCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Messages Yet</h3>
                <p className="text-gray-500">Start communicating with your students!</p>
              </CardContent>
            </Card>
          ) : (
            filteredMessages.map(([studentId, msgs], index) => {
              const student = students.find((s) => s.id === studentId)
              const unreadCount = msgs.filter((m) => !m.read && m.receiverId === user?.uid).length

              return (
                <Card
                  key={studentId}
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-semibold">{student?.name.charAt(0) || "S"}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{student?.name || "Student"}</CardTitle>
                          <CardDescription>Student</CardDescription>
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white animate-pulse">{unreadCount} new</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {msgs.slice(0, 3).map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg transition-all duration-200 ${
                            message.senderId === user?.uid
                              ? "bg-green-100 ml-8 border-l-4 border-green-500"
                              : "bg-gray-100 mr-8 border-l-4 border-gray-400"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600">
                              {message.senderId === user?.uid ? "You" : message.senderName}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {message.timestamp?.toDate?.()?.toLocaleString() || "Recently"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800">{message.message}</p>
                          {!message.read && message.receiverId === user?.uid && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(message.id)}
                              className="mt-2 text-xs hover:bg-green-50 transition-all duration-200"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      ))}
                      {msgs.length > 3 && (
                        <p className="text-center text-sm text-gray-500 py-2">+{msgs.length - 3} more messages</p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedStudent(studentId)}
                        className="w-full hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Reply to {student?.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </TeacherLayout>
  )
}
