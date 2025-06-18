"use client";
import React, { useState } from 'react';

export default function MagicLinkPage() {
  const [email, setEmail] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLink(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      console.log('Magic-link API response:', data, 'status:', res.status);
      if (!res.ok) {
        setError(data.error || 'Failed to generate magic link');
      } else if (!data.link) {
        setError('No magic-link returned. Check console or verify service-role key.');
      } else {
        setLink(data.link);
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl text-black font-bold mb-4">Admin: Generate Magic Link</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Mentor Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="mentor@example.com"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Magic Link'}
          </button>
        </form>
        {link && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">Copy this link and send to the mentor:</p>
            <div className="flex">
              <input
                type="text"
                readOnly
                value={link}
                aria-label="Magic link"
                title="Magic link"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 bg-gray-200 border border-gray-300 rounded-r-md hover:bg-gray-300"
              >Copy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}