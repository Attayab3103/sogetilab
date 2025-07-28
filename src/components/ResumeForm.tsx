import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Plus, Trash2, Check } from 'lucide-react';
import { resumeAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ResumeFormProps {
  onBack: () => void;
  initialTitle?: string;
  parsedData?: any;
  editingResumeId?: string | null;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  description: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  description: string;
}

interface OtherExperience {
  id: string;
  title: string;
  description: string;
}

export default function ResumeForm({ onBack, initialTitle = 'My Resume', parsedData, editingResumeId }: ResumeFormProps) {
  const { user } = useAuth();
  const [resumeId, setResumeId] = useState<string | null>(editingResumeId || null);
  const [title, setTitle] = useState(parsedData?.title || initialTitle);
  const [isAutoSaved, setIsAutoSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [personalDetails, setPersonalDetails] = useState(
    parsedData?.personalDetails || {
      name: 'Attayab Advait',
      email: 'attayabadvait@gmail.com',
      address: '123 Main St, Anytown, USA',
      phone: '(123) 456-7890'
    }
  );
  const [introduction, setIntroduction] = useState(parsedData?.introduction || 'Introduction');
  
  const [education, setEducation] = useState<Education[]>(
    parsedData?.education || [
      {
        id: '1',
        school: 'Example',
        degree: 'Bachelor of Science',
        timeStart: '2018',
        timeEnd: '2022',
        location: 'New York',
        description: 'Description'
      }
    ]
  );

  const [experience, setExperience] = useState<Experience[]>(
    parsedData?.experience || [
      {
        id: '1',
        company: 'Example',
        position: 'Software Engineer',
        timeStart: '2022',
        timeEnd: '2024',
        location: 'New York',
        description: 'Description'
      }
    ]
  );

  const [otherExperience, setOtherExperience] = useState<OtherExperience[]>(
    parsedData?.otherExperience || [
      {
        id: '1',
        title: 'Open Source Contribution',
        description: 'Description'
      }
    ]
  );

  const [skills] = useState<string[]>(
    parsedData?.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB']
  );

  const [languages] = useState<string[]>(
    parsedData?.languages || ['English', 'Urdu']
  );

  // Auto-save functionality
  const saveResumeData = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const resumeData = {
        title,
        personalDetails,
        introduction,
        education: education.map(edu => ({
          school: edu.school,
          degree: edu.degree,
          timeStart: edu.timeStart,
          timeEnd: edu.timeEnd,
          location: edu.location,
          description: edu.description,
        })),
        experience: experience.map(exp => ({
          company: exp.company,
          position: exp.position,
          timeStart: exp.timeStart,
          timeEnd: exp.timeEnd,
          location: exp.location,
          description: exp.description,
        })),
        otherExperience: otherExperience.map(other => ({
          title: other.title,
          description: other.description,
        })),
        skills: skills,
        languages: languages,
        parsedFromPdf: parsedData ? true : false,
      };

      if (resumeId) {
        // Update existing resume
        await resumeAPI.update(resumeId, resumeData);
      } else {
        // Create new resume
        const response = await resumeAPI.create(resumeData);
        setResumeId(response.data.data._id);
      }
      
      setIsAutoSaved(true);
      console.log('Resume auto-saved successfully');
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show error to user for auto-save failures
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setIsAutoSaved(false); // Reset auto-save status when data changes
    
    const autoSaveTimer = setTimeout(() => {
      saveResumeData();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [title, personalDetails, introduction, education, experience, otherExperience]);

  const handleBack = async () => {
    // Trigger auto-save before going back
    if (!isAutoSaved && !isSaving) {
      await saveResumeData();
    }
    setTimeout(() => {
      onBack();
    }, 500); // Small delay to show auto-saved status
  };

  // Helper function to handle input changes and reset auto-save status
  const handleInputChange = (setter: Function, value: any) => {
    setIsAutoSaved(false);
    setter(value);
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      timeStart: '',
      timeEnd: '',
      location: '',
      description: ''
    };
    setEducation([...education, newEducation]);
  };

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      timeStart: '',
      timeEnd: '',
      location: '',
      description: ''
    };
    setExperience([...experience, newExperience]);
  };

  const addOtherExperience = () => {
    const newOther: OtherExperience = {
      id: Date.now().toString(),
      title: '',
      description: ''
    };
    setOtherExperience([...otherExperience, newOther]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const removeExperience = (id: string) => {
    setExperience(experience.filter(exp => exp.id !== id));
  };

  const removeOtherExperience = (id: string) => {
    setOtherExperience(otherExperience.filter(other => other.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setIsAutoSaved(false);
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setIsAutoSaved(false);
    setExperience(experience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const updateOtherExperience = (id: string, field: keyof OtherExperience, value: string) => {
    setIsAutoSaved(false);
    setOtherExperience(otherExperience.map(other => 
      other.id === id ? { ...other, [field]: value } : other
    ));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            {isSaving && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
            {!isSaving && isAutoSaved && <Check className="w-4 h-4 text-green-600" />}
            <span className={`text-sm ${
              isSaving ? 'text-blue-600' : 
              isAutoSaved ? 'text-green-600' : 
              'text-gray-500'
            }`}>
              {isSaving ? 'Saving...' : isAutoSaved ? 'Saved' : 'Auto Saved'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
            Edit
          </button>
          <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {/* Header Text */}
            <p className="text-gray-600 text-sm mb-6 text-center">
              The contents of the resume will be used to generate interview answers.
            </p>

            {/* Title Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-xs">📄</span>
                </div>
                <h2 className="text-lg font-semibold">Title</h2>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => handleInputChange(setTitle, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="My Resume"
              />
            </div>

            {/* Personal Details Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs">👤</span>
                </div>
                <h2 className="text-lg font-semibold">Personal Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={personalDetails.name}
                    onChange={(e) => handleInputChange(setPersonalDetails, {...personalDetails, name: e.target.value})}
                    className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={personalDetails.address}
                    onChange={(e) => handleInputChange(setPersonalDetails, {...personalDetails, address: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={personalDetails.email}
                    onChange={(e) => handleInputChange(setPersonalDetails, {...personalDetails, email: e.target.value})}
                    className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={personalDetails.phone}
                    onChange={(e) => handleInputChange(setPersonalDetails, {...personalDetails, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Introduction Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-white text-xs">📝</span>
                  </div>
                  <h2 className="text-lg font-semibold">Introduction</h2>
                </div>
                <Edit2 className="w-4 h-4 text-gray-400" />
              </div>
              <textarea
                value={introduction}
                onChange={(e) => handleInputChange(setIntroduction, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                placeholder="Introduction"
              />
            </div>

            {/* Education Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-white text-xs">🎓</span>
                  </div>
                  <h2 className="text-lg font-semibold">Education</h2>
                </div>
                <button
                  onClick={addEducation}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Add Education <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {education.map((edu, index) => (
                <div key={edu.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Education {index + 1}</span>
                    </div>
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                        className="w-full p-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Example"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full p-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Bachelor of Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.timeStart}
                          onChange={(e) => updateEducation(edu.id, 'timeStart', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="2018-2019"
                        />
                        <input
                          type="text"
                          value={edu.timeEnd}
                          onChange={(e) => updateEducation(edu.id, 'timeEnd', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="2019-2020"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={edu.location}
                        onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                        className="w-full p-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="relative">
                      <textarea
                        value={edu.description}
                        onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                        placeholder="Description"
                      />
                      <Edit2 className="absolute top-2 right-2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Job Experience Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">💼</span>
                  </div>
                  <h2 className="text-lg font-semibold">Job Experience</h2>
                </div>
                <button
                  onClick={addExperience}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Add Job <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {experience.map((exp, index) => (
                <div key={exp.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Job {index + 1}</span>
                    </div>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        className="w-full p-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Example"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        className="w-full p-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.timeStart}
                          onChange={(e) => updateExperience(exp.id, 'timeStart', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="2018-2019"
                        />
                        <input
                          type="text"
                          value={exp.timeEnd}
                          onChange={(e) => updateExperience(exp.id, 'timeEnd', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="2019-2020"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                        className="w-full p-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="relative">
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                        placeholder="Description"
                      />
                      <Edit2 className="absolute top-2 right-2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Other Experience Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs">🏆</span>
                  </div>
                  <h2 className="text-lg font-semibold">Other Experience</h2>
                </div>
                <button
                  onClick={addOtherExperience}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Add Other <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {otherExperience.map((other, index) => (
                <div key={other.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Other {index + 1}</span>
                    </div>
                    <button
                      onClick={() => removeOtherExperience(other.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={other.title}
                      onChange={(e) => updateOtherExperience(other.id, 'title', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Open Source Contribution"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="relative">
                      <textarea
                        value={other.description}
                        onChange={(e) => updateOtherExperience(other.id, 'description', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                        placeholder="Description"
                      />
                      <Edit2 className="absolute top-2 right-2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
