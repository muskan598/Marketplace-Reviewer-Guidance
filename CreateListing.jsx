import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from '../services/api';
import { Save, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Food & Beverages',
  'Pet Supplies',
  'Office Supplies',
  'Music & Movies'
];

function CreateListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    seller: '',
    attributes: {},
    tags: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const listingData = {
        ...formData,
        price: parseFloat(formData.price),
        tags: formData.tags.filter(tag => tag.trim() !== '')
      };

      const result = await createListing(listingData);
      navigate(`/review/${result.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create New Listing</h2>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the product details to create a new marketplace listing
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="text-red-600" size={20} />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            placeholder="e.g., Samsung 65-inch 4K Smart TV"
          />
          <p className="mt-1 text-xs text-gray-500">Min 10 characters, Max 200 characters</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={6}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            placeholder="Detailed product description including features, specifications, and condition..."
          />
          <p className="mt-1 text-xs text-gray-500">Min 20 characters</p>
        </div>

        {/* Category and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price ($) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
              placeholder="19.99"
            />
          </div>
        </div>

        {/* Seller */}
        <div>
          <label htmlFor="seller" className="block text-sm font-medium text-gray-700">
            Seller Name *
          </label>
          <input
            type="text"
            id="seller"
            name="seller"
            required
            value={formData.seller}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            placeholder="Your name or seller ID"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags (Optional)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags.join(', ')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              tags: e.target.value.split(',').map(t => t.trim())
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            placeholder="e.g., new, warranty, free-shipping"
          />
          <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Create Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateListing;
