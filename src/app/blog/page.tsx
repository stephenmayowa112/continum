"use client"
import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import Link from "next/link"

// Blog posts data
const blogPosts = [
  {
    id: 1,
    title: "The future of 3D Animation: Trends to watch.",
    category: "News & Updates",
    date: "March 19, 2025",
    image: "/images/3D.png",
    isTopRated: true,
    author: {
      name: "Apinke Afolabi",
      avatar: "/images/apinke.png",
      date: "April 4th, 2025"
    }
  },
  {
    id: 2,
    title: "How to create stunning visual effects for your next project",
    category: "News & Updates",
    date: "March 15, 2025",
    image: "/images/b1.jpg",
    isTopRated: true,
    author: {
      name: "Chris Lee",
      avatar: "/images/apinke.png",
      date: "March 18th, 2025"
    }
  },
  {
    id: 3,
    title: "Behind the scenes: Animation pipeline at major studios",
    category: "News & Updates",
    date: "March 10, 2025",
    image: "/images/b2.jpg",
    isTopRated: false,
    author: {
      name: "Apinke Afolabi",
      avatar: "/images/apinke.png",
      date: "March 12th, 2025"
    }
  },
  {
    id: 4,
    title: "Essential skills every 3D animator needs in 2025",
    category: "News & Updates",
    date: "March 5, 2025",
    image: "/images/b3.jpg",
    isTopRated: false,
    author: {
      name: "Apinke Afolabi",
      avatar: "/images/apinke.png",
      date: "March 8th, 2025"
    }
  },

  {
    id: 5,

    title: "Essential skills every 3D animator needs in 2025",
    category: "News & Updates",
    date: "March 5, 2025",
    image: "/images/b4.jpg",
    isTopRated: false,
    author: {
      name: "Apinke Afolabi",
      avatar: "/images/apinke.png",
      date: "March 8th, 2025"
    }
  }
];

// Top writers data
const topWriters = [
  {
    id: 1,
    name: "Apinke Afolabi",
    avatar: "/images/apinke.png",
    date: "April 4th, 2025"
  },
  {
    id: 2,
    name: "Apinke Afolabi",
    avatar: "/images/apinke.png",
    date: "March 18th, 2025"
  },
  {
    id: 3,
    name: "Apinke Afolabi",
    avatar: "/images/apinke.png",
    date: "March 15th, 2025"
  },
  {
    id: 4,
    name: "Apinke Afolabi",
    avatar: "/images/apinke.png",
    date: "March 10th, 2025"
  },
  {
    id: 5,
    name: "Apinke Afolabi",
    avatar: "/images/apinke.png",
    date: "March 5th, 2025"
  },
  {
    id: 6,
    name: "Apinke Afolabi",
    avatar: "/images/apinke.png",
    date: "March 1st, 2025"
  }
];

export default function BlogPage() {
  const [email, setEmail] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle subscription logic here
    console.log("Subscribing with email:", email)
    setEmail("")
    // You could add success message or API call here
  }

