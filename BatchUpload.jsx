import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadBatchCSV } from '../services/api';
import { Upload, FileText, CheckCircle, XCircle, Download } from 'lucide-react';

function BatchUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setResults(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadBatchCSV(file);
      setResults(result);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `title,description,category,price,seller,attributes,tags
"Samsung 65-inch 4K Smart TV","High-quality 4K TV with smart features and voice control. Perfect for movie enthusiasts.","Electronics",899.99,"TechStore","{""brand"": ""Samsung"", ""model"": ""QN65Q80A""}","[""new"", ""warranty""]"
"Nike Running Shoes Size 10","Comfortable running shoes with excellent cushioning and support. Brand new with box.","Clothing",79.99,"SportsGear","{""size"": ""10"", ""color"": ""black""}","[""new"", ""athletic""]"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'listing_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Batch Upload</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload multiple listings at once using a CSV file
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Download the CSV template below</li>
          <li>Fill in your product listings following the format</li>
          <li>Required columns: title, description, category, price, seller</li>
          <li>Optional columns: attributes (JSON format), tags (JSON array)</li>
          <li>Upload the completed CSV file</li>
        </ol>
        <button
          onClick={downloadTemplate}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
        >
          <Download size={16} className="mr-2" />
          Download CSV Template
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <Upload className="mx-auto text-gray-400" size={48} />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">
                  Select CSV File
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {file && (
              <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                <FileText size={16} className="mr-2" />
                {file.name}
              </div>
            )}
          </div>
        </div>

        {file && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Upload and Process
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Results</h3>
          
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{results.total}</p>
            </div>
            <div className="border rounded-lg p-4 bg-green-50">
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-green-600">{results.successful}</p>
            </div>
            <div className="border rounded-lg p-4 bg-red-50">
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{results.failed}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            {results.results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border flex items-center justify-between ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center">
                  {result.status === 'success' ? (
                    <CheckCircle className="text-green-600 mr-3" size={20} />
                  ) : (
                    <XCircle className="text-red-600 mr-3" size={20} />
                  )}
                  <div>
                    {result.status === 'success' ? (
                      <p className="text-sm font-medium text-green-900">
                        {result.title}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-red-900">
                          Failed to import
                        </p>
                        <p className="text-xs text-red-700 mt-1">{result.error}</p>
                      </>
                    )}
                  </div>
                </div>
                {result.status === 'success' && (
                  <button
                    onClick={() => navigate(`/review/${result.listing_id}`)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Review →
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BatchUpload;
