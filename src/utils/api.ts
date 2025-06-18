import axios, { AxiosError } from 'axios';

// Define the base URL for your API
const API_URL = 'http://127.0.0.1:8000/api/users/';

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Register user
export const registerUser = async (data: { username: string; email: string; password: string }) => {
  try {
    const response = await api.post('register/', data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

// Login user
export const loginUser = async (data: { username: string; password: string }) => {
  try {
    const response = await api.post('login/', data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

// Get list of mentors (requires a valid token)
export const getMentors = async (token: string) => {
  try {
    const response = await api.get('mentors/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

// You can add more API functions as needed (e.g., mentee list, session creation)
