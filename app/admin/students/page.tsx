"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Search, CheckCircle, XCircle, Trash2, Mail, Phone } from "lucide-react"
import AdminLayout from "@/components/admin-layout"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  approved: boolean
  createdAt: any
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [searchTerm, filter, students])

  const fetchStudents = async () => {
    try {
      const studentsQuery = query(collection(db, "users"), where("role", "==", "student"))
      const studentsSnapshot = await getDocs(studentsQuery)
      const studentsData = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[]

      // Sort by creation date
      studentsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt)
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })

      setStudents(studentsData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching students:", error)
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filter !== "all") {
      if (filter === "approved") {
        filtered = filtered.filter((student) => student.approved)
      } else if (filter === "pending") {
        filtered = filtered.filter((student) => !student.approved)
      }
    }

    setFilteredStudents(filtered)
  }

  const approveStudent = async (studentId: string) => {
    try {
      await updateDoc(doc(db, "users", studentId), {
        approved: true,
      })
      setSuccess("Student approved successfully!")
      fetchStudents()
    } catch (error) {
      setError("Error approving student")
    }
  }

  const rejectStudent = async (studentId: string) => {
    try {
      await deleteDoc(doc(db, "users", studentId))
      setSuccess("Student registration rejected!")
      fetchStudents()
    } catch (error) {
      setError("Error rejecting student")
    }
  }

  const deleteStudent = async (studentId: string) => {
    try {
      await deleteDoc(doc(db, "users", studentId))
      setSuccess("Student deleted successfully!")
      fetchStudents()
    } catch (error) {
      setError("Error deleting student")
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading students...</p>
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
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2 animate-fade-in-up">Student Management</h1>
          <p className="text-indigo-100 animate-fade-in-up animation-delay-200">
            Manage student registrations and accounts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Total Students",
              count: students.length,
              color: "from-blue-500 to-blue-600",
              icon: Users,
            },
            {
              label: "Approved",
              count: students.filter((s) => s.approved).length,
              color: "from-green-500 to-green-600",
              icon: CheckCircle,
            },
            {
              label: "Pending Approval",
              count: students.filter((s) => !s.approved).length,
              color: "from-yellow-500 to-yellow-600",
              icon: XCircle,
            },
          ].map((stat, index) => (
            <Card
              key={stat.label}
              className={`bg-gradient-to-r ${stat.color} text-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
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
        <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-300">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { key: "all", label: "All Students" },
                  { key: "approved", label: "Approved" },
                  { key: "pending", label: "Pending" },
                ].map((tab) => (
                  <Button
                    key={tab.key}
                    variant={filter === tab.key ? "default" : "outline"}
                    onClick={() => setFilter(tab.key)}
                    className={`transition-all duration-200 ${
                      filter === tab.key
                        ? "bg-indigo-600 text-white transform scale-105"
                        : "hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <Card className="text-center py-12 animate-fade-in-up">
              <CardContent>
                <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Students Found</h3>
                <p className="text-gray-500">
                  {filter === "all" ? "No students have registered yet." : `No ${filter} students found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student, index) => (
              <Card
                key={student.id}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">{student.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors duration-200">
                          {student.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {student.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {student.phone}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Registered: {student.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge
                        className={`${
                          student.approved
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        } flex items-center gap-1`}
                      >
                        {student.approved ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {student.approved ? "Approved" : "Pending"}
                      </Badge>

                      <div className="flex space-x-2">
                        {!student.approved && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approveStudent(student.id)}
                              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectStudent(student.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50 transition-all duration-200"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteStudent(student.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
