
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class EmployeeAPI {
  async handleResponse(response) {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP Error: ${response.status}`);
    }
    return response.json();
  }

  async getAllEmployees() {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  async createEmployee(employeeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: employeeData.firstName,
          email: employeeData.email,
          password: employeeData.password, // Now includes password
        }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Use dedicated login endpoint
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        }
        throw new Error('Login failed. Please try again.');
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // JWT token management
  saveToken(token) {
    localStorage.setItem('authToken', token);
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  removeToken() {
    localStorage.removeItem('authToken');
  }

  // Add authorization header to requests
  getAuthHeaders() {
    const token = this.getToken();
    return token
      ? {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      : {
          'Content-Type': 'application/json',
        };
  }
}

export const employeeAPI = new EmployeeAPI();
export default employeeAPI;