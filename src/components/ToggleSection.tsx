"use client"
import Link from "next/link"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"

type MenuItems = {
  [key: string]: string[]
}

const menuItems: MenuItems = {
  Design: [
    "Graphic Design",
    "Motion Design",
    "3D Design",
    "Product Design",
    "Multimedia",
    "Interaction Design",
    "Game Design",
  ],
  "3D Character Animation": [],
  "2D Character Animation": [],
  "3D Rigging": [],
  "Concept Art": [
    "Character Design",
    "Environment Design",
    "Prop Design",
    "Digital Matte Painting",
    "Background Painting",
    "Color Script",
    "Painting",
  ],
  "Storyboard & Animatics": [],
  "Game Animation": [],
  "Texturing and Lookdev": [],
  Lighting: [],
  "Visual Effect (Vfx)": [],
  "Character Effect (Cfx)": ["Cloth Simulation", "Hair Simulation", "Crowd Simulation"],
  "Modeling & Sculpting": ["Character Modeling", "Environment Modeling", "Prop Modeling", "Sculpting"],
  "Film Making": [
    "Acting",
    "Film Directing",
    "Film Distribution",
    "Cinematography",
    "Photography",
    "Production Design",
    "Hair & Makeup",
    "Film Editing",
  ],
  "Architecture": [],
}

