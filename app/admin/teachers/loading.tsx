export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl h-32"></div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>

        {/* Search Skeleton */}
        <div className="bg-white rounded-lg p-6">
          <div className="h-12 bg-gray-200 rounded-md"></div>
        </div>

        {/* Teachers List Skeleton */}
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-40"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
