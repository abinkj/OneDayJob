# 🔧 Payment Flow Debug Guide

## 🚨 **Issues Found & Solutions**

### **Issue 1: Missing Environment Variables**
**Problem:** No `.env` file with API URL and Razorpay key
**Solution:** ✅ Created `.env` file with:
```
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RMzqDiXiJLzbEv
```

### **Issue 2: Job Status Not Updated**
**Problem:** Jobs might not be marked as "completed" in database
**Solution:** Check job status in backend

### **Issue 3: Payment Button Logic**
**Problem:** Payment button only shows when:
- `jobStatus === 'completed'`
- `isEmployer === true`
- `showPaymentButton === true`

## 🧪 **Testing Steps**

### **Step 1: Check Environment Variables**
```bash
# In your frontend directory
cat .env
```
Should show:
```
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RMzqDiXiJLzbEv
```

### **Step 2: Check Job Status**
1. Go to your backend API
2. Check if your job status is "completed"
3. If not, manually update it:
```bash
# Update job status to completed
curl -X PUT http://localhost:8000/api/jobs/YOUR_JOB_ID/status \
  -H "Content-Type: application/json" \
  -d '{"jobStatus": "completed"}'
```

### **Step 3: Test Payment Flow**
1. **Restart your frontend app** (important!)
2. Go to Status tab → My Post
3. Look for completed jobs
4. Check if "Pay Now" button appears
5. Click "Pay Now" to test payment modal

### **Step 4: Debug Console Logs**
Check console for these logs:
- "Getting payment status for job: [jobId]"
- "Payment status: [response]"
- "Opening payment modal for job: [jobId]"

## 🔍 **Common Issues & Fixes**

### **Issue: "Pay Now" button not showing**
**Causes:**
1. Job status is not "completed"
2. User is not the employer
3. showPaymentButton is false

**Fix:**
```typescript
// In JobCard component, ensure:
showPaymentButton={true}
isEmployer={true}
// And job status is "completed"
```

### **Issue: Payment modal not opening**
**Causes:**
1. Missing environment variables
2. API connection issues
3. Razorpay key not configured

**Fix:**
1. Check `.env` file exists
2. Restart app after adding environment variables
3. Check API URL is correct

### **Issue: "Network request failed"**
**Causes:**
1. Backend not running
2. Wrong API URL
3. Network connectivity

**Fix:**
1. Start backend server
2. Update API URL in `.env`
3. Use IP address instead of localhost if testing on device

## 🚀 **Quick Fix Commands**

### **1. Restart Frontend with Environment Variables**
```bash
cd "C:\Users\abink\Desktop\one-day"
npm start -- --reset-cache
```

### **2. Check Backend Status**
```bash
cd "C:\Users\abink\Desktop\onedayjob-api"
npm start
```

### **3. Test API Connection**
```bash
curl http://localhost:8000/api/health
```

## 📱 **Testing the Complete Flow**

### **For Employers:**
1. ✅ Post a job
2. ✅ Accept workers
3. ✅ Start job (status: "in_progress")
4. ✅ Complete job (status: "completed") ← **This is the key step!**
5. ✅ See "Pay Now" button
6. ✅ Click "Pay Now"
7. ✅ Payment modal opens
8. ✅ Complete payment with test card

### **For Workers:**
1. ✅ Apply to job
2. ✅ Get accepted
3. ✅ Complete work
4. ✅ Set up bank account details
5. ✅ Receive payment after employer pays

## 🎯 **Expected Behavior**

### **When Job is NOT Completed:**
- No "Pay Now" button
- Job status shows "In Progress"
- Payment modal shows "Payment Not Ready"

### **When Job IS Completed:**
- "Pay Now" button appears (green)
- Clicking opens payment modal
- Modal shows payment details
- Razorpay checkout opens

### **After Payment:**
- "Pay Now" button disappears
- Job shows "Paid" status
- Workers receive payment

## 🐛 **Debug Checklist**

- [ ] Environment variables set in `.env`
- [ ] Frontend app restarted
- [ ] Backend server running
- [ ] Job status is "completed"
- [ ] User is the employer
- [ ] showPaymentButton is true
- [ ] API connection working
- [ ] Razorpay key configured
- [ ] No console errors

## 📞 **If Still Not Working**

1. **Check Console Logs:**
   - Open React Native debugger
   - Look for error messages
   - Check network requests

2. **Test API Endpoints:**
   ```bash
   # Test payment status endpoint
   curl http://localhost:8000/api/payments/status/YOUR_JOB_ID
   ```

3. **Verify Job Status:**
   ```bash
   # Check job details
   curl http://localhost:8000/api/jobs/YOUR_JOB_ID
   ```

4. **Manual Job Status Update:**
   If job is not marked as completed, update it manually in your database or via API.

## 🎉 **Success Indicators**

- ✅ "Pay Now" button appears on completed jobs
- ✅ Payment modal opens when clicked
- ✅ Razorpay checkout loads
- ✅ Test payment succeeds
- ✅ Payment status updates
- ✅ Workers can see payment history

---

**Need Help?** Check the console logs and follow this guide step by step!
