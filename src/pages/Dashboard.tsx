import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, ArrowDown, Smartphone, Laptop, Globe } from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import LanguageInstructionsModal from '../components/LanguageInstructionsModal';
import TrialSessionModal from '../components/TrialSessionModal';
import ResumeSelectionModal from '../components/ResumeSelectionModal';
import TranscriptSummaryModal from '../components/TranscriptSummaryModal';
import ReadyToCreateModal from '../components/ReadyToCreateModal';
import PlatformSelectionModal from '../components/PlatformSelectionModal';
import ConnectModal from '../components/ConnectModal';
import { sessionAPI } from '../services/api';
import styles from './Dashboard.module.css';

interface LanguageSettings {
  language: string;
  simpleEnglish: boolean;
  extraInstructions: string;
  aiModel: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  
  // Original 8-step modal flow states
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showReadyToCreateModal, setShowReadyToCreateModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  const [languageSettings, setLanguageSettings] = useState<LanguageSettings | undefined>(undefined);
  const [companyData, setCompanyData] = useState<{ company: string; jobDescription: string } | undefined>(undefined);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  const handleTryForFree = () => {
    // Step 1: Start with Trial Interview (Company/Position) modal
    setShowTrialModal(true);
  };

  // === ORIGINAL 8-STEP MODAL FLOW HANDLERS ===
  
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
      import { toast } from 'sonner';
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
      const response = await sessionAPI.create(sessionData);
      console.log('Session created:', response.data);
      
      setShowConnectModal(false);
      
