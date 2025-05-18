import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_HOST || 'http://localhost:5000/api';

const api = {
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
      const response = await axios.post(`${API_URL}/students`, studentData);
      return response.data;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },

  // Update student
  updateStudent: async (id, studentData) => {
    try {
      const response = await axios.put(`${API_URL}/students/${id}`, studentData);
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
  }
};

export default api; 