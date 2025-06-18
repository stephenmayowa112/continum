'use client';  // Ensure this is a client component

import React from 'react';
import { motion } from 'framer-motion';

const ThreeFeatures = () => {
  return (
    <section className="w-full bg-white flex justify-center py-12">
      <div className="w-2/3 flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-12 sm:space-y-0 sm:space-x-16">
        
        {/* Feature 1 */}
        <motion.div
          className="flex space-x-6 flex-1"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <div className="w-16 h-16 rounded-full bg-red-400 flex items-center justify-center text-white font-bold text-lg cursor-pointer transform transition-all duration-300 hover:scale-110">
            1
          </div>
          <div className="text-black flex flex-col justify-between h-full">
            <h3 className="font-bold text-2xl">An open access to industry’s best.</h3>
            <p className="text-base font-normal">From animation to film and art, there are hundreds of top experts, you can get access for free.</p>
          </div>
        </motion.div>

        {/* Feature 2 */}
        <motion.div
          className="flex space-x-6 flex-1"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <div className="w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold text-lg cursor-pointer transform transition-all duration-300 hover:scale-110">
            2
          </div>
          <div className="text-black flex flex-col justify-between h-full">
            <h3 className="font-bold text-2xl">Personalized advice to accelerate your success.</h3>
            <p className="text-base font-normal">Book 1:1 mentorship session & get advice, insights to move faster with your work and demo reel.</p>
          </div>
        </motion.div>

        {/* Feature 3 */}
        <motion.div
          className="flex space-x-6 flex-1"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <div className="w-16 h-16 rounded-full bg-teal-400 flex items-center justify-center text-white font-bold text-lg cursor-pointer transform transition-all duration-300 hover:scale-110">
            3
          </div>
          <div className="text-black flex flex-col justify-between h-full">
            <h3 className="font-bold text-2xl">Achieve your long term goals, easily.</h3>
            <p className="text-base font-normal">Connect with mentors for recurring sessions and work towards a long-term goal.</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ThreeFeatures;