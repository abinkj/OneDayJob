/**
 * Quick Database Fix for Job Status
 * This script directly updates the job status in the database
 * Use this if the API approach doesn't work
 */

// MongoDB connection (adjust connection string as needed)
const { MongoClient } = require('mongodb');

// Configuration - UPDATE THESE VALUES
const MONGODB_URI = 'mongodb://localhost:27017/onedayjob'; // Update with your MongoDB URI
const DATABASE_NAME = 'onedayjob'; // Update with your database name
const JOB_ID = '68d821a14944268ce6d85a41'; // Your job ID

/**
 * Connect to MongoDB and update job status
 */
async function updateJobStatusInDatabase() {
  let client;
  
  try {
    console.log('🔧 Quick Database Fix for Job Status\n');
    console.log(`Job ID: ${JOB_ID}\n`);
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DATABASE_NAME);
    const jobsCollection = db.collection('jobpostings'); // Adjust collection name if different
    
    // Find the job
    console.log('🔍 Finding job in database...');
    const job = await jobsCollection.findOne({ _id: JOB_ID });
    
    if (!job) {
      console.log('❌ Job not found in database');
      console.log('💡 Check if the job ID is correct');
      return;
    }
    
    console.log('📋 Current Job Details:');
    console.log(`   ID: ${job._id}`);
    console.log(`   Name: ${job.name}`);
    console.log(`   Current Status: "${job.jobStatus}"`);
    console.log(`   Budget: ₹${job.budget}\n`);
    
    if (job.jobStatus === 'completed') {
      console.log('✅ Job is already completed!');
      console.log('💡 If payment button still not showing, restart your frontend app');
      return;
    }
    
    // Update job status
    console.log('🔄 Updating job status to "completed"...');
    const result = await jobsCollection.updateOne(
      { _id: JOB_ID },
      { 
        $set: { 
          jobStatus: 'completed',
          completedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Job status updated successfully!');
      console.log('🎉 Payment button should now appear in your frontend app!');
    } else {
      console.log('❌ Failed to update job status');
    }
    
  } catch (error) {
    console.log('❌ Error updating job status:', error.message);
    
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
  console.log('db.jobpostings.updateOne(');
  console.log(`  { "_id": ObjectId("${JOB_ID}") },`);
  console.log('  { $set: { "jobStatus": "completed", "completedAt": new Date() } }');
  console.log(')');
  console.log('');
  console.log('Or if using MongoDB Compass or similar tool:');
  console.log('1. Find the job with ID:', JOB_ID);
  console.log('2. Edit the jobStatus field to "completed"');
  console.log('3. Add completedAt field with current date');
}

// Main function
async function main() {
  console.log('🚀 Quick Database Fix for Job Status Mismatch\n');
  
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
  
  await updateJobStatusInDatabase();
  showDirectQuery();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Restart your frontend app: npm start -- --reset-cache');
  console.log('2. Go to Status tab → My Post');
  console.log('3. Look for the green "Pay Now" button');
  console.log('4. Test the payment flow');
}

// Run the fix
main().catch(console.error);
