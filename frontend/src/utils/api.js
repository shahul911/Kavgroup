import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('adminToken');

// Create axios instance with auth header
const createAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`
  }
});

// Public APIs
export const getAvailabilityOverview = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  const response = await axios.get(`${API}/bookings/availability?${params.toString()}`);
  return response.data;
};

export const getDateTimeSlots = async (date) => {
  const response = await axios.get(`${API}/bookings/availability/${date}`);
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await axios.post(`${API}/bookings`, bookingData);
  return response.data;
};

export const createEnquiry = async (enquiryData) => {
  const response = await axios.post(`${API}/enquiries`, enquiryData);
  return response.data;
};

// Admin APIs
export const adminLogin = async (credentials) => {
  const response = await axios.post(`${API}/admin/login`, credentials);
  return response.data;
};

export const getBookings = async (status = null) => {
  const url = status ? `${API}/admin/bookings?status=${status}` : `${API}/admin/bookings`;
  const response = await axios.get(url, createAuthHeader());
  return response.data;
};

export const updateBooking = async (bookingId, updateData) => {
  const response = await axios.put(`${API}/admin/bookings/${bookingId}`, updateData, createAuthHeader());
  return response.data;
};

export const deleteBooking = async (bookingId) => {
  const response = await axios.delete(`${API}/admin/bookings/${bookingId}`, createAuthHeader());
  return response.data;
};

export const getEnquiries = async (status = null) => {
  const url = status ? `${API}/admin/enquiries?status=${status}` : `${API}/admin/enquiries`;
  const response = await axios.get(url, createAuthHeader());
  return response.data;
};

export const updateEnquiry = async (enquiryId, updateData) => {
  const response = await axios.put(`${API}/admin/enquiries/${enquiryId}`, updateData, createAuthHeader());
  return response.data;
};

export const deleteEnquiry = async (enquiryId) => {
  const response = await axios.delete(`${API}/admin/enquiries/${enquiryId}`, createAuthHeader());
  return response.data;
};

export const uploadDocument = async (formData) => {
  const response = await axios.post(`${API}/admin/documents`, formData, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getDocuments = async (documentType = null) => {
  const url = documentType ? `${API}/admin/documents?documentType=${documentType}` : `${API}/admin/documents`;
  const response = await axios.get(url, createAuthHeader());
  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await axios.delete(`${API}/admin/documents/${documentId}`, createAuthHeader());
  return response.data;
};

export const getReminders = async () => {
  const response = await axios.get(`${API}/admin/reminders`, createAuthHeader());
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await axios.get(`${API}/admin/stats`, createAuthHeader());
  return response.data;
};

export const convertEnquiryToBooking = async (enquiryId, bookingDetails) => {
  const response = await axios.post(`${API}/admin/enquiries/${enquiryId}/convert-to-booking`, bookingDetails, createAuthHeader());
  return response.data;
};

export const generateReceipt = async (bookingId) => {
  const response = await axios.get(`${API}/admin/bookings/${bookingId}/receipt`, createAuthHeader());
  return response.data;
};

export const createBookingDirect = async (bookingData) => {
  const response = await axios.post(`${API}/admin/bookings`, bookingData, createAuthHeader());
  return response.data;
};

// User Management
export const getUsers = async () => {
  const response = await axios.get(`${API}/admin/users`, createAuthHeader());
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post(`${API}/admin/users`, userData, createAuthHeader());
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(`${API}/admin/users/${userId}`, createAuthHeader());
  return response.data;
};

// Gallery Management
export const getGallery = async () => {
  const response = await axios.get(`${API}/gallery`);
  return response.data;
};

export const getAdminGallery = async () => {
  const response = await axios.get(`${API}/admin/gallery`, createAuthHeader());
  return response.data;
};

export const createGalleryImage = async (imageData) => {
  const response = await axios.post(`${API}/admin/gallery`, imageData, createAuthHeader());
  return response.data;
};

export const updateGalleryImage = async (imageId, imageData) => {
  const response = await axios.put(`${API}/admin/gallery/${imageId}`, imageData, createAuthHeader());
  return response.data;
};

export const deleteGalleryImage = async (imageId) => {
  const response = await axios.delete(`${API}/admin/gallery/${imageId}`, createAuthHeader());
  return response.data;
};

// Testimonial Management
export const getTestimonials = async () => {
  const response = await axios.get(`${API}/testimonials`);
  return response.data;
};

export const getAdminTestimonials = async () => {
  const response = await axios.get(`${API}/admin/testimonials`, createAuthHeader());
  return response.data;
};

export const createTestimonial = async (testimonialData) => {
  const response = await axios.post(`${API}/admin/testimonials`, testimonialData, createAuthHeader());
  return response.data;
};

export const updateTestimonial = async (testimonialId, testimonialData) => {
  const response = await axios.put(`${API}/admin/testimonials/${testimonialId}`, testimonialData, createAuthHeader());
  return response.data;
};

export const deleteTestimonial = async (testimonialId) => {
  const response = await axios.delete(`${API}/admin/testimonials/${testimonialId}`, createAuthHeader());
  return response.data;
};
