"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.slice(1));
      const accessToken = params.get('access_token');
      const errorParam = params.get('error');

      if (errorParam) {
        setError(errorParam);
        setMessage('Verification failed.');
        return;
      }

    if (accessToken) {
      // Optionally, you can use this token to update the user session,
      // or just show a success message.
      setMessage('Your email has been verified successfully!');
      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 4000);
    } else {
      setMessage('Verification failed. Please try again.');
    }
  } catch (err) {
      console.error('Verification error:', err);
      setError('An unexpected error occurred');
      setMessage('Verification failed.');
    }
  
 }, [router]);

return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-xl mb-4">{message}</p>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
