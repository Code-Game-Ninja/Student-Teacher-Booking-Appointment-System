"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Calendar, MessageCircle, Star, ArrowRight, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import dynamic from "next/dynamic"
import { FaGithub } from "react-icons/fa"

// Dynamically import react-icons/fa for client-side only
const FaTwitter = dynamic(() => import("react-icons/fa").then(mod => mod.FaTwitter), { ssr: false })
const FaLinkedin = dynamic(() => import("react-icons/fa").then(mod => mod.FaLinkedin), { ssr: false })
const FaFacebook = dynamic(() => import("react-icons/fa").then(mod => mod.FaFacebook), { ssr: false })

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setUserData(data)

            // Redirect based on role and approval status
            if (data.role === "admin") {
              router.push("/admin/dashboard")
              return
            } else if (data.role === "teacher" && data.approved) {
              router.push("/teacher/dashboard")
              return
            } else if (data.role === "student" && data.approved) {
              router.push("/student/dashboard")
              return
            } else if (!data.approved) {
              // User is not approved yet, show pending message
              setUser(user)
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading EduConnect...</p>
        </div>
      </div>
    )
  }

  // If user is logged in but not approved
  if (user && userData && !userData.approved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">Account Pending Approval</CardTitle>
            <CardDescription>
              Your {userData.role} account is currently under review by our administrators.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              This usually takes 24-48 hours.
            </p>
            <Button
              onClick={() => {
                auth.signOut()
                router.push("/")
              }}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-between">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">EduConnect</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with illustration and animated background shapes */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-100 rounded-full opacity-40 animate-pulse -z-10" style={{ filter: 'blur(32px)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full opacity-30 animate-pulse -z-10" style={{ filter: 'blur(48px)' }} />
        <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 text-center md:text-left animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Connect with
              <span className="text-indigo-600 block">Qualified Teachers</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto md:mx-0">
              Find experienced educators, book personalized sessions, and accelerate your learning journey with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/auth/register">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-3">
                  Start Learning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
                  Become a Teacher
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center md:justify-end animate-fade-in-up animation-delay-200">
            <Image src="https://plus.unsplash.com/premium_photo-1681487732859-c2a780022063?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8RWR1Y2F0aW9uJTIwUG9ydGFsfGVufDB8fDB8fHww" alt="Hero Illustration" width={350} height={350} className="rounded-2xl shadow-lg" />
          </div>
        </div>
      </section>

      {/* Features Section with enhanced card hover effects */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Learn</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools and features you need for effective online learning.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:scale-105 hover:shadow-2xl hover:bg-blue-50 transition-all duration-300 animate-fade-in-up animation-delay-200">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Find Expert Teachers</CardTitle>
                <CardDescription>
                  Browse through our curated list of qualified teachers across various subjects and specializations.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:scale-105 hover:shadow-2xl hover:bg-green-50 transition-all duration-300 animate-fade-in-up animation-delay-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Easy Scheduling</CardTitle>
                <CardDescription>
                  Book appointments with teachers based on their availability and your preferred time slots.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:scale-105 hover:shadow-2xl hover:bg-purple-50 transition-all duration-300 animate-fade-in-up animation-delay-400">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Direct Communication</CardTitle>
                <CardDescription>
                  Communicate directly with teachers through our built-in messaging system for better coordination.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:scale-105 hover:shadow-2xl hover:bg-yellow-50 transition-all duration-300 animate-fade-in-up animation-delay-500">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Quality Assurance</CardTitle>
                <CardDescription>
                  All teachers are vetted and reviewed to ensure the highest quality learning experience.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:scale-105 hover:shadow-2xl hover:bg-pink-50 transition-all duration-300 animate-fade-in-up animation-delay-600">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle>Verified Sessions</CardTitle>
                <CardDescription>
                  Every session is tracked and verified for your peace of mind and progress.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:scale-105 hover:shadow-2xl hover:bg-indigo-50 transition-all duration-300 animate-fade-in-up animation-delay-700">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <ArrowRight className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Seamless Experience</CardTitle>
                <CardDescription>
                  Enjoy a smooth, intuitive platform designed for both students and teachers.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">What Our Users Say</h3>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <div className="bg-white rounded-xl shadow-lg p-6 flex-1 animate-fade-in-up">
              <p className="text-lg text-gray-700 mb-4">“EduConnect made it so easy to find the perfect teacher for my needs. The booking process was seamless and the quality of teaching is top-notch!”</p>
              <div className="flex items-center justify-center gap-3">
                <Image src="https://plus.unsplash.com/premium_photo-1689977807477-a579eda91fa2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D" alt="Student" width={48} height={48} className="rounded-full" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Aarav S.</div>
                  <div className="text-sm text-gray-500">Student</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex-1 animate-fade-in-up animation-delay-200">
              <p className="text-lg text-gray-700 mb-4">“As a teacher, I love how easy it is to manage my schedule and connect with students. The platform is intuitive and efficient.”</p>
              <div className="flex items-center justify-center gap-3">
                <Image src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D" alt="Teacher" width={48} height={48} className="rounded-full" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Priya M.</div>
                  <div className="text-sm text-gray-500">Teacher</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of students who have already transformed their learning experience with EduConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-3">
                Sign Up as Student
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-indigo-600 text-lg px-8 py-3 bg-transparent"
              >
                Join as Teacher
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer with social media links */}
      <footer className="bg-white border-t py-6 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} EduConnect. All rights reserved.</div>
          <div className="flex space-x-4">
            <a href="https://www.linkedin.com/in/chirag-mishra-14b128337/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 text-xl"><FaLinkedin /></a>
            <a href="https://github.com/Code-Game-Ninja" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xl"><FaGithub /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}
