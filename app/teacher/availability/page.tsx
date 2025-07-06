"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Save, Settings } from "lucide-react"
import TeacherLayout from "@/components/teacher-layout"

interface Availability {
  day: string
  startTime: string
  endTime: string
  available: boolean
}

export default function AvailabilityPage() {
  const [user, setUser] = useState(null)
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setOnLeave(userData.onLeave || false)
            if (userData.availability) {
              setAvailability(userData.availability)
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const updateAvailability = async () => {
    if (!user) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      await updateDoc(doc(db, "users", user.uid), {
        availability: availability,
        lastUpdated: new Date(),
      })
      setSuccess("Availability updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error updating availability:", error)
      setError("Error updating availability. Please try again.")
      setTimeout(() => setError(""), 3000)
    } finally {
      setSaving(false)
    }
  }

  const toggleLeaveStatus = async () => {
    if (!user) return

    try {
      const newStatus = !onLeave
      await updateDoc(doc(db, "users", user.uid), {
        onLeave: newStatus,
        lastUpdated: new Date(),
      })
      setOnLeave(newStatus)
      setSuccess(`Leave status ${newStatus ? "enabled" : "disabled"} successfully!`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error updating leave status:", error)
      setError("Error updating leave status. Please try again.")
      setTimeout(() => setError(""), 3000)
    }
  }

  const updateDayAvailability = (index: number, field: keyof Availability, value: any) => {
    const newAvailability = [...availability]
    newAvailability[index] = { ...newAvailability[index], [field]: value }
    setAvailability(newAvailability)
  }

  const calculateTotalHours = () => {
    return availability.reduce((total, day) => {
      if (!day.available) return total
      const start = new Date(`2000-01-01T${day.startTime}:00`)
      const end = new Date(`2000-01-01T${day.endTime}:00`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return total + hours
    }, 0)
  }

  if (loading) {
    return (
      <TeacherLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading availability settings...</p>
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
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 animate-fade-in-up">Availability Settings</h1>
              <p className="text-green-100 animate-fade-in-up animation-delay-200">
                Manage your teaching schedule and availability
              </p>
            </div>
            <div className="text-right animate-fade-in-up animation-delay-300">
              <p className="text-sm text-green-100 mb-2">Leave Status</p>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={onLeave}
                  onCheckedChange={toggleLeaveStatus}
                  className="data-[state=checked]:bg-red-500"
                />
                <span className="text-sm font-medium">{onLeave ? "On Leave" : "Available"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Status Alert */}
        {onLeave && (
          <Alert className="border-amber-200 bg-amber-50 animate-bounce-in">
            <AlertDescription className="text-amber-700">
              <strong>You are currently on leave.</strong> Students cannot book new appointments with you.
            </AlertDescription>
          </Alert>
        )}

        {/* Weekly Schedule */}
        <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-400">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>Set your available days and hours for student appointments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availability.map((day, index) => (
              <div
                key={day.day}
                className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Day Name */}
                <div className="w-full sm:w-24">
                  <Label className="font-medium text-lg">{day.day}</Label>
                </div>

                {/* Available Toggle */}
                <div className="flex items-center">
                  <Switch
                    checked={day.available}
                    onCheckedChange={(checked) => updateDayAvailability(index, "available", checked)}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 min-w-[80px]">
                    {day.available ? "Available" : "Unavailable"}
                  </span>
                </div>

                {/* Time Inputs */}
                {day.available && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 animate-fade-in-up">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <Label className="text-sm whitespace-nowrap">From:</Label>
                      <Input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateDayAvailability(index, "startTime", e.target.value)}
                        className="w-32 transition-all duration-200 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm whitespace-nowrap">To:</Label>
                      <Input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateDayAvailability(index, "endTime", e.target.value)}
                        className="w-32 transition-all duration-200 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              onClick={updateAvailability}
              disabled={saving}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 transition-all duration-200 transform hover:scale-105"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Availability...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Availability
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Schedule Overview */}
        <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Schedule Overview
            </CardTitle>
            <CardDescription>Your current weekly availability at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {availability.filter((d) => d.available).length}
                </div>
                <div className="text-sm text-gray-600">Available Days</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">{calculateTotalHours()}h</div>
                <div className="text-sm text-gray-600">Weekly Hours</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className={`text-2xl font-bold mb-1 ${onLeave ? "text-red-600" : "text-purple-600"}`}>
                  {onLeave ? "On Leave" : "Active"}
                </div>
                <div className="text-sm text-gray-600">Current Status</div>
              </div>
            </div>

            {/* Daily Schedule Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availability.map((day, index) => (
                <div
                  key={day.day}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md animate-fade-in-up ${
                    day.available ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-lg">{day.day}</span>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        day.available ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {day.available ? "Available" : "Unavailable"}
                    </div>
                  </div>
                  {day.available && (
                    <div className="text-sm text-gray-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {day.startTime} - {day.endTime}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}
