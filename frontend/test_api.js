console.log('=== TESTING FRONTEND API ===');

// Test fetch to API directly
const testAPI = async () => {
  try {
    // First test without auth to see server response
    console.log('Testing API endpoint without auth...');
    const response1 = await fetch('http://localhost:8000/api/all-submissions');
    console.log('Response status:', response1.status);
    console.log('Response headers:', [...response1.headers.entries()]);
    
    if (response1.status === 401) {
      console.log('Expected 401 - Auth required');
    }
    
    // Test with dummy token 
    console.log('Testing API endpoint with dummy token...');
    const response2 = await fetch('http://localhost:8000/api/all-submissions', {
      headers: {
        'Authorization': 'Bearer dummy_token',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response2.status);
    console.log('Response ok:', response2.ok);
    
    const data = await response2.text();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testAPI();
