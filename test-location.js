// Simple test script for location service
// This can be run with Node.js to test the location service logic

const testLocationData = {
  address: "123 Main St",
  city: "New York",
  state: "NY",
  country: "United States",
  zipCode: "10001",
  coordinates: {
    latitude: 40.7128,
    longitude: -74.0060
  }
};

// Test the transformation logic that would happen in api.tsx
function testLocationTransformation(locationData) {
  console.log("Testing location transformation...");
  console.log("Original location data:", JSON.stringify(locationData, null, 2));
  
  if (locationData && locationData.coordinates) {
    console.log("Location coordinates:", locationData.coordinates);
    
    // Validate coordinates exist
    if (!locationData.coordinates.latitude || !locationData.coordinates.longitude) {
      console.error("Missing latitude or longitude in location coordinates");
      throw new Error("Invalid location coordinates: missing latitude or longitude");
    }

    // Only include non-empty fields to avoid validation errors
    const transformedLocation = {
      coordinates: {
        latitude: locationData.coordinates.latitude,
        longitude: locationData.coordinates.longitude
      }
    };

    // Only add address fields if they have content
    if (locationData.address && locationData.address.trim()) {
      transformedLocation.address = locationData.address.trim();
    }
    if (locationData.city && locationData.city.trim()) {
      transformedLocation.city = locationData.city.trim();
    }
    if (locationData.state && locationData.state.trim()) {
      transformedLocation.state = locationData.state.trim();
    }
    if (locationData.country && locationData.country.trim()) {
      transformedLocation.country = locationData.country.trim();
    }
    if (locationData.zipCode && locationData.zipCode.trim()) {
      transformedLocation.zipCode = locationData.zipCode.trim();
    }
    
    console.log("Transformed location data:", JSON.stringify(transformedLocation, null, 2));
    return transformedLocation;
  } else {
    console.warn("No location data or coordinates found");
    return null;
  }
}

console.log("Starting location transformation tests...\n");

// Test the transformation
try {
  console.log("Testing valid location data...");
  const result = testLocationTransformation(testLocationData);
  console.log("✅ Location transformation test passed!");
  console.log("Result:", JSON.stringify(result, null, 2));
} catch (error) {
  console.error("❌ Location transformation test failed:", error.message);
}

// Test with missing coordinates
console.log("\n--- Testing with missing coordinates ---");
try {
  const invalidData = {
    address: "123 Main St",
    city: "New York",
    state: "NY",
    country: "United States",
    zipCode: "10001",
    coordinates: {
      latitude: null,
      longitude: -74.0060
    }
  };
  const result = testLocationTransformation(invalidData);
  console.log("❌ Should have failed but didn't");
} catch (error) {
  console.log("✅ Correctly caught missing coordinates error:", error.message);
}

// Test with no coordinates object
console.log("\n--- Testing with no coordinates object ---");
try {
  const noCoordsData = {
    address: "123 Main St",
    city: "New York",
    state: "NY",
    country: "United States",
    zipCode: "10001"
  };
  const result = testLocationTransformation(noCoordsData);
  console.log("✅ Correctly handled missing coordinates object");
} catch (error) {
  console.log("❌ Unexpected error:", error.message);
}

console.log("\n--- All tests completed ---"); 