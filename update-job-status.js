/**
 * Update Job Status to Completed
 * This script helps update your job status so the payment button appears
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8000/api';
const JOB_ID = '68f472c84fbe669c8494aad0'; // Your job ID from the logs

/**
 * Update job status to completed
 */
async function updateJobStatus() {
  try {
    console.log('🔄 Updating job status to completed...');
    console.log(`Job ID: ${JOB_ID}`);
    
    // You'll need to get your auth token from the app
    // Check the network requests in your browser/app to get the token
    const authToken = 'YOUR_AUTH_TOKEN_HERE'; // Replace with your actual token
    
    const response = await axios.put(`${API_BASE_URL}/jobs/${JOB_ID}/status`, {
      jobStatus: 'completed'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Job status updated successfully!');
    console.log('New status:', response.data.data.jobStatus);
    console.log('\n🎉 Now restart your frontend app and check the Status tab!');
    
  } catch (error) {
    console.log('❌ Error updating job status:', error.message);
    
    if (error.response?.data?.message) {
      console.log('Details:', error.response.data.message);
    }
    
    console.log('\n💡 Manual Solutions:');
    console.log('1. Update directly in your database:');
    console.log('   - Find the job with ID: 68f472c84fbe669c8494aad0');
    console.log('   - Change jobStatus field to "completed"');
    console.log('\n2. Or use your app to update the status');
    console.log('3. Or check if there\'s an admin panel in your backend');
  }
}

/**
 * Check current job status
 */
async function checkJobStatus() {
  try {
    console.log('🔍 Checking current job status...');
    
    const response = await axios.get(`${API_BASE_URL}/jobs/${JOB_ID}`);
    const job = response.data.data;
    
    console.log('📋 Current Job Details:');
    console.log(`   ID: ${job._id}`);
    console.log(`   Name: ${job.name}`);
    console.log(`   Status: "${job.jobStatus}"`);
    console.log(`   Budget: ₹${job.budget}`);
    
    if (job.jobStatus === 'completed') {
      console.log('✅ Job is already completed!');
      console.log('💡 If payment button still not showing, restart your frontend app');
    } else {
      console.log('❌ Job is not completed yet');
      console.log('💡 Need to update job status to "completed"');
    }
    
  } catch (error) {
    console.log('❌ Error checking job status:', error.message);
  }
}

// Main function
async function main() {
  console.log('🚀 Job Status Update Tool\n');
  
  // Check current status first
  await checkJobStatus();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Try to update status
  await updateJobStatus();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Update job status to "completed" (see solutions above)');
  console.log('2. Restart your frontend app: npm start -- --reset-cache');
  console.log('3. Go to Status tab → My Post');
  console.log('4. Look for the green "Pay Now" button');
}

// Run the script
main().catch(console.error);
