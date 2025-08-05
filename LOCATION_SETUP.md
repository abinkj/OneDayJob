# Location Setup Guide

## Overview
The PostJob screen now includes enhanced location functionality with:
- Location search with autocomplete suggestions
- Current location detection
- Proper location data structure for the backend

## Setup Instructions

### 1. Google Places API (Optional - for enhanced search)
For better location search functionality, you can set up Google Places API:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Replace `YOUR_GOOGLE_PLACES_API_KEY` in `services/locationService.tsx` with your actual API key

### 2. Fallback Location Service
If you don't set up Google Places API, the app will use Expo Location's geocoding service as a fallback, which provides basic location search functionality.

### 3. Location Permissions
The app requires location permissions to:
- Get current location
- Use location search features

Make sure to handle location permissions in your app configuration.

## Features

### Location Search Component
- **Search Input**: Type to search for locations
- **Autocomplete**: Shows suggestions as you type
- **Current Location Button**: Tap to use your current location
- **Debounced Search**: Prevents excessive API calls

### Location Data Structure
The location data follows the backend schema:
```typescript
{
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
```

### Backend Integration
The location data is automatically transformed to match the backend's GeoJSON format:
```typescript
{
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates: {
      type: "Point";
      coordinates: [longitude, latitude]; // MongoDB GeoJSON format
    };
  };
}
```

## Usage

### In PostJob Screen
1. Toggle off "Can this job be done remotely?"
2. Use the location search input to find a location
3. Select from suggestions or use current location button
4. The location data will be automatically included in the job posting

### Location Validation
- Location is required for non-remote jobs
- The app validates that a location is selected before posting
- Location data is properly formatted for the backend

## Troubleshooting

### Location Permission Issues
- Ensure location permissions are granted
- Check device location settings
- Verify location services are enabled

### Search Not Working
- Check internet connection
- Verify API key (if using Google Places)
- Check console for error messages

### Backend Integration Issues
- Ensure location data is properly formatted
- Check that coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)
- Verify the backend expects the GeoJSON format 