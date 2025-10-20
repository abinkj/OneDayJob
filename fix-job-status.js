/**
 * Fix Job Status Mismatch
 * This script fixes the job status mismatch between frontend and backend
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8000/api';
const JOB_ID = '68d821a14944268ce6d85a41'; // Your job ID from the debug log

/**
 * Fix the job status mismatch
 */
async function fixJobStatus() {
  try {
    console.log('🔧 Fixing Job Status Mismatch\n');
    console.log(`Job ID: ${JOB_ID}\n`);
    
    // Step 1: Check current job status
    console.log('📋 Step 1: Checking current job status...');
    const jobResponse = await axios.get(`${API_BASE_URL}/jobs/${JOB_ID}`);
    const job = jobResponse.data.data;
    
    console.log(`   Current Status: "${job.jobStatus}"`);
    console.log(`   Job Name: ${job.name}`);
    console.log(`   Budget: ₹${job.budget}`);
    console.log(`   User ID: ${job.userId}\n`);
    
    // Step 2: Check worker sessions
    console.log('👥 Step 2: Checking worker sessions...');
    try {
      const sessionsResponse = await axios.get(`${API_BASE_URL}/job-timer/jobs/${JOB_ID}/sessions`);
      const sessions = sessionsResponse.data.data || [];
      
      console.log(`   Total Sessions: ${sessions.length}`);
      sessions.forEach((session, index) => {
        console.log(`   Session ${index + 1}: ${session.sessionStatus} (${session.totalWorkedSeconds}s)`);
      });
      
      const allCompleted = sessions.every(session => session.sessionStatus === 'completed');
      console.log(`   All Workers Completed: ${allCompleted}\n`);
      
      if (allCompleted && job.jobStatus !== 'completed') {
        console.log('🔍 ISSUE FOUND: All workers completed but job status is not "completed"');
        console.log('💡 This is why the payment button is not showing\n');
      }
      
    } catch (error) {
      console.log('   Could not fetch sessions:', error.message);
    }
    
    // Step 3: Try to trigger completion check
    console.log('🔄 Step 3: Triggering completion check...');
    try {
      // You'll need to get your auth token from the app
      const authToken = 'YOUR_AUTH_TOKEN_HERE'; // Replace with your actual token
      
      const completionResponse = await axios.post(`${API_BASE_URL}/jobs/${JOB_ID}/check-completion`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Completion check successful!');
      console.log(`   Message: ${completionResponse.data.message}\n`);
      
    } catch (error) {
      console.log('❌ Completion check failed:');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
      
      console.log('💡 Manual Solutions:');
      console.log('1. Get your auth token from the app (check network requests)');
      console.log('2. Update the authToken variable in this script');
      console.log('3. Or update job status directly in database to "completed"');
      console.log('4. Or use the direct API call below\n');
      
      console.log('🔧 Direct API Call (replace YOUR_TOKEN):');
      console.log(`curl -X PUT ${API_BASE_URL}/jobs/${JOB_ID}/status \\`);
      console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log('  -d \'{"jobStatus": "completed"}\'\n');
    }
    
    // Step 4: Check final status
    console.log('📊 Step 4: Checking final job status...');
    const finalJobResponse = await axios.get(`${API_BASE_URL}/jobs/${JOB_ID}`);
    const finalJob = finalJobResponse.data.data;
    
    console.log(`   Final Status: "${finalJob.jobStatus}"`);
    
    if (finalJob.jobStatus === 'completed') {
      console.log('✅ SUCCESS: Job is now completed!');
      console.log('🎉 Payment button should now appear in your frontend app!');
    } else {
      console.log('❌ Job is still not completed');
      console.log('💡 You need to manually update the job status');
    }
    
  } catch (error) {
    console.log('❌ Error fixing job status:', error.message);
    
    if (error.response?.data?.message) {
      console.log('Details:', error.response.data.message);
    }
    
    console.log('\n💡 Quick Fix Options:');
    console.log('1. Update job status in database to "completed"');
    console.log('2. Get auth token and use the API call above');
    console.log('3. Check if backend is running properly');
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
    console.log('❌ Backend is not running or not accessible');
    console.log('💡 Make sure backend is running: npm run dev\n');
    return false;
  }
}

// Main function
async function main() {
  console.log('🔧 Job Status Fix Tool\n');
  
  const backendRunning = await checkBackend();
  if (!backendRunning) {
    return;
  }
  
  await fixJobStatus();
  
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

// Run the fix
main().catch(console.error);
