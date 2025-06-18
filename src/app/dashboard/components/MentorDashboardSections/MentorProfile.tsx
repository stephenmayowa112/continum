"use client"

import { useState } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import type { Mentor } from '../../../../../services/profileService';

interface MentorProfileProps {
  mentor: Mentor | null;
}

export default function MentorProfile({ mentor }: MentorProfileProps) {
  const [formData, setFormData] = useState<Partial<Mentor>>(mentor || {});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // List of expertise options
  const expertiseOptions = [
    "3D Animation", "Character Animation", "Rigging", "VFX", "Lighting", 
    "Texturing", "Modeling", "Rendering", "Compositing", "Game Development",
    "Motion Graphics", "Concept Art", "Storyboarding", "Technical Direction"
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setFormData({
      ...formData,
      expertise: selectedValues
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mentor?.id) return;
    
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('mentors')
        .update(formData)
        .eq('id', mentor.id);
      
      if (error) throw error;
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!mentor) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Profile</h2>
        <p className="text-gray-500">Please complete your registration first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Profile</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  id="linkedin_url"
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
              
              <div>
                <label htmlFor="years_of_experience" className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input
                  id="years_of_experience"
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience || 0}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <input
                  id="hourly_rate"
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate || 0}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-1">
                  Areas of Expertise (hold Ctrl/Cmd to select multiple)
                </label>
                <select
                  id="expertise"
                  name="expertise"
                  multiple
                  value={formData.expertise || []}
                  onChange={handleMultiSelectChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  size={4}
                >
                  {expertiseOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Tell mentees about your experience and what you can help them with..."
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-lg">{mentor.name || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{mentor.email || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">LinkedIn</h3>
                <p className="mt-1">
                  {mentor.linkedin_url ? (
                    <a 
                      href={mentor.linkedin_url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {mentor.linkedin_url}
                    </a>
                  ) : 'Not specified'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Years of Experience</h3>
                <p className="mt-1">{mentor.years_of_experience || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Hourly Rate</h3>
                <p className="mt-1">{mentor.hourly_rate ? `$${mentor.hourly_rate}` : 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Areas of Expertise</h3>
                {mentor.expertise && mentor.expertise.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {mentor.expertise.map(skill => (
                      <span 
                        key={skill} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1">Not specified</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Bio</h3>
              <div className="mt-1 prose max-w-none">
                {mentor.bio ? (
                  <p>{mentor.bio}</p>
                ) : (
                  <p className="text-gray-400 italic">No bio provided yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}