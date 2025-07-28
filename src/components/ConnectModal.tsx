import { useState } from 'react';
import { X, ArrowLeft, ChevronDown, Settings, Globe, AlertCircle } from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onConnect: (settings: {
    language: string;
    simpleEnglish: boolean;
    aiModel: string;
  }) => void;
  company: string;
  position: string;
  resumeTitle: string;
}

export default function ConnectModal({ 
  isOpen, 
  onClose, 
  onBack, 
  onConnect,
  company,
  position,
  resumeTitle
}: ConnectModalProps) {
  const [language, setLanguage] = useState('English');
  const [simpleEnglish, setSimpleEnglish] = useState(false);
  const [aiModel, setAiModel] = useState('gpt-4');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  if (!isOpen) return null;

  const requestPermissions = async () => {
    try {
      // Request microphone permission
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getTracks().forEach(track => track.stop()); // Stop the stream after getting permission
      
      // Request screen sharing permission (this will show the browser dialog)
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });
      screenStream.getTracks().forEach(track => track.stop()); // Stop the stream after getting permission
      
      return true;
    } catch (error) {
      console.error('Permission denied:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setPermissionError('Screen sharing and microphone access are required for the interview session. Please allow access and try again.');
        } else if (error.name === 'NotFoundError') {
          setPermissionError('No microphone or screen sharing capability found. Please check your browser settings.');
        } else {
          setPermissionError('Permission request failed. Please ensure your browser supports screen sharing and microphone access.');
        }
      }
      return false;
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setPermissionError(null);
    
    // Request browser permissions first
    const permissionsGranted = await requestPermissions();
    
    if (permissionsGranted) {
      // Permissions granted, proceed with connection
      onConnect({
        language,
        simpleEnglish,
        aiModel
      });
    }
    
    setIsConnecting(false);
  };

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
  const models = [
    { id: 'gpt-4', name: 'GPT-4 (OpenRouter)' },
    { id: 'gpt-4.1', name: 'GPT-4.1 (OpenRouter)' },
    { id: 'claude-3.5', name: 'Claude 3.5 (OpenRouter)' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (OpenRouter)' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Connect</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Session Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              This is an Interview Session for a position <strong>"{position}"</strong> at{' '}
              <strong>"{company}"</strong> with <strong>{resumeTitle}</strong> and{' '}
              <strong>extra context</strong>.
            </p>
          </div>

          {/* Language Settings */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Language</label>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{language}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {isLanguageOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLanguageOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Simple English Toggle */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-700">Simple</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={simpleEnglish}
                  onChange={(e) => setSimpleEnglish(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* AI Model Settings */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">AI Model</label>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsModelOpen(!isModelOpen)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{models.find(m => m.id === aiModel)?.name || 'Select model'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {isModelOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setAiModel(model.id);
                        setIsModelOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${aiModel === model.id ? 'bg-blue-50 font-semibold' : ''}`}
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Screen Sharing Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs">ℹ</span>
              </div>
              <p className="text-sm text-blue-800">
                Make sure to select the "Also share tab audio" option when 
                sharing the screen.
              </p>
            </div>
          </div>

          {/* Platform Icons */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">How to Connect:</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">Z</span>
              </div>
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white text-xs">📹</span>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs">📱</span>
              </div>
              <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                <span className="text-white text-xs">🎥</span>
              </div>
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white text-xs">📞</span>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm underline ml-2">
                📺 Video Tutorial
              </button>
            </div>
          </div>

          {/* Mock Interview Option */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-16 h-12 bg-gray-300 rounded flex items-center justify-center">
                <span className="text-xs">▶️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <strong>🎬 Instead of an interview tab, you can also share a mock interview</strong> on YouTube 
                  and test ParakeetAI that way.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Example video: <button className="text-blue-600 hover:underline">Mock Interview</button>
                </p>
              </div>
            </div>
          </div>

          {/* Permission Instructions */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  🔐 Browser Permissions Required
                </p>
                <p className="text-sm text-blue-700">
                  When you click "Activate and Connect", your browser will ask for:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• <strong>Screen Sharing:</strong> To capture your interview screen</li>
                  <li>• <strong>Microphone Access:</strong> To transcribe interview questions</li>
                  <li>• <strong>Tab Audio:</strong> Make sure to enable "Also share tab audio"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Permission Error Display */}
          {permissionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{permissionError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              disabled={isConnecting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Requesting Permissions...
                </>
              ) : (
                <>
                  🔗 Activate and Connect
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
