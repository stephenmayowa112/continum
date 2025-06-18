"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Next.js router
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserSignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const router = useRouter();

  // Zod schema for sign-up form
  const signupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    linkedin: z.string().url('Invalid URL').refine(val => val.includes('linkedin.com'), 'Must be a LinkedIn URL'),
    dob: z.string().min(1, 'Date of birth is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms and privacy policy' }) }),
  });
  type SignupForm = z.infer<typeof signupSchema>;

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    if (!password) return '';
    if (password.length < 6) return 'Weak';
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password)) return 'Strong';
    if (/^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(password)) return 'Medium';
    return 'Weak';
  };

  // submit handler calls our API
  const onSubmit = async (data: SignupForm) => {
    setServerError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || 'Registration failed');
        toast.error(result.error || 'Registration failed', {
          position: 'top-right',
          autoClose: 4000,
        });
      } else {
        toast.success('Account created successfully! Please log in to continue.', {
          position: 'top-right',
          autoClose: 3000,
          style: { zIndex: 99999 },
        });
        setTimeout(() => router.push('/signIn'), 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setServerError('An unexpected error occurred.');
      toast.error('An unexpected error occurred.', {
        position: 'top-right',
        autoClose: 4000,
      });
    }
  };

  return (
    <div className="w-full text-black bg-white flex items-center justify-center py-32 px-4">
      {/* Toast Container */}
      <ToastContainer style={{ zIndex: 99999 }} />
      <div className="max-w-5xl w-full flex flex-col md:flex-row justify-between items-stretch gap-8">
        {/* Left Form Section */}
        <div className="w-full md:w-1/2 bg-white p-6 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Started Now</h2>
          <p className="text-gray-600 mb-6">Enter your credentials to create your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Sign up form">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                aria-label="Full Name"
                aria-invalid={errors.name ? true : false}
                {...register('name')}
                placeholder="Full Name"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                aria-label="Email Address"
                aria-invalid={errors.email ? true : false}
                {...register('email')}
                placeholder="you@example.com"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="linkedin"
                  type="url"
                  aria-label="LinkedIn URL"
                  aria-invalid={errors.linkedin ? true : false}
                  {...register('linkedin')}
                  placeholder="https://linkedin.com/in/..."
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.linkedin && <p className="text-red-600 text-sm mt-1">{errors.linkedin.message}</p>}
              </div>

              <div className="w-full sm:w-1/2">
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  id="dob"
                  type="date"
                  aria-label="Date of Birth"
                  aria-invalid={errors.dob ? true : false}
                  {...register('dob')}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  max="2025-04-25"
                />
                {errors.dob && <p className="text-red-600 text-sm mt-1">{errors.dob.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  aria-label="Password"
                  aria-invalid={errors.password ? true : false}
                  {...register('password', {
                    onChange: (e) => setPasswordStrength(checkPasswordStrength(e.target.value)),
                  })}
                  placeholder="Password"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  type="button" 
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordStrength && (
                <p className={`text-xs mt-1 ${passwordStrength === 'Strong' ? 'text-green-600' : passwordStrength === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>Password strength: {passwordStrength}</p>
              )}
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center mt-2">
              <input
                id="terms"
                type="checkbox"
                aria-label="Accept terms and privacy policy"
                aria-invalid={errors.terms ? true : false}
                {...register('terms')}
                className="mr-2"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the <a href="/terms" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Terms</a> and <a href="/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a> <span className="text-red-500">*</span>
              </label>
            </div>
            {errors.terms && <p className="text-red-600 text-sm mt-1">{errors.terms.message}</p>}

            {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

            <button
              type="submit"
              className="w-full py-3 text-white font-medium rounded-md mt-4 flex justify-center items-center"
              style={{
                background: 'linear-gradient(90.15deg, #24242E 0.13%, #747494 99.87%)',
                opacity: isSubmitting || !isValid ? 0.6 : 1,
                cursor: isSubmitting || !isValid ? 'not-allowed' : 'pointer',
              }}
              disabled={isSubmitting || !isValid}
              aria-disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing Up...
                </>
              ) : 'Sign Up'}
            </button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/signIn" className="text-blue-600 hover:text-blue-800">
                  Log in
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Right Image Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <Image
            src="/images/image_mentor.jpg"
            alt="Sign Up"
            width={600}
            height={800}
            className="rounded-lg shadow-lg w-full h-full object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default UserSignUp;