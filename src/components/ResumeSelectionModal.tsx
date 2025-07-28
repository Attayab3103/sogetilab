import { useState, useEffect } from 'react';
import { X, FileText, ChevronDown, Upload } from 'lucide-react';
import { resumeAPI } from '../services/api';

interface Resume {
  _id: string;
  title: string;
  personalDetails: {
    name: string;
    email: string;
  };
  createdAt: string;
  isDefault: boolean;
  originalFileName?: string;
}

interface ResumeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (selectedResumeId: string) => void;
  onBack?: () => void;
}

export default function ResumeSelectionModal({ isOpen, onClose, onNext, onBack }: ResumeSelectionModalProps) {
  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else {
      onClose();
    }
  };
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchResumes();
    }
  }, [isOpen]);

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await resumeAPI.getAll();
      const resumesData = response.data.data || [];
      setResumes(resumesData);
      
      // Pre-select the default resume or the first one
      if (resumesData.length > 0) {
        const defaultResume = resumesData.find((r: Resume) => r.isDefault);
        setSelectedResumeId(defaultResume?._id || resumesData[0]._id);
      }
    } catch (err: any) {
      console.error('Error fetching resumes:', err);
      setError('Failed to load resumes. Please try again.');
      // Fallback to mock data for development
      setResumes([
        {
          _id: 'mock-1',
          title: 'Software Engineer Resume',
          personalDetails: { name: 'Attayab', email: 'attayab@example.com' },
          createdAt: new Date().toISOString(),
          isDefault: true,
          originalFileName: 'CV_LATEST_2024_Attayab.pdf'
        }
      ]);
      setSelectedResumeId('mock-1');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!selectedResumeId) return;
    
    setIsLoading(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onNext(selectedResumeId);
    } catch (err) {
      console.error('Error proceeding with resume:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedResume = resumes.find(resume => resume._id === selectedResumeId);
  
  const getResumeDisplayName = (resume: Resume) => {
    return resume.originalFileName || resume.title || `Resume - ${resume.personalDetails.name}`;
  };

  const handleCreateNewResume = () => {
    // Close this modal and navigate to resume creation
    onClose();
    window.location.href = '/resume/create';
  };

  if (!isOpen) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Select Resume</h2>
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
            Choose a resume to help the AI provide more personalized answers based on your experience.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Resume Dropdown */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              Resume
            </label>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                disabled={isLoading}
              >
                <span className="text-gray-900">
                  {isLoading ? 'Loading resumes...' : 
                   selectedResume ? getResumeDisplayName(selectedResume) : 
                   resumes.length === 0 ? 'No resumes available' : 'Select a resume...'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && !isLoading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {resumes.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p>No resumes found.</p>
                      <button
                        onClick={handleCreateNewResume}
                        className="mt-2 text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        Upload a resume
                      </button>
                    </div>
                  ) : (
                    resumes.map((resume) => (
                      <button
                        key={resume._id}
                        onClick={() => {
                          setSelectedResumeId(resume._id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                          selectedResumeId === resume._id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{getResumeDisplayName(resume)}</div>
                            <div className="text-xs text-gray-500">
                              Created {new Date(resume.createdAt).toLocaleDateString()}
                              {resume.isDefault && <span className="text-blue-600 ml-2">(Default)</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              Back
            </button>
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedResumeId || isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Starting...</span>
              </div>
            ) : (
              'Start Interview'
            )}
          </button>
          </div>

          {/* Additional Options */}
          {resumes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <button
                onClick={handleCreateNewResume}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                + Upload a different resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
