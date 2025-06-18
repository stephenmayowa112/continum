export default function Loading() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Section - Purple Background Skeleton */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-400 to-indigo-500 p-8 md:p-12 animate-pulse">
        <div className="h-10 w-24 bg-white/30 rounded-full mb-16"></div>
        <div className="h-16 w-3/4 bg-white/30 rounded-lg mb-12"></div>

        {/* Mission Points Skeletons */}
        <div className="space-y-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="h-10 w-10 bg-white/30 rounded-full"></div>
              <div className="h-12 w-full bg-white/30 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section - Form Skeleton */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-8 animate-pulse"></div>

          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}

            <div className="h-12 w-full bg-gray-300 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
// This code creates a loading skeleton screen for a blog submission page using Tailwind CSS. The left section has a gradient background with animated pulse effects, while the right section contains a form skeleton with placeholders for text and buttons. The layout is responsive, adapting to different screen sizes.
// The skeletons are designed to give a visual indication of loading content, enhancing user experience during data fetching or processing.