"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useUser } from '../../../../lib/auth';
import { useRouter } from 'next/navigation';
import { 
  getMentorProfileByUser, 
  updateMentorProfile, 
  getMenteeProfileByUser, 
  updateMenteeProfile 
} from '../../../../services/profileService';
import { getUserRole } from '../../../../lib/user';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { supabase } from '../../../../lib/supabaseClient';

type FormData = {
  name: string;
  bio: string;
  profile_image_url: string;
  location: string;
  company: string;
  linkedin_url: string;
  // Mentee-specific fields
  specialization: string; // Used as role/focus area
  years_experience: number;
};

export default function GeneralPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormData>({
    criteriaMode: 'all'
  });

  // Get the user's role when component mounts
  useEffect(() => {
    if (!userLoading && user?.id) {
      getUserRole(user.id).then(role => {
        setUserRole(role);
      });
    }
  }, [user, userLoading]);

  // Load the profile data
  useEffect(() => {
    if (!userLoading && user && userRole) {
      (async () => {
        try {
          let profile;
          if (userRole === 'mentor') {
            profile = await getMentorProfileByUser(user.id);
          } else {
            profile = await getMenteeProfileByUser(user.id);
          }
          
          if (profile) {
            reset({
              name: profile.name || '',
              bio: profile.bio || '',
              profile_image_url: profile.profile_image_url || '',
              location: profile.location || '',
              company: profile.company || '',
              linkedin_url: profile.linkedin_url || '',
              specialization: profile.specialization || '',
              years_experience: profile.years_experience || 0
            });
            setImagePreview(profile.profile_image_url || '');
          } else {
            reset({ 
              name: '', 
              bio: '', 
              profile_image_url: '', 
              location: '', 
              company: '', 
              linkedin_url: '',
              specialization: '',
              years_experience: 0
            });
            setImagePreview('');
          }
        } catch (err) {
          console.error('Failed to load profile:', err);
        }
      })();
    }
  }, [user, userLoading, userRole, reset]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    if (user) {
      setIsSaving(true);
      let profileImageUrl = data.profile_image_url;
      try {
        // If a new image is selected, upload to Supabase Storage
        if (selectedImage) {
          console.log("Starting image upload process...");
          // Proceed with upload
          const fileExt = selectedImage.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          console.log("Attempting to upload to:", filePath);
          
          // Try the upload
          const { error: uploadError } = await supabase.storage
            .from('public-profile-images')
            .upload(filePath, selectedImage, { 
              upsert: true, 
              cacheControl: '3600'
            });
            
          if (uploadError) {
            console.error("Supabase upload error details:", uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
          }
          
          console.log("Upload successful, getting public URL");
          const { data: publicUrlData } = supabase.storage
            .from('public-profile-images')
            .getPublicUrl(filePath);
            
          console.log("Public URL data:", publicUrlData);
          
          if (publicUrlData) {
            profileImageUrl = publicUrlData.publicUrl;
            console.log("Set profile URL to:", profileImageUrl);
          } else {
            console.error("Failed to get public URL");
            throw new Error("Failed to get public URL for uploaded image");
          }
        }
        
        console.log("Updating profile with image URL:", profileImageUrl);
        
        // Use the correct update function based on user role
        if (userRole === 'mentor') {
          await updateMentorProfile(user.id, { ...data, profile_image_url: profileImageUrl });
        } else {
          await updateMenteeProfile(user.id, { ...data, profile_image_url: profileImageUrl });
        }
        
        toast.success('Profile updated successfully!');
        setSelectedImage(null);
        router.push('/dashboard');
      } catch (error) {
        console.error('Detailed error updating profile:', error);
        if (error instanceof Error) {
          toast.error(`Failed to update profile: ${error.message}`);
        } else {
          toast.error('Failed to update profile. Please try again.');
        }
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Add this useEffect to check bucket existence when component loads
  useEffect(() => {
    const checkBucket = async () => {
      try {
        console.log("Checking if bucket exists...");
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("Error listing buckets:", error);
          return;
        }
        
        console.log("Available buckets:", buckets);
        
        // Check if our specific bucket exists
        const bucketExists = buckets.some(bucket => bucket.name === 'public-profile-images');
        console.log("public-profile-images bucket exists:", bucketExists);
        
        if (!bucketExists) {
          console.warn("WARNING: Please create the 'public-profile-images' bucket in your Supabase dashboard");
        }
      } catch (e) {
        console.error("Error checking bucket:", e);
      }
    };
    
    if (user) {
      checkBucket();
    }
  }, [user]);

  if (userLoading || !user) return <div>Loading...</div>;

  return (
    <div className="mt-4">
      <div className="bg-white p-6 rounded-lg shadow w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {userRole === 'mentor' ? 'Mentor Profile' : 'Mentee Profile'}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input id="name" {...register('name', { required: 'Name is required' })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {/* Bio Field */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea id="bio" {...register('bio')} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} placeholder="Tell us about yourself..." />
          </div>

          {/* Two fields in one row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <input id="location" {...register('location')} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="City, Country" />
            </div>
            
            {/* Company Field */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company/School</label>
              <input id="company" {...register('company')} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Where you work or study" />
            </div>
          </div>

          {/* Two fields in one row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Specialization Field */}
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Focus Area</label>
              <input id="specialization" {...register('specialization')} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your specialization or area of interest" />
            </div>

            {/* Experience Field */}
            <div>
              <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input id="years_experience" type="number" {...register('years_experience', { 
                valueAsNumber: true,
                min: { value: 0, message: 'Experience cannot be negative' }
              })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
              {errors.years_experience && (
                <p className="text-red-500 text-sm mt-1">{errors.years_experience.message}</p>
              )}
            </div>
          </div>

          {/* LinkedIn URL Field */}
          <div>
            <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
            <input id="linkedin_url" {...register('linkedin_url', { 
              pattern: { 
                value: /^(https?:\/\/)?(www\.)?linkedin\.com\/.+$/i, 
                message: 'Please enter a valid LinkedIn URL' 
              } 
            })} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://linkedin.com/in/username" />
            {errors.linkedin_url && (
              <p className="text-red-500 text-sm mt-1">{errors.linkedin_url.message}</p>
            )}
          </div>

          {/* Profile Image Upload Field */}
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">Profile Image</label>
            <input id="profileImage" type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500" />
            {imagePreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <div className="relative w-20 h-20 rounded-full border border-gray-300 overflow-hidden">
                  <Image 
                    src={imagePreview} 
                    alt="Profile preview" 
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const imgElement = e.target as HTMLImageElement;
                      if (imgElement.src !== "/images/mentor_pic.png") {
                        imgElement.src = "/images/mentor_pic.png";
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isSaving}
            className="w-full py-2 text-white font-medium rounded transition"
            style={{ background: 'linear-gradient(90deg, #24242E 0%, #747494 100%)' }}
          >
            {(isSubmitting || isSaving) ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}