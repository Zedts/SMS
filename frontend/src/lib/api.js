// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// API Helper Functions
export const api = {
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  logout: async (token) => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },
  
  me: async (token) => {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Dashboard endpoints
  getDashboard: async (role, token) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/${role}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Absensi endpoints
  getAbsensi: async (token, params = {}) => {
    try {
      console.log('=== GET ABSENSI REQUEST ===');
      console.log('Params:', params);
      const queryString = new URLSearchParams(params).toString();
      console.log('Query string:', queryString);
      console.log('URL:', `${API_BASE_URL}/absensi?${queryString}`);
      
      const response = await fetch(`${API_BASE_URL}/absensi?${queryString}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Absensi response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Absensi response data:', data);
      
      return data;
    } catch (error) {
      console.error('getAbsensi error:', error);
      return { success: false, message: error.message, data: [] };
    }
  },

  createAbsensi: async (token, data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/absensi`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('createAbsensi error:', error);
      return { success: false, message: error.message };
    }
  },

  approveAbsensi: async (token, id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/absensi/${id}/approve`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('approveAbsensi error:', error);
      return { success: false, message: error.message };
    }
  },

  rejectAbsensi: async (token, id, keterangan) => {
    try {
      const response = await fetch(`${API_BASE_URL}/absensi/${id}/reject`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keterangan })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('rejectAbsensi error:', error);
      return { success: false, message: error.message };
    }
  },

  // Tugas endpoints
  getTugas: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/tugas?${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  createTugas: async (token, data) => {
    try {
      console.log('=== CREATE TUGAS REQUEST ===');
      console.log('URL:', `${API_BASE_URL}/tugas`);
      console.log('Token present:', !!token);
      console.log('Data:', data);
      
      // Jika ada file, gunakan FormData, jika tidak gunakan JSON
      if (data.file_tugas) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        });

        const response = await fetch(`${API_BASE_URL}/tugas`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        console.log('Response status (FormData):', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP Error (FormData):', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } else {
        // Untuk request tanpa file, gunakan JSON
        const cleanData = { ...data };
        delete cleanData.file_tugas; // hapus field file yang null/undefined
        
        // Hapus field jurusan jika mata_pelajaran bukan JURUSAN atau jika jurusan kosong
        if (cleanData.mata_pelajaran !== 'JURUSAN' || !cleanData.jurusan) {
          delete cleanData.jurusan;
        }
        
        // Hapus field kosong lainnya
        Object.keys(cleanData).forEach(key => {
          if (cleanData[key] === '' || cleanData[key] === null || cleanData[key] === undefined) {
            delete cleanData[key];
          }
        });
        
        console.log('Clean data to send:', cleanData);
        Object.keys(cleanData).forEach(key => {
          if (cleanData[key] === '' || cleanData[key] === null || cleanData[key] === undefined) {
            delete cleanData[key];
          }
        });
        
        console.log('Cleaned data for JSON request:', cleanData);
        
        const response = await fetch(`${API_BASE_URL}/tugas`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(cleanData)
        });
        
        console.log('Response status (JSON):', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP Error (JSON):', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error('createTugas error:', error);
      throw error;
    }
  },

  submitTugas: async (token, tugasId, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/tugas/${tugasId}/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  },

  getTugasSubmissions: async (token, tugasId) => {
    const response = await fetch(`${API_BASE_URL}/tugas/${tugasId}/submissions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  gradeSubmission: async (token, submissionId, data) => {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  getMySubmissions: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/my-submissions?${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getAllSubmissions: async (token, params = {}) => {
    try {
      if (!token) {
        console.error('No token provided to getAllSubmissions');
        return { success: false, message: 'No authentication token', data: [] };
      }
      
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/all-submissions?${queryString}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, response.statusText, errorText);
        return { success: false, message: `HTTP ${response.status}: ${response.statusText}`, data: [] };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('getAllSubmissions error:', error.message);
      return { success: false, message: error.message, data: [] };
    }
  },

  cancelSubmission: async (token, submissionId) => {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/cancel`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // User management endpoints
  getUsers: async (token, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/users${queryString ? '?' + queryString : ''}`;
      
      console.log('=== GET USERS REQUEST ===');
      console.log('URL:', url);
      console.log('Params:', params);
      console.log('Query String:', queryString);
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Get users response status:', response.status);
      console.log('Get users response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get users HTTP Error:', response.status, response.statusText, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Get users response data:', result);
      console.log('Users count in response:', result.data?.data?.length || result.data?.length || 0);
      
      return result;
    } catch (error) {
      console.error('getUsers error:', error);
      throw error;
    }
  },

  createUser: async (token, data) => {
    try {
      console.log('=== CREATE USER REQUEST ===');
      console.log('URL:', `${API_BASE_URL}/users`);
      console.log('Method: POST');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Data:', data);
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      console.log('Create user response status:', response.status);
      console.log('Create user response URL:', response.url);
      console.log('Create user response headers:', [...response.headers.entries()]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create user HTTP Error:', response.status, response.statusText, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Create user response data:', result);
      return result;
    } catch (error) {
      console.error('createUser error:', error);
      throw error;
    }
  },

  updateUser: async (token, id, data) => {
    try {
      const url = `${API_BASE_URL}/users/${id}`;
      console.log('=== UPDATE USER REQUEST ===');
      console.log('URL:', url);
      console.log('Method: PATCH');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Data:', data);
      console.log('API_BASE_URL:', API_BASE_URL);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      console.log('Response status:', response.status);
      console.log('Response URL:', response.url);
      console.log('Response headers:', [...response.headers.entries()]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, response.statusText, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Response data:', result);
      return result;
    } catch (error) {
      console.error('updateUser error:', error);
      throw error;
    }
  },

  deleteUser: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Notifikasi endpoints
  getNotifikasi: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/notifikasi?${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  markNotifikasiAsRead: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/notifikasi/${id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  markAllNotifikasiAsRead: async (token) => {
    const response = await fetch(`${API_BASE_URL}/notifikasi/read-all`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getUnreadNotifikasiCount: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifikasi/unread-count`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('getUnreadNotifikasiCount error:', error);
      return { success: false, count: 0, message: error.message };
    }
  }
};

