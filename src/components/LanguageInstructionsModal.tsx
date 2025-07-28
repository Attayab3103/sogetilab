import { useState } from 'react';
import { X, Globe, Brain, ChevronDown } from 'lucide-react';

interface LanguageInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (settings: LanguageSettings) => void;
  onBack?: () => void;
}

interface LanguageSettings {
  language: string;
  simpleEnglish: boolean;
  extraInstructions: string;
  aiModel: string;
}

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Dutch', 'Swedish'
];

const aiModels = [
  { id: 'gpt-4', name: 'GPT-4 (OpenRouter)', description: 'Most advanced model' },
  { id: 'gpt-4.1', name: 'GPT-4.1 (OpenRouter)', description: 'Smarter, newer GPT-4' },
  { id: 'claude-3.5', name: 'Claude 3.5 (OpenRouter)', description: 'Anthropic Claude, fast and accurate' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (OpenRouter)', description: 'Fast, cost-effective' }
];

export default function LanguageInstructionsModal({ 
  isOpen, 
  onClose, 
  onNext, 
  onBack
}: LanguageInstructionsModalProps) {
  const [settings, setSettings] = useState<LanguageSettings>({
    language: 'English',
    simpleEnglish: false,
    extraInstructions: '',
    aiModel: 'gpt-4'
  });

  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    console.log('Language modal - Next clicked with settings:', settings);
    onNext(settings);
  };

  const handleBack = () => {
    console.log('Language modal - Back clicked');
    if (typeof onBack === 'function') {
      onBack();
    } else {
      onClose();
    }
  };

  const updateSetting = (key: keyof LanguageSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const selectedModel = aiModels.find(model => model.id === settings.aiModel);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Language & Instructions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-600 text-sm">
            Choose your language and provide special instructions for the AI when generating answers.
          </p>

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Globe className="w-4 h-4" />
              Language
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
              >
                <span>{settings.language}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showLanguageDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                  {languages.map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => {
                        updateSetting('language', language);
                        setShowLanguageDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      {language}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Simple English Toggle */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Simple English</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">(Optional)</span>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.simpleEnglish}
                onChange={(e) => updateSetting('simpleEnglish', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                If English is not your first language, you can use this option to make sure the AI doesn't use complex words.
              </span>
            </label>
          </div>

          {/* Extra Context/Instructions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Extra Context/Instructions</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">(Optional)</span>
            </div>
            <textarea
              value={settings.extraInstructions}
              onChange={(e) => updateSetting('extraInstructions', e.target.value)}
              placeholder="Be more technical, use a more casual tone, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* AI Model Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="text-sm font-medium text-gray-700">AI Model</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">(Optional)</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-gray-600" />
                  <span>{selectedModel?.name}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showModelDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  {aiModels.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        updateSetting('aiModel', model.id);
                        setShowModelDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-gray-600" />
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-gray-500">{model.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center gap-2"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
