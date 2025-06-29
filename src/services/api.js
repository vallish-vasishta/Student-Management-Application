import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_HOST || 'http://localhost:5000/api';

const api = {
  // Login method
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/users`, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get all users (admin only)
  getUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/auth/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get all students
  getStudents: async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // Add new student
  addStudent: async (studentData) => {
    try {
      const response = await axios.post(`${API_URL}/students`, {
        ...studentData,
        paymentDate: studentData.status === 'Paid' ? studentData.paymentDate : null,
        paymentMode: studentData.status === 'Paid' ? studentData.paymentMode : null
      });
      return response.data;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },

  // Update student
  updateStudent: async (id, studentData) => {
    try {
      const response = await axios.put(`${API_URL}/students/${id}`, {
        ...studentData,
        paymentDate: studentData.status === 'Paid' ? studentData.paymentDate : null,
        paymentMode: studentData.status === 'Paid' ? studentData.paymentMode : null
      });
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  // Delete student
  deleteStudent: async (id) => {
    try {
      await axios.delete(`${API_URL}/students/${id}`);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  // Mark student as paid
  markAsPaid: async (studentId) => {
    try {
      console.log('Sending PATCH request for student:', studentId);
      const response = await axios.patch(`${API_URL}/students/${studentId}/status`, {
        status: 'Paid'
      });
      console.log('PATCH response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error marking student as paid:', error);
      throw error;
    }
  },

  // Get attendance records for a specific date and batch
  getAttendance: async (date, batch) => {
    try {
      console.log('Fetching attendance for:', { date, batch });
      const response = await axios.get(`${API_URL}/attendance`, {
        params: { date, batch }
      });
      console.log('Attendance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  // Mark attendance for students
  markAttendance: async (date, records) => {
    try {
      console.log('Marking attendance with:', { date, records });
      const response = await axios.post(`${API_URL}/attendance`, {
        date,
        records
      });
      console.log('Mark attendance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Get all batches
  getBatches: async () => {
    try {
      const response = await axios.get(`${API_URL}/batches`);
      return response.data;
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  },

  // Add new batch
  addBatch: async (batchData) => {
    try {
      const response = await axios.post(`${API_URL}/batches`, batchData);
      return response.data;
    } catch (error) {
      console.error('Error adding batch:', error);
      throw error;
    }
  },

  // Update batch
  updateBatch: async (id, batchData) => {
    try {
      const response = await axios.put(`${API_URL}/batches/${id}`, batchData);
      return response.data;
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  },

  // Delete batch
  deleteBatch: async (id) => {
    try {
      await axios.delete(`${API_URL}/batches/${id}`);
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  },

  // Fee-related methods
  // Get all fees
  getFees: async () => {
    try {
      const response = await axios.get(`${API_URL}/fees`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fees:', error);
      throw error;
    }
  },

  // Add new fee record
  addFee: async (feeData) => {
    try {
      const response = await axios.post(`${API_URL}/fees`, {
        studentId: feeData.studentId,
        feesMonth: feeData.feesMonth,
        amount: feeData.amount,
        status: feeData.status,
        paymentDate: feeData.status === 'Paid' ? feeData.paymentDate : null,
        paymentMode: feeData.status === 'Paid' ? feeData.paymentMode : null
      });
      return response.data;
    } catch (error) {
      console.error('Error adding fee:', error);
      throw error;
    }
  },

  // Update fee record
  updateFees: async (studentId, feeData) => {
    try {
      const response = await axios.put(`${API_URL}/fees/${studentId}`, {
        feesMonth: feeData.feesMonth,
        amount: feeData.amount,
        status: feeData.status,
        paymentDate: feeData.status === 'Paid' ? feeData.paymentDate : null,
        paymentMode: feeData.status === 'Paid' ? feeData.paymentMode : null
      });
      return response.data;
    } catch (error) {
      console.error('Error updating fee:', error);
      throw error;
    }
  },

  // Delete fee record
  deleteFee: async (studentId, feesMonth) => {
    try {
      await axios.delete(`${API_URL}/fees/${studentId}`, {
        params: { feesMonth }
      });
    } catch (error) {
      console.error('Error deleting fee:', error);
      throw error;
    }
  },

  // Get fees for a specific student
  getStudentFees: async (studentId) => {
    try {
      const response = await axios.get(`${API_URL}/fees/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student fees:', error);
      throw error;
    }
  },

  // Get fees for a specific month
  getMonthlyFees: async (month) => {
    try {
      const response = await axios.get(`${API_URL}/fees/month/${month}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly fees:', error);
      throw error;
    }
  },

  // Get fees for a specific batch
  getBatchFees: async (batchId) => {
    try {
      const response = await axios.get(`${API_URL}/fees/batch/${batchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching batch fees:', error);
      throw error;
    }
  }
};

export default api; 