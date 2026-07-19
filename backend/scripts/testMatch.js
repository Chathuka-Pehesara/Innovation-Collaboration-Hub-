const axios = require('axios');

async function test() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@innovationhub.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.accessToken;
    console.log('Login successful, token length:', token.length);

    // 2. Hit the endpoint
    const matchRes = await axios.get('http://localhost:5000/api/ai/find-teammates', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Match response:', matchRes.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

test();
