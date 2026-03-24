import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const ProgressContext = createContext();
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');
const AUTH_TOKEN_KEY = 'students_tracker_auth_token';
const PROFILE_SETUP_PENDING_KEY = 'students_tracker_profile_setup_pending';

// eslint-disable-next-line react-refresh/only-export-components
export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const [user, setUser] = useState({ name: '' });
  const [goals, setGoals] = useState({}); // { "YYYY-MM-DD": [{ id, text }] }
  const [reflections, setReflections] = useState({}); // { "YYYY-MM-DD": { goals: [{ goalId, text, hours }], extra: { text, hours } } }
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY) || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileSetupPending, setProfileSetupPending] = useState(
    () => localStorage.getItem(PROFILE_SETUP_PENDING_KEY) === '1'
  );
  const didHydrateFromServer = useRef(false);

  const setProfileSetupFlag = (isPending) => {
    if (isPending) {
      localStorage.setItem(PROFILE_SETUP_PENDING_KEY, '1');
      setProfileSetupPending(true);
      return;
    }

    localStorage.removeItem(PROFILE_SETUP_PENDING_KEY);
    setProfileSetupPending(false);
  };

  const getAuthHeaders = () => {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if (!authToken) return {};
    return { Authorization: `Bearer ${authToken}` };
  };

  const persistToken = (nextToken) => {
    if (nextToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
      setToken(nextToken);
      return;
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken('');
  };

  const loadStateFromBackend = async (authToken) => {
    const response = await fetch(`${API_BASE_URL}/api/state`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch initial state from backend.');
    }

    const data = await response.json();
    setUser(data.user || { name: '' });
    setGoals(data.goals || {});
    setReflections(data.reflections || {});
    setStreak(data.streak || { currentStreak: 0, longestStreak: 0 });
    didHydrateFromServer.current = true;
  };

  const completeAuthSession = async (authPayload) => {
    const nextToken = authPayload?.token || '';
    const nextUser = authPayload?.user || { name: '' };

    if (!nextToken) {
      throw new Error('Invalid auth response. Missing token.');
    }

    persistToken(nextToken);
    setUser(nextUser);
    setIsAuthenticated(true);
    await loadStateFromBackend(nextToken);
  };

  const signup = async ({ name, email, password }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed.');
    }

    setProfileSetupFlag(true);
    await completeAuthSession(data);
  };

  const login = async ({ email, password }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed.');
    }

    await completeAuthSession(data);
  };

  const forgotPassword = async ({ email, newPassword }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Unable to reset password.');
    }

    return data;
  };

  const loginWithGoogle = async ({ credential, mode }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, mode }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Google authentication failed.');
    }

    if (mode === 'signup') {
      setProfileSetupFlag(true);
    }
    await completeAuthSession(data);
  };

  const completeProfileSetup = async ({ role, campus }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile-setup`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ role, campus }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save role and campus.');
    }

    setUser(data.user || { name: '' });
    setProfileSetupFlag(false);
  };

  const getMentorStudents = async () => {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if (!authToken) {
      throw new Error('Authentication required.');
    }

    const response = await fetch(`${API_BASE_URL}/api/mentor/students`, {
      cache: 'no-store',
      headers: {
        ...getAuthHeaders(),
        'Cache-Control': 'no-cache',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch students.');
    }

    return data;
  };

  const getMentorStudentState = async (studentId) => {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if (!authToken) {
      throw new Error('Authentication required.');
    }

    const response = await fetch(`${API_BASE_URL}/api/mentor/students/${studentId}/state`, {
      cache: 'no-store',
      headers: {
        ...getAuthHeaders(),
        'Cache-Control': 'no-cache',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch student details.');
    }

    return data;
  };

  const getMentorStudentFeedback = async (studentId) => {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if (!authToken) {
      throw new Error('Authentication required.');
    }

    const response = await fetch(`${API_BASE_URL}/api/mentor/students/${studentId}/feedback`, {
      cache: 'no-store',
      headers: {
        ...getAuthHeaders(),
        'Cache-Control': 'no-cache',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch student feedback.');
    }

    return data;
  };

  const getMentorStudentAiFeedback = async (studentId) => {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if (!authToken) {
      throw new Error('Authentication required.');
    }

    const response = await fetch(`${API_BASE_URL}/api/mentor/students/${studentId}/ai-feedback`, {
      cache: 'no-store',
      headers: {
        ...getAuthHeaders(),
        'Cache-Control': 'no-cache',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch student AI feedback.');
    }

    return data;
  };

  const logout = () => {
    persistToken('');
    setIsAuthenticated(false);
    setUser({ name: '' });
    setGoals({});
    setReflections({});
    setStreak({ currentStreak: 0, longestStreak: 0 });
    didHydrateFromServer.current = false;
  };

  useEffect(() => {
    const controller = new AbortController();

    const bootstrap = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          signal: controller.signal,
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        });

        if (!meResponse.ok) {
          throw new Error('Session expired.');
        }

        const meData = await meResponse.json();
        setUser(meData.user || { name: '' });
        setIsAuthenticated(true);
        await loadStateFromBackend(token);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
        persistToken('');
        setIsAuthenticated(false);
        setUser({ name: '' });
        setGoals({});
        setReflections({});
        setStreak({ currentStreak: 0, longestStreak: 0 });
        didHydrateFromServer.current = false;
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrap();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    if (!didHydrateFromServer.current) return;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/state`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ user, goals, reflections }),
        });

        if (response.ok) {
          const data = await response.json();
          setStreak(data.streak || { currentStreak: 0, longestStreak: 0 });
        }
      } catch (error) {
        console.error(error);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [user, goals, reflections, isAuthenticated, token]);

  const addGoal = (dateKey, text) => {
    setGoals((prev) => {
      const dayGoals = prev[dateKey] || [];
      return {
        ...prev,
        [dateKey]: [...dayGoals, { id: Date.now().toString(), text }]
      };
    });
  };

  const deleteGoal = (dateKey, goalId) => {
    setGoals((prev) => {
      const dayGoals = prev[dateKey] || [];
      return {
        ...prev,
        [dateKey]: dayGoals.filter((g) => g.id !== goalId)
      };
    });
  };

  const updateGoal = (dateKey, goalId, updates) => {
    setGoals((prev) => {
      const dayGoals = prev[dateKey] || [];
      return {
        ...prev,
        [dateKey]: dayGoals.map((g) => g.id === goalId ? { ...g, ...updates } : g)
      };
    });
  };

  const updateReflection = (dateKey, newReflectionData) => {
    setReflections((prev) => ({
      ...prev,
      [dateKey]: newReflectionData
    }));
  };

  const getStudentFeedback = async () => {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if (!authToken) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to load feedback');
    }

    return response.json();
  };

  const getUnseenFeedbackCount = async () => {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if (!authToken) {
      return 0; // Return 0 if no token instead of making failed request
    }

    const response = await fetch(`${API_BASE_URL}/api/feedback/count/unseen`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to load unseen feedback count');
    }

    const data = await response.json();
    return data.unseenCount || 0;
  };

  const markFeedbackAsSeen = async (feedbackId) => {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if (!authToken) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/feedback/${feedbackId}/seen`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark feedback as seen');
    }

    return response.json();
  };

  const sendFeedbackToStudent = async (studentId, text) => {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if (!authToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ studentId, text }),
    });

    if (!response.ok) {
      throw new Error('Failed to send feedback');
    }

    return response.json();
  };

  const getAiFeedback = async () => {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if (!authToken) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/api/ai-feedback`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to load AI feedback');
    }

    return response.json();
  };

  const saveAiFeedback = async ({ dateKey, feedback }) => {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if (!authToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/ai-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ dateKey, feedback }),
    });

    if (!response.ok) {
      throw new Error('Failed to save AI feedback');
    }

    return response.json();
  };

  return (
    <ProgressContext.Provider value={{
      isAuthenticated,
      authLoading,
      signup,
      login,
      forgotPassword,
      loginWithGoogle,
      completeProfileSetup,
      getMentorStudents,
      getMentorStudentState,
      getMentorStudentFeedback,
      getMentorStudentAiFeedback,
      getStudentFeedback,
      getUnseenFeedbackCount,
      markFeedbackAsSeen,
      sendFeedbackToStudent,
      getAiFeedback,
      saveAiFeedback,
      profileSetupPending,
      logout,
      user, setUser,
      goals, addGoal, updateGoal, deleteGoal,
      reflections, updateReflection,
      streak
    }}>
      {children}
    </ProgressContext.Provider>
  );
};
