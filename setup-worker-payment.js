/**
 * Setup Worker Payment Details for Testing
 * This script helps you add worker payment details for testing the complete payment flow
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Test worker details - UPDATE THESE
const WORKER_USER_ID = 'YOUR_WORKER_USER_ID'; // Replace with actual worker user ID
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN'; // Replace with worker's auth token

/**
 * Add bank account details for worker
 */
async function addBankAccount() {
  try {
    console.log('🏦 Adding bank account details for worker...\n');
    
    const bankDetails = {
      accountHolderName: 'Test Worker',
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
      accountType: 'savings'
    };
    
    console.log('📋 Bank Details:');
    console.log(`   Account Holder: ${bankDetails.accountHolderName}`);
    console.log(`   Account Number: ${bankDetails.accountNumber}`);
    console.log(`   IFSC Code: ${bankDetails.ifscCode}`);
    console.log(`   Bank Name: ${bankDetails.bankName}`);
    console.log(`   Account Type: ${bankDetails.accountType}\n`);
    
    const response = await axios.post(`${API_BASE_URL}/users/bank-account`, bankDetails, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Bank account added successfully!');
    console.log(`   Response: ${response.data.message}\n`);
    
    return true;
  } catch (error) {
    console.log('❌ Error adding bank account:', error.message);
    
    if (error.response?.data?.message) {
      console.log('   Details:', error.response.data.message);
    }
    
    console.log('\n💡 Manual Solutions:');
    console.log('1. Use the frontend app to add bank details');
    console.log('2. Go to Profile → Bank Account');
    console.log('3. Fill in the test details above');
    console.log('4. Or update the AUTH_TOKEN in this script');
    
    return false;
  }
}

/**
 * Add UPI details for worker
 */
async function addUpiDetails() {
  try {
    console.log('📱 Adding UPI details for worker...\n');
    
    const upiDetails = {
      upiId: 'testworker@paytm' // Test UPI ID
    };
    
    console.log('📋 UPI Details:');
    console.log(`   UPI ID: ${upiDetails.upiId}\n`);
    
    const response = await axios.post(`${API_BASE_URL}/users/upi-details`, upiDetails, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ UPI details added successfully!');
    console.log(`   Response: ${response.data.message}\n`);
    
    return true;
  } catch (error) {
    console.log('❌ Error adding UPI details:', error.message);
    
    if (error.response?.data?.message) {
      console.log('   Details:', error.response.data.message);
    }
    
    return false;
  }
}

/**
 * Check worker payment details
 */
async function checkWorkerDetails() {
  try {
    console.log('🔍 Checking worker payment details...\n');
    
    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const user = response.data.data;
    
    console.log('📋 Worker Details:');
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Phone: ${user.phoneNumber}`);
    console.log(`   Bank Account: ${user.bankAccount ? 'Set' : 'Not Set'}`);
    console.log(`   UPI ID: ${user.upiId || 'Not Set'}\n`);
    
    if (user.bankAccount) {
      console.log('🏦 Bank Account Details:');
      console.log(`   Account Holder: ${user.bankAccount.accountHolderName}`);
      console.log(`   Account Number: ${user.bankAccount.accountNumber}`);
      console.log(`   IFSC Code: ${user.bankAccount.ifscCode}`);
      console.log(`   Bank Name: ${user.bankAccount.bankName}\n`);
    }
    
    if (user.upiId) {
      console.log('📱 UPI Details:');
      console.log(`   UPI ID: ${user.upiId}\n`);
    }
    
    return user;
  } catch (error) {
    console.log('❌ Error checking worker details:', error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Worker Payment Setup Tool\n');
  
  if (WORKER_USER_ID === 'YOUR_WORKER_USER_ID' || AUTH_TOKEN === 'YOUR_AUTH_TOKEN') {
    console.log('⚠️  Please update the configuration:');
    console.log('1. Replace WORKER_USER_ID with actual worker user ID');
    console.log('2. Replace AUTH_TOKEN with worker\'s auth token');
    console.log('3. Or use the frontend app to add payment details\n');
    
    console.log('💡 Frontend Method (Easier):');
    console.log('1. Login as a worker in your app');
    console.log('2. Go to Profile → Bank Account');
    console.log('3. Add these test details:');
    console.log('   Account Holder: Test Worker');
    console.log('   Account Number: 1234567890');
    console.log('   IFSC Code: SBIN0001234');
    console.log('   Bank Name: State Bank of India');
    console.log('   Account Type: Savings');
    console.log('4. Save the details');
    console.log('5. Test the payment flow\n');
    
    return;
  }
  
  // Check current details
  await checkWorkerDetails();
  
  // Add bank account
  await addBankAccount();
  
  // Add UPI details
  await addUpiDetails();
  
  // Check final details
  await checkWorkerDetails();
  
  console.log('🎯 NEXT STEPS:');
  console.log('1. Make sure worker has payment details set');
  console.log('2. Test the complete payment flow');
  console.log('3. Employer pays for the job');
  console.log('4. Check if worker receives payment');
}

// Run the setup
main().catch(console.error);
