import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { UploadResumeModal } from '../components/UploadResumeModal';
import ResumeForm from '../components/ResumeForm';
import ResumeParsingModal from '../components/ResumeParsingModal';
import { resumeAPI } from '../services/api';
import { FileText, Calendar, Trash2, Star, Edit } from 'lucide-react';

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

export const ResumesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResumeForm, setShowResumeForm] = useState(false);
  const [showParsingModal, setShowParsingModal] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [parsedResumeData, setParsedResumeData] = useState<any>(null);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch resumes on component mount
  useEffect(() => {
    fetchResumes();
  }, []);

  const handleEditResume = useCallback(async (resumeId: string) => {
    try {
      const response = await resumeAPI.getById(resumeId);
      const resumeData = response.data.data;
      
      setEditingResumeId(resumeId);
      setResumeTitle(resumeData.title);
      setParsedResumeData(resumeData);
      setShowResumeForm(true);
      
      // Clear the edit parameter from URL
      setSearchParams({});
    } catch (error) {
      console.error('Error fetching resume for editing:', error);
      setError('Failed to load resume for editing.');
    }
  }, [setSearchParams]);

  // Handle edit query parameter
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && resumes.length > 0) {
      handleEditResume(editId);
    }
  }, [searchParams, resumes, handleEditResume]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await resumeAPI.getAll();
      setResumes(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching resumes:', err);
      setError('Failed to load resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      await resumeAPI.delete(resumeId);
      setResumes(resumes.filter(resume => resume._id !== resumeId));
    } catch (err: any) {
      console.error('Error deleting resume:', err);
      toast.error('Failed to delete resume. Please try again.');
    }
  };

  const handleSetDefault = async (resumeId: string) => {
    try {
      await resumeAPI.setDefault(resumeId);
      setResumes(resumes.map(resume => ({
        ...resume,
        isDefault: resume._id === resumeId
      })));
    } catch (err: any) {
      console.error('Error setting default resume:', err);
      toast.error('Failed to set default resume. Please try again.');
    }
  };

  const getResumeDisplayName = (resume: Resume) => {
    return resume.originalFileName || resume.title || `Resume - ${resume.personalDetails.name}`;
  };

  const handleUploadClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowParsingModal(false);
  };

  const handleUploadPDF = (fileName: string) => {
    // Show parsing modal instead of directly closing
    setUploadedFileName(fileName);
    setIsModalOpen(false);
    setShowParsingModal(true);
  };

  const handleInputManually = (title: string) => {
    // Show the resume form instead of just closing modal
    console.log('Input manually clicked with title:', title);
    setResumeTitle(title || 'My Resume');
    setParsedResumeData(null); // Clear any parsed data for manual input
    setShowResumeForm(true);
    setIsModalOpen(false);
  };

  const handleParsingComplete = (parsedData: any) => {
    setParsedResumeData(parsedData);
    setResumeTitle(parsedData.title);
    setShowParsingModal(false);
    setShowResumeForm(true);
  };

  const handleBackToResumesList = () => {
    setShowResumeForm(false);
    setShowParsingModal(false);
    setResumeTitle('');
    setParsedResumeData(null);
    setUploadedFileName('');
    setEditingResumeId(null);
    // Refresh resumes list after creating/editing
    fetchResumes();
  };

  const handleBackToUploadModal = () => {
    setShowParsingModal(false);
    setIsModalOpen(true);
  };

  // If showing parsing modal, render that
  if (showParsingModal) {
    return (
      <ResumeParsingModal
        isOpen={showParsingModal}
        onClose={handleCloseModal}
        fileName={uploadedFileName}
        onParsingComplete={handleParsingComplete}
        onBack={handleBackToUploadModal}
      />
    );
  }

  // If showing resume form, render that instead
  if (showResumeForm) {
    return (
      <div className="flex flex-col h-full">
        <ResumeForm 
          onBack={handleBackToResumesList}
          initialTitle={resumeTitle}
          parsedData={parsedResumeData}
          editingResumeId={editingResumeId}
        />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">CVs / Resumes</h1>
        <button 
          onClick={handleUploadClick}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Upload Resume
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900">Title</div>
            <div className="text-sm font-medium text-gray-900 text-center">Created At</div>
            <div className="text-sm font-medium text-gray-900 text-right">Actions</div>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="px-6 py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Loading resumes...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="px-6 py-16 text-center">
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button 
                onClick={fetchResumes}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Resume List */}
          {!loading && !error && resumes.length > 0 && (
            <div className="divide-y divide-gray-200">
              {resumes.map((resume) => (
                <div key={resume._id} className="grid grid-cols-3 gap-4 px-6 py-4 hover:bg-gray-50">
                  <div 
                    className="flex items-center space-x-3 cursor-pointer" 
                    onClick={() => handleEditResume(resume._id)}
                  >
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {getResumeDisplayName(resume)}
                        {resume.isDefault && (
                          <Star className="w-4 h-4 text-yellow-500 inline ml-2" fill="currentColor" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {resume.personalDetails.name} • {resume.personalDetails.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEditResume(resume._id)}
                      className="p-1 text-gray-400 hover:text-blue-500"
                      title="Edit Resume"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!resume.isDefault && (
                      <button
                        onClick={() => handleSetDefault(resume._id)}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteResume(resume._id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && resumes.length === 0 && (
            <div className="px-6 py-16 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm mb-4">No Resumes yet.</p>
              <button 
                onClick={handleUploadClick}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
              >
                Upload your first resume
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Resume Modal */}
      <UploadResumeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUploadPDF={handleUploadPDF}
        onInputManually={handleInputManually}
      />
      </div>
    </DashboardLayout>
  );
};
