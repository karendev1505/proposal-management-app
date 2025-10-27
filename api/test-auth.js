const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testAuth() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123'
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
    console.log('✅ Registration successful');
    console.log('User:', registerResponse.data.user);
    console.log('Access Token:', registerResponse.data.accessToken ? 'Present' : 'Missing');
    console.log('Refresh Token:', registerResponse.data.refreshToken ? 'Present' : 'Missing');
    console.log('');

    // Test 2: Login with credentials
    console.log('2. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.user);
    console.log('Access Token:', loginResponse.data.accessToken ? 'Present' : 'Missing');
    console.log('');

    // Test 3: Test protected route with access token
    console.log('3. Testing protected route...');
    const accessToken = loginResponse.data.accessToken;
    const profileResponse = await axios.post(`${API_BASE}/auth/me`, {}, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('✅ Protected route accessible');
    console.log('Profile:', profileResponse.data);
    console.log('');

    // Test 4: Test refresh token
    console.log('4. Testing refresh token...');
    const refreshToken = loginResponse.data.refreshToken;
    const refreshResponse = await axios.post(`${API_BASE}/auth/refresh`, {
      refreshToken: refreshToken
    });
    console.log('✅ Refresh token successful');
    console.log('New Access Token:', refreshResponse.data.accessToken ? 'Present' : 'Missing');
    console.log('');

    // Test 5: Test logout
    console.log('5. Testing logout...');
    const logoutResponse = await axios.post(`${API_BASE}/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('✅ Logout successful');
    console.log('Response:', logoutResponse.data);
    console.log('');

    console.log('🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAuth();
