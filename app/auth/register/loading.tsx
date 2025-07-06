import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RegisterLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">EduConnect</h1>
          </div>
          <p className="text-gray-600">Create your account</p>
        </div>

        <Card className="shadow-xl border-0 animate-pulse">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              <div className="h-8 bg-gray-200 rounded mx-auto w-48"></div>
            </CardTitle>
            <CardDescription className="text-center">
              <div className="h-4 bg-gray-200 rounded mx-auto w-64 mt-2"></div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Form field skeletons */}
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}

              {/* Button skeleton */}
              <div className="h-10 bg-gray-200 rounded"></div>

              {/* Footer text skeleton */}
              <div className="text-center mt-6">
                <div className="h-4 bg-gray-200 rounded mx-auto w-56"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
