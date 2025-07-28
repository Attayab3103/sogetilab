import { X, ArrowLeft, AlertCircle } from 'lucide-react';

interface ReadyToCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  isTrial?: boolean;
}

export default function ReadyToCreateModal(props: ReadyToCreateModalProps) {
  const { isOpen, onClose, onBack, onNext, isTrial = true } = props;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Ready to Create</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="p-6">
          {/* Warning Message and Instructions only for trial */}
          {isTrial && (
            <>
              <div className="flex items-start gap-3 mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">
                  <strong>This is a 10 minute trial session.</strong>
                </p>
              </div>
              <div className="space-y-4 mb-6">
                <p className="text-sm text-gray-700">
                  The timer will not start until you connect your screen sharing.
                </p>
                <p className="text-sm text-gray-700">
                  You won't be able to create another trial session for the next 15 minutes.
                </p>
              </div>
            </>
          )}
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
              onClick={onNext}
              className="flex-1 px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isTrial ? 'Create Trial Session' : 'Create Session'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
