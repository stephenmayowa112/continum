'use client';
import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

const CenterCTA = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
    } else {
      setError("");
      console.log("Email submitted:", email);
    }
  };

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section
      ref={ref}
      className="w-full relative flex justify-center items-center py-16 px-4 overflow-hidden bg-white"
    >
      {/* Carousel Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 flex flex-col justify-center items-center space-y-6">
        <motion.img
          src="/images/carousel1.png"
          alt="carousel 1"
          className="h-[800px] w-[10000px] object-cover opacity-40"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        />
        <motion.img
          src="/images/carousel2.png"
          alt="carousel 2"
          className="h-[800px] w-[10000px] object-cover opacity-40"
          animate={{ x: ["0%", "50%"] }}
          transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
        />
        <motion.img
          src="/images/carousel3.png"
          alt="carousel 3"
          className="h-[800px] w-[10000px] object-cover opacity-40"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
        />
        <motion.img
          src="/images/carousel4.png"
          alt="carousel 4"
          className="h-[800px] w-[10000px] object-cover opacity-40"
          animate={{ x: ["0%", "50%"] }}
          transition={{ repeat: Infinity, duration: 55, ease: "linear" }}
        />
      </div>

      {/* CTA Form */}
      <motion.div
        className="relative z-20 w-full max-w-6xl px-6 py-10 overflow-hidden shadow-lg"
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={controls}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative z-20 bg-white px-6 py-8 rounded-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            Get Started for Free <span className="block md:inline">Under 1 Minute</span>
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-lg leading-relaxed text-center">
            Our goal is to help you craft an extraordinary career with the guidance of expert mentors.
            Whether you're starting out or stepping into leadership, we're here to support you.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row items-stretch justify-center gap-3 max-w-md mx-auto md:max-w-2xl"
            noValidate
          >
            <div className="relative flex-grow">
              <label htmlFor="email-input" className="sr-only">
                Email address
              </label>
              <div className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-3 text-gray-800 border ${error ? "border-red-500" : "border-gray-300"} rounded-lg md:rounded-r-none outline-none focus:ring-2 ${error ? "focus:ring-red-300" : "focus:ring-gray-700"} transition-all`}
                {...(error ? { 'aria-invalid': 'true' } : {})}
                aria-describedby="error-message"
              />
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-gray-800 to-gray-500 text-white hover:opacity-90 px-6 py-3 rounded-lg md:rounded-l-none font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition-colors"
            >
              Join now for free
            </button>
          </form>

          {error && (
            <div
              id="error-message"
              className="mt-3 flex items-center justify-center gap-2 text-red-600"
              role="alert"
              aria-live="polite"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default CenterCTA;