const ToggleSection: React.FC = () => {
  const [selectedView, setSelectedView] = useState<"mentor" | "mentee">("mentee")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState("")
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [submenuStyle, setSubmenuStyle] = useState<React.CSSProperties>({})
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const mainMenuRef = useRef<HTMLDivElement>(null)
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activeItemRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setActiveSubmenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Update submenu position when active item changes
  useEffect(() => {
    if (activeItemRef.current && mainMenuRef.current && !isMobile && activeSubmenu) {
      const itemRect = activeItemRef.current.getBoundingClientRect()
      const menuRect = mainMenuRef.current.getBoundingClientRect()

      setSubmenuStyle({
        position: "fixed",
        top: itemRect.top,
        left: menuRect.right + 2,
        zIndex: 100,
        minWidth: "180px", // Reduced from 200px
        width: "auto",
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "0.375rem",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      })
    }
  }, [activeSubmenu, isMobile])

  const handleSkillSelect = (skill: string, subskill?: string) => {
    setSelectedSkill(subskill || skill)
    setIsOpen(false)
    setActiveSubmenu(null)
  }

  const handleParentClick = (skill: string, subskills: string[]) => {
    // If there are no subskills, immediately select
    if (subskills.length === 0) {
      handleSkillSelect(skill)
    } else {
      // Toggle sub-menu for both mobile and desktop
      setActiveSubmenu(activeSubmenu === skill ? null : skill)
    }
  }

  const handleParentHover = (skill: string, subskills: string[], element: HTMLButtonElement | null) => {
    if (subskills.length > 0 && !isMobile) {
      // Clear any timeout that would close the submenu
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current)
        submenuTimeoutRef.current = null
      }
      setActiveSubmenu(skill)
      activeItemRef.current = element
    }
  }

  const handleParentLeave = () => {
    // Set a timeout to close the submenu
    submenuTimeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null)
    }, 100) // Small delay to allow moving to submenu
  }

  const handleSubmenuHover = () => {
    // Clear any timeout that would close the submenu
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current)
      submenuTimeoutRef.current = null
    }
  }

  const handleSubmenuLeave = () => {
    // Close submenu after leaving it
    setActiveSubmenu(null)
  }

  // Render the submenu outside the main component tree
  const renderSubmenu = () => {
    if (!isOpen || !activeSubmenu || isMobile) return null

    return (
      <div
        style={{
          ...submenuStyle,
          maxWidth: "220px", // Add this line to limit maximum width
        }}
        onMouseEnter={handleSubmenuHover}
        onMouseLeave={handleSubmenuLeave}
      >
        {menuItems[activeSubmenu]?.map((subskill) => (
          <button
            key={subskill}
            className="w-full px-4 py-3 text-left hover:bg-[#f0ebff] text-black border-b border-gray-100 last:border-0"
            onClick={() => handleSkillSelect(activeSubmenu, subskill)}
          >
            {subskill}
          </button>
        ))}
      </div>
    )
  }

  return (
    <section className="bg-white py-12 md:py-24 pt-20">
      <div className="container mx-auto px-4 md:px-0">
        <div className="flex justify-center mb-16 sm:mb-10 space-x-4 px-4 sm:px-0">
          <button
            onClick={() => setSelectedView("mentee")}
            className={`text-sm sm:text-base md:text-lg font-semibold px-3 md:px-4 py-2 ${selectedView === "mentee"
                ? "text-black border-b-2 border-black"
                : "text-gray-600"
              } transition`}
            style={{ borderBottomWidth: "2px" }}
          >
            Mentee
          </button>
          <button
            onClick={() => setSelectedView("mentor")}
            className={`text-sm sm:text-base md:text-lg font-semibold px-3 md:px-4 py-2 ${selectedView === "mentor"
                ? "text-black border-b-2 border-black"
                : "text-gray-600"
              } transition`}
            style={{ borderBottomWidth: "2px" }}
          >
            Mentor
          </button>
        </div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0">
          {/* Left Image Grid */}
          <div className="hidden lg:grid grid-cols-3 gap-3 md:gap-4 w-full lg:w-auto mb-8 lg:mb-0 lg:mr-8">
            {/* First row */}
            <Image
              src="/images/1.jpg"
              alt="Profile 1"
              width={120}
              height={150}
              className="rounded-md object-cover w-24 h-[150px] animate-float-breathing"
            />
            <Image
              src="/images/2.jpg"
              alt="Profile 2"
              width={120}
              height={150}
              className="rounded-md object-cover w-24 h-[150px] animate-float-breathing delay-200"
            />
            <Image
              src="/images/3.jpg"
              alt="Profile 3"
              width={120}
              height={150}
              className="rounded-md object-cover w-24 h-[150px] animate-float-breathing delay-400"
            />

            {/* Second row - with left padding to offset */}
            <div className="col-span-3 pl-6 grid grid-cols-3 gap-3 md:gap-4">
              <Image
                src="/images/4.jpg"
                alt="Profile 4"
                width={120}
                height={150}
                className="rounded-md object-cover w-24 h-[150px] animate-float-breathing"
              />
              <Image
                src="/images/5.jpg"
                alt="Profile 5"
                width={120}
                height={150}
                className="rounded-md object-cover w-24 h-[150px] animate-float-breathing delay-200"
              />
              <Image
                src="/images/6.jpg"
                alt="Profile 6"
                width={120}
                height={150}
                className="rounded-md object-cover w-24 h-[150px] animate-float-breathing delay-400"
              />
            </div>
          </div>

          {/* Middle Section: Dynamic Content */}
          <div className="text-center pt-0.2 lg:mx-12 lg:flex-1 transition-all duration-300 mb-12 lg:mb-0 animate-fade-slide">
            {selectedView === "mentor" ? (
              <>
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-black font-medium leading-relaxed mb-6 md:mb-8">
                  Change the world through mentorship
                </h2>
                <p className="text-gray-600 mb-6 md:mb-8 text-lg md:text-xl leading-relaxed px-8 md:px-0">
                  Enhance your leadership confidence, expand your <br />
                  connections, and shape your lasting impact.
                </p>
                <Link
                  href="/signup/mentor"
                  className="relative flex justify-center inline-block w-full md:w-auto px-5 py-2.5 md:px-12 md:py-4 bg-[#9898FA] text-white rounded-md hover:bg-[#6B28D1] hover:animate-wiggle transition text-base md:text-lg mb-8 md:mb-0"
                >
                  Become a Mentor
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-black font-medium leading-relaxed mb-6 md:mb-8">
                  Get mentored by industry professionals
                </h2>
                <p className="text-gray-600 mb-6 md:mb-8 text-lg md:text-xl leading-relaxed px-8 md:px-0">
                  Fast-track your career with personalized 1:1 guidance from over 1000 expert mentors in our community.
                </p>
                <div className="relative flex justify-center" ref={dropdownRef}>
                  <button
                    ref={buttonRef}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-4/6 px-4 md:px-6 py-3 md:py-4 border text-black border-gray-300 rounded-md shadow-sm text-base md:text-lg text-left bg-white flex items-center justify-between hover:shadow-lg transition duration-300 hover:animate-wiggle hover:border-[#6B28D1]"
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 mr-2 text-gray-500"
                        viewBox="0 0 50 50"
                      >
                        <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
                      </svg>
                      <span className="flex items-center justify-center w-full">
                        {selectedSkill || "What skill do you want to improve?"}
                      </span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>

                  {isOpen && (
                    <div
                      ref={mainMenuRef}
                      className="absolute z-40 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden animate-fade-in"
                      style={{
                        width: buttonRef.current ? buttonRef.current.offsetWidth : "auto",
                        left: "50%",
                        transform: "translateX(-50%)",
                        top: "calc(100% + 4px)",
                      }}
                    >
                      <div className="w-full overflow-y-auto max-h-[300px] md:max-h-[40vh] transition-all duration-200">
                        {Object.entries(menuItems).map(([skill, subskills]) => (
                          <div key={skill} className="relative">
                            <button
                              ref={activeSubmenu === skill ? activeItemRef : null}
                              data-skill={skill}
                              className={`w-full px-4 py-3 text-left hover:bg-[#f0ebff] flex justify-between items-center text-black ${activeSubmenu === skill ? "bg-[#f0ebff]" : ""}`}
                              onClick={() => handleParentClick(skill, subskills)}
                              onMouseEnter={(e) => handleParentHover(skill, subskills, e.currentTarget)}
                              onMouseLeave={handleParentLeave}
                            >
                              <span>{skill}</span>
                              {subskills.length > 0 && (
                                <span className="ml-2 text-gray-500">›</span>
                              )}
                            </button>

                            {activeSubmenu === skill && subskills.length > 0 && isMobile && (
                              <div className="w-full bg-[#f8f7fc] transition-all duration-200 pl-4">
                                {subskills.map((subskill) => (
                                  <button
                                    key={subskill}
                                    className="w-full px-4 py-2 text-left hover:bg-[#f0ebff] text-black"
                                    onClick={() => handleSkillSelect(skill, subskill)}
                                  >
                                    {subskill}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Image Grid */}
          <div className="hidden lg:grid grid-cols-3 gap-3 md:gap-4 w-full lg:w-auto mb-8 lg:mb-0 lg:mr-8">
            {/* First row */}
            <Image
              src="/images/10.jpg"
              alt="Profile 7"
              width={120}
              height={150}
              className="rounded-md object-cover w-24 h-[150px] animate-float-breathing"
            />
            <Image
              src="/images/11.jpg"
              alt="Profile 8"
              width={120}
              height={150}
              className="rounded-md object-cover w-24 h-[150px] animate-float-breathing delay-200"
            />
            <Image
              src="/images/18.jpg"
              alt="Profile 9"
              width={120}
              height={150}
              className="rounded-md object-cover w-24 h-[150px] animate-float-breathing delay-400"
            />

            {/* Second row - with left padding to offset */}
            <div className="col-span-3 pl-6 grid grid-cols-3 gap-3 md:gap-4">
              <Image
                src="/images/12.jpg"
                alt="Profile 10"
                width={120}
                height={150}
                className="rounded-md object-cover w-24 h-[150px] animate-float-breathing"
              />
              <Image
                src="/images/17.jpg"
                alt="Profile 11"
                width={120}
                height={150}
                className="rounded-md object-cover w-24 h-[150px] animate-float-breathing delay-200"
              />
              <Image
                src="/images/13.jpg"
                alt="Profile 12"
                width={120}
                height={150}
                className="rounded-md object-cover w-24 h-[150px] animate-float-breathing delay-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Render submenu outside the main component tree */}
      {renderSubmenu()}
    </section>
  )
}

export default ToggleSection

