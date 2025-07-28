import React, { useState } from 'react';
import { X, Building, FileText, ArrowRight } from 'lucide-react';

interface TrialSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (companyData: { company: string; jobDescription: string }) => void;
}

export default function TrialSessionModal({ isOpen, onClose, onNext }: TrialSessionModalProps) {
  const [formData, setFormData] = useState({
    company: '',
    jobDescription: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company.trim() || !formData.jobDescription.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call to validate data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call onNext with the form data to proceed to Language & Instructions modal
      if (onNext && typeof onNext === 'function') {
        console.log('Calling onNext with data:', {
          company: formData.company,
          jobDescription: formData.jobDescription
        });
        
        onNext({
          company: formData.company,
          jobDescription: formData.jobDescription
        });
      } else {
        console.error('onNext function is not available or not a function');
      }
      
    } catch (error) {
      console.error('Failed to process trial session data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = formData.company.trim() && formData.jobDescription.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 text-sm">⏱</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Trial Interview (10 min)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-6">
            Type in the what company you are interviewing with and for what position. 
            This lets the AI know what kind of answers to suggest.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4" />
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Microsoft..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
                required
              />
            </div>

            {/* Job Description Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Job Description
              </label>
              <textarea
                value={formData.jobDescription}
                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                placeholder="Software Engineer versed in Python, SQL, and AWS..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
