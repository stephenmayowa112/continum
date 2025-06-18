"use client";
import React from "react";
import Image from 'next/image';
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaLinkedinIn,
  FaTiktok,
  FaUserFriends,
  FaChalkboardTeacher,
  FaUsers,
  FaBlog,
  FaUserPlus,
  FaQuestionCircle,
  FaHandshake,
} from "react-icons/fa";
import { usePathname } from 'next/navigation';
import { motion } from "framer-motion";

const ConditionalFooter: React.FC = () => {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard')) return null;

  return (
    <footer className="bg-white border-t border-gray-200 py-12 relative z-20 overflow-hidden">
      <motion.div
        className="container mx-auto px-6"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo Section */}
        <motion.div
          className="flex justify-center md:justify-start mb-6"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/roshementorship.png"
              alt="Roshe Mentorship Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-xl font-montserrat text-black font-bold">Roshe Mentorship</span>
          </Link>
        </motion.div>

        {/* Mission Statement and Social Icons */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start space-y-6 md:space-y-0 mb-8">
          {/* Mission */}
          <motion.div
            className="text-center md:text-left md:w-2/3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-sm text-black">
              To inspire powerful conversations and collaborations among members <br />
              worldwide so together we can change the world with creativity.
            </p>
          </motion.div>

          {/* Social Icons */}
          <motion.div
            className="flex justify-center md:justify-end space-x-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {[ 
              { href: "https://www.linkedin.com/company/roshe-mentorship/", Icon: FaLinkedinIn },
              { href: "https://www.instagram.com/roshe_mentorship/", Icon: FaInstagram },
              { href: "https://x.com/roshementorship?s=21&t=TN5-Nr3z-NoaUxp_TbMOVA", Icon: FaTwitter },
              { href: "https://www.facebook.com/share/1BCqU9R9Pc/?mibextid=LQQJ4d", Icon: FaFacebookF },
              { href: "https://www.youtube.com/@RosheMentorship", Icon: FaYoutube },
              { href: "https://www.tiktok.com/@roshementorship?is_from_webapp=1&sender_device=pc", Icon: FaTiktok },
            ].map(({ href, Icon }, idx) => (
              <motion.a
                key={idx}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#9898FA] text-white rounded-full p-3 sm:p-4 hover:scale-110 transition-transform duration-300 shadow-md"
                whileHover={{ scale: 1.2 }}
              >
                <Icon size={24} />
              </motion.a>
            ))}
          </motion.div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col md:flex-row justify-center md:justify-between gap-6">
          {/* Left Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <ul role="list" className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 text-black text-sm">
              <li className="flex items-center gap-2">
                <FaUserFriends className="text-[#9898FA]" size={18} />
                <Link href="/signIn" className="hover:text-[#9898FA] transition font-bold">
                  Find mentors
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <FaChalkboardTeacher className="text-[#9898FA]" size={18} />
                <Link href="/signup/mentor" className="hover:text-[#9898FA] transition font-bold">
                  Become a mentor
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <FaUsers className="text-[#9898FA]" size={18} />
                <Link href="/" className="hover:text-[#9898FA] transition font-bold">
                  Community
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <FaBlog className="text-[#9898FA]" size={18} />
                <Link href="/blog" className="hover:text-[#9898FA] transition font-bold">
                  Blog
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Right Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <ul role="list" className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 text-black text-sm">
              <li className="flex items-center gap-2">
                <FaUserPlus className="text-[#9898FA]" size={18} />
                <Link href="/signIn" className="hover:text-[#9898FA] transition font-bold">
                  Join Roshe Mentorship
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <FaQuestionCircle className="text-[#9898FA]" size={18} />
                <Link href="/faq" className="hover:text-[#9898FA] transition font-bold">
                  FAQs
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <FaHandshake className="text-[#9898FA]" size={18} />
                <a href="mailto:roshementorship@gmail.com" className="hover:text-[#9898FA] transition font-bold">
                  Partnerships
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          className="text-sm text-black mt-6 text-center md:text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          © {new Date().getFullYear()} Roshe Mentorship, all rights reserved.
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default ConditionalFooter;