"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc, orderBy } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, Clock, Search, Reply, User } from "lucide-react"
import StudentLayout from "@/components/student-layout"

interface Message {
  id: string
  senderId: string
  receiverId: string
  senderName: string
  message: string
  timestamp: any
  read: boolean
}

interface Teacher {
  id: string
  name: string
  subject: string
}

export default function StudentMessagesPage() {
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        await Promise.all([fetchMessages(user.uid), fetchTeachers()])
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const fetchMessages = async (userId: string) => {
    try {
      const sentQuery = query(collection(db, "messages"), where("senderId", "==", userId), orderBy("timestamp", "desc"))
      const sentSnapshot = await getDocs(sentQuery)
      const sentData = sentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]

      const receivedQuery = query(
        collection(db, "messages"),
        where("receiverId", "==", userId),
        orderBy("timestamp", "desc"),
      )
      const receivedSnapshot = await getDocs(receivedQuery)
      const receivedData = receivedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]

      const allMessages = [...sentData, ...receivedData]
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
        name: doc.data().name,
        subject: doc.data().subject,
      })) as Teacher[]
      setTeachers(teachersData)
    } catch (error) {
      console.error("Error fetching teachers:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedTeacher || !newMessage.trim() || sending) return

    setSending(true)
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      const userData = userDoc.data()

      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        receiverId: selectedTeacher,
        senderName: userData?.name || "Student",
        message: newMessage.trim(),
        timestamp: new Date(),
        read: false,
      })

      setNewMessage("")
      setSelectedTeacher("")
      await fetchMessages(user.uid)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, "messages", messageId), {
        read: true,
      })
      if (user) {
        await fetchMessages(user.uid)
      }
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  // Group messages by teacher
  const groupedMessages = messages.reduce(
    (acc, message) => {
      const teacherId = message.senderId === user?.uid ? message.receiverId : message.senderId
      if (!acc[teacherId]) {
        acc[teacherId] = []
      }
      acc[teacherId].push(message)
      return acc
    },
    {} as Record<string, Message[]>,
  )

  const filteredMessages = Object.entries(groupedMessages).filter(([teacherId, msgs]) => {
    const teacher = teachers.find((t) => t.id === teacherId)
    return teacher?.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Loading messages...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
          <h1 className="text-2xl font-bold mb-2">Messages</h1>
          <p className="text-indigo-100 opacity-90">Communicate with your teachers and get guidance</p>
        </div>

        {/* Send New Message Card */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg font-semibold">
              <Send className="mr-2 h-5 w-5 text-gray-600" />
              Send New Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={sendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Teacher</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-gray-900"
                  required
                  disabled={sending}
                >
                  <option value="">Choose a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="min-h-[100px] resize-none border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={sending}
                />
              </div>
              <Button
                type="submit"
                disabled={sending || !selectedTeacher || !newMessage.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Message Conversations */}
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Messages Yet</h3>
                <p className="text-gray-500">Start a conversation with your teachers above!</p>
              </CardContent>
            </Card>
          ) : (
            filteredMessages.map(([teacherId, msgs]) => {
              const teacher = teachers.find((t) => t.id === teacherId)
              const unreadCount = msgs.filter((m) => !m.read && m.senderId !== user?.uid).length

              return (
                <Card key={teacherId} className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">{teacher?.name || "Teacher"}</CardTitle>
                          <CardDescription className="text-sm">{teacher?.subject}</CardDescription>
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white">{unreadCount} new</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {msgs.slice(0, 3).map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.senderId === user?.uid
                              ? "bg-indigo-50 ml-8 border-l-4 border-indigo-500"
                              : "bg-gray-50 mr-8 border-l-4 border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">
                              {message.senderId === user?.uid ? "You" : message.senderName}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {message.timestamp?.toDate?.()?.toLocaleString() || "Recently"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">{message.message}</p>
                          {!message.read && message.senderId !== user?.uid && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(message.id)}
                              className="mt-2 text-xs text-indigo-600 hover:bg-indigo-50 p-1 h-auto"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      ))}
                      {msgs.length > 3 && (
                        <p className="text-center text-sm text-gray-500 py-2 border-t">
                          +{msgs.length - 3} more messages
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTeacher(teacherId)}
                        className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Reply to {teacher?.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </StudentLayout>
  )
}
