'use client';

import React from 'react';
import Image from 'next/image';
import ReactCountryFlag from 'react-country-flag';
import { FiBriefcase, FiMessageSquare } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Mentor {
  id: number;
  name: string;
  location: string;
  countryCode: string;
  role: string;
  sessionsAndReviews: string;
  experience: string;
  attendance: string;
  image: string;
}

const mentors: Mentor[] = [
  {
    id: 1,
    name: 'Omobolaji Moses',
    location: 'United Kingdom',
    countryCode: 'GB',
    role: 'Animation Director at New Age',
    sessionsAndReviews: '100 sessions (30 reviews)',
    experience: '5 years',
    attendance: '100%',
    image: "/images/bj.jpg",
  },
  {
    id: 2,
    name: 'Name Surname',
    location: 'California',
    countryCode: 'US',
    role: 'Character Animator at Pixar Animation Studios',
    sessionsAndReviews: '100 sessions (30 reviews)',
    experience: '7 years',
    attendance: '98%',
    image: "/images/2.jpg",
  },
  {
    id: 3,
    name: 'Name Surname',
    location: 'Portugal',
    countryCode: 'PT',
    role: 'Matte Painter at DNEG',
    sessionsAndReviews: '1 sessions (5 reviews)',
    experience: '7 years',
    attendance: '98%',
    image: "/images/8.jpg",
  },
  {
    id: 4,
    name: 'Name Surname',
    location: 'London',
    countryCode: 'GB',
    role: 'Character Modeler at MPC',
    sessionsAndReviews: '100 sessions (30 reviews)',
    experience: '5 years',
    attendance: '98%',
    image: "/images/17.jpg",
  },
  {
    id: 5,
    name: 'Name Surname',
    location: 'Italy',
    countryCode: 'IT',
    role: 'Prop Modeler at Disney',
    sessionsAndReviews: '100 sessions (30 reviews)',
    experience: '10 years',
    attendance: '98%',
    image: "/images/15.jpg",
  },
];

const MentorsSection = () => {
  return (
    <section className="w-full bg-white py-16 flex flex-col items-center">
      <motion.div
        className="text-center mb-10 px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.5 }}
      >
        <h2 className="text-4xl font-bold text-gray-900">
          Discover the world&apos;s top mentors
        </h2>
        <p className="mt-4 text-base text-gray-700 leading-relaxed max-w-3xl mx-auto">
          Our mentors are the heart and soul of Roshe Mentorship. Veteran studio pro animators from
          powerhouses like Pixar, DreamWorks, and Industrial Light & Magic, teach you the ins and outs of production level animation.
        </p>
      </motion.div>

      <div className="w-11/12 max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {mentors.map((mentor, index) => (
          <motion.div
            key={mentor.id}
            className="bg-white rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden border border-gray-200"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative w-full h-60">
              <Image
                src={mentor.image}
                alt={mentor.name}
                fill
                quality={95}
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 224px"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                <ReactCountryFlag
                  countryCode={mentor.countryCode}
                  svg
                  style={{
                    width: '1.5em',
                    height: '1.5em',
                  }}
                  title={mentor.location}
                />
              </div>

              <div className="flex items-center gap-2 text-gray-700 text-sm mt-1">
                <FiBriefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <p>{mentor.role}</p>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <FiMessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <p>{mentor.sessionsAndReviews}</p>
              </div>

              <hr className="my-4 border-gray-200" />

              <div className="flex justify-between text-sm text-gray-700">
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500">Experience</span>
                  <span className="font-medium">{mentor.experience}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">Avg. Attendance</span>
                  <span className="font-medium">{mentor.attendance}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default MentorsSection;