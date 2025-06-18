"use client"
import { useState } from "react"
import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Home } from "lucide-react"

export default function BlogSubmitPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    fileLink: "",
    profileLink: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Add your form submission logic here
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Section - Purple Background */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-500 to-indigo-600 p-12 md:p-20 text-white">
        {/* Home Button */}
        <div className="mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Home size={18} />
            <span>Home</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Empower the <br />
            Roshe Mentorship Community
          </h1>

          {/* Mission Points */}
          <div className="space-y-8">
            {/* Point 1 */}
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Image
                  src="/images/roshementorship.png"
                  alt="Roshe Mentorship"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="font-medium">
                  Champion the Mission. Join forces to create a world where mentorship is accessible to everyone.
                </p>
              </div>
            </div>

            {/* Point 2 */}
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Image
                  src="/images/roshementorship.png"
                  alt="Roshe Mentorship"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="font-medium">
                  Inspire Creative Conversation. Share new perspectives, spark innovative ideas and inspire creative
                  collaborations.
                </p>
              </div>
            </div>

            {/* Point 3 */}
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Image
                  src="/images/roshementorship.png"
                  alt="Roshe Mentorship"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="font-medium">
                  Seek Adventure Together. Drive curiosity, encourage optimism and strive to be better as a community.
                </p>
              </div>
            </div>

            {/* Point 4 */}
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Image
                  src="/images/roshementorship.png"
                  alt="Roshe Mentorship"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="font-medium">
                  Provide Better Education. Foster inclusive space for knowledge sharing and grow together personally
                  and professionally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full md:w-1/2 bg-white p-12 md:p-20 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Submit your article</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Email Address"
                required
              />
            </div>

            <div>
              <label htmlFor="fileLink" className="block text-sm font-medium text-gray-700 mb-1">
                Link to file (article)
              </label>
              <input
                type="url"
                id="fileLink"
                name="fileLink"
                value={formData.fileLink}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Link to file"
                required
              />
            </div>

            <div>
              <label htmlFor="profileLink" className="block text-sm font-medium text-gray-700 mb-1">
                Link to Roshe Mentorship profile
              </label>
              <input
                type="url"
                id="profileLink"
                name="profileLink"
                value={formData.profileLink}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Link to Roshe Mentorship profile"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium rounded-md hover:from-gray-800 hover:to-black transition-colors"
            >
              Submit article
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
// This code creates a blog submission page with a two-column layout. The left side features a gradient background with mission points, while the right side contains a form for users to submit their articles. The form includes fields for name, email, file link, and Roshe Mentorship profile link. The design is responsive and uses Tailwind CSS for styling.