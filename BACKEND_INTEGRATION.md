# Backend Integration for Home Screen

## Overview
The Home screen has been updated to integrate with your Node.js backend API. The integration includes:

1. **Real-time job fetching** from the backend
2. **Location-based job search** using the `getJobsByLocation` endpoint
3. **Search functionality** for both jobs and locations
4. **Pull-to-refresh** functionality
5. **Error handling** with fallback to all jobs

## API Endpoints Used

### 1. Get All Jobs
```
GET /api/jobs
```
- Fetches all available job postings
- Used as fallback when location-based search fails

### 2. Get Jobs by Location
```
GET /api/jobs/location/:userId?radius=:radius&categoryId=:categoryId
```
- Fetches jobs near the user's location
- Parameters:
  - `userId`: User's ID from authentication
  - `radius`: Search radius in kilometers (default: 10)
  - `categoryId`: Optional category filter

### 3. Get Current User
```
GET /api/auth/test
```
- Verifies user authentication
- Returns current user data

## Features Implemented

### Location Services
- **Current Location**: Automatically fetches and displays user's current location
- **Location Search**: Users can search for specific locations
- **Address Display**: Shows formatted address in the header
- **Coordinates Display**: Shows latitude/longitude for debugging

### Job Display
- **Real Data**: Displays actual job data from backend
- **Dynamic Content**: Shows job title, budget, location, dates, and vacancies
- **Status Indicators**: Shows if job is open or closed
- **Navigation**: Tapping a job navigates to job details

### Search & Filter
- **Search Bar**: Search for jobs or locations
- **Category Filter**: Filter jobs by category (placeholder)
- **Distance Filter**: Adjust search radius (placeholder)
- **Clear Filters**: Reset all filters

### User Experience
- **Loading States**: Shows loading indicators during API calls
- **Error Handling**: Displays error messages with retry options
- **Pull to Refresh**: Swipe down to refresh job listings
- **Empty States**: Shows appropriate messages when no jobs are found

## Backend Requirements

### Job Model Structure
Your backend should return job objects with this structure:
```typescript
{
  _id: string;
  name: string;
  description?: string;
  budget: number;
  category: {
    _id: string;
    name: string;
  };
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  isOpen: boolean;
  participantsNumber: number;
  assignedUsers?: string[];
  onDate?: Date;
  createdAt: Date;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}
```

### Required Backend Routes
1. `GET /api/jobs` - Get all jobs
2. `GET /api/jobs/location/:userId` - Get jobs by location
3. `GET /api/auth/test` - Test authentication
4. `GET /api/categories` - Get job categories (for future use)

## Setup Instructions

### 1. Backend Setup
Ensure your backend is running and accessible at the configured IP address:
```javascript
// In services/api.tsx
const API_BASE_URL = 'http://192.168.1.10:8000/api';
```

### 2. Location Permissions
The app requires location permissions to work properly:
- iOS: Add location usage description in `app.json`
- Android: Permissions are handled automatically

### 3. Authentication
Ensure users are properly authenticated before accessing the home screen:
- Token should be stored in AsyncStorage
- User data should be available in Redux store

## Testing

### Test Backend Connection
Run the test file to verify backend connectivity:
```bash
node test-backend-connection.js
```

### Test Location Services
The app includes built-in location testing:
- Check console logs for location data
- Verify address display in header
- Test search functionality

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check if backend is running
   - Verify IP address in `api.tsx`
   - Check network connectivity

2. **Location Not Working**
   - Ensure location permissions are granted
   - Check device location settings
   - Verify location services are enabled

3. **Jobs Not Loading**
   - Check authentication status
   - Verify user data is available
   - Check backend logs for errors

4. **Search Not Working**
   - Check internet connection
   - Verify location services are working
   - Check console for error messages

### Debug Information
The app includes extensive logging:
- API request/response logs
- Location service logs
- Error handling logs
- User authentication logs

## Future Enhancements

1. **Category Filtering**: Implement actual category filtering
2. **Distance Filtering**: Add distance-based filtering
3. **Job Applications**: Integrate job application functionality
4. **Real-time Updates**: Add real-time job updates
5. **Offline Support**: Cache jobs for offline viewing 