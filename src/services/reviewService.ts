import { supabase } from '../lib/supabaseClient';

// Types
interface ReviewData {
  mentor_id: string;
  mentee_id: string;
  session_id: string;
  rating: number;
  feedback?: string;
}

// Create a new review
export async function createReview(data: ReviewData) {
  const { data: review, error } = await supabase
    .from('mentor_reviews')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw error;
  }

  return review;
}

// Get reviews for a mentor
export async function getMentorReviews(mentorId: string) {
  if (!mentorId) {
    const error = new Error('Mentor ID is required');
    console.error('Error fetching mentor reviews: Missing mentorId parameter');
    throw error;
  }
  
  try {
    // First, let's query just the reviews to avoid column naming issues
    const { data, error } = await supabase
      .from('mentor_reviews')
      .select(`
        *,
        mentees:mentee_id(id, name, profile_image_url)
      `)
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mentor reviews:', error.message);
      throw error;
    }

    // If we successfully get the reviews, let's fetch the session details separately
    if (data && data.length > 0) {
      // Get unique session IDs from reviews
      const sessionIds = [...new Set(data.map(review => review.session_id))];
      
      // Fetch session details if we have session IDs
      if (sessionIds.length > 0) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('mentoring_sessions')
          .select('id, name, session_title, start_time')
          .in('id', sessionIds);

        if (!sessionError && sessionData) {
          // Create a lookup map of sessions
          const sessionsMap = sessionData.reduce((map: Record<string, any>, session) => {
            map[session.id] = session;
            return map;
          }, {});
          
          // Add session data to each review
          data.forEach(review => {
            review.session = sessionsMap[review.session_id] || null;
          });
        }
      }
    }

    return data || [];
  } catch (err) {
    // More detailed error logging
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Error fetching mentor reviews for mentor ${mentorId}:`, errorMessage, err);
    throw err;
  }
}

// Check if a mentee has reviewed a specific session
export async function hasReviewedSession(menteeId: string, sessionId: string) {
  const { count, error } = await supabase
    .from('mentor_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('mentee_id', menteeId)
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error checking if session was reviewed:', error);
    throw error;
  }

  return (count || 0) > 0;
}

// Get review statistics for a mentor
export async function getMentorReviewStats(mentorId: string) {
  // Get average rating and count of reviews
  const { data: stats, error: statsError } = await supabase
    .rpc('get_mentor_stats', { mentor_id: mentorId });

  if (statsError) {
    console.error('Error fetching mentor stats:', statsError);
    throw statsError;
  }

  // Get count of reviews by rating
  const { data: reviewsByRating, error: ratingsError } = await supabase
    .from('mentor_reviews')
    .select('rating')
    .eq('mentor_id', mentorId);

  if (ratingsError) {
    console.error('Error fetching reviews by rating:', ratingsError);
    throw ratingsError;
  }

  // Count reviews by rating
  const ratingCounts = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  reviewsByRating?.forEach((review) => {
    ratingCounts[review.rating as keyof typeof ratingCounts]++;
  });

  return {
    average: Number(stats?.avg_rating || 0),
    totalCount: Number(stats?.total_reviews || 0),
    ratingCounts,
    totalSessions: Number(stats?.total_sessions || 0),
    completedSessions: Number(stats?.completed_sessions || 0)
  };
}

// Update a review
export async function updateReview(reviewId: string, updates: Partial<Omit<ReviewData, 'mentor_id' | 'mentee_id' | 'session_id'>>) {
  const { data, error } = await supabase
    .from('mentor_reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating review:', error);
    throw error;
  }

  return data;
}

// Delete a review (rarely needed, but available)
export async function deleteReview(reviewId: string) {
  const { error } = await supabase
    .from('mentor_reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error('Error deleting review:', error);
    throw error;
  }

  return true;
}