// services/achievementService.ts
import { supabase } from '../../lib/supabaseClient';

// Types for achievements data
export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  date?: string;
  progress?: number;
  user_id: string;
  role: 'mentor' | 'mentee';
}

export interface MentorStats {
  sessionsCompleted: number;
  hoursMentored: number;
  menteesHelped: number;
  averageRating: number;
}

export interface MenteeStats {
  sessionsAttended: number;
  hoursLearned: number;
  projectsCompleted: number;
  skillsImproved: number;
}

export interface Skill {
  id: number;
  name: string;
  progress: number;
  user_id: string;
}

export interface Goal {
  id: number;
  title: string;
  completed: boolean;
  user_id: string;
}

export interface MentorFeedback {
  id: number;
  mentor_name: string;
  mentor_id: string;
  mentee_id: string;
  text: string;
  rating: number;
  date: string;
}

export interface RecommendedGoal {
  id: number;
  title: string;
  description: string;
  action_text: string;
  action_url: string;
  role: 'mentor' | 'mentee';
}

// Fetch a user's achievements
export const fetchUserAchievements = async (userId: string, role: 'mentor' | 'mentee'): Promise<Achievement[]> => {
  if (!userId) {
    console.warn('fetchUserAchievements called without a valid userId');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role)
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Supabase error fetching achievements:', error.message || error);
      return [];
    }
    return data || [];
  } catch (error: any) {
    console.error('Error fetching achievements:', error.message || error);
    return [];
  }
};

// Fetch mentor stats
export const fetchMentorStats = async (mentorId: string): Promise<MentorStats> => {
  if (!mentorId) {
    console.warn('fetchMentorStats called without a valid mentorId');
    return { sessionsCompleted: 0, hoursMentored: 0, menteesHelped: 0, averageRating: 0 };
  }

  try {
    const { data, error, status } = await supabase
      .from('mentor_stats')
      .select('*')
      .eq('mentor_id', mentorId)
      .maybeSingle();

    if (error && status !== 406) {
      // 406 indicates no rows found, treat as empty stats
      throw error;
    }

    if (!data) {
      console.warn(`No mentor_stats record found for mentor_id=${mentorId}`);
      return { sessionsCompleted: 0, hoursMentored: 0, menteesHelped: 0, averageRating: 0 };
    }

    return {
      sessionsCompleted: data.sessions_completed ?? 0,
      hoursMentored: data.hours_mentored ?? 0,
      menteesHelped: data.mentees_helped ?? 0,
      averageRating: data.average_rating ?? 0,
    };
  } catch (err: any) {
    console.error('Error fetching mentor stats:', err.message || err);
    return { sessionsCompleted: 0, hoursMentored: 0, menteesHelped: 0, averageRating: 0 };
  }
};

// Fetch mentee stats
export const fetchMenteeStats = async (menteeId: string): Promise<MenteeStats> => {
  try {
    const { data, error } = await supabase
      .from('mentee_stats')
      .select('*')
      .eq('mentee_id', menteeId)
      .single();
      
    if (error) throw error;
    
    return {
      sessionsAttended: data?.sessions_attended || 0,
      hoursLearned: data?.hours_learned || 0,
      projectsCompleted: data?.projects_completed || 0,
      skillsImproved: data?.skills_improved || 0,
    };
  } catch (error) {
    console.error('Error fetching mentee stats:', error);
    return {
      sessionsAttended: 0,
      hoursLearned: 0,
      projectsCompleted: 0,
      skillsImproved: 0,
    };
  }
};

// Fetch user skills
export const fetchUserSkills = async (userId: string): Promise<Skill[]> => {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
};

// Fetch user goals
export const fetchUserGoals = async (userId: string): Promise<Goal[]> => {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
};

// Add a new goal
export const addUserGoal = async (userId: string, title: string): Promise<Goal | null> => {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .insert([
        { user_id: userId, title, completed: false }
      ])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding goal:', error);
    return null;
  }
};

// Update a goal's completion status
export const updateGoalStatus = async (goalId: number, completed: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_goals')
      .update({ completed })
      .eq('id', goalId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating goal:', error);
  }
};

// Fetch feedback for a mentee
export const fetchMenteeFeedback = async (menteeId: string): Promise<MentorFeedback[]> => {
  try {
    const { data, error } = await supabase
      .from('mentor_feedback')
      .select('*, mentors(name)')
      .eq('mentee_id', menteeId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to match our interface
    return (data || []).map(item => ({
      id: item.id,
      mentor_name: item.mentors?.name || 'Unknown Mentor',
      mentor_id: item.mentor_id,
      mentee_id: item.mentee_id,
      text: item.text,
      rating: item.rating,
      date: new Date(item.date).toLocaleDateString(),
    }));
  } catch (error) {
    console.error('Error fetching mentor feedback:', error);
    return [];
  }
};

// Fetch recommended goals
export const fetchRecommendedGoals = async (role: 'mentor' | 'mentee'): Promise<RecommendedGoal[]> => {
  try {
    const { data, error } = await supabase
      .from('recommended_goals')
      .select('*')
      .eq('role', role)
      .order('id', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recommended goals:', error);
    return [];
  }
};