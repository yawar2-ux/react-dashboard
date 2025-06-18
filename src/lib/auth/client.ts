'use client';

import type { User } from '@/types/user';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';
const LOGIN_ENDPOINT = '/rag_doc/login';

// User object for default values
const defaultUser = {
  id: 'current-user',
  avatar: '/assets/avatar.png',
  firstName: 'User',
  lastName: 'Name',
  email: 'user@example.com',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  username: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/rag_doc/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.detail || 'Registration failed' };
      }

      // If registration is successful and returns tokens, store them
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
      }

      return {};
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'Failed to connect to the server' };
    }
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { username, password } = params;

    try {
      const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.detail || 'Login failed' };
      }

      // Store the received tokens
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      return {};
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Failed to connect to the server' };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      return { data: null };
    }

    try {
      // In a real app, you might want to validate the token with your backend
      // or decode it to get user information
      // For now, we'll just return the default user
      return { data: { ...defaultUser } };
    } catch (error) {
      console.error('Error getting user:', error);
      return { error: 'Failed to fetch user data' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    // Clear all auth-related items from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    return {};
  }
}

export const authClient = new AuthClient();