// This function is not needed since navigation is handled by the Link component
// The handleSubmitArticle function was previously here but has been removed

  return (
    <div className="flex flex-col min-h-screen bg-white pt-16">
      {/* Sidebar and Main Content Container */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-24 border-r border-gray-200 py-8">
          <div className="flex flex-col items-center justify-center h-32 border-b border-gray-200">
            <span className="transform -rotate-90 text-black font-medium tracking-wide">News & Update</span>
          </div>
          <div className="flex flex-col items-center justify-center h-32">
            <span className="transform -rotate-90 text-black font-medium tracking-wide">Videos</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow px-4 md:px-8 py-6">
          {/* Blog Header */}
          <div className="flex flex-col md:flex-row text-black justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Blog</h1>
            <div className="flex w-full md:w-auto gap-4">
              <div className="relative flex-grow md:w-80">
                <input
                  type="text"
                  placeholder="Search article"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                />
                <div className="absolute text-black inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-black" />
                </div>
              </div>
              <Link 
                href="/blogSubmit"
                className="px-4 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Submit Article
              </Link>
            </div>
          </div>

          {/* Featured Article */}
          <div className="grid md:grid-cols-5 gap-6 mb-12">
            <div className="md:col-span-2">
              <div className="rounded-lg overflow-hidden h-full flex flex-col">
                <div className="bg-custom-purple text-white p-6 text-center w-full">
                  <h2 className="text-2xl font-serif">{blogPosts[0].title}</h2>
                </div>
                <div className="w-full">
                  <Image
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    width={400}
                    height={200}
                    className="w-full object-cover"
                    style={{ aspectRatio: '500/300', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
            <div className="md:col-span-3 flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-violet-500">{blogPosts[0].category}</span>
                <span className="text-gray-700"> — {blogPosts[0].date}</span>
              </div>
              <h2 className="text-3xl text-black font-bold mb-4">{blogPosts[0].title}</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={blogPosts[0].author.avatar}
                    alt={blogPosts[0].author.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-black">{blogPosts[0].author.name}</p>
                  <p className="text-sm text-gray-600">{blogPosts[0].author.date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Blog Posts and Top Writers in a grid layout */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {/* Latest Blog Posts - reduced size to 3 columns */}
            <div className="md:col-span-3">
              <h2 className="text-2xl font-bold text-black mb-6">Latest blog posts</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {blogPosts.filter(post => post.id !== 1).map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1">
                    <div className="relative">
                      <Image
                        src={post.image}
                        alt={`Blog post ${post.id}`}
                        width={180}
                        height={90}
                        className="w-full h-36 object-cover"
                      />
                      {post.isTopRated && (
                        <div className="absolute top-2 left-2 text-black bg-white text-xs font-medium px-2 py-1 rounded">
                          Top rated
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="mb-2">
                        <span className="text-violet-500 text-sm">{post.category}</span>
                        <span className="text-gray-900 text-sm"> — {post.date}</span>
                      </div>
                      <h3 className="font-bold text-black mb-2 text-sm">{post.title}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden">
                          <Image
                            src={post.author.avatar}
                            alt="Author"
                            width={28}
                            height={28}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-black font-medium">{post.author.name}</p>
                          <p className="text-xs text-gray-600">{post.author.date}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-8">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                  Load more posts
                </button>
              </div>
            </div>
            
            {/* Top Writers - moved to right column */}
            <div className="md:col-span-1 border-l border-gray-200 pl-4">
              <h2 className="text-2xl font-bold text-black mb-6">Top writers</h2>
              <div className="space-y-4">
                {topWriters.map((writer) => (
                  <div key={writer.id} className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={writer.avatar}
                          alt="Writer"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-black text-sm">{writer.name}</p>
                        <p className="text-xs text-gray-600">{writer.date}</p>
                      </div>
                    </div>
                    <Link href="#" className="text-violet-500 text-xs hover:underline mt-1 md:mt-0">
                      Read Blogs
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section - moved outside of main content div */}
      <div className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
              <div className="w-12 h-12  rounded-full flex items-center justify-center">
                <Image src="/images/roshementorship.png" alt="Roshe Mentorship" width={40} height={40} className="object-contain" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Roshe Mentorship&apos;s Newsletter</h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Get the world&apos;s most powerful insight on animation, game and film and accelerating your career — 1 idea,
            every week.
          </p>
          <p className="text-gray-400 mb-6">By Omobolaji Moses • Over 100 subscribers</p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-4">
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your Email"
                className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 rounded-md focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-custom-purple text-white font-medium rounded-md hover:bg-custom-purple/90 transition-colors"
            >
              Subscribe
            </button>
          </form>

          <p className="text-gray-400 text-sm">
            By subscribing you agree to{" "}
            <Link href="#" className="underline">
              Substack&apos;s Terms of Use
            </Link>
            ,{" "}
            <Link href="#" className="underline">
              our Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline">
              our Information collection notice
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
