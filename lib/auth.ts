import { supabase } from './supabaseClient';

// Sign up new user
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Error during sign up:', error.message);
    return { error: error.message };
  }

  return { user: data.user };
};

// Log in user
export const logIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error during login:', error.message);
    return { error: error.message };
  }

  return { user: data.user };
};

// Log out user
export const logOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error during logout:', error.message);
  }
};

// Get currently logged-in user
export const getUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user;
};

// Get user session
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Watch for auth changes (e.g., login, logout)
export const onAuthStateChange = (callback: (session: any) => void) => {
  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session);
  });
  return authListener;
};
