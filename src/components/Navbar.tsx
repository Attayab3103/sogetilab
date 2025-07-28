import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings, Play } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
              P
            </div>
            <span className="text-xl font-bold text-gray-900">SOGETI LAB</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/features" 
              className={`${
                isActive('/features') 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-700 hover:text-blue-600'
              } transition-colors duration-200`}
            >
              Features
            </Link>
            <Link 
              to="/reviews" 
              className={`${
                isActive('/reviews') 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-700 hover:text-blue-600'
              } transition-colors duration-200`}
            >
              Reviews
            </Link>
            <Link 
              to="/pricing" 
              className={`${
                isActive('/pricing') 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-700 hover:text-blue-600'
              } transition-colors duration-200`}
            >
              Pricing
            </Link>
            
            {/* Desktop App Badge */}
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <Play className="h-4 w-4" />
              <span>Desktop App</span>
              <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                New
              </span>
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Credits Display */} 
                <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  <span>Credits: {user.credits || 0}</span>
                </div>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="hidden sm:inline font-medium">{user.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link 
                        to="/dashboard" 
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link 
                        to="/settings" 
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <hr className="my-2" />
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="px-4 py-3 space-y-2">
          <Link 
            to="/features" 
            className={`block py-2 ${
              isActive('/features') 
                ? 'text-blue-600 font-semibold' 
                : 'text-gray-700'
            }`}
          >
            Features
          </Link>
          <Link 
            to="/reviews" 
            className={`block py-2 ${
              isActive('/reviews') 
                ? 'text-blue-600 font-semibold' 
                : 'text-gray-700'
            }`}
          >
            Reviews
          </Link>
          <Link 
            to="/pricing" 
            className={`block py-2 ${
              isActive('/pricing') 
                ? 'text-blue-600 font-semibold' 
                : 'text-gray-700'
            }`}
          >
            Pricing
          </Link>
          
          {/* Mobile Desktop App Badge */}
          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium w-fit">
            <Play className="h-4 w-4" />
            <span>Desktop App</span>
            <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              New
            </span>
          </div>
          
          {user && (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                Credits: {user.credits || 0}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
