/**
 * Test Automatic Job Completion
 * This script tests the fixed automatic job completion logic
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8000/api';
const JOB_ID = '68f472c84fbe669c8494aad0'; // Your job ID

/**
 * Test the automatic job completion
 */
async function testAutoCompletion() {
  try {
    console.log('🚀 Testing Automatic Job Completion\n');
    console.log(`Job ID: ${JOB_ID}\n`);
    
    // Step 1: Check current job status
    console.log('📋 Step 1: Checking current job status...');
    const jobResponse = await axios.get(`${API_BASE_URL}/jobs/${JOB_ID}`);
    const job = jobResponse.data.data;
    
    console.log(`   Current Status: "${job.jobStatus}"`);
    console.log(`   Job Name: ${job.name}`);
    console.log(`   Budget: ₹${job.budget}\n`);
    
    // Step 2: Trigger completion check
    console.log('🔍 Step 2: Triggering completion check...');
    console.log('   This will check if all workers are done and update status automatically\n');
    
    // You'll need to get your auth token from the app
    const authToken = 'YOUR_AUTH_TOKEN_HERE'; // Replace with your actual token
    
    try {
      const completionResponse = await axios.post(`${API_BASE_URL}/jobs/${JOB_ID}/check-completion`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Completion check successful!');
      console.log(`   Message: ${completionResponse.data.message}`);
      console.log(`   New Status: ${completionResponse.data.data.status}\n`);
      
    } catch (error) {
      console.log('❌ Completion check failed:');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
      
      console.log('💡 Manual Solutions:');
      console.log('1. Get your auth token from the app (check network requests)');
      console.log('2. Update the authToken variable in this script');
      console.log('3. Or update job status directly in database to "completed"');
      console.log('4. Or restart your backend server to apply the fixes\n');
    }
    
    // Step 3: Check final status
    console.log('📊 Step 3: Checking final job status...');
    const finalJobResponse = await axios.get(`${API_BASE_URL}/jobs/${JOB_ID}`);
    const finalJob = finalJobResponse.data.data;
    
    console.log(`   Final Status: "${finalJob.jobStatus}"`);
    
    if (finalJob.jobStatus === 'completed') {
      console.log('✅ SUCCESS: Job is now completed!');
      console.log('🎉 Payment button should now appear in your frontend app!');
    } else {
      console.log('❌ Job is still not completed');
      console.log('💡 You may need to manually update the job status');
    }
    
  } catch (error) {
    console.log('❌ Error testing auto completion:', error.message);
    
    if (error.response?.data?.message) {
      console.log('Details:', error.response.data.message);
    }
  }
}

/**
 * Check if backend is running
 */
async function checkBackend() {
  try {
    console.log('🔍 Checking if backend is running...');
    await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend is running\n');
    return true;
  } catch (error) {
    console.log('❌ Backend is not running');
    console.log('💡 Start your backend: cd onedayjob-api && npm start\n');
    return false;
  }
}

// Main function
async function main() {
  console.log('🔧 Automatic Job Completion Test\n');
  
  const backendRunning = await checkBackend();
  if (!backendRunning) {
    return;
  }
  
  await testAutoCompletion();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. If job status is now "completed", restart your frontend app');
  console.log('2. Go to Status tab → My Post');
  console.log('3. Look for the green "Pay Now" button');
  console.log('4. Test the payment flow');
  
  console.log('\n💡 If still not working:');
  console.log('- Check the backend logs for completion messages');
  console.log('- Verify all worker sessions are "completed"');
  console.log('- Manually update job status if needed');
}

// Run the test
main().catch(console.error);
