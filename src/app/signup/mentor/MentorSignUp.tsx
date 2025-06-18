"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import emailjs from '@emailjs/browser';
import { sendMentorSignupEmail } from '@/services/emailService';

const MentorSignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    dob: '',
    biography: '',
    password: '',
    showPassword: false
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  

  // Initialize EmailJS
  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
      emailjs.init({
        publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      });
    } else {
      console.error('EmailJS public key is not set');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setFormData((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
  };

  const validateLinkedIn = (linkedin: string): boolean => {
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/.*$/;
    return linkedinRegex.test(linkedin);
  };

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateDob = (dob: string): boolean => {
    if (!dob.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return false;
    }
    
    // Parse the date
    const [day, month, year] = dob.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Check if date is valid
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return false;
    }
    
    // Check if the person is at least 18 years old
    const today = new Date();
    const minAge = 18;
    const minDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    
    return date <= minDate;
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.dob || !formData.password) {
      return 'Please fill in all required fields.';
    }

    if (!validateEmail(formData.email)) {
      return 'Please enter a valid email address.';
    }

    if (!validateLinkedIn(formData.linkedin)) {
      return 'Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username).';
    }

    if (!validateDob(formData.dob)) {
      return 'Please enter a valid date of birth in DD/MM/YYYY format. You must be at least 18 years old.';
    }

    if (!validatePassword(formData.password)) {
      return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Register mentor in Supabase Auth and mentors table
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          linkedin: formData.linkedin,
          dob: formData.dob,
          password: formData.password,
          role: 'mentor',
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      // Send mentor signup email notification
      await sendMentorSignupEmail({
        to_email: formData.email,
        to_name: formData.name,
        message: `\nNew Mentor Registration Details:\n----------------------------\nName: ${formData.name}\nEmail: ${formData.email}\nLinkedIn: ${formData.linkedin}\nDate of Birth: ${formData.dob}\nBiography: ${formData.biography}`.trim()
      });

      setSuccess('Thank you for your interest! We will review your application and contact you soon.');
      setFormData({
        name: '',
        email: '',
        linkedin: '',
        dob: '',
        biography: '',
        password: '',
        showPassword: false
      });
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit form. Please try again later.';
      setError(`${errorMessage} (If this persists, please contact support)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-black bg-white flex items-center justify-center py-16 px-4 mt-8">
      <div className="max-w-5xl w-full flex flex-col md:flex-row justify-between items-stretch gap-8">
        {/* Left Image Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <Image
            src="/images/mentor_pic.png"
            alt="Mentor Sign Up"
            width={700}
            height={1000}
            className="rounded-lg shadow-lg w-[126%] h-auto object-cover"
            priority
          />
        </div>

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 bg-white rounded-lg p-4 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 mb-1 text-left">Get Started Now</h2>
          <p className="text-gray-600 mb-4 text-left text-sm">Enter your credentials to create your account</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>

            {/* LinkedIn and DOB Fields in a row */}
            <div className="flex flex-col sm:flex-row gap-3">  
              <div className="w-full sm:w-1/2">  
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="linkedin"
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>

              <div className="w-full sm:w-1/2">  
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="dob"
                  id="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-0.5">You must be at least 18 years old</p>
              </div>
            </div>

            {/* Biography Field */}
            <div>
              <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">
                Biography
              </label>
              <textarea
                name="biography"
                id="biography"
                value={formData.biography}
                onChange={handleChange}
                placeholder="Write a brief biography"
                className="block w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={2}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={formData.showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {formData.showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                At least 8 characters, 1 uppercase, 1 lowercase, and 1 number
              </p>
            </div>

            {error && <p className="text-red-600 text-xs">{error}</p>}
            {success && <p className="text-green-600 text-xs">{success}</p>}

            <button
              type="submit"
              className="w-full py-2.5 text-white font-medium rounded-md mt-4 transition duration-300 ease-in-out transform hover:scale-105 flex justify-center items-center text-sm"
              style={{
                background: 'linear-gradient(90.15deg, #24242E 0.13%, #747494 99.87%)',
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing Up...
                </>
              ) : (
                'Register'
              )}
            </button>

            <div className="text-center mt-3">
              <p className="text-xs text-gray-600">
                Already have an account?{' '}
                <a href="/signIn" className="text-blue-600 hover:text-blue-800">
                  Log in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MentorSignUp;