"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { updatePassword, updateEmail } from "firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Lock, Save, Edit, Award } from "lucide-react"
import TeacherLayout from "@/components/teacher-layout"

interface UserData {
  name: string
  email: string
  phone: string
  role: string
  subject: string
  experience: string
  qualification: string
  createdAt: any
  approved: boolean
}

export default function TeacherProfilePage() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    experience: "",
    qualification: "",
    bio: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData
          setUserData(data)
          setFormData({
            name: data.name,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            experience: data.experience,
            qualification: data.qualification,
            bio: data.bio || "",
            newPassword: "",
            confirmPassword: "",
          })
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      // Update profile data
      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name,
        phone: formData.phone,
        subject: formData.subject,
        experience: formData.experience,
        qualification: formData.qualification,
        bio: formData.bio,
      })

      // Update email if changed
      if (formData.email !== userData?.email) {
        await updateEmail(user, formData.email)
      }

      setSuccess("Profile updated successfully!")
      setEditMode(false)

      // Refresh user data
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      await updatePassword(user, formData.newPassword)
      setSuccess("Password updated successfully!")
      setFormData({
        ...formData,
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <TeacherLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading profile...</p>
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
          <div className="flex items-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mr-6">
              <span className="text-3xl font-bold">{userData?.name?.charAt(0) || "T"}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 animate-fade-in-up">Teacher Profile</h1>
              <p className="text-green-100 animate-fade-in-up animation-delay-200">
                Manage your teaching profile and credentials
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{userData?.subject}</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{userData?.experience} years exp.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your teaching profile and credentials</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setEditMode(!editMode)}
                className="transition-all duration-200 hover:bg-green-50 hover:text-green-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                {editMode ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editMode}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editMode}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editMode}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject/Expertise</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    disabled={!editMode}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    disabled={!editMode}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    disabled={!editMode}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!editMode}
                  placeholder="Tell students about yourself, your teaching philosophy, etc."
                  className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-green-500"
                />
              </div>

              {editMode && (
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-400">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={saving || !formData.newPassword}
                className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Teaching Stats */}
        <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Teaching Statistics
            </CardTitle>
            <CardDescription>Your teaching journey overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 mb-1">23</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">156</div>
                <div className="text-sm text-gray-600">Sessions Completed</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">4.9</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {userData?.createdAt?.toDate?.()?.getFullYear() || "N/A"}
                </div>
                <div className="text-sm text-gray-600">Teaching Since</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}
