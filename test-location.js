// Test file to verify location and authentication
const axios = require('axios');

const API_BASE_URL = 'http://192.168.0.125:8000/api';

// Test authentication
async function testAuth() {
  try {
    console.log('Testing authentication...');
    const response = await axios.get(`${API_BASE_URL}/jobs`);
    console.log('Auth test successful:', response.status);
    return true;
  } catch (error) {
    console.log('Auth test failed:', error.response?.status);
    return false;
  }
}

// Test location update
async function testLocationUpdate() {
  try {
    console.log('Testing location update...');
    const locationData = {
      location: {
        coordinates: {
          type: "Point",
          coordinates: [76.377494, 10.0000325] // [lng, lat]
        },
        address: "Infopark Road",
        city: "Kakkanad",
        state: "Kerala",
        country: "India",
        zipCode: "682303"
      }
    };
    
    console.log('Location payload:', JSON.stringify(locationData, null, 2));
    
    // Note: This will fail without authentication, but we can see the format
    const response = await axios.put(`${API_BASE_URL}/users/update-user-location`, locationData);
    console.log('Location update successful:', response.status);
    return true;
  } catch (error) {
    console.log('Location update failed:', error.response?.status);
    console.log('Error details:', error.response?.data);
    return false;
  }
}

// Test nearby jobs
async function testNearbyJobs() {
  try {
    console.log('Testing nearby jobs...');
    const response = await axios.get(`${API_BASE_URL}/jobs/nearby-jobs?radius=10`);
    console.log('Nearby jobs successful:', response.status);
    console.log('Jobs found:', response.data?.data?.length || 0);
    return true;
  } catch (error) {
    console.log('Nearby jobs failed:', error.response?.status);
    console.log('Error details:', error.response?.data);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('=== Starting Tests ===');
  
  const authResult = await testAuth();
  console.log('Auth result:', authResult);
  
  const locationResult = await testLocationUpdate();
  console.log('Location update result:', locationResult);
  
  const nearbyResult = await testNearbyJobs();
  console.log('Nearby jobs result:', nearbyResult);
  
  console.log('=== Tests Complete ===');
}

runTests().catch(console.error); 