"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../../lib/supabaseClient';
import { useUser } from '../../lib/auth';

// schema definition for login form
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
});
type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  // redirect logged-in users away
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hooks must be called unconditionally at top
  const [serverError, setServerError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) setServerError(err);
  }, [searchParams]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false }
  });

  useEffect(() => {
    if (!userLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, userLoading, router]);

  if (!userLoading && user) {
    return <div className="w-full h-screen flex items-center justify-center">Redirecting...</div>;
  }

  // submit handler calls API
  const onSubmit = async (data: LoginForm) => {
    setServerError('');
  
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password })
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || 'Login failed');
      } else {
        // Store the session in Supabase's local storage
        if (result.session) {
          // Set the session in the Supabase client
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token
          });
          
          // Wait for a brief moment to ensure the session is set
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        router.replace('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setServerError('An unexpected error occurred.');
    } finally {
      // no-op, isSubmitting covers loading state
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setServerError('');
    try {
      // compute redirect URL in client click
      const redirectTo = process.env.NEXT_PUBLIC_REDIRECT_URL || `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo }
      });
      if (error) {
        setServerError(error.message);
      } else if (data?.url) {
        window.location.replace(data.url);
      }
    } catch (err) {
      console.error('Social login error:', err);
      setServerError('Social login failed. Please try again.');
    }
  };

  return (
    <div className="w-full bg-white py-12 pt-28 px-4 md:py-20 md:pt-36">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-center">
        <div className="w-full lg:w-1/2 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Log In</h1>
          
          <form className="w-full max-w-md">
            {/* Social Login Buttons */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full py-3 mb-3 rounded-md flex items-center justify-center bg-[#9898FA] text-white font-medium"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Continue with Google
            </button>
            
            <div className="flex items-center mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            
            {/* Email Field */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                {...register('email')}
                id="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>
            
            {/* Password Field */}
            <div className="mb-6 relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  id="password"
                  placeholder="Password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
            </div>
            
            {serverError && <p className="text-red-600 text-sm mb-4">{serverError}</p>}
            
            <button
              type="button"
              onClick={() => handleSubmit(onSubmit)()}
              className="w-full py-3 text-white font-medium rounded-md hover:opacity-90"
              style={{
                background: 'linear-gradient(90deg, #24242E 0%, #747494 100%)'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
            
            <p className="text-center mt-6 text-gray-600 text-sm">
              Don&apos;t have an account?{' '}
              <a href="/user" className="text-[#9898FA] font-medium hover:underline">
                Sign up
              </a>
            </p>
          </form>
        </div>
        
        {/* Right Image Section */}
        <div className="hidden lg:flex lg:w-1/2 justify-center items-center">
          <Image
            src="/images/login.png" 
            alt="Login"
            width={500}
            height={650}
            className="rounded-lg shadow-lg object-cover max-h-[80vh]"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;