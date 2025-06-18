"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../../../../lib/auth';
import {
  getSocialLinks,
  createSocialLink,
  deleteSocialLink
} from '../../../../services/profileService';

type Link = {
  id: string;
  platform: string;
  url: string;
};

export default function SocialLinksPage() {
  const { user, loading } = useUser();
  const [links, setLinks] = useState<Link[]>([]);
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [platformError, setPlatformError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadLinks = useCallback(async () => {
    if (user) {
      const data = await getSocialLinks(user.id);
      setLinks(data);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) loadLinks();
  }, [loading, loadLinks]);

  const handleAdd = async () => {
    if (!user) return;
    let valid = true;
    if (!platform.trim()) {
      setPlatformError('Platform is required');
      valid = false;
    } else {
      setPlatformError(null);
    }
    const urlPattern = /^(https?:\/\/).+/;
    if (!url.trim()) {
      setUrlError('URL is required');
      valid = false;
    } else if (!urlPattern.test(url)) {
      setUrlError('Enter a valid URL');
      valid = false;
    } else {
      setUrlError(null);
    }
    if (!valid) return;

    setBusy(true);
    try {
      await createSocialLink({ mentor_id: user.id, platform, url });
      setPlatform(''); setUrl('');
      setPlatformError(null);
      setUrlError(null);
      loadLinks();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await deleteSocialLink(id);
      loadLinks();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mt-4">
      <div className="bg-white p-6 rounded-lg shadow w-11/12 md:w-4/5 lg:w-3/4 mx-auto space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Social Links</h2>
        <ul className="space-y-3">
          {links.map(link => (
            <li key={link.id} className="flex justify-between items-center">
              <span className="text-gray-700">{link.platform}: {link.url}</span>
              <button
                onClick={() => handleDelete(link.id)}
                disabled={busy}
                className="text-red-500 hover:underline"
              >Delete</button>
            </li>
          ))}
        </ul>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New Social Link</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Platform</label>
            <input
              type="text"
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              placeholder="e.g. LinkedIn"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {platformError && <p className="text-red-500 text-sm mt-1">{platformError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {urlError && <p className="text-red-500 text-sm mt-1">{urlError}</p>}
          </div>
          <button
            onClick={handleAdd}
            disabled={busy}
            className="w-full py-2 text-white font-medium rounded transition"
            style={{ background: 'linear-gradient(90deg, #24242E 0%, #747494 100%)' }}
          >
            {busy ? 'Saving...' : 'Add Link'}
          </button>
        </div>
      </div>
    </div>
  );
}