import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Listing operations
export const createListing = async (listingData) => {
  const response = await api.post('/listings', listingData);
  return response.data;
};

export const getListings = async () => {
  const response = await api.get('/listings');
  return response.data;
};

export const getListing = async (id) => {
  const response = await api.get(`/listings/${id}`);
  return response.data;
};

export const getListingFull = async (id) => {
  const response = await api.get(`/listings/${id}/full`);
  return response.data;
};

export const updateListing = async (id, updateData) => {
  const response = await api.put(`/listings/${id}`, updateData);
  return response.data;
};

export const deleteListing = async (id) => {
  const response = await api.delete(`/listings/${id}`);
  return response.data;
};

// Review operations
export const reviewListing = async (id) => {
  const response = await api.post(`/listings/${id}/review`);
  return response.data;
};

export const getListingReviews = async (id) => {
  const response = await api.get(`/listings/${id}/reviews`);
  return response.data;
};

export const approveReview = async (reviewId, notes = null) => {
  const response = await api.post(`/reviews/${reviewId}/approve`, { notes });
  return response.data;
};

export const rejectReview = async (reviewId, notes = null) => {
  const response = await api.post(`/reviews/${reviewId}/reject`, { notes });
  return response.data;
};

export const applyCustomEdits = async (listingId, edits, notes = null) => {
  const response = await api.post(`/listings/${listingId}/apply-suggestions`, { edits, notes });
  return response.data;
};

// History operations
export const getListingHistory = async (id) => {
  const response = await api.get(`/listings/${id}/history`);
  return response.data;
};

// Batch operations
export const uploadBatchCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/batch/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const batchReviewListings = async (listingIds) => {
  const response = await api.post('/batch/review', listingIds);
  return response.data;
};

// Statistics
export const getStatistics = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export default api;
