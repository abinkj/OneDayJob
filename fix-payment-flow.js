/**
 * Payment Flow Fix Script
 * This script helps debug and fix payment flow issues
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8000/api';
const TEST_JOB_ID = 'YOUR_JOB_ID_HERE'; // Replace with your actual job ID

/**
 * Check if backend is running
 */
async function checkBackendStatus() {
  try {
    console.log('🔍 Checking backend status...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend is running:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log('💡 Make sure your backend server is running on port 8000');
    return false;
  }
}

/**
 * Check job status
 */
async function checkJobStatus(jobId) {
  try {
    console.log(`🔍 Checking job status for job: ${jobId}`);
    const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);
    const job = response.data.data;
    
    console.log('📋 Job Details:');
    console.log(`   Name: ${job.name}`);
    console.log(`   Status: ${job.jobStatus}`);
    console.log(`   Budget: ₹${job.budget}`);
    console.log(`   Created: ${new Date(job.createdAt).toLocaleString()}`);
    
    if (job.jobStatus === 'completed') {
      console.log('✅ Job is completed - Payment button should appear');
    } else {
      console.log('⚠️  Job is not completed - Payment button will not appear');
      console.log('💡 Job status needs to be "completed" for payment to work');
    }
    
    return job;
  } catch (error) {
    console.log('❌ Error checking job status:', error.message);
    return null;
  }
}

/**
 * Check payment status for a job
 */
async function checkPaymentStatus(jobId) {
  try {
    console.log(`🔍 Checking payment status for job: ${jobId}`);
    const response = await axios.get(`${API_BASE_URL}/payments/status/${jobId}`);
    const paymentStatus = response.data.data;
    
    console.log('💳 Payment Status:');
    console.log(`   Has Paid: ${paymentStatus.hasPaid}`);
    console.log(`   Can Pay: ${paymentStatus.canPay}`);
    console.log(`   Job Status: ${paymentStatus.jobStatus}`);
    
    if (paymentStatus.reason) {
      console.log(`   Reason: ${paymentStatus.reason}`);
    }
    
    if (paymentStatus.canPay) {
      console.log('✅ Payment button should be visible');
    } else {
      console.log('❌ Payment button will not be visible');
    }
    
    return paymentStatus;
  } catch (error) {
    console.log('❌ Error checking payment status:', error.message);
    return null;
  }
}

/**
 * Update job status to completed (for testing)
 */
async function updateJobStatusToCompleted(jobId) {
  try {
    console.log(`🔄 Updating job status to completed for job: ${jobId}`);
    const response = await axios.put(`${API_BASE_URL}/jobs/${jobId}/status`, {
      jobStatus: 'completed'
    });
    
    console.log('✅ Job status updated to completed');
    return true;
  } catch (error) {
    console.log('❌ Error updating job status:', error.message);
    return false;
  }
}

/**
 * Main function to run all checks
 */
async function runPaymentFlowDiagnostics() {
  console.log('🚀 Starting Payment Flow Diagnostics...\n');
  
  // Step 1: Check backend
  const backendRunning = await checkBackendStatus();
  if (!backendRunning) {
    console.log('\n❌ Cannot proceed - Backend is not running');
    console.log('💡 Start your backend server first: cd onedayjob-api && npm start');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Step 2: Check job status
  if (TEST_JOB_ID === 'YOUR_JOB_ID_HERE') {
    console.log('⚠️  Please update TEST_JOB_ID with your actual job ID');
    console.log('💡 Replace "YOUR_JOB_ID_HERE" with your job ID from the app');
    return;
  }
  
  const job = await checkJobStatus(TEST_JOB_ID);
  if (!job) {
    console.log('❌ Cannot proceed - Job not found');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Step 3: Check payment status
  const paymentStatus = await checkPaymentStatus(TEST_JOB_ID);
  if (!paymentStatus) {
    console.log('❌ Cannot proceed - Payment status check failed');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Step 4: Provide recommendations
  console.log('📋 DIAGNOSTIC RESULTS:');
  
  if (job.jobStatus !== 'completed') {
    console.log('❌ ISSUE: Job is not completed');
    console.log('💡 SOLUTION: Update job status to "completed"');
    console.log('   You can do this manually in your database or via API');
    
    // Ask if user wants to update job status
    console.log('\n🔄 Would you like to update the job status to completed? (This is for testing only)');
    console.log('   Uncomment the line below to auto-update job status:');
    console.log('   // await updateJobStatusToCompleted(TEST_JOB_ID);');
  }
  
  if (!paymentStatus.canPay) {
    console.log('❌ ISSUE: Payment is not allowed');
    console.log('💡 REASON:', paymentStatus.reason || 'Unknown');
  }
  
  if (job.jobStatus === 'completed' && paymentStatus.canPay) {
    console.log('✅ ALL GOOD: Payment should work');
    console.log('💡 Check your frontend app - "Pay Now" button should be visible');
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Make sure your frontend app is running');
  console.log('2. Check that .env file has correct API URL and Razorpay key');
  console.log('3. Restart your frontend app');
  console.log('4. Go to Status tab → My Post');
  console.log('5. Look for "Pay Now" button on completed jobs');
}

// Run the diagnostics
runPaymentFlowDiagnostics().catch(console.error);
