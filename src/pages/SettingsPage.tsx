import React, { useState, useEffect } from 'react';
import { Save, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { openRouterService } from '../services/openRouterService';

interface APISettings {
  openRouterKey: string;
  selectedModel: 'gpt-4' | 'claude-3.5' | 'gpt-3.5-turbo';
  responseLength: 'short' | 'medium' | 'long';
  responseStyle: 'professional' | 'conversational' | 'technical';
}

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<APISettings>({
    openRouterKey: '',
    selectedModel: 'gpt-4',
    responseLength: 'medium',
    responseStyle: 'professional'
  });
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key: keyof APISettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      const isConnected = await openRouterService.testConnection();
      setConnectionStatus(isConnected ? 'success' : 'error');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Save to localStorage
      localStorage.setItem('aiSettings', JSON.stringify(settings));
      
      // In a real app, you might also save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'success':
        return 'Connection successful';
      case 'error':
        return 'Connection failed';
      default:
        return 'Not tested';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">AI Settings</h2>
            <p className="text-gray-600 mt-1">Configure your AI models and response preferences</p>
          </div>

          <div className="p-6 space-y-8">
            {/* API Configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>
              
              <div className="space-y-4">
                {/* OpenRouter API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenRouter API Key
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value={settings.openRouterKey}
                      onChange={(e) => handleSettingChange('openRouterKey', e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      onClick={testConnection}
                      disabled={isTestingConnection || !settings.openRouterKey}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTestingConnection ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                      <span className="ml-2">Test</span>
                    </button>
                  </div>
                  
                  {/* Connection Status */}
                  <div className="flex items-center space-x-2 mt-2">
                    {getConnectionStatusIcon()}
                    <span className={`text-sm ${
                      connectionStatus === 'success' ? 'text-green-600' : 
                      connectionStatus === 'error' ? 'text-red-600' : 
                      'text-gray-500'
                    }`}>
                      {getConnectionStatusText()}
                    </span>
                  </div>
                </div>

                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Model
                  </label>
                  <select
                    value={settings.selectedModel}
                    onChange={(e) => handleSettingChange('selectedModel', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="gpt-4">GPT-4 Turbo (Recommended)</option>
                    <option value="claude-3.5">Claude 3.5 Sonnet</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster/Cheaper)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    GPT-4 provides the most accurate responses but uses more credits
                  </p>
                </div>
              </div>
            </div>

            {/* Response Preferences */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Response Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Response Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Length
                  </label>
                  <select
                    value={settings.responseLength}
                    onChange={(e) => handleSettingChange('responseLength', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="short">Short (1-2 sentences)</option>
                    <option value="medium">Medium (2-3 sentences)</option>
                    <option value="long">Long (Detailed explanation)</option>
                  </select>
                </div>

                {/* Response Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Style
                  </label>
                  <select
                    value={settings.responseStyle}
                    onChange={(e) => handleSettingChange('responseStyle', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="conversational">Conversational</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Current API Key Display */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Configuration</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  <p><strong>API Key:</strong> {import.meta.env.VITE_OPENROUTER_API_KEY ? '***configured***' : 'Not set'}</p>
                  <p><strong>Model:</strong> {settings.selectedModel}</p>
                  <p><strong>Response Length:</strong> {settings.responseLength}</p>
                  <p><strong>Response Style:</strong> {settings.responseStyle}</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between">
                <div>
                  {saveStatus === 'success' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="text-sm">Settings saved successfully</span>
                    </div>
                  )}
                  {saveStatus === 'error' && (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-5 w-5 mr-2" />
                      <span className="text-sm">Failed to save settings</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
