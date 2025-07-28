import { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';

interface TranscriptSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: (settings: { saveTranscript: boolean }) => void;
}

export default function TranscriptSummaryModal({ 
  isOpen, 
  onClose, 
  onBack, 
  onNext 
}: TranscriptSummaryModalProps) {
  const [saveTranscript, setSaveTranscript] = useState(true);

  if (!isOpen) return null;

  const handleNext = () => {
    onNext({ saveTranscript });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">AI Interview Transcript/Summary</h2>
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
            Choose whether to save the transcript/summary of your interview.
          </p>
          
          {/* Toggle Option */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">Save Transcript/Summary</span>
              <span className="text-xs text-gray-500">(Optional)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={saveTranscript}
                onChange={(e) => setSaveTranscript(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {saveTranscript && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                If you check this option, a transcript/summary of the interview will be 
                saved with an AI analysis of the interview. You will be able to view 
                and analyze the summary in your dashboard.
              </p>
            </div>
          )}

          {/* Legal Disclaimer */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Legal Disclaimer:</strong> You must comply with all applicable recording laws 
              when using this transcription app. Many jurisdictions require consent 
              from all parties being recorded. Recording without proper consent 
              may be illegal.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
