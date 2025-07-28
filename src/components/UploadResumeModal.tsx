import React, { useState } from 'react';
import { X, Upload, ArrowLeft } from 'lucide-react';

interface UploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadPDF: (fileName: string) => void;
  onInputManually: (title: string) => void;
}

export const UploadResumeModal: React.FC<UploadResumeModalProps> = ({
  isOpen,
  onClose,
  onUploadPDF,
  onInputManually
}) => {
  const [showManualInput, setShowManualInput] = useState(false);
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleManualInputClick = () => {
    setShowManualInput(true);
  };

  const handlePDFUploadClick = () => {
    setShowPDFUpload(true);
  };

  const handleBackClick = () => {
    setShowManualInput(false);
    setShowPDFUpload(false);
    setSelectedFile(null);
  };

  const handleCreateResume = () => {
    // TODO: Implement create resume functionality
    console.log('Create resume with title:', title);
    onInputManually(title);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please drop a PDF file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUploadResume = () => {
    if (selectedFile && title.trim()) {
      // TODO: Implement actual file upload
      console.log('Upload resume:', { file: selectedFile, title });
      onUploadPDF(selectedFile.name);
    } else {
      alert('Please select a file and enter a title');
    }
  };

  const handleClose = () => {
    setShowManualInput(false);
    setShowPDFUpload(false);
    setTitle('');
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload Resume</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 text-sm mb-6 text-center">
            The contents of the resume will be used to generate interview answers.
          </p>
          
          {!showManualInput && !showPDFUpload ? (
            /* Initial Buttons */
            <div className="space-y-3">
              <button
                onClick={handlePDFUploadClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload PDF Resume
              </button>
              
              <button
                onClick={handleManualInputClick}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Input Manually
              </button>
            </div>
          ) : showPDFUpload ? (
            /* PDF Upload Interface */
            <div className="space-y-4">
              {/* File Drop Zone */}
              <div
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Drop your PDF resume here or click to browse.
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="inline-block px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Upload Files
                </label>
                {selectedFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              
              {/* Title Input */}
              <div>
                <label htmlFor="pdf-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  id="pdf-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Resume"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBackClick}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                
                <button
                  onClick={handleUploadResume}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Upload Resume
                </button>
              </div>
            </div>
          ) : (
            /* Manual Input Form */
            <div className="space-y-4">
              <div>
                <label htmlFor="resume-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  id="resume-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Resume"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBackClick}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                
                <button
                  onClick={handleCreateResume}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Create Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
