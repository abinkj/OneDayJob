/**
 * Add Test Worker Payment Details to Database
 * This script directly adds test payment details to the database for testing
 */

// MongoDB connection (adjust connection string as needed)
const { MongoClient } = require('mongodb');

// Configuration - UPDATE THESE VALUES
const MONGODB_URI = 'mongodb://localhost:27017/onedayjob'; // Update with your MongoDB URI
const DATABASE_NAME = 'onedayjob'; // Update with your database name
const WORKER_USER_ID = 'YOUR_WORKER_USER_ID'; // Replace with actual worker user ID

/**
 * Add test payment details to worker
 */
async function addTestWorkerPayment() {
  let client;
  
  try {
    console.log('🏦 Adding Test Worker Payment Details\n');
    console.log(`Worker User ID: ${WORKER_USER_ID}\n`);
    
    if (WORKER_USER_ID === 'YOUR_WORKER_USER_ID') {
      console.log('⚠️  Please update WORKER_USER_ID with actual worker user ID');
      console.log('💡 You can find this in your app logs or database\n');
      return;
    }
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DATABASE_NAME);
    const usersCollection = db.collection('users'); // Adjust collection name if different
    
    // Find the worker
    console.log('🔍 Finding worker in database...');
    const worker = await usersCollection.findOne({ _id: WORKER_USER_ID });
    
    if (!worker) {
      console.log('❌ Worker not found in database');
      console.log('💡 Check if the worker user ID is correct');
      return;
    }
    
    console.log('📋 Worker Details:');
    console.log(`   ID: ${worker._id}`);
    console.log(`   Name: ${worker.firstName} ${worker.lastName}`);
    console.log(`   Phone: ${worker.phoneNumber}\n`);
    
    // Add test bank account details
    const bankAccountDetails = {
      accountHolderName: 'Test Worker',
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
      accountType: 'savings',
      createdAt: new Date()
    };
    
    // Add test UPI details
    const upiDetails = {
      upiId: 'testworker@paytm',
      createdAt: new Date()
    };
    
    console.log('🔄 Adding test payment details...');
    
    // Update worker with payment details
    const result = await usersCollection.updateOne(
      { _id: WORKER_USER_ID },
      { 
        $set: { 
          bankAccount: bankAccountDetails,
          upiId: upiDetails.upiId,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Test payment details added successfully!');
      console.log('\n🏦 Bank Account Details:');
      console.log(`   Account Holder: ${bankAccountDetails.accountHolderName}`);
      console.log(`   Account Number: ${bankAccountDetails.accountNumber}`);
      console.log(`   IFSC Code: ${bankAccountDetails.ifscCode}`);
      console.log(`   Bank Name: ${bankAccountDetails.bankName}`);
      console.log(`   Account Type: ${bankAccountDetails.accountType}`);
      
      console.log('\n📱 UPI Details:');
      console.log(`   UPI ID: ${upiDetails.upiId}`);
      
      console.log('\n🎉 Worker is now ready to receive payments!');
    } else {
      console.log('❌ Failed to add payment details');
    }
    
  } catch (error) {
    console.log('❌ Error adding payment details:', error.message);
    
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check if MongoDB is running');
    console.log('2. Verify the connection string is correct');
    console.log('3. Check if the database and collection names are correct');
    console.log('4. Make sure you have write permissions');
  } finally {
    if (client) {
      await client.close();
      console.log('\n📡 Disconnected from MongoDB');
    }
  }
}

/**
 * Alternative: Direct MongoDB query
 */
function showDirectQuery() {
  console.log('\n🔧 Alternative: Direct MongoDB Query');
  console.log('If the script doesn\'t work, run this directly in MongoDB:');
  console.log('');
  console.log('db.users.updateOne(');
  console.log(`  { "_id": ObjectId("${WORKER_USER_ID}") },`);
  console.log('  { $set: {');
  console.log('    "bankAccount": {');
  console.log('      "accountHolderName": "Test Worker",');
  console.log('      "accountNumber": "1234567890",');
  console.log('      "ifscCode": "SBIN0001234",');
  console.log('      "bankName": "State Bank of India",');
  console.log('      "accountType": "savings",');
  console.log('      "createdAt": new Date()');
  console.log('    },');
  console.log('    "upiId": "testworker@paytm",');
  console.log('    "updatedAt": new Date()');
  console.log('  }');
  console.log(')');
  console.log('');
  console.log('Or if using MongoDB Compass or similar tool:');
  console.log('1. Find the worker with ID:', WORKER_USER_ID);
  console.log('2. Add bankAccount field with the details above');
  console.log('3. Add upiId field with "testworker@paytm"');
}

// Main function
async function main() {
  console.log('🚀 Test Worker Payment Setup\n');
  
  // Check if mongodb is available
  try {
    require('mongodb');
  } catch (error) {
    console.log('❌ MongoDB driver not found');
    console.log('💡 Install it with: npm install mongodb');
    console.log('   Or use the direct query method below\n');
    showDirectQuery();
    return;
  }
  
  await addTestWorkerPayment();
  showDirectQuery();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Test the complete payment flow');
  console.log('2. Employer pays for the job');
  console.log('3. Check if worker receives payment');
  console.log('4. Verify payment history in worker app');
}

// Run the setup
main().catch(console.error);
