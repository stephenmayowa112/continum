import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getMentorReviews, getMentorReviewStats } from '../services/reviewService';
import { FaStar } from 'react-icons/fa';

interface MentorReviewsProps {
  mentorId: string;
}

const MentorReviews: React.FC<MentorReviewsProps> = ({ mentorId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    average: number;
    totalCount: number;
    ratingCounts: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  }>({
    average: 0,
    totalCount: 0,
    ratingCounts: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(3);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [reviewsData, statsData] = await Promise.all([
          getMentorReviews(mentorId),
          getMentorReviewStats(mentorId)
        ]);
        
        setReviews(reviewsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading mentor reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (mentorId) {
      loadData();
    }
  }, [mentorId]);

  const calculatePercentage = (count: number) => {
    if (stats.totalCount === 0) return 0;
    return (count / stats.totalCount) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Reviews</h2>

      {stats.totalCount > 0 ? (
        <>
          {/* Summary Stats */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{stats.average}</span>
                <div className="flex mb-1">
                  {[...Array(5)].map((_, idx) => (
                    <FaStar
                      key={idx}
                      className={idx < Math.round(stats.average) ? "text-yellow-500" : "text-gray-200"}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500">{stats.totalCount} reviews</p>
            </div>

            <div className="flex-1">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center mb-2">
                  <span className="text-xs font-medium text-gray-700 w-2">{star}</span>
                  <FaStar className="text-yellow-500 ml-1 mr-2" />
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full"
                      style={{ width: `${calculatePercentage(stats.ratingCounts[star as keyof typeof stats.ratingCounts])}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {stats.ratingCounts[star as keyof typeof stats.ratingCounts]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            {reviews.slice(0, displayCount).map((review) => (
              <div key={review.id} className="border-t border-gray-100 pt-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                    {review.mentees?.profile_image_url ? (
                      <Image
                        src={review.mentees.profile_image_url}
                        alt={review.mentees?.name || 'Mentee'}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-indigo-600 font-medium text-sm">
                        {(review.mentees?.name?.charAt(0) || 'M').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-medium text-gray-900">
                      {review.mentees?.name || 'Anonymous Mentee'}
                    </h3>
                    
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-sm ${i < review.rating ? "text-yellow-500" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {review.feedback && (
                      <p className="text-sm text-gray-600 mt-2">
                        "{review.feedback}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {reviews.length > displayCount && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setDisplayCount(prev => prev + 3)}
                className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Load More Reviews
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaStar className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
          <p className="text-gray-500 mt-2">
            This mentor hasn't received any reviews yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default MentorReviews;