      const sessionId = response.data.data._id;
      window.location.href = `/interview/trial-session?sessionId=${sessionId}`;
    } catch (error) {
      console.error('Error creating session:', error);
      window.location.href = '/interview/trial-session';
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

  return (
    <DashboardLayout>
      <div className={`${styles.dashboard} flex flex-1 flex-col items-center overflow-y-scroll bg-neutral-50`}>
        {/* Mobile notification */}
        <div className="m-2 flex flex-row items-center gap-3 rounded-xl border bg-yellow-50 p-4 md:m-5 md:hidden">
          <Smartphone className="h-12 w-12" />
          <div className="flex flex-col bg-yellow-50">
            This is a Mobile version of SOGETI LAB. We also have a Desktop (Browser) version and a Desktop App which connects directly to your interview platform.
            <br />
            <a
              href="https://www.youtube.com/watch?v=6XRH9DfgSWo"
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex flex-row items-center gap-2 underline underline-offset-4"
            >
              Video: Browser vs Desktop App
            </a>
            <a
              href="https://www.youtube.com/shorts/60uVC9mn5uU"
              target="_blank"
              rel="noreferrer"
            className="mt-2 flex flex-row items-center gap-2 underline underline-offset-4"
          >
            Video: Mobile vs Desktop (Browser)
          </a>
        </div>
      </div>

      {/* Main greeting */}
      <div className="mt-5 mb-5 text-2xl font-bold md:mt-10 md:mb-0 md:text-2xl">
        Hi, {user?.name?.split(' ')[0] || 'Attayab'} 👋🏼
      </div>

      {/* Main workflow section */}
      <div className={`${styles.container} flex flex-col gap-2 p-2 py-10 pt-0 text-center md:p-10 lg:flex-row lg:text-left`}>
        {/* Resume Upload */}
        <div className="flex h-auto w-full flex-1 flex-col items-center gap-2 lg:items-start">
          <div className="flex flex-row flex-wrap gap-1 text-lg whitespace-nowrap lg:flex-col xl:flex-row xl:text-lg">
            Optional:{' '}
            <span className="flex flex-row items-center gap-1 font-bold">
              Resume 📝
            </span>
          </div>
          <div className={`${styles.card} flex h-full w-full flex-col items-center justify-center rounded-lg border bg-white p-3 xl:p-5`}>
            Upload your resume so SOGETI LAB can generate customs answers to the job interview questions.
          </div>
          <button 
            onClick={() => window.location.href = '/resume/create'}
            className="w-full cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            <div className="flex items-center justify-center gap-2">Upload Resume</div>
          </button>
        </div>

        {/* Arrow */}
        <div className="item hidden items-center lg:flex">
          <ArrowRight className="h-6 w-6" />
        </div>
        <div className="flex justify-center lg:hidden">
          <ArrowDown className="h-6 w-6" />
        </div>

        {/* Trial Session */}
        <div className="flex h-auto w-full flex-1 flex-col items-center gap-2 lg:items-start">
          <div className="flex flex-row flex-wrap gap-1 text-lg whitespace-nowrap lg:flex-col xl:flex-row xl:text-lg">
            Step 1:{' '}
            <span className="flex flex-row items-center gap-1 font-bold">
              Trial Session ⏰
            </span>
          </div>
          <div className={`${styles.card} flex h-full w-full flex-col items-center justify-center rounded-lg border bg-white p-3 xl:p-5`}>
            See how easy SOGETI LAB is to use. Trial Sessions are free and limited to 10 minutes.
          </div>
          <button 
            onClick={handleTryForFree}
            className="w-full cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 relative"
          >
            <div className="absolute -inset-2 rounded-lg bg-gradient-to-br from-sky-300 to-lime-300 blur-sm"></div>
            <div className="bg-primary hover:bg-primary/80 relative flex h-10 w-full items-center justify-center gap-2 rounded-md px-4 py-2">
              <div className="flex items-center justify-center gap-2">Try for Free</div>
            </div>
          </button>
        </div>

        {/* Arrow */}
        <div className="item hidden items-center lg:flex">
          <ArrowRight className="h-6 w-6" />
        </div>
        <div className="flex justify-center lg:hidden">
          <ArrowDown className="h-6 w-6" />
        </div>

        {/* Buy Credits */}
        <div className="flex h-auto w-full flex-1 flex-col items-center gap-2 lg:items-start">
          <div className="flex flex-row flex-wrap gap-1 text-lg whitespace-nowrap lg:flex-col xl:flex-row xl:text-lg">
            Step 2:{' '}
            <span className="flex flex-row items-center gap-1 font-bold">
              Buy Credits 💳
            </span>
          </div>
          <div className={`${styles.card} flex h-full w-full flex-col items-center justify-center rounded-lg border bg-white p-3 xl:p-5`}>
            Buy credits to use for the real interview. No subscription!
          </div>
          <button className="w-full cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            <div className="flex items-center justify-center gap-2">Get Credits</div>
          </button>
        </div>

        {/* Arrow */}
        <div className="item hidden items-center lg:flex">
          <ArrowRight className="h-6 w-6" />
        </div>
        <div className="flex justify-center lg:hidden">
          <ArrowDown className="h-6 w-6" />
        </div>

        {/* Real Interview */}
        <div className="flex h-auto w-full flex-1 flex-col items-center gap-2 lg:items-start">
          <div className="flex flex-row flex-wrap gap-1 text-lg whitespace-nowrap lg:flex-col xl:flex-row xl:text-lg">
            Step 3:{' '}
            <span className="flex flex-row items-center gap-1 font-bold">
              Real Interview 💸
            </span>
          </div>
          <div className={`${styles.card} flex h-full w-full flex-col items-center justify-center rounded-lg border bg-white p-3 xl:p-5`}>
            Use SOGETI LAB for a real interview to get the job you have always dreamed of.
          </div>
          <button className="w-full cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            <div className="flex items-center justify-center gap-2">Start</div>
          </button>
        </div>
      </div>

      {/* New Features Section */}
      <div className="flex flex-col gap-8 p-2 py-10 pt-0 text-center md:p-10">
        <div className="flex flex-row items-center justify-center gap-1 text-xl font-bold lg:hidden">
          New Features
        </div>
        <div className="flex flex-col items-center gap-2 lg:flex-row lg:text-left">
          {/* Desktop App vs Browser */}
          <a
            target="_blank"
            className="flex h-full flex-1 flex-col gap-2 rounded-xl border bg-white p-6"
            href="https://www.youtube.com/watch?v=6XRH9DfgSWo"
          >
            <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
              <span className="text-lg font-bold">💻 Desktop App vs Browser Version</span>
              <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit shrink-0 gap-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden border-transparent bg-gradient-to-br from-sky-300 to-lime-300 text-black whitespace-nowrap">
                New
              </span>
            </div>
            <div className="text-muted-foreground">
              SOGETI LAB is available as both a Desktop App and a Browser/Web version. The Desktop App works seamlessly with any interview platform, while the Browser/Web version is easier and quicker to use.
            </div>
            <span className="text-muted-foreground underline underline-offset-4">
              Video Tutorial: Desktop App vs Web Version
            </span>
          </a>

          {/* Coding Interview Support */}
          <div className="flex flex-1 flex-col gap-2 rounded-xl border bg-white p-6">
            <div className="flex w-full flex-col-reverse items-center gap-2 lg:flex-row">
              <span className="text-lg font-bold">👨‍💻 Coding Interview Support</span>
            </div>
            <div className="text-muted-foreground">
              You can use SOGETI LAB for coding interviews. It can both listen for coding questions and capture the screen if a LeetCode-style question is being screen shared with you.
            </div>
            <div className="mt-2 flex flex-col items-center justify-center gap-4 lg:mt-0 lg:flex-row lg:justify-start lg:gap-8">
              <a
                target="_blank"
                className="text-muted-foreground underline underline-offset-4"
                href="https://www.youtube.com/watch?v=8Ez-HYQNEYI"
              >
                <Globe className="inline h-4 w-4" /> Video: Web/Browser
              </a>
              <a
                target="_blank"
                className="text-muted-foreground underline underline-offset-4"
                href="https://www.youtube.com/watch?v=8oRoayXb1H4"
              >
                <Laptop className="inline h-4 w-4" /> Video: Desktop App
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-b"></div>

      {/* Survey Section */}
      <div className="flex w-full flex-col items-center gap-4 p-10 px-4 xl:px-8">
        <div className="text-xl font-bold">Where did you hear about us?</div>
        <div className="flex w-full max-w-xl flex-col gap-4 rounded-lg bg-white p-2 shadow-sm sm:p-5">
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'Reddit', emoji: '🟠' },
              { name: 'Instagram', emoji: '📷' },
              { name: 'Friend', emoji: '🤗' },
              { name: 'Snapchat', emoji: '👻' },
              { name: 'YouTube', emoji: '📺' },
              { name: 'Conference', emoji: '🎤' },
              { name: 'Google', emoji: '🔍' },
              { name: 'ChatGPT', emoji: '🤖' },
              { name: 'TikTok', emoji: '🎵' }
            ].map((source) => (
              <button
                key={source.name}
                className="cursor-pointer justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 flex flex-row items-center gap-2"
              >
                <span>{source.emoji}</span>
                {source.name}
              </button>
            ))}
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center gap-2">
              <span className="w-full border-t"></span>
              <span className="text-muted-foreground text-sm whitespace-nowrap uppercase">or</span>
              <span className="w-full border-t"></span>
            </div>
          </div>
          <form className="flex w-full flex-row items-center gap-2">
            <input
              className="flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              placeholder="Other"
              type="text"
              defaultValue=""
            />
            <button
              className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2"
              type="submit"
              disabled
            >
              Submit Other
            </button>
          </form>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-b"></div>

      {/* Tutorial Section */}
      <div className="flex w-full flex-col items-center gap-8 p-2 py-10 md:p-10">
        <div className="flex flex-row items-center gap-1 text-xl font-bold">
          In-depth Tutorial 📹
        </div>
        <div className="flex w-full max-w-3xl flex-row overflow-hidden rounded-xl border md:hidden">
          <div className="aspect-9/16 max-h-[500px] w-full">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/t2VtEPnO4_8?si=8LM-PCf--8ICOb4P"
              title="SOGETI LAB Tutorial"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <div className="hidden w-full max-w-3xl flex-row overflow-hidden rounded-xl border md:flex">
          <div className="aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/peOmWPSY_8c?si=CFVJTcC6oChMgXqO"
              title="SOGETI LAB Tutorial"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full border-t"></div>
      <div className="flex flex-col items-center gap-8 p-10">
        <div className="text-xl font-bold">All Features</div>

        {/* Desktop Features Grid */}
        <div className="hidden w-full flex-row items-start gap-5 xl:flex">
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            {[
              { title: 'Try For Free', emoji: '🍬', desc: 'You can try Jyothi\'s AI 100% for free. Start a trial session and see how well it works for yourself.' },
              { title: 'Undetectable', emoji: '🥷', desc: 'Jyothi\'s AI is undetectable to the person conducting the interview. There is no way for you to be caught using the tool.' },
              { title: 'Microphone', emoji: '🎙️', desc: 'Jyothi\'s AI can also listen to what you are saying to provide extra context to the answers.' },
              { title: 'CV Support', emoji: '📝', desc: 'You can now fill out your CV in the "CV / Resume" page. Jyothi\'s AI will use the information from your CV to come up with custom answers during your interview.' }
            ].map((feature) => (
              <div key={feature.title} className="flex w-full flex-row items-center gap-5 rounded-xl border bg-white p-5">
                <div className="hidden text-[80px] xl:block">
                  <span className="text-6xl">{feature.emoji}</span>
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-row items-center gap-1 text-lg font-medium xl:font-bold">
                    <span className="block text-2xl xl:hidden">{feature.emoji}</span> {feature.title}
                  </div>
                  <div className="text-muted-foreground">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            {[
              { title: 'Used by 1000s', emoji: '⭐', desc: 'Jyothi\'s AI has been used by 1000s of people who consistently praise it for its accuracy, speed, and affordability.' },
              { title: 'Full-screen Mode', emoji: '🖥️', desc: 'You can now use Jyothi\'s AI in full-screen mode. This will make it easier for you to use Jyothi\'s AI during your interview.' },
              { title: '52 Languages', emoji: '🌎', desc: 'We now support 52 languages. It doesn\'t matter if you speak English, Spanish, or French, Jyothi\'s AI is here to help.' },
              { title: 'Position Specific', emoji: '👨‍💻', desc: 'When starting an interview session you will input the company and position you are applying for. Jyothi\'s AI will come up with custom answers based on that information.' }
            ].map((feature) => (
              <div key={feature.title} className="flex w-full flex-row items-center gap-5 rounded-xl border bg-white p-5">
                <div className="hidden text-[80px] xl:block">
                  <span className="text-6xl">{feature.emoji}</span>
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-row items-center gap-1 text-lg font-medium xl:font-bold">
                    <span className="block text-2xl xl:hidden">{feature.emoji}</span> {feature.title}
                  </div>
                  <div className="text-muted-foreground">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            {[
              { title: 'Best LLM Models', emoji: '🤖', desc: 'You choose between GPT-4.1 and Claude 4.0 Sonnet, the best LLM models available, to provide the most accurate and helpful answers.' },
              { title: 'No Subscription', emoji: '💳', desc: 'Break free from subscriptions! Enjoy full access to all features without recurring bills or unexpected charges' },
              { title: 'Blazing Fast', emoji: '🚀', desc: 'Jyothi\'s AI uses the latest AI Technology to transcribe your interview and provide answers in record breaking speed.' },
              { title: 'All Platforms', emoji: '🤝', desc: 'You can use Jyothi\'s AI with any video calling platform including Zoom, Google Meet, and Microsoft Teams.' },
              { title: 'More Coming Soon', emoji: '💡', desc: 'We are always improving the product. New features are coming soon.' }
            ].map((feature) => (
              <div key={feature.title} className="flex w-full flex-row items-center gap-5 rounded-xl border bg-white p-5">
                <div className="hidden text-[80px] xl:block">
                  <span className="text-6xl">{feature.emoji}</span>
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-row items-center gap-1 text-lg font-medium xl:font-bold">
                    <span className="block text-2xl xl:hidden">{feature.emoji}</span> {feature.title}
                  </div>
                  <div className="text-muted-foreground">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Features Grid - Single Column */}
        <div className="flex w-full flex-row items-start gap-5 xl:hidden">
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            {[
              { title: 'Try For Free', emoji: '🍬', desc: 'You can try Jyothi\'s AI 100% for free. Start a trial session and see how well it works for yourself.' },
              { title: 'Undetectable', emoji: '🥷', desc: 'Jyothi\'s AI is undetectable to the person conducting the interview. There is no way for you to be caught using the tool.' },
              { title: 'Microphone', emoji: '🎙️', desc: 'Jyothi\'s AI can also listen to what you are saying to provide extra context to the answers.' },
              { title: 'CV Support', emoji: '📝', desc: 'You can now fill out your CV in the "CV / Resume" page. Jyothi\'s AI will use the information from your CV to come up with custom answers during your interview.' },
              { title: 'Used by 1000s', emoji: '⭐', desc: 'Jyothi\'s AI has been used by 1000s of people who consistently praise it for its accuracy, speed, and affordability.' },
              { title: 'Full-screen Mode', emoji: '🖥️', desc: 'You can now use Jyothi\'s AI in full-screen mode. This will make it easier for you to use Jyothi\'s AI during your interview.' },
              { title: '52 Languages', emoji: '🌎', desc: 'We now support 52 languages. It doesn\'t matter if you speak English, Spanish, or French, Jyothi\'s AI is here to help.' },
              { title: 'Position Specific', emoji: '👨‍💻', desc: 'When starting an interview session you will input the company and position you are applying for. Jyothi\'s AI will come up with custom answers based on that information.' },
              { title: 'Best LLM Models', emoji: '🤖', desc: 'You choose between GPT-4.1 and Claude 4.0 Sonnet, the best LLM models available, to provide the most accurate and helpful answers.' },
              { title: 'No Subscription', emoji: '💳', desc: 'Break free from subscriptions! Enjoy full access to all features without recurring bills or unexpected charges' },
              { title: 'Blazing Fast', emoji: '🚀', desc: 'Jyothi\'s AI uses the latest AI Technology to transcribe your interview and provide answers in record breaking speed.' },
              { title: 'All Platforms', emoji: '🤝', desc: 'You can use Jyothi\'s AI with any video calling platform including Zoom, Google Meet, and Microsoft Teams.' },
              { title: 'More Coming Soon', emoji: '💡', desc: 'We are always improving the product. New features are coming soon.' }
            ].map((feature) => (
              <div key={feature.title} className="flex w-full flex-row items-center gap-5 rounded-xl border bg-white p-5">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-row items-center gap-1 text-lg font-medium">
                    <span className="text-2xl">{feature.emoji}</span> {feature.title}
                  </div>
                  <div className="text-muted-foreground">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full border-t"></div>
      <div className="text-muted-foreground flex flex-row flex-wrap items-center justify-center gap-1 pt-8 pb-8 whitespace-nowrap">
        <div className="mt-2 flex flex-row items-center gap-1">
          Made with ❤️ by the SOGETI LAB Team.
        </div>
        <div className="mt-2 flex flex-row items-center gap-1">
          Contact{' '}
          <a className="hover:text-foreground underline underline-offset-4" href="mailto:support@jyothis-ai.com">
            support
          </a>{' '}
          if you have any questions.
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
