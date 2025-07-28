import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Download, Monitor, Smartphone, Globe } from 'lucide-react';

export const DownloadPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Download Desktop App</h1>
          <p className="mt-2 text-gray-600">Get the best interview experience with our desktop application.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Desktop App */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-8 h-8 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Desktop App</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Works seamlessly with any interview platform. Direct integration with Zoom, Teams, and more.
            </p>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Download for Windows
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                Download for macOS
              </button>
            </div>
          </div>
          
          {/* Web Version */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-8 h-8 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Web Version</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Quick and easy to use. No installation required. Works in any modern browser.
            </p>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Globe className="w-4 h-4" />
              Use Web Version
            </button>
          </div>
          
          {/* Mobile App */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-8 h-8 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Mobile App</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Interview on the go. Available for both iOS and Android devices.
            </p>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors opacity-50 cursor-not-allowed">
                <Download className="w-4 h-4" />
                Coming Soon - iOS
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors opacity-50 cursor-not-allowed">
                <Download className="w-4 h-4" />
                Coming Soon - Android
              </button>
            </div>
          </div>
        </div>
        
        {/* Comparison Table */}
        <div className="mt-12 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Feature Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Desktop App</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Web Version</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile App</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Real-time Transcription</td>
                  <td className="px-6 py-4 text-center text-green-600">✓</td>
                  <td className="px-6 py-4 text-center text-green-600">✓</td>
                  <td className="px-6 py-4 text-center text-green-600">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">AI Answer Generation</td>
                  <td className="px-6 py-4 text-center text-green-600">✓</td>
                  <td className="px-6 py-4 text-center text-green-600">✓</td>
                  <td className="px-6 py-4 text-center text-green-600">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Screen Capture</td>
                  <td className="px-6 py-4 text-center text-green-600">✓</td>
                  <td className="px-6 py-4 text-center text-red-600">✗</td>
                  <td className="px-6 py-4 text-center text-red-600">✗</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Platform Integration</td>
                  <td className="px-6 py-4 text-center text-green-600">✓</td>
                  <td className="px-6 py-4 text-center text-yellow-600">Partial</td>
                  <td className="px-6 py-4 text-center text-yellow-600">Partial</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Offline Mode</td>
                  <td className="px-6 py-4 text-center text-green-600">✓</td>
                  <td className="px-6 py-4 text-center text-red-600">✗</td>
                  <td className="px-6 py-4 text-center text-red-600">✗</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};
