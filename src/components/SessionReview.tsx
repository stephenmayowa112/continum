import React, { useState } from 'react';
import { createReview } from '../services/reviewService';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface SessionReviewProps {
  sessionId: string;
  mentorId: string;
  menteeId: string;
  mentorName: string;
  onReviewSubmitted?: () => void;
}

const SessionReview: React.FC<SessionReviewProps> = ({
  sessionId,
  mentorId,
  menteeId,
  mentorName,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle form submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating before submitting your review');
      return;
    }

    setIsSubmitting(true);

    try {
      await createReview({
        mentor_id: mentorId,
        mentee_id: menteeId,
        session_id: sessionId,
        rating,
        feedback: feedback.trim() || undefined
      });

      toast.success('Review submitted successfully');
      setRating(0);
      setFeedback('');
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Rate your session with {mentorName}
      </h3>
      
      <form onSubmit={handleSubmitReview}>
        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-2">How would you rate this session?</p>
          <div className="flex gap-1">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              
              return (
                <button
                  type="button"
                  key={ratingValue}
                  className={`text-2xl focus:outline-none transition-colors ${
                    ratingValue <= (hover || rating)
                      ? 'text-yellow-500'
                      : 'text-gray-300'
                  }`}
                  onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`Rate ${ratingValue} out of 5 stars`}
                >
                  <FaStar />
                </button>
              );
            })}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select a rating'}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            Share your feedback (optional)
          </label>
          <textarea
            id="feedback"
            className="w-full rounded-lg border border-gray-200 p-3 focus:border-indigo-500 focus:ring-indigo-500"
            rows={4}
            placeholder="What did you like about this session? What could be improved?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-lg ${
              isSubmitting || rating === 0
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:bg-indigo-700'
            } transition-colors`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SessionReview;