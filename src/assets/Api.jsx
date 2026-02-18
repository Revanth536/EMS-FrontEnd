const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

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
      console.error("Error fetching employees:", error);
      throw error;
    }
  }

  async createEmployee(employeeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: employeeData.firstName,
          email: employeeData.email,
          password: employeeData.password,
        }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid email or password");
        }
        throw new Error("Login failed. Please try again.");
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No account found with that email address.");
        }
        throw new Error("Failed to send reset email. Please try again.");
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Reset link is invalid or has expired.");
        }
        throw new Error("Failed to reset password. Please try again.");
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  }

  saveToken(token) {
    localStorage.setItem("authToken", token);
  }

  getToken() {
    return localStorage.getItem("authToken");
  }

  removeToken() {
    localStorage.removeItem("authToken");
  }

  getAuthHeaders() {
    const token = this.getToken();
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  }
}

export const employeeAPI = new EmployeeAPI();
export default employeeAPI;
