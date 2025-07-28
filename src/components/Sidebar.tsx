import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Video, 
  FileText, 
  Download, 
  Mail, 
  CreditCard,
  User
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Video, label: 'Interview Sessions', href: '/interview-sessions' },
    { icon: FileText, label: 'CVs / Resumes', href: '/resumes' },
    { icon: Download, label: 'Download Desktop App', href: '/download' },
    { icon: Mail, label: 'Email Support', href: 'mailto:support@jyothis-ai.com', external: true },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-bold text-gray-900">SOGETI LAB</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            if (item.external) {
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                </li>
              );
            }
            
            return (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Credits Section */}
      <div className="px-4 pb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">Interview Credits</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Start a 10min free trial session or buy credits for full-length interview sessions.
          </p>
          <button className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200">
            Get Credits
          </button>
        </div>

        {/* User Info */}
        <div className="mt-4 flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email || 'attayabpc2@gmail.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
