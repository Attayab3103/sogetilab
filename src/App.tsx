import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import InterviewSessions from './pages/InterviewSessions';
import TrialInterviewSession from './pages/TrialInterviewSession';
import { ResumesPage } from './pages/ResumesPage';
import { CreditsPage } from './pages/CreditsPage';
import { DownloadPage } from './pages/DownloadPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Dashboard and session routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview-sessions" element={<InterviewSessions />} />
          <Route path="/resumes" element={<ResumesPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/trial-interview" element={<TrialInterviewSession />} />
          <Route path="/interview/trial-session" element={<TrialInterviewSession />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
