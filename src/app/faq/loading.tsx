import { ChevronRight } from "lucide-react"

export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 bg-white">
      <div className="h-8 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
      <div className="h-5 w-64 bg-gray-200 rounded mb-8 animate-pulse"></div>

      <div className="space-y-0">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white">
            <div className="flex items-center py-5">
              <ChevronRight className="mr-2 h-5 w-5 text-gray-300" />
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="border-b border-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
