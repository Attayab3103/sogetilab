import { useState, useEffect } from 'react';
import { X, Trash2, ArrowLeft } from 'lucide-react';

interface ResumeParsingModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  onParsingComplete: (parsedData: any) => void;
  onBack: () => void;
}

export default function ResumeParsingModal({ 
  isOpen, 
  onClose, 
  fileName, 
  onParsingComplete,
  onBack 
}: ResumeParsingModalProps) {
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Simulate parsing process
      setIsParsing(true);
      const timer = setTimeout(() => {
        setIsParsing(false);
        // Mock parsed data - in real app this would come from PDF parsing service
        const mockParsedData = {
          title: fileName.replace('.pdf', ''),
          personalDetails: {
            name: 'Muhammad Attayab Ashraf',
            email: 'F2021065194@umt.edu.pk',
            address: 'House No 443, Block 5 Sector C2, Green Town',
            phone: '03174026038'
          },
          introduction: 'As a dedicated and proactive software engineer currently in the last semester at the University of Management and Technology, I am seeking an opportunity to apply my skills and knowledge in a dynamic work environment. With a solid foundation in various programming languages and frameworks, I am eager to contribute to innovative projects and grow professionally within your organization.',
          education: [
            {
              id: '1',
              school: 'University of Management and Technology',
              degree: 'B.Sc. Software Engineering',
              timeStart: '2021',
              timeEnd: '2025',
              location: 'Lahore, Pakistan',
              description: 'Currently pursuing Bachelor of Science in Software Engineering with focus on modern development practices and technologies.'
            }
          ],
          experience: [
            {
              id: '1',
              company: 'Tech Solutions Inc',
              position: 'Software Engineer Intern',
              timeStart: '2023',
              timeEnd: '2024',
              location: 'Lahore, Pakistan',
              description: 'Worked on web development projects using React and Node.js, collaborated with senior developers on enterprise applications.'
            }
          ],
          otherExperience: [
            {
              id: '1',
              title: 'Open Source Contributions',
              description: 'Contributed to various open source projects on GitHub, focusing on React components and utility libraries.'
            }
          ]
        };
        
        onParsingComplete(mockParsedData);
      }, 3000); // 3 second parsing simulation

      return () => clearTimeout(timer);
    }
  }, [isOpen, fileName, onParsingComplete]);

  if (!isOpen) return null;

  const handleDelete = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload Resume</h2>
          <button
            onClick={onClose}
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
          
          {/* File Display */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
            <span className="text-sm text-gray-700 flex-1 truncate">
              📄 {fileName}
            </span>
            <button
              onClick={handleDelete}
              className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={fileName.replace('.pdf', '')}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isParsing}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <button
              className="flex-1 px-4 py-3 bg-gray-600 text-white text-sm font-medium rounded-lg cursor-not-allowed"
              disabled
            >
              {isParsing ? 'Parsing...' : 'Parsing...'}
            </button>
          </div>

          {/* Warning Message */}
          {isParsing && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 text-sm text-center">
                <strong>Warning:</strong> Parsing may take up to 1 minute.<br />
                Stay on this page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
