export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl h-32"></div>

        {/* Weekly Schedule Skeleton */}
        <div className="bg-white rounded-lg p-6 space-y-6">
          <div className="h-6 bg-gray-200 rounded w-40"></div>
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-12 h-6 bg-gray-200 rounded"></div>
              <div className="flex items-center space-x-4">
                <div className="w-32 h-8 bg-gray-200 rounded"></div>
                <div className="w-32 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>

        {/* Schedule Overview Skeleton */}
        <div className="bg-white rounded-lg p-6">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
