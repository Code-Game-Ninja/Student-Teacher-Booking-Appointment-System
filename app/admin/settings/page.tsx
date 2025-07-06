"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Globe, Bell, Shield, Database, Users } from "lucide-react"
import AdminLayout from "@/components/admin-layout"

interface SystemSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  allowRegistration: boolean
  requireApproval: boolean
  maxAppointmentsPerStudent: number
  appointmentDuration: number
  emailNotifications: boolean
  smsNotifications: boolean
  maintenanceMode: boolean
  welcomeMessage: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "Student-Teacher System",
    siteDescription: "A comprehensive platform for connecting students with qualified teachers",
    contactEmail: "admin@example.com",
    allowRegistration: true,
    requireApproval: true,
    maxAppointmentsPerStudent: 5,
    appointmentDuration: 60,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    welcomeMessage: "Welcome to our learning platform! Connect with amazing teachers and start your learning journey.",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "system"))
      if (settingsDoc.exists()) {
        setSettings({ ...settings, ...settingsDoc.data() })
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching settings:", error)
      setLoading(false)
    }
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      await updateDoc(doc(db, "settings", "system"), settings)
      setSuccess("Settings saved successfully!")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading system settings...</p>
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
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2 animate-fade-in-up">System Settings</h1>
          <p className="text-gray-300 animate-fade-in-up animation-delay-200">
            Configure system-wide settings and preferences
          </p>
        </div>

        <form onSubmit={saveSettings} className="space-y-6">
          {/* General Settings */}
          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic system configuration and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={settings.welcomeMessage}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-400">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Control user registration and approval processes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow New Registrations</Label>
                  <p className="text-sm text-gray-500">Enable or disable new user registrations</p>
                </div>
                <Switch
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Admin Approval</Label>
                  <p className="text-sm text-gray-500">New users need admin approval before accessing the system</p>
                </div>
                <Switch
                  checked={settings.requireApproval}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireApproval: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointment Settings */}
          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Appointment Settings
              </CardTitle>
              <CardDescription>Configure appointment booking rules and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxAppointments">Max Appointments per Student</Label>
                  <Input
                    id="maxAppointments"
                    type="number"
                    min="1"
                    max="20"
                    value={settings.maxAppointmentsPerStudent}
                    onChange={(e) =>
                      setSettings({ ...settings, maxAppointmentsPerStudent: Number.parseInt(e.target.value) })
                    }
                    className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentDuration">Default Appointment Duration (minutes)</Label>
                  <Input
                    id="appointmentDuration"
                    type="number"
                    min="15"
                    max="180"
                    step="15"
                    value={settings.appointmentDuration}
                    onChange={(e) => setSettings({ ...settings, appointmentDuration: Number.parseInt(e.target.value) })}
                    className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-600">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Send email notifications for appointments and messages</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Send SMS notifications for urgent updates</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Maintenance */}
          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                System Maintenance
              </CardTitle>
              <CardDescription>System-wide maintenance and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">Enable maintenance mode to prevent user access during updates</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
              {settings.maintenanceMode && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertDescription className="text-yellow-700">
                    ⚠️ Maintenance mode is enabled. Only administrators can access the system.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <Card className="animate-fade-in-up animation-delay-800">
            <CardContent className="p-6">
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving Settings...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayout>
  )
}
