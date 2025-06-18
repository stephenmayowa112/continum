export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-white animate-pulse pt-16">
      {/* Sidebar and Main Content Container */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-24 border-r border-gray-200 py-8">
          <div className="flex flex-col items-center justify-center h-32 border-b border-gray-200">
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="flex flex-col items-center justify-center h-32">
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow px-4 md:px-8 py-6">
          {/* Blog Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="w-32 h-8 bg-gray-200 rounded mb-4 md:mb-0"></div>
            <div className="flex w-full md:w-auto gap-4">
              <div className="relative flex-grow md:w-80 h-10 bg-gray-200 rounded-md"></div>
              <div className="w-40 h-10 bg-gray-300 rounded-md"></div>
            </div>
          </div>

          {/* Featured Article */}
          <div className="grid md:grid-cols-5 gap-6 mb-12">
            <div className="md:col-span-2">
              <div className="rounded-lg overflow-hidden">
                <div className="bg-gray-200 h-32 w-full"></div>
                <div className="bg-gray-300 h-48 w-full"></div>
              </div>
            </div>
            <div className="md:col-span-3 flex flex-col justify-center">
              <div className="mb-2 w-40 h-4 bg-gray-200 rounded"></div>
              <div className="w-full h-8 bg-gray-200 rounded mb-4"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                <div>
                  <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Blog Posts */}
          <div className="mb-12">
            <div className="w-48 h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-300"></div>
                    <div className="absolute top-2 left-2 w-16 h-6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="p-4">
                    <div className="mb-2 w-36 h-4 bg-gray-200 rounded"></div>
                    <div className="w-full h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                      <div>
                        <div className="w-24 h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="w-20 h-2 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <div className="w-36 h-10 bg-gray-200 rounded-md"></div>
            </div>
          </div>

          {/* Top Writers */}
          <div className="border-l border-gray-200 pl-6 mb-12">
            <div className="w-36 h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    <div>
                      <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="w-24 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-900 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
            </div>
          </div>
          <div className="w-72 h-8 bg-gray-700 rounded mx-auto mb-2"></div>
          <div className="w-96 h-4 bg-gray-700 rounded mx-auto mb-2"></div>
          <div className="w-80 h-4 bg-gray-700 rounded mx-auto mb-6"></div>
          <div className="w-64 h-3 bg-gray-700 rounded mx-auto mb-6"></div>

          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-4">
            <div className="flex-grow h-10 bg-gray-700 rounded-md"></div>
            <div className="w-28 h-10 bg-gray-600 rounded-md"></div>
          </div>

          <div className="w-72 h-3 bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    </div>
  )
}
