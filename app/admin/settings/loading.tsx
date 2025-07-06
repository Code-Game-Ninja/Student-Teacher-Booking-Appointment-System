export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl h-32"></div>

        {/* Settings Cards Skeleton */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-40"></div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Save Button Skeleton */}
        <div className="bg-white rounded-lg p-6">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}
