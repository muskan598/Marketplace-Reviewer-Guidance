import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import ReviewListing from './pages/ReviewListing';
import ListingHistory from './pages/ListingHistory';
import BatchUpload from './pages/BatchUpload';
import { Menu } from 'lucide-react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
                >
                  <Menu size={24} />
                </button>
                <h1 className="ml-2 text-xl font-bold text-gray-900">
                  Marketplace Listing Quality Reviewer
                </h1>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } fixed lg:static lg:translate-x-0 z-10 w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out`}
          >
            <nav className="mt-5 px-4 space-y-1">
              <Link
                to="/"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <Link
                to="/create"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Create Listing
              </Link>
              <Link
                to="/batch"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Batch Upload
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateListing />} />
              <Route path="/review/:id" element={<ReviewListing />} />
              <Route path="/history/:id" element={<ListingHistory />} />
              <Route path="/batch" element={<BatchUpload />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
