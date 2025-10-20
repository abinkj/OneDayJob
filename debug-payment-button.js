/**
 * Debug Payment Button Issue
 * This script helps identify why the "Pay Now" button is not showing
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Debug a specific job to see why payment button is not showing
 */
async function debugJob(jobId) {
  try {
    console.log(`🔍 Debugging job: ${jobId}\n`);
    
    // Get job details
    const jobResponse = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);
    const job = jobResponse.data.data;
    
    console.log('📋 JOB DETAILS:');
    console.log(`   ID: ${job._id}`);
    console.log(`   Name: ${job.name}`);
    console.log(`   Status: "${job.jobStatus}"`);
    console.log(`   Budget: ₹${job.budget}`);
    console.log(`   User ID: ${job.userId}`);
    console.log(`   Created: ${new Date(job.createdAt).toLocaleString()}`);
    
    // Check payment status
    try {
      const paymentResponse = await axios.get(`${API_BASE_URL}/payments/status/${jobId}`);
      const paymentStatus = paymentResponse.data.data;
      
      console.log('\n💳 PAYMENT STATUS:');
      console.log(`   Has Paid: ${paymentStatus.hasPaid}`);
      console.log(`   Can Pay: ${paymentStatus.canPay}`);
      console.log(`   Job Status: "${paymentStatus.jobStatus}"`);
      if (paymentStatus.reason) {
        console.log(`   Reason: ${paymentStatus.reason}`);
      }
    } catch (error) {
      console.log('\n❌ PAYMENT STATUS ERROR:');
      console.log(`   ${error.response?.data?.message || error.message}`);
    }
    
    // Analyze the issue
    console.log('\n🔍 ANALYSIS:');
    
    const isCompleted = job.jobStatus?.toLowerCase() === 'completed';
    console.log(`   Job Status is "completed": ${isCompleted}`);
    
    if (!isCompleted) {
      console.log(`   ❌ ISSUE: Job status is "${job.jobStatus}" but needs to be "completed"`);
      console.log('   💡 SOLUTION: Update job status to "completed"');
      
      // Show how to fix it
      console.log('\n🛠️  HOW TO FIX:');
      console.log('   Option 1: Update via API:');
      console.log(`   curl -X PUT ${API_BASE_URL}/jobs/${jobId}/status \\`);
      console.log('     -H "Content-Type: application/json" \\');
      console.log('     -d \'{"jobStatus": "completed"}\'');
      
      console.log('\n   Option 2: Update in database:');
      console.log('   Set jobStatus field to "completed" in your database');
      
      console.log('\n   Option 3: Use this script to auto-fix:');
      console.log('   Uncomment the line below to auto-update job status');
      console.log('   // await updateJobStatusToCompleted(jobId);');
    } else {
      console.log('   ✅ Job status is correct');
    }
    
    return { job, isCompleted };
    
  } catch (error) {
    console.log('❌ Error debugging job:', error.message);
    if (error.response?.data?.message) {
      console.log('   Details:', error.response.data.message);
    }
    return null;
  }
}

/**
 * Update job status to completed
 */
async function updateJobStatusToCompleted(jobId) {
  try {
    console.log(`🔄 Updating job status to completed...`);
    const response = await axios.put(`${API_BASE_URL}/jobs/${jobId}/status`, {
      jobStatus: 'completed'
    });
    
    console.log('✅ Job status updated successfully');
    console.log('   New status:', response.data.data.jobStatus);
    return true;
  } catch (error) {
    console.log('❌ Error updating job status:', error.message);
    if (error.response?.data?.message) {
      console.log('   Details:', error.response.data.message);
    }
    return false;
  }
}

/**
 * List all jobs for a user to help find the right job ID
 */
async function listUserJobs(userId) {
  try {
    console.log(`📋 Listing jobs for user: ${userId}\n`);
    const response = await axios.get(`${API_BASE_URL}/jobs/user/${userId}`);
    const jobs = response.data.data || [];
    
    console.log(`Found ${jobs.length} jobs:\n`);
    
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.name}`);
      console.log(`   ID: ${job._id}`);
      console.log(`   Status: "${job.jobStatus}"`);
      console.log(`   Budget: ₹${job.budget}`);
      console.log(`   Created: ${new Date(job.createdAt).toLocaleDateString()}`);
      console.log('');
    });
    
    return jobs;
  } catch (error) {
    console.log('❌ Error listing jobs:', error.message);
    return [];
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Payment Button Debug Tool\n');
  
  // Check if backend is running
  try {
    await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend is running\n');
  } catch (error) {
    console.log('❌ Backend is not running');
    console.log('💡 Start your backend: cd onedayjob-api && npm start\n');
    return;
  }
  
  // Get job ID from command line or use a placeholder
  const jobId = process.argv[2];
  
  if (!jobId || jobId === 'YOUR_JOB_ID') {
    console.log('⚠️  Please provide a job ID');
    console.log('Usage: node debug-payment-button.js YOUR_JOB_ID');
    console.log('\n💡 To find your job ID:');
    console.log('1. Go to your app → Status tab → My Post');
    console.log('2. Look at the URL or check the network requests');
    console.log('3. Or use the backend API to list your jobs');
    return;
  }
  
  // Debug the specific job
  const result = await debugJob(jobId);
  
  if (result && !result.isCompleted) {
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Update the job status to "completed" (see options above)');
    console.log('2. Restart your frontend app');
    console.log('3. Go to Status tab → My Post');
    console.log('4. Look for the green "Pay Now" button');
    
    // Uncomment the line below to auto-fix the job status
    // await updateJobStatusToCompleted(jobId);
  } else if (result && result.isCompleted) {
    console.log('\n✅ Job status is correct');
    console.log('💡 If payment button still not showing, check:');
    console.log('   - Frontend app is restarted');
    console.log('   - showPaymentButton is true');
    console.log('   - isEmployer is true');
    console.log('   - No console errors');
  }
}

// Run the debug tool
main().catch(console.error);
