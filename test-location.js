// Test script to debug location API
const testLocationAPI = async () => {
  try {
    // Test coordinates (San Francisco)
    const lat = 37.7749;
    const lng = -122.4194;
    
    console.log('Testing location API with SF coordinates:', { lat, lng });
    
    const response = await fetch(`http://localhost:3000/api/location/nearby?lat=${lat}&lng=${lng}&radius=5000`);
    const data = await response.json();
    
    console.log('API Response:', data);
    console.log('Number of businesses found:', data.businesses?.length || 0);
    
    if (data.businesses && data.businesses.length > 0) {
      console.log('Sample business:', data.businesses[0]);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Also test with NYC coordinates (where sample data exists)
const testNYC = async () => {
  try {
    const lat = 40.7128;
    const lng = -74.0060;
    
    console.log('Testing with NYC coordinates:', { lat, lng });
    
    const response = await fetch(`http://localhost:3000/api/location/nearby?lat=${lat}&lng=${lng}&radius=5000`);
    const data = await response.json();
    
    console.log('NYC API Response:', data);
    console.log('Number of businesses found:', data.businesses?.length || 0);
  } catch (error) {
    console.error('NYC Test error:', error);
  }
};

export { testLocationAPI, testNYC };
