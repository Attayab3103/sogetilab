import { X, Globe, Monitor } from 'lucide-react';

interface PlatformSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlatform: (platform: 'browser' | 'desktop') => void;
}

export default function PlatformSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectPlatform 
}: PlatformSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Choose Platform</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-6">
            How would you like to connect to your interview session?
          </p>

          {/* Difference Link */}
          <div className="mb-6 text-center">
            <button className="text-blue-600 hover:text-blue-700 text-sm underline">
              🔗 Difference between Browser and Desktop App
            </button>
          </div>
          
          {/* Platform Options */}
          <div className="flex gap-3">
            <button
              onClick={() => onSelectPlatform('browser')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Browser
            </button>
            
            <button
              onClick={() => onSelectPlatform('desktop')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors relative"
            >
              <Monitor className="w-4 h-4" />
              Desktop App
              <span className="absolute -top-2 -right-2 bg-green-400 text-xs text-white px-2 py-1 rounded-full">
                NEW
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
