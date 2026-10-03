import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingFull, reviewListing, approveReview, rejectReview, applyCustomEdits } from '../services/api';
import { AlertTriangle, CheckCircle, XCircle, Edit, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';

function ReviewListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      const result = await getListingFull(id);
      setData(result);
      setReview(result.review);
      if (result.listing) {
        setEditedData({
          title: result.listing.title,
          description: result.listing.description
        });
      }
    } catch (error) {
      console.error('Error loading listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    setReviewing(true);
    try {
      const result = await reviewListing(id);
      setReview(result.review);
      await loadListing();
    } catch (error) {
      console.error('Error reviewing listing:', error);
      alert('Failed to review listing');
    } finally {
      setReviewing(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveReview(review.id, 'Approved by user');
      alert('Review approved! Listing updated with suggestions.');
      navigate('/');
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Failed to approve review');
    }
  };

  const handleReject = async () => {
    try {
      await rejectReview(review.id, 'Rejected by user');
      alert('Review rejected.');
      navigate('/');
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Failed to reject review');
    }
  };

  const handleApplyEdits = async () => {
    try {
      await applyCustomEdits(id, editedData, 'Custom edits applied');
      alert('Custom edits applied successfully!');
      setEditMode(false);
      await loadListing();
    } catch (error) {
      console.error('Error applying edits:', error);
      alert('Failed to apply edits');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[severity] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'high') return <XCircle size={20} />;
    if (severity === 'medium') return <AlertTriangle size={20} />;
    return <CheckCircle size={20} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || !data.listing) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Listing not found</p>
      </div>
    );
  }

  const { listing } = data;
  const allIssues = [
    ...(review?.deterministic_issues || []),
    ...(review?.ai_findings || [])
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Listing</h2>
          <p className="mt-1 text-sm text-gray-500">ID: {listing.id}</p>
        </div>
        <button
          onClick={handleReview}
          disabled={reviewing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {reviewing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Reviewing...
            </>
          ) : (
            <>
              <RefreshCw size={16} className="mr-2" />
              {review ? 'Re-review' : 'Start Review'}
            </>
          )}
        </button>
      </div>

      {/* Original Listing */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Listing</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <p className="mt-1 text-gray-900">{listing.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{listing.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <p className="mt-1 text-gray-900">{listing.category}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <p className="mt-1 text-gray-900">${listing.price.toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Seller</label>
              <p className="mt-1 text-gray-900">{listing.seller}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Results */}
      {review && (
        <>
          {/* Issues Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-red-50">
                <p className="text-sm text-gray-600">High Severity</p>
                <p className="text-2xl font-bold text-red-600">
                  {allIssues.filter(i => i.severity === 'high').length}
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-yellow-50">
                <p className="text-sm text-gray-600">Medium Severity</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {allIssues.filter(i => i.severity === 'medium').length}
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-blue-50">
                <p className="text-sm text-gray-600">Low Severity</p>
                <p className="text-2xl font-bold text-blue-600">
                  {allIssues.filter(i => i.severity === 'low').length}
                </p>
              </div>
            </div>
          </div>

          {/* Issues List */}
          {allIssues.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues Found</h3>
              <div className="space-y-3">
                {allIssues.map((issue, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {getSeverityIcon(issue.severity)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold">
                            {issue.field} - {issue.severity.toUpperCase()}
                          </h4>
                        </div>
                        <p className="mt-1 text-sm">{issue.issue}</p>
                        {issue.suggested_fix && (
                          <p className="mt-2 text-sm font-medium">
                            💡 Suggestion: {issue.suggested_fix}
                          </p>
                        )}
                        {issue.explanation && (
                          <p className="mt-1 text-xs opacity-75">
                            {issue.explanation}
                          </p>
                        )}
                        {issue.policy_reference && (
                          <p className="mt-1 text-xs italic">
                            Policy: {issue.policy_reference}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {(review.suggested_title || review.suggested_description) && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <Edit size={16} className="mr-1" />
                  {editMode ? 'View Mode' : 'Edit Mode'}
                </button>
              </div>

              <div className="space-y-6">
                {review.suggested_title && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suggested Title
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedData.title}
                        onChange={(e) => setEditedData({...editedData, title: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    ) : (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-gray-900">{review.suggested_title}</p>
                      </div>
                    )}
                  </div>
                )}

                {review.suggested_description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suggested Description
                    </label>
                    {editMode ? (
                      <textarea
                        rows={6}
                        value={editedData.description}
                        onChange={(e) => setEditedData({...editedData, description: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    ) : (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{review.suggested_description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
              {editMode ? (
                <button
                  onClick={handleApplyEdits}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Edit size={16} className="mr-2" />
                  Apply Custom Edits
                </button>
              ) : (
                <>
                  <button
                    onClick={handleReject}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <ThumbsDown size={16} className="mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <ThumbsUp size={16} className="mr-2" />
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ReviewListing;
