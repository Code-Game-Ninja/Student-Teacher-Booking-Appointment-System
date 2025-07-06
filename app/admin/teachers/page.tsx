"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Search, Plus, Trash2, UserPlus, Mail, Phone, Award, Edit } from "lucide-react"
import AdminLayout from "@/components/admin-layout"
import { setDoc } from "firebase/firestore"

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  experience: string
  qualification: string
  onLeave: boolean
  createdAt: any
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    experience: "",
    qualification: "",
    tempPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    filterTeachers()
  }, [searchTerm, subjectFilter, teachers])

  const fetchTeachers = async () => {
    try {
      const teachersQuery = query(collection(db, "users"), where("role", "==", "teacher"))
      const teachersSnapshot = await getDocs(teachersQuery)
      const teachersData = teachersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Teacher[]

      // Sort by creation date
      teachersData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt)
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })

      setTeachers(teachersData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching teachers:", error)
      setLoading(false)
    }
  }

  const filterTeachers = () => {
    let filtered = teachers

    if (searchTerm) {
      filtered = filtered.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (subjectFilter !== "all") {
      filtered = filtered.filter((teacher) => teacher.subject.toLowerCase().includes(subjectFilter.toLowerCase()))
    }

    setFilteredTeachers(filtered)
  }

  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      // Generate temporary password if not provided
      const tempPassword = newTeacher.tempPassword || Math.random().toString(36).slice(-8)

      const userCredential = await createUserWithEmailAndPassword(auth, newTeacher.email, tempPassword)

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: newTeacher.name,
        email: newTeacher.email,
        phone: newTeacher.phone,
        role: "teacher",
        subject: newTeacher.subject,
        experience: newTeacher.experience,
        qualification: newTeacher.qualification,
        approved: true,
        createdAt: new Date(),
        availability: [],
        onLeave: false,
        tempPassword: tempPassword,
      })

      setSuccess(`Teacher added successfully! Temporary password: ${tempPassword}`)
      setNewTeacher({
        name: "",
        email: "",
        phone: "",
        subject: "",
        experience: "",
        qualification: "",
        tempPassword: "",
      })
      setShowAddTeacher(false)
      fetchTeachers()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const toggleLeaveStatus = async (teacherId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", teacherId), {
        onLeave: !currentStatus,
      })
      setSuccess(`Teacher leave status updated successfully!`)
      fetchTeachers()
    } catch (error) {
      setError("Error updating leave status")
    }
  }

  const deleteTeacher = async (teacherId: string) => {
    try {
      await deleteDoc(doc(db, "users", teacherId))
      setSuccess("Teacher deleted successfully!")
      fetchTeachers()
    } catch (error) {
      setError("Error deleting teacher")
    }
  }

  const subjects = [...new Set(teachers.map((t) => t.subject))]

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading teachers...</p>
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 animate-fade-in-up">Teacher Management</h1>
              <p className="text-green-100 animate-fade-in-up animation-delay-200">
                Manage teacher accounts and credentials
              </p>
            </div>
            <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
              <DialogTrigger asChild>
                <Button className="bg-white text-green-600 hover:bg-gray-100 transition-all duration-200 transform hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Teacher</DialogTitle>
                  <DialogDescription>Create a new teacher account with temporary password</DialogDescription>
                </DialogHeader>
                <form onSubmit={addTeacher} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacherName">Full Name</Label>
                    <Input
                      id="teacherName"
                      value={newTeacher.name}
                      onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherEmail">Email</Label>
                    <Input
                      id="teacherEmail"
                      type="email"
                      value={newTeacher.email}
                      onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherPhone">Phone</Label>
                    <Input
                      id="teacherPhone"
                      value={newTeacher.phone}
                      onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherSubject">Subject</Label>
                    <Input
                      id="teacherSubject"
                      value={newTeacher.subject}
                      onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherExperience">Experience (years)</Label>
                    <Input
                      id="teacherExperience"
                      type="number"
                      value={newTeacher.experience}
                      onChange={(e) => setNewTeacher({ ...newTeacher, experience: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherQualification">Qualification</Label>
                    <Input
                      id="teacherQualification"
                      value={newTeacher.qualification}
                      onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tempPassword">Temporary Password (optional)</Label>
                    <Input
                      id="tempPassword"
                      type="password"
                      value={newTeacher.tempPassword}
                      onChange={(e) => setNewTeacher({ ...newTeacher, tempPassword: e.target.value })}
                      placeholder="Leave empty for auto-generated"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Teacher
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Total Teachers",
              count: teachers.length,
              color: "from-green-500 to-green-600",
              icon: GraduationCap,
            },
            {
              label: "Active Teachers",
              count: teachers.filter((t) => !t.onLeave).length,
              color: "from-blue-500 to-blue-600",
              icon: UserPlus,
            },
            {
              label: "On Leave",
              count: teachers.filter((t) => t.onLeave).length,
              color: "from-yellow-500 to-yellow-600",
              icon: Award,
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
                  placeholder="Search teachers by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
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

        {/* Teachers List */}
        <div className="space-y-4">
          {filteredTeachers.length === 0 ? (
            <Card className="text-center py-12 animate-fade-in-up">
              <CardContent>
                <GraduationCap className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Teachers Found</h3>
                <p className="text-gray-500">No teachers match your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTeachers.map((teacher, index) => (
              <Card
                key={teacher.id}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">{teacher.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl group-hover:text-green-600 transition-colors duration-200">
                          {teacher.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {teacher.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {teacher.phone}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-1" />
                            {teacher.subject}
                          </div>
                          <div className="flex items-center">
                            <Award className="h-4 w-4 mr-1" />
                            {teacher.experience} years • {teacher.qualification}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined: {teacher.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge
                        className={`${
                          teacher.onLeave
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-green-100 text-green-800 border-green-200"
                        }`}
                      >
                        {teacher.onLeave ? "On Leave" : "Active"}
                      </Badge>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleLeaveStatus(teacher.id, teacher.onLeave)}
                          className={`transition-all duration-200 ${
                            teacher.onLeave
                              ? "text-green-600 border-green-200 hover:bg-green-50"
                              : "text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                          }`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {teacher.onLeave ? "Activate" : "Set Leave"}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTeacher(teacher.id)}
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
