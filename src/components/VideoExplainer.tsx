"use client";
import React from 'react';
import { motion } from 'framer-motion'; // Named import

const ExplainerVideo = () => {
  return (
    <motion.section
      className="w-full py-16 px-4 sm:px-8 bg-white flex flex-col items-center"
      // ✅ Added px-4 for mobile and sm:px-8 for small screens and above
    >
      {/* Header */}
      <header className="text-center mb-10 max-w-2xl mx-auto">
        {/* ✅ Added max-w and mx-auto to keep text neat */}
        <motion.h1
          className="text-3xl sm:text-4xl capitalize text-black font-bold"
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Unlock your potential
        </motion.h1>
        <motion.p
          className="text-base sm:text-lg text-black mt-4"
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Become the best version of yourself by accessing the perspectives and industry
          <br />
          experiences of others who&apos;ve been there, done that.
        </motion.p>
      </header>

      {/* Video */}
      <motion.div
        className="w-full flex justify-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="w-full sm:w-3/4 lg:w-2/3 relative group rounded-xl overflow-hidden px-2 sm:px-0">
          {/* ✅ Added px-2 on mobile to prevent video from touching edges */}

          {/* Gradient Border */}
          <div className="absolute inset-0 rounded-xl p-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-spin z-0"></div>

          {/* Video inside the border */}
          <div className="relative rounded-xl overflow-hidden z-10 bg-white">
            <video
              className="w-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700 ease-in-out"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/images/RosheMentorship.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default ExplainerVideo;