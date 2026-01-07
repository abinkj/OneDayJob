# Notification Testing Guide

## 🎯 Overview

This guide will help you test and verify that your notification system is working correctly. Use the tools provided to diagnose issues and ensure notifications are triggered at the right times.

## 🛠️ Testing Tools

### 1. Frontend: NotificationTester Component

A comprehensive UI component for testing all notification features from your app.

**Location**: `/Users/abinkjaimon/Desktop/OneDayJob/components/NotificationTester.tsx`

#### How to Use

1. **Add to a screen temporarily** (e.g., Home screen):
   ```typescript
   import NotificationTester from '../components/NotificationTester';
   
   // Add to your render method
   <NotificationTester />
   ```

2. **Run your app**:
   ```bash
   npx expo start
   ```

3. **Open on physical device** (notifications don't work in simulators)

4. **Run tests in this order**:
   - ✅ Check Permissions → Verify notification permissions are granted
   - ✅ Get Push Token → Ensure Expo push token is generated
   - ✅ Register Device with Backend → Send token to backend
   - ✅ Test Local Notification → Verify local notifications work
   - ✅ Test Backend Notification → Verify backend can send notifications
   - ✅ Test specific types (Verification Code, Job Update, Message)

#### What to Look For

- **Green checkmarks** (✅) = Success
- **Red X marks** (❌) = Failure (check the error message)
- All tests should pass if the system is working correctly

---

### 2. Backend: Test Notification Triggers Script

A script to manually test all notification types from the backend.

**Location**: `/Users/abinkjaimon/Desktop/onedayjob-api/src/scripts/testNotificationTriggers.ts`

#### How to Run

```bash
cd /Users/abinkjaimon/Desktop/onedayjob-api
npx ts-node src/scripts/testNotificationTriggers.ts
```

#### What It Tests

- ✅ Basic push notification
- ✅ Verification code notification
- ✅ Job update notification
- ✅ Application status notification
- ✅ Message notification
- ✅ Job published notification
- ✅ Application reminder
- ✅ Payment reminder

#### Expected Output

```
🚀 Starting Notification System Tests
============================================================
📦 Connected to MongoDB

👤 Found test user: John Doe (user-id-123)
   Push Token: ExponentPushToken[xxx]...

🧪 Testing Basic Push Notification...
✅ Basic Notification: Sent successfully
...
============================================================
📊 TEST SUMMARY
============================================================
Total Tests: 8
✅ Passed: 8
❌ Failed: 0
```

---

## 📋 Step-by-Step Testing Process

### Step 1: Verify Frontend Setup

1. Open the app on your **physical device**
2. Add `<NotificationTester />` to your Home screen
3. Run the following tests:
   - Check Permissions
   - Get Push Token
   - Register Device with Backend
   - Test Local Notification

**Expected Result**: All should pass with green checkmarks

**If it fails**:
- Check if you're on a physical device (not simulator)
- Verify notification permissions in device settings
- Check the API URL is correct in `.env`

---

### Step 2: Test Backend Connectivity

1. In the NotificationTester, tap "Test Backend Notification"
2. Check your device for the notification
3. Check backend logs for notification attempt

**Expected Result**: You should receive a test notification on your device

**If it fails**:
- Verify backend is running
- Check backend logs for errors
- Ensure device is registered (Step 1 passed)
- Verify user has valid expo push token in database

---

### Step 3: Test Real Workflow Triggers

Test each notification type by performing the actual action:

#### Job Published Notification
1. Create a new job posting
2. **Expected**: Employer receives "Job Published Successfully" notification

#### New Application Notification
1. Apply for a job (as employee)
2. **Expected**: Employer receives "New Application Received" notification

#### Application Accepted/Rejected
1. Select applicants for a job (as employer)
2. **Expected**: 
   - Accepted employees receive "Application Update - accepted" notification
   - Rejected employees receive "Application Update - rejected" notification

#### Job Status Change
1. Update job status (started, ended, cancelled)
2. **Expected**: Assigned employees receive job status notification

#### New Message
1. Send a chat message
2. **Expected**: Other conversation participants receive message notification

---

### Step 4: Run Backend Test Script

```bash
cd /Users/abinkjaimon/Desktop/onedayjob-api
npx ts-node src/scripts/testNotificationTriggers.ts
```

This will test all notification types programmatically and show you a summary.

---

## 🐛 Common Issues & Solutions

### Issue: "No push token available"

**Cause**: Expo push token not generated

**Solution**:
1. Ensure you're on a physical device
2. Grant notification permissions
3. Run "Get Push Token" in NotificationTester
4. Check EAS project ID is set in `app.json`

---

### Issue: "Device registration failed"

**Cause**: Backend can't receive the push token

**Solution**:
1. Verify backend is running
2. Check API URL in `.env` file
3. Ensure user is logged in (has access token)
4. Check backend logs for errors

---

### Issue: "Notifications not appearing"

**Cause**: Multiple possible causes

**Solution**:
1. **Check permissions**: Device Settings → App → Notifications → Enabled
2. **Test on physical device**: Simulators don't support push notifications
3. **Check backend logs**: Look for notification sending attempts
4. **Verify push token**: Check database to ensure user has `expoPushToken` saved
5. **Test local notification first**: If local works but push doesn't, it's a backend issue

---

### Issue: "Backend test script shows 'No user with push token found'"

**Cause**: No users in database have registered their devices

**Solution**:
1. Open the app on a physical device
2. Log in as a user
3. Use NotificationTester to register device
4. Run the backend script again

---

## 📊 Checking Logs

### Frontend Logs

Look for these in your Expo console:
- `📤 Attempting to send push notification...`
- `✅ Push notification sent successfully`
- `❌ Push notification failed`

### Backend Logs

Look for these in your backend console:
- `📤 Attempting to send push notification to: ExponentPushToken[...]`
- `✅ Push notification sent successfully. Ticket ID: xxx`
- `❌ Push notification failed. Error: xxx`

---

## ✅ Success Checklist

- [ ] NotificationTester shows valid push token
- [ ] Device registration succeeds
- [ ] Local notifications appear on device
- [ ] Backend test notification appears on device
- [ ] Backend test script passes all tests
- [ ] Real workflow actions trigger notifications
- [ ] Notifications appear with correct content
- [ ] Backend logs show successful sends

---

## 💡 Tips

1. **Always test on physical devices** - Simulators don't support push notifications
2. **Check both frontend and backend logs** - This helps identify where the issue is
3. **Test one notification type at a time** - Easier to debug
4. **Verify database state** - Ensure users have `expoPushToken` saved
5. **Use the Expo push notification tool** - https://expo.dev/notifications to manually send test notifications

---

## 🔍 Debugging Workflow

If notifications aren't working, follow this debugging workflow:

1. **Frontend Setup**
   - ✅ Permissions granted?
   - ✅ Push token generated?
   - ✅ Device registered with backend?

2. **Backend Setup**
   - ✅ Backend running?
   - ✅ User has push token in database?
   - ✅ Notification service initialized?

3. **Connectivity**
   - ✅ Frontend can reach backend?
   - ✅ Backend can reach Expo servers?
   - ✅ No network errors in logs?

4. **Triggers**
   - ✅ Notification code is being called?
   - ✅ Correct user ID being used?
   - ✅ Valid push token being used?

5. **Delivery**
   - ✅ Expo returns success?
   - ✅ Notification appears on device?
   - ✅ Correct content displayed?
