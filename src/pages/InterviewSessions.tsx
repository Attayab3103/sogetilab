import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Play, Calendar, Building, User, AlertCircle, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import TrialSessionModal from '../components/TrialSessionModal';
import LanguageInstructionsModal from '../components/LanguageInstructionsModal';
import ResumeSelectionModal from '../components/ResumeSelectionModal';
import TranscriptSummaryModal from '../components/TranscriptSummaryModal';
import ReadyToCreateModal from '../components/ReadyToCreateModal';
import PlatformSelectionModal from '../components/PlatformSelectionModal';
import ConnectModal from '../components/ConnectModal';
import { sessionAPI } from '../services/api';

interface InterviewSession {
  _id: string;
  company: string;
  position: string;
  sessionType: 'trial' | 'premium';
  status: 'active' | 'completed' | 'cancelled';
  duration?: number;
  createdAt: string;
  endTime?: string;
  metadata?: {
    language?: string;
    aiModel?: string;
    resumeId?: string;
  };
}

interface LanguageSettings {
  language: string;
  simpleEnglish: boolean;
  extraInstructions: string;
  aiModel: string;
}

export default function InterviewSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  
  // Original 8-step modal flow states
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showReadyToCreateModal, setShowReadyToCreateModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null); // Track which session is being deleted
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]); // For bulk operations
  const [languageSettings, setLanguageSettings] = useState<LanguageSettings | undefined>(undefined);
  const [companyData, setCompanyData] = useState<{ company: string; jobDescription: string }>({
    company: 'Microsoft',
    jobDescription: 'Software Engineer'
  });
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  useEffect(() => {
    loadUserSessions();
  }, [user]);

  const loadUserSessions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await sessionAPI.getUserSessions();
      console.log('Loaded user sessions:', response.data);
      
      if (response.data.success && response.data.data) {
        setSessions(response.data.data);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Failed to load user sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, sessionName: string) => {
    console.log(`Attempting to delete session: ${sessionId} (${sessionName})`);
    const confirmed = await new Promise<boolean>((resolve) => {
      toast(
        `Are you sure you want to delete the interview session for "${sessionName}"? This action cannot be undone.`,
        {
          duration: Infinity,
          action: {
            label: 'Delete',
            onClick: () => resolve(true),
          },
          cancel: {
            label: 'Cancel',
            onClick: () => resolve(false),
          },
          onDismiss: () => {
            // If dismissed without clicking action/cancel, treat as cancel
            resolve(false); 
          }
        }
      );
    });
    console.log(`User confirmed deletion: ${confirmed}`);
    if (!confirmed) return;

    try {
      setDeleting(sessionId);
      console.log(`Calling sessionAPI.delete for session: ${sessionId}`);
      // Call the delete API
      await sessionAPI.delete(sessionId);
      
      // Remove from local state immediately for better UX
      setSessions(prev => prev.filter(session => session._id !== sessionId));
      
      console.log('Session deleted successfully:', sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSessions.length === 0) return;
    
    const confirmed = await new Promise<boolean>((resolve) => {
      toast(
        <div>
          <div className="font-semibold mb-2">Delete Selected Sessions?</div>
          <div>Are you sure you want to delete {selectedSessions.length} selected session(s)? This action cannot be undone.</div>
          <div className="mt-4 flex gap-2 justify-end">
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => { toast.dismiss(); resolve(false); }}>Cancel</button>
            <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => { toast.dismiss(); resolve(true); }}>Delete</button>
          </div>
        </div>,
        { duration: 10000 }
      );
    });
    if (!confirmed) return;

    try {
      // Delete all selected sessions
      await Promise.all(selectedSessions.map(sessionId => sessionAPI.delete(sessionId)));
      
      // Remove from local state
      setSessions(prev => prev.filter(session => !selectedSessions.includes(session._id)));
      setSelectedSessions([]);
      
      console.log('Bulk delete completed for sessions:', selectedSessions);
    } catch (error) {
      console.error('Failed to delete sessions:', error);
      toast.error('Failed to delete some sessions. Please try again.');
    }
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === sessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(sessions.map(session => session._id));
    }
  };

  // === ORIGINAL 8-STEP MODAL FLOW HANDLERS ===
  
  const handleStartTrialSession = () => {
    // Step 1: Start with Trial Interview (Company/Position) modal
    setShowTrialModal(true);
  };

  // Step 1: Trial Interview → Step 2: Language & Instructions
  const handleTrialNext = (data: { company: string; jobDescription: string }) => {
    console.log('Trial data received:', data);
    setCompanyData(data);
    setShowTrialModal(false);
    setShowLanguageModal(true);
  };

  // Step 2: Language & Instructions → Step 3: Select Resume
  const handleLanguageNext = (settings: LanguageSettings) => {
    console.log('Language settings received:', settings);
    setLanguageSettings(settings);
    setShowLanguageModal(false);
    setShowResumeModal(true);
  };

  // Step 3: Select Resume → Step 4: AI Interview Transcript/Summary
  const handleResumeNext = (resumeId: string) => {
    console.log('Resume selected:', resumeId);
    setSelectedResumeId(resumeId);
    setShowResumeModal(false);
    setShowTranscriptModal(true);
  };

  // Step 4: Transcript/Summary → Step 5: Ready to Create
  const handleTranscriptNext = (settings: { saveTranscript: boolean }) => {
    console.log('Transcript settings:', settings);
    setShowTranscriptModal(false);
    setShowReadyToCreateModal(true);
  };

  // Step 5: Ready to Create → Step 6: Choose Platform
  const handleReadyToCreateNext = () => {
    setShowReadyToCreateModal(false);
    setShowPlatformModal(true);
  };

  // Step 6: Choose Platform → Step 7: Connect
  const handlePlatformSelect = (platform: 'browser' | 'desktop') => {
    console.log('Platform selected:', platform);
    setShowPlatformModal(false);
    
    if (platform === 'browser') {
      setShowConnectModal(true);
    } else {
      // Handle desktop app flow
      toast('Desktop app functionality coming soon!');
    }
  };

  // Step 7: Connect → Step 8: Interview Session
  const handleConnectNext = async (settings: {
    language: string;
    simpleEnglish: boolean;
    aiModel: string;
  }) => {
    console.log('Connecting with settings:', settings);
    
    try {
      const sessionData = {
        sessionType: 'trial' as const,
        company: companyData?.company || 'Microsoft',
        position: companyData?.jobDescription || 'Software Engineer',
        resumeId: selectedResumeId,
        language: settings.language,
        simpleEnglish: settings.simpleEnglish,
        extraInstructions: languageSettings?.extraInstructions || '',
        aiModel: settings.aiModel
      };

      console.log('Creating session with data:', sessionData);
      
      try {
        const response = await sessionAPI.create(sessionData);
        console.log('Session created:', response.data);
        
        setShowConnectModal(false);
        
        // Refresh sessions list
        await loadUserSessions();
        
        const sessionId = response.data.data._id;
        window.location.href = `/interview/trial-session?sessionId=${sessionId}`;
      } catch (apiError) {
        console.warn('API session creation failed, using URL parameters:', apiError);
        
        // Fallback: pass data via URL parameters for trial session
        setShowConnectModal(false);
        
        const params = new URLSearchParams({
          company: sessionData.company,
          position: sessionData.position,
          resumeId: sessionData.resumeId,
          language: sessionData.language,
          simpleEnglish: sessionData.simpleEnglish.toString(),
          aiModel: sessionData.aiModel,
          extraInstructions: sessionData.extraInstructions
        });
        
        window.location.href = `/interview/trial-session?${params.toString()}`;
      }
    } catch (error) {
      console.error('Error in connection flow:', error);
      
      // Final fallback: go to trial session with basic parameters
      const basicParams = new URLSearchParams({
        company: companyData?.company || 'Microsoft',
        position: companyData?.jobDescription || 'Software Engineer',
        language: settings.language || 'en',
        aiModel: settings.aiModel || 'gpt-4'
      });
      
      window.location.href = `/interview/trial-session?${basicParams.toString()}`;
    }
  };

  // === BACK NAVIGATION HANDLERS ===
  const handleTranscriptBack = () => {
    setShowTranscriptModal(false);
    setShowResumeModal(true);
  };

  const handleReadyToCreateBack = () => {
    setShowReadyToCreateModal(false);
    setShowTranscriptModal(true);
  };

  const handleConnectBack = () => {
    setShowConnectModal(false);
    setShowPlatformModal(true);
  };

  // === CLOSE HANDLERS ===
  const handleTrialClose = () => {
    setShowTrialModal(false);
  };

  const handleTranscriptClose = () => {
    setShowTranscriptModal(false);
  };

  const handleReadyToCreateClose = () => {
    setShowReadyToCreateModal(false);
  };

  const handlePlatformClose = () => {
    setShowPlatformModal(false);
  };

  const handleConnectClose = () => {
    setShowConnectModal(false);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes || minutes < 60) {
      return `${minutes || 0}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSessionStats = () => {
    const total = sessions.length;
    const active = sessions.filter(s => s.status === 'active').length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const trial = sessions.filter(s => s.sessionType === 'trial').length;
    const premium = sessions.filter(s => s.sessionType === 'premium').length;

    return { total, active, completed, trial, premium };
  };

  const stats = getSessionStats();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Sessions</h1>
            <p className="text-gray-600">Manage your interview sessions and view history</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={loadUserSessions}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleStartTrialSession}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Start Trial Session
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Total Sessions</span>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Active</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Completed</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Sessions</span>
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.trial}</div>
          </div>
          {/* Removed Premium Sessions box */}
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {sessions.length > 0 && (
                <>
                  <input
                    type="checkbox"
                    checked={selectedSessions.length === sessions.length && sessions.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedSessions.length > 0 ? `${selectedSessions.length} selected` : 'Select all'}
                  </span>
                </>
              )}
            </div>
            
            {selectedSessions.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedSessions.length})
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-6 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span className="w-4"></span> {/* Space for checkbox */}
              Company
            </div>
            <div>Position</div>
            <div>Status</div>
            <div>Duration</div>
            <div>Created At</div>
            <div>Actions</div>
          </div>
        </div>

        <div className="p-6">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Interview Sessions yet.</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first interview session.</p>
              <button
                onClick={handleStartTrialSession}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Play className="w-4 h-4" />
                Start Trial Session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session._id} className="grid grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* Company */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 truncate">{session.company}</h3>
                      <p className="text-xs text-gray-500 capitalize">{session.sessionType}</p>
                    </div>
                  </div>
                  
                  {/* Position */}
                  <div className="flex items-center">
                    <div>
                      <p className="font-medium text-gray-900 truncate">{session.position}</p>
                      <p className="text-xs text-gray-500">
                        {session.metadata?.aiModel || 'GPT-4'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                  
                  {/* Duration */}
                  <div className="flex items-center">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {formatDuration(session.duration)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.endTime ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Created At */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {formatDate(session.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.metadata?.language || 'English'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View session details"
                        onClick={() => {
                          // Navigate to session details or resume session
                          if (session.status === 'active') {
                            window.location.href = `/interview/trial-session?sessionId=${session._id}`;
                          } else {
                            // Could open a details modal or navigate to history view
                            console.log('View session details:', session._id);
                          }
                        }}
                      >
                        <User className="w-4 h-4" />
                      </button>
                      
                      <button 
                        className={`p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                          deleting === session._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Delete session"
                        disabled={deleting === session._id}
                        onClick={() => handleDeleteSession(session._id, `${session.position} at ${session.company}`)}
                      >
                        {deleting === session._id ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Page 1 • Showing 1-{sessions.length} of {sessions.length}
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <button className="text-sm text-gray-400" disabled>Previous</button>
            <button className="text-sm text-gray-400" disabled>Next</button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 mt-6">
        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border p-6">
            <p className="text-center text-gray-500">A list of your Interview Sessions.</p>
          </div>
        </div>
      </div>

      {/* === 8-STEP MODAL FLOW === */}
      
      {/* Step 1: Trial Interview (Company/Position) */}
      <TrialSessionModal
        isOpen={showTrialModal}
        onClose={handleTrialClose}
        onNext={handleTrialNext}
      />
      
      {/* Step 2: Language & Instructions */}
      <LanguageInstructionsModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onNext={handleLanguageNext}
      />

      {/* Step 3: Select Resume */}
      <ResumeSelectionModal
        isOpen={showResumeModal}
        onNext={handleResumeNext}
        onClose={() => setShowResumeModal(false)}
      />

      {/* Step 4: AI Interview Transcript/Summary */}
      <TranscriptSummaryModal
        isOpen={showTranscriptModal}
        onClose={handleTranscriptClose}
        onBack={handleTranscriptBack}
        onNext={handleTranscriptNext}
      />

      {/* Step 5: Ready to Create */}
      <ReadyToCreateModal
        isOpen={showReadyToCreateModal}
        onClose={handleReadyToCreateClose}
        onBack={handleReadyToCreateBack}
        onNext={handleReadyToCreateNext}
      />

      {/* Step 6: Choose Platform */}
      <PlatformSelectionModal
        isOpen={showPlatformModal}
        onClose={handlePlatformClose}
        onSelectPlatform={handlePlatformSelect}
      />

      {/* Step 7: Connect */}
      <ConnectModal
        isOpen={showConnectModal}
        onClose={handleConnectClose}
        onBack={handleConnectBack}
        onConnect={handleConnectNext}
        company={companyData?.company || 'Microsoft'}
        position={companyData?.jobDescription || 'Software Engineer'}
        resumeTitle="CV LATEST 2024 Attayab.pdf"
      />
      </div>
    </DashboardLayout>
  );
}
