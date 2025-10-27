// Mock API for development when backend is not available
export const authApi = {
  register: async (name: string, email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful registration
    return {
      user: {
        id: 'mock-user-id',
        email,
        name,
        role: 'USER'
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    };
  },

  login: async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    return {
      user: {
        id: 'mock-user-id',
        email,
        name: 'Mock User',
        role: 'USER'
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    };
  },

  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Logged out successfully' };
  },

  getProfile: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      user: {
        id: 'mock-user-id',
        email: 'user@example.com',
        name: 'Mock User',
        role: 'USER'
      }
    };
  },

  refreshToken: async (refreshToken: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token'
    };
  }
};
