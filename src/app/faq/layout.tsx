"use client"
import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [email, setEmail] = useState("")

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle subscription logic here
    console.log("Subscribing email:", email)
    // Reset form
    setEmail("")
    // Show success message (optional)
    alert("Thank you for subscribing to our newsletter!")
  }

  return (
    <div className="bg-white">
      {children}
      
      {/* Newsletter Section - Full width background */}
      <div className="w-full bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="mb-3">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto">
                <div className="w-10 h-10 rounded-full flex items-center justify-center">
                  <Image src="/images/roshementorship.png" alt="Roshe Mentorship" width={36} height={36} className="object-contain" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Roshe Mentorship&apos;s Newsletter</h2>
            <p className="text-gray-300 mb-4 max-w-xl mx-auto">
              Get the world&apos;s most powerful insight on animation, game and film and accelerating your career — 1 idea,
              every week.
            </p>
            <p className="text-gray-400 mb-4">By Omobolaji Moses • Over 100 subscribers</p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-3">
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

            <p className="text-gray-400 text-xs">
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
    </div>
  )
